import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import { CONSENT_VERSAO } from "@/lib/consent";
export const metadata = { title: "Privacidade — A Chave da Virada" };
export default function Privacidade() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-5 py-12 prose-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Privacidade · versão {CONSENT_VERSAO}</p>
        <h1 className="serif text-4xl font-semibold text-navy mt-2">Seus dados, em linguagem simples</h1>
        <div className="mt-6 space-y-5 text-ink/85 leading-relaxed">
          <section><h2 className="serif text-2xl text-navy">Quem somos</h2><p>Igreja Adventista do Sétimo Dia Nova Esperança, Caxias do Sul – RS, responsável pelo projeto A Chave da Virada. Contato: pelo WhatsApp do projeto ou pela assistente Esperança no site.</p></section>
          <section><h2 className="serif text-2xl text-navy">O que guardamos</h2><p>Só o que você informar: nome, WhatsApp e, se pedir visita, bairro e horário. As respostas do curso ficam no seu navegador; quando você emite o certificado, guardamos seu nome, o aproveitamento e o código. As conversas com a Esperança ficam registradas para que o robô continue de onde parou.</p></section>
          <section><h2 className="serif text-2xl text-navy">Para que usamos</h2><p>Para enviar o que você pedir (livro, lições, certificado), orar pelos pedidos e combinar uma visita só se você a pedir. Nunca vendemos nem compartilhamos seus dados com terceiros. Não usamos rastreadores de publicidade.</p></section>
          <section><h2 className="serif text-2xl text-navy">Quando alguém escreve algo que indica risco</h2><p>A assistente responde com os telefones de ajuda (188 CVV, 192 SAMU) e oferece uma visita. O registro fica marcado para que a igreja possa cuidar, se você pedir a visita.</p></section>
          <section><h2 className="serif text-2xl text-navy">Seus direitos (LGPD)</h2><p>Você pode pedir para ver, corrigir ou apagar seus dados, ou para não receber mais nada, a qualquer momento: escreva <b>sair</b> para a Esperança (para parar) ou <b>apagar meus dados</b> (para exclusão). Atendemos em até 15 dias.</p></section>
          <section><h2 className="serif text-2xl text-navy">Menores de 18 anos</h2><p>O curso pode ser feito por qualquer idade, mas visitas e contato só são combinados com um responsável.</p></section>
          <section><h2 className="serif text-2xl text-navy">Onde ficam os dados</h2><p>Em servidores da Supabase e da Vercel, com acesso restrito à coordenação do projeto, por senha. Cookies: apenas um cookie técnico para a conversa com a Esperança continuar; nada de rastreamento.</p></section>
        </div>
      </main>
      <Rodape />
    </>
  );
}
