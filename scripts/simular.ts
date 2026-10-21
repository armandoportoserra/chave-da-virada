// Simulador do robô "Esperança" no terminal — sem WhatsApp, sem banco.
// Uso:  npx tsx scripts/simular.ts            (interativo)
//       npx tsx scripts/simular.ts --auto     (percorre as 20 lições automaticamente)
import readline from "node:readline";
import { processar, tique, LICOES, TOTAL } from "../src/lib/robo/motor";
import { estadoInicial, type Estado, type Resultado } from "../src/lib/robo/tipos";

let estado: Estado = estadoInicial();
const auto = process.argv.includes("--auto");

function mostrar(r: Resultado) {
  for (const s of r.saidas) {
    console.log("\n🤖 " + s.texto.replace(/\n/g, "\n   "));
    if (s.botoes?.length) console.log("   [" + s.botoes.map((b) => `${b.id} ${b.titulo}`).join(" | ") + "]");
  }
  for (const a of r.acoes) console.log("   ⚙️  " + JSON.stringify(a));
  estado = r.estado;
}

function enviar(texto: string, botaoId?: string) {
  if (!auto) console.log(`\n👤 ${texto}`);
  mostrar(processar(estado, { texto, botaoId, agora: new Date() }));
}

if (auto) {
  // Percurso completo: nome, humor "sozinho", todas as lições, acerta tudo de primeira
  enviar("oi"); enviar("Maria Clara"); enviar("2"); enviar("Me manda o estudo");
  let guard = 0;
  while (estado.fase !== "concluido" && guard++ < 400) {
    const L = LICOES[estado.licaoAtual - 1];
    if (estado.aguardando === "quiz") enviar("ABC"[L.quiz!.correta]);
    else if (estado.aguardando === "exercicio") enviar("1");
    else if (estado.aguardando === "decisao") enviar("1");
    else if (estado.aguardando === "final") {
      // de vez em quando pede "amanhã" para testar o agendamento
      if (L.numero === 1) { enviar("Quero a lição 2 amanhã"); mostrar(tique(estado, new Date(Date.now() + 2 * 86_400_000))!); }
      else enviar(L.botoes[0]);
    } else enviar("lição");
  }
  console.log("\n==== RESUMO ====");
  console.log({ fase: estado.fase, pontos: estado.pontos, selos: estado.selos, concluidas: estado.concluidas.length, quizzes: estado.quizzesFeitos, acertos: estado.acertosPrimeira });
  // testes de segurança
  let t = estadoInicial(); t = processar(t, { texto: "oi" }).estado; t = processar(t, { texto: "João" }).estado;
  const c = processar(t, { texto: "não aguento mais viver" });
  console.log("crise:", c.estado.fase, c.acoes.map((a) => a.tipo));
  const o = processar(t, { texto: "sair" });
  console.log("optout:", o.estado.fase);
  const v1 = processar(t, { texto: "quero uma visita" }); const v2 = processar(v1.estado, { texto: "Bairro Centro, fim de tarde, 54 99999-0000" });
  console.log("visita:", v1.estado.fase, "->", v2.estado.fase, v2.acoes.map((a) => a.tipo));
  if (estado.concluidas.length !== TOTAL) { console.error("FALHOU: não concluiu as 20"); process.exit(1); }
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log("Simulador do robô Esperança. Digite como se fosse o WhatsApp. Ctrl+C para sair.");
  rl.on("line", (l) => { const m = l.match(/^#(\S+)/); enviar(m ? "" : l, m?.[1]); rl.prompt(); });
  rl.setPrompt("\n👤 "); rl.prompt();
}
