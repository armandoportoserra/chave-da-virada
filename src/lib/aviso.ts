// Aviso à igreja quando alguém pede visita (único ponto humano). Sem painel: chega no WhatsApp da coordenação
// (AVISO_WHATSAPP, via Cloud API quando configurada) e/ou num webhook (AVISO_WEBHOOK_URL — ex.: Make/Zapier → e-mail).
import { enviarSaida } from "./whatsapp";

export async function avisarIgreja(assunto: string, texto: string) {
  const msg = `🔔 *A Chave da Virada — ${assunto}*\n${texto}`;
  const zap = process.env.AVISO_WHATSAPP;
  if (zap && process.env.WHATSAPP_ACCESS_TOKEN) { try { await enviarSaida(zap, { texto: msg }); } catch (e) { console.error("[aviso zap]", e); } }
  const hook = process.env.AVISO_WEBHOOK_URL;
  if (hook) { try { await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assunto, texto, em: new Date().toISOString() }) }); } catch (e) { console.error("[aviso hook]", e); } }
  if (!zap && !hook) console.warn("[aviso] (sem AVISO_WHATSAPP/AVISO_WEBHOOK_URL)", msg);
}
