---
task: Onboarding de Comércio Local
responsavel: "@commerce-master"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - nome_negocio: Nome do comércio
  - segmento: Tipo de negócio (petshop, padaria, hortifruti, etc.)
  - dono: Nome do dono
  - canal_principal: WhatsApp / presencial / ambos
  - dor_principal: Maior problema operacional relatado
Saida: |
  - brief_preenchido: Template de brief completo
  - diagnostico: Os 3 maiores vazamentos de dinheiro identificados
  - plano_p0: 1-2 ações prioritárias para a primeira semana
  - delegacao: Qual Executor assume cada ação P0
# --- Triage Engine v4 (Fases 1 a 6) ---
triage_fase_1_intencao: "Comercial / Aquisição e Onboarding"
triage_fase_2_persona: "@commerce-master"
triage_fase_3_advisory: ["Hormozi", "Finch"]
triage_fase_4_squad: "experia-commerce"
triage_fase_5_surface: "C004, C005"
triage_fase_6_ecosystem: ["diagnose-comercio", "create-whatsapp-script", "brief-comercio"]
---

# onboard-comercio

Executa o onboarding completo de um novo comércio local na Experia.
Segue o protocolo Commerce Master: Brief → Diagnóstico → Plano → Delegação.

## Uso

```
@commerce-master
*onboard [Nome do Negócio]
```

## [Fase 7] Executar (Protocolo Core)

### Step 1 — Brief (10 min)

Coletar via conversa (não mandar formulário — é presencial ou WhatsApp):

```
NEGÓCIO: _______________
SEGMENTO: _______________
DONO: _______________
CANAL PRINCIPAL: [ ] WhatsApp  [ ] Presencial  [ ] Ambos
MAIOR DOR: [ ] Resposta lenta  [ ] Clientes perdidos  [ ] Sem controle  [ ] Outro: ___
VOLUME DIÁRIO (msgs/pedidos estimados): _______________
QUEM RESPONDE HOJE: _______________
TEMPO MÉDIO DE RESPOSTA: _______________
OBJETIVO EM 30 DIAS (mensurável): _______________
```

### Step 2 — Diagnóstico (5 min)

Calcular impacto financeiro:
```
Leads perdidos/dia × Ticket médio = R$ perdidos/dia
R$ perdidos/dia × 22 dias úteis = R$ perdidos/mês

Exemplo: 8 msgs sem resposta × R$60 TKM = R$480/dia = R$10.560/mês
```

Identificar os 3 gargalos de maior impacto:
1. **Gargalo de velocidade:** Demora para responder
2. **Gargalo de cobertura:** Horários sem atendimento
3. **Gargalo de follow-up:** Cliente some, ninguém retoma

### Step 3 — Plano P0/P1/P2

```
P0 (Esta semana):
  - [Automação de maior impacto imediato]
  - Executor: @commerce-[clone|worker|analyst]

P1 (Próximo mês):
  - [Segunda prioridade]
  - Executor: @commerce-[clone|worker|analyst]

P2 (Próximo trimestre):
  - [Visão de expansão]
```

### Step 4 — Delegação e Kickoff

- Confirmação com o dono: "Você topou? Vou precisar de 30 minutos seus nos próximos 3 dias."
- Delegar P0 para o Executor correto (@commerce-analyst, etc).
- Agendar check-in em 7 dias para medir resultados.

## [Fase 8] Quality Gate (QA ≠ executor)

A validação do plano gerado deve ser auditada:
- [ ] O impacto financeiro (Diagnóstico) é realista e provável?
- [ ] A Métrica de Sucesso do trial é objetiva e binária (Conseguiu ou não)?
- [ ] O dono do negócio validou e DEU O 'OK' no plano de ação proposto?
- [ ] O plano P0 tem viabilidade de entrega técnica (N8N/Evolution) em até 3 dias?

## [Fase 9] Session State

Atualizações de estado do sistema:
- Registrar a ativação do Trial no `STATUS.md` ("BOSS FIGHT" sections).
- O agente `commerce-master` aciona o Hivemind para documentar o kickoff via log no arquivo JSONL do event bus (Supabase/engine).

## [Fase 10] Output Encapsulado

O output padronizado deve ser devolvido como:
```
ONBOARDING COMPLETO — [Nome do Negócio]
Data: [DATA] | Operador: Gabriel (Experia)

DIAGNÓSTICO:
• Perda estimada: R$___/mês
• Gargalos: [...]

PLANO:
• P0: [...] → @commerce-[executor] — prazo: [DATA]
• P1: [...] → @commerce-[executor] — prazo: [DATA]

MÉTRICA DE SUCESSO DO TRIAL:
• [Métrica]: de [X] para [Y] em 30 dias

STATUS: ✅ Onboarding completo. Trial iniciado.
```
