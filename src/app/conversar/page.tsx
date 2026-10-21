import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import Chat from "@/components/Chat";
export const metadata = { title: "Conversar com a Esperança — A Chave da Virada" };
export default function Conversar() {
  return (<><Cabecalho /><main className="px-5 py-8"><Chat /></main><Rodape /></>);
}
