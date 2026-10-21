// Motor do robô "Esperança" — máquina de estados pura.
// processar(estado, entrada) => { estado, saidas, acoes }. Sem banco, sem rede: testável.

import licoesJson from "../../content/licoes.json";
import jogoJson from "../../content/curso_jogo.json";
import type { Acao, Aguardando, Entrada, Estado, Licao, MensagemLicao, Resultado, Saida } from "./tipos";
import { detectarCrise, mensagemCrise } from "./crise";
import { proximoEnvio } from "./sabado";

export const LICOES: Licao[] = licoesJson as Licao[];
export const licao = (n: number): Licao => LICOES[n - 1];
export const TOTAL = LICOES.length;

const LIVRO_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "") + "/livro/a-chave-da-virada.pdf";
const CVV = "Se estiver pensando em desistir da vida, ligue *188* (CVV, 24h, gratuito) ou acesse cvv.org.br. E, se quiser que alguém da igreja te visite, escreva *visita*.";
const SELO_BLOCO: Record<number, string> = { 1: "bloco1", 2: "bloco2", 3: "bloco3", 4: "bloco4", 5: "bloco5" };
const NOME_BLOCO: Record<number, string> = { 1: "Esperança", 2: "Você e Deus", 3: "Jesus", 4: "Uma vida inteira", 5: "O futuro" };

// ---------- utilidades ------------------------------------------------------
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** Título de botão do WhatsApp: máx. 20 caracteres. */
export function tituloBotao(label: string): string {
  const mapa: Record<string, string> = {
    "Quero que orem por mim": "Orem por mim",
    "Quero uma visita": "Quero uma visita",
    "Quero uma visita do pastor": "Visita do pastor",
    "Quero me preparar para o batismo": "Preparar batismo",
    "Quero conversar com o pastor antes": "Falar com o pastor",
    "Ainda não, mas quero continuar perto": "Ainda não, continuar",
    "Quero meu certificado": "Meu certificado",
    "Quero conhecer a igreja": "Conhecer a igreja",
    "Quero ir no sábado": "Ir no sábado",
    "Quero a última lição": "Última lição",
    "Eu aceitei": "Eu aceitei",
  };
  if (mapa[label]) return mapa[label];
  let t = label.replace(/^Quero (começar o |a |me )?/i, "").replace(/^o /, "");
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t.length <= 20 ? t : t.slice(0, 19) + "…";
}

function botoes(labels: string[], prefixo: string): Saida["botoes"] {
  return labels.map((l, i) => ({ id: `${prefixo}:${i}`, titulo: tituloBotao(l) }));
}

function nomeOu(e: Estado, fallback = "") { return e.nome ?? fallback; }
function iso(d: Date) { return d.toISOString(); }

/** Qual botão (índice) a pessoa escolheu, por id ou por texto aproximado. */
function escolha(entrada: Entrada, opcoes: string[], prefixo: string): number | null {
  if (entrada.botaoId?.startsWith(prefixo + ":")) {
    const i = Number(entrada.botaoId.split(":")[1]);
    if (!Number.isNaN(i) && i < opcoes.length) return i;
  }
  const t = norm(entrada.texto);
  if (/^[1-9]$/.test(t)) { const i = Number(t) - 1; if (i < opcoes.length) return i; }
  for (let i = 0; i < opcoes.length; i++) {
    const o = norm(opcoes[i]); const tb = norm(tituloBotao(opcoes[i]));
    if (t === o || t === tb || (t.length >= 4 && (o.includes(t) || tb.includes(t)))) return i;
  }
  return null;
}

