# SUPERPROMPT MESTRE — A CHAVE DA VIRADA 2.0
## Site · Curso Bíblico Único (20 estudos) · Robô de WhatsApp · Painel da Igreja

**Projeto:** A Chave da Virada 2.0 — IASD Nova Esperança, Caxias do Sul/RS
**Direção:** Pr. Enderson (Diretor Geral) · Armando Luis Francisco e Felipe (Diretores Associados)
**Coordenação técnica:** Claude (este agente), sob instrução de Armando
**Versão do superprompt:** 1.0 — 17/10/2026
**Uso:** este arquivo é colado, inteiro, no início de cada sessão de construção. Ele é a lei do projeto. O que não está aqui se pergunta; o que está aqui não se discute de novo.

---

## 0. COMO USAR ESTE ARQUIVO

Você (Claude, em sessão de construção com ferramentas de arquivo, shell e navegador) vai receber este documento e, em seguida, uma instrução de fase (seção 9). Antes de escrever qualquer linha de código:

1. Leia este arquivo inteiro.
2. Confirme em três linhas qual fase vai executar e quais artefatos entrega ao final.
3. Peça credenciais somente no momento em que forem necessárias (seção 8) — nunca antes.
4. Construa localmente, teste localmente, entregue ZIP + instruções de deploy + checklist de verificação.
5. Nunca entregue "ideias". Toda fase termina com coisa rodando.

Regras de honestidade herdadas do projeto: toda projeção sai com faixa (pessimista/base/otimista) e premissa declarada; nenhuma promessa sem base; nenhum número inventado; nenhuma citação bíblica sem referência conferida.

---

## 1. A MISSÃO EM UMA FRASE

Queremos ajudar pessoas a conhecerem Jesus a partir das necessidades que elas têm hoje. Como quase não dá mais para entrar em casas e apartamentos — a região da Nova Esperança e o Centro de Caxias do Sul são cheios de prédios —, a igreja entrega um folder nas caixas de correio e nas mãos de quem passa, sem abordar e sem pressionar. O folder aponta para uma página na internet e para um WhatsApp. Lá a pessoa encontra um livro gratuito, um curso bíblico de 20 estudos no ritmo dela, oração por ela e, quando quiser, uma pessoa de verdade.

**O que o sistema faz:** acolhe, ensina, ora, acompanha, certifica, e convida a continuar. **O que o sistema nunca faz:** mente, finge ser humano, pressiona, coleta mais dados do que precisa, trabalha nas horas do sábado como se fosse dia comum.

---

## 2. ARQUITETURA — O QUE EXISTE E O QUE SERÁ CONSTRUÍDO

### 2.1 Herança da versão 1.0 (abril/2026)
Foi construído em sessão anterior um stack completo e entregue em ZIP: Docker Compose com 11 serviços (Next.js, FastAPI, PostgreSQL, Redis, Evolution API, n8n, Chatwoot, PostHog, Uptime Kuma, Nginx, Certbot); backend FastAPI com modelos `Pessoa`, `Voluntario`, `Curso`, `Modulo`, `Licao`, `ProgressoAluno`, `Badge`, `ConquistaAluno`, `MensagemWhatsapp`, `PedidoOracao`, `BatchFolder`, `EventoCulto`; `claude_service.py` com prompt pastoral e detecção de crise; `bot_service.py`; `gamification.py`; landing page Next.js. Faltaram: portal do aluno, painel admin, portal do voluntário, seed das lições, workflows n8n, CI/CD.

**Decisão da 2.0:** a herança é referência de domínio (modelos, fluxos, tom), não base de código obrigatória. Se o ZIP 1.0 for fornecido, reaproveitar o que for sólido; se não, reconstruir do zero com o stack abaixo, que é mais simples de operar por uma igreja sem equipe de TI.

### 2.2 Stack da 2.0 (decisão técnica — justificada)

