"use client";
import { useState } from "react";
import Link from "next/link";
import { musicaPara, linkMusica } from "@/lib/musicas";

// Pedido de oração 100% automático e anônimo: sem nome, sem telefone, sem visita.
export default function FormOracao() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "crise" | "erro">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [querMusica, setQuerMusica] = useState(true);
  const [semente, setSemente] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEstado("enviando"); setErro(null); setSemente(Date.now() % 97);
    const f = new FormData(e.currentTarget);
    const payload = { pedido: String(f.get("pedido") ?? ""), site: String(f.get("site") ?? "") };
    try {
      const r = await fetch("/api/oracao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json(); if (!r.ok) throw new Error(j.erro ?? "Erro.");
      setEstado(j.crise ? "crise" : "ok");
    } catch (err) { setEstado("erro"); setErro(err instanceof Error ? err.message : "Erro."); }
  }
  const musica = musicaPara(estado === "crise" ? "esperanca" : "oracao", semente);
  const blocoMusica = querMusica || estado === "crise" ? (
    <Link href={linkMusica(musica)} className="mt-4 block rounded-xl border border-gold/60 bg-gold/10 p-3 text-left text-sm"><b>🎵 {musica.titulo}</b> — {musica.autor}<br /><span className="text-muted">Uma música para este momento. Toque para ouvir.</span></Link>
  ) : null;
  if (estado === "crise") return (
    <div className="card border-gold">
      <p className="text-4xl">🤍</p>
      <h2 className="serif text-2xl font-semibold text-navy mt-2">O que você escreveu importa muito.</h2>
      <p className="mt-2">Recebemos. Procure agora alguém de confiança perto de você e não fique sozinho(a) com isso. A Esperança está aqui a qualquer hora. Você não está sozinho(a).</p>
      {blocoMusica}
      <Link href="/conversar" className="btn-gold mt-4">Conversar com a Esperança</Link>
    </div>
  );
  if (estado === "ok") return (
    <div className="card text-center">
      <p className="text-4xl">🙏</p>
      <h2 className="serif text-2xl font-semibold text-navy mt-2">Recebemos.</h2>
      <p className="mt-2">Seu pedido fica guardado, sem seu nome, e é levado em oração pela igreja Nova Esperança. Você não está sozinho(a) com isso.</p>
      {blocoMusica}
      <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/curso" className="btn-gold">Conhecer o curso</Link><Link href="/conversar" className="btn-outline">Conversar com a Esperança</Link></div>
    </div>
  );
  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <input name="site" className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="block"><span className="text-sm font-semibold">O que está pesando?</span><textarea id="ora-pedido" name="pedido" required minLength={3} rows={5} className="field mt-1" placeholder="Escreva do seu jeito, sem enfeitar. Não precisa dizer seu nome." /></label>
      <label className="flex items-center gap-3 rounded-xl border border-gold/60 bg-gold/10 p-3"><input id="ora-musica" type="checkbox" checked={querMusica} onChange={(e) => setQuerMusica(e.target.checked)} className="accent-gold" /><span className="text-sm font-semibold">🎵 Quero uma música depois do pedido</span></label>
      <p className="text-xs text-muted">Anônimo e automático: não pedimos nome nem telefone, e ninguém vai entrar em contato. <Link href="/privacidade" className="underline">Privacidade (LGPD)</Link>.</p>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
      <button className="btn-gold w-full" disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : "Enviar pedido"}</button>
    </form>
  );
}
