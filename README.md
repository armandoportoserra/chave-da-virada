# A Chave da Virada 2.0

Site, curso bíblico de 20 estudos, robô de WhatsApp e painel da igreja — IASD Nova Esperança, Caxias do Sul/RS.

Documento-lei do projeto: `docs/SUPERPROMPT_A_CHAVE_DA_VIRADA_2.0.md`.

## Stack
Next.js 16 (App Router, TypeScript, Tailwind 4) · Supabase (Postgres, Auth, Storage) · WhatsApp Cloud API · Claude API · Vercel.

## Rodar localmente
```bash
npm install
cp .env.example .env.local   # preencher as chaves
npm run dev                  # http://localhost:3000
```
Sem Supabase configurado o site roda e o formulário responde `modo: "sem_banco"` (nada é gravado — só para desenvolvimento).

## Colocar no ar — fase 0 (o que o Armando faz, uma vez)
1. **GitHub** — criar repositório privado `chave-da-virada` e enviar este código (`git init && git add . && git commit -m "fase 0" && git remote add origin … && git push`).
2. **Supabase** — criar projeto (região South America/São Paulo). No *SQL Editor*, colar e executar `supabase/migrations/0001_fundacao.sql`. Em *Project Settings → API*, copiar URL, `anon key` e `service_role key`.
3. **Vercel** — *New Project → Import* do repositório. Em *Environment Variables*, colar as variáveis do `.env.example` (as chaves do Supabase entram **aqui**, nunca no chat). Deploy.
4. **Domínio** — em Vercel → *Domains*, adicionar `igrejaadventista.ia.br` (ou o escolhido) e apontar o DNS no Registro.br conforme a tela.
5. **Teste** — abrir o site, preencher o formulário; a pessoa deve aparecer em `pessoas` no Supabase.

## Estrutura
```
src/app/            páginas (/, /curso, /livro, /oracao, /app, /admin…) e rotas de API
src/components/     cabeçalho, rodapé, formulário, botão WhatsApp
src/lib/            supabase, telefone, consentimento
supabase/migrations esquema do banco
docs/               superprompt e documentos do projeto
```

## Fases
0 Fundação ✅ · 1 Site público · 2 Curso e portal do aluno · 3 Robô · 4 Painel · 5 Operação.
A missão dos folders (Panazzolo, 05/12/2026) só após a fase 5 aprovada.

## Robô "Esperança" (WhatsApp) — fase 3, carregado

As 20 lições estão em `src/content/licoes.json` (geradas de `CURSO_Bloco_I…md` e `CURSO_Blocos_II_a_V…md` por `scripts/importar-licoes.py`, que também gera `supabase/migrations/0002_licoes.sql`).

| Arquivo | O que faz |
|---|---|
| `src/lib/robo/motor.ts` | Máquina de estados pura: nome → como está → lições (7 msgs, quiz/exercício/decisão, 188 sempre) → selos → certificado. Intenções globais: *pessoa*, *orem*, *sair*, *voltar*, *lição*, *pontos*, *sábado*. |
| `src/lib/robo/crise.ts` | Detecção de crise (prioridade sobre tudo): mensagem com 188/192, conversa marcada `crise` (prioridade 9), tarefa para o plantão. O robô não envia mais nada até um humano fechar. |
| `src/lib/robo/sabado.ts` | Pôr do sol de Caxias do Sul calculado; do pôr do sol de sexta ao de sábado o cron não envia nada. |
| `src/lib/robo/persistencia.ts` | Supabase: pessoas, conversas (estado em `contexto`), mensagens, progresso, conquistas, pedidos_oracao, tarefas, certificados, eventos. |
| `src/lib/whatsapp.ts` | Cloud API: texto, botões (≤3) ou lista; assinatura do webhook; parser do payload. |
| `src/app/api/whatsapp/webhook/route.ts` | GET verificação Meta · POST mensagens. |
| `src/app/api/cron/robo/route.ts` | A cada 15 min (vercel.json): envia "lição amanhã" e no máx. 2 lembretes suaves. |
| `src/app/certificado/[codigo]/page.tsx` | Certificado verificável e imprimível (`/certificado/CV-DEMO` funciona sem banco). |

**Testar sem WhatsApp:** `npx tsx scripts/simular.ts` (conversa no terminal) ou `npx tsx scripts/simular.ts --auto` (percorre as 20 lições e os testes de crise/saída).

**Ligar de verdade:** aplicar `0001` e `0002` no SQL Editor do Supabase → preencher `.env` (ver `.env.example`) → deploy na Vercel → cadastrar o webhook na Meta. Número provisório: o do Armando; depois migrar para o número da igreja.

**Pontuação:** quiz 100 (de primeira) / 50 (segunda) / 25 (revelado); exercício 100; selo de bloco 400. Aproveitamento do certificado = % de quizzes acertados de primeira: ≥90 Com louvor · ≥75 Muito bom · ≥60 Concluído · abaixo "Concluído com dedicação" (nunca "nota baixa").

## Site completo (etapas 1–7, 17/10/2026)

| Rota | O que é |
|---|---|
| `/` | Vitrine com texto de esperança, 188 visível, botões para conversar e jogar. |
| `/curso` · `/curso/[n]` | As 20 lições em formato jogo (`src/content/curso_jogo.json`): 8 perguntas, verso acende, 10 pts, vídeo com capa, 188. Progresso no navegador (`localStorage`), evento no banco. |
| `/curso/certificado` | Fim das 20: nome + WhatsApp + consentimento → `/api/certificado` emite código; oferece o Curso 2 (Apocalipse, 21 lições, em preparação). |
| `/conversar` | Robô Esperança na web (`Chat.tsx` → `/api/conversar`): mesmo motor do WhatsApp; lições viram link para o jogo; crise, oração, *visita*. Sessão por cookie (`pessoas.sessao_site`). |
| `/oracao` | Pedido de oração (robô ora; pedido guardado para a oração da igreja) com opção de visita; detecção de crise também aqui. |
| (sem painel) | Tudo é robô. O único ponto humano é a **visita**: quando a pessoa pede (chat, oração ou certificado), grava em `tarefas` e avisa a igreja por WhatsApp (`AVISO_WHATSAPP`) e/ou webhook (`AVISO_WEBHOOK_URL`). Sinal de crise: 188/192 + oferta de visita + aviso. |
| `/certificado/[codigo]` | Certificado verificável e imprimível. |

Sem Supabase configurado tudo roda em modo de teste (chat em memória, certificado `CV-DEMO`).
