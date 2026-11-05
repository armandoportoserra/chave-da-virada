import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import BuscaIgrejas from "@/components/BuscaIgrejas";
export const metadata = { title: "Igrejas adventistas no Brasil — Igreja Adventista Nova Esperança" };
export default function Igrejas() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Igrejas adventistas no Brasil</p>
        <h1 className="serif mt-2 text-4xl font-semibold text-navy">Encontre uma igreja perto de você</h1>
        <p className="mt-3 text-lg text-ink/80">Escolha o estado e escreva a cidade. Os endereços aparecem separados por bairro, com mapa. Para ir quando e se quiser, por conta própria.</p>
        <div className="mt-6"><BuscaIgrejas /></div>
        <p className="mt-8 text-xs text-muted">Dados públicos do cadastro oficial da Igreja Adventista do Sétimo Dia (Divisão Sul-Americana). Mostramos só endereços; nenhum dado pessoal.</p>
      </main>
      <Rodape />
    </>
  );
}
