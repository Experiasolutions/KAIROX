---
description: Contextualiza o Antigravity com o estado atual do AIOS
---

# Contextualização KAIROS — Sincronicidade Integral

// turbo-all

**Use este workflow SEMPRE que iniciar uma nova sessão de trabalho.**

## Passo 1 — Estado Cognitivo (OBRIGATÓRIO)

Leia estes 2 arquivos na raiz do projeto — eles são a "memória de longo prazo":

```
Leia o arquivo SELF_CONTEXT.md
```
→ Contém: identidade, estado de cada subsistema, credenciais configuradas, decisões anteriores.

```
Leia o arquivo STATUS.md
```
→ Contém: itens bloqueados, tasks em progresso, tasks concluídas, agenda do dia, milestones.

Se nenhum dos dois existir:
```bash
node scripts/kairos-boot.js
```

## Passo 2 — Identidade e Propósito

```
Leia o arquivo docs/core/KAIROS-MANIFEST.md
```

## Passo 3 — KAIROS SKY (Orquestrador Cloud)

Verifique o estado atual do orquestrador:

```
Leia o arquivo kairos-orchestrator/README.md
```

Verifique credenciais:
```
Leia as linhas 42-50 do arquivo .env
```

## Passo 4 — Clientes Ativos

Verifique status dos clientes em andamento:

| Cliente      | Verificar                                                |
| :----------- | :------------------------------------------------------- |
| Leticia      | `clients/leticia/config/leticia.json` (criar se não existe) |
| Paulo        | `clients/paulo/config/paulo.json` (criar se não existe)  |
| Hortifruti   | `clients/hortifruti/config/hortifruti.json` + `docs/`    |
| Master Pumps | `clients/master-pumps/`                                  |
| Felix Cell   | `clients/felix-cell/` (se existir)                       |

## Passo 4.5 — MCP + Agent-First + Engine Triage v4 (OBRIGATÓRIO)

Antes de reportar ao operador, internalize estas regras de operação:

**Engine Triage v4 (10 Fases):** TODO ciclo de trabalho DEVE seguir as 10 fases: (1) Classificar Intenção → (2) Persona Ignition (hat-switch) → (3) Mindclone Advisory (1-3 conselheiros, 66 clones) → (4) Squad Activation → (5) Surface Check (Bob C001-C007) → (6) Ecosystem Matching (13 workflows + 207 tasks + 52 RPs) → (7) Executar → (8) Quality Gate (QA≠executor) → (9) Session State (SELF_CONTEXT + STATUS) → (10) Output Encapsulado. NUNCA opere no modo genérico antes ou depois do comando `/context`.

**MCP v3.0 (23 tools):** Use as tools MCP para consultar o ecossistema:
- `kairos_read_context` → ler SELF_CONTEXT + STATUS via MCP
- `kairos_list_tasks` → consultar 204 tasks disponíveis
- `kairos_list_framework_agents` → consultar 12 agentes AIOX
- `kairos_read_engine` → acessar noesis (cognitive-state) e memory
- `kairos_read_synapse` → acessar sysânapse de memória dos agentes

**Agent-First Protocol:** Para TODA demanda:
1. Identifique o agente especializado mais adequado
2. Consulte workflow/task/checklist existente no framework
3. Ative via hat-switching (documente o chapéu em uso)
4. Delegue formalmente com `@agente` + comando

**Hat-Switching:** Troque de persona conforme a fase:
- `@architect` para análise e design
- `@dev` para implementação
- `@qa` para validação e testes
- `@devops` para deploy e infra

**HYDRA Architecture (4 Heads):**
- HEAD 1: N8N + Postgres | HEAD 2: OpenClaw (15 Skills)
- HEAD 3: SKY Python (55+ tools) | HEAD 4: Evolution API (WhatsApp)

**Full-Ecosystem:** SEMPRE utilize agentes + flows + tasks + workflows + squads + engines + RPs + mindclones. Não opere como assistente genérico.

## Passo 4.6 — ENGINE TRIAGE v4 (EMBEDDED — Ativa por padrão)

> ⚠️ **Não existe mais o workflow `/triage`.** A Engine Triage v4 é nativa. Execute as 10 fases mentalmente a cada demanda — sem precisar acionar nenhum comando externo.

| Fase | Nome | Ação |
|---|---|---|
| 1 | Classificar Intenção | Criação / Modificação / Análise / Deploy / Pesquisa / Planejamento / QA |
| 2 | Persona Ignition | Hat-switch → @architect, @dev, @qa, @pm, @devops |
| 3 | Mindclone Advisory | 1-3 conselheiros dos 66 clones para perspectiva estratégica |
| 4 | Squad Activation | Cross-funcional → ativar squad. Task única → SKIP |
| 5 | Surface Check | Bob C001-C007: custo, risco, opções, erros, destrutivo, escopo, dependência |
| 6 | Ecosystem Matching | 13 workflows + 204 tasks + 52 RPs + 6 checklists. Reusar antes de criar. |
| 7 | Executar | MATCH → auto-execute. NO MATCH → `*create task` |
| 8 | Quality Gate | @qa ≠ executor. Validar ACs, patterns, regressões |
| 9 | Session State | SELF_CONTEXT + STATUS atualizados. Crash recovery. |
| 10 | Output Encapsulado | Task rastreável, replicável, auditável. |

## Passo 5 — Relatório ao Operador

Confirme com Gabriel que está contextualizado. Responda em **português**. Mostre:

1. **Identidade:** KAIROS — orquestrador supremo
2. **Última sessão:** data da última atualização do SELF_CONTEXT.md
3. **Itens bloqueados:** da seção "BLOQUEADO" do STATUS.md
4. **Em progresso:** da seção "EM PROGRESSO" do STATUS.md
5. **HYDRA status:** HEAD 1-4 status (do STATUS.md seção HYDRA)
6. **Clientes ativos:** qual o status de cada cliente
7. **MCP v3.0:** confirmar que 23 tools estão ativas
8. **Protocolo ativo:** Agent-First + Hat-Switching + Full-Ecosystem
9. **Próximo milestone:** o milestone mais urgente

## Dica Pro — Atualizar Contexto ao Final da Sessão

Antes de encerrar qualquer sessão, **SEMPRE** atualize:
- `SELF_CONTEXT.md` — com novas decisões, mudanças de estado, credenciais
- `STATUS.md` — mover tasks entre seções (bloqueado → progresso → concluído)

Isso garante que a próxima sessão (mesmo com outro agente) continue do ponto exato.
