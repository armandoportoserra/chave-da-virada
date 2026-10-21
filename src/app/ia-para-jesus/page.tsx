import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
export const metadata = { title: "I Congresso IA para Jesus — A Chave da Virada" };
const trilhas = [
  ["🤖", "Robôs que acolhem", "Como uma assistente automática pode ouvir, orar e ensinar a Bíblia sem substituir a igreja."],
  ["📬", "A igreja que vai até a caixa de correio", "Folders nos prédios do Centro e da Nova Esperança: por que, como e quando."],
  ["🎮", "Estudar a Bíblia jogando", "O curso de 20 lições em formato de jogo: 8 perguntas, um verso por pergunta, vídeo no fim."],
  ["🛡️", "Cuidado com quem está no limite", "188, limites do robô e o papel da visita: o que a tecnologia nunca pode fazer sozinha."],
];
export default function IAParaJesus() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Congresso · 24 e 25 de outubro de 2026 (data provisória)</p>
        <h1 className="serif text-4xl md:text-5xl font-semibold text-navy mt-2" style={{ textWrap: "balance" }}>I Congresso IA para Jesus</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">Dois dias para aprender, na prática, a usar inteligência artificial para alcançar pessoas que não abrem a porta — mas abrem o celular. Organizado pela Igreja Adventista do Sétimo Dia Nova Esperança, em Caxias do Sul.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {trilhas.map(([i, t, d]) => <div key={t} className="card"><p className="text-3xl">{i}</p><h2 className="serif text-xl font-semibold text-navy mt-2">{t}</h2><p className="mt-1 text-sm text-ink/75">{d}</p></div>)}
        </div>
        <div className="mt-10 card bg-navy text-cream border-navy">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Direção</p>
          <p className="mt-2">Pr. Enderson — Diretor Geral · Armando Luis Francisco e Felipe — Diretores Associados</p>
          <p className="mt-3 text-sm text-cream/80">Para igrejas e voluntários que queiram replicar o projeto A Chave da Virada: o material (site, curso, robô) é aberto. Peça uma conversa pelo WhatsApp do projeto.</p>
          <Link href="/conversar" className="btn-gold mt-4">Falar com a Esperança</Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
