"use client";
// Progresso do jogo guardado no navegador (sem cadastro). Sincroniza com a conta quando a pessoa quiser.
// Cada curso tem o seu progresso: 1 = A Chave da Virada (20 lições), 2 = Apocalipse (21 lições).
export type Curso = 1 | 2;
export interface Progresso { concluidas: Record<number, { pontos: number; acertos: number; em: string }>; nome?: string; whatsapp?: string; pessoaId?: string; certificado?: string }
const CHAVE: Record<Curso, string> = { 1: "cv.progresso.v1", 2: "cv.progresso2.v1" };
export function lerProgresso(curso: Curso = 1): Progresso {
  try { const s = localStorage.getItem(CHAVE[curso]); if (s) return JSON.parse(s) as Progresso; } catch { /* sem storage */ }
  // O Curso 2 herda nome/WhatsApp/pessoa do Curso 1 (mesmo navegador), sem herdar as lições.
  if (curso === 2) { const p1 = lerProgresso(1); return { concluidas: {}, nome: p1.nome, whatsapp: p1.whatsapp, pessoaId: p1.pessoaId }; }
  return { concluidas: {} };
}
export function salvarProgresso(p: Progresso, curso: Curso = 1) { try { localStorage.setItem(CHAVE[curso], JSON.stringify(p)); } catch { /* sem storage */ } }
export function totalPontos(p: Progresso) { return Object.values(p.concluidas).reduce((s, c) => s + c.pontos, 0); }
export function totalAcertos(p: Progresso) { return Object.values(p.concluidas).reduce((s, c) => s + c.acertos, 0); }
