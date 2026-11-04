import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";

// Contadores reais do site, lidos do banco. Cache de 60 s via Cache-Control (CDN da Vercel).

const CONCLUIDAS = ["estudo_concluido_site", "estudo2_concluido_site", "estudo_concluido"];

export async function GET() {
  const vazio = { pessoas: 0, licoesAbertas: 0, licoes: 0, certificados: 0, oracoes: 0, conversas: 0 };
  if (!supabaseConfigurado()) return NextResponse.json({ ...vazio, modo: "sem_banco" });
  const db = supabaseAdmin();
  const head = { count: "exact" as const, head: true };
  const [pessoas, licoesAbertas, licoes, certificados, oracoes, conversas] = await Promise.all([
    db.from("pessoas").select("*", head),
    db.from("eventos").select("*", head).eq("nome", "licao_aberta"),
    db.from("eventos").select("*", head).in("nome", CONCLUIDAS),
    db.from("certificados").select("*", head).eq("revogado", false),
    db.from("pedidos_oracao").select("*", head),
    db.from("conversas").select("*", head),
  ]);
  const n = (r: { count: number | null }) => r.count ?? 0;
  return NextResponse.json(
    { pessoas: n(pessoas), licoesAbertas: n(licoesAbertas), licoes: n(licoes), certificados: n(certificados), oracoes: n(oracoes), conversas: n(conversas), em: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", "Access-Control-Allow-Origin": "*" } },
  );
}
