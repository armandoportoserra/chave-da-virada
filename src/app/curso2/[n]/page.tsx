import { notFound } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import Jogo from "@/components/Jogo";
import Registrar from "@/components/Registrar";
import { JOGO2 } from "@/lib/jogo";

export function generateStaticParams() { return JOGO2.map((l) => ({ n: String(l.numero) })); }
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params; const l = JOGO2[Number(n) - 1];
  return { title: l ? `Apocalipse · Lição ${l.numero} — ${l.titulo}` : "Lição" };
}
export default async function Licao({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const l = JOGO2[Number(n) - 1];
  if (!l) notFound();
  return (<><Cabecalho /><main className="px-5 py-8"><Registrar curso={2} licao={l.numero} /><Jogo licao={l} total={JOGO2.length} curso={2} /></main><Rodape /></>);
}
