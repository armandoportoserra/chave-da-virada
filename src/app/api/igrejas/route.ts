import { NextResponse } from "next/server";
import { UFS, normTxt, type Igreja, type Resultado } from "@/lib/igrejas";

const BASE = "https://find-a-church.7me.app/data/v1/";
const ACMS = "https://www.acmsnet.org/api/public/churches/";
type Item = [number, string, string, string, number, number, number];
type Manifest = { search: Record<string, string>; stopwords: string[] };

let manifest: { m: Manifest; em: number } | null = null;
const cacheBusca = new Map<string, { r: Resultado; em: number }>();
const DIA = 86_400_000;

async function lerManifest(): Promise<Manifest> {
  if (manifest && Date.now() - manifest.em < DIA) return manifest.m;
  const m = (await (await fetch(BASE + "manifest.json")).json()) as Manifest;
  manifest = { m, em: Date.now() };
  return m;
}
const limpo = (s: unknown) => (typeof s === "string" ? s.trim() : "");

async function detalhe(it: Item, uf: string): Promise<Igreja> {
  const base: Igreja = { id: it[0], nome: it[1], tipo: it[6] === 1 ? "Grupo" : "Igreja", rua: "", bairro: "", cep: "", cidade: it[2], uf, lat: it[4] ?? null, lng: it[5] ?? null };
  try {
    const r = await fetch(ACMS + it[0], { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return base;
    const j = await r.json();
    const a = j.address ?? {};
    // Só endereço público. Telefone, e-mail e nomes de pessoas NÃO são lidos nem exibidos.
    base.rua = [limpo(a.street), limpo(a.number)].filter(Boolean).join(", ") + (limpo(a.complement) ? ` – ${limpo(a.complement)}` : "");
    base.bairro = limpo(a.neighborhood);
    base.cep = limpo(a.postalCode);
    if (typeof j.latitude === "number") { base.lat = j.latitude; base.lng = j.longitude; }
  } catch { /* fica sem detalhe */ }
  return base;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const uf = (u.searchParams.get("uf") ?? "").toUpperCase();
  const cidade = (u.searchParams.get("cidade") ?? "").trim();
  if (!UFS[uf] || cidade.length < 2) return NextResponse.json({ erro: "Escolha o estado e escreva a cidade." }, { status: 400 });
  const chave = `${uf}|${normTxt(cidade)}`;
  const c = cacheBusca.get(chave);
  if (c && Date.now() - c.em < DIA) return NextResponse.json(c.r, { headers: { "Cache-Control": "public, s-maxage=86400" } });

  try {
    const m = await lerManifest();
    const stop = new Set(m.stopwords);
    const tokens = normTxt(cidade).split(" ").filter((t) => t.length >= 2 && !stop.has(t));
    const prefixo = (tokens[0] ?? normTxt(cidade)).slice(0, 2);
    const arq = m.search[prefixo];
    if (!arq) return NextResponse.json({ cidade, uf, total: 0, bairros: [] });
    const busca = (await (await fetch(BASE + arq)).json()) as { items: Item[] };
    const alvoCidade = normTxt(cidade), alvoEstado = normTxt(UFS[uf]);
    const itens = busca.items.filter((i) => normTxt(i[2]) === alvoCidade && normTxt(i[3]) === alvoEstado).slice(0, 120);
    const igrejas: Igreja[] = [];
    for (let k = 0; k < itens.length; k += 12) igrejas.push(...(await Promise.all(itens.slice(k, k + 12).map((i) => detalhe(i, uf)))));
    const grupos = new Map<string, Igreja[]>();
    for (const g of igrejas) { const b = g.bairro || "Bairro não informado"; grupos.set(b, [...(grupos.get(b) ?? []), g]); }
    const bairros = [...grupos.entries()].sort((a, b) => (a[0] === "Bairro não informado" ? 1 : b[0] === "Bairro não informado" ? -1 : a[0].localeCompare(b[0], "pt"))).map(([bairro, lista]) => ({ bairro, igrejas: lista.sort((x, y) => x.nome.localeCompare(y.nome, "pt")) }));
    const r: Resultado = { cidade: itens[0]?.[2] ?? cidade, uf, total: igrejas.length, bairros };
    cacheBusca.set(chave, { r, em: Date.now() });
    return NextResponse.json(r, { headers: { "Cache-Control": "public, s-maxage=86400" } });
  } catch {
    return NextResponse.json({ erro: "A busca oficial não respondeu agora. Tente de novo em instantes." }, { status: 502 });
  }
}
