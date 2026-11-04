import Abra from "@/components/Abra";
export const metadata = { title: "Abra, aqui tem muitas respostas — Igreja Adventista Nova Esperança" };
// Cartão do vídeo para embutir no Framer (fundo transparente): /abra?embed=1
export default function PaginaAbra() {
  return (
    <main className="flex min-h-screen items-center justify-center p-3">
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('transparente')" }} />
      <Abra />
    </main>
  );
}
