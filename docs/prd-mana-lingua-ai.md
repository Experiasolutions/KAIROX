# MANA — Método de Aquisição Natural Acelerada
## Product Requirements Document (PRD)
**Version:** 1.0  
**Status:** DRAFT  
**Autor:** Morgan (PM Agent) · Experia Solutions  
**Baseado em:** RP-20260605-LINGUA-AI + Análise Atlas (Analyst)

---

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-06-05 | 1.0 | Documento inicial gerado a partir do RP-20260605-LINGUA-AI | Morgan (PM) |

---

## 1. Goals e Background Context

### 1.1 Goals

- Transformar o método MANA de Gabriel em produto EdTech escalável com IA, capturando o quadrante de mercado "Método Natural + Custo Acessível" atualmente vazio
- Gerar caixa imediato (Trilha A) enquanto o produto é construído (Trilha B), reduzindo o risco de execução a zero na semana 1
- Criar a métrica proprietária **"Memória de Aquisição"** — diferencial IP real que nenhum app de idiomas tem hoje — como moat competitivo de longo prazo
- Atingir R$3.050 em receita no mês 1 (5 alunos, Trilha A) e R$7.900+ no mês 3 com integração das duas trilhas
- Validar o agente de imersão diária com pelo menos 2 alunos reais completando 30 dias antes de qualquer decisão de escala

### 1.2 Background Context

Gabriel Ferreira é professor de inglês autônomo que desenvolveu empiricamente o Método MANA — chegando às mesmas conclusões de Krashen (Input Hypothesis) e Cummins (BICS/CALP) sem conhecê-los. O método tem comprovação prática: fluência conversacional em 6-8 meses vs 2-3 anos dos métodos tradicionais, com menor ansiedade e maior adesão. O gap crítico sempre foi a dependência de Gabriel para personalização e suporte entre aulas.

O produto MANA resolve exatamente esse gap: um agente de IA que replica as condições de imersão que Gabriel criava manualmente, 24/7, a custo marginal zero por aluno. O timing é ideal — Gabriel domina a stack técnica (Evolution API, N8N, Railway, Groq) e o mercado EdTech de idiomas no Brasil cresce 18% a.a. com o quadrante "método natural acessível" inteiramente vago.

---

## 2. Problema a Resolver

### Problema do Usuário (Aluno)

| Dor | Gravidade | Como MANA resolve |
|---|---|---|
| Anos de inglês na escola → zero fluência real | Crítica | Substitui tradução/gramática por aquisição contextual |
| Apps gamificados (Duolingo) → streak de 600 dias, trava na 1ª conversa | Alta | Mede aquisição real, não acertos de quiz |
| Professor humano → caro (R$80-150/h), só 1-2x semana | Alta | Agente IA 24/7, custo por aluno ~R$0 marginal |
| Material genérico → baixo engajamento | Média | 100% personalizado por interesses do aluno |
| Medo de errar → paralisia de produção | Alta | Método normaliza erro como parte do processo |

### Problema do Gabriel (Operador)

| Dor | Como MANA resolve |
|---|---|
| Apostila manual por aluno: horas de trabalho | Pipeline IA → 15 min por aluno/semana |
| Sem suporte de imersão entre aulas | Agente WhatsApp: imersão diária autônoma |
| Escala limitada ao tempo humano | Agente absorve imersão → Gabriel escala de 8 para 20+ alunos |
| Zero cases/prova social para marketing | Sistema documenta métricas de evolução desde aula 1 |

---

## 3. Usuário-Alvo

### ICP Primário (Trilha A — Aulas Imediatas)

- **Perfil:** Adulto brasileiro, 25-45 anos, profissional ou estudante universitário
- **Renda:** Classe média (pode pagar R$400-600/mês se perceber valor)
- **Dor ativa:** Inglês bloqueando promoção, viagem, networking ou autoestima
- **Comportamento:** Já tentou Duolingo/escola/curso — desistiu por falta de resultado real
- **Canal de aquisição:** WhatsApp pessoal de Gabriel → Instagram → indicação

