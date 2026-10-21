import Link from "next/link";

export default function Rodape() {
  return (
    <footer className="mt-auto bg-navy-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="serif text-2xl font-semibold text-gold">A Chave da Virada</p>
          <p className="mt-2 text-sm text-cream/80">Um projeto missionário da Igreja Adventista do Sétimo Dia Nova Esperança, Caxias do Sul/RS.</p>
        </div>
        <div className="text-sm text-cream/80">
          <p className="font-semibold text-cream">Onde estamos</p>
          <p className="mt-2">IASD Nova Esperança<br />Caxias do Sul – RS</p>
          <p className="mt-2">Sábados pela manhã.</p>
        </div>
        <div className="text-sm text-cream/80">
          <p className="font-semibold text-cream">Links</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/curso" className="hover:text-gold">Curso bíblico</Link></li>
            <li><Link href="/livro" className="hover:text-gold">Livro gratuito</Link></li>
            <li><Link href="/oracao" className="hover:text-gold">Pedido de oração</Link></li>
            <li><Link href="/ia-para-jesus" className="hover:text-gold">Congresso IA para Jesus</Link></li>
            <li><Link href="/privacidade" className="hover:text-gold">Privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/60">
        “Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.” — Mateus 11:28
      </div>
    </footer>
  );
}
