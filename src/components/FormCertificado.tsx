"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_TEXTO } from "@/lib/consent";
import { lerProgresso, salvarProgresso, totalAcertos, totalPontos, type Curso, type Progresso } from "@/lib/progresso-local";
import { CURSO_2, CURSOS } from "@/lib/jogo";

export default function FormCertificado({ curso = 1 }: { curso?: Curso }) {
  const info = CURSOS[curso];
  const N = info.licoes.length;        // 20 ou 21 lições
  const MAX = N * 8;                   // acertos possíveis
  const [p, setP] = useState<Progresso | null>(null);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [res, setRes] = useState<{ codigo: string; avaliacao: string; aproveitamento: number } | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(() => { const x = lerProgresso(curso); setP(x); if (x.certificado) setRes({ codigo: x.certificado, avaliacao: "", aproveitamento: 0 }); }, 0); return () => clearTimeout(t); }, []);
  if (!p) return null;
  const feitas = Object.keys(p.concluidas).map(Number).sort((a, b) => a - b);
  if (feitas.length < N) {
    const faltam = Array.from({ length: N }, (_, i) => i + 1).filter((n) => !feitas.includes(n));
    return (<div className="card"><h1 className="serif text-3xl font-semibold text-navy">Quase lá</h1><p className="mt-2">O certificado sai quando as {N} lições estiverem concluídas. Faltam {faltam.length}: {faltam.join(", ")}.</p><Link href={`${info.base}/${faltam[0]}`} className="btn-gold mt-4">Ir para a lição {faltam[0]}</Link></div>);
  }
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEstado("enviando"); setErro(null);
    const f = new FormData(e.currentTarget);
    const payload = { curso, nome: String(f.get("nome") ?? ""), consent: f.get("consent") === "on", concluidas: feitas, pontos: totalPontos(p!), acertos: totalAcertos(p!), quer_curso2: f.get("curso2") === "on", site: String(f.get("site") ?? "") };
    try {
      const r = await fetch("/api/certificado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json(); if (!r.ok) throw new Error(j.erro ?? "Erro.");
      const np = { ...p!, nome: payload.nome, certificado: j.codigo, pessoaId: j.pessoaId }; salvarProgresso(np, curso); setP(np);
      setRes(j); setEstado("ok");
    } catch (err) { setEstado("erro"); setErro(err instanceof Error ? err.message : "Erro."); }
  }
  if (res) return (
    <div className="card text-center">
      <p className="text-5xl">🎓</p>
      <h1 className="serif text-3xl font-semibold text-navy mt-2">Seu certificado está pronto</h1>
      {res.avaliacao && <p className="mt-2">{res.aproveitamento}% de aproveitamento — <b>{res.avaliacao}</b></p>}
      <p className="mt-1 text-sm text-muted">Código {res.codigo}</p>
      <Link href={`/certificado/${res.codigo}`} className="btn-gold mt-5">Ver e imprimir</Link>
      <div className="mt-8 text-left rounded-2xl bg-navy text-cream p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">E agora?</p>
        {curso === 1 ? (<>
          <p className="serif text-xl font-semibold mt-1">{CURSO_2.titulo}</p>
          <p className="text-sm text-cream/80 mt-1">{CURSO_2.descricao} Já está aberto — comece quando quiser.</p>
          <Link href="/curso2" className="btn-gold mt-4">Começar o Curso 2 →</Link>
        </>) : (<>
          <p className="serif text-xl font-semibold mt-1">Você concluiu os dois cursos</p>
          <p className="text-sm text-cream/80 mt-1">Continue conversando com a Esperança, veja as perguntas sobre o amor de Deus ou ouça uma música.</p>
          <Link href="/conversar" className="btn-outline mt-4">Falar com a Esperança</Link>
        </>)}
      </div>
    </div>
  );
  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h1 className="serif text-3xl font-semibold text-navy">Você concluiu as {N} lições 🎉</h1>
      <p>{info.titulo} · {totalPontos(p)} pontos · {totalAcertos(p)} acertos de {MAX}. Para emitir o certificado, só precisamos do nome que vai aparecer nele:</p>
      <input name="site" className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="block"><span className="text-sm font-semibold">Nome como vai aparecer no certificado</span><input id="cert-nome" name="nome" required minLength={2} className="field mt-1" defaultValue={p.nome ?? ""} /></label>
      {curso === 1 && <label className="flex gap-3 items-start text-sm"><input id="cert-curso2" type="checkbox" name="curso2" className="mt-1" /> <span>Quero continuar no Curso 2 — <b>{CURSO_2.titulo}</b> (21 lições).</span></label>}
      <label className="flex gap-3 items-start text-sm"><input id="cert-consent" type="checkbox" name="consent" required className="mt-1" /> <span>{CONSENT_TEXTO}</span></label>
      {erro && <p className="text-sm text-red-700">{erro}</p>}
      <button className="btn-gold w-full" disabled={estado === "enviando"}>{estado === "enviando" ? "Emitindo…" : "Emitir meu certificado"}</button>
    </form>
  );
}
