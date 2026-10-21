import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { Suspense } from "react";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import FormCadastro from "@/components/FormCadastro";
export const metadata = { title: "Um livro gratuito — A Chave da Virada" };
const LIVRO = "/livro/a-chave-da-virada.pdf";
export default function Livro() {
  const temPdf = fs.existsSync(path.join(process.cwd(), "public", LIVRO));
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12 grid gap-10 md:grid-cols-2 items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Livro gratuito</p>
          <h1 className="serif text-4xl font-semibold text-navy mt-2" style={{ textWrap: "balance" }}>Sobre paz, ansiedade e recomeços</h1>
          <p className="mt-4 text-lg text-ink/80">Um livro curto, de leitura fácil, sobre o que fazer quando a mente não desliga e a vida parece pesada demais. Sem jargão, sem cobrança. Em PDF agora, ou impresso na sua casa, se preferir.</p>
          <ul className="mt-6 space-y-2 text-ink/80">
            <li>📖 PDF enviado na hora pelo WhatsApp</li>
            <li>🏠 Versão impressa entregue em casa, se você quiser uma visita</li>
            <li>🎁 Nada é cobrado. Nunca.</li>
          </ul>
          {temPdf && <a href={LIVRO} className="btn-gold mt-6" download>📖 Baixar o PDF agora</a>}
          <p className="mt-6 text-sm text-muted">Enquanto o livro não chega, você já pode começar pela <Link href="/curso/1" className="underline font-semibold text-navy">lição 1 — Você não está sozinho</Link>, que leva 5 minutos.</p>
        </div>
        <div className="card" id="cadastro">
          <h2 className="serif text-2xl font-semibold text-navy">Quero o livro</h2>
          <p className="mb-4 text-sm text-muted">Leva menos de um minuto.</p>
          <Suspense fallback={null}><FormCadastro compacto /></Suspense>
        </div>
      </main>
      <Rodape />
    </>
  );
}
