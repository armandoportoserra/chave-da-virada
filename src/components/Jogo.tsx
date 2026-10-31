"use client";
// Uma lição em formato jogo: gancho → 8 perguntas (uma por vez, verso acende) → oração → vídeo → 188 → próxima.
// Avança sozinho: cada pergunta respondida segue em alguns segundos (o verso fica na tela); no fim, a próxima lição
// abre com uma contagem regressiva que a pessoa pode cancelar. Nada sai do site: o vídeo toca aqui mesmo.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LicaoJogo } from "@/lib/jogo";
import { ROM } from "@/lib/jogo";
import { lerProgresso, salvarProgresso, totalPontos, type Progresso } from "@/lib/progresso-local";

const L = ["A", "B", "C", "D"];
const SEG_PERGUNTA = 4;   // segundos lendo o verso antes de seguir
const SEG_LICAO = 30;     // segundos no fim (oração + vídeo) antes de abrir a próxima lição; clicar no vídeo pausa

export default function Jogo({ licao, total }: { licao: LicaoJogo; total: number }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"inicio" | "jogo" | "fim">("inicio");
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [prog, setProg] = useState<Progresso>({ concluidas: {} });
  const [salvo, setSalvo] = useState(false);
  const [prazo, setPrazo] = useState<number | null>(null);  // instante em que o avanço automático dispara
  const [agora, setAgora] = useState(0); // só é lido quando há prazo (definido junto, nos manipuladores)
  const [auto, setAuto] = useState(true);                   // a pessoa pode pausar o avanço automático

  useEffect(() => {
    const p = lerProgresso();
    const t = setTimeout(() => setProg(p), 0);
    return () => clearTimeout(t);
  }, []);

  const q = licao.perguntas[i];
  const ultima = i === licao.perguntas.length - 1;
  const proximaHref = licao.numero < total ? `/curso/${licao.numero + 1}` : "/curso/certificado";
  const resta = auto && prazo !== null ? Math.max(0, Math.ceil((prazo - agora) / 1000)) : null;

  // Pré-carrega a próxima lição para a troca ser instantânea.
  useEffect(() => { router.prefetch(proximaHref); }, [router, proximaHref]);

  // Relógio da contagem regressiva (só roda enquanto há um prazo).
  useEffect(() => {
    if (prazo === null || !auto) return;
    const t = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(t);
  }, [prazo, auto]);

  // Se a pessoa clicar no vídeo (o foco vai para o player), a contagem para: ela escolhe quando seguir.
  useEffect(() => {
    if (etapa !== "fim") return;
    const parar = () => setAuto(false);
    window.addEventListener("blur", parar);
    return () => window.removeEventListener("blur", parar);
  }, [etapa]);

  useEffect(() => {
    if (resta !== 0 || !auto) return;
    if (etapa === "jogo") proxima();
    else if (etapa === "fim") router.push(proximaHref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resta]);

  function responder(j: number) {
    if (escolha !== null) return;
    setEscolha(j); setPrazo(Date.now() + SEG_PERGUNTA * 1000); setAgora(Date.now());
    if (j === q.c) { setPontos((p) => p + licao.pontos_por_pergunta); setAcertos((a) => a + 1); }
  }
  function proxima() {
    if (ultima) {
      const p = lerProgresso();
      p.concluidas[licao.numero] = { pontos, acertos, em: new Date().toISOString() };
      salvarProgresso(p); setProg(p); setSalvo(true); setEtapa("fim"); setPrazo(Date.now() + SEG_LICAO * 1000); setAgora(Date.now());
      void fetch("/api/progresso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pessoaId: p.pessoaId ?? null, licao: licao.numero, pontos, acertos }) }).catch(() => {});
      return;
    }
    setI(i + 1); setEscolha(null); setPrazo(null);
  }

  const estilo = { "--c": licao.cor, "--f": licao.fundo } as React.CSSProperties;

  return (
    <div className="jogo mx-auto max-w-2xl" style={estilo}>
      <header className="rounded-2xl p-5 flex items-center gap-4" style={{ background: licao.fundo, color: "#22202A" }}>
        <span className="text-4xl leading-none">{licao.figurinha}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: licao.cor }}>Lição {licao.numero} de {total} · Bloco {ROM[licao.bloco]} — {licao.bloco_nome}</p>
          <h1 className="serif text-2xl md:text-3xl font-semibold leading-tight">{licao.titulo}</h1>
        </div>
      </header>

      {etapa === "inicio" && (
        <section className="mt-5 space-y-5">
          <p className="rounded-2xl rounded-tl-sm bg-white border border-line p-4 text-lg">{licao.gancho}</p>
          <p className="text-sm text-muted">{licao.perguntas.length} perguntas rápidas. Cada uma termina com um verso. Acertou ou não, avança — ninguém reprova aqui. Vale {licao.pontos_por_pergunta} pontos por acerto.</p>
          <button className="btn-gold w-full" onClick={() => setEtapa("jogo")}>Começar</button>
          <Cvv texto={licao.cvv} />
        </section>
      )}

      {etapa === "jogo" && (
        <section className="mt-5 space-y-4" aria-live="polite">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Pergunta {i + 1} de {licao.perguntas.length}</span>
            <span className="font-bold tabular-nums" style={{ color: licao.cor }}>{pontos} pts</span>
          </div>
          <div className="h-2 rounded-full bg-line overflow-hidden"><div className="h-full transition-all" style={{ width: `${((i + (escolha !== null ? 1 : 0)) / licao.perguntas.length) * 100}%`, background: licao.cor }} /></div>
          <p className="rounded-2xl rounded-tl-sm bg-white border border-line p-4 text-lg font-medium">{q.p}</p>
          <div className="grid gap-2">
            {q.o.map((o, j) => {
              const estado = escolha === null ? "" : j === q.c ? "certa" : j === escolha ? "errada" : "neutra";
              return (
                <button key={j} onClick={() => responder(j)} disabled={escolha !== null}
                  className={`text-left rounded-xl border-2 px-4 py-3 transition ${estado === "certa" ? "text-white" : estado === "errada" ? "opacity-50 line-through" : "bg-white"}`}
                  style={{ borderColor: licao.cor, background: estado === "certa" ? licao.cor : undefined }}>
                  <b className="mr-2" style={{ color: estado === "certa" ? "#fff" : licao.cor }}>{L[j]}</b>{o}
                </button>
              );
            })}
          </div>
          <div className={`rounded-2xl rounded-tr-sm p-4 transition-opacity ${escolha === null ? "opacity-30" : "opacity-100"}`} style={{ background: "#DCF4D6", color: "#1f2a1f" }}>
            <p className="flex gap-2"><span>📖</span><em>{q.v}</em></p>
            <p className="mt-1 text-xs font-bold text-ink/60">{q.r}</p>
          </div>
          {escolha !== null && (
            <p className="text-sm text-muted">{escolha === q.c ? `✅ Isso. +${licao.pontos_por_pergunta} pontos.` : `A resposta era ${L[q.c]}. Sem problema — o que importa é o verso.`}</p>
          )}
          <button className="btn-gold w-full" onClick={proxima} disabled={escolha === null}>
            {ultima ? "Terminar a lição" : "Próxima"}{escolha !== null && auto && resta !== null ? ` · ${resta}s` : ""}
          </button>
          {escolha !== null && (
            <button type="button" className="block mx-auto text-xs text-muted underline" onClick={() => setAuto((a) => !a)}>
              {auto ? "Pausar o avanço automático" : "Voltar a avançar sozinho"}
            </button>
          )}
        </section>
      )}

      {etapa === "fim" && (
        <section className="mt-5 space-y-5">
          <div className="rounded-2xl p-5 text-center" style={{ background: licao.fundo, color: "#22202A" }}>
            <p className="text-3xl">{licao.figurinha}</p>
            <p className="serif text-2xl font-semibold mt-2">Lição {licao.numero} concluída</p>
            <p className="mt-1">{acertos} de {licao.perguntas.length} acertos · <b>+{pontos} pontos</b> · total {totalPontos(prog)} pts</p>
          </div>
          <p className="rounded-2xl rounded-tl-sm bg-white border border-line p-4">🙏 <em>{licao.oracao}</em></p>
          {licao.videos.map((v) => (
            <figure key={v.id} className="rounded-2xl border border-line bg-white p-3">
              <div className="aspect-video overflow-hidden rounded-lg bg-line">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`}
                  title={v.titulo} className="h-full w-full" loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              </div>
              <figcaption className="mt-2 min-w-0"><small className="block text-[11px] font-bold uppercase tracking-wider text-muted">{v.programa}</small><span className="font-semibold leading-snug">{v.titulo}</span></figcaption>
            </figure>
          ))}
          <Cvv texto={licao.cvv} />
          <div className="grid gap-2 sm:grid-cols-2">
            {licao.numero < total
              ? <Link href={proximaHref} className="btn-gold">Lição {licao.numero + 1} →{auto && resta !== null ? ` · ${resta}s` : ""}</Link>
              : <Link href={proximaHref} className="btn-gold">🎓 Pegar meu certificado{auto && resta !== null ? ` · ${resta}s` : ""}</Link>}
            <Link href="/oracao" className="btn-outline">Quero que orem por mim</Link>
          </div>
          {auto && resta !== null && (
            <button type="button" className="block mx-auto text-xs text-muted underline" onClick={() => setAuto(false)}>Ficar nesta página (não avançar sozinho)</button>
          )}
          {salvo && <p className="text-xs text-muted text-center">Progresso salvo neste navegador. Para continuar em outro aparelho, use o mesmo navegador ou jogue de novo — não tem problema repetir.</p>}
        </section>
      )}
    </div>
  );
}

function Cvv({ texto }: { texto: string }) {
  void texto;
  return <p className="text-xs text-muted border-t border-dashed border-line pt-3">☎️ Se estiver pensando em desistir da vida, ligue <a href="tel:188" className="font-bold text-navy">188</a> (CVV, 24h, gratuito) ou <Link href="/conversar" className="font-bold text-navy">fale com a gente agora</Link>.</p>;
}
