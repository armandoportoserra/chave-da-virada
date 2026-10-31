import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import Faq from "@/components/Faq";
import { FAQ_TOTAL } from "@/lib/faq";

export const metadata = { title: "O amor de Deus — perguntas e respostas · Igreja Adventista Nova Esperança" };

export default function Perguntas() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Perguntas e respostas</p>
        <h1 className="serif text-4xl md:text-5xl font-semibold text-navy mt-2" style={{ textWrap: "balance" }}>O amor de Deus</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">{FAQ_TOTAL} perguntas que as pessoas fazem de verdade — sobre dor, culpa, medo, família, morte, oração, a Bíblia — respondidas com simplicidade e sempre com um Deus que ama você. Clique na pergunta e a resposta aparece, com um verso da Bíblia.</p>
        <div className="mt-8"><Faq /></div>
      </main>
      <Rodape />
    </>
  );
}
