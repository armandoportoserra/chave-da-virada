/** Normaliza WhatsApp brasileiro para E.164 (+55DDDNÚMERO). Retorna null se inválido. */
export function normalizarWhatsapp(entrada: string): string | null {
  let d = entrada.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  if (d.length === 10) d = d.slice(0, 2) + "9" + d.slice(2); // celular antigo sem o 9
  if (d.length !== 11) return null;
  if (!/^[1-9][0-9]9[0-9]{8}$/.test(d)) return null;
  return "+55" + d;
}

export function formatarWhatsapp(e164: string): string {
  const d = e164.replace(/\D/g, "").slice(-11);
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
