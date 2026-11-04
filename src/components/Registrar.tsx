"use client";
import { useEffect } from "react";
import { lerProgresso, type Curso } from "@/lib/progresso-local";

// Registra uma vez por sessão que a pessoa abriu a lição (alimenta o contador real do site).
export default function Registrar({ curso, licao }: { curso: Curso; licao: number }) {
  useEffect(() => {
    const chave = `ev_licao_${curso}_${licao}`;
    try { if (sessionStorage.getItem(chave)) return; sessionStorage.setItem(chave, "1"); } catch { /* sem storage */ }
    const p = lerProgresso(curso);
    void fetch("/api/evento", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: "licao_aberta", pessoaId: p.pessoaId ?? null, dados: { curso, licao } }) }).catch(() => {});
  }, [curso, licao]);
  return null;
}
