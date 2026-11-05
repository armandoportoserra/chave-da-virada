import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";
import { detectarCrise } from "@/lib/robo/crise";
import { avisarIgreja } from "@/lib/aviso";

const schema = z.object({
  pedido: z.string().trim().min(3).max(3000),
  site: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Escreva o pedido (pelo menos 3 letras)." }, { status: 400 });
  const d = parsed.data;
  // Pedido anônimo e automático: sem nome, sem telefone, sem visita.
  const crise = detectarCrise(d.pedido);
  if (!supabaseConfigurado()) return NextResponse.json({ ok: true, crise, modo: "sem_banco" });
  const db = supabaseAdmin();
  await db.from("pedidos_oracao").insert({ pessoa_id: null, nome: null, pedido: d.pedido, modalidade: "distancia" });
  if (crise) await avisarIgreja("sinal de crise (pedido de oração anônimo)", `"${d.pedido.slice(0, 300)}" — a pessoa recebeu acolhimento automático; não há contato.`);
  await db.from("eventos").insert({ pessoa_id: null, nome: "pedido_oracao_site", dados: { crise } });
  return NextResponse.json({ ok: true, crise });
}
