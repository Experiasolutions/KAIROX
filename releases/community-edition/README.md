# 🧬 KAIROS Community Edition — Contribuições para o Ecossistema AIOX

> Ferramentas e padrões criados durante a operação do KAIROS,
> devolvidos à comunidade AIOX. Compatíveis com AIOX v3.9+.
> Licença MIT. Sem código proprietário.

## ⚡ Quick Start

```bash
# 1. Clone ou copie a pasta community-edition para seu workspace AIOX

# 2. Comece pelo AIOX Father (mentor)
#    Leia: aiox-father/AIOX-FATHER.md

# 3. Siga o checklist da primeira semana
#    Leia: first-week-checklist/CHECKLIST.md

# 4. Use os templates prontos quando precisar
#    Copie de: agent-templates/TEMPLATES.md
```

> **Windows?** Substitua `cp -r` por `copy /Y` ou `xcopy /E /I`. Os arquivos são todos `.md`, sem dependências.

---

## O que é o KAIROS?

O KAIROS é um projeto pessoal construído em cima do AIOX. Em 10 dias de operação, foram criadas ferramentas que resolvem problemas reais que qualquer operador AIOX enfrenta: outputs rasos, tarefas que perdem o foco, e dificuldade de escalar para múltiplos clientes.

Estas 6 contribuições são as que mais ajudaram no meu dia a dia. Compartilho aqui para que outros operadores possam usar e melhorar.

---

## 📦 Contribuição 1: Opus Replicant Engine

**Problema:** LLMs respondem de forma superficial. Muitas vezes o output "parece certo" mas não tem profundidade real.

**Solução:** Um protocolo de raciocínio que força 3 camadas de análise em toda resposta:

| Camada          | O que faz                                      |
| :-------------- | :--------------------------------------------- |
| **Imediata**    | Responde o que foi perguntado                  |
| **Estrutural**  | Analisa premissas, dependências, e trade-offs  |
| **Estratégica** | Conecta com o contexto maior e próximos passos |

**5 Regras Core:**
1. **DEPTH** — Todo output percorre 3 camadas. Zero respostas superficiais.
2. **EVIDENCE** — Nenhuma afirmação sem evidência. Incerteza é declarada explicitamente.
3. **SYNTHESIS** — Outputs não-triviais reconhecem tensões e steel-man alternativas rejeitadas.
4. **MODULARITY** — Todo output é reutilizável por outros agentes.
5. **EVOLUTION** — O sistema melhora a cada sessão. Nunca o mesmo erro duas vezes.

**Arquivos incluídos:**
```
opus-replicant/
├── OPUS-REPLICANT-SYSTEM-v2.md      ← Especificação completa (1200+ linhas)
├── GEM_MODE_ACTIVATION.md           ← Ativação específica para Gemini
├── IMPLEMENTATION-GUIDE-QUICK.md    ← Guia rápido de implementação
├── constitutional-layer-v3.md       ← Guardrails de segurança
├── pm1-reasoning-master.md          ← PM1: Análise profunda
├── pm2-execution-master.md          ← PM2: Execução criativa
└── pm3-quality-master.md            ← PM3: Avaliação de qualidade
```

**Como usar:**
```bash
# Copie para seu workspace AIOX
cp -r opus-replicant/ .aiox-core/opus-replicator/

# Referência no seu agente master:
# Adicione as 5 regras core no identity-anchor do seu agente
```

**Resultado real:** Percebi redução significativa no retrabalho. Outputs que antes precisavam 2-3 iterações passaram a sair mais completos na primeira tentativa.

---

## 📦 Contribuição 2: Protocolo RP-MCP

**Problema:** Em tarefas complexas, o agente começa a executar mas perde o foco no meio. Ferramentas são invocadas sem clareza sobre o que "sucesso" significa.

**Solução:** Antes de executar tarefas complexas, criar um "Intent Document" mínimo (2-3 minutos) que define:

```
TAREFA COMPLEXA
      │
      ├── RP (INTENT.md)     → O QUE significa sucesso?
      │                         Quais critérios definem "feito"?
      │                         O que pode dar errado?
      │
      └── MCP (ferramentas)  → COMO executar?
                                Quais skills, agentes, APIs?
```

**Quando usar (2 ou mais destes sinais):**
- ✅ Decisão que não pode ser revertida facilmente
- ✅ Requer 3+ agentes ou ferramentas em sequência
- ✅ O critério de "pronto" não é óbvio
- ✅ Tem impacto em cliente ou código de produção

**Tarefas simples? Execute direto via MCP sem RP.**

**Arquivo incluído:**
```
rp-mcp-protocol/
└── PROTOCOL-RP-MCP-v1.0.md    ← Protocolo completo com template e exemplo
```

**Resultado real:** Eliminei quase totalmente a situação "tarefa finalizada mas não era isso que eu queria".

---

## 📦 Contribuição 3: Engine/Client Separation