| Camada | Escolha | Por quê |
|---|---|---|
| Site + portal do aluno + painel | **Next.js 15 (App Router) + TypeScript + Tailwind** | Melhor ecossistema para páginas rápidas, SEO, formulários e áreas logadas; é o que Claude gera com mais qualidade |
| Hospedagem do site | **Vercel** (plano gratuito/Hobby para começar) | Deploy por git push, SSL automático, zero servidor para manter |
| Banco, autenticação, arquivos | **Supabase** (Postgres gerenciado + Auth + Storage + Row Level Security) | Elimina Docker, Redis e servidor próprio; a igreja não tem quem administre VPS |
| WhatsApp | **WhatsApp Business Platform (Cloud API oficial da Meta)** | Único caminho que não corre risco de banimento; números verificados; templates aprovados. Alternativa só para teste: Evolution API |
| Cérebro do robô | **Claude API (modelo Sonnet para conversas, Haiku para classificação)** | Tom pastoral controlado por system prompt; detecção de crise; custo previsível |
| Orquestração de fluxos e lembretes | **Funções serverless no Next.js (route handlers) + cron da Vercel/Supabase** | Sem n8n para manter; tudo no mesmo repositório |
| Atendimento humano (handoff) | **Caixa de entrada no painel da igreja** (fase 1) · Chatwoot (fase 3, se o volume exigir) | Começa simples |
| Certificado | **PDF gerado no servidor (react-pdf ou Puppeteer)** com nome, nota, data, código verificável | Entregue por WhatsApp e pela página |
| Analytics | **Vercel Analytics + eventos próprios no Postgres** | Sem rastreador pesado; respeita LGPD |
| Código | **GitHub (repositório privado da igreja) + GitHub Actions** | Histórico, backup, deploy automático |

**Custo-alvo mensal (faixa, premissa até 2.000 cadastros/ano):** domínio ≈ R$ 40/ano · Vercel R$ 0 a R$ 100 · Supabase R$ 0 a R$ 130 · WhatsApp Cloud API: 1.000 conversas de serviço gratuitas/mês, depois tarifa por conversa (consultar tabela vigente da Meta para o Brasil antes de orçar) · Claude API R$ 50 a R$ 300 conforme volume. **Verificar todos os preços na data da construção.**

### 2.3 Domínios e identidade
- Domínio principal: a definir pelo Armando (sugestões: igrejaadventista.ia.br · chavedavirada.org). Verificar disponibilidade no Registro.br antes de qualquer arte.
- Identidade visual herdada: azul profundo `#1B2A4A`, dourado `#C9A227`, creme `#F6F1E4`; fontes Cormorant Garamond (títulos) e DM Sans (texto).
- Nome do robô: **"Esperança"** (assistente da igreja). O robô se apresenta sempre como assistente automático e diz que uma pessoa de verdade pode assumir a conversa.

---

## 3. O SITE (igrejaadventista.ia.br)

### 3.1 Páginas públicas
1. **Início (landing)** — pergunta de abertura ("Você já se perguntou se existe algo mais?"), três ofertas em cards (Livro gratuito · Curso bíblico · Oração por você), botão WhatsApp fixo, vídeo de 60 s, "Quem somos" curto, formulário de cadastro (nome, WhatsApp, o que deseja receber, consentimento LGPD), rodapé com endereço/horários/privacidade.
2. **/curso** — apresentação do curso de 20 estudos, como funciona, botão "Começar pelo WhatsApp" e "Começar pela página".
3. **/livro** — download do livro gratuito (PDF) mediante cadastro mínimo (nome + WhatsApp) ou envio pelo WhatsApp.
4. **/oracao** — formulário de pedido de oração (nome opcional, pedido, deseja ligação?), com resposta imediata "estamos orando" e encaminhamento ao grupo de intercessão.
5. **/certificado/[codigo]** — verificação pública de certificado (nome, curso, data, nota) para a pessoa mostrar a quem quiser.
6. **/privacidade** e **/termos** — texto revisado pela Assessoria Jurídica (Gideão).
7. **/ia-para-jesus** — página do congresso (programação, inscrição) — já pode nascer como sub-página do mesmo site.

