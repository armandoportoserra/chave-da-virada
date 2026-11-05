import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import { CONSENT_VERSAO } from "@/lib/consent";
export const metadata = { title: "Privacidade (LGPD) — A Chave da Virada" };
export default function Privacidade() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-5 py-12 prose-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Privacidade · LGPD · versão {CONSENT_VERSAO}</p>
        <h1 className="serif text-4xl font-semibold text-navy mt-2">Declaração de privacidade e ciência</h1>
        <div className="mt-6 space-y-5 text-ink/85 leading-relaxed">
          <section><h2 className="serif text-2xl text-navy">Quem é o controlador</h2><p>Igreja Adventista do Sétimo Dia Nova Esperança, Caxias do Sul – RS, responsável pelo projeto A Chave da Virada (Lei 13.709/2018 – LGPD). Para qualquer pedido sobre seus dados, escreva para a assistente Esperança no próprio site.</p></section>
          <section><h2 className="serif text-2xl text-navy">Um site 100% digital e automático</h2><p>Aqui ninguém liga, ninguém manda mensagem por conta própria e ninguém faz visitas. Não pedimos telefone, endereço nem bairro. Você lê, joga, ora, ouve músicas e pergunta no seu ritmo.</p></section>
          <section><h2 className="serif text-2xl text-navy">O que guardamos</h2><p>Só o que você mesmo escrever: o progresso das lições (no seu navegador), os pedidos de oração (anônimos, sem nome), as conversas com a Esperança (para ela continuar de onde parou) e, se você emitir um certificado, o nome que vai nele, o aproveitamento e o código. Contamos de forma anônima quantas lições foram abertas e concluídas, para o contador público do site.</p></section>
          <section><h2 className="serif text-2xl text-navy">Para que usamos (base legal)</h2><p>Só para o funcionamento automático do que você pediu, com base no seu consentimento (art. 7º, I) e no legítimo interesse de manter o serviço funcionando (art. 7º, IX). Nunca vendemos nem compartilhamos seus dados. Não usamos rastreadores de publicidade.</p></section>
          <section><h2 className="serif text-2xl text-navy">Quando alguém escreve algo que indica risco</h2><p>A assistente responde na hora com acolhimento, orienta a procurar alguém de confiança e oferece uma música de esperança. Ninguém da igreja entra em contato.</p></section>
          <section><h2 className="serif text-2xl text-navy">Seus direitos</h2><p>Você pode pedir para ver, corrigir ou apagar seus dados a qualquer momento: escreva <b>apagar meus dados</b> para a Esperança. Para parar mensagens no WhatsApp, escreva <b>sair</b>. Atendemos em até 15 dias.</p></section>
          <section><h2 className="serif text-2xl text-navy">Menores de 18 anos</h2><p>O conteúdo é livre para todas as idades. Como não há contato nem visitas, não coletamos dados de menores além do que eles mesmos escreverem; responsáveis podem pedir a exclusão a qualquer momento.</p></section>
          <section><h2 className="serif text-2xl text-navy">Onde ficam os dados</h2><p>Em servidores da Supabase e da Vercel, com acesso restrito à coordenação do projeto. Cookies: apenas os técnicos, para a conversa continuar e para lembrar que você já leu esta declaração.</p></section>
          <section><h2 className="serif text-2xl text-navy">Ciência</h2><p>Ao clicar em “Li e estou ciente” na entrada do site, você declara que leu este resumo e está ciente de como o site funciona.</p></section>
        </div>
      </main>
      <Rodape />
    </>
  );
}