### ICP Secundário (Trilha B — Produto)

- **Perfil:** Mesmo adulto, mas confortável com WhatsApp como canal de aprendizado
- **Comportamento:** Engaja diariamente com apps/bots de mensagem
- **Barreira zero** para início (sem download, sem cadastro complexo)

### ICP Terciário (Futuro — B2B)

- **Perfil:** Escolas de idiomas, empresas com times internacionais
- **Problema:** Precisam de método eficaz + custo razoável por aluno
- **Oportunidade:** Licenciamento do método + plataforma white-label

---

## 4. Requisitos Funcionais

### FR — Agente de Imersão Diária (Core do Produto)

**FR01:** O sistema DEVE enviar diariamente uma situação de imersão personalizada pelo WhatsApp, baseada nos interesses cadastrados no onboarding do aluno.

**FR02:** O agente DEVE continuar a cena após qualquer resposta do aluno — usando a forma correta de forma natural na sequência, NUNCA corrigindo de forma explícita.

**FR03:** O agente DEVE calibrar o nível de dificuldade das situações ao princípio i+1 de Krashen: levemente acima do nível atual detectado do aluno.

**FR04:** O sistema DEVE aceitar respostas misturadas (português + inglês), respostas incompletas e respostas incorretas sem interromper o fluxo de imersão.

**FR05:** O agente DEVE suportar sessões de 5, 15 ou 30 minutos conforme preferência cadastrada pelo aluno no onboarding.

### FR — Onboarding do Aluno

**FR06:** O sistema DEVE coletar no onboarding: nível atual (iniciante/básico/intermediário), 3 temas de interesse, objetivo principal (viagem/trabalho/cultura), disponibilidade diária e tom preferido (formal/informal/misto).

**FR07:** O onboarding DEVE ser conduzido inteiramente via WhatsApp — máximo 5 perguntas, máximo 3 minutos para completar.

**FR08:** O sistema DEVE gerar um perfil persistente do aluno a partir do onboarding, utilizável por todos os módulos subsequentes.

### FR — Engine de Conteúdo Adaptativo

**FR09:** O sistema DEVE gerar semanalmente: 5 situações de imersão, 1 texto/notícia adaptada ao nível e interesses, 1 sugestão de conteúdo nativo (vídeo/podcast/artigo).

**FR10:** A geração de conteúdo DEVE levar em conta o histórico de interações do aluno para evitar repetição de situações ou vocabulário já dominado.

**FR11:** O pipeline DEVE produzir um resumo semanal de 10 minutos para o Gabriel, com pontos de calibração e alertas para intervenção humana.

### FR — Memória de Aquisição (Diferencial IP)

**FR12:** O sistema DEVE monitorar a produção espontânea do aluno e identificar quando uma estrutura linguística é usada em contexto NOVO sem ser solicitada.

**FR13:** O sistema DEVE classificar cada estrutura linguística em 3 estados: `ADQUIRIDA` (uso espontâneo em contexto novo), `EM PROCESSO` (uso apenas quando praticado explicitamente), `NOVA` (introduzida, ainda sem evidência de uso).

**FR14:** O sistema DEVE exibir ao aluno um dashboard de progresso baseado em estruturas ADQUIRIDAS — não em taxa de acertos ou XP.

**FR15:** O sistema DEVE gerar relatório semanal para Gabriel com evolução do perfil de aquisição de cada aluno.

### FR — Geração de Material para Aulas (Trilha A)

**FR16:** O sistema DEVE gerar apostila personalizada por aluno em menos de 20 minutos de prompt, usando o perfil do aluno como input.

**FR17:** A apostila DEVE conter APENAS: situações contextuais, textos por interesse, sugestões de mídia. NUNCA exercícios de gramática isolada ou tradução.

