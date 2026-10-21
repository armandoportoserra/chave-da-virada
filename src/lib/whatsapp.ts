// Cliente da WhatsApp Cloud API (Meta). Credenciais só via variáveis de ambiente.
import crypto from "node:crypto";
import type { Saida } from "./robo/tipos";

const API = "https://graph.facebook.com/v21.0";

function cfg() {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!id || !token) throw new Error("WhatsApp não configurado (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN).");
  return { id, token };
}

async function post(body: unknown) {
  const { id, token } = cfg();
  const r = await fetch(`${API}/${id}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`WhatsApp ${r.status}: ${await r.text()}`);
  return r.json() as Promise<{ messages?: { id: string }[] }>;
}

const dormir = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Envia uma saída do robô: texto simples, botões (≤3) ou lista (4–10 opções). */
export async function enviarSaida(para: string, s: Saida) {
  const to = para.replace(/\D/g, "");
  if (!s.botoes?.length) {
    return post({ messaging_product: "whatsapp", to, type: "text", text: { body: s.texto, preview_url: true } });
  }
  if (s.botoes.length <= 3) {
    return post({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "button",
        body: { text: s.texto.slice(0, 1024) },
        action: { buttons: s.botoes.map((b) => ({ type: "reply", reply: { id: b.id, title: b.titulo.slice(0, 20) } })) },
      },
    });
  }
  return post({
    messaging_product: "whatsapp", to, type: "interactive",
    interactive: {
      type: "list",
      body: { text: s.texto.slice(0, 1024) },
      action: { button: "Escolher", sections: [{ title: "Opções", rows: s.botoes.map((b) => ({ id: b.id, title: b.titulo.slice(0, 24) })) }] },
    },
  });
}

/** Envia várias saídas em sequência, com pausa para manter a ordem e o ritmo de leitura. */
export async function enviarSaidas(para: string, saidas: Saida[], pausaMs = 1500) {
  for (let i = 0; i < saidas.length; i++) {
    await enviarSaida(para, saidas[i]);
    if (i < saidas.length - 1) await dormir(pausaMs);
  }
}

export async function marcarLida(messageId: string) {
  try { await post({ messaging_product: "whatsapp", status: "read", message_id: messageId }); } catch { /* não crítico */ }
}

/** Verifica a assinatura X-Hub-Signature-256 do webhook. */
export function assinaturaValida(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production"; // em dev, sem segredo, aceita
  if (!header?.startsWith("sha256=")) return false;
  const esperado = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const recebido = header.slice(7);
  return esperado.length === recebido.length && crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(recebido));
}

/** Extrai do payload do webhook as mensagens recebidas (texto, botão, lista). */
export interface MensagemRecebida { de: string; id: string; texto: string; botaoId?: string; nomePerfil?: string; timestamp: number }
export function extrairMensagens(payload: unknown): MensagemRecebida[] {
  const out: MensagemRecebida[] = [];
  const p = payload as { entry?: { changes?: { value?: { contacts?: { wa_id: string; profile?: { name?: string } }[]; messages?: Record<string, unknown>[] } }[] }[] };
  for (const e of p.entry ?? []) for (const c of e.changes ?? []) {
    const v = c.value; if (!v?.messages) continue;
    const nome = v.contacts?.[0]?.profile?.name;
    for (const m of v.messages) {
      const base = { de: "+" + String(m.from), id: String(m.id), nomePerfil: nome, timestamp: Number(m.timestamp) * 1000 };
      const tipo = m.type as string;
      if (tipo === "text") out.push({ ...base, texto: (m.text as { body: string }).body });
      else if (tipo === "interactive") {
        const it = m.interactive as { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } };
        const r = it.button_reply ?? it.list_reply;
        if (r) out.push({ ...base, texto: r.title, botaoId: r.id });
      } else if (tipo === "button") {
        const b = m.button as { payload?: string; text?: string };
        out.push({ ...base, texto: b.text ?? b.payload ?? "" });
      } else out.push({ ...base, texto: `[${tipo}]` }); // áudio, imagem etc.: o robô pede texto
    }
  }
  return out;
}
