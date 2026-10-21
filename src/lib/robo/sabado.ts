// Regra do sábado: do pôr do sol de sexta ao pôr do sol de sábado (hora de Caxias do Sul)
// o robô não envia nada por conta própria. Quem escreve recebe resposta normalmente.
// Pôr do sol calculado (algoritmo NOAA simplificado), sem depender de tabela.

const LAT = -29.168;  // Caxias do Sul
const LON = -51.179;
const TZ = "America/Sao_Paulo";

function partesLocais(d: Date) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hour12: false, weekday: "short",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(d);
  const g = (t: string) => f.find((p) => p.type === t)?.value ?? "";
  return {
    dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")),
    y: +g("year"), m: +g("month"), dia: +g("day"),
    minutos: (+g("hour") % 24) * 60 + +g("minute"),
  };
}

/** Pôr do sol (minutos após 00:00 local) para a data local y-m-d. */
export function porDoSolMinutos(y: number, m: number, dia: number): number {
  const rad = Math.PI / 180;
  const n1 = Math.floor(275 * m / 9), n2 = Math.floor((m + 9) / 12);
  const n3 = 1 + Math.floor((y - 4 * Math.floor(y / 4) + 2) / 3);
  const N = n1 - n2 * n3 + dia - 30;
  const lngHour = LON / 15;
  const t = N + (18 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(LAT * rad)) / (cosDec * Math.cos(LAT * rad));
  const H = Math.acos(cosH) / rad / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  let UT = ((T - lngHour) % 24 + 24) % 24;
  // offset de Brasília: -3 (sem horário de verão desde 2019)
  UT = ((UT - 3) % 24 + 24) % 24;
  return Math.round(UT * 60);
}

export function ehSabado(agora: Date = new Date()): boolean {
  const p = partesLocais(agora);
  if (p.dow === 5) return p.minutos >= porDoSolMinutos(p.y, p.m, p.dia);
  if (p.dow === 6) return p.minutos < porDoSolMinutos(p.y, p.m, p.dia);
  return false;
}

/** Próximo horário em que o robô pode enviar algo por conta própria (8h local, fora do sábado). */
export function proximoEnvio(apartirDe: Date, diasDepois = 1): Date {
  const d = new Date(apartirDe.getTime() + diasDepois * 86_400_000);
  // fixa 08:00 local (UTC-3 => 11:00Z)
  const p = partesLocais(d);
  let alvo = new Date(Date.UTC(p.y, p.m - 1, p.dia, 11, 0, 0));
  while (ehSabado(alvo)) alvo = new Date(alvo.getTime() + 86_400_000);
  return alvo;
}
