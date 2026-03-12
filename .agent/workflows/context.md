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

| Cliente      | Verificar                                             |
| :----------- | :---------------------------------------------------- |
| Hortifruti   | `clients/hortifruti/config/hortifruti.json` + `docs/` |
| Experia      | `clients/experia/`                                    |
| Master Pumps | `clients/master-pumps/`                               |

## Passo 5 — Relatório ao Operador

Confirme com Gabriel que está contextualizado. Responda em **português**. Mostre:

1. **Identidade:** KAIROS — orquestrador supremo
2. **Última sessão:** data da última atualização do SELF_CONTEXT.md
3. **Itens bloqueados:** da seção "BLOQUEADO" do STATUS.md
4. **Em progresso:** da seção "EM PROGRESSO" do STATUS.md
5. **Agenda do dia:** da seção "AGENDA DO DIA" do STATUS.md
6. **Clientes ativos:** qual o status de cada cliente
7. **Issues conhecidas:** qualquer problema pendente
8. **Próximo milestone:** o milestone mais urgente

## Dica Pro — Atualizar Contexto ao Final da Sessão

Antes de encerrar qualquer sessão, **SEMPRE** atualize:
- `SELF_CONTEXT.md` — com novas decisões, mudanças de estado, credenciais
- `STATUS.md` — mover tasks entre seções (bloqueado → progresso → concluído)

Isso garante que a próxima sessão (mesmo com outro agente) continue do ponto exato.
