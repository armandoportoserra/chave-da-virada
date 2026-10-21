// Certificado de conclusão — verificável publicamente pelo código. Imprimível (A4 paisagem).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin, supabaseConfigurado } from "@/lib/supabase-server";


export const instant = false;

interface Cert { codigo: string; nome_impresso: string; nota_final: number; avaliacao: string; emitido_em: string; revogado: boolean }

async function buscar(codigo: string): Promise<Cert | null> {
  if (!supabaseConfigurado()) return codigo === "CV-DEMO" ? { codigo, nome_impresso: "Maria Clara", nota_final: 9.3, avaliacao: "Com louvor", emitido_em: new Date().toISOString(), revogado: false } : null;
  const { data } = await supabaseAdmin().from("certificados").select("codigo, nome_impresso, nota_final, avaliacao, emitido_em, revogado").eq("codigo", codigo).maybeSingle();
  return (data as Cert | null) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/certificado/[codigo]">): Promise<Metadata> {
  const { codigo } = await params;
  return { title: `Certificado ${codigo} — A Chave da Virada`, robots: { index: false } };
}

export default async function Certificado({ params }: PageProps<"/certificado/[codigo]">) {
  const { codigo } = await params;
  const c = await buscar(codigo.toUpperCase());
  if (!c || c.revogado) notFound();
  const data = new Date(c.emitido_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
  const aprov = Math.round(Number(c.nota_final) * 10);
  return (
    <main className="min-h-screen bg-cream-dark p-4 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl print:hidden mb-4 flex items-center justify-between text-sm text-muted">
        <span>Certificado autêntico · código {c.codigo}</span>
        <span>Para salvar em PDF: Ctrl+P → “Salvar como PDF” (paisagem)</span>
      </div>
      <section className="mx-auto max-w-4xl bg-cream border-[6px] border-double border-gold p-10 md:p-16 text-center shadow-xl print:shadow-none print:border-[6px]" style={{ aspectRatio: "1.414" }}>
        <p className="text-xs tracking-[0.3em] text-gold font-semibold uppercase">Igreja Adventista do Sétimo Dia · Nova Esperança · Caxias do Sul</p>
        <h1 className="serif mt-6 text-4xl md:text-5xl font-semibold text-navy">Certificado de Conclusão</h1>
        <p className="mt-6 text-ink/80">Certificamos que</p>
        <p className="serif mt-2 text-4xl md:text-5xl font-semibold text-navy-light">{c.nome_impresso}</p>
        <p className="mx-auto mt-6 max-w-2xl text-ink/80 leading-relaxed">
          concluiu o curso bíblico <strong className="text-navy">A Chave da Virada</strong> — 20 estudos sobre esperança, Jesus e a vida,
          baseados no curso <em>Jesus, Restaurador da Vida</em> da Igreja Adventista do Sétimo Dia —
          com aproveitamento de <strong className="text-navy">{aprov}%</strong>: <strong className="text-gold">{c.avaliacao}</strong>.
        </p>
        <div className="mt-10 grid grid-cols-3 gap-6 text-sm text-ink/70">
          <div><div className="border-t border-navy/40 pt-2">Pr. Enderson<br /><span className="text-xs">Diretor Geral</span></div></div>
          <div><div className="border-t border-navy/40 pt-2">Armando Luis Francisco<br /><span className="text-xs">Diretor Associado</span></div></div>
          <div><div className="border-t border-navy/40 pt-2">Felipe<br /><span className="text-xs">Diretor Associado</span></div></div>
        </div>
        <p className="mt-8 text-xs text-muted">Caxias do Sul, {data} · Código {c.codigo} · Verifique em {process.env.NEXT_PUBLIC_SITE_URL ?? ""}/certificado/{c.codigo}</p>
        <p className="serif mt-4 italic text-navy/70">“Eis que faço novas todas as coisas.” — Apocalipse 21:5</p>
      </section>
    </main>
  );
}
