import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import FormCertificado from "@/components/FormCertificado";
export const metadata = { title: "Seu certificado — A Chave da Virada" };
export default function Pagina() {
  return (<><Cabecalho /><main className="mx-auto max-w-2xl px-5 py-12"><FormCertificado /></main><Rodape /></>);
}