// ---------- intenções globais (valem em qualquer fase) -----------------------
type Intencao = "optout" | "visita" | "oracao" | "menu" | "continuar" | "pontos" | "ajuda" | "livro" | null;
function intencaoGlobal(texto: string): Intencao {
  const t = norm(texto);
  if (/^(sair|parar|pare|cancelar|descadastrar|nao quero mais|remover)$/.test(t) || /nao (quero|me mande) mais (mensagem|nada)/.test(t)) return "optout";
  if (/\b(visita|visitar|me buscar|ir no sabado|conhecer a igreja|falar com (o )?pastor|batismo|quero ser visitad)/.test(t)) return "visita";
  if (/\b(orem por mim|ora(cao|r) por mim|pedido de oracao|quero oracao|orem)\b/.test(t)) return "oracao";
  if (/^(menu|opcoes|inicio|oi|ola|bom dia|boa tarde|boa noite)$/.test(t)) return "menu";
  if (/\b(continuar|proxima|proxima licao|licao|estudo|quero a licao|comecar|bloco)\b/.test(t)) return "continuar";
  if (/\b(meus pontos|pontos|selos|certificado|quanto tenho)\b/.test(t)) return "pontos";
  if (/\b(livro|pdf|ebook|e-book)\b/.test(t)) return "livro";
  if (/^(ajuda|help|\?)$/.test(t)) return "ajuda";
  return null;
}

// ---------- blocos de saída -----------------------------------------------
function menu(e: Estado): Saida {
  const n = nomeOu(e);
  const prox = e.concluidas.length >= TOTAL ? null : e.licaoAtual;
  const texto = e.concluidas.length === 0
    ? `${n ? n + ", o" : "O"} que você quer agora?`
    : `${n ? n + ", v" : "V"}ocê está na lição ${prox} de ${TOTAL} (${e.pontos} pontos). O que quer agora?`;
  return { texto, botoes: botoes([prox ? `Quero a lição ${prox}` : "Quero meu certificado", "Quero que orem por mim", "Quero uma visita"], "menu") };
}

function primeiraMensagem(): Saida {
  return { texto: "Oi. Eu sou a *Esperança*, assistente da igreja Nova Esperança, em Caxias do Sul. Sou automática: respondo a qualquer hora, de madrugada também. Se um dia quiser receber a visita de alguém da igreja, é só escrever *visita*.\n\nComo posso te chamar?" };
}

const HUMORES = ["Cansado(a), sem forças", "Sozinho(a)", "Com uma dor que não passa", "Curioso(a), só quero conhecer", "Prefiro não dizer agora"];
function perguntaHumor(e: Estado): Saida {
  return {
    texto: `${nomeOu(e)}, antes de qualquer coisa: como você está hoje, de verdade?\n\n1️⃣ Cansado(a), sem forças\n2️⃣ Sozinho(a)\n3️⃣ Com uma dor que não passa\n4️⃣ Curioso(a), só quero conhecer\n5️⃣ Prefiro não dizer agora\n\n(Responda com o número.)`,
  };
}

/** Entrega a lição até o ponto em que precisa de resposta. */
function entregarLicao(e: Estado, saidas: Saida[], acoes: Acao[], apartirMsg = 1): Estado {
  const L = licao(e.licaoAtual);
  let est: Estado = { ...e, fase: "licao", aguardando: null };
  if (apartirMsg === 1) {
    acoes.push({ tipo: "evento", nome: "licao_iniciada", dados: { numero: L.numero } });
    est.tentativasQuiz = 0;
  }
  for (const m of L.mensagens) {
    if (m.n < apartirMsg) continue;
    const texto = m.texto.replace(/\[nome\]/g, nomeOu(est, "amigo(a)"));
    if (m.tipo === "quiz" && L.quiz) {
      saidas.push({ texto: `*Quiz leve — vale 100 pontos, pode errar.*\n${L.quiz.pergunta}`, botoes: L.quiz.alternativas.map((a, i) => ({ id: `quiz:${i}`, titulo: a.length <= 20 ? a : a.slice(0, 19) + "…" })) });
      saidas[saidas.length - 1].texto += "\n\n" + L.quiz.alternativas.map((a, i) => `${"ABCD"[i]}) ${a}`).join("\n");
      return { ...est, fase: "aguardando", aguardando: "quiz" };
    }
    if (m.tipo === "exercicio" || m.tipo === "decisao") {
      saidas.push({ texto, botoes: m.opcoes ? botoes(m.opcoes, m.tipo) : undefined });
      return { ...est, fase: "aguardando", aguardando: m.tipo as Aguardando };
    }
    if (m.tipo === "fechamento") {
      saidas.push({ texto });
      saidas.push({ texto: CVV, botoes: botoes(L.botoes, "final") });
      est = concluirLicao(est, acoes);
      return { ...est, fase: "aguardando", aguardando: "final" };
    }
    saidas.push({ texto });
  }
  return est;
}

