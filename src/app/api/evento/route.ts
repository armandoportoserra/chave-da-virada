import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";

// Registro leve de eventos do site (ex.: lição aberta), sem rastreador externo.
const schema = z.object({
  nome: z.enum(["licao_aberta", "livro_aberto", "visita_landing"]),
  pessoaId: z.string().uuid().nullable().optional(),
  dados: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  if (!supabaseConfigurado()) return NextResponse.json({ ok: true, modo: "sem_banco" });
  const d = parsed.data;
  await supabaseAdmin().from("eventos").insert({ pessoa_id: d.pessoaId ?? null, nome: d.nome, dados: d.dados ?? null });
  return NextResponse.json({ ok: true });
}
