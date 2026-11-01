import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import { BLOCOS_JOGO2, JOGO2, ROM } from "@/lib/jogo";
import ListaProgresso from "@/components/ListaProgresso";

export const metadata = { title: "Curso 2 — Apocalipse: Revelações de Esperança, em 21 jogos" };

export default function Curso2() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Curso 2 · gratuito · no seu ritmo</p>
        <h1 className="serif text-4xl md:text-5xl font-semibold text-navy mt-2" style={{ textWrap: "balance" }}>Apocalipse — Revelações de Esperança</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">21 lições em formato de jogo sobre o último livro da Bíblia, baseadas no curso <em>Apocalipse: Revelações de Esperança</em> da Igreja Adventista do Sétimo Dia. Cada lição: 8 perguntas rápidas, 3 respostas, um verso da Bíblia fechando cada uma. Acertou ou não, avança. “Apocalipse” não quer dizer catástrofe: quer dizer revelação — e a revelação é Jesus.</p>
        <ListaProgresso total={JOGO2.length} curso={2} />
        {BLOCOS_JOGO2.map((b) => (
          <section key={b.numero} className="mt-10">
            <h2 className="serif text-2xl font-semibold" style={{ color: b.cor }}>Bloco {ROM[b.numero]} — {b.nome}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {b.licoes.map((l) => (
                <Link key={l.numero} href={`/curso2/${l.numero}`} className="card flex items-center gap-4 transition hover:-translate-y-0.5 hover:border-gold" style={{ borderTopColor: l.cor, borderTopWidth: 4 }}>
                  <span className="text-3xl">{l.figurinha}</span>
                  <span className="min-w-0"><small className="block text-[11px] font-bold uppercase tracking-wider text-muted">Lição {l.numero}</small><span className="serif text-xl font-semibold text-navy leading-tight">{l.titulo}</span><span className="block text-sm text-muted mt-1 line-clamp-2">{l.gancho}</span></span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section className="mt-14 card bg-navy text-cream border-navy">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Ainda não fez o Curso 1?</p>
          <h2 className="serif text-2xl font-semibold mt-1">A Chave da Virada — 20 lições</h2>
          <p className="mt-2 text-cream/80">Começa pela esperança e só depois chega nas doutrinas. Pode fazer os dois na ordem que preferir.</p>
          <Link href="/curso" className="btn-gold mt-4">Ver o Curso 1</Link>
        </section>
      </main>
      <Rodape />
    </>
  );
}
