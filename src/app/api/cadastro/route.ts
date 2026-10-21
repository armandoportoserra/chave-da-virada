import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";
import { normalizarWhatsapp } from "@/lib/telefone";
import { CONSENT_VERSAO } from "@/lib/consent";
import { avisarIgreja } from "@/lib/aviso";

const schema = z.object({
  nome: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(8).max(20),
  quer_livro: z.boolean().optional().default(false),
  quer_curso: z.boolean().optional().default(false),
  quer_oracao: z.boolean().optional().default(false),
  quer_contato: z.boolean().optional().default(false),
  consent: z.literal(true),
  rota: z.string().trim().max(10).optional(),
  origem: z.enum(["folder", "site", "whatsapp", "indicacao", "congresso", "outro"]).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  // honeypot anti-spam: deve vir vazio
  site: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Confira o nome, o WhatsApp e o consentimento." }, { status: 400 });
  }
  const d = parsed.data;
  const whatsapp = normalizarWhatsapp(d.whatsapp);
  if (!whatsapp) {
    return NextResponse.json({ erro: "WhatsApp inválido. Use DDD + número, ex.: (54) 99999-9999." }, { status: 400 });
  }
  if (!d.quer_livro && !d.quer_curso && !d.quer_oracao && !d.quer_contato) {
    return NextResponse.json({ erro: "Escolha ao menos uma opção." }, { status: 400 });
  }

  if (!supabaseConfigurado()) {
    // Modo de desenvolvimento sem banco: não perder o cadastro, registrar no log.
    console.warn("[cadastro] Supabase não configurado; cadastro recebido:", { ...d, whatsapp });
    return NextResponse.json({ ok: true, modo: "sem_banco" });
  }

  const sb = supabaseAdmin();
  const origem = d.origem ?? (d.rota ? "folder" : "site");
  const { data: pessoa, error } = await sb
    .from("pessoas")
    .upsert(
      {
        nome: d.nome,
        whatsapp,
        origem,
        rota_codigo: d.rota || null,
        quer_livro: d.quer_livro,
        quer_curso: d.quer_curso,
        quer_oracao: d.quer_oracao,
        quer_contato: d.quer_contato,
        consent_versao: CONSENT_VERSAO,
        consent_em: new Date().toISOString(),
        estagio: "interesse",
        utm: d.utm ?? null,
        ultimo_contato: new Date().toISOString(),
      },
      { onConflict: "whatsapp" },
    )
    .select("id")
    .single();

  if (error || !pessoa) {
    console.error("[cadastro] erro ao gravar", error);
    return NextResponse.json({ erro: "Não conseguimos gravar agora. Tente de novo em instantes." }, { status: 500 });
  }

  await sb.from("eventos").insert({ pessoa_id: pessoa.id, nome: "cadastro", dados: { origem, rota: d.rota ?? null } });

  if (d.quer_livro) await sb.from("tarefas").insert({ pessoa_id: pessoa.id, tipo: "livro", descricao: "Enviar o livro gratuito (PDF) pelo WhatsApp." });
  if (d.quer_contato) {
    await sb.from("tarefas").insert({ pessoa_id: pessoa.id, tipo: "visita", prioridade: 5, descricao: `${d.nome} pediu uma visita (cadastro do site).` });
    await avisarIgreja("pedido de visita (cadastro)", `${d.nome} · ${whatsapp}${d.rota ? ` · rota ${d.rota}` : ""}`);
  }
  if (d.quer_livro || d.quer_curso || d.quer_oracao) await avisarIgreja("novo cadastro", `${d.nome} · ${whatsapp} · ${[d.quer_livro && "livro", d.quer_curso && "curso", d.quer_oracao && "oração"].filter(Boolean).join(", ")}`);

  return NextResponse.json({ ok: true, id: pessoa.id });
}
