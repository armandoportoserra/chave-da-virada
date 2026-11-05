"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_VERSAO, LGPD_RESUMO } from "@/lib/consent";

// Declaração de ciência (LGPD) na primeira entrada. Dentro do Framer (embed) não aparece: lá o pop-up de entrada já traz a ciência.
export default function AvisoLgpd() {
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    try {
      if (document.documentElement.classList.contains("embed")) return;
      if (localStorage.getItem("lgpd_ciente") === CONSENT_VERSAO) return;
    } catch { /* sem storage: mostra */ }
    setAberto(true);
  }, []);
  if (!aberto) return null;
  const ciente = () => { try { localStorage.setItem("lgpd_ciente", CONSENT_VERSAO); } catch { /* ok */ } setAberto(false); };
  return (
    <div role="dialog" aria-modal="true" aria-label="Declaração de ciência LGPD" className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-ink shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">LGPD · Lei 13.709/2018</p>
        <h2 className="serif mt-1 text-2xl font-semibold text-navy">Declaração de ciência</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/85">{LGPD_RESUMO.map((l) => <li key={l}>{l}</li>)}</ul>
        <p className="mt-3 text-xs text-muted">Ao continuar, você declara que leu e está ciente. <Link href="/privacidade" className="underline">Ler a política completa</Link>.</p>
        <button type="button" onClick={ciente} className="btn-gold mt-4 w-full">Li e estou ciente</button>
      </div>
    </div>
  );
}
