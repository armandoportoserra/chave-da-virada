// FAQ "O amor de Deus": 300 perguntas em 12 temas (src/content/faq_amor.json).
// Usada pela página /perguntas e pela Esperança (robô) para responder perguntas livres.
import faqJson from "@/content/faq_amor.json";

export interface FaqItem { p: string; r: string; v: string; ref: string }
export interface FaqTema { id: string; tema: string; emoji: string; intro: string; itens: FaqItem[] }
export interface FaqResultado extends FaqItem { tema: string; temaId: string; emoji: string; pontos: number }

export const FAQ: FaqTema[] = faqJson as FaqTema[];
export const FAQ_TOTAL = FAQ.reduce((n, t) => n + t.itens.length, 0);

const PARADAS = new Set("a o os as um uma uns umas de do da dos das em no na nos nas e ou que se por para com sem ao aos à às me te lhe meu minha meus minhas seu sua seus suas eu tu ele ela nós vocês eles elas isso isto aquilo é são foi era ser estar tem têm há já não sim mas como quando onde qual quais quem muito pouco mais menos também ainda só até mesmo porque por que pra pro ta tá".split(" "));

export function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokens(s: string): string[] {
  return normalizar(s).split(" ").filter((t) => t.length > 2 && !PARADAS.has(t));
}
function raiz(t: string): string { return t.length > 5 ? t.slice(0, 5) : t; }

// Índice: raízes de cada pergunta/resposta e raridade (idf) das raízes nas perguntas.
const IDX = FAQ.flatMap((t) => t.itens.map((it) => ({ it, t, tp: new Set(tokens(it.p).map(raiz)), tr: new Set(tokens(it.r).map(raiz)) })));
const DF = new Map<string, number>();
for (const e of IDX) for (const w of e.tp) DF.set(w, (DF.get(w) ?? 0) + 1);
const idf = (w: string) => Math.log((IDX.length + 1) / ((DF.get(w) ?? 0) + 1)) + 0.2;

/** Busca por sobreposição de palavras (com raiz) entre a consulta e pergunta+resposta.
 *  Palavras raras valem mais; palavras raras que só a pergunta candidata tem (ex.: "aborto") penalizam,
 *  para "Deus me perdoa?" não cair numa pergunta mais específica do que a da pessoa. */
export function buscarFaq(consulta: string, limite = 10, temaId?: string): FaqResultado[] {
  const q = Array.from(new Set(tokens(consulta).map(raiz)));
  if (!q.length) return [];
  const out: FaqResultado[] = [];
  for (const { it, t, tp, tr } of IDX) {
    if (temaId && t.id !== temaId) continue;
    let pontos = 0;
    for (const w of q) { if (tp.has(w)) pontos += 3 * Math.min(2, idf(w)); else if (tr.has(w)) pontos += 1; }
    if (pontos <= 0) continue;
    for (const w of tp) if (!q.includes(w)) pontos -= 0.6 * idf(w);
    if (pontos > 0) out.push({ ...it, tema: t.tema, temaId: t.id, emoji: t.emoji, pontos: Math.round(pontos * 10) / 10 });
  }
  return out.sort((a, b) => b.pontos - a.pontos).slice(0, limite);
}

/** A mensagem parece uma pergunta sobre Deus/fé/vida? (para o robô decidir consultar a FAQ) */
export function pareceperguntaFaq(texto: string): boolean {
  const n = normalizar(texto);
  if (n.length < 8) return false;
  if (/\?/.test(texto)) return true;
  return /^(por que|porque|como|o que|quem|onde|quando|sera que|existe|deus|jesus|a biblia|biblia|posso|preciso|e verdade|e pecado|tenho medo|me sinto|estou com)/.test(n);
}

/** Melhor resposta da FAQ para uma mensagem livre, ou null se não houver uma boa. */
export function responderFaq(texto: string): FaqResultado | null {
  const r = buscarFaq(texto, 1);
  if (!r.length) return null;
  const q = tokens(texto).length;
  // exige pelo menos duas palavras fortes em comum (ou uma, se a pergunta é curta)
  const minimo = q <= 2 ? 2.5 : 5;
  return r[0].pontos >= minimo ? r[0] : null;
}
