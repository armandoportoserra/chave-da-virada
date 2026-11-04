"use client";
import { useSearchParams } from "next/navigation";
import Seta from "@/components/Seta";
export default function SetaEmbutida() {
  const q = useSearchParams();
  const texto = q.get("texto")?.trim() || "Desça: livro, cursos e oração";
  if (q.get("pilula") === "1") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-navy-deep shadow-lg">
        <span>{texto}</span>
        <span className="seta-pisca text-xl leading-none" aria-hidden="true">⌄</span>
      </div>
    );
  }
  return <Seta texto={texto} clara={q.get("clara") === "1"} compacta />;
}
