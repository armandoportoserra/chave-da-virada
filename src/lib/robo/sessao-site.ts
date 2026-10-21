// Sessão do robô no site: identificada por um id aleatório guardado em cookie.
// Com Supabase: pessoas.sessao_site + conversas (canal 'site'). Sem Supabase: memória do processo (só para testar).
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin, supabaseConfigurado } from "../supabase-server";
import { estadoInicial, type Estado, type Resultado, type Saida } from "./tipos";
import { aplicarAcoes, registrarMensagem, salvarEstado, type Sessao } from "./persistencia";
import { marcarLembrete, processar } from "./motor";

const memoria = new Map<string, { estado: Estado }>();

async function carregar(db: SupabaseClient, sessaoId: string): Promise<Sessao> {
  let { data: pessoa } = await db.from("pessoas").select("id").eq("sessao_site", sessaoId).maybeSingle();
  if (!pessoa) {
    const ins = await db.from("pessoas").insert({ sessao_site: sessaoId, origem: "site", quer_curso: true }).select("id").single();
    if (ins.error) throw ins.error; pessoa = ins.data;
  }
  let { data: conv } = await db.from("conversas").select("id, estado, contexto").eq("pessoa_id", pessoa.id).eq("canal", "site").order("aberta_em", { ascending: false }).limit(1).maybeSingle();
  if (!conv) {
    const ins = await db.from("conversas").insert({ pessoa_id: pessoa.id, canal: "site", estado: "robo", fluxo: "curso", contexto: estadoInicial() }).select("id, estado, contexto").single();
    if (ins.error) throw ins.error; conv = ins.data;
  }
  return { pessoaId: pessoa.id, conversaId: conv.id, estado: { ...estadoInicial(), ...(conv.contexto as Partial<Estado>) }, estadoConversa: conv.estado, whatsapp: "" };
}

export interface RespostaSite { saidas: Saida[]; fase: string }

export async function atenderSite(sessaoId: string, texto: string, botaoId: string | undefined, concluidas: number[]): Promise<RespostaSite> {
  if (!supabaseConfigurado()) {
    const m = memoria.get(sessaoId) ?? { estado: estadoInicial() };
    const r = processar(m.estado, { texto, botaoId, canal: "site", concluidas });
    m.estado = r.estado; memoria.set(sessaoId, m);
    return { saidas: r.saidas, fase: r.estado.fase };
  }
  const db = supabaseAdmin();
  const s = await carregar(db, sessaoId);
  await registrarMensagem(db, s.conversaId, "pessoa", texto, botaoId ? { botaoId } : undefined);
  const r: Resultado = processar(s.estado, { texto, botaoId, canal: "site", concluidas });
  const extras = await aplicarAcoes(db, s, r.acoes, r);
  const saidas = [...r.saidas, ...extras];
  r.estado = marcarLembrete(r.estado, new Date());
  await salvarEstado(db, s.conversaId, r.estado);
  for (const sd of saidas) await registrarMensagem(db, s.conversaId, "robo", sd.texto, sd.botoes || sd.link ? { botoes: sd.botoes, link: sd.link } : undefined);
  return { saidas, fase: r.estado.fase };
}