### FR — Painel do Gabriel (Maestro)

**FR18:** Gabriel DEVE ver em um único painel: status de todos os alunos ativos, alertas de alunos sem interação em 48h, resumo semanal de cada aluno e recomendações de intervenção.

**FR19:** O painel DEVE ser acessível via WhatsApp (MVP) ou interface web simples (v2).

---

## 5. Requisitos Não-Funcionais

**NFR01 — Custo:** O MVP DEVE operar com custo de infraestrutura zero (Railway free tier + Groq free tier + Google Sheets). Custo por aluno DEVE ser menor que R$10/mês até 20 alunos.

**NFR02 — Disponibilidade:** O agente DEVE estar disponível 24/7. Downtime máximo aceitável: 2h/semana.

**NFR03 — Latência:** Resposta do agente ao aluno DEVE ser entregue em menos de 5 segundos após recebimento da mensagem.

**NFR04 — Protocolo do Método (CRÍTICO):** O agente NUNCA pode gerar: exercício de tradução, exercício de gramática isolada, correção explícita de erro. Violação desses requisitos invalida o diferencial do produto.

**NFR05 — Privacidade:** Conversas dos alunos são sensíveis. O sistema DEVE tratar todos os dados de conversa como confidenciais. Dados de alunos NUNCA podem ser compartilhados entre instâncias sem consentimento explícito.

**NFR06 — Escalabilidade:** A arquitetura DEVE suportar crescimento de 2 para 50 alunos sem refatoração estrutural.

**NFR07 — Personalização:** O nível de personalização do conteúdo DEVE ser perceptível pelo aluno — conteúdo genérico é equivalente a falha do produto.

**NFR08 — Manutenibilidade:** Gabriel DEVE conseguir ajustar o perfil de qualquer aluno em menos de 5 minutos, sem conhecimento técnico.

---

## 6. User Interface Design Goals

### 6.1 Visão Geral de UX

**Canal MVP:** WhatsApp — zero fricção, zero download, zero cadastro em site.  
**Paradigma central:** Conversa natural, não interface de app. O aluno não sente que está "usando um sistema".  
**Tom da experiência:** Parceiro nativo informal — não professor, não app gamificado, não chatbot corporativo.

### 6.2 Interaction Paradigms

- **Conversação assíncrona:** O aluno responde quando pode, dentro da janela do dia
- **Continuação de cena:** Toda interação é uma cena contínua — não perguntas isoladas
- **Progressão invisível:** O aluno percebe evolução sem "ver" métricas o tempo todo
- **Intervenção humana como bônus:** Gabriel aparece como "curadoria especial", não como obrigação do produto

### 6.3 Telas / Views Core (MVP)

| Tela | Canal | Usuário | Função |
|---|---|---|---|
| Onboarding Flow | WhatsApp | Aluno | 5 perguntas, gera perfil |
| Sessão de Imersão Diária | WhatsApp | Aluno | Conversa de imersão contextual |
| Dashboard de Aquisição | Google Sheets / Notion | Aluno | Estruturas ADQUIRIDAS vs EM PROCESSO |
| Painel do Maestro | WhatsApp (v1) / Web (v2) | Gabriel | Status de todos os alunos |
| Relatório Semanal | WhatsApp | Gabriel | Resumo de cada aluno + alertas |

### 6.4 Plataformas-Alvo

**MVP:** WhatsApp (Evolution API) + Google Sheets  
**V2:** Progressive Web App (mobile-first, Web Responsive)  
**V3:** App nativo (iOS + Android) — apenas se validado pela métrica de retenção 30d

### 6.5 Branding

**Nome do produto:** MANA (Método de Aquisição Natural Acelerada)  
**Tagline:** "Você aprende inglês como aprendeu português — sem saber que estava aprendendo."  
**Tom visual (v2):** Clean, confiante, científico sem ser acadêmico. Paleta: tons de azul profundo + âmbar. Tipografia: Inter.  
**Anti-padrão:** Nada de gamificação visual explícita (sem moedas, sem badges, sem streaks de fogo).

