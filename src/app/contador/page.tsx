import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import Contador from "@/components/Contador";
export const metadata = { title: "Contagem ao vivo — Igreja Adventista Nova Esperança" };
export default function PaginaContador() {
  return (<><Cabecalho /><main className="flex-1"><Contador compacto /></main><Rodape /></>);
}
