// Tipos e acesso ao curso em formato jogo (src/content/curso_jogo.json)
import dados from "@/content/curso_jogo.json";

export interface Pergunta { p: string; o: string[]; c: number; v: string; r: string }
export interface Video { id: string; titulo: string; programa: string; url: string; capa: string }
export interface LicaoJogo {
  numero: number; bloco: number; bloco_nome: string; titulo: string; figurinha: string; gancho: string;
  perguntas: Pergunta[]; oracao: string; videos: Video[]; cor: string; fundo: string; pontos_por_pergunta: number; cvv: string;
}
export const JOGO: LicaoJogo[] = dados as LicaoJogo[];
export const BLOCOS_JOGO = [1, 2, 3, 4, 5].map((b) => ({ numero: b, nome: JOGO.find((l) => l.bloco === b)!.bloco_nome, cor: JOGO.find((l) => l.bloco === b)!.cor, licoes: JOGO.filter((l) => l.bloco === b) }));
export const ROM = ["", "I", "II", "III", "IV", "V"];
export const CURSO_2 = {
  titulo: "Apocalipse — Revelações de Esperança",
  descricao: "21 lições sobre o último livro da Bíblia, no mesmo formato de jogo. Em preparação.",
  licoes: ["A Revelação", "O Verdadeiro Herói", "As Sete Igrejas", "A Maior de Todas as Guerras", "O Maior Resgate", "Quando Tudo Será Resolvido", "Mil Anos de Paz", "O Fim da Morte", "Os Sete Selos", "O Dia do Senhor", "As Sete Trombetas", "O Livro Sobrevivente", "O Santuário", "A Igreja de Deus", "O Dom Profético", "A Besta que Sobe do Mar", "A Besta que Sobe da Terra", "2.300 Anos", "As Sete Pragas", "Os Enganos da Babilônia", "Felizes Para Sempre"],
};
