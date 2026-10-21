// Webhook da WhatsApp Cloud API. GET = verificação da Meta; POST = mensagens recebidas.
import { NextRequest, NextResponse } from "next/server";
import { assinaturaValida, enviarSaidas, extrairMensagens, marcarLida } from "@/lib/whatsapp";
import { atenderMensagem } from "@/lib/robo/persistencia";
import { processar } from "@/lib/robo/motor";
import { supabaseConfigurado } from "@/lib/supabase-server";


export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams;
  if (u.get("hub.mode") === "subscribe" && u.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(u.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!assinaturaValida(raw, req.headers.get("x-hub-signature-256"))) return new NextResponse("Bad signature", { status: 401 });
  if (!supabaseConfigurado()) return NextResponse.json({ ok: false, erro: "Supabase não configurado" }, { status: 503 });

  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return new NextResponse("Bad JSON", { status: 400 }); }
  const msgs = extrairMensagens(payload);

  // A Meta exige 200 rápido; processamos cada mensagem e respondemos. (Vercel: até 10s no plano free — suficiente.)
  for (const m of msgs) {
    try {
      await marcarLida(m.id);
      const saidas = await atenderMensagem(m.de, m.texto, m.botaoId, m.nomePerfil, processar);
      if (saidas.length) await enviarSaidas(m.de, saidas);
    } catch (e) {
      console.error("[webhook] falha ao atender", m.de, e);
    }
  }
  return NextResponse.json({ ok: true, recebidas: msgs.length });
}
