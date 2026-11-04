"use client";
import { useEffect, useRef, useState } from "react";

type Stats = { pessoas: number; licoesAbertas: number; licoes: number; certificados: number; oracoes: number; conversas: number };

const ITENS: { chave: keyof Stats; rotulo: string; emoji: string }[] = [
  { chave: "licoesAbertas", rotulo: "lições abertas", emoji: "📖" },
  { chave: "licoes", rotulo: "lições concluídas", emoji: "✅" },
  { chave: "certificados", rotulo: "certificados emitidos", emoji: "🎓" },
  { chave: "oracoes", rotulo: "pedidos de oração", emoji: "🙏" },
  { chave: "conversas", rotulo: "conversas com a Esperança", emoji: "💬" },
];

function Numero({ alvo }: { alvo: number }) {
  const [v, setV] = useState(0);
  const inicio = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const passo = (t: number) => {
      if (inicio.current === null) inicio.current = t;
      const f = Math.min(1, (t - inicio.current) / 1400);
      const e = 1 - Math.pow(1 - f, 3);
      setV(Math.round(alvo * e));
      if (f < 1) raf = requestAnimationFrame(passo);
    };
    inicio.current = null;
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);
  return <>{v.toLocaleString("pt-BR")}</>;
}

// Contador real: números vivos do banco (atualiza a cada minuto). Usado na página inicial e embutido no Framer (/contador?embed=1).
export default function Contador({ compacto = false }: { compacto?: boolean }) {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    const carregar = () => fetch("/api/stats", { cache: "no-store" }).then((r) => r.json()).then(setS).catch(() => {});
    void carregar();
    const id = setInterval(carregar, 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className={`mx-auto max-w-6xl px-5 ${compacto ? "py-6" : "py-12"}`}>
      <p className="text-center text-xs font-bold uppercase tracking-widest text-gold">Contagem de verdade, ao vivo</p>
      <h2 className="serif mt-1 text-center text-3xl font-semibold text-navy">O que já aconteceu aqui</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ITENS.map((i) => (
          <div key={i.chave} className="card flex flex-col items-center p-4 text-center">
            <span className="text-2xl" aria-hidden="true">{i.emoji}</span>
            <strong className="serif mt-1 text-4xl font-semibold text-navy tabular-nums">{s ? <Numero alvo={s[i.chave]} /> : "…"}</strong>
            <span className="mt-1 text-xs text-muted">{i.rotulo}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">Nenhum número inventado: cada um vem do que as pessoas fizeram no site. Começa pequeno e cresce.</p>
    </section>
  );
}
