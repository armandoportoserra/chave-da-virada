import Link from "next/link";

// Logo oficial (símbolo IASD + "Igreja Adventista Nova Esperança"), a mesma usada na vitrine.
export const LOGO_URL = "https://framerusercontent.com/images/313zDS4nWR3ckj2DYje6ZD13SZM.png";
export const SITE_VITRINE = "https://igrejanovaesperanca.framer.website";

export default function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2">
        <a href={SITE_VITRINE} className="flex items-center" aria-label="Igreja Adventista Nova Esperança — início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt="Igreja Adventista Nova Esperança" width={200} height={101} className="h-14 w-auto md:h-16" />
        </a>
        <nav className="hidden gap-6 text-sm font-medium md:flex">
          <a href={SITE_VITRINE} className="hover:text-gold">Início</a>
          <Link href="/curso" className="hover:text-gold">Curso</Link>
          <Link href="/conversar" className="hover:text-gold">Conversar</Link>
          <Link href="/livro" className="hover:text-gold">Livro</Link>
          <Link href="/oracao" className="hover:text-gold">Oração</Link>
          <Link href="/app" className="hover:text-gold">Meu progresso</Link>
        </nav>
        <Link href="/conversar" className="btn-gold px-4 py-2 text-sm">Quero conversar</Link>
      </div>
    </header>
  );
}
