import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";
import { normalizarWhatsapp } from "@/lib/telefone";
import { CONSENT_VERSAO } from "@/lib/consent";
import { detectarCrise } from "@/lib/robo/crise";
import { avisarIgreja } from "@/lib/aviso";

const schema = z.object({
  nome: z.string().trim().max(120).optional().default(""),
  whatsapp: z.string().trim().max(20).optional().default(""),
  pedido: z.string().trim().min(3).max(3000),
  modalidade: z.enum(["distancia", "visita"]).default("distancia"),
  bairro: z.string().trim().max(200).optional().default(""),
  consent: z.boolean().optional().default(false),
  site: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Escreva o pedido (pelo menos 3 letras)." }, { status: 400 });
  const d = parsed.data;
  const whatsapp = d.whatsapp ? normalizarWhatsapp(d.whatsapp) : null;
  if (d.whatsapp && !whatsapp) return NextResponse.json({ erro: "WhatsApp inválido. Use DDD + número." }, { status: 400 });
  if (d.modalidade === "visita" && (!whatsapp || !d.consent)) return NextResponse.json({ erro: "Para a visita, precisamos do seu WhatsApp e do seu consentimento." }, { status: 400 });
  const crise = detectarCrise(d.pedido);
  if (!supabaseConfigurado()) return NextResponse.json({ ok: true, crise, modo: "sem_banco" });

  const db = supabaseAdmin();
  let pessoaId: string | null = null;
  if (whatsapp) {
    const { data } = await db.from("pessoas").upsert({ nome: d.nome || null, whatsapp, origem: "site", quer_oracao: true, quer_contato: d.modalidade === "visita", consent_versao: d.consent ? CONSENT_VERSAO : null, consent_em: d.consent ? new Date().toISOString() : null, ultimo_contato: new Date().toISOString() }, { onConflict: "whatsapp" }).select("id").single();
    pessoaId = data?.id ?? null;
  }
  await db.from("pedidos_oracao").insert({ pessoa_id: pessoaId, nome: d.nome || null, pedido: d.pedido, modalidade: d.modalidade });
  if (crise) { await db.from("tarefas").insert({ pessoa_id: pessoaId, tipo: "crise", prioridade: 9, descricao: `Sinal de crise em pedido de oração${d.nome ? ` (${d.nome})` : ""}: "${d.pedido.slice(0, 300)}"` }); await avisarIgreja("sinal de crise (pedido de oração)", `${d.nome || "Anônimo"} ${whatsapp ?? ""}: "${d.pedido.slice(0, 300)}"`); }
  if (d.modalidade === "visita") { await db.from("tarefas").insert({ pessoa_id: pessoaId, tipo: "visita", prioridade: 5, descricao: `${d.nome} quer uma visita — ${d.bairro}` }); await avisarIgreja("pedido de visita", `${d.nome} · ${whatsapp} · ${d.bairro}\nPedido: "${d.pedido.slice(0, 300)}"`); }
  await db.from("eventos").insert({ pessoa_id: pessoaId, nome: "pedido_oracao_site", dados: { modalidade: d.modalidade, crise } });
  return NextResponse.json({ ok: true, crise });
}
