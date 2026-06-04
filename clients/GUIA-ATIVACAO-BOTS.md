# 🚀 Guia de Ativação — Bots de Produção (Leticia + Paulo)

## Pré-requisitos
- Evolution API rodando e acessível
- GROQ_API_KEY disponível (use qualquer key do `GROQ_API_KEYS` no `.env` principal)

---

## 1. Configurar o .env de cada bot

### Leticia
```bash
cd clients/leticia/bot-whatsapp
cp .env.example .env
# Edite o .env e preencha:
# GROQ_API_KEY, EVOLUTION_API_URL, EVOLUTION_GLOBAL_APIKEY
```

### Paulo
```bash
cd clients/paulo/bot-whatsapp
cp .env.example .env
# Edite o .env e preencha os mesmos campos
```

---

## 2. Criar instâncias na Evolution API

Acesse a interface da sua Evolution API e crie duas instâncias:

| Instância | Nome exato | Tipo |
|---|---|---|
| Leticia | `leticia_personal` | WhatsApp Personal |
| Paulo | `paulo_business` | WhatsApp Business |

Após criar, escaneie o QR Code com o celular de cada cliente.

---

## 3. Configurar Webhooks

Para cada instância na Evolution API, configure o webhook:

| Cliente | Webhook URL |
|---|---|
| Leticia | `http://SEU_IP:3001/webhook` |
| Paulo | `http://SEU_IP:3002/webhook` |

**Eventos a ativar:** `messages.upsert`

> Se estiver rodando local, use `ngrok http 3001` e `ngrok http 3002` para expor as portas.

---

## 4. Subir os bots

### Opção A — Manual (desenvolvimento)
```bash
# Terminal 1 — Leticia
cd clients/leticia/bot-whatsapp && npm start

# Terminal 2 — Paulo
cd clients/paulo/bot-whatsapp && npm start
```

### Opção B — PowerShell (produção local)
```powershell
# Rodar os dois em background
Start-Process node -ArgumentList "src/index.js" -WorkingDirectory "clients/leticia/bot-whatsapp"
Start-Process node -ArgumentList "src/index.js" -WorkingDirectory "clients/paulo/bot-whatsapp"
```

### Opção C — Railway (recomendado para produção)
```bash
# Para cada bot:
railway login
railway init
railway up
# Configurar as variáveis de ambiente no painel Railway
```

---

## 5. Testar

```bash
# Health checks
curl http://localhost:3001/health  # Leticia
curl http://localhost:3002/health  # Paulo

# Simular webhook (test manual)
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"messages.upsert","data":{"key":{"remoteJid":"5511999999999@s.whatsapp.net","fromMe":false},"message":{"conversation":"oi, quero agendar"}}}'
```

---

## 6. Portas utilizadas

| Bot | Porta |
|---|---|
| Hortifruti | 3000 |
| Leticia | 3001 |
| Paulo | 3002 |

---

## Problemas comuns

**Bot não responde:**
1. Verificar se o webhook está apontando para a porta correta
2. Verificar se `GROQ_API_KEY` está válida
3. Verificar se o QR Code foi escaneado com sucesso
4. Checar logs: mensagem "Filtro A" ou "Filtro B" bloqueando?

**"Variáveis obrigatórias ausentes":**
- Significa que o `.env` não foi preenchido. Revise o `.env.example`.
