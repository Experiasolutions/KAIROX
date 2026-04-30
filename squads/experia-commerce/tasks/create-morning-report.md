---
task: Criar Relatório Matinal para Comércio
responsavel: "@commerce-analyst"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - nome_negocio: Nome do comércio
  - segmento: Tipo de negócio
  - kpis_escolhidos: 3-5 métricas definidas para o negócio
  - fonte_dados: Planilha / WhatsApp webhook / Forms
  - horario_envio: Horário desejado (padrão: 8h00)
  - numero_dono: WhatsApp do dono para receber o relatório
Saida: |
  - template_relatorio: Mensagem do relatório matinal pronta
  - instrucoes_coleta: Como coletar os dados necessários (manual ou automático)
  - instrucoes_envio: Como configurar o envio automático
  - kpis_definidos: Os 3-5 KPIs escolhidos com fórmula de cálculo
# --- Triage Engine v4 (Fases 1 a 6) ---
triage_fase_1_intencao: "Operacional / Retenção Comercial"
triage_fase_2_persona: "@commerce-analyst"
triage_fase_3_advisory: ["Godin", "Hormozi"]
triage_fase_4_squad: "experia-commerce"
triage_fase_5_surface: "C001, C002"
triage_fase_6_ecosystem: ["onboard-comercio", "RP-Zero-Budget-Revenue"]
---

# create-morning-report

Cria o relatório matinal diário para o dono do comércio receber no WhatsApp.
Filosofia: 3 números certos valem mais que 30 métricas ignoradas.

## Uso

```
@commerce-analyst
*kpis [Nome do Negócio] [segmento]
*morning-report [Nome do Negócio]
```

## [Fase 7] Executar (Protocolo Core)

### Step 1 — Definir KPIs (com o dono)

Pergunta ao dono: "Se você pudesse saber apenas 3 coisas todo dia de manhã sobre seu negócio, o que seriam?"

KPIs padrão por segmento:

| Segmento | KPI 1 | KPI 2 | KPI 3 |
|---|---|---|---|
| Petshop | Agendamentos do dia | No-shows ontem | Clientes p/ reativar |
| Hortifruti | Pedidos delivery | Clientes ativos | Produto + pedido |
| Salão/Barbearia | % agenda preenchida | No-shows do mês | Novos vs. retorno |
| Restaurante | Pedidos online | Tempo médio resposta | Avaliações semana |
| Padaria | Encomendas confirmadas | Pedidos antecipados | Ticket médio |

### Step 2 — Template do Relatório

```
🌅 Bom dia, [Nome]! Aqui está seu [DIA], [DATA]:

📈 ONTEM:
• [KPI 1]: [Valor] ([+/-X]% vs. anteontem)
• [KPI 2]: [Valor] ([+/-X]% vs. anteontem)
• [KPI 3]: [Valor]

⚠️ ATENÇÃO HOJE:
• [Alerta se existir — ex: "3 agendamentos sem confirmação"]

✅ AGENDA:
• [N] agendamentos/pedidos confirmados
• [N] aguardando confirmação

— Sistema Experia 🏪
```

### Step 3 — Fonte dos Dados (Free Trial)

Para free trial (zero custo adicional):
Dados manuais do dono → Planilha Google Sheets → Fórmulas automáticas → Coleta via script API WhatsApp.

### Step 4 — Configurar Envio

**Opção A — Manual (free trial inicial):**
Gabriel recebe os dados da planilha e envia o relatório.
**Opção C — Automático (escalado):**
Supabase → N8N (cron job) → WhatsApp via Evolution API

## [Fase 8] Quality Gate (QA ≠ executor)

A validação deve ser feita preferencialmente por `@qa` ou o Operador:
- [ ] Cabe em 1 tela de celular (máx. 10 linhas)?
- [ ] O tom é humano, e não parece gerado por um robô de sistema de TI?
- [ ] Primeiro envio feito manualmente e aprovado pelo dono?
- [ ] O dono sabe atuar e tomar decisão baseado nos 3 KPIs enviados?

## [Fase 9] Session State

Atualizar o tracking de retenção do trial:
- Adicionar no `STATUS.md` na seção "BOSS FIGHT" o status: `Morning Report Configurado`.
- Atualizar a tabela Supabase via `/sync` (se disponível).

## [Fase 10] Output Encapsulado

O output exato gerado deve ser salvo:
- Template: `clients/[negocio]/morning-report-template.md`
- Instruções de coleta: `clients/[negocio]/data-collection.md`
