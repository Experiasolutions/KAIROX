# 🧔 AIOX Father — Mentor para Novos Operadores

> De "pessoa que usa IA" para "pessoa que orquestra sistemas de IA".
> Um guia prático baseado na experiência real de 10 dias operando o AIOX.

---

## Antes de Começar

Este guia assume que você já instalou o AIOX. Se não instalou, siga a documentação oficial primeiro.

**O que este guia NÃO é:**
- Não é a documentação oficial do AIOX
- Não promete resultados mágicos
- Não substitui expertise no seu domínio de negócio

**O que este guia É:**
- Um roteiro prático do zero ao operacional
- Baseado em experiência real (não em teoria)
- Focado no mindset tanto quanto na técnica

---

## A Jornada — 4 Fases Cognitivas, 5 Níveis Práticos

```
Fase 1: "Eu uso IA"           → Nível 1 (Dia 1)
Fase 2: "Eu delego para IA"   → Nível 2 (Dia 3) + Nível 3 (Dia 7)
Fase 3: "Eu orquestro IA"     → Nível 4 (Dia 14)
Fase 4: "Meu sistema evolui"  → Nível 5 (Dia 30)
```

A maioria das pessoas fica presa na Fase 1. O AIOX existe para levar você à Fase 3+.
Este guia mapeia cada fase a níveis práticos com ações concretas.

---

## Nível 1 — Seu Primeiro Agente (Dia 1)

### O Mindset Shift
Você não está mais conversando com uma IA. Você está **definindo a personalidade e as regras** de um trabalhador autônomo. A diferença é que esse trabalhador precisa de instruções claras — mas depois executa sozinho.

### O que fazer

**1. Entenda a estrutura de um agente:**
```yaml
agent:
  name: [nome do agente]
  id: [identificador único]
  title: [o que ele faz em uma frase]

persona:
  role: [função específica]
  identity: [quem ele é]
  core_principles:
    - [regra 1]
    - [regra 2]
    - [regra 3]

commands:
  - name: [comando]
    description: [o que faz]
```

**2. Crie seu primeiro agente — um assistente simples:**

Crie o arquivo `.antigravity/agents/meu-assistente.md` com este conteúdo:

```yaml
# meu-assistente

agent:
  name: Assistente
  id: meu-assistente
  title: Assistente Pessoal do [Seu Nome]
  icon: 🤖
  whenToUse: Use para tarefas do dia a dia, organização e dúvidas rápidas.

persona:
  role: Assistente pessoal
  identity: Ajudo meu operador com tarefas do dia a dia. Sou direto, organizado e proativo.
  core_principles:
    - Respondo sempre em português
    - Priorizo clareza sobre completude
    - Pergunto antes de assumir

commands:
  - name: help
    description: Mostra comandos disponíveis
  - name: tarefas
    description: Lista minhas tarefas pendentes
  - name: resumo
    description: Resume o que foi feito na sessão
```

**3. Ative:** `@meu-assistente` no seu IDE compatível.

### ✅ Checkpoint Nível 1
- [ ] Criei um arquivo `.md` com definição YAML de agente
- [ ] O agente responde quando ativado
- [ ] Entendi que estou definindo REGRAS, não fazendo prompts

---

## Nível 2 — Seu Primeiro Squad (Dia 3)

### O Mindset Shift
Um agente sozinho é limitado. O poder real vem de **agentes que trabalham juntos**, cada um com uma especialidade. Você não faz o trabalho — você monta o time.

### O que fazer

**1. Entenda a estrutura de um squad:**
```
squads/
└── meu-squad/
    ├── squad.yaml      ← definição do squad
    └── agents/
        ├── writer.md   ← agente de escrita
        ├── reviewer.md ← agente de revisão
        └── publisher.md ← agente de publicação
```

**2. Crie um squad de conteúdo (exemplo real):**

`squads/conteudo/agents/writer.md`:
```yaml
agent:
  name: Writer
  id: content-writer
  title: Escritor de Conteúdo

persona:
  role: Criar textos para redes sociais
  identity: Escritor focado em engajamento e clareza
  core_principles:
    - Textos curtos e impactantes
    - Sempre terminar com CTA
    - Tom casual mas profissional
```

`squads/conteudo/agents/reviewer.md`:
```yaml
agent:
  name: Reviewer
  id: content-reviewer
  title: Revisor de Qualidade

persona:
  role: Revisar e melhorar textos antes de publicar
  identity: Crítico construtivo. Melhora sem destruir.
  core_principles:
    - Verificar gramática e ortografia
    - Avaliar tom e adequação ao público
    - Sugerir melhorias específicas (não genéricas)
```

**3. Use o fluxo:** Writer cria → Reviewer revisa → você aprova → publica.

### ✅ Checkpoint Nível 2
- [ ] Criei uma pasta `squads/[nome]/agents/` com 2+ agentes
- [ ] Cada agente tem responsabilidade clara e distinta
- [ ] Consigo acionar cada agente separadamente
- [ ] Pedi para outra pessoa interagir com meus agentes e avaliar (feedback externo)

---

## Nível 3 — Motor vs Aplicação (Dia 7)

### O Mindset Shift
Este é o conceito mais importante: **o AIOX é motor, não aplicação**.

O motor (engine) é genérico — funciona para qualquer negócio.
A aplicação (client) é específica — atende SEU domínio.

