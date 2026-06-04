# Skill: Filesystem Local

## Descrição
Leitura e escrita em arquivos locais dentro do diretório KAIROS via MCP tools. Substitui qualquer acesso direto ao filesystem — use as tools MCP para garantir log e consistência.

## Caminho base
`C:\Users\GABS\Documents\My KAIROS\`

## Operações via MCP
| Tool | Operação |
|---|---|
| `kairos_read_context` | Lê `SELF_CONTEXT.md` e/ou `STATUS.md` |
| `kairos_write_context` | Escreve/atualiza `SELF_CONTEXT.md` ou `STATUS.md` com backup automático |
| `kairos_log_artifact` | Registra artefato em `hivemind/artifacts.json` |
| `kairos_list_artifacts` | Lista artefatos com filtros |
| `kairos_explore_arsenal` | Lista scripts em `arsenal/` |
| `kairos_read_script` | Lê conteúdo de script do arsenal |
| `hivemind_log_decision` | Registra decisão em `hivemind/decisions.jsonl` |
| `hivemind_read_decisions` | Lê decisões com filtros |
| `hivemind_update_state` | Atualiza estado de agente em `hivemind/agent-states.json` |
| `hivemind_read_states` | Lê estados de todos os agentes |

## Estrutura de diretórios relevante
```
My KAIROS/
├── SELF_CONTEXT.md     ← contexto persistente de sessão
├── STATUS.md           ← estado operacional atual
├── hivemind/
│   ├── decisions.jsonl
│   ├── agent-states.json
│   ├── artifacts.json
│   └── isolation_state.json
├── aios/squads/local/  ← squad de trabalho local
├── integrations/       ← skills/integrações (este diretório)
└── arsenal/            ← scripts utilitários
```
