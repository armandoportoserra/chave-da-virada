"use client";
// Progresso do jogo guardado no navegador (sem cadastro). Sincroniza com a conta quando a pessoa quiser.
export interface Progresso { concluidas: Record<number, { pontos: number; acertos: number; em: string }>; nome?: string; whatsapp?: string; pessoaId?: string; certificado?: string }
const K = "cv.progresso.v1";
export function lerProgresso(): Progresso {
  try { const s = localStorage.getItem(K); if (s) return JSON.parse(s) as Progresso; } catch { /* sem storage */ }
  return { concluidas: {} };
}
export function salvarProgresso(p: Progresso) { try { localStorage.setItem(K, JSON.stringify(p)); } catch { /* sem storage */ } }
export function totalPontos(p: Progresso) { return Object.values(p.concluidas).reduce((s, c) => s + c.pontos, 0); }
export function totalAcertos(p: Progresso) { return Object.values(p.concluidas).reduce((s, c) => s + c.acertos, 0); }