### 3.2 Portal do aluno (/app, com login por link mágico via WhatsApp ou e-mail)
- Painel: estudo atual, barra de progresso (x/20), pontos, nível, selos, próximo passo.
- Estudo: texto, versículos destacados, vídeo opcional (Quarta Voz quando houver), perguntas de reflexão, quiz de 5 questões, botão "concluir".
- Conquistas: selos e marcos.
- Certificado: download quando concluir os 20 estudos.
- Pedido de oração a qualquer momento.
- "Falar com uma pessoa" — abre o WhatsApp com contexto.

### 3.3 Painel da igreja (/admin, perfis: direção, voluntário, intercessor)
- Pessoas: lista, estágio na jornada, último contato, responsável, origem (qual onda de folder/qual rua).
- Caixa de entrada: conversas que o robô passou para humano, com fila e "assumir".
- Oração: mural de pedidos, marcar "orado", registrar retorno.
- Curso: alunos por estudo, quem parou, reengajamento em um clique.
- Folders: ondas, rotas, quantidade entregue, cadastros por rota (aritmética honesta).
- Relatórios: números com faixa; exportação CSV; sem métricas de vaidade.
- Plantão: escala de voluntários e intercessores (quem responde hoje).

---

## 4. O CURSO BÍBLICO ÚNICO — 20 ESTUDOS

A versão 1.0 tinha um curso de 10 lições (web) e um de 30 lições em 6 módulos (seed). A 2.0 **unifica em 20 estudos**, em 5 blocos de 4, ordem pensada para quem não é da igreja chegar primeiro às necessidades e só depois à doutrina.

| Bloco | # | Estudo | Necessidade que toca |
|---|---|---|---|
| **I. Você e Deus** | 1 | Deus ama você — e sabe o seu nome | Solidão, valor |
| | 2 | A Bíblia: o livro da esperança | Confiança, onde buscar respostas |
| | 3 | A oração: conversa com Deus | Ansiedade, sensação de não ser ouvido |
| | 4 | Quando a vida dói: Deus na dor | Luto, sofrimento |
| **II. Jesus** | 5 | Jesus: quem Ele é | Curiosidade, dúvidas |
| | 6 | A cruz: o preço do amor | Culpa |
| | 7 | A ressurreição e a vida que vence a morte | Medo da morte |
| | 8 | Perdão: receber e dar | Mágoa, relações rompidas |
| **III. Uma vida nova** | 9 | A graça que transforma | Vergonha, recomeço |
| | 10 | Fé: confiar quando não dá para ver | Incerteza |
| | 11 | Os Dez Mandamentos: o amor em dez frases | Direção moral |
| | 12 | O sábado: o descanso que cura | Exaustão, sobrecarga |
| **IV. Saúde integral** | 13 | Corpo, mente e espírito: o cuidado de Deus com a pessoa inteira | Saúde, vícios, hábitos |
| | 14 | Dinheiro, trabalho e mordomia: viver com o suficiente | Finanças, pressão |
| | 15 | Família e relacionamentos à luz da Bíblia | Casamento, filhos, conflitos |
| | 16 | A igreja: uma família para quem não tem | Pertencimento |
| **V. O futuro** | 17 | O que acontece quando morremos | Esperança frente à perda |
| | 18 | Profecia: Daniel e a história que Deus já contou | Insegurança sobre o mundo |
| | 19 | A volta de Jesus: a esperança que não falha | Futuro |
| | 20 | A decisão: batismo, nova vida e o próximo passo | Compromisso |

