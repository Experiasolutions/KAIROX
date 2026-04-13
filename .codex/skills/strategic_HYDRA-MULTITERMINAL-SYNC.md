---
title: HYDRA Multi-Terminal Hivemind Architecture
type: strategic-reasoning-package
status: draft
date: 2026-03-28
author: NOESIS (via Architect Hat)
---

# KAIROS HYDRA: Multi-Terminal Hivemind

## 1. Visão Arquitetural (O Desafio)
Ligar o mesmo bot/conta do Telegram em dois terminais (PC Opus 4.6 e Notebook Gemini 3.1 Pro) gera uma **Race Condition**. Se ambos usarem Long Polling (ex: `bot.launch()`), o servidor do Telegram entregará cada mensagem apenar para o terminal que fizer a requisição no exato milissegundo, causando perda de contexto.

## 2. A Solução: Supabase como Event Bus (PUB/SUB)
Em vez de ligar os orquestradores diretamente ao Telegram, aplicamos o padrão **Message Queue Workers**.

### Fluxo de Dados:
1. **INPUT:** O Usuário envia uma mensagem/áudio no Telegram.
2. **WEBHOOK/BOT EXTERNO (Railway SKY):** O script `kairos-bot` no Railway recebe a mensagem 24/7.
3. **EVENT BUS:** O bot insere a mensagem na tabela `telegram_events` no **Supabase**.
4. **WORKERS (PC & Notebook):** As instâncias locais do Antigravity (via MCP ou scripts Node em background) "escutam" o Supabase (Realtime Subscriptions).

## 3. Protocolo de Roteamento (Load Balancing)

Como temos "4 Orquestradores" (Opus, Gemini, N8N, OpenClaw), precisamos definir quem pega qual tarefa. O Bot no Railway ou o Supabase usam uma tag para roteamento:

### Rota A: Tarefas Pesadas (Heavy-Duty)
- **Tag:** `[COMPLEXITY: 4-5]` (ex: Refactoring profundo, PRDs, Análises Arquiteturais).
- **Assumido por:** PC Principal (Opus 4.6).
- **Ação:** O PC atualiza a linha no Supabase para `status = in_progress (by PC)` para o Notebook ignorar.

### Rota B: Tarefas Rápidas / Borda (Edge)
- **Tag:** `[COMPLEXITY: 1-3]` ou `#fast` (ex: Web search, responder WhatsApp do Hortifruti, ping DevOps).
- **Assumido por:** Notebook (Gemini 3.1 Pro - Agent SKYDRA 3.5).
- **Ação:** O Notebook trava a tarefa no Supabase e executa em milissegundos.

### Rota C: Automação Pura
- **Assumido por:** N8N (Head 1) ou Evolution API.
- **Exemplo:** "Mande relatórios para a Elaine".

## 4. O Sistema de "Mente Compartilhada" (Brain Sync P2P)
Para que o Opus no PC saiba o que o Gemini no Notebook fez em milissegundos sem depender da nuvem do Google Server:
1. **Infraestrutura P2P (Syncthing):** O serviço Syncthing foi instalado como *Windows Service* nos terminais locais.
2. **Device Handshake:** O PC e o Notebook estão pareados via ID Criptográfico diretamente, roteando Tráfego na LAN local quando sob a mesma rede, e relays globais quando externos.
3. **Pastas Mapeadas na Instância Syncthing:**
   - `Antigravity Brain`: `C:\Users\GABS\.gemini\antigravity\brain` (Estado do Chat GUI).
   - `KAIROS Synapse`: `C:\Users\GABS\Documents\My KAIROS\.synapse` (Agentes Operacionais hookados).
   - `Operator Core Logs`: `C:\Users\GABS\Documents\My KAIROS\.aiox-core\noesis-operator` (RAG Aprendizado de Máquina/Operador).

*Quando o Notebook executa a Rota B, o Artifact é injetado localmente. O Syncthing propaga localmente p/ a HUD do PC (Opus) em 1~3 segundos garantindo "State-Match" da Mente.*

## 5. Implementação Tática (Próximos Passos)
1. **Concluir a push pro GitHub:** Garantir que o código-fonte (este repo) esteja versionado (Rodando agora mesmo).
2. **Configuração do Brain:** Mover a pasta `brain` do Antigravity para a nuvem.
3. **Deploy Webhook:** Confirmar que a Head 3 (SKY Python no Railway) está inserindo as mensagens do Telegram no Supabase.
4. **Script Listener:** Criar o script JS local `scripts/supabase-listener.js` para o KAIROS ficar lendo a fila e delegando para o Antigravity local.
