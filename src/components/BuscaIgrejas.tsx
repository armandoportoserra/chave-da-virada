"use client";
import { useState } from "react";
import { UFS, type Resultado, type Igreja } from "@/lib/igrejas";

function Mapa({ g }: { g: Igreja }) {
  if (g.lat == null || g.lng == null) return null;
  const d = 0.006;
  const bbox = `${g.lng - d},${g.lat - d},${g.lng + d},${g.lat + d}`;
  return <iframe title={`Mapa — ${g.nome}`} className="mt-3 h-56 w-full rounded-xl border border-line" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${g.lat},${g.lng}`} />;
}

export default function BuscaIgrejas() {
  const [uf, setUf] = useState("RS");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [res, setRes] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");
  const [aberto, setAberto] = useState<number | null>(null);

  async function buscar(e: React.FormEvent) {
    e.preventDefault(); setEstado("buscando"); setErro(""); setAberto(null);
    try {
      const r = await fetch(`/api/igrejas?uf=${uf}&cidade=${encodeURIComponent(cidade)}`);
      const j = await r.json(); if (!r.ok) throw new Error(j.erro ?? "Erro.");
      setRes(j); setEstado("ok");
    } catch (err) { setErro(err instanceof Error ? err.message : "Erro."); setEstado("erro"); }
  }

  return (
    <div>
      <form onSubmit={buscar} className="card grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
        <label className="block"><span className="text-sm font-semibold">Estado</span>
          <select value={uf} onChange={(e) => setUf(e.target.value)} className="field mt-1">{Object.entries(UFS).map(([s, n]) => <option key={s} value={s}>{n}</option>)}</select>
        </label>
        <label className="block"><span className="text-sm font-semibold">Cidade</span>
          <input value={cidade} onChange={(e) => setCidade(e.target.value)} required minLength={2} className="field mt-1" placeholder="Ex.: Caxias do Sul" />
        </label>
        <button className="btn-gold" disabled={estado === "buscando"}>{estado === "buscando" ? "Buscando…" : "Buscar igrejas"}</button>
      </form>
      {estado === "erro" && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
      {estado === "ok" && res && (
        <div className="mt-6">
          {res.total === 0 ? (
            <p className="card text-center">Não encontramos igrejas adventistas cadastradas em <b>{cidade}</b> ({uf}). Confira o nome da cidade, com acentos.</p>
          ) : (<>
            <p className="text-sm text-muted">{res.total} {res.total === 1 ? "endereço" : "endereços"} em <b className="text-navy">{res.cidade} – {res.uf}</b>, por bairro.</p>
            <div className="mt-4 space-y-6">
              {res.bairros.map((b) => (
                <section key={b.bairro}>
                  <h2 className="serif text-2xl font-semibold text-navy">📍 {b.bairro}</h2>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {b.igrejas.map((g) => (
                      <div key={g.id} className="card p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gold">{g.tipo} adventista</p>
                        <h3 className="font-semibold text-navy">{g.nome}</h3>
                        <p className="mt-1 text-sm text-ink/80">{g.rua || "Endereço não informado"}{g.cep ? ` · CEP ${g.cep}` : ""}</p>
                        {g.lat != null && <button type="button" onClick={() => setAberto(aberto === g.id ? null : g.id)} className="mt-2 text-sm font-semibold text-gold underline">{aberto === g.id ? "Fechar mapa" : "Ver no mapa"}</button>}
                        {aberto === g.id && <Mapa g={g} />}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>)}
        </div>
      )}
    </div>
  );
}
