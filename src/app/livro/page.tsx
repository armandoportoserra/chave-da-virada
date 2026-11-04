import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
export const metadata = { title: "Um livro gratuito — A Chave da Virada" };
const LIVRO = "/livro/livro%20a%20chave%20da%20virada.pdf";
export default function Livro() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Livro gratuito</p>
          <h1 className="serif text-4xl font-semibold text-navy mt-2" style={{ textWrap: "balance" }}>A Chave da Virada</h1>
          <p className="mt-1 text-sm text-muted">Guia prático para melhorar sua saúde emocional · Marcello Niek e Bruno Raso · Casa Publicadora Brasileira</p>
          <p className="mt-4 text-lg text-ink/80">Nos últimos anos o mundo atravessou crises que mexeram com a mente de todo mundo. Este livro combina informações de saúde com reflexões de espiritualidade, em linguagem simples, para quem busca crescimento pessoal, superação de traumas e desafios emocionais. Sem jargão, sem cobrança.</p>
          <ul className="mt-6 space-y-2 text-ink/80">
            <li>📖 PDF completo, para ler no celular ou no computador</li>
            <li>🏠 Se quiser a versão impressa, é só pedir uma visita à Esperança</li>
            <li>🎁 Nada é cobrado. Nunca.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={LIVRO} className="btn-gold" download="A-Chave-da-Virada.pdf">📖 Baixar o PDF agora</a>
            <a href={LIVRO} className="btn-outline" target="_blank" rel="noopener">Ler no navegador</a>
          </div>
          <p className="mt-6 text-sm text-muted">Depois do livro, você pode seguir pela <Link href="/curso/1" className="underline font-semibold text-navy">lição 1 — Você não está sozinho</Link>, que leva 5 minutos.</p>
          <div className="card mt-8 bg-navy text-cream border-navy">
            <p className="text-xs font-bold uppercase tracking-widest text-gold">Tudo digital</p>
            <h2 className="serif text-2xl font-semibold mt-1">Prefere o livro impresso?</h2>
            <p className="mt-2 text-sm text-cream/80">Nada sai do site nem toca sua campainha. Se quiser receber o livro em mãos, peça uma visita à Esperança — ela combina com a igreja. Só se você quiser.</p>
            <Link href="/conversar" className="btn-gold mt-4">Pedir uma visita</Link>
          </div>
        </div>
        <a href={LIVRO} target="_blank" rel="noopener" className="block mx-auto w-full max-w-[320px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/livro/capa.jpg" alt="Capa do livro A Chave da Virada" width={800} height={1257} className="w-full rounded-xl shadow-lg" />
        </a>
      </main>
      <Rodape />
    </>
  );
}
