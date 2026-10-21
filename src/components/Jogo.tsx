"use client";
// Uma lição em formato jogo: gancho → 8 perguntas (uma por vez, verso acende) → oração → vídeo → 188 → próxima.
import { useEffect, useState } from "react";
import Link from "next/link";
import type { LicaoJogo } from "@/lib/jogo";
import { ROM } from "@/lib/jogo";
import { lerProgresso, salvarProgresso, totalPontos, type Progresso } from "@/lib/progresso-local";

const L = ["A", "B", "C", "D"];

export default function Jogo({ licao, total }: { licao: LicaoJogo; total: number }) {
  const [etapa, setEtapa] = useState<"inicio" | "jogo" | "fim">("inicio");
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [prog, setProg] = useState<Progresso>({ concluidas: {} });
  const [salvo, setSalvo] = useState(false);

  useEffect(() => { setProg(lerProgresso()); }, []);

  const q = licao.perguntas[i];
  const ultima = i === licao.perguntas.length - 1;

  function responder(j: number) {
    if (escolha !== null) return;
    setEscolha(j);
    if (j === q.c) { setPontos((p) => p + licao.pontos_por_pergunta); setAcertos((a) => a + 1); }
  }
  function proxima() {
    if (ultima) {
      const p = lerProgresso();
      p.concluidas[licao.numero] = { pontos, acertos, em: new Date().toISOString() };
      salvarProgresso(p); setProg(p); setSalvo(true); setEtapa("fim");
      void fetch("/api/progresso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pessoaId: p.pessoaId ?? null, licao: licao.numero, pontos, acertos }) }).catch(() => {});
      return;
    }
    setI(i + 1); setEscolha(null);
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
          <p className="text-sm text-muted">8 perguntas rápidas. Cada uma termina com um verso. Acertou ou não, avança — ninguém reprova aqui. Vale {licao.pontos_por_pergunta} pontos por acerto.</p>
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
          <button className="btn-gold w-full" onClick={proxima} disabled={escolha === null}>{ultima ? "Terminar a lição" : "Próxima"}</button>
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
            <a key={v.id} href={v.url} target="_blank" rel="noopener" className="flex gap-4 items-center rounded-2xl border border-line bg-white p-3 hover:border-gold transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.capa} alt="" className="w-32 aspect-video object-cover rounded-lg bg-line" loading="lazy" />
              <span className="min-w-0"><small className="block text-[11px] font-bold uppercase tracking-wider text-muted">{v.programa}</small><span className="font-semibold leading-snug">{v.titulo}</span><span className="block text-xs text-muted mt-1">▶ Assistir no YouTube</span></span>
            </a>
          ))}
          <Cvv texto={licao.cvv} />
          <div className="grid gap-2 sm:grid-cols-2">
            {licao.numero < total
              ? <Link href={`/curso/${licao.numero + 1}`} className="btn-gold">Lição {licao.numero + 1} →</Link>
              : <Link href="/curso/certificado" className="btn-gold">🎓 Pegar meu certificado</Link>}
            <Link href="/oracao" className="btn-outline">Quero que orem por mim</Link>
          </div>
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