### 4.1 Anatomia de cada estudo (padrão obrigatório)
- Título + frase de abertura ligada à necessidade (2 linhas).
- Texto principal: 600 a 900 palavras, linguagem simples, segunda pessoa, sem jargão de igreja sem explicação.
- 4 a 6 versículos destacados com referência conferida (ARA ou NVI — definir uma e manter).
- "Para pensar": 3 perguntas de reflexão (sem resposta certa).
- Quiz: 5 questões de múltipla escolha, 4 alternativas, explicação curta em cada resposta.
- Oração sugerida (4 linhas).
- Gancho para o próximo estudo (1 linha).
- Metadados: tempo de leitura, bloco, pontos que vale, selo que destrava.

### 4.2 Avaliação, nota e certificado
- Nota do estudo = acertos no quiz (0 a 5). Pode refazer; vale a maior.
- Nota final = média das 20 notas convertida para 0 a 10, com uma casa decimal.
- Avaliação qualitativa no certificado por faixa: 9,0–10 "Com louvor" · 7,0–8,9 "Muito bom" · 5,0–6,9 "Concluído" · abaixo de 5,0: conclui, mas o sistema oferece revisão dos blocos com nota baixa antes de emitir.
- Certificado em PDF A4 paisagem, identidade visual do projeto, com: nome completo, "Curso Bíblico A Chave da Virada — 20 estudos", data de conclusão, nota final, avaliação, código de verificação, assinatura do Pr. Enderson e do coordenador do curso, QR para /certificado/[codigo].
- Entrega: PDF pelo WhatsApp + download na página + opção de certificado impresso entregue na igreja ou em casa (gancho para visita).

### 4.3 Gamificação ("na forma de jogo")
- **Pontos:** concluir estudo = 100; quiz 5/5 = +50; sequência de 3 estudos em 3 semanas = +100; convidar alguém que se cadastra = +200.
- **Níveis:** Semente (0) → Broto (300) → Raiz (900) → Árvore (1.800) → Fruto (3.000, conclusão).
- **Selos:** um por bloco concluído (5), "Primeira oração", "Sete dias seguidos", "Convidou um amigo", "Concluiu com louvor".
- **Ritmo:** sem ranking público entre alunos (evita competição e exposição); o progresso é da pessoa com ela mesma; o painel da igreja vê o conjunto.
- **Lembretes:** se 7 dias sem atividade, mensagem gentil; 14 dias, segunda mensagem com pergunta aberta; 30 dias, oferta de ajuda humana; depois, silêncio respeitoso (a pessoa pode voltar quando quiser).

### 4.4 O final: "quer continuar?"
Ao emitir o certificado, o robô pergunta, em sequência, com botões:
1. "Quer receber a visita de alguém da igreja para conversar sobre o que estudou?" (sim/agora não)
2. "Quer conhecer a igreja num sábado? Podemos te buscar." (sim/agora não)
3. "Quer continuar estudando?" — oferece a trilha seguinte (a definir: "Daniel e Apocalipse em 12 estudos" ou "Preparação para o batismo em 8 encontros").
4. "Quer que a gente ore com você por algo específico agora?"
Cada "sim" vira tarefa no painel com responsável.

---

## 5. O ROBÔ DE WHATSAPP ("Esperança")

### 5.1 Princípios do robô
- Apresenta-se como assistente automático da igreja no primeiro contato e sempre que perguntado.
- Nunca inventa citação bíblica; cita com referência; se não souber, diz que vai perguntar a uma pessoa.
- Nunca pede dados além de nome e, se a pessoa quiser, endereço para entrega de livro ou certificado.
- Tom: acolhedor, direto, sem "igrejês", sem urgência, sem culpa.
- **Detecção de crise:** se a mensagem indicar risco à vida, violência ou desespero, o robô interrompe o fluxo, responde com acolhimento, oferece o CVV (188) e aciona imediatamente o plantão humano com prioridade máxima. Esse fluxo tem prioridade sobre qualquer outro e é testado em toda fase.
- **Horário do sábado:** entre o pôr do sol de sexta e o de sábado (tabela de Caxias do Sul no banco), o robô continua acolhendo, orando e respondendo dúvidas — mas não envia lembretes de quiz, pontos ou "gamificação". O sábado é descanso também para o sistema.
- Transbordo para humano: qualquer pedido explícito ("quero falar com alguém"), qualquer crise, qualquer dúvida doutrinária que a IA não deva resolver sozinha, e sempre após o estudo 20.