---

## 7. Premissas Técnicas

### 7.1 Repositório

- **Estrutura:** Integrado ao `commercial-ai-bots` repo existente em `src/config/clients/mana.json`
- **Stack unificada:** Reutiliza arquitetura de Evolution API + N8N + Groq já validada nos outros bots

### 7.2 Arquitetura de Serviços

```
WhatsApp (Evolution API)
        ↓
    N8N Workflows
    ├── Onboarding Flow
    ├── Daily Immersion Agent
    ├── Content Generation Pipeline
    └── Acquisition Memory Engine
        ↓
    LLM (Groq/Claude via God Pool)
        ↓
    Storage (Google Sheets MVP → Supabase v2)
```

### 7.3 Stack Técnica

| Componente | MVP | V2 |
|---|---|---|
| WhatsApp Gateway | Evolution API (Railway) | Evolution API |
| Orchestração | N8N (Railway free) | N8N |
| LLM | Groq (Llama 3.3 70B) via God Pool | Claude 3.5 Sonnet para conteúdo complexo |
| Storage | Google Sheets | Supabase (PostgreSQL) |
| Perfil do aluno | JSON no N8N | Supabase tabela `student_profiles` |
| Memória de aquisição | N8N + Sheets | Supabase tabela `acquisition_memory` |
| Dashboard aluno | Google Sheets compartilhado | PWA |
| Painel Gabriel | WhatsApp report | Web dashboard |

### 7.4 Premissas Adicionais

- Custo de infraestrutura: R$0/mês no MVP (todos free tiers)
- Gabriel opera como único administrador do sistema no MVP
- Sem app mobile no MVP — apenas quando retenção de 30d validada com 10+ alunos
- Compartilhamento de arquitetura com bots existentes (Paulo, Hortifruti, Porto Alemão): REUSE > ADAPT > CREATE
- Testes: manual no MVP (5 interações supervisionadas por aluno na semana 1), automatizado na v2
- Deploy: Railway (já configurado, token ativo)

---

## 8. Epic List

### Epic 1 — Fundação e Agente de Imersão MVP
**Objetivo:** Infraestrutura do MANA no `commercial-ai-bots`, onboarding via WhatsApp funcionando e agente de imersão diária operacional com pelo menos 2 alunos reais.

### Epic 2 — Engine de Conteúdo Adaptativo
**Objetivo:** Pipeline automatizado de geração de material personalizado que substitui a apostila manual de Gabriel, com relatório semanal automático para o maestro.

### Epic 3 — Memória de Aquisição
**Objetivo:** Sistema de detecção e classificação de estruturas linguísticas (ADQUIRIDA / EM PROCESSO / NOVA), com dashboard para aluno e relatório para Gabriel.

### Epic 4 — Painel do Maestro e Escala
**Objetivo:** Painel centralizado para Gabriel gerenciar todos os alunos ativos, com alertas de inatividade e recomendações de intervenção, suportando até 20 alunos simultâneos.

---

## 9. Epic Details

---

### Epic 1 — Fundação e Agente de Imersão MVP

> Estabelecer a configuração MANA no repositório `commercial-ai-bots`, construir o fluxo de onboarding de 5 perguntas e o agente de imersão diária no WhatsApp. Ao final deste epic, Gabriel poderá ativar o agente para 2 alunos reais e observar 30 interações de imersão sem violação do protocolo do método. Este é o critério de go/no-go para o Epic 2.

#### Story 1.1 — Configuração Base MANA no commercial-ai-bots

Como Gabriel (operador),  
Eu quero ter a estrutura de configuração do MANA no repositório,  
Para que todos os componentes subsequentes tenham uma base consistente e reutilizável.

