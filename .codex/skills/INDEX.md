# Reasoning Packages — Índice

> Registro de todos os Reasoning Packages do KAIROS.
> Protocolo de uso: [PROTOCOL-RP-MCP-v1.0.md](PROTOCOL-RP-MCP-v1.0.md)

---

## RPs Estratégicos (`strategic/`)

| ID                           | Data       | Mode | Status        | Descrição                                                     | Arquivo                                                                                        |
| :--------------------------- | :--------- | :--- | :------------ | :------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- |
| RP-20260218-BOOTSTRAP        | 2026-02-18 | PM2  | ✅ Concluído   | Bootstrap do Noesis Engine (Etapas 0-10)                      | [RP-20260218-BOOTSTRAP.md](strategic/RP-20260218-BOOTSTRAP.md)                                 |
| RP-20260218-STRUCTURE        | 2026-02-18 | PM2  | ⬛ Substituído | Reorganização estrutural ENGINE/CLIENT (v1)                   | [RP-20260218-STRUCTURE.md](strategic/RP-20260218-STRUCTURE.md)                                 |
| RP-20260219-STRUCTURE-v2     | 2026-02-19 | PM2  | ✅ Concluído   | Reorganização v2 — Estágio 1 completo                         | [RP-20260219-STRUCTURE-v2.md](strategic/RP-20260219-STRUCTURE-v2.md)                           |
| RP-20260218-LOCAL-BRIDGE     | 2026-02-18 | PM2  | 📋 Pendente    | Bridge local para desenvolvimento                             | [RP-20260218-LOCAL-BRIDGE.md](strategic/RP-20260218-LOCAL-BRIDGE.md)                           |
| RP-EXPERIA-PHASE3            | 2026-02-18 | PM2  | ✅ Concluído   | WhatsApp Revenue Bridge (Experia client)                      | [RP-EXPERIA-PHASE3.md](strategic/RP-EXPERIA-PHASE3.md)                                         |
| RP-20260218-NOESIS-ENGINE    | 2026-02-18 | PM1  | ✅ Concluído   | Noesis Engine — mente para o AIOS                             | [RP-20260218-NOESIS-ENGINE.md](strategic/RP-20260218-NOESIS-ENGINE.md)                         |
| RP-20260218-EVOLUTION-ENGINE | 2026-02-18 | PM2  | ✅ Concluído   | Evolution Engine — auto-evolução autônoma                     | [RP-20260218-EVOLUTION-ENGINE.md](strategic/RP-20260218-EVOLUTION-ENGINE.md)                   |
| RP-20260218-OPERATOR-NOESIS  | 2026-02-18 | PM1  | ✅ Concluído   | Operator Noesis — infra criada, aguarda Jarvis Layer          | [RP-20260218-OPERATOR-NOESIS.md](strategic/RP-20260218-OPERATOR-NOESIS.md)                     |
| RP-20260219-MAQUINA-DO-TEMPO | 2026-02-19 | PM1  | 🔄 Executando  | Máquina do Tempo Cognitiva v1.0 — reconstrução do AIOS v5.0.0 | [RP-20260219-MAQUINA-DO-TEMPO-v1.0.md](strategic/RP-20260219-MAQUINA-DO-TEMPO-v1.0.md)         |
| RP-20260218-PHASE3-WHATSAPP  | 2026-02-18 | PM2  | ✅ Concluído   | WhatsApp Phase 3 — servidor webhook + calendário              | [RP-20260218-PHASE3-WHATSAPP.md](strategic/RP-20260218-PHASE3-WHATSAPP.md)                     |
| RP-20260221-VERSIONAMENTO    | 2026-02-21 | PM1  | 🔄 Executando  | Versionamento KAIROS — Community Edition vs Project Kairos    | [RP-20260221-VERSIONAMENTO-v1.0.md](strategic/RP-20260221-VERSIONAMENTO-v1.0.md)               |
| RP-20260219-ALAN-NICOLAS     | 2026-02-19 | PM1  | 📋 Pendente    | SEED — arco estratégico para Alan Nicolas como co-criador     | [RP-20260219-ALAN-NICOLAS-v0.1-SEED.md](strategic/RP-20260219-ALAN-NICOLAS-v0.1-SEED.md)       |
| RP-20260219-KAIROS-LAUNCH    | 2026-02-19 | PM2  | 📋 Pendente    | Plano de lançamento Kairos — agência WaaS horizontal no ABC   | [RP-20260219-KAIROS-LAUNCH-v1.0.md](strategic/RP-20260219-KAIROS-LAUNCH-v1.0.md)               |
| RP-20260219-AIOS-FATHER      | 2026-02-19 | PM1  | 📋 Pendente    | SEED Pedagógico — Mentor de maestria em orquestração (v0.1)   | [RP-20260219-AIOS-FATHER-v0.1-SEED.md](strategic/RP-20260219-AIOS-FATHER-v0.1-SEED.md)         |
| RP-20260219-MEGABRAIN-DELTA  | 2026-02-19 | PM1  | 📋 Pendente    | Megabrain Delta — análise competitiva AIOS vs Mega Brain      | [RP-20260219-MEGABRAIN-DELTA-v0.1-SEED.md](strategic/RP-20260219-MEGABRAIN-DELTA-v0.1-SEED.md) |

---

## RPs de Tarefa (`tasks/`)

| ID                         | Data       | Status       | Descrição                                                            | Arquivo                                                              |
| :------------------------- | :--------- | :----------- | :------------------------------------------------------------------- | :------------------------------------------------------------------- |
| RP-20260223-ATIVACAO-TOTAL | 2026-02-23 | ✅ Completo   | IA Council deliberation — plano revisado de ativação total do KAIROS | [RP-20260223-ATIVACAO-TOTAL.md](tasks/RP-20260223-ATIVACAO-TOTAL.md) |
| RP-20260223-EXPERIA-GTM    | 2026-02-23 | 🔄 Executando | Go-To-Market zero budget — captação de clientes Experia no ABC       | [RP-20260223-EXPERIA-GTM.md](tasks/RP-20260223-EXPERIA-GTM.md)       |

> RPs de tarefa são criados automaticamente pelo Noesis quando a complexidade da tarefa exige.
> Veja o [Protocolo RP-MCP](PROTOCOL-RP-MCP-v1.0.md) para critérios e formato.

---

## Como criar um novo RP

### RP Estratégico (longo)
1. Use o formato de RP completo com seções de contexto, decisões, steps e quality gate
2. Nomeie: `RP-{DATA}-{DESCRIÇÃO}-v{VERSÃO}.md`
3. Salve em `reasoning-packages/strategic/`
4. Atualize a tabela acima

### RP de Tarefa (curto)
1. Use o formato mínimo definido no [Protocolo RP-MCP](PROTOCOL-RP-MCP-v1.0.md)
2. Nomeie: `RP-{DATA}-{slug}.md`
3. Salve em `reasoning-packages/tasks/`
4. Atualize a tabela acima
5. Após conclusão e verificação, o RP é marcado como concluído

## Convenções

- **ID único** por RP (nunca reutilize)
- **Status:** ✅ Concluído | 🔄 Executando | 📋 Pendente | ❌ Cancelado | ⬛ Substituído
- **Mode:** PM1 (análise) | PM2 (execução) | PM3 (auditoria)
- RPs do motor ficam aqui; RPs de clientes também, mas com prefixo do cliente (ex: `RP-EXPERIA-*`)
