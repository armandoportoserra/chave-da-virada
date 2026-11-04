"use client";
import { useEffect, useRef, useState } from "react";
import Seta from "@/components/Seta";

const VIDEO = "/video/abra.mp4";
const POSTER = "/video/abra.jpg";

// "Abra, aqui tem muitas respostas": o convite em vídeo (10 s). Antes de tocar, mostra a frase; ao terminar, chama para descer.
export default function Abra({ aoTerminar, textoFinal = "Agora desça: livro, cursos e oração estão logo abaixo", hrefFinal }: { aoTerminar?: () => void; textoFinal?: string; hrefFinal?: string }) {
  const [fase, setFase] = useState<"antes" | "tocando" | "fim">("antes");
  const ref = useRef<HTMLVideoElement>(null);

  const tocar = () => {
    setFase("tocando");
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    void v.play().catch(() => {
      v.muted = true;
      void v.play().catch(() => {});
    });
  };

  return (
    <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-gold/40 bg-navy-deep text-cream shadow-2xl">
      <div className="px-6 pt-5 pb-3 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Alguém bate à porta</p>
        <h2 className="serif mt-1 text-3xl font-semibold leading-tight text-white md:text-4xl">Abra, aqui tem muitas respostas:</h2>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <video ref={ref} src={VIDEO} poster={POSTER} playsInline preload="metadata" controls={fase === "tocando"} onEnded={() => { setFase("fim"); aoTerminar?.(); }} className="h-full w-full object-cover" />
        {fase !== "tocando" && (
          <button type="button" onClick={tocar} aria-label="Abrir o vídeo" className="group absolute inset-0 flex flex-col items-center justify-center bg-black/35 transition hover:bg-black/25">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-navy-deep shadow-lg transition group-hover:scale-110">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="mt-3 rounded-full bg-black/50 px-4 py-1 text-sm font-semibold text-white">{fase === "fim" ? "Ver de novo" : "Toque para abrir"}</span>
          </button>
        )}
      </div>
      <div className="px-6 py-3 text-center">
        {fase === "fim" ? (
          <Seta texto={textoFinal} href={hrefFinal} clara compacta />
        ) : (
          <p className="text-sm text-cream/75">10 segundos. Com som.</p>
        )}
      </div>
    </div>
  );
}

// Pop-up na entrada do site: aparece uma vez por sessão; fecha no X, no Esc, no fundo ou ao terminar o vídeo (botão).
export function PopupAbra() {
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem("abra_visto")) return; sessionStorage.setItem("abra_visto", "1"); } catch { /* sem storage */ }
    const t = setTimeout(() => setAberto(true), 600);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    document.addEventListener("keydown", fechar);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fechar); document.body.style.overflow = ""; };
  }, [aberto]);
  if (!aberto) return null;
  const entrar = () => { setAberto(false); document.getElementById("ofertas")?.scrollIntoView({ behavior: "smooth" }); };
  return (
    <div role="dialog" aria-modal="true" aria-label="Abra, aqui tem muitas respostas" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setAberto(false); }}>
      <div className="relative w-full max-w-[560px]">
        <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="absolute -top-3 -right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy shadow-lg hover:bg-cream">✕</button>
        <Abra textoFinal="Pronto. Entre e veja o livro, os cursos e a oração" />
        <button type="button" onClick={entrar} className="btn-gold mt-3 w-full">Entrar no site</button>
      </div>
    </div>
  );
}
