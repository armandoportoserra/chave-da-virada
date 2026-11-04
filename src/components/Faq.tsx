"use client";
// Perguntas e respostas sobre o amor de Deus: busca livre, temas, clicou → abriu a resposta com o versículo.
import { useMemo, useState } from "react";
import Link from "next/link";
import { FAQ, FAQ_TOTAL, buscarFaq, type FaqItem } from "@/lib/faq";

export default function Faq() {
  const [busca, setBusca] = useState("");
  const [tema, setTema] = useState<string | null>(null);
  const [aberta, setAberta] = useState<string | null>(null);

  const resultados = useMemo(() => (busca.trim().length >= 3 ? buscarFaq(busca, 30, tema ?? undefined) : null), [busca, tema]);
  const temaAtual = tema ? FAQ.find((t) => t.id === tema) ?? null : null;

  function Item({ it, chave, rotuloTema }: { it: FaqItem; chave: string; rotuloTema?: string }) {
    const open = aberta === chave;
    return (
      <li className="rounded-2xl border border-line bg-white">
        <button type="button" onClick={() => setAberta(open ? null : chave)} aria-expanded={open}
          className="flex w-full items-start gap-3 px-4 py-3 text-left">
          <span className="mt-0.5 text-gold font-bold" aria-hidden="true">{open ? "−" : "+"}</span>
          <span className="min-w-0 flex-1">
            <span className="font-semibold text-navy leading-snug">{it.p}</span>
            {rotuloTema && <span className="block text-[11px] font-bold uppercase tracking-wider text-muted mt-0.5">{rotuloTema}</span>}
          </span>
        </button>
        {open && (
          <div className="px-4 pb-4 pl-10 space-y-3">
            <p className="text-ink/85 leading-relaxed">{it.r}</p>
            <p className="rounded-xl p-3 text-sm" style={{ background: "#DCF4D6", color: "#1f2a1f" }}>📖 <em>{it.v}</em> <span className="font-bold text-ink/60">— {it.ref}</span></p>
          </div>
        )}
      </li>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <label className="block">
        <span className="sr-only">Buscar uma pergunta</span>
        <input value={busca} onChange={(e) => { setBusca(e.target.value); setAberta(null); }} placeholder="Escreva sua pergunta… (ex.: Deus me perdoa?)" className="field text-lg" autoComplete="off" />
      </label>
      <p className="mt-2 text-xs text-muted">{FAQ_TOTAL} perguntas e respostas · cada uma com um verso da Bíblia · sempre um Deus que ama você.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setTema(null); setAberta(null); }} className={`rounded-full border px-3 py-1.5 text-sm ${tema === null ? "bg-navy text-cream border-navy" : "bg-white border-line text-ink"}`}>Todos os temas</button>
        {FAQ.map((t) => (
          <button key={t.id} type="button" onClick={() => { setTema(t.id === tema ? null : t.id); setAberta(null); }}
            className={`rounded-full border px-3 py-1.5 text-sm ${tema === t.id ? "bg-navy text-cream border-navy" : "bg-white border-line text-ink"}`}>
            {t.emoji} {t.tema}
          </button>
        ))}
      </div>

      {resultados ? (
        <section className="mt-6">
          <h2 className="serif text-2xl font-semibold text-navy">{resultados.length ? `${resultados.length} resposta(s) para “${busca.trim()}”` : "Não achei uma pergunta igual"}</h2>
          {!resultados.length && (
            <p className="mt-2 text-ink/80">Tente outras palavras, escolha um tema abaixo ou <Link href="/conversar" className="underline font-semibold text-navy">pergunte à Esperança</Link> — ela responde na hora.</p>
          )}
          <ul className="mt-4 space-y-2">
            {resultados.map((r, i) => <Item key={r.temaId + i} it={r} chave={`b-${r.temaId}-${r.p}`} rotuloTema={`${r.emoji} ${r.tema}`} />)}
          </ul>
        </section>
      ) : temaAtual ? (
        <section className="mt-6">
          <h2 className="serif text-3xl font-semibold text-navy">{temaAtual.emoji} {temaAtual.tema}</h2>
          <p className="mt-1 text-ink/75">{temaAtual.intro}</p>
          <ul className="mt-4 space-y-2">
            {temaAtual.itens.map((it, i) => <Item key={i} it={it} chave={`${temaAtual.id}-${i}`} />)}
          </ul>
        </section>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {FAQ.map((t) => (
            <button key={t.id} type="button" onClick={() => setTema(t.id)} className="card text-left transition hover:-translate-y-0.5 hover:border-gold">
              <span className="text-3xl" aria-hidden="true">{t.emoji}</span>
              <span className="serif mt-2 block text-2xl font-semibold text-navy leading-tight">{t.tema}</span>
              <span className="mt-1 block text-sm text-muted">{t.intro}</span>
              <span className="mt-2 block text-xs font-bold uppercase tracking-wider text-gold">{t.itens.length} perguntas →</span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-10 text-sm text-muted border-t border-dashed border-line pt-4">Não achou a sua pergunta? <Link href="/conversar" className="font-semibold text-navy underline">Converse com a Esperança</Link>, a qualquer hora.</p>
    </div>
  );
}