**Problema:** Quando você atende mais de um cliente com o AIOX, tudo se mistura. Agentes genéricos contaminados com referências ao "Cliente X", impossível reutilizar o motor em outro domínio.

**Solução:** Separar o ENGINE (motor, domain-agnostic) do CLIENT (aplicação, domain-specific):

```
project-root/
├── squads/          ← ENGINE (motor — nunca referencia um cliente)
├── scripts/         ← ENGINE
├── .aiox-core/      ← ENGINE
├── clients/
│   ├── cliente-a/   ← APPLICATION (isolado)
│   └── cliente-b/   ← APPLICATION (isolado)
```

**Princípio:** "O AIOX é motor, não aplicação. Não tem domínio."

O mesmo motor que atende uma clínica de estética pode atender um pet shop. A inteligência está no motor. O domínio está no cliente.

**Arquivo incluído:**
```
engine-client-separation/
└── GUIDE.md    ← Guia com regras, detecção de contaminação, setup em 5 min
```

**Resultado real:** Testado com 270+ arquivos de aplicação isolados do engine. Zero contaminação de domínio entre clientes.

---

## Como instalar tudo de uma vez

```bash
# Clone ou copie a pasta community-edition para seu workspace

# 1. Opus Replicant
cp -r community-edition/opus-replicant/ .aiox-core/opus-replicator/

# 2. RP-MCP Protocol
cp community-edition/rp-mcp-protocol/PROTOCOL-RP-MCP-v1.0.md reasoning-packages/

# 3. Engine/Client Separation
mkdir -p clients/meu-primeiro-cliente/{agents,templates,data}
# Siga o GUIDE.md para mover arquivos de domínio
```

---

## 📦 Contribuição 4: AIOX Father — Mentor para Novos Operadores

**Problema:** Novos operadores instalam o AIOX e se perguntam: "E agora?"

**Solução:** Guia prático de 5 níveis que vai do primeiro agente até meta-agentes:

| Nível                  | O que aprende                 | Tempo  |
| :--------------------- | :---------------------------- | :----: |
| 1. Seu Primeiro Agente | Criar e ativar 1 agente       | Dia 1  |
| 2. Seu Primeiro Squad  | 2+ agentes trabalhando juntos | Dia 3  |
| 3. Motor vs Aplicação  | Separar engine de client      | Dia 7  |
| 4. Automação           | Sistema trabalha sozinho      | Dia 14 |
| 5. Meta-Agentes        | Sistema evolui sozinho        | Dia 30 |

Cada nível tem: mindset shift, exemplo prático, e checkpoint de validação.
Inclui seção honesta sobre **o que o AIOX NÃO faz**.

**Arquivo:** `aiox-father/AIOX-FATHER.md`

---

## 📦 Contribuição 5: Agent Templates Pack

**Problema:** Criar agentes do zero demora e a maioria dos operadores não sabe por onde começar.

**Solução:** 5 templates prontos para copiar e personalizar:

1. **Customer Service** — atendimento ao cliente 24/7
2. **Content Creator** — posts, captions, scripts de reels
3. **Code Reviewer** — revisão de PRs com foco em segurança
4. **Data Analyst** — dados → insights acionáveis
5. **Project Manager** — organização, sprints, priorização

Cada template inclui YAML completo com persona, princípios e comandos.

**Arquivo:** `agent-templates/TEMPLATES.md`

---

## 📦 Contribuição 6: First Week Checklist

**Problema:** A primeira semana com o AIOX é decisiva. Quem não vê resultado rápido desiste.

**Solução:** Checklist de 7 dias com 1 ação concreta por dia:

|  Dia  | Ação                  | Meta                          |
| :---: | :-------------------- | :---------------------------- |
|   1   | Conhecer a casa       | Entender onde cada coisa fica |
|   2   | Criar primeiro agente | 1 agente funcional            |
|   3   | Montar primeiro squad | 2 agentes em sequência        |
|   4   | Separar engine/client | Separação limpa               |
|   5   | Conectar Telegram     | Acessar pelo celular          |
|   6   | Automatizar algo      | 1 tarefa rodando sozinha      |
|   7   | Revisar e decidir     | Clareza sobre próximo mês     |

**Tempo total:** ~8-10 horas na semana.

**Arquivo:** `first-week-checklist/CHECKLIST.md`

---

## Compatibilidade

- AIOX v3.9+
- Funciona com qualquer LLM (Gemini, Claude, GPT, Groq, DeepSeek)
- Não tem dependências externas
- Licença MIT — use como quiser

---

## O que NÃO está incluído

Este é um release gratuito da comunidade. Componentes proprietários do KAIROS (Noesis Engine, Evolution Engine, IA Council, Mind Clones, Distillation Pipeline) **não** estão incluídos.

---

*Contribuição do projeto KAIROS para a comunidade AIOX.*
*Operador: Gabriel Lima | Grande ABC, SP | Fevereiro 2026*
*Feedback e melhorias são bem-vindos.*