function concluirLicao(e: Estado, acoes: Acao[]): Estado {
  const L = licao(e.licaoAtual);
  const est = { ...e, concluidas: Array.from(new Set([...e.concluidas, L.numero])) };
  acoes.push({ tipo: "licao_concluida", numero: L.numero, acertou: L.quiz ? e.tentativasQuiz === 1 : null });
  // bloco completo?
  const doBloco = LICOES.filter((x) => x.bloco === L.bloco).map((x) => x.numero);
  const codigo = SELO_BLOCO[L.bloco];
  if (doBloco.every((n) => est.concluidas.includes(n)) && !est.selos.includes(codigo)) {
    est.selos = [...est.selos, codigo];
    est.pontos += 400;
    acoes.push({ tipo: "selo", codigo });
    acoes.push({ tipo: "pontos", delta: 400, motivo: `Selo ${NOME_BLOCO[L.bloco]}` });
  }
  return est;
}

/** Depois do fechamento: avança o ponteiro; se era a 20ª, emite certificado. */
function avancar(e: Estado, saidas: Saida[], acoes: Acao[]): Estado {
  if (e.concluidas.length >= TOTAL) return emitirCertificado(e, saidas, acoes);
  const prox = Math.min(TOTAL, Math.max(...e.concluidas, 0) + 1);
  return { ...e, licaoAtual: prox, aguardando: null, fase: "menu" };
}

function avaliacao(aprov: number) {
  return aprov >= 90 ? "Com louvor" : aprov >= 75 ? "Muito bom" : aprov >= 60 ? "Concluído" : "Concluído com dedicação";
}

function emitirCertificado(e: Estado, saidas: Saida[], acoes: Acao[]): Estado {
  if (e.certificado) {
    saidas.push({ texto: `Seu certificado já foi emitido: código *${e.certificado}*. Se quiser a versão impressa, é só dizer *pessoa*.` });
    return { ...e, fase: "concluido", aguardando: null };
  }
  const aprov = e.quizzesFeitos ? Math.round((100 * e.acertosPrimeira) / e.quizzesFeitos) : 100;
  const av = avaliacao(aprov);
  acoes.push({ tipo: "certificado", nome: nomeOu(e, "Participante"), aproveitamento: aprov, avaliacao: av });
  saidas.push({ texto: `🎓 *${nomeOu(e, "Você")}, você concluiu o curso A Chave da Virada.*\n\nPontos: *${e.pontos}* · Selos: ${e.selos.length}/5 · Aproveitamento: *${aprov}%* — ${av}.\n\nSeu certificado chega em instantes com um link para ver e imprimir. Se quiser a versão impressa entregue em casa, escolha a visita.` });
  saidas.push({ texto: "E agora? A porta não fecha.", botoes: botoes(["Quero uma visita", "Quero continuar estudando", "Quero o Curso 2"], "pos") });
  return { ...e, fase: "concluido", aguardando: null, certificado: "pendente" };
}

/** Único ponto de contato humano: a pessoa pede uma visita. */
function iniciarVisita(e: Estado, saidas: Saida[], acoes: Acao[], emCrise: boolean, tipo: "visita" | "pastor" | "batismo" = "visita"): Resultado {
  const motivo = tipo === "batismo" ? "para combinar o preparo para o batismo" : tipo === "pastor" ? "do pastor" : "";
  saidas.push({ texto: `${emCrise ? "Que bom que você pediu. " : ""}Para a igreja Nova Esperança combinar a visita${motivo ? " " + motivo : ""}: me diga o *bairro*, o *melhor horário* e, se ainda não tiver dito, um *WhatsApp* para contato. Pode ser tudo numa mensagem só.` });
  acoes.push({ tipo: "evento", nome: "visita_iniciada", dados: { tipo, emCrise } });
  return { estado: { ...e, fase: "visita", aguardando: null }, saidas, acoes };
}

