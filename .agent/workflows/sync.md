---
description: Sincroniza o agente com o estado completo da Hivemind — garante que todos os 4 nós estão na mesma página antes de continuar o trabalho
---

# 🔄 /sync — Sincronização Hivemind

// turbo-all

**Este workflow garante que o agente atual leu tudo o que os outros agentes fizeram.**
Execute ao iniciar uma sessão ou antes de tomar decisões arquiteturais.

---

## PASSO 1 — Ler o Decision Log

Use a MCP tool `hivemind_read_decisions` para ler as últimas 20 decisões:

```
hivemind_read_decisions({ limit: 20 })
```

Identifique:
- Decisões que afetam seu foco atual (`affects` field)
- Artefatos criados/modificados pelos outros agentes
- Tasks atribuídas a você (`[ASSIGN → seu-id]`)

---

## PASSO 2 — Ler o Estado dos Agentes

Use a MCP tool `hivemind_read_states` para ver o status de todos os nós:

```
hivemind_read_states()
```

Mapa de máquinas:
| Agent ID      | Máquina       | Chat |
|---------------|---------------|------|
| pc-chatA-root | PC-GABS       | Chat A (Root) |
| note-chatB    | NOTEBOOK-MAYMO| Chat B (Este) |
| pc-chatC      | PC-GABS       | Chat C |
| pc-chatD      | PC-GABS       | Chat D |

---

## PASSO 3 — Ler STATUS.md e SELF_CONTEXT.md

Leia nesta ordem:

1. Leia `STATUS.md` → fila de trabalho atual, bloqueios, EM PROGRESSO
2. Leia `SELF_CONTEXT.md` → estado completo do sistema, decisões arquiteturais

Se preferir via MCP: `kairos_read_context({ file: "both" })`

---

## PASSO 4 — Registrar Presença

Use a MCP tool `hivemind_update_state` para anunciar que você está ativo:

```
hivemind_update_state({
  agent_id: "[SEU_ID]",       // pc-chatA-root | note-chatB | pc-chatC | pc-chatD
  status: "active",
  focus: "[O que você vai trabalhar]"
})
```

---

## PASSO 5 — Apresentar Relatório de Sync

Após completar os passos acima, apresente:

```
🔄 SYNC REPORT — [seu agent_id] — [timestamp]

═══ HIVEMIND ═══
• Decisões lidas: [N] (últimas 20)
• Última decisão: [summary da mais recente]
• Tasks para mim: [lista ou "nenhuma"]
• Agentes ativos: [lista dos status=active]

═══ ESTADO ATUAL ═══
• Foco do Root (pc-chatA): [focus]
• Foco do Note (note-chatB): [focus]
• Em Progresso (STATUS.md): [itens principais]
• Bloqueios: [lista ou "nenhum"]

═══ DIVERGÊNCIAS ═══
• [Qualquer coisa que este agente sabia diferente do que o Hivemind diz]
• [Se nenhuma: "Nenhuma — em sincronia total"]

Pronto para continuar. Aguardando instrução.
```

---

## REGRAS

1. **Nunca pule o Passo 4** — todo agente deve anunciar presença
2. **Se houver tasks atribuídas a você**, relate-as antes de aguardar instrução
3. **Se detectar divergências** (ex: você sabia de algo diferente do Hivemind), logue a correção com `hivemind_log_decision`
4. **Em sincronia = qualquer agente pode continuar de onde o outro parou**
