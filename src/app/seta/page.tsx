import { Suspense } from "react";
import SetaEmbutida from "./SetaEmbutida";
// Seta embutida no Framer (fundo transparente): /seta?texto=Desça%20para%20ver&clara=1
export default function PaginaSeta() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('transparente')" }} />
      <Suspense fallback={null}><SetaEmbutida /></Suspense>
    </main>
  );
}
