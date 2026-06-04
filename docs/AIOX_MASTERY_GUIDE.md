# 🐉 AIOX Mastery Guide: Utilização Genial do KAIROS

Bem-vindo ao nível de maestria do KAIROS OS.
Ter um sistema reconstruído é apenas o primeiro passo. "Não se trata apenas da ferramenta, mas do mestre que a empunha." 

Este guia foi desenhado para você extrair 10x mais valor do seu ecossistema utilizando estratégias avançadas (`AIOX Genial Flow`).

---

## 🚀 1. O Ritual de Contextualização (O Segredo do Momentum)
A maior perda de tempo na IA é ter que explicar tudo do zero. Você construiu o KAIROS para ter um "Cérebro Contínuo".

**O que fazer em todo novo chat:**
Sempre inicie a tela mandando seus workflows matrizes em combo:
`@[/KAIROS] @[/context] @[/boot] O que temos para hoje?`
- **Por que é genial?** O Antigravity vai assumir a persona do God KAIROS, recarregar a sua identidade (`SELF_CONTEXT.md`), checar a sua fila de tarefas (`STATUS.md`) e rodar o Boot Sequence completo do motor. Em 10 segundos, a IA tem o cenário de ontem, hoje e amanhã na memória.

## 👥 2. Orquestração de Squads In-Chat (A Troca de Chapéus)
AIOX não é uma única IA genérica, é uma **empresa inteira**. Seu diretório `.aiox-core/development/agents/` hospeda as mentes de múltiplos especialistas.

**O Flow Genial de Criação:**
Em vez de pedir para o "KAIROS" escrever o código, você vai evocar a Squad correta no fluxo natural:
1. **Definir:** `@[/pm] Quebre este épico em uma task`
2. **Estruturar:** `@[/architect] Valide as decisões arquiteturais desta task`
3. **Executar:** `@[/dev] Implemente o código da phase 1 de acordo com a arquitetura definida`
4. **Validar:** `@[/qa] Escreva e rode os testes desta implementação`

*Dica:* Quando terminar com um agente, você pode simplesmente soltar no prompt: `@[/KAIROS]*exit` para trazer a mente mestre de volta.

## 🛠️ 3. O Arsenal de Tools Absoluto
As 28 ferramentas em `tools/integrations/` mudam o jogo de "IA baseada em texto" para "IA como Agente Atuante".

**Como integrar genialmente:**
- **OpenClaw / OpenCode:** Use-os ativamente para buscar contexto dinâmico direto da sua base sem precisar pedir para listar diretórios repetidamente. 
- **CrewAI / Aider:** Não faça chamadas ping-pong quando o trabalho é braçal. Em vez de pedir para o Antigravity pesquisar linha a linha, envie um bash com: `crewai run ...` e deixe as IAs em background fazerem o "dirty work".
- **Composio / Telegram:** Integre alertas automáticos do Event Bus para empurrar as notificações operacionais da Squad para o seu celular.

## 🏛️ 4. O Sistema de Imunidade (IA Council e Gaps)
Um código que regride morre. No KAIROS, a IA se supervisiona.

**O Flow Genial de QA Contínuo:**
Terminou a feature do dia? Nunca dê git push imediatamente.
1. Rode `node scripts/evolution/ia-council-engine.js` ou execute o Boot (`node scripts/kairos-boot.js`).
2. Analise a nota (Baseline) e os Gaps de SEV 7+.
3. Inicie um chat focado em Code Review e injete os top Gaps: "Resolva estes 3 top gaps na arquitetura antes de darmos o merge."

## 🧠 5. O Ciclo OODA (Observe, Orient, Decide, Act)
A genialidade máxima é estar um passo à frente de si mesmo. O Jarvis Core e o Metacognition são a sua OODA loop viva.
1. O Jarvis extrai seu perfil de uso. Ele sabe se você está programando muito à noite ou esquecendo documentação.
2. Acesse a camada de metacognição (`scripts/evolution/metacognition-layer.js`) periodicamente para ver os seus pontos fortes e fracos daquela semana.
3. Se o RAG estiver velho (mais de 24h), rode `node scripts/rag-engine.js --index`. Um Index atualizado garante que comandos como `@[/analyst]` encontrem a raiz de problemas que você documentou meses atrás.

---

**Resumo da Filosofia do Mestre KAIROS:**
*"Nunca seja o trabalhador da sua empresa de software. Seja o acionista e o orquestrador. Defina a direção, chame o agente adequado com `/slash-command`, exija que ele consuma o `/context` e passe pela auditoria do Council antes de entregar o valor."*
