import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
export const metadata = { title: "TV Novo Tempo ao vivo — Igreja Adventista Nova Esperança" };
// Canal oficial da TV Novo Tempo no YouTube (@TVNovoTempo).
const CANAL = "UCFbCGwTBgfVIH57zepBJekg";
export default function Tv() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">TV Novo Tempo</p>
        <h1 className="serif mt-2 text-4xl font-semibold text-navy">Ao vivo, aqui mesmo</h1>
        <p className="mt-3 text-lg text-ink/80">A TV da Igreja Adventista: programas, estudos da Bíblia e músicas, 24 horas por dia.</p>
        <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
          <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/live_stream?channel=${CANAL}&autoplay=1&mute=1`} title="TV Novo Tempo ao vivo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
        </div>
        <p className="mt-3 text-sm text-muted">Se a transmissão não abrir aqui, assista no canal oficial: <a href="https://www.novotempo.com/aovivo/" target="_blank" rel="noopener" className="underline">novotempo.com/aovivo</a>.</p>
      </main>
      <Rodape />
    </>
  );
}
