"use client";
import { useSearchParams } from "next/navigation";
import Seta from "@/components/Seta";
export default function SetaEmbutida() {
  const q = useSearchParams();
  const texto = q.get("texto")?.trim() || "Desça: livro, cursos e oração";
  return <Seta texto={texto} clara={q.get("clara") === "1"} compacta />;
}