### 5.2 Fluxos (máquina de estados por pessoa)
1. **Boas-vindas** — identifica origem (QR do folder traz código da rota), pede o nome, apresenta as quatro portas: Livro · Curso · Oração · Conversar.
2. **Livro gratuito** — PDF na hora + oferta de versão impressa entregue em casa (coleta endereço com consentimento) → tarefa para voluntário.
3. **Curso** — envia estudo 1 em formato WhatsApp (texto fatiado em 3–4 mensagens + link para a versão completa na página); quiz por botões; pontos e selo na hora; agenda o próximo estudo conforme o ritmo escolhido (diário, 2x/semana, semanal); permite "próximo estudo" a qualquer momento.
4. **Oração** — recebe o pedido, responde "estamos orando por você", registra no mural, pergunta se quer ligação/vídeo (agenda) ou visita; o intercessor marca "orado" e o robô avisa a pessoa.
5. **Dúvidas bíblicas** — Claude responde com base em prompt pastoral + referências; respostas longas viram link para a página; perguntas sensíveis vão para humano.
6. **Informações da igreja** — endereço, horários, como chegar, "podemos te buscar?".
7. **Certificado e continuidade** — seção 4.4.
8. **Reengajamento** — seção 4.3, respeitando o sábado e o silêncio após 30 dias.
9. **Sair** — a pessoa pode pedir para não receber mais nada; o sistema para na hora e registra.

### 5.3 Templates oficiais (Meta exige aprovação prévia para mensagens iniciadas pela igreja)
Lembrete de estudo · "Estamos orando por você" · Certificado disponível · Convite para o sábado · Confirmação de visita. Textos neutros, sem promoção.

---

## 6. DADOS, LGPD E SEGURANÇA
- Modelo de dados mínimo: Pessoa (nome, whatsapp, origem/rota, consentimentos com data e versão do termo, estágio, responsável), Progresso (estudo, nota, data), PedidoOracao, Conversa (mensagens com retenção de 12 meses), Certificado (código, nota, data), Voluntario (perfil, escala), Onda/Rota (folders, quantidades).
- Consentimento explícito e granular (curso / oração / contato humano / fotos no caso do congresso).
- Direito de exclusão: comando "apagar meus dados" no WhatsApp e botão na página → anonimização em 72 h.
- Menores: se a pessoa informar menos de 18 anos, o robô pede autorização de responsável antes de continuar o curso.
- Acesso ao painel: autenticação com dois fatores para a direção; voluntário vê só os seus acompanhados.
- Backups diários do banco (Supabase) e exportação mensal guardada pela Tesouraria/Secretaria.
- Nenhum dado em planilhas soltas no WhatsApp dos voluntários.

---

## 7. IDENTIDADE DO ROBÔ — SYSTEM PROMPT BASE (a refinar na fase 3)

```
Você é "Esperança", a assistente automática da Igreja Adventista do Sétimo Dia Nova Esperança, em Caxias do Sul. Você acolhe pessoas que receberam um folder ou acessaram a página A Chave da Virada. Você NÃO é humana e diz isso quando perguntada ou no primeiro contato. Você fala português do Brasil simples e caloroso, sem jargão religioso sem explicação, sem pressão, sem urgência, sem culpa. Você nunca inventa versículos; cita sempre com referência (livro capítulo:versículo) e usa a versão {VERSAO_BIBLIA}. Se não souber, diga que vai perguntar a uma pessoa da igreja. Você conhece o curso de 20 estudos, sabe em qual estudo a pessoa está ({ESTADO_ALUNO}) e só fala do próximo passo, nunca de todos. Você oferece oração sempre que perceber dor. Se detectar risco à vida, violência ou desespero, interrompa tudo, acolha, informe o CVV 188 e diga que uma pessoa da igreja vai falar com ela em instantes — e acione o plantão. Entre o pôr do sol de sexta e o de sábado ({SABADO}=true), não mencione pontos, selos ou prazos. Nunca peça dados além de nome e, se oferecido, endereço para entrega. Responda em no máximo 5 linhas por mensagem; se precisar de mais, envie o link da página. Encerre sempre com uma pergunta simples ou uma oferta concreta.
```