**Acceptance Criteria:**
1. Arquivo `src/config/clients/mana.json` criado com: nome, persona do agente, regras do método (nunca corrigir, sempre continuar cena), idioma de operação e tom
2. Variáveis de ambiente adicionadas ao `.env.example`: `MANA_EVOLUTION_INSTANCE`, `MANA_GROQ_MODEL`, `MANA_SHEETS_ID`
3. Rota de entrada N8N para a instância MANA criada e testada com mensagem ping
4. Readme do client documentado: como ativar, como adicionar aluno, como desativar

---

#### Story 1.2 — Onboarding Flow via WhatsApp

Como aluno novo,  
Eu quero ser guiado por 5 perguntas simples no WhatsApp,  
Para que o sistema entenda meu perfil e personalize toda a experiência desde o primeiro dia.

**Acceptance Criteria:**
1. Flow de onboarding ativado por palavra-chave (ex: "START" ou link especial)
2. 5 perguntas em sequência: nível atual, 3 interesses, objetivo, disponibilidade diária, tom preferido
3. Cada pergunta apresenta opções numeradas — aluno só digita o número
4. Perfil salvo em Google Sheets com ID único do aluno (número WA), timestamp e todos os campos do onboarding
5. Mensagem de confirmação ao final: "Perfil criado! Sua primeira sessão de imersão começa amanhã às [horário preferido]."
6. Reativação de onboarding possível via comando "RESETPERFIL"

---

#### Story 1.3 — Agente de Imersão Diária Core

Como aluno ativo,  
Eu quero receber diariamente uma situação de imersão contextual no WhatsApp,  
Para que eu pratique inglês em contexto real sem a pressão da correção explícita.

**Acceptance Criteria:**
1. N8N scheduler envia situação de imersão diariamente no horário preferido do aluno
2. Situação gerada pelo LLM usa os interesses cadastrados no perfil do aluno
3. Após qualquer resposta do aluno, o agente CONTINUA A CENA (nunca corrige, nunca quebra o fluxo)
4. A forma correta aparece naturalmente na resposta do agente como parte da cena
5. Sessão encerra quando o aluno digita "bye", "ok", "tchau" ou após 30 minutos de inatividade
6. Log de cada interação salvo em Sheets: timestamp, input do aluno, output do agente, duração da sessão
7. Validação: 50 interações consecutivas sem nenhuma correção explícita do agente

---

#### Story 1.4 — Controle de Nível i+1

Como aluno,  
Eu quero que as situações de imersão sejam levemente desafiadoras mas compreensíveis,  
Para que meu cérebro adquira a linguagem sem frustração nem tédio.

**Acceptance Criteria:**
1. Sistema categoriza cada situação gerada em: iniciante / básico / intermediário / avançado
2. Situação do dia é sempre 1 nível acima do nível cadastrado no perfil do aluno
3. Após 5 sessões com alto engajamento (respostas longas), nível sobe automaticamente
4. Após 3 sessões com baixo engajamento (respostas de 1-2 palavras), nível desce
5. Mudança de nível gera log no perfil do aluno com data e motivo

---

### Epic 2 — Engine de Conteúdo Adaptativo

> Construir o pipeline automatizado que gera semanalmente material personalizado para cada aluno, substituindo as horas de trabalho manual de Gabriel por um processo de 15 minutos de revisão. O pipeline também produz recomendações de conteúdo nativo (mídia real) e um resumo para o maestro calibrar cada aluno.

#### Story 2.1 — Pipeline de Geração Semanal

Como Gabriel (maestro),  
Eu quero receber todo domingo um pacote de conteúdo pré-gerado para cada aluno,  
Para que eu só precise revisar e aprovar em 15 minutos, em vez de criar do zero.

