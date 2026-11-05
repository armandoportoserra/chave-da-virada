import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";
import { CONSENT_VERSAO } from "@/lib/consent";

const schema = z.object({
  curso: z.union([z.literal(1), z.literal(2)]).optional().default(1),
  nome: z.string().trim().min(2).max(120),
  consent: z.literal(true),
  concluidas: z.array(z.number().int().min(1).max(21)).min(20),
  pontos: z.number().int().min(0),
  acertos: z.number().int().min(0).max(168),
  quer_curso2: z.boolean().optional().default(false),
  site: z.string().max(0).optional(),
});
function avaliacao(a: number) { return a >= 90 ? "Com louvor" : a >= 75 ? "Muito bom" : a >= 60 ? "Concluído" : "Concluído com dedicação"; }

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Confira o nome e a ciência da privacidade. O certificado só sai com todas as lições concluídas." }, { status: 400 });
  const d = parsed.data;
  const N = d.curso === 2 ? 21 : 20;
  if (new Set(d.concluidas).size < N) return NextResponse.json({ erro: `O certificado só sai com as ${N} lições concluídas.` }, { status: 400 });
  const aprov = Math.min(100, Math.round((100 * d.acertos) / (N * 8)));
  const av = avaliacao(aprov);
  if (!supabaseConfigurado()) return NextResponse.json({ ok: true, codigo: "CV-DEMO", avaliacao: av, aproveitamento: aprov, modo: "sem_banco" });

  const db = supabaseAdmin();
  const { data: pessoa, error } = await db.from("pessoas").insert({ nome: d.nome, origem: "site", quer_curso: true, consent_versao: CONSENT_VERSAO, consent_em: new Date().toISOString(), estagio: "conclusao" }).select("id").single();
  if (error || !pessoa) return NextResponse.json({ erro: "Não conseguimos emitir agora. Tente de novo em instantes." }, { status: 500 });
  const { data: existente } = await db.from("certificados").select("codigo, avaliacao, nota_final").eq("pessoa_id", pessoa.id).eq("curso", d.curso).eq("revogado", false).maybeSingle();
  if (existente) return NextResponse.json({ ok: true, codigo: existente.codigo, avaliacao: existente.avaliacao, aproveitamento: Math.round(Number(existente.nota_final) * 10), pessoaId: pessoa.id });
  const { data: cod } = await db.rpc("proximo_codigo_certificado");
  const codigo = String(cod);
  await db.from("certificados").insert({ codigo, pessoa_id: pessoa.id, curso: d.curso, nome_impresso: d.nome, nota_final: aprov / 10, avaliacao: av });
  if (d.curso === 1) for (const n of d.concluidas) await db.from("progresso").upsert({ pessoa_id: pessoa.id, estudo: n, canal: "site", concluido_em: new Date().toISOString() }, { onConflict: "pessoa_id,estudo", ignoreDuplicates: true });
  await db.from("eventos").insert({ pessoa_id: pessoa.id, nome: "certificado_emitido", dados: { codigo, curso: d.curso, quer_curso2: d.quer_curso2 } });
  return NextResponse.json({ ok: true, codigo, avaliacao: av, aproveitamento: aprov, pessoaId: pessoa.id });
}
