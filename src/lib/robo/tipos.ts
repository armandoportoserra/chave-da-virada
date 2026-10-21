// Tipos do robô "Esperança" — motor puro, sem dependência de banco ou WhatsApp.

export type TipoMensagem = "texto" | "quiz" | "exercicio" | "reflexao" | "decisao" | "fechamento";

export interface MensagemLicao {
  n: number;
  tipo: TipoMensagem;
  rotulo: string;
  texto: string;
  opcoes?: string[];
}

export interface Quiz {
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string | null;
}

export interface Licao {
  numero: number;
  bloco: number;
  bloco_nome: string;
  slug: string;
  titulo: string;
  necessidade: string;
  fonte: string;
  mensagens: MensagemLicao[];
  quiz: Quiz | null;
  exercicio: string | null;
  oracao: string | null;
  videos: string[];
  botoes: string[];
  pontos: number;
  cvv: string;
}

export type Fase =
  | "inicio"        // nunca falou
  | "nome"          // perguntou o nome
  | "como_esta"     // perguntou como está
  | "menu"          // aguardando escolha
  | "licao"         // entregando lição (não aguarda resposta)
  | "aguardando"    // aguardando resposta de quiz/exercício/decisão/botões finais
  | "oracao"        // pediu o texto do pedido de oração
  | "visita"        // pediu visita: aguardando bairro/horário/WhatsApp
  | "crise"         // crise detectada — só 188/192 e a porta da visita
  | "concluido"     // terminou as 20
  | "optout";       // pediu para sair

export type Aguardando = "quiz" | "exercicio" | "decisao" | "final" | null;

export interface Estado {
  fase: Fase;
  nome: string | null;
  licaoAtual: number;          // 1..20 (a próxima a enviar ou a em curso)
  aguardando: Aguardando;
  pontos: number;
  acertosPrimeira: number;     // quizzes acertados de primeira
  quizzesFeitos: number;
  tentativasQuiz: number;      // tentativas no quiz atual
  concluidas: number[];
  selos: string[];
  proximaLicaoEm: string | null;   // ISO — envio agendado pelo cron
  lembreteEm: string | null;       // ISO — lembrete suave se sumiu
  lembretesEnviados: number;
  humor: string | null;            // resposta de "como está"
  decisaoFinal: string | null;
  certificado: string | null;      // código
  ultimaEntrada: string | null;    // ISO
}

export function estadoInicial(): Estado {
  return {
    fase: "inicio", nome: null, licaoAtual: 1, aguardando: null, pontos: 0,
    acertosPrimeira: 0, quizzesFeitos: 0, tentativasQuiz: 0, concluidas: [], selos: [],
    proximaLicaoEm: null, lembreteEm: null, lembretesEnviados: 0, humor: null,
    decisaoFinal: null, certificado: null, ultimaEntrada: null,
  };
}

/** Mensagem que o robô quer enviar. Botões: até 3 (WhatsApp); mais que isso vira lista. */
export interface Saida {
  texto: string;
  botoes?: { id: string; titulo: string }[];
  link?: { href: string; rotulo: string };   // só no site: abre o jogo da lição
}

/** Efeitos colaterais que a camada de persistência executa. */
export type Acao =
  | { tipo: "crise"; texto: string }
  | { tipo: "oracao"; pedido: string }
  | { tipo: "tarefa"; subtipo: "buscar_sabado" | "batismo" | "pastor" | "certificado_impresso" | "visita" | "dependencia"; descricao: string }
  | { tipo: "pontos"; delta: number; motivo: string }
  | { tipo: "selo"; codigo: string }
  | { tipo: "licao_concluida"; numero: number; acertou: boolean | null }
  | { tipo: "certificado"; nome: string; aproveitamento: number; avaliacao: string }
  | { tipo: "optout" }
  | { tipo: "evento"; nome: string; dados?: Record<string, unknown> };

export interface Entrada {
  texto: string;          // texto digitado ou título do botão
  botaoId?: string;       // id do botão/lista, se veio de interativo
  agora?: Date;
  canal?: "whatsapp" | "site";
  concluidas?: number[];  // site: lições já jogadas no navegador (sincroniza o estado)
}

export interface Resultado {
  estado: Estado;
  saidas: Saida[];
  acoes: Acao[];
}
