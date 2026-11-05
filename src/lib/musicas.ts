// Músicas oficiais adventistas (CPB, Ministério Jovem, Novo Tempo, Feliz7Play), por tema.
// Tocam dentro do site, em /musicas. Substituem o antigo "pedir visita": tudo é digital e automático.
export type Musica = { id: string; titulo: string; autor: string; tema: string };

export const MUSICAS: Musica[] = [
  { id: "WHCMQjeWqVs", titulo: "Deus Cuidará de Ti", autor: "Novo Hinário Adventista · CPB", tema: "esperanca" },
  { id: "ytR2bPG4v2c", titulo: "Meu Farol", autor: "Ministério Jovem", tema: "esperanca" },
  { id: "Z6as5nyLYa8", titulo: "Bendita Hora de Oração", autor: "Novo Hinário Adventista · CPB", tema: "oracao" },
  { id: "d9qDZ7AFYDI", titulo: "Meu Lugar no Mundo", autor: "Novo Tom · Tema JA 2026", tema: "deus" },
  { id: "hXrjWCkDmpY", titulo: "Junto à Cruz", autor: "Novo Hinário Adventista · CPB", tema: "jesus" },
  { id: "R3Dv1Dftxn0", titulo: "Tudo por Ele", autor: "Tema JA 2020 · Feliz7Play", tema: "jesus" },
  { id: "Xmna0YjSQ-s", titulo: "Sou Feliz com Jesus", autor: "Novo Hinário Adventista · CPB", tema: "vida" },
  { id: "n2p7mjkAerE", titulo: "Me Levanto", autor: "Ministério Jovem", tema: "vida" },
  { id: "bWgxPMBQhrg", titulo: "Eu Vou", autor: "Tema JA 2022 · Feliz7Play", tema: "vida" },
  { id: "VuxpSoj5eGA", titulo: "Breve Jesus Voltará", autor: "Novo Hinário Adventista · CPB", tema: "futuro" },
  { id: "l3vNcDVGrK4", titulo: "Maranata", autor: "Sérgio Saas · Tema JA 2024", tema: "futuro" },
];

// Curso 1: blocos 1 Esperança · 2 Você e Deus · 3 Jesus · 4 Uma vida inteira · 5 O futuro. Curso 2 (Apocalipse) → futuro/jesus.
const TEMA_BLOCO: Record<number, string> = { 1: "esperanca", 2: "deus", 3: "jesus", 4: "vida", 5: "futuro" };

export function musicaPara(tema: string, semente = 0): Musica {
  const lista = MUSICAS.filter((m) => m.tema === tema);
  const base = lista.length ? lista : MUSICAS;
  return base[Math.abs(semente) % base.length];
}
export function musicaDoBloco(bloco: number, semente = 0) { return musicaPara(TEMA_BLOCO[bloco] ?? "esperanca", semente); }
export const linkMusica = (m: Musica) => `/musicas#${m.id}`;
export const urlYoutube = (m: Musica) => `https://www.youtube.com/watch?v=${m.id}`;