**Acceptance Criteria:**
1. N8N scheduler executa todo domingo às 20h para todos os alunos ativos
2. Para cada aluno, pipeline gera: 5 situações de imersão para a semana + 1 texto adaptado ao nível/interesses + 1 sugestão de conteúdo nativo (vídeo/podcast/artigo)
3. Pacote salvo no Sheets com referência ao perfil do aluno e semana de competência
4. Gabriel recebe mensagem WA com link do pacote + resumo de 3 pontos por aluno
5. Gabriel pode aprovar com "OK [ID aluno]" ou solicitar ajuste com "AJUSTAR [ID aluno] [instrução]"
6. Conteúdo aprovado entra automaticamente na fila de envio da semana

---

#### Story 2.2 — Apostila Rápida para Aulas (Trilha A)

Como Gabriel (professor),  
Eu quero gerar uma apostila personalizada para qualquer aluno em menos de 20 minutos,  
Para que eu possa preparar aulas semanais sem perder horas de trabalho manual.

**Acceptance Criteria:**
1. Comando no WA: "APOSTILA [ID aluno]" inicia geração
2. Apostila gerada contém: 3 situações de imersão, 1 texto por interesse, 2 sugestões de mídia, glossário contextual (sem tradução — definições em inglês)
3. Apostila exportada como PDF ou link Google Docs em menos de 5 minutos após comando
4. Apostila NUNCA contém: exercício de gramática isolada, tradução, lista de vocabulário descontextualizada
5. Gabriel pode personalizar com flag: "APOSTILA [ID] FOCO=trabalho" para direcionar o tema

---

### Epic 3 — Memória de Aquisição

> Implementar o diferencial IP do MANA: o sistema que distingue estruturas linguísticas "aprendidas" (uso solicitado) de estruturas "adquiridas" (uso espontâneo em contexto novo). Esta é a métrica proprietária que nenhum app de idiomas tem hoje — e que justifica o posicionamento premium do produto.

#### Story 3.1 — Detector de Uso Espontâneo

Como sistema,  
Eu quero identificar quando um aluno usa uma estrutura linguística em contexto novo sem ser solicitado,  
Para que eu possa classificar essa estrutura como ADQUIRIDA com confiança científica.

**Acceptance Criteria:**
1. Sistema mantém lista de "estruturas introduzidas" por aluno, com data de introdução
2. A cada interação, LLM analisa a produção do aluno e identifica estruturas da lista que aparecem
3. Estrutura classificada como ADQUIRIDA quando: aparece em contexto diferente do introduzido E não foi solicitada pelo agente nessa sessão
4. Estrutura classificada como EM PROCESSO quando: aparece apenas quando o agente a usa primeiro
5. Log de cada classificação com evidência (trecho da conversa que justificou a decisão)

---

#### Story 3.2 — Dashboard de Progresso do Aluno

Como aluno,  
Eu quero ver claramente o que já penso em inglês vs o que ainda estou processando,  
Para que minha motivação seja alimentada por progresso real, não por pontos artificiais.

**Acceptance Criteria:**
1. Aluno recebe relatório quinzenal no WA: "Você já pensa em inglês: [lista de estruturas ADQUIRIDAS]"
2. Dashboard no Google Sheets (link compartilhado) mostra 3 colunas: ADQUIRIDAS / EM PROCESSO / NOVAS
3. Estruturas listadas em linguagem simples (não jargão linguístico): "pedir algo educadamente" não "conditional II"
4. Percentual de aquisição visível: "47% das estruturas que você praticou já são suas"
5. Nenhuma referência a acertos/erros, pontos ou streaks no dashboard

---

#### Story 3.3 — Relatório de Aquisição para Gabriel

Como Gabriel (maestro),  
Eu quero ver o perfil de aquisição de cada aluno em uma visão consolidada,  
Para que eu possa decidir em qual momento intervir, calibrar ou sugerir próximo objetivo.

