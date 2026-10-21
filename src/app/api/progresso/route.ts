import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";

const schema = z.object({ pessoaId: z.string().uuid().nullable().optional(), licao: z.number().int().min(1).max(20), pontos: z.number().int().min(0).max(200), acertos: z.number().int().min(0).max(10) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  const d = parsed.data;
  if (!supabaseConfigurado()) return NextResponse.json({ ok: true, modo: "sem_banco" });
  const db = supabaseAdmin();
  await db.from("eventos").insert({ pessoa_id: d.pessoaId ?? null, nome: "estudo_concluido_site", dados: { licao: d.licao, pontos: d.pontos, acertos: d.acertos } });
  if (d.pessoaId) {
    await db.from("progresso").upsert({ pessoa_id: d.pessoaId, estudo: d.licao, canal: "site", concluido_em: new Date().toISOString(), nota: Math.round((d.acertos / 8) * 5), tentativas: 1 }, { onConflict: "pessoa_id,estudo" });
    await db.rpc("somar_pontos", { p_pessoa: d.pessoaId, p_delta: d.pontos });
    await db.from("pessoas").update({ estagio: d.licao >= 20 ? "conclusao" : "engajamento", ultimo_contato: new Date().toISOString() }).eq("id", d.pessoaId);
  }
  return NextResponse.json({ ok: true });
}
