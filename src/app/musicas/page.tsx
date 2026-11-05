import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import { MUSICAS } from "@/lib/musicas";
export const metadata = { title: "Músicas — Igreja Adventista Nova Esperança" };
const TEMAS: Record<string, string> = { esperanca: "Esperança", oracao: "Oração", deus: "Você e Deus", jesus: "Jesus", vida: "Uma vida nova", futuro: "O futuro" };
export default function Musicas() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Músicas</p>
        <h1 className="serif mt-2 text-4xl font-semibold text-navy">Uma música para este momento</h1>
        <p className="mt-3 text-lg text-ink/80">Hinos e músicas jovens adventistas, de canais oficiais. Toque e ouça aqui mesmo.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {MUSICAS.map((m) => (
            <section key={m.id} id={m.id} className="card scroll-mt-24 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold">{TEMAS[m.tema]}</p>
              <h2 className="serif text-xl font-semibold text-navy">{m.titulo}</h2>
              <p className="text-sm text-muted">{m.autor}</p>
              <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black">
                <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${m.id}`} title={m.titulo} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
              </div>
            </section>
          ))}
        </div>
      </main>
      <Rodape />
    </>
  );
}
