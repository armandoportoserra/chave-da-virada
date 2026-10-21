import Link from "next/link";

export default function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="serif text-xl font-semibold text-navy">
          A Chave da Virada
        </Link>
        <nav className="hidden gap-6 text-sm font-medium md:flex">
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
