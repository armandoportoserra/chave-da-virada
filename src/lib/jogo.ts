// Tipos e acesso aos cursos em formato jogo (src/content/curso_jogo.json e curso2_jogo.json)
import dados from "@/content/curso_jogo.json";
import dados2 from "@/content/curso2_jogo.json";

export interface Pergunta { p: string; o: string[]; c: number; v: string; r: string }
export interface Video { id: string; titulo: string; programa: string; url: string; capa: string }
export interface LicaoJogo {
  numero: number; bloco: number; bloco_nome: string; titulo: string; figurinha: string; gancho: string;
  perguntas: Pergunta[]; oracao: string; videos: Video[]; cor: string; fundo: string; pontos_por_pergunta: number; cvv: string;
}
export const JOGO: LicaoJogo[] = dados as LicaoJogo[];
export const JOGO2: LicaoJogo[] = dados2 as LicaoJogo[];
function blocos(licoes: LicaoJogo[]) {
  const nums = Array.from(new Set(licoes.map((l) => l.bloco))).sort((a, b) => a - b);
  return nums.map((b) => ({ numero: b, nome: licoes.find((l) => l.bloco === b)!.bloco_nome, cor: licoes.find((l) => l.bloco === b)!.cor, licoes: licoes.filter((l) => l.bloco === b) }));
}
export const BLOCOS_JOGO = blocos(JOGO);
export const BLOCOS_JOGO2 = blocos(JOGO2);
export const ROM = ["", "I", "II", "III", "IV", "V", "VI"];

/** Descrição de cada curso: caminho base, lições e textos. */
export type CursoId = 1 | 2;
export interface CursoInfo { id: CursoId; base: string; titulo: string; curto: string; descricao: string; licoes: LicaoJogo[]; blocos: ReturnType<typeof blocos>; fonte: string }
export const CURSOS: Record<CursoId, CursoInfo> = {
  1: { id: 1, base: "/curso", titulo: "A Chave da Virada", curto: "Curso 1", descricao: "20 lições sobre esperança, Jesus e a vida.", licoes: JOGO, blocos: BLOCOS_JOGO, fonte: "Jesus, Restaurador da Vida" },
  2: { id: 2, base: "/curso2", titulo: "Apocalipse — Revelações de Esperança", curto: "Curso 2", descricao: "21 lições sobre o último livro da Bíblia, no mesmo formato de jogo.", licoes: JOGO2, blocos: BLOCOS_JOGO2, fonte: "Apocalipse: Revelações de Esperança" },
};
export const CURSO_2 = {
  titulo: CURSOS[2].titulo,
  descricao: CURSOS[2].descricao,
  licoes: JOGO2.map((l) => l.titulo),
};
