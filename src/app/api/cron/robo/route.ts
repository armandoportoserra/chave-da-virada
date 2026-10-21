// Cron (diário, 8h de Brasília = 11h UTC; no plano Pro da Vercel pode ser */15): envia lições agendadas ("quero amanhã") e lembretes suaves.
// Respeita o sábado: do pôr do sol de sexta ao de sábado não envia nada por conta própria.
// Vercel: configurar em vercel.json  { "crons": [{ "path": "/api/cron/robo", "schedule": "*/15 * * * *" }] }
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";
import { tique } from "@/lib/robo/motor";
import { ehSabado } from "@/lib/robo/sabado";
import { aplicarAcoes, registrarMensagem, salvarEstado } from "@/lib/robo/persistencia";
import { enviarSaidas } from "@/lib/whatsapp";
import { estadoInicial, type Estado } from "@/lib/robo/tipos";


export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  if (!supabaseConfigurado()) return NextResponse.json({ ok: false, erro: "Supabase não configurado" }, { status: 503 });
  const agora = new Date();
  if (ehSabado(agora)) return NextResponse.json({ ok: true, sabado: true, enviados: 0 });

  const db = supabaseAdmin();
  const limite = agora.toISOString();
  const { data: convs, error } = await db
    .from("conversas")
    .select("id, pessoa_id, estado, contexto, pessoas!inner(whatsapp, optout_em)")
    .eq("canal", "whatsapp").eq("estado", "robo")
    .or(`contexto->>proximaLicaoEm.lte.${limite},contexto->>lembreteEm.lte.${limite}`)
    .limit(100);
  if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });

  let enviados = 0;
  for (const c of convs ?? []) {
    const pessoa = (Array.isArray(c.pessoas) ? c.pessoas[0] : c.pessoas) as { whatsapp: string; optout_em: string | null };
    if (!pessoa?.whatsapp || pessoa.optout_em) continue;
    const estado: Estado = { ...estadoInicial(), ...(c.contexto as Partial<Estado>) };
    const r = tique(estado, agora);
    if (!r) continue;
    try {
      const sessao = { pessoaId: c.pessoa_id, conversaId: c.id, estado, estadoConversa: c.estado, whatsapp: pessoa.whatsapp };
      const extras = await aplicarAcoes(db, sessao, r.acoes, r);
      await salvarEstado(db, c.id, r.estado);
      const saidas = [...r.saidas, ...extras];
      for (const s of saidas) await registrarMensagem(db, c.id, "robo", s.texto);
      await enviarSaidas(pessoa.whatsapp, saidas);
      enviados++;
    } catch (e) { console.error("[cron robo]", c.id, e); }
  }
  return NextResponse.json({ ok: true, enviados });
}
