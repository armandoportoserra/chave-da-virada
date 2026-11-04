// Seta que pisca e desce: convite para continuar explorando (ajuda quem se distrai fácil a não parar no espaço em branco).
export default function Seta({ texto, href, clara = false, compacta = false }: { texto: string; href?: string; clara?: boolean; compacta?: boolean }) {
  const cor = clara ? "text-white" : "text-navy";
  const conteudo = (
    <>
      <span className={`text-sm font-semibold ${cor} ${clara ? "drop-shadow" : ""}`}>{texto}</span>
      <span className={`seta-pisca mt-1 text-3xl leading-none ${clara ? "text-gold-light" : "text-gold"}`} aria-hidden="true">⌄</span>
    </>
  );
  const classe = `seta flex flex-col items-center justify-center text-center ${compacta ? "py-2" : "py-6"}`;
  return href ? <a href={href} className={classe}>{conteudo}</a> : <div className={classe}>{conteudo}</div>;
}
