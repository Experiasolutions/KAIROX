# RP-20260305-HORTIFRUTI — Case Experia: Hortifruti Local (Permuta)

> **ID:** RP-20260305-HORTIFRUTI-CASE
> **Data:** 2026-03-05
> **Modo:** PM2 (Execução Técnica)
> **Status:** 🔄 Executando
> **Autor:** Noesis (Orchestrator)

---

## Contexto

Gabriel fechou um acordo de permuta com um hortifruti local de 2 unidades:
- **Unidade 1:** Dona Elaine (proprietária)
- **Unidade 2:** Douglas (responsável)

**Deal:** Soluções digitais Experia gratuitas ↔ Alimentos frescos (permuta)

**Estado atual:** Zero sistema. Gestão arcaica. Grupo de descontos no WhatsApp sem organização. Contagem manual. Nenhum controle de estoque digitalizado. Sistema de gestão em processo de implementação (a identificar).

## Objetivo

1. **Case real** para portfólio Experia (showcase público)
2. **Permuta alimentar** — armários cheios, comida saudável
3. **Teste de campo** da arquitetura KAIROS para varejo/hortifruti
4. **Prova de conceito** para futuros clientes do segmento

## Arquitetura Implementada

### Persona: Safra 🥬
Assistente híbrida/multifacetada com 3 modos:
- **Atendimento:** Cardápio, pedidos, promoções, horários
- **Gestão:** Estoque, entregas, relatórios (Elaine/Douglas)
- **Marketing:** Posts Instagram, ofertas WhatsApp

### Squad (4 agentes)
| Agente       | Função                               |
| :----------- | :----------------------------------- |
| safra-master | Orquestradora — roteia + decide modo |
| atendente    | Atendimento ao cliente               |
| estoquista   | Estoque + entregas                   |
| social-media | Marketing digital                    |

### Flows Implementados
1. `atendimento-cliente.md` — Fluxo completo de atendimento
2. `gestao-estoque.md` — Comandos informais de estoque
3. `entregas.md` — Registro e acompanhamento
4. `promocao-grupo.md` — Criação inteligente de promos

## Roadmap

### V1 (Atual) — WhatsApp Bot
- [x] Persona Safra definida
- [x] 4 agentes do squad
- [x] 4 fluxos de conversa
- [x] Onboarding simplificado (Elaine + Douglas)
- [x] Estoque seed data
- [ ] Conectar via Evolution API
- [ ] Testar com números reais

### V2 — Sistema Integrado
- [ ] Identificar sistema de gestão (reunião com Elaine)
- [ ] Criar bridge adapter KAIROS ↔ Sistema
- [ ] Sincronizar estoque em tempo real

### V3 — Multi-loja + Analytics
- [ ] Dashboard simples (faturamento, top produtos, trends)
- [ ] Instagram automation (Meta Graph API)
- [ ] Relatórios comparativos das 2 unidades

## Artefatos

| Tipo   | Path                                           |
| :----- | :--------------------------------------------- |
| Config | `clients/hortifruti/config/hortifruti.json`    |
| Squad  | `clients/hortifruti/squads/hortifruti/agents/` |
| Flows  | `clients/hortifruti/flows/`                    |
| Dados  | `clients/hortifruti/data/estoque.json`         |
| Docs   | `clients/hortifruti/docs/`                     |

## Quality Gate

- [ ] Fluxo de atendimento testado com 5 mensagens simuladas
- [ ] Comandos de estoque validados com Elaine
- [ ] Linguagem aprovada (simples o suficiente)
- [ ] Evolution API conectada e respondendo
- [ ] Primeiro relatório diário gerado
