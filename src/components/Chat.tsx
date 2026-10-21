"use client";
// Chat com a Esperança no site. Mesmo motor do WhatsApp; lições abrem o jogo.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { lerProgresso } from "@/lib/progresso-local";

interface Msg { de: "eu" | "robo"; texto: string; botoes?: { id: string; titulo: string }[]; link?: { href: string; rotulo: string } }

function md(t: string) {
  // *negrito* e links simples
  const esc = t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return esc.replace(/\*(.+?)\*/g, "<b>$1</b>").replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank" rel="noopener" class="underline">$1</a>').replace(/\n/g, "<br>");
}

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const fim = useRef<HTMLDivElement>(null);
  const iniciado = useRef(false);

  async function enviar(t: string, botaoId?: string) {
    if (!t.trim() && !botaoId) return;
    setOcupado(true);
    if (t.trim()) setMsgs((m) => [...m, { de: "eu", texto: t }]);
    setTexto("");
    try {
      const concluidas = Object.keys(lerProgresso().concluidas).map(Number);
      const r = await fetch("/api/conversar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto: t, botaoId, concluidas }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro);
      for (const s of j.saidas as Msg[]) {
        await new Promise((res) => setTimeout(res, 450));
        setMsgs((m) => [...m, { de: "robo", texto: s.texto, botoes: s.botoes, link: s.link }]);
      }
    } catch (e) {
      setMsgs((m) => [...m, { de: "robo", texto: e instanceof Error ? e.message : "Não consegui responder agora. Se for urgente: ligue 188." }]);
    } finally { setOcupado(false); }
  }

  useEffect(() => { if (!iniciado.current) { iniciado.current = true; void enviar("oi"); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fim.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs]);

  return (
    <div className="mx-auto max-w-2xl flex flex-col" style={{ minHeight: "70vh" }}>
      <div className="flex items-center gap-3 rounded-t-2xl bg-navy text-cream px-4 py-3">
        <span className="grid place-items-center w-10 h-10 rounded-full bg-gold text-navy-deep text-xl">🌱</span>
        <div><p className="font-semibold leading-tight">Esperança</p><p className="text-xs text-cream/70">Assistente da igreja Nova Esperança · responde a qualquer hora · escreva “visita” se quiser receber alguém</p></div>
      </div>
      <div className="flex-1 space-y-3 border-x border-line bg-cream-dark/60 p-4 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.de === "eu" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${m.de === "eu" ? "bg-[#DCF4D6] rounded-tr-sm" : "bg-white border border-line rounded-tl-sm"}`}>
              <p dangerouslySetInnerHTML={{ __html: md(m.texto) }} />
              {m.link && <Link href={m.link.href} className="btn-gold mt-3 w-full text-sm">{m.link.rotulo}</Link>}
              {m.botoes && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.botoes.map((b) => <button key={b.id} onClick={() => enviar(b.titulo, b.id)} disabled={ocupado} className="rounded-full border border-navy/40 px-3 py-1.5 text-sm font-semibold text-navy hover:bg-navy hover:text-cream transition">{b.titulo}</button>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {ocupado && <p className="text-xs text-muted">Esperança está escrevendo…</p>}
        <div ref={fim} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void enviar(texto); }} className="flex gap-2 rounded-b-2xl border border-line bg-white p-3">
        <input id="chat-texto" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva aqui…" className="field" autoComplete="off" maxLength={2000} />
        <button className="btn-gold px-5" disabled={ocupado || !texto.trim()}>Enviar</button>
      </form>
      <p className="mt-3 text-xs text-muted text-center">Se estiver pensando em desistir da vida, ligue <a href="tel:188" className="font-bold text-navy">188</a> (CVV, 24h, gratuito). Conversa automática. Se quiser que alguém da igreja te visite, é só pedir.</p>
    </div>
  );
}
