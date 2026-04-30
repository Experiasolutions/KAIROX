# 🧠 KAIROS Bot Template

> Bot Atendente WhatsApp + Sócio Digital Telegram — pronto para qualquer comércio em 15 minutos.

## O Que É

Um sistema de IA duplo para comércios locais:
- **Atendente WhatsApp** — Responde clientes 24/7 com tom humano, conhece o cardápio, direciona delivery
- **Sócio Digital Telegram** — Braço direito do dono, focado em faturamento, transcreve áudios

## Setup Rápido (15 min)

### 1. Clone o repo
```bash
git clone https://github.com/Experiaghostwarrior/kairos-bot-template.git meu-bot
cd meu-bot
```

### 2. Edite `src/config/business.json`
Troque nome, endereço, produtos, dono. É o ÚNICO arquivo que muda por cliente.

### 3. Configure as APIs
- **Groq** (grátis): https://console.groq.com → crie uma API key
- **Evolution API**: Deploy no Railway → conecte o WhatsApp via QR Code
- **Telegram**: Fale com @BotFather → crie um bot → copie o token

### 4. Deploy no Railway
1. Conecte o repo no Railway
2. Configure as variáveis (veja `.env.example`)
3. Deploy — pronto!

### 5. Configure o Webhook da Evolution
Na Evolution API, aponte o webhook para:
```
https://seu-bot.up.railway.app/webhook
```

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `GROQ_API_KEY` | ✅ | Chave da API Groq |
| `EVOLUTION_API_URL` | ✅ | URL da sua Evolution API |
| `EVOLUTION_GLOBAL_APIKEY` | ✅ | API key da Evolution |
| `INSTANCE_NAME` | ❌ | Nome da instância (default: `default`) |
| `TELEGRAM_BOT_TOKEN` | ❌ | Token do bot Telegram |
| `TELEGRAM_OWNER_ID` | ❌ | ID Telegram do dono |
| `LLM_MODEL` | ❌ | Modelo (default: `llama-3.1-8b-instant`) |

## Estrutura

```
src/
├── config/business.json  ← EDITE ESTE ARQUIVO
├── config/env.js
├── prompts/attendant.js
├── prompts/partner.js
├── services/groq.js
├── services/evolution.js
├── services/telegram.js
├── utils/memory.js
└── index.js
```

## Health Check

```
GET /health → { status: "ok", business: "Nome", uptime: 123 }
```

## Feito com 🧠 KAIROS AI
