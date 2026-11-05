// Localizador de igrejas adventistas no Brasil. Fonte oficial: índice público do "Encontre uma igreja" (DSA/7me)
// + detalhes públicos do ACMS. Só exibimos dados de endereço (nunca telefone ou e-mail de pessoas).
export const UFS: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};
export const normTxt = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
export type Igreja = { id: number; nome: string; tipo: "Igreja" | "Grupo"; rua: string; bairro: string; cep: string; cidade: string; uf: string; lat: number | null; lng: number | null };
export type Resultado = { cidade: string; uf: string; total: number; bairros: { bairro: string; igrejas: Igreja[] }[] };
