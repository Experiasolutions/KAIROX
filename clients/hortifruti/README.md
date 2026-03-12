# 🥬 Hortifruti — Client Package

> **Assistente:** Safra (Sócia Digital)
> **Unidades:** 2 (Elaine + Douglas)
> **Deal:** Permuta — soluções Experia × alimentos frescos
> **Engine:** KAIROS Unified · Experia

---

## Quick Start

1. Confirme variáveis de ambiente (`.env` na raiz):
   ```bash
   EVOLUTION_API_URL=https://...
   EVOLUTION_API_KEY=...
   EVOLUTION_INSTANCE=hortifruti
   ```

2. A Safra responde automaticamente via WhatsApp:
   - **Clientes** → Cardápio, pedidos, promoções, horários
   - **Elaine/Douglas** → Estoque, entregas, relatórios

## Estrutura

```
clients/hortifruti/
├── config/hortifruti.json    — Configuração do client
├── squads/hortifruti/agents/ — 4 agentes do squad
├── flows/                    — Fluxos de conversa
└── docs/                     — Guias de onboarding
```

## Squad: Safra Team

| Agente         | Função                                             |
| :------------- | :------------------------------------------------- |
| `safra-master` | Orquestradora — roteia mensagens, decide modo      |
| `atendente`    | Atendimento ao cliente (cardápio, pedidos, promos) |
| `estoquista`   | Controle de estoque + entregas                     |
| `social-media` | Posts Instagram + ofertas WhatsApp                 |

## Integração Futura

O sistema do Hortifruti será instalado em breve. A arquitetura foi desenhada para plug-and-play — quando identificarmos o sistema, criaremos um bridge adapter em `clients/hortifruti/bridges/`.