Se você misturar os dois, não consegue reutilizar o motor para outro cliente.

### O que fazer

**1. Separe:**
```
project-root/
├── squads/          ← MOTOR (genérico, nunca menciona seu negócio)
├── scripts/         ← MOTOR
├── .aiox-core/      ← MOTOR
└── clients/
    └── meu-negocio/ ← APLICAÇÃO (específico do seu domínio)
        ├── agents/
        ├── templates/
        └── data/
```

**2. Regra de ouro:** Se um arquivo em `squads/` menciona o nome de um cliente ou um domínio específico (ex: "clínica", "pet shop") → ele está no lugar errado. Mova para `clients/`.

**3. Teste:**
```bash
# Buscar contaminação de domínio
grep -r "nome-do-meu-negocio" squads/ scripts/
# Resultado esperado: NENHUM match
```

### ✅ Checkpoint Nível 3
- [ ] `squads/` não tem referência a nenhum domínio específico
- [ ] `clients/[nome]/` contém tudo que é específico do meu negócio
- [ ] Consigo imaginar usando o mesmo motor para outro tipo de negócio

---

## Nível 4 — Seu Sistema Trabalha Enquanto Você Dorme (Dia 14)

### O Mindset Shift
Até agora, você acionava agentes manualmente. Agora, o sistema roda **sozinho** em horários programados. Você acorda e encontra o relatório pronto.

### O que fazer

**1. Escolha um canal de comunicação:**
- Telegram Bot (mais simples — recomendado para começar)
- WhatsApp via integração de API (mais complexo, mas é onde seus clientes estão)

**2. Crie um scheduler simples:**
```javascript
const schedule = require('node-schedule');
const { execSync } = require('child_process');
const https = require('https');

// Todo dia às 6h: gera resumo e envia via Telegram
schedule.scheduleJob('0 6 * * *', async () => {
  console.log('[Scheduler] Gerando relatório matinal...');

  // 1. Executa seus scripts
  const status = execSync('node scripts/meu-status.js').toString();

  // 2. Envia via Telegram
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text: status });

  const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  req.write(body);
  req.end();
  console.log('[Scheduler] Morning brief enviado!');
});
```

**3. Use PM2 para manter rodando:**
```bash
npm install -g pm2
pm2 start meu-scheduler.js --name meu-sistema
pm2 save
```

### ✅ Checkpoint Nível 4
- [ ] Tenho pelo menos 1 tarefa que roda automaticamente
- [ ] Recebo o resultado sem acionar manualmente
- [ ] O processo sobrevive a um reboot do computador

---

## Nível 5 — Meta-Agentes (Dia 30)

### O Mindset Shift
Nível final: agentes que melhoram outros agentes. O sistema evolui sozinho.

Este nível é avançado e depende do seu contexto. Exemplos do que é possível:
- Agente que audita a qualidade dos outputs de outros agentes
- Agente que detecta gaps no sistema e propõe melhorias
- Agente que comprime memórias de sessões anteriores

### Recomendação honesta
Não tente o Nível 5 antes de ter os Níveis 1-4 sólidos. A maioria dos operadores vai extrair a maior parte do valor nos Níveis 2-3.

### ✅ Checkpoint Nível 5
- [ ] Tenho pelo menos 1 meta-agente operacional
- [ ] O sistema identificou e corrigiu um problema sem minha intervenção
- [ ] Entendo quando o sistema está evoluindo vs quando está "girando no vazio"

---

## Erros Comuns (aprendi na prática)

| Erro                                    | Consequência              | Solução                                   |
| :-------------------------------------- | :------------------------ | :---------------------------------------- |
| Criar 20 agentes no Dia 1               | Caos, nenhum funciona bem | Comece com 1. Adicione quando precisar.   |
| Não separar engine/client               | Impossível reutilizar     | Separe desde o Dia 1, mesmo com 1 cliente |
| Copiar agentes sem entender             | Base frágil               | Entenda o YAML antes de copiar            |
| Prometer resultados antes de testar     | Frustração                | Teste com você mesmo antes de vender      |
| Rodar tudo em paralelo em máquina fraca | Freezing                  | Execução serial. Respeite sua RAM.        |

---

## O que o AIOX NÃO faz

Sendo honesto (porque ninguém mais vai ser):

- **Não substitui expertise.** Se você não sabe marketing, um agente de marketing vai produzir conteúdo medíocre com confiança. Você precisa saber avaliar.
- **Não é mágico.** LLMs erram. Agentes erram. O sistema erra. A vantagem é que erra rápido e barato, não que nunca erra.
- **Não é "set and forget."** Precisa de manutenção, ajuste, e evolução constante.
- **Depende do LLM.** A qualidade do output depende do modelo que você usa. Free tier = boa para desenvolvimento. Produção com clientes = considere modelos pagos.

---

## Próximos Passos

1. Comece pelo Nível 1 hoje
2. Use a [First Week Checklist](../first-week-checklist/CHECKLIST.md) para guiar seus primeiros 7 dias
3. Quando travar, leia os [Agent Templates](../agent-templates/) para ver exemplos funcionais
4. Quando dominar os 3 primeiros níveis, explore o AIOX Father Nível 4-5

---

*AIOX Father — Mentor Protocol v1.0*
*Contribuição do projeto KAIROS para a comunidade AIOX*
*Baseado em 10 dias de operação real — Gabriel Lima, Fev 2026*
