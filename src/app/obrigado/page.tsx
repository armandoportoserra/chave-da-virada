import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";

export const metadata = { title: "Recebemos seu pedido — A Chave da Virada" };

export default function Obrigado() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <div className="text-6xl" aria-hidden="true">🌱</div>
        <h1 className="serif mt-4 text-4xl font-semibold text-navy">Recebemos seu pedido.</h1>
        <p className="mt-4 text-lg text-ink/85">
          Você vai receber uma mensagem no WhatsApp com o que pediu. Enquanto isso, pode começar a lição 1 — leva 5 minutos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/conversar" className="btn-outline">Conversar com a Esperança</Link>
          <Link href="/curso/1" className="btn-gold">Começar a lição 1</Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
