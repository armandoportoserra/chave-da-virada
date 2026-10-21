// Liga o motor puro ao Supabase: carrega estado, aplica ações, salva, registra mensagens.
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../supabase-server";
import { estadoInicial, type Acao, type Estado, type Resultado, type Saida } from "./tipos";
import { marcarLembrete } from "./motor";
import { avisarIgreja } from "../aviso";

export interface Sessao { pessoaId: string; conversaId: string; estado: Estado; estadoConversa: string; whatsapp: string }

export async function carregarSessao(db: SupabaseClient, whatsapp: string, nomePerfil?: string): Promise<Sessao> {
  let { data: pessoa } = await db.from("pessoas").select("id, optout_em").eq("whatsapp", whatsapp).maybeSingle();
  if (!pessoa) {
    const ins = await db.from("pessoas").insert({ whatsapp, origem: "whatsapp", nome: nomePerfil ?? null, quer_curso: true }).select("id, optout_em").single();
    if (ins.error) throw ins.error;
    pessoa = ins.data;
  }
  let { data: conv } = await db.from("conversas").select("id, estado, contexto").eq("pessoa_id", pessoa.id).eq("canal", "whatsapp").order("aberta_em", { ascending: false }).limit(1).maybeSingle();
  if (!conv) {
    const ins = await db.from("conversas").insert({ pessoa_id: pessoa.id, canal: "whatsapp", estado: "robo", fluxo: "curso", contexto: estadoInicial() }).select("id, estado, contexto").single();
    if (ins.error) throw ins.error;
    conv = ins.data;
  }
  const estado: Estado = { ...estadoInicial(), ...(conv.contexto as Partial<Estado>) };
  return { pessoaId: pessoa.id, conversaId: conv.id, estado, estadoConversa: conv.estado, whatsapp };
}

export async function registrarMensagem(db: SupabaseClient, conversaId: string, autor: "pessoa" | "robo" | "humano" | "sistema", texto: string, meta?: unknown) {
  await db.from("mensagens").insert({ conversa_id: conversaId, autor, texto, meta: meta ?? null });
}

/** Aplica as ações do motor no banco e devolve saídas extras (ex.: link do certificado). */
export async function aplicarAcoes(db: SupabaseClient, s: Sessao, acoes: Acao[], r: Resultado): Promise<Saida[]> {
  const extras: Saida[] = [];
  let estadoConversa: string | null = null;
  let prioridade: number | null = null;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  for (const a of acoes) {
    switch (a.tipo) {
      case "crise":
        estadoConversa = "crise"; prioridade = 9;
        await db.from("tarefas").insert({ pessoa_id: s.pessoaId, tipo: "crise", prioridade: 9, descricao: `Sinal de crise (robô respondeu com 188/192). Texto: "${a.texto.slice(0, 300)}"` });
        await avisarIgreja("sinal de crise", `${r.estado.nome ?? "Pessoa"} (${s.whatsapp || "site"}) escreveu algo que indica risco. O robô deu 188/192 e ofereceu visita.`);
        await db.from("eventos").insert({ pessoa_id: s.pessoaId, nome: "crise" });
        break;
      case "oracao":
        await db.from("pedidos_oracao").insert({ pessoa_id: s.pessoaId, nome: r.estado.nome, pedido: a.pedido, modalidade: "distancia" });
        await db.from("pessoas").update({ quer_oracao: true }).eq("id", s.pessoaId);
        break;
      case "tarefa":
        await db.from("tarefas").insert({ pessoa_id: s.pessoaId, tipo: a.subtipo, prioridade: a.subtipo === "visita" ? 5 : 2, descricao: a.descricao });
        if (a.subtipo === "visita") {
          await db.from("pessoas").update({ estagio: "transformacao", quer_contato: true }).eq("id", s.pessoaId);
          await avisarIgreja("pedido de visita", `${a.descricao}\nContato: ${s.whatsapp || "pelo site (sem WhatsApp informado)"}`);
        }
        break;
      case "pontos":
        await db.rpc("somar_pontos", { p_pessoa: s.pessoaId, p_delta: a.delta });
        break;
      case "selo":
        await db.from("conquistas").upsert({ pessoa_id: s.pessoaId, selo: a.codigo }, { onConflict: "pessoa_id,selo", ignoreDuplicates: true });
        break;
      case "licao_concluida":
        await db.from("progresso").upsert({ pessoa_id: s.pessoaId, estudo: a.numero, canal: "whatsapp", concluido_em: new Date().toISOString(), nota: a.acertou === null ? null : a.acertou ? 5 : 3, tentativas: 1 }, { onConflict: "pessoa_id,estudo" });
        await db.from("pessoas").update({ estagio: a.numero >= 20 ? "conclusao" : "engajamento", ultimo_contato: new Date().toISOString() }).eq("id", s.pessoaId);
        await db.from("eventos").insert({ pessoa_id: s.pessoaId, nome: "estudo_concluido", dados: { numero: a.numero } });
        break;
      case "certificado": {
        const { data: cod } = await db.rpc("proximo_codigo_certificado");
        const codigo = String(cod);
        await db.from("certificados").insert({ codigo, pessoa_id: s.pessoaId, nome_impresso: a.nome, nota_final: a.aproveitamento / 10, avaliacao: a.avaliacao });
        r.estado = { ...r.estado, certificado: codigo };
        extras.push({ texto: `🎓 Seu certificado (código *${codigo}*):\n${site}/certificado/${codigo}\n\nPode abrir, salvar em PDF ou imprimir. Qualquer pessoa pode conferir a autenticidade pelo código.` });
        break;
      }
      case "optout":
        await db.from("pessoas").update({ optout_em: new Date().toISOString() }).eq("id", s.pessoaId);
        estadoConversa = "encerrada";
        break;
      case "evento":
        await db.from("eventos").insert({ pessoa_id: s.pessoaId, nome: a.nome, dados: a.dados ?? null });
        if (a.nome === "primeiro_contato") await db.from("pessoas").update({ estagio: "interesse" }).eq("id", s.pessoaId);
        break;
    }
  }
  if (r.estado.nome) await db.from("pessoas").update({ nome: r.estado.nome }).eq("id", s.pessoaId);
  const upd: Record<string, unknown> = { contexto: r.estado };
  if (estadoConversa) upd.estado = estadoConversa;
  if (prioridade !== null) upd.prioridade = prioridade;
  await db.from("conversas").update(upd).eq("id", s.conversaId);
  return extras;
}

export async function salvarEstado(db: SupabaseClient, conversaId: string, estado: Estado) {
  await db.from("conversas").update({ contexto: estado }).eq("id", conversaId);
}

/** Processa uma mensagem recebida de ponta a ponta. Retorna as saídas a enviar. */
export async function atenderMensagem(whatsapp: string, texto: string, botaoId: string | undefined, nomePerfil: string | undefined, processar: (e: Estado, entrada: { texto: string; botaoId?: string }) => Resultado): Promise<Saida[]> {
  const db = supabaseAdmin();
  const s = await carregarSessao(db, whatsapp, nomePerfil);
  await registrarMensagem(db, s.conversaId, "pessoa", texto, botaoId ? { botaoId } : undefined);

  const r = processar(s.estado, { texto, botaoId });
  const extras = await aplicarAcoes(db, s, r.acoes, r);
  const saidas = [...r.saidas, ...extras];
  r.estado = marcarLembrete(r.estado, new Date());
  await salvarEstado(db, s.conversaId, r.estado);
  for (const sd of saidas) await registrarMensagem(db, s.conversaId, "robo", sd.texto, sd.botoes ? { botoes: sd.botoes } : undefined);
  return saidas;
}