**Acceptance Criteria:**
1. Relatório semanal inclui seção de aquisição: estruturas que avançaram de EM PROCESSO para ADQUIRIDA na semana
2. Alertas automáticos quando aluno tem 0 novas aquisições em 2 semanas consecutivas
3. Sugestão de intervenção gerada automaticamente: "Aluno X estagnado — sugerir mudança de foco para [área com mais engajamento]"
4. Gabriel pode marcar manualmente uma estrutura como ADQUIRIDA após observação em aula presencial

---

### Epic 4 — Painel do Maestro e Escala

> Centralizar o controle de Gabriel sobre todos os alunos ativos, suportando crescimento de 2 para 20+ alunos sem aumento proporcional de carga de trabalho. Inclui alertas proativos, recomendações de intervenção e métricas de saúde do produto.

#### Story 4.1 — Painel Consolidado via WhatsApp

Como Gabriel (maestro),  
Eu quero ver o status de todos os alunos ativos em uma única mensagem diária,  
Para que eu não precise entrar em cada conversa individualmente para monitorar.

**Acceptance Criteria:**
1. Gabriel recebe todo dia às 8h uma mensagem com: lista de alunos ativos, status de ontem (respondeu / não respondeu), nível atual e flag de alerta se houver
2. Alertas automáticos: aluno sem interação há 48h → WA para Gabriel + sugestão de mensagem de reengajamento
3. Comando "STATUS" retorna painel instantâneo a qualquer hora
4. Painel inclui métrica geral: "X de Y alunos completaram sessão ontem"

---

#### Story 4.2 — Gestão de Alunos via Comandos WA

Como Gabriel (maestro),  
Eu quero adicionar, pausar e encerrar alunos via comandos simples no WhatsApp,  
Para que eu gerencie toda a operação sem precisar de acesso a painel técnico.

**Acceptance Criteria:**
1. "ADDALUNO [número WA]" inicia onboarding para novo aluno
2. "PAUSAR [ID aluno] [dias]" pausa envio por período definido (férias, doença)
3. "ENCERRAR [ID aluno]" arquiva perfil e para envios (dados mantidos para case study)
4. "LISTAR" retorna lista de todos os alunos: ativos, pausados e encerrados
5. Confirmação com resumo do aluno antes de qualquer ação destrutiva

---

## 10. Restrições do Método (CRÍTICO — não negociáveis)

Estas restrições têm prioridade sobre qualquer requisito de funcionalidade:

| Restrição | Motivo | Impacto de violação |
|---|---|---|
| ❌ NUNCA gerar exercício de tradução | Ativa tradução mental → bloqueia aquisição | Invalida o diferencial do produto |
| ❌ NUNCA gerar gramática isolada | Aprendizado consciente ≠ aquisição | Replica o trauma da escola |
| ❌ NUNCA corrigir explicitamente | Cria ansiedade de erro → paralisia | Destrói o pilar 3 do método |
| ✅ SEMPRE continuar a cena | Refinamento orgânico sem interrupção | Core da mecânica de aquisição |
| ✅ SEMPRE personalizar pelo universo do aluno | Relevância = atenção = retenção | Sem personalização = produto genérico |
| ✅ SEMPRE usar forma correta naturalmente | Correção implícita via input de qualidade | Como o método realmente funciona |

---

## 11. Edge Cases e Mitigações

| EC | Cenário | Mitigação |
|---|---|---|
| EC-01 | Aluno espera livro didático/gramática | Onboarding explica a ciência (Krashen/Cummins) antes de começar |
| EC-02 | Agente corrige explicitamente | Prompt tem regra hard + teste de 50 interações antes de ir live |
| EC-03 | Aluno sem disciplina para imersão diária | Sessões de 5 min como mínimo viável; nudges de reengajamento |
| EC-04 | Material pouco personalizado | Onboarding detalhado + revisão semanal de Gabriel |
| EC-05 | Comparação com Duolingo | Reframing: "Duolingo te dá streak. Nós te damos conversa real em 6 meses." + case documentado |
| EC-06 | Gabriel sobrecarregado | Hard limit de 8 alunos até Epic 3 completo; agente absorve imersão diária |

