"use client";
import { useEffect, useMemo, useState } from "react";
import { UFS, normTxt, type Igreja } from "@/lib/igrejas";

// Índice estático por estado (public/igrejas-UF.json, gerado dos dados públicos DSA/7me): [id, nome, cidade, tipo(0 igreja,1 grupo)].
// Endereço/bairro vêm na hora do cadastro público ACMS. Só endereço: nunca telefone, e-mail ou nomes de pessoas.
type Linha = [number, string, string, number];
const ACMS = "https://www.acmsnet.org/api/public/churches/";
const limpo = (s: unknown) => (typeof s === "string" ? s.trim() : "");

async function detalhe(l: Linha, uf: string): Promise<Igreja | null> {
  const g: Igreja = { id: l[0], nome: l[1], tipo: l[3] === 1 ? "Grupo" : "Igreja", rua: "", bairro: "", cep: "", cidade: l[2], uf, lat: null, lng: null };
  try {
    const r = await fetch(ACMS + l[0]);
    if (!r.ok) return g;
    const j = await r.json();
    const a = j.address ?? {};
    if (a.country && String(a.country).toUpperCase() !== "BRAZIL") return null;
    g.rua = [limpo(a.street), limpo(a.number)].filter(Boolean).join(", ") + (limpo(a.complement) ? ` – ${limpo(a.complement)}` : "");
    g.bairro = limpo(a.neighborhood); g.cep = limpo(a.postalCode);
    if (typeof j.latitude === "number") { g.lat = j.latitude; g.lng = j.longitude; }
  } catch { /* sem detalhe */ }
  return g;
}

function Mapa({ g }: { g: Igreja }) {
  if (g.lat == null || g.lng == null) return null;
  const d = 0.006, bbox = `${g.lng - d},${g.lat - d},${g.lng + d},${g.lat + d}`;
  return <iframe title={`Mapa — ${g.nome}`} className="mt-3 h-56 w-full rounded-xl border border-line" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${g.lat},${g.lng}`} />;
}

export default function BuscaIgrejas() {
  const [uf, setUf] = useState("RS");
  const [indice, setIndice] = useState<Linha[]>([]);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [lista, setLista] = useState<Igreja[]>([]);
  const [aberto, setAberto] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true; setIndice([]);
    fetch(`/igrejas-${uf}.json`).then((r) => (r.ok ? r.json() : [])).then((d) => { if (vivo) setIndice(d); }).catch(() => {});
    return () => { vivo = false; };
  }, [uf]);
  const cidades = useMemo(() => Array.from(new Set(indice.map((l) => l[2]))).sort((a, b) => a.localeCompare(b, "pt")), [indice]);

  async function buscar(e: React.FormEvent) {
    e.preventDefault(); setEstado("buscando"); setAberto(null);
    const alvo = normTxt(cidade);
    const linhas = indice.filter((l) => normTxt(l[2]) === alvo).slice(0, 150);
    const out: Igreja[] = [];
    for (let k = 0; k < linhas.length; k += 10) out.push(...(await Promise.all(linhas.slice(k, k + 10).map((l) => detalhe(l, uf)))).filter((x): x is Igreja => !!x));
    setLista(out); setEstado("ok");
  }
  const bairros = useMemo(() => {
    const m = new Map<string, Igreja[]>();
    for (const g of lista) { const b = g.bairro || "Bairro não informado"; m.set(b, [...(m.get(b) ?? []), g]); }
    return [...m.entries()].sort((a, b) => (a[0] === "Bairro não informado" ? 1 : b[0] === "Bairro não informado" ? -1 : a[0].localeCompare(b[0], "pt")));
  }, [lista]);

  return (
    <div>
      <form onSubmit={buscar} className="card grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
        <label className="block"><span className="text-sm font-semibold">Estado</span>
          <select value={uf} onChange={(e) => { setUf(e.target.value); setCidade(""); setEstado("idle"); }} className="field mt-1">{Object.entries(UFS).map(([s, n]) => <option key={s} value={s}>{n}</option>)}</select>
        </label>
        <label className="block"><span className="text-sm font-semibold">Cidade</span>
          <input list="cidades-iasd" value={cidade} onChange={(e) => setCidade(e.target.value)} required minLength={2} className="field mt-1" placeholder={indice.length ? "Comece a digitar…" : "Carregando cidades…"} />
          <datalist id="cidades-iasd">{cidades.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <button className="btn-gold" disabled={estado === "buscando" || !indice.length}>{estado === "buscando" ? "Buscando…" : "Buscar igrejas"}</button>
      </form>
      {estado === "ok" && (
        <div className="mt-6">
          {lista.length === 0 ? (
            <p className="card text-center">Não encontramos igrejas adventistas cadastradas em <b>{cidade}</b> ({uf}). Escolha a cidade na lista que aparece ao digitar.</p>
          ) : (<>
            <p className="text-sm text-muted">{lista.length} {lista.length === 1 ? "endereço" : "endereços"} em <b className="text-navy">{lista[0].cidade} – {uf}</b>, por bairro.</p>
            <div className="mt-4 space-y-6">
              {bairros.map(([bairro, gs]) => (
                <section key={bairro}>
                  <h2 className="serif text-2xl font-semibold text-navy">📍 {bairro}</h2>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {gs.sort((x, y) => x.nome.localeCompare(y.nome, "pt")).map((g) => (
                      <div key={g.id} className="card p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gold">{g.tipo} adventista</p>
                        <h3 className="font-semibold text-navy">{g.nome}</h3>
                        <p className="mt-1 text-sm text-ink/80">{g.rua || "Endereço não informado"}{g.cep ? ` · CEP ${g.cep}` : ""}</p>
                        {g.lat != null && <button type="button" onClick={() => setAberto(aberto === g.id ? null : g.id)} className="mt-2 text-sm font-semibold text-gold underline">{aberto === g.id ? "Fechar mapa" : "Ver no mapa"}</button>}
                        {aberto === g.id && <Mapa g={g} />}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>)}
        </div>
      )}
    </div>
  );
}
