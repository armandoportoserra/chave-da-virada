import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import FormOracao from "@/components/FormOracao";
export const metadata = { title: "Alguém orando por você — A Chave da Virada" };
export default function Oracao() {
  return (<><Cabecalho /><main className="mx-auto max-w-2xl px-5 py-12"><p className="text-xs font-bold uppercase tracking-widest text-gold">Oração</p><h1 className="serif text-4xl font-semibold text-navy mt-2">Algo pesando no coração?</h1><p className="mt-3 text-lg text-ink/80 mb-6">Escreva. De dia ou de madrugada. O pedido fica guardado e é levado em oração pela igreja. Se quiser uma visita, é só marcar.</p><FormOracao /></main><Rodape /></>);
}
