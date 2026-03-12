# 🔌 Guia de Conexão: Evolution API

> Como plugar o WhatsApp do Hortifruti na máquina KAIROS (Evolution API).
> Siga este passo a passo amanhã com o número que eles vão usar.

---

## Como a Mágica Funciona
A Evolution API é uma ponte (gateway) não-oficial do WhatsApp. Ela lê o QR Code do celular da loja e transforma as conversas de WhatsApp num lugar onde a Safra (nosso código) consegue ler e responder mensagens instantaneamente.

## Passo a Passo para Configurar (Amanhã)

### 1. Subir a Evolution API
A Evolution deve rodar no seu ambiente local, servidor, ou máquina Windows. Uma forma fácil via Docker:
```bash
docker run -d --name evolution-api -p 8080:8080 -e AUTHENTICATION_API_KEY=sua_chave_aqui -e AUTHENTICATION_TYPE=apikey -e TYPEBOT_API_VERSION=latest evolutionapi/evolution-api:latest
```

### 2. Criar a "Instância" do Hortifruti
Abra o Insomnia, Postman ou use curl para pedir pra Evolution criar a sessão:
```bash
curl --request POST \
  --url http://localhost:8080/instance/create \
  --header 'apikey: sua_chave_aqui' \
  --header 'Content-Type: application/json' \
  --data '{
    "instanceName": "hortifruti_safra",
    "qrcode": true
  }'
```
*O retorno disso te dará um Base64 de um QR Code.*

### 3. Escanear o QR Code
1. Leia o Base64 em um visualizador HTML ou site online.
2. Peça para a Elaine/Douglas abrir o WhatsApp da Loja.
3. Clicar em **Aparelhos Conectados** > **Conectar Aparelho** e ler o QR Code.
✅ *Pronto! A Evolution API agora está logada no número da loja.*

### 4. Configurar o Webhook (Para a Safra ouvir)
Você precisa avisar a Evolution para enviar toda mensagem recebida para o seu Node.js (KAIROS Bridge):
```bash
curl --request POST \
  --url http://localhost:8080/webhook/set/hortifruti_safra \
  --header 'apikey: sua_chave_aqui' \
  --header 'Content-Type: application/json' \
  --data '{
    "url": "http://SEU_NGROK_OU_LOCAL:3005/webhook/evolution",
    "webhook_by_events": false,
    "events": [
      "MESSAGES_UPSERT"
    ]
  }'
```

### 5. Atualizar o KAIROS `.env`
No diretório raiz do KAIROS (`C:\Users\Gabriel\Documents\My KAIROS\.env`), as chaves devem ser as que você criou acima:
```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_aqui
EVOLUTION_INSTANCE=hortifruti_safra
```

### Resumo para amanhã:
1. Sobe a Evolution (via Docker ou Node script que você possua).
2. Puxa a requisição do `/instance/create` pra gerar o QR Code.
3. Eles escaneiam lá da loja.
4. Informa Webhook pro seu PC.
5. Inicia a bridge do KAIROS. A Safra começa a dominar! 🚀
