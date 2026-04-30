---
task: Criar SOP de Processo para Comércio
responsavel: "@commerce-worker"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - nome_negocio: Nome do comércio
  - processo: Nome e descrição do processo a documentar
  - frequencia: Quantas vezes por semana/dia acontece
  - quem_executa: Dono ou funcionário (para calibrar complexidade)
  - ferramentas_disponiveis: O que já usam hoje
Saida: |
  - sop_documento: SOP completo com trigger, passos, exceções e rollback
  - automacao_possivel: Se pode ser automatizado e com qual ferramenta
  - casos_de_teste: 5 cenários para validar o fluxo
  - checklist_validacao: Quality gates antes de ir para produção
Checklist:
  - "[ ] Mapear o processo atual (como é feito hoje, passo a passo)"
  - "[ ] Verificar: deve ser eliminado antes de automatizar?"
  - "[ ] Identificar trigger (o que dispara o processo)"
  - "[ ] Documentar passos em ordem lógica"
  - "[ ] Documentar exceções e o que fazer em cada uma"
  - "[ ] Definir rollback (como desligar manualmente)"
  - "[ ] Criar 5 casos de teste"
  - "[ ] Executar quality gates"
  - "[ ] Aprovar com o dono"
---

# create-sop

Documenta um processo operacional de um comércio local e define
se e como automatizar. Filosofia Tim Ferriss: Eliminar → Simplificar → Automatizar.

## Uso

```
@commerce-worker
*map [processo]
*sop [processo] [negócio]
*automate [processo]
```

## Protocolo de Execução

### Step 1 — Triagem (Eliminar Primeiro)

Antes de documentar, questionar:

```
1. Este processo precisa existir? Se não fosse feito, o negócio pararia?
2. Pode ser simplificado? Estamos fazendo passos desnecessários?
3. Quem REALMENTE precisa estar envolvido?
4. Com que frequência acontece? (Se < 1x/mês, não automatizar)
```

### Step 2 — Mapeamento do Processo Atual

Entrevistar quem executa:
```
"Me mostra exatamente o que você faz quando [trigger do processo] acontece.
Passo a passo, sem pular nada."
```

Documentar sem julgamento — primeiro entender como é, depois melhorar.

### Step 3 — Template SOP

```markdown
# SOP: [Nome do Processo]
Versão: 1.0 | Data: [DATA] | Negócio: [NEGÓCIO]
Responsável original: @commerce-worker

## Objetivo
[O que este processo faz e qual resultado ele garante]

## Trigger
[O que dispara este processo]
Exemplos: "Cliente manda mensagem no WhatsApp" / "Chegou às 8h" / "Agendamento confirmado"

## Pré-requisitos
- [O que precisa estar pronto antes de começar]

## Passos
1. [Passo 1 — específico e executável]
2. [Passo 2]
3. [Passo 3]
[Máx. 7 passos. Se tiver mais, divide em sub-processos.]

## Exceções
| Situação | O que fazer |
|---|---|
| [Exceção 1] | [Ação] |
| [Exceção 2] | [Ação] |

## Handoff Humano
[Quando o processo deve parar e ir para o dono/funcionário]

## Rollback
[Como desligar ou reverter este processo se algo der errado]
Deve ser executável pelo dono sem ajuda técnica.

## Métricas de Saúde
- [Como saber se o processo está funcionando corretamente]
- [Sinal de alerta se algo estiver errado]
```

### Step 4 — Avaliação de Automação

```
PODE AUTOMATIZAR SE:
✅ Ocorre > 3x por semana
✅ Passos são sempre os mesmos (sem criatividade necessária)
✅ Trigger é claro e detectável (mensagem, horário, evento)
✅ Dados de entrada são estruturados

NÃO AUTOMATIZAR SE:
❌ Requer julgamento humano em > 20% dos casos
❌ Ocorre < 1x por semana
❌ Os dados de entrada variam muito
❌ Custo de automação > benefício em 6 meses
```

Ferramentas por nível de complexidade:
```
Simples (0 código): Make.com + Google Sheets + WhatsApp
Médio (low-code): Typebot + Evolution API + Webhooks
Avançado (código): bot.js customizado + Supabase + Railway
```

### Step 5 — 5 Casos de Teste

```
Caso 1: Fluxo ideal (tudo certo)
Caso 2: Input inválido (cliente manda algo inesperado)
Caso 3: Timeout (cliente não responde)
Caso 4: Exceção comum (produto em falta, horário lotado)
Caso 5: Rollback (como o dono desliga manualmente)
```

### Step 6 — Quality Gates

- [ ] SOP lido por alguém que nunca viu o processo — consegue executar?
- [ ] Rollback testado e funcional (< 5 min para desligar)?
- [ ] 5 casos de teste executados sem erro?
- [ ] Dono aprovou e entendeu o fluxo?
- [ ] Logs configurados (saber o que rodou e quando)?
- [ ] Handoff humano funcionando para casos complexos?

## Output Esperado

- `clients/[negocio]/sops/[processo].md` — SOP documentado
- `clients/[negocio]/sops/[processo]-test-cases.md` — Casos de teste

## Related

- **Agent:** @commerce-worker
- **Task derivada:** diagnose-comercio.md (processos identificados no diagnóstico)
- **Integrations:** Evolution API, Make.com, Typebot, bot.js