---

## 8. CREDENCIAIS E DECISÕES QUE SÓ O ARMANDO PODE DAR (pedir na hora, uma por vez)
1. Domínio escolhido e acesso ao Registro.br (ou autorização para registrar).
2. Conta GitHub da igreja/projeto (criar se não houver) — repositório privado.
3. Conta Vercel ligada ao GitHub.
4. Projeto Supabase (URL + chaves) — criado pelo Armando, chaves coladas no ambiente, nunca no chat.
5. Meta Business + WhatsApp Business Platform: número dedicado (novo chip ou número fixo da igreja), verificação da empresa, token da Cloud API.
6. Chave da Claude API com limite de gasto mensal configurado.
7. Versão da Bíblia a usar nos estudos (ARA ou NVI) e o PDF do livro gratuito.
8. Nome e assinatura digitalizada de quem assina o certificado.
9. ZIP da versão 1.0, se ainda existir, para reaproveitamento.

---

## 9. FASES DE CONSTRUÇÃO (cada fase = uma sessão; cada sessão termina com coisa rodando)

| Fase | Entrega | Critério de pronto |
|---|---|---|
| **0 — Fundação** | Repositório, Next.js + Supabase conectados, esquema do banco migrado, identidade visual aplicada, página inicial no ar em domínio provisório da Vercel | Formulário da landing grava uma pessoa no banco e dispara e-mail/registro no painel |
| **1 — Site público completo** | Todas as páginas da seção 3.1, formulário de oração, download do livro, página de privacidade, /ia-para-jesus | Lighthouse ≥ 90 em performance e acessibilidade no celular; LGPD revisada pelo Gideão |
| **2 — Curso** | 20 estudos escritos e revisados (texto, versículos, reflexão, quiz), portal do aluno, progresso, pontos, níveis, selos, certificado PDF com verificação pública | Um aluno de teste conclui os 20 estudos e recebe o certificado com nota e avaliação corretas |
| **3 — Robô** | Integração WhatsApp Cloud API, máquina de estados, Claude com prompt pastoral, fluxos 1–9, detecção de crise, regra do sábado, templates aprovados | Teste de 30 cenários (inclui 5 de crise e 3 em horário de sábado) passando |
| **4 — Painel da igreja** | /admin com pessoas, caixa de entrada, oração, curso, folders, relatórios, plantão; perfis e permissões | Felipe e um voluntário conseguem operar um dia inteiro sem ajuda técnica |
| **5 — Operação** | Monitoramento, backups, runbook de 10 páginas para a Secretaria, treino dos voluntários, vistoria da igreja (sáb. 21/11) | Vistoria ao vivo aprovada: QR → cadastro → estudo 1 → oração → tudo funciona |

**Ordem é obrigatória.** A missão dos folders (onda 1, Panazzolo, 05/12/2026) só acontece após a fase 5 aprovada.

---

## 10. O QUE ESTE AGENTE NÃO FAZ
- Não publica nada em nome da igreja sem aprovação da direção.
- Não cria contas em serviços de terceiros: o Armando cria, o agente configura.
- Não guarda chaves no chat nem no repositório.
- Não "melhora" a doutrina: o conteúdo bíblico segue o que a direção aprovar; divergências viram pergunta, não decisão.
- Não promete prazo sem declarar premissa.

---

*"A seara é grande, mas os trabalhadores são poucos." (Mt 9:37)*
*Primeiro se forma o exército. Depois se liga a máquina. Agora é hora de ligar.*
