"use client";
import { useState } from "react";
import Link from "next/link";
import { CONSENT_TEXTO } from "@/lib/consent";

export default function FormOracao() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "crise" | "erro">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [visita, setVisita] = useState(false);
  const precisaContato = visita;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEstado("enviando"); setErro(null);
    const f = new FormData(e.currentTarget);
    const payload = { nome: String(f.get("nome") ?? ""), whatsapp: String(f.get("whatsapp") ?? ""), pedido: String(f.get("pedido") ?? ""), modalidade: visita ? "visita" : "distancia", bairro: String(f.get("bairro") ?? ""), consent: f.get("consent") === "on", site: String(f.get("site") ?? "") };
    try {
      const r = await fetch("/api/oracao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json(); if (!r.ok) throw new Error(j.erro ?? "Erro.");
      setEstado(j.crise ? "crise" : "ok");
    } catch (err) { setEstado("erro"); setErro(err instanceof Error ? err.message : "Erro."); }
  }
  if (estado === "crise") return (
    <div className="card border-gold">
      <p className="text-4xl">🤍</p>
      <h2 className="serif text-2xl font-semibold text-navy mt-2">O que você escreveu importa muito.</h2>
      <p className="mt-2">Recebemos. Mas não fique só esperando: ligue agora para o <a href="tel:188" className="font-bold text-navy">188</a> (CVV, gratuito, 24h) ou acesse <a href="https://cvv.org.br" target="_blank" rel="noopener" className="underline">cvv.org.br</a>. Se houver risco imediato, <a href="tel:192" className="font-bold text-navy">192</a> (SAMU). Você não está sozinho(a).</p>
      <p className="mt-3 text-sm">Se quiser que alguém da igreja vá até você, marque “quero receber uma visita” no pedido, ou escreva <b>visita</b> para a Esperança.</p><Link href="/conversar" className="btn-gold mt-4">Conversar com a Esperança</Link>
    </div>
  );
  if (estado === "ok") return (
    <div className="card text-center">
      <p className="text-4xl">🙏</p>
      <h2 className="serif text-2xl font-semibold text-navy mt-2">Recebemos.</h2>
      <p className="mt-2">Seu pedido fica guardado e é levado em oração pela igreja Nova Esperança.{precisaContato ? " A igreja vai entrar em contato para combinar a visita." : ""} Você não está sozinho(a) com isso.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/curso" className="btn-gold">Conhecer o curso</Link><Link href="/conversar" className="btn-outline">Conversar com a Esperança</Link></div>
    </div>
  );
  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <input name="site" className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="block"><span className="text-sm font-semibold">O que está pesando?</span><textarea id="ora-pedido" name="pedido" required minLength={3} rows={5} className="field mt-1" placeholder="Escreva do seu jeito, sem enfeitar." /></label>
      <label className="flex items-center gap-3 rounded-xl border border-gold/60 bg-gold/10 p-3"><input id="ora-visita" type="checkbox" checked={visita} onChange={(e) => setVisita(e.target.checked)} className="accent-gold" /><span className="text-sm font-semibold">Quero receber uma visita da igreja</span></label>
      {visita && <label className="block"><span className="text-sm font-semibold">Bairro e melhor horário</span><input id="ora-bairro" name="bairro" required className="field mt-1" placeholder="Ex.: Panazzolo, fim de tarde" /></label>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="text-sm font-semibold">Seu nome {precisaContato ? "" : "(opcional)"}</span><input id="ora-nome" name="nome" className="field mt-1" required={precisaContato} /></label>
        <label className="block"><span className="text-sm font-semibold">WhatsApp {precisaContato ? "" : "(opcional)"}</span><input id="ora-zap" name="whatsapp" inputMode="tel" className="field mt-1" placeholder="(54) 99999-9999" required={precisaContato} /></label>
      </div>
      <label className="flex items-start gap-3 text-xs text-muted"><input id="ora-consent" type="checkbox" name="consent" required={precisaContato} className="mt-0.5 accent-gold" /><span>{CONSENT_TEXTO} <Link href="/privacidade" className="underline">Política de privacidade</Link>.</span></label>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
      <button className="btn-gold w-full" disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : "Enviar pedido"}</button>
      <p className="text-center text-xs text-muted">Se estiver pensando em desistir da vida, ligue <a href="tel:188" className="font-bold text-navy">188</a> (CVV, 24h, gratuito).</p>
    </form>
  );
}
