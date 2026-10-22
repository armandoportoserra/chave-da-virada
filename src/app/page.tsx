import { Suspense } from "react";
import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import FormCadastro from "@/components/FormCadastro";

const ofertas = [
  {
    titulo: "Um livro gratuito",
    texto: "Sobre paz interior e saúde emocional. Em PDF na hora, ou impresso na sua casa, se preferir.",
    href: "/livro",
    icone: "📖",
  },
  {
    titulo: "Estudos sobre esperança, em formato de jogo",
    texto: "20 lições curtas, 8 perguntas cada, um verso por pergunta. Começa por “Você não está sozinho”. Certificado no final, sem ninguém cobrando presença.",
    href: "/curso",
    icone: "🌱",
  },
  {
    titulo: "Alguém orando por você",
    texto: "Conte o que está passando. A Esperança ora com você na hora, e o pedido é levado à oração da igreja. Se quiser, uma visita.",
    href: "/oracao",
    icone: "🙏",
  },
];

const jornada = [
  ["1", "Você escolhe o que quer receber", "Livro, curso, oração ou uma conversa. Só o que você pedir."],
  ["2", "Fala quando precisar", "A Esperança, nossa assistente, responde aqui no site a qualquer hora — de madrugada também."],
  ["3", "Você caminha no seu tempo", "Sem prazo, sem cobrança. Pode parar e voltar quando quiser."],
  ["4", "A porta fica aberta", "Se um dia quiser uma visita ou conhecer a igreja, é só pedir. Se não, tudo bem também."],
];

export default function Home() {
  return (
    <>
      <Cabecalho />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-navy text-cream">
          <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-gold blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-navy-light blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">Você não está sozinho.</p>
              <h1 className="serif text-5xl font-semibold leading-tight md:text-6xl">
                Você não precisa <span className="text-gold-light">atravessar isso</span> sozinho
              </h1>
              <p className="mt-6 max-w-lg text-lg text-cream/85">
                Talvez a vida esteja pesada demais. Talvez ninguém saiba o quanto. Aqui tem um lugar para desabafar,
                orar e caminhar — no seu tempo, sem ninguém bater na sua porta. Só se você pedir.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/conversar" className="btn-gold">
                  Quero conversar
                </Link>
                <Link href="/curso/1" className="btn-outline">
                  Começar a lição 1
                </Link>
              </div>
              <p className="mt-6 text-sm text-cream/70">Se você está pensando em desistir da vida, ligue <a href="tel:188" className="font-bold text-gold-light">188</a> (CVV, gratuito, 24h) ou <Link href="/conversar" className="font-bold text-gold-light">fale com a gente agora</Link>.</p>
            </div>
            <div className="card bg-white text-ink" id="cadastro">
              <h2 className="serif text-2xl font-semibold text-navy">Escolha o que quer receber</h2>
              <p className="mb-4 text-sm text-muted">Leva menos de um minuto.</p>
              <Suspense fallback={null}>
                <FormCadastro />
              </Suspense>
            </div>
          </div>
        </section>

        {/* OFERTAS */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="serif text-center text-4xl font-semibold text-navy">Três portas. Você escolhe qual abrir.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ofertas.map((o) => (
              <Link key={o.href} href={o.href} className="card transition hover:-translate-y-1 hover:border-gold">
                <div className="text-4xl" aria-hidden="true">
                  {o.icone}
                </div>
                <h3 className="serif mt-3 text-2xl font-semibold text-navy">{o.titulo}</h3>
                <p className="mt-2 text-sm text-muted">{o.texto}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-gold">Saber mais →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* JORNADA */}
        <section className="bg-cream-dark">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="serif text-center text-4xl font-semibold text-navy">Como funciona</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {jornada.map(([n, t, d]) => (
                <div key={n} className="relative rounded-2xl bg-white p-6">
                  <span className="serif absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-lg font-bold text-navy-deep">
                    {n}
                  </span>
                  <h3 className="mt-3 font-semibold text-navy">{t}</h3>
                  <p className="mt-2 text-sm text-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUEM SOMOS */}
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <h2 className="serif text-4xl font-semibold text-navy">Quem está do outro lado</h2>
          <p className="mt-6 text-lg leading-relaxed text-ink/85">
            Somos a Igreja Adventista do Sétimo Dia Nova Esperança, em Caxias do Sul. Não vamos aparecer na sua porta
            nem insistir. Acreditamos que Jesus muda a vida de quem O conhece, e queremos apenas deixar a porta aberta
            para você, do jeito e no tempo que fizer sentido.
          </p>
          <p className="serif mt-8 text-2xl text-navy-light">
            “Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.”
            <span className="block text-base text-muted">Mateus 11:28</span>
          </p>
        </section>
      </main>
      <Rodape />
    </>
  );
}
