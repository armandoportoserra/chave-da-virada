import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import MeuProgresso from "@/components/MeuProgresso";
export const metadata = { title: "Meu progresso — A Chave da Virada" };
export default function App() {
  return (<><Cabecalho /><main className="mx-auto max-w-3xl px-5 py-12"><p className="text-xs font-bold uppercase tracking-widest text-gold">Meu progresso</p><h1 className="serif text-4xl font-semibold text-navy mt-2">Seu caminho até aqui</h1><MeuProgresso /></main><Rodape /></>);
}
