"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CONSENT_TEXTO } from "@/lib/consent";

type Estado = "idle" | "enviando" | "ok" | "erro";

export default function FormCadastro({ compacto = false }: { compacto?: boolean }) {
  const params = useSearchParams();
  const rota = params.get("r") ?? undefined;
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setErro(null);
    const f = new FormData(e.currentTarget);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v;
    });
    const payload = {
      nome: String(f.get("nome") ?? ""),
      whatsapp: String(f.get("whatsapp") ?? ""),
      quer_livro: f.get("quer_livro") === "on",
      quer_curso: f.get("quer_curso") === "on",
      quer_oracao: f.get("quer_oracao") === "on",
      quer_contato: f.get("quer_contato") === "on",
      consent: f.get("consent") === "on",
      site: String(f.get("site") ?? ""),
      rota,
      utm: Object.keys(utm).length ? utm : undefined,
    };
    try {
      const r = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro ?? "Erro ao enviar.");
      setEstado("ok");
      window.location.href = "/obrigado";
    } catch (err) {
      setEstado("erro");
      setErro(err instanceof Error ? err.message : "Erro ao enviar.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Formulário de cadastro">
      <input type="text" name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label htmlFor="nome" className="mb-1 block text-sm font-medium">
          Seu nome
        </label>
        <input id="nome" name="nome" required minLength={2} className="field" placeholder="Como podemos te chamar?" />
      </div>
      <div>
        <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium">
          Seu WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          required
          inputMode="tel"
          autoComplete="tel"
          className="field"
          placeholder="(54) 99999-9999"
        />
      </div>
      {!compacto && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">O que você gostaria de receber?</legend>
          {[
            ["quer_livro", "Um livro gratuito sobre paz e saúde emocional"],
            ["quer_curso", "O curso bíblico de 20 estudos, no meu ritmo"],
            ["quer_oracao", "Que alguém ore por mim"],
            ["quer_contato", "Receber uma visita da igreja"],
          ].map(([name, label]) => (
            <label key={name} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3 hover:border-gold">
              <input type="checkbox" name={name} className="mt-1 accent-gold" defaultChecked={name === "quer_livro"} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </fieldset>
      )}
      {compacto && (
        <>
          <input type="hidden" name="quer_livro" value="on" />
        </>
      )}
      <label className="flex items-start gap-3 text-xs text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-gold" />
        <span>
          {CONSENT_TEXTO}{" "}
          <a href="/privacidade" className="underline">
            Política de privacidade
          </a>
          .
        </span>
      </label>
      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {erro}
        </p>
      )}
      <button type="submit" disabled={estado === "enviando"} className="btn-gold w-full disabled:opacity-60">
        {estado === "enviando" ? "Enviando…" : "Quero receber"}
      </button>
      <p className="text-center text-xs text-muted">Sem compromisso. Sem pressão. Você pode parar quando quiser.</p>
    </form>
  );
}
