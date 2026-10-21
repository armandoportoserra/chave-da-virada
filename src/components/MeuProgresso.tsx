"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { JOGO, BLOCOS_JOGO, ROM } from "@/lib/jogo";
import { lerProgresso, totalAcertos, totalPontos, type Progresso } from "@/lib/progresso-local";

export default function MeuProgresso() {
  const [p, setP] = useState<Progresso | null>(null);
  useEffect(() => { setP(lerProgresso()); }, []);
  if (!p) return null;
  const feitas = Object.keys(p.concluidas).map(Number);
  const selos = BLOCOS_JOGO.filter((b) => b.licoes.every((l) => feitas.includes(l.numero)));
  const nivel = (pts: number) => pts >= 1400 ? "Fruto 🍇" : pts >= 1000 ? "Árvore 🌳" : pts >= 600 ? "Raiz 🌿" : pts >= 200 ? "Broto 🌱" : "Semente 🌰";
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="card py-4"><p className="text-3xl font-bold tabular-nums text-navy">{totalPontos(p)}</p><p className="text-xs text-muted">pontos · {nivel(totalPontos(p))}</p></div>
        <div className="card py-4"><p className="text-3xl font-bold tabular-nums text-navy">{feitas.length}<span className="text-base text-muted">/{JOGO.length}</span></p><p className="text-xs text-muted">lições</p></div>
        <div className="card py-4"><p className="text-3xl font-bold tabular-nums text-navy">{totalAcertos(p)}<span className="text-base text-muted">/160</span></p><p className="text-xs text-muted">acertos</p></div>
      </div>
      <div className="card">
        <h2 className="serif text-xl font-semibold text-navy">Selos</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BLOCOS_JOGO.map((b) => { const ok = selos.includes(b); return <span key={b.numero} className={`rounded-full border-2 px-3 py-1 text-sm font-semibold ${ok ? "text-white" : "opacity-40"}`} style={{ borderColor: b.cor, background: ok ? b.cor : undefined }}>{ROM[b.numero]} · {b.nome}</span>; })}
        </div>
      </div>
      <div className="card">
        <h2 className="serif text-xl font-semibold text-navy">Lições</h2>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          {JOGO.map((l) => { const c = p.concluidas[l.numero]; return <Link key={l.numero} href={`/curso/${l.numero}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-cream-dark"><span>{c ? "✅" : "⬜"} {l.figurinha} {l.numero}. {l.titulo}</span><span className="text-xs text-muted tabular-nums">{c ? `${c.acertos}/8` : ""}</span></Link>; })}
        </div>
      </div>
      {p.certificado && <p className="text-sm">🎓 Certificado emitido: <Link href={`/certificado/${p.certificado}`} className="underline font-semibold text-navy">{p.certificado}</Link></p>}
      <p className="text-xs text-muted">O progresso fica guardado neste navegador. Nada é enviado sem você pedir.</p>
    </div>
  );
}
