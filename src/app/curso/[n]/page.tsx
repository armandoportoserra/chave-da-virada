import { notFound } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import Jogo from "@/components/Jogo";
import { JOGO } from "@/lib/jogo";

export function generateStaticParams() { return JOGO.map((l) => ({ n: String(l.numero) })); }
export async function generateMetadata({ params }: PageProps<"/curso/[n]">) {
  const { n } = await params; const l = JOGO[Number(n) - 1];
  return { title: l ? `Lição ${l.numero} — ${l.titulo}` : "Lição" };
}
export default async function Licao({ params }: PageProps<"/curso/[n]">) {
  const { n } = await params;
  const l = JOGO[Number(n) - 1];
  if (!l) notFound();
  return (<><Cabecalho /><main className="px-5 py-8"><Jogo licao={l} total={JOGO.length} /></main><Rodape /></>);
}