// ---------- processamento principal -----------------------------------------
export function processar(estadoAnterior: Estado, entrada: Entrada): Resultado {
  const agora = entrada.agora ?? new Date();
  const saidas: Saida[] = [];
  const acoes: Acao[] = [];
  let e: Estado = { ...estadoAnterior, ultimaEntrada: iso(agora), lembreteEm: null };
  const texto = entrada.texto ?? "";
  const site = entrada.canal === "site";
  if (site && entrada.concluidas?.length) {
    const concl = Array.from(new Set([...e.concluidas, ...entrada.concluidas])).sort((a, b) => a - b);
    e = { ...e, concluidas: concl, licaoAtual: Math.min(TOTAL, Math.max(...concl, 0) + 1) };
  }

  // 0. Crise — antes de tudo, em qualquer fase (inclusive durante quiz).
  if (detectarCrise(texto)) {
    saidas.push({ texto: mensagemCrise(e.nome) });
    acoes.push({ tipo: "crise", texto });
    return { estado: { ...e, fase: "crise", aguardando: null, proximaLicaoEm: null }, saidas, acoes };
  }
  if (e.fase === "crise") {
    // sem fluxo, sem pontos: só presença, 188 e a porta da visita
    if (intencaoGlobal(texto) === "visita") return iniciarVisita(e, saidas, acoes, true);
    saidas.push({ texto: "Estou aqui. Se precisar agora: *188* (CVV, 24h) ou *192* (SAMU). Se quiser que alguém da igreja vá até você, escreva *visita*. Quando quiser continuar as lições, escreva *lição*." });
    if (/\b(licao|continuar|estou bem|melhor|passou)\b/.test(norm(texto))) return { estado: { ...e, fase: "menu" }, saidas: [{ texto: `Que bom, ${nomeOu(e, "amigo(a)")}. Vamos devagar.` }, menu(e)], acoes };
    return { estado: e, saidas, acoes };
  }
  if (e.fase === "visita") {
    const dados = texto.trim();
    if (dados.length < 5) { saidas.push({ texto: "Me diga o bairro e o melhor horário (e o WhatsApp, se ainda não tiver dito)." }); return { estado: e, saidas, acoes }; }
    acoes.push({ tipo: "tarefa", subtipo: "visita", descricao: `${nomeOu(e, "Pessoa")} quer uma visita — ${dados.slice(0, 300)}` });
    acoes.push({ tipo: "evento", nome: "pediu_visita" });
    saidas.push({ texto: `Anotado, ${nomeOu(e, "amigo(a)")}. A igreja Nova Esperança vai entrar em contato para combinar a visita. Não precisa preparar nada.` });
    const volta = e.concluidas.length >= TOTAL ? "concluido" : "menu";
    if (volta === "menu") saidas.push(menu(e));
    return { estado: { ...e, fase: volta }, saidas, acoes };
  }
  if (e.fase === "optout") {
    if (/^(voltar|quero voltar|continuar)$/.test(norm(texto))) {
      saidas.push({ texto: `Que bom te ver de novo, ${nomeOu(e, "amigo(a)")}. Continuamos de onde parou.` }, menu(e));
      return { estado: { ...e, fase: "menu" }, saidas, acoes };
    }
    return { estado: e, saidas, acoes };
  }

  // 1. Intenções globais
  const g = intencaoGlobal(texto);
  if (g === "optout") {
    saidas.push({ texto: `Tudo bem, ${nomeOu(e, "amigo(a)")}. Não vou mais te escrever. Se um dia quiser voltar, é só mandar *voltar* — a porta não fecha. Fique bem.` });
    acoes.push({ tipo: "optout" });
    return { estado: { ...e, fase: "optout", aguardando: null, proximaLicaoEm: null }, saidas, acoes };
  }
  if (g === "visita") return iniciarVisita(e, saidas, acoes, false);
  if (g === "livro") {
    const url = LIVRO_URL;
    acoes.push({ tipo: "evento", nome: "pediu_livro" });
    saidas.push(site ? { texto: `Aqui está o livro *A Chave da Virada*, de graça. Leia no seu ritmo.`, link: { href: url, rotulo: "📖 Baixar o livro (PDF)" } } : { texto: `Aqui está o livro *A Chave da Virada*, de graça, em PDF:\n${url}\n\nLeia no seu ritmo. Se quiser a versão impressa em casa, escreva *visita*.` });
    if (e.fase === "menu" || e.fase === "concluido") saidas.push(menu(e));
    return { estado: e, saidas, acoes };
  }
  if (g === "oracao" && e.fase !== "oracao") {
    saidas.push({ texto: `Pode contar o que está pesando. Escreva do seu jeito, sem enfeitar. Eu oro com você aqui mesmo, e o pedido fica guardado para a oração da igreja.` });
    return { estado: { ...e, fase: "oracao" }, saidas, acoes };
  }

  // 2. Por fase
  switch (e.fase) {
    case "inicio":
      saidas.push(primeiraMensagem());
      acoes.push({ tipo: "evento", nome: "primeiro_contato" });
      return { estado: { ...e, fase: "nome" }, saidas, acoes };

    case "nome": {
      const nome = texto.trim().split(/\s+/).slice(0, 2).join(" ").replace(/[^\p{L}\s'-]/gu, "").trim();
      if (!nome || nome.length < 2) { saidas.push({ texto: "Como posso te chamar? Pode ser só o primeiro nome." }); return { estado: e, saidas, acoes }; }
      e = { ...e, nome: nome.charAt(0).toUpperCase() + nome.slice(1), fase: "como_esta" };
      saidas.push(perguntaHumor(e));
      return { estado: e, saidas, acoes };
    }

    case "como_esta": {
      const i = escolha(entrada, HUMORES, "humor");
      const humor = i === null ? texto.slice(0, 80) : HUMORES[i];
      e = { ...e, humor };
      acoes.push({ tipo: "evento", nome: "humor", dados: { humor } });
      if (i !== null && i <= 2) {
        saidas.push({ texto: `Obrigada por me dizer, ${e.nome}. Isso já é um passo. Não vou te mandar nada pesado. Posso te enviar a primeira conversa, que se chama *Você não está sozinho* — são 5 minutos de leitura. Ou, se preferir, só peço que alguém ore por você agora.`, botoes: botoes(["Me manda o estudo", "Quero que orem por mim", "Quero uma visita"], "menu") });
        return { estado: { ...e, fase: "menu" }, saidas, acoes };
      }
      saidas.push({ texto: `Que bom te conhecer, ${e.nome}. Aqui tem 20 conversas curtas sobre esperança, Deus e a vida — sem prova, sem cobrança, no seu ritmo.` }, menu(e));
      return { estado: { ...e, fase: "menu" }, saidas, acoes };
    }

    case "oracao": {
      if (texto.trim().length < 3) { saidas.push({ texto: "Pode escrever o que está pesando." }); return { estado: e, saidas, acoes }; }
      acoes.push({ tipo: "oracao", pedido: texto });
      acoes.push({ tipo: "evento", nome: "pedido_oracao" });
      saidas.push({ texto: `Recebi, ${nomeOu(e, "amigo(a)")}. Vamos orar agora, do jeito simples:\n\n_"Deus, o Senhor ouviu o que ${nomeOu(e, "esta pessoa")} escreveu. O Senhor conhece o peso por dentro. Fica perto. Dá força para hoje e paz para esta noite. Em nome de Jesus, amém."_\n\nSeu pedido fica guardado para a oração da igreja Nova Esperança. Você não está sozinho(a) com isso.` });
      if (!e.selos.includes("primeira_oracao")) { e = { ...e, selos: [...e.selos, "primeira_oracao"] }; acoes.push({ tipo: "selo", codigo: "primeira_oracao" }); }
      const volta = e.concluidas.length >= TOTAL ? "concluido" : "menu";
      saidas.push(menu(e));
      return { estado: { ...e, fase: volta }, saidas, acoes };
    }

    case "menu":
    case "licao": {
      const i = escolha(entrada, ["Quero a lição", "Quero que orem por mim", "Quero falar com uma pessoa"], "menu");
      if (g === "continuar" || i === 0 || /estudo|licao|manda|sim|quero|vamos|ok|pode/.test(norm(texto))) {
        if (site) {
          if (e.concluidas.length >= TOTAL) { saidas.push({ texto: `${nomeOu(e, "Você")}, você já jogou as 20 lições. Seu certificado está a um clique.`, link: { href: "/curso/certificado", rotulo: "🎓 Pegar meu certificado" } }); return { estado: e, saidas, acoes }; }
          const L = licao(e.licaoAtual);
          saidas.push({ texto: `${nomeOu(e, "Amigo(a)")}, ${(jogoJson as { gancho: string }[])[L.numero - 1].gancho}\n\nA lição ${L.numero} é um jogo de 8 perguntas — 5 minutos. Quando terminar, volta aqui que eu continuo com você.`, link: { href: `/curso/${L.numero}`, rotulo: `${L.numero === 1 ? "🌱" : "▶"} Jogar a lição ${L.numero}` } });
          acoes.push({ tipo: "evento", nome: "licao_aberta_site", dados: { numero: L.numero } });
          return { estado: { ...e, fase: "menu" }, saidas, acoes };
        }
        if (e.concluidas.length >= TOTAL) return { estado: emitirCertificado(e, saidas, acoes), saidas, acoes };
        return { estado: entregarLicao(e, saidas, acoes), saidas, acoes };
      }
      if (g === "pontos") { saidas.push({ texto: `Você tem *${e.pontos} pontos*, ${e.selos.length} selo(s) e concluiu ${e.concluidas.length} de ${TOTAL} lições.` }, menu(e)); return { estado: e, saidas, acoes }; }
      saidas.push(menu(e));
      return { estado: e, saidas, acoes };
    }

    case "aguardando": {
      const L = licao(e.licaoAtual);
      if (e.aguardando === "quiz" && L.quiz) {
        const i = escolha(entrada, L.quiz.alternativas, "quiz") ?? "abcd".indexOf(norm(texto).charAt(0)) ;
        if (i === null || i < 0 || i >= L.quiz.alternativas.length) { saidas.push({ texto: "Responda com A, B ou C (ou toque num botão). Não tem problema errar." }); return { estado: e, saidas, acoes }; }
        e = { ...e, tentativasQuiz: e.tentativasQuiz + 1 };
        if (i === L.quiz.correta) {
          const primeira = e.tentativasQuiz === 1;
          const delta = primeira ? 100 : 50;
          e = { ...e, pontos: e.pontos + delta, quizzesFeitos: e.quizzesFeitos + 1, acertosPrimeira: e.acertosPrimeira + (primeira ? 1 : 0) };
          acoes.push({ tipo: "pontos", delta, motivo: `Quiz lição ${L.numero}` });
          saidas.push({ texto: `✅ Isso. ${L.quiz.explicacao ? L.quiz.explicacao.charAt(0).toUpperCase() + L.quiz.explicacao.slice(1) : ""} *+${delta} pontos* (total: ${e.pontos}).` });
        } else if (e.tentativasQuiz >= 2) {
          e = { ...e, pontos: e.pontos + 25, quizzesFeitos: e.quizzesFeitos + 1 };
          acoes.push({ tipo: "pontos", delta: 25, motivo: `Quiz lição ${L.numero} (revelado)` });
          saidas.push({ texto: `A resposta é *${"ABC"[L.quiz.correta]}) ${L.quiz.alternativas[L.quiz.correta]}*. ${L.quiz.explicacao ?? ""} Sem problema — o que importa é ter lido. *+25 pontos*.` });
        } else {
          saidas.push({ texto: "Quase. Tenta mais uma vez — olha de novo a história." });
          return { estado: e, saidas, acoes };
        }
        const quizMsg = L.mensagens.find((m) => m.tipo === "quiz") as MensagemLicao;
        return { estado: entregarLicao(e, saidas, acoes, quizMsg.n + 1), saidas, acoes };
      }
      if (e.aguardando === "exercicio" || e.aguardando === "decisao") {
        const m = L.mensagens.find((x) => x.tipo === e.aguardando) as MensagemLicao;
        const i = m.opcoes ? escolha(entrada, m.opcoes, m.tipo) : null;
        const resposta = i !== null && m.opcoes ? m.opcoes[i] : texto.slice(0, 120);
        if (e.aguardando === "exercicio") {
          e = { ...e, pontos: e.pontos + 100 };
          acoes.push({ tipo: "pontos", delta: 100, motivo: `Exercício lição ${L.numero}` });
          acoes.push({ tipo: "evento", nome: "exercicio", dados: { licao: L.numero, resposta } });
          saidas.push({ texto: `Anotado: *${resposta}*. Só tentar já conta. *+100 pontos* (total: ${e.pontos}).` });
        } else {
          e = { ...e, decisaoFinal: resposta };
          acoes.push({ tipo: "evento", nome: "decisao_final", dados: { resposta } });
          saidas.push({ texto: /ainda n/i.test(resposta) ? "Tudo bem. Continuar perto já é muito. A porta fica aberta." : "Que alegria. No fim desta lição eu te pergunto onde e quando a igreja pode te visitar para combinar o próximo passo." });
        }
        return { estado: entregarLicao(e, saidas, acoes, m.n + 1), saidas, acoes };
      }
      if (e.aguardando === "final") {
        const i = escolha(entrada, L.botoes, "final");
        const label = i !== null ? L.botoes[i] : "";
        if (/aceitei/i.test(label) || /aceitei|aceito jesus/.test(norm(texto))) {
          acoes.push({ tipo: "evento", nome: "aceitou_jesus" });
          saidas.push({ texto: `${nomeOu(e, "Amigo(a)")}, isso é a melhor notícia que eu poderia receber hoje. 🙏 Se quiser que alguém da igreja te visite para orar junto, escreva *visita*.` });
          e = avancar(e, saidas, acoes);
          saidas.push(menu(e));
          return { estado: e, saidas, acoes };
        }
        if (/orem/i.test(label)) { saidas.push({ texto: "Pode contar o que está pesando. Escreva do seu jeito. Eu oro com você aqui mesmo." }); return { estado: { ...avancar(e, saidas, acoes), fase: "oracao" }, saidas, acoes }; }
        if (/visita|pastor|igreja|sábado|sabado|batismo/i.test(label)) { e = avancar(e, saidas, acoes); return iniciarVisita(e, saidas, acoes, false, /batismo/i.test(label) ? "batismo" : /pastor/i.test(label) ? "pastor" : "visita"); }
        if (/certificado/i.test(label)) { e = avancar(e, saidas, acoes); return { estado: e, saidas, acoes }; }
        // "Quero a lição N amanhã" → agenda; "Quero a lição N" / "começar o Bloco" → agora
        if (/amanh/i.test(label)) {
          e = avancar(e, saidas, acoes);
          const quando = proximoEnvio(agora, 1);
          saidas.push({ texto: `Combinado. Amanhã de manhã eu te mando a lição ${e.licaoAtual}. Se quiser antes, é só escrever *lição*.` });
          return { estado: { ...e, proximaLicaoEm: iso(quando) }, saidas, acoes };
        }
        if (i !== null || g === "continuar" || /sim|quero|vamos|ok|pode|proxima/.test(norm(texto))) {
          e = avancar(e, saidas, acoes);
          if (e.fase === "concluido") return { estado: e, saidas, acoes };
          const L2 = licao(e.licaoAtual);
          if (L2.bloco !== L.bloco) saidas.push({ texto: `*Bloco ${["", "I", "II", "III", "IV", "V"][L2.bloco]} — ${NOME_BLOCO[L2.bloco]}*` });
          return { estado: entregarLicao(e, saidas, acoes), saidas, acoes };
        }
        // qualquer outra coisa: reconhece e oferece os botões de novo
        saidas.push({ texto: "Entendi. Quando quiser, é só escolher:", botoes: botoes(L.botoes, "final") });
        return { estado: e, saidas, acoes };
      }
      return { estado: e, saidas, acoes };
    }

    case "concluido": {
      const i = escolha(entrada, ["Quero uma visita", "Quero continuar estudando", "Quero o Curso 2"], "pos");
      if (i === 0) return iniciarVisita(e, saidas, acoes, false);
      if (i === 2 || /curso 2|apocalipse/.test(norm(texto))) { acoes.push({ tipo: "evento", nome: "quer_curso2" }); saidas.push({ texto: "Anotado. O Curso 2 — *Apocalipse: Revelações de Esperança* (21 lições) — está em preparação. Eu te aviso aqui quando abrir." }); }
      else if (i === 1) { saidas.push({ texto: "Cursos gratuitos da Novo Tempo para continuar: *Mente Feliz*, *De Bem Comigo*, *Fique Leve* — https://novotempocursos.com/pt/\nE o Bíblia Fácil completo: https://www.youtube.com/playlist?list=PLswq4D7T-keT7DvrH4edxDoUFWHXRBCCv" }); }
      else if (g === "pontos" || /certificado/.test(norm(texto))) { saidas.push({ texto: `Seu certificado: ${e.certificado && e.certificado !== "pendente" ? "código *" + e.certificado + "*" : "está sendo emitido"}. Pontos: *${e.pontos}*.` }); }
      else saidas.push({ texto: "Estou aqui. Pode escrever *orem*, *visita* ou *curso 2*." });
      return { estado: e, saidas, acoes };
    }
  }
  return { estado: e, saidas, acoes };
}

/** Chamado pelo cron: envia lição agendada ou lembrete suave. Retorna null se nada a fazer. */
export function tique(estado: Estado, agora: Date): Resultado | null {
  const e = estado;
  if (e.fase === "crise" || e.fase === "visita" || e.fase === "optout" || e.fase === "concluido") return null;
  if (e.proximaLicaoEm && new Date(e.proximaLicaoEm) <= agora) {
    const saidas: Saida[] = [{ texto: `Bom dia, ${e.nome ?? "amigo(a)"}. Como combinado, aqui vai a lição ${e.licaoAtual}. Leia quando puder — eu espero.` }];
    const acoes: Acao[] = [];
    const est = entregarLicao({ ...e, proximaLicaoEm: null }, saidas, acoes);
    return { estado: { ...est, lembreteEm: iso(proximoEnvio(agora, 3)) }, saidas, acoes };
  }
  if (e.lembreteEm && new Date(e.lembreteEm) <= agora && e.lembretesEnviados < 2 && e.fase !== "inicio") {
    const saidas: Saida[] = [{ texto: e.lembretesEnviados === 0
      ? `Oi, ${e.nome ?? "amigo(a)"}. Sem cobrança: só passando para dizer que a porta continua aberta. Quando quiser continuar, escreva *lição*. Se quiser receber uma visita, escreva *visita*.`
      : `${e.nome ?? "Amigo(a)"}, esta é a última vez que eu te escrevo por conta própria — não quero incomodar. Se um dia quiser voltar, é só mandar *lição*; se quiser uma visita, *visita*. Se estiver pensando em desistir da vida, ligue *188*. Fique bem.` }];
    return { estado: { ...e, lembreteEm: null, lembretesEnviados: e.lembretesEnviados + 1 }, saidas, acoes: [{ tipo: "evento", nome: "lembrete", dados: { n: e.lembretesEnviados + 1 } }] };
  }
  return null;
}

/** Quando a pessoa termina uma interação sem agendar, marca lembrete suave para 3 dias. */
export function marcarLembrete(estado: Estado, agora: Date): Estado {
  if (estado.proximaLicaoEm || ["crise", "visita", "optout", "concluido", "inicio"].includes(estado.fase)) return estado;
  return { ...estado, lembreteEm: iso(proximoEnvio(agora, 3)) };
}
