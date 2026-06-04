# 🚀 Tutorial: Onboarding de Novo Cliente AI OPS (MVP)

Este guia define o padrão exato para plugar um novo cliente na infraestrutura AI OPS usando a regra de Pareto ao Cubo.

## 1. Coleta de Informações (Briefing)
O primeiro passo é sempre extrair o núcleo do negócio. Não precisamos de 50 páginas de branding. Precisamos de:
- **Core Offer:** O que ele vende mais e mais rápido?
- **Restrições:** O que ele NÃO vende?
- **Logística/Status:** Como o serviço é entregue e quais os status intermediários?

## 2. Configuração do Template
1. Chame o squad `mvp-admin` (Agente: `@admin-master`).
2. Passe a task `onboard-client.md`.
3. O agente criará a pasta do cliente em `clients/NOME_DO_CLIENTE` baseada no `_template`.

## 3. Adaptação dos Scripts (Pareto)
1. Revise `wa-recepcao.md` e `wa-triagem.md`. O tom de voz bate com o dono do negócio?
2. Se sim, não altere nada. O script base já converte bem.
3. Se o cliente for de ticket alto (ex: Paulo Tapeçaria), mude emojis para linguagem mais sóbria.

## 4. Integração Evolution API
1. Crie a instância na Evolution API.
2. Escaneie o QR Code no celular do cliente.
3. Aponte o webhook Global para a porta onde o `scripts/whatsapp-router.js` está rodando.

## 5. Esteira de Conteúdo
1. Acione o squad `mvp-media` (Agente: `@media-strategist`).
2. Entregue a task `generate-social-content.md` para criar a primeira semana de postagens.

**Lembrete:** "Feito é melhor que perfeito. Automação de 80% do funil é melhor que 0%."
