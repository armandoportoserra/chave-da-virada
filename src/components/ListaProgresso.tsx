"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { lerProgresso, totalPontos, type Progresso } from "@/lib/progresso-local";

export default function ListaProgresso({ total }: { total: number }) {
  const [p, setP] = useState<Progresso | null>(null);
  useEffect(() => { setP(lerProgresso()); }, []);
  if (!p) return null;
  const feitas = Object.keys(p.concluidas).map(Number);
  if (!feitas.length) return <p className="mt-6 text-sm text-muted">Você ainda não começou. A lição 1 leva 5 minutos.</p>;
  const prox = Math.min(total, Math.max(...feitas) + 1);
  const completo = feitas.length >= total;
  return (
    <div className="mt-6 card flex flex-wrap items-center justify-between gap-4">
      <div><p className="font-semibold text-navy">{feitas.length} de {total} lições · <span className="tabular-nums">{totalPontos(p)} pontos</span></p><p className="text-sm text-muted">{completo ? "Curso concluído. Seu certificado está pronto." : `Continue de onde parou: lição ${prox}.`}</p></div>
      <Link href={completo ? "/curso/certificado" : `/curso/${prox}`} className="btn-gold">{completo ? "🎓 Certificado" : `Lição ${prox} →`}</Link>
    </div>
  );
}
