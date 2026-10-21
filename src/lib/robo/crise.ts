// Detecção de crise — prioridade sobre qualquer fluxo.
// Erra para o lado da cautela: um falso positivo custa uma mensagem de cuidado;
// um falso negativo pode custar uma vida. A conversa fica marcada no banco (prioridade 9).

const PADROES: RegExp[] = [
  /\b(me\s+matar|me\s+mato|suic[ií]d|tirar\s+(a\s+)?minha\s+vida|acabar\s+com\s+(a\s+)?minha\s+vida|dar\s+fim\s+(a|na)\s+(minha\s+)?vida)/i,
  /\b(n[aã]o\s+(quero|aguento|consigo)\s+mais\s+viver|n[aã]o\s+quero\s+(mais\s+)?(viver|existir|acordar)|quero\s+morrer|queria\s+(estar\s+)?mort[oa]|melhor\s+(estar\s+)?mort[oa]|desistir\s+da\s+vida)/i,
  /\b(me\s+cort(o|ar|ei|ando)|me\s+machuc(o|ar|ando|uei)|me\s+ferir|automutila)/i,
  /\b(tomar\s+(todos\s+os\s+)?rem[eé]dios?\s+de\s+uma\s+vez|tomei\s+(v[aá]rios|muitos)\s+comprimidos|overdose)/i,
  /\b(sumir\s+de\s+vez|ningu[eé]m\s+(vai\s+)?sentir(ia)?\s+(a\s+)?minha\s+falta|seria\s+melhor\s+(se\s+)?eu\s+n[aã]o\s+existisse|sem\s+sa[ií]da|n[aã]o\s+tem\s+mais\s+jeito\s+pra\s+mim)/i,
  /\b(me\s+bat(e|eu|endo)|apanh(o|ei|ando)\s+(do|da|de)|amea[cç]a(ndo|ou)?\s+me\s+matar|viol[eê]ncia\s+(dom[eé]stica|em\s+casa))/i,
];

export function detectarCrise(texto: string): boolean {
  const t = texto.normalize("NFC");
  return PADROES.some((re) => re.test(t));
}

export function mensagemCrise(nome: string | null): string {
  const n = nome ? `${nome}, o` : "O";
  return `${n} que você escreveu importa muito. Eu sou um robô e não quero que você fique só comigo agora. ` +
    `Por favor, ligue *188* (CVV — gratuito, 24 horas) ou acesse cvv.org.br. Se houver risco imediato, ligue *192* (SAMU). ` +
    `Se quiser que alguém da igreja vá até você, escreva *visita*. Você não está sozinho(a).`;
}