---

## 12. Modelo de Receita

### Agora (Trilha A + Epic 1)

| Produto | Preço | Meta Mês 1 |
|---|---|---|
| Aula avulsa 1h | R$100 | 5 aulas = R$500 |
| Pacote mensal básico (4 aulas) | R$450 | 3 alunos = R$1.350 |
| Pacote mensal completo (4 aulas + agente diário) | R$600 | 2 alunos = R$1.200 |
| **Total Mês 1** | | **R$3.050** |

### Mês 3 (Trilha A + B integradas)

| Produto | Preço | Meta |
|---|---|---|
| Pacote com agente IA diário | R$700 | 8 alunos = R$5.600 |
| Consultoria de método para escolas | R$1.500 | 1/mês |
| Licença B2B (escolas) | R$800/mês | 2 escolas |
| **Total Mês 3** | | **R$7.900+** |

### Visão de Produto (6-12 meses)

| Produto | Preço | Escala |
|---|---|---|
| Assinatura plataforma MANA | R$150-300/mês | 50-200 usuários |
| Plano escola/empresa | R$800-2.000/mês | 5-20 contratos |
| Curso de formação no método | R$500 | lançamentos |

---

## 13. Métricas de Sucesso

### Métricas de Produto (North Star)

| Métrica | Meta MVP (8 semanas) | Meta Produto (6 meses) |
|---|---|---|
| Alunos completando 30 dias | 2 | 20 |
| Taxa de resposta diária | >60% | >75% |
| Estruturas ADQUIRIDAS por aluno/mês | >5 | >10 |
| NPS do método | >7 | >8.5 |
| Violações do protocolo (correções explícitas) | 0 | 0 |

### Métricas de Negócio

| Métrica | Meta Mês 1 | Meta Mês 3 |
|---|---|---|
| Receita | R$3.050 | R$7.900 |
| Alunos ativos (Trilha A) | 5 | 8 |
| Cases documentados | 1 | 3 |
| CAC (custo de aquisição) | R$0 (rede quente) | <R$50 |

### Go/No-Go para Epic 2

- [ ] Agente operando por 30 dias com 2 alunos reais
- [ ] Zero violações de protocolo em 50 interações auditadas
- [ ] Pelo menos 1 aluno relata "percebi que pensei em inglês sem querer"
- [ ] Gabriel consegue gerenciar 2 alunos em <30 min/semana de trabalho

---

## 14. Próximos Passos

### Para o Architect

> Leia este PRD completo e o RP-20260605-LINGUA-AI.md. A tarefa é definir a arquitetura técnica detalhada da stack N8N + Evolution API + Groq + Google Sheets para o Epic 1, com foco em: estrutura de dados do perfil do aluno, lógica de prompting do agente de imersão (garantindo as restrições do método), e desenho do pipeline de geração de conteúdo. O ponto mais crítico é o design do prompt do agente para nunca corrigir explicitamente — esse prompt é a alma do produto.

### Para o SM

> Leia o Epic 1 deste PRD e crie as user stories detalhadas com critérios de aceitação testáveis para as Stories 1.1 a 1.4. Prioridade: Story 1.2 (Onboarding) e Story 1.3 (Agente Core) são o caminho crítico. Story 1.1 é pré-requisito. Story 1.4 pode ser desenvolvida em paralelo com 1.3.

### Para o Dev (Trilha A — Imediata)

> Prioridade máxima antes de qualquer código: Gabriel precisa enviar a mensagem WA para os 3 alunos mais quentes da rede pessoal **hoje**. O sistema começa com Gabriel como agente manual, usando Claude/ChatGPT para gerar material. O código vem depois do primeiro aluno fechado.

---

*— Morgan, planejando o futuro 📊*  
*Referência: RP-20260605-LINGUA-AI · Análise: Atlas (Analyst) · Filtro: Alan Nicolas (Revenue)*
