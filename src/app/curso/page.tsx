import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import { BLOCOS_JOGO, CURSO_2, JOGO, ROM } from "@/lib/jogo";
import ListaProgresso from "@/components/ListaProgresso";

export const metadata = { title: "Curso em 20 jogos — A Chave da Virada" };

export default function Curso() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Curso 1 · gratuito · no seu ritmo</p>
        <h1 className="serif text-4xl md:text-5xl font-semibold text-navy mt-2" style={{ textWrap: "balance" }}>20 lições em formato de jogo</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">Cada lição: 8 perguntas rápidas, 3 respostas, um verso da Bíblia fechando cada uma. Acertou ou não, avança. No fim, um vídeo curto da Novo Tempo. Sem prova, sem cobrança — começa pela esperança e só depois chega nas doutrinas.</p>
        <ListaProgresso total={JOGO.length} />
        {BLOCOS_JOGO.map((b) => (
          <section key={b.numero} className="mt-10">
            <h2 className="serif text-2xl font-semibold" style={{ color: b.cor }}>Bloco {ROM[b.numero]} — {b.nome}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {b.licoes.map((l) => (
                <Link key={l.numero} href={`/curso/${l.numero}`} className="card flex items-center gap-4 transition hover:-translate-y-0.5 hover:border-gold" style={{ borderTopColor: l.cor, borderTopWidth: 4 }}>
                  <span className="text-3xl">{l.figurinha}</span>
                  <span className="min-w-0"><small className="block text-[11px] font-bold uppercase tracking-wider text-muted">Lição {l.numero}</small><span className="serif text-xl font-semibold text-navy leading-tight">{l.titulo}</span><span className="block text-sm text-muted mt-1 line-clamp-2">{l.gancho}</span></span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section className="mt-14 card bg-navy text-cream border-navy">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Curso 2 · depois das 20</p>
          <h2 className="serif text-2xl font-semibold mt-1">{CURSO_2.titulo}</h2>
          <p className="mt-2 text-cream/80">{CURSO_2.descricao} Quem concluir o Curso 1 escolhe se quer continuar.</p>
          <ol className="mt-4 grid gap-1 sm:grid-cols-2 md:grid-cols-3 text-sm text-cream/70 list-decimal list-inside">
            {CURSO_2.licoes.map((t) => <li key={t}>{t}</li>)}
          </ol>
        </section>
      </main>
      <Rodape />
    </>
  );
}
