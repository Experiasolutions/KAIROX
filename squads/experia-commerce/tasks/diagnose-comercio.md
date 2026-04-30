---
task: Diagnóstico de Comércio Local
responsavel: "@commerce-master"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - nome_negocio: Nome do comércio
  - segmento: Tipo de negócio
  - brief_preenchido: Brief do onboarding (ou coletar agora)
  - dados_disponiveis: Qualquer número que o dono tenha (volume, ticket, horário)
Saida: |
  - vazamentos_identificados: Os 3 maiores pontos de perda de dinheiro
  - impacto_calculado: Valor estimado em R$/mês sendo perdido
  - priorizacao: P0/P1/P2 com justificativa de ROI
  - executor_indicado: Qual dos 4 Executores ataca cada problema
Checklist:
  - "[ ] Coletar dados básicos do brief (se não feito no onboarding)"
  - "[ ] Calcular perda por resposta lenta (mensagens × ticket médio)"
  - "[ ] Calcular perda por no-show (agendamentos × taxa × ticket)"
  - "[ ] Calcular custo de atendimento manual (horas × valor/hora)"
  - "[ ] Ranquear os 3 vazamentos por impacto financeiro"
  - "[ ] Definir P0 (maior impacto, menor esforço de implementar)"
  - "[ ] Indicar Executor correto para cada problema"
  - "[ ] Apresentar diagnóstico ao dono em linguagem simples"
---

# diagnose-comercio

Diagnóstico rápido de gargalos operacionais e cálculo de impacto financeiro
para qualquer comércio local. Identifica os 3 maiores vazamentos e prioriza por ROI.

## Uso

```
@commerce-master
*diagnose [contexto do negócio]
```

## Protocolo de Execução

### Step 1 — Coletar Dados Base

Perguntas essenciais (5 minutos com o dono):

```
1. Quantas mensagens você recebe por dia no WhatsApp? (estimativa)
2. Em quanto tempo você costuma responder? (minutos/horas)
3. Você tem agendamentos? Quantos no-shows por semana?
4. Qual o seu ticket médio? (valor médio por venda/atendimento)
5. Você ou funcionário responde? Quantas horas por dia nisso?
```

### Step 2 — Calculadora de Impacto

**Vazamento 1 — Resposta Lenta:**
```
Fórmula: msgs_sem_resposta_rapida × taxa_desistencia × ticket_medio × dias_uteis

Exemplo: 8 msgs/dia × 40% desistência × R$70 TKM × 22 dias = R$4.928/mês
```

**Vazamento 2 — No-Shows:**
```
Fórmula: agendamentos_semana × taxa_noshow × ticket_medio × 4 semanas

Exemplo: 15 agend/sem × 20% no-show × R$80 × 4 = R$960/mês
```

**Vazamento 3 — Custo de Atendimento Manual:**
```
Fórmula: horas_atendimento_dia × valor_hora × dias_uteis

Exemplo: 2h/dia × R$25/h × 22 dias = R$1.100/mês (tempo de alguém)
```

**Total Estimado:**
```
Impacto mensal = Vazamento 1 + Vazamento 2 + Vazamento 3
ROI potencial = Impacto mensal - Custo Experia
```

### Step 3 — Priorização P0/P1/P2

```
P0 (maior impacto, mais rápido de implementar):
  Critério: resolve em < 1 semana, impacto visível em < 7 dias
  Exemplo: Script de recepção + resposta automática dentro do horário

P1 (médio impacto, médio esforço):
  Critério: 2-4 semanas para implementar, impacto em 30 dias
  Exemplo: Relatório matinal + lembrete de agendamento

P2 (visão de longo prazo):
  Critério: fundação para escalar depois
  Exemplo: CRM básico em planilha + dashboard de métricas
```

### Step 4 — Indicação de Executor

| Problema | Executor |
|---|---|
| Resposta lenta / sem atendimento | @commerce-clone |
| No-show / sem lembrete | @commerce-worker |
| Sem dados / sem controle | @commerce-analyst |
| Ausência de follow-up | @commerce-clone |
| Processo repetitivo manual | @commerce-worker |
| Prospect não convertido | @commerce-sales |

### Step 5 — Apresentação ao Dono

Template de apresentação (linguagem simples, sem jargão):

```
[Nome do dono], fiz um levantamento rápido:

💸 VOCÊ ESTÁ PERDENDO (estimativa):
   • Clientes que não respondem rápido: R$[X]/mês
   • No-shows sem lembrete: R$[X]/mês
   • Tempo gasto no manual: R$[X]/mês

   Total estimado: R$[TOTAL]/mês

🎯 O QUE A GENTE RESOLVE PRIMEIRO:
   1. [Ação P0] → resultado em [prazo]
   2. [Ação P1] → resultado em [prazo]

Quer começar pelo [P0]?
```

## Output Esperado

Diagnóstico salvo em `clients/[negocio]/diagnostico.md` com:
- 3 vazamentos com impacto em R$
- P0/P1/P2 definidos
- Executor indicado para cada ação
- Script de apresentação para o dono

## Related

- **Agent:** @commerce-master
- **Task derivada:** onboard-comercio.md (diagnóstico é fase 2 do onboarding)
- **Segue para:** create-whatsapp-script.md / create-morning-report.md / create-sop.md
