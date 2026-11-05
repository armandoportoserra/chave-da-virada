import Link from "next/link";
import Image from "next/image";
import Seta from "@/components/Seta";

// Vitrine: tudo o que o site oferece, um clique para cada coisa. Usada na página inicial e embutida no Framer (/ofertas?embed=1).
const ITENS = [
  {
    href: "/livro",
    rotulo: "Livro gratuito",
    titulo: "A Chave da Virada",
    texto: "Paz interior e saúde emocional. Leia em PDF agora, no celular ou no computador.",
    acao: "Abrir o livro",
    capa: "/livro/capa.jpg",
    cor: "#B5343F",
    fundo: "#FCEBEC",
  },
  {
    href: "/curso",
    rotulo: "Curso 1 · 20 lições",
    titulo: "A Chave da Virada em jogos",
    texto: "20 lições curtas em formato de jogo, um verso por pergunta, certificado no final.",
    acao: "Começar o Curso 1",
    emoji: "🌱",
    cor: "#E8923A",
    fundo: "#FFF4E8",
  },
  {
    href: "/curso2",
    rotulo: "Curso 2 · 21 lições",
    titulo: "Apocalipse — Revelações de Esperança",
    texto: "O último livro da Bíblia em 21 jogos, com um vídeo oficial por lição e certificado próprio.",
    acao: "Começar o Curso 2",
    emoji: "📖✨",
    cor: "#7A4FBF",
    fundo: "#F1EBFA",
  },
  {
    href: "/oracao",
    rotulo: "Oração",
    titulo: "Alguém orando por você",
    texto: "Conte o que está passando. A Esperança ora com você na hora e leva o pedido à igreja.",
    acao: "Pedir oração",
    emoji: "🙏",
    cor: "#2E9E63",
    fundo: "#E9F7EF",
  },
  {
    href: "/conversar",
    rotulo: "A qualquer hora",
    titulo: "Conversar com a Esperança",
    texto: "Nossa assistente responde de dia ou de madrugada. Tudo automático: ninguém liga, ninguém visita.",
    acao: "Quero conversar",
    emoji: "💬",
    cor: "#2F80C9",
    fundo: "#EAF3FC",
  },
  {
    href: "/musicas",
    rotulo: "Músicas",
    titulo: "Uma música para este momento",
    texto: "Hinos e músicas jovens adventistas de canais oficiais, por tema. Toque e ouça aqui mesmo.",
    acao: "Ouvir agora",
    emoji: "🎵",
    cor: "#8A5A2B",
    fundo: "#F7EFE6",
  },
  {
    href: "/perguntas",
    rotulo: "Perguntas e respostas",
    titulo: "O amor de Deus",
    texto: "Centenas de perguntas sobre Deus, dor, culpa, medo e esperança — cada resposta com um verso da Bíblia.",
    acao: "Ver as perguntas",
    emoji: "💛",
    cor: "#C9A227",
    fundo: "#FBF5DC",
  },
];

export default function Vitrine({ titulo = "Você escolhe o que quer receber", sub = "Só o que você pedir chega. Um clique e está aberto.", convite = "Continue descendo: tem mais para você" }: { titulo?: string; sub?: string; convite?: string | null }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h2 className="serif text-center text-4xl font-semibold text-navy" style={{ textWrap: "balance" }}>{titulo}</h2>
      <p className="mt-3 text-center text-muted">{sub}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ITENS.map((i) => (
          <Link key={i.href} href={i.href} className="card group flex gap-4 p-5 transition hover:-translate-y-1 hover:border-gold" style={{ borderTopColor: i.cor, borderTopWidth: 4 }}>
            <div className="shrink-0">
              {i.capa ? (
                <Image src={i.capa} alt={`Capa do livro ${i.titulo}`} width={84} height={120} className="h-[120px] w-[84px] rounded-md object-cover shadow-md" />
              ) : (
                <div className="flex h-[120px] w-[84px] items-center justify-center rounded-md text-4xl shadow-sm" style={{ background: i.fundo }} aria-hidden="true">{i.emoji}</div>
              )}
            </div>
            <div className="min-w-0">
              <small className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: i.cor }}>{i.rotulo}</small>
              <h3 className="serif mt-1 text-xl font-semibold leading-tight text-navy">{i.titulo}</h3>
              <p className="mt-2 text-sm text-muted">{i.texto}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-gold group-hover:underline">{i.acao} →</span>
            </div>
          </Link>
        ))}
      </div>
      {convite ? <Seta texto={convite} compacta /> : null}
    </section>
  );
}
