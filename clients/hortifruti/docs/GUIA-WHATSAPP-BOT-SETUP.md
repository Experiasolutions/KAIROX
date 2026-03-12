# 🤖 Guia Prático: WhatsApp Bot para a Safra do Hortifruti

> **Para:** Gabriel Ferreira
> **Objetivo:** Botar a Safra pra funcionar no WhatsApp **hoje**
> **Nível:** Do zero ao bot respondendo cliente

---

## O MAPA: 3 Caminhos (do mais rápido ao mais poderoso)

| Caminho                      | Tempo    | Custo                | Poder  | Melhor para             |
| :--------------------------- | :------- | :------------------- | :----- | :---------------------- |
| **A. ManyChat/Botpress**     | 1-2h     | Grátis (limite msgs) | Médio  | Validar com Elaine HOJE |
| **B. Evolution API**         | 3-4h     | R$0 (self-hosted)    | Alto   | Versão definitiva       |
| **C. KAIROS SKY + Supabase** | 1-2 dias | R$0 (Railway)        | Máximo | Multi-cliente escalável |

**Minha recomendação:** Comece pelo **Caminho A** para validar hoje, depois migra pro **B** em 1-2 dias.

---

## CAMINHO A: BOTPRESS (Mais Rápido — Funciona Hoje)

Botpress é uma plataforma gratuita que conecta direto no WhatsApp sem precisar de servidor.

### Passo 1: Criar conta no Botpress (5 min)
1. Acesse [botpress.com](https://botpress.com)
2. Crie conta com Google
3. Clique "Create Bot"
4. Nome: "Safra - Hortifruti"

### Passo 2: Configurar a Persona (15 min)
No painel do Botpress, vá em **Agent** e cole este system prompt:

```
Você é a Safra 🥬, assistente digital do Hortifruti da Elaine.

REGRAS:
- Seja simpática, objetiva, use linguagem simples
- Use emojis de frutas/legumes com moderação
- NUNCA invente preços — use APENAS os da lista abaixo
- Se não souber algo, diga "Vou confirmar com a Elaine e te aviso!"

PRODUTOS E PREÇOS ATUAIS:
🍎 FRUTAS:
- Banana Prata: R$5,99/kg
- Maçã Fuji: R$8,99/kg
- Abacaxi Pérola: R$6,99/un
- Manga Palmer: R$7,99/kg
- Laranja Pera: R$4,99/kg

🥬 VERDURAS:
- Alface Crespa: R$3,50/un
- Rúcula: R$4,00/maço
- Couve Manteiga: R$4,50/maço
- Espinafre: R$5,00/maço

🥕 LEGUMES:
- Tomate Italiano: R$6,99/kg
- Batata Lavada: R$5,49/kg
- Cenoura: R$4,99/kg
- Cebola: R$5,99/kg
- Abóbora Cabotiá: R$4,49/kg

🌿 TEMPEROS:
- Salsinha: R$2,50/maço
- Cebolinha: R$2,50/maço

🥚 OUTROS:
- Ovos Caipira: R$12,99/dz

INFORMAÇÕES:
- Horário: Seg-Sáb 7h-19h | Dom 7h-13h
- Pagamento: Dinheiro, PIX, Cartão
- Entrega disponível (consultar taxa)

QUANDO O CLIENTE PEDIR ALGO:
1. Liste os itens com preços
2. Calcule o total
3. Pergunte: "Vai retirar ou quer entrega? 🚚"

QUANDO ALGUÉM PERGUNTAR SOBRE PROMOÇÕES:
- Diga as ofertas do dia (se houver)
- Convide pro grupo de descontos no WhatsApp
```

### Passo 3: Conectar ao WhatsApp (30 min)

**Opção Fácil — Via WhatsApp Business API (Meta):**
1. No Botpress, vá em **Integrations** → **WhatsApp**
2. Ele vai pedir pra conectar com o Meta Business Suite
3. Você precisa de uma **conta do Meta Business** (criar em [business.facebook.com](https://business.facebook.com))
4. Vincule o número da Elaine (ou um número novo dedicado)
5. Teste enviando "Oi" pro número

**Opção Alternativa — Via WhatsApp Web (teste rápido):**
1. No Botpress, procure a integração **Webchat**
2. Gere o link do webchat
3. Abra no celular da Elaine pra ela testar
4. Isso não é WhatsApp real, mas serve pra validar o fluxo

### Passo 4: Testar (15 min)
Envie estas 5 mensagens e veja se a Safra responde correto:
```
1. "Oi, o que tem de fruta hoje?"
2. "Quero 2kg banana e 1 maço couve"
3. "Qual o horário?"
4. "Tem promoção?"
5. "Vocês entregam?"
```

---

## CAMINHO B: EVOLUTION API (O Poder Real)

A Evolution API é um servidor open-source que conecta direto no WhatsApp Web — sem pagar Meta, sem aprovação, funciona com qualquer número.

### Como funciona (arquitetura):

```
[Cliente manda WhatsApp]
        │
        ▼
[Evolution API] ← servidor que espelha o WhatsApp Web
        │
        ▼
[Webhook] → chama seu servidor (pode ser o KAIROS SKY no Railway)
        │
        ▼
[KAIROS processa] → consulta Knowledge Brain + gera resposta
        │
        ▼
[Evolution API] → manda resposta de volta pro WhatsApp do cliente
```

### Passo 1: Subir a Evolution API (30 min)

**Opção A — Via Railway (grátis):**
1. Acesse [railway.app](https://railway.app)
2. Clique "New Project" → "Deploy from GitHub"
3. Use o repo: `EvolutionAPI/evolution-api`
4. Configure as variáveis:
```env
AUTHENTICATION_API_KEY=sua_chave_secreta_aqui
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
DATABASE_ENABLED=false
```
5. Deploy — ele gera uma URL tipo `https://evolution-xxxx.up.railway.app`

**Opção B — Via Docker no seu PC (se quiser ter controle total):**
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=minha_chave_123 \
  atendai/evolution-api:latest
```

### Passo 2: Conectar seu WhatsApp (5 min)

Depois que a Evolution API tiver rodando, abra o navegador:

```
POST https://SUA_URL/instance/create
Headers:
  apikey: sua_chave_secreta_aqui
Body:
{
  "instanceName": "hortifruti-safra",
  "integration": "WHATSAPP-BAILEYS",
  "qrcode": true
}
```

Ela retorna um **QR Code**. Escaneie com o WhatsApp do número dedicado ao Hortifruti.

### Passo 3: Configurar o Webhook (10 min)

```
POST https://SUA_URL/webhook/set/hortifruti-safra
Headers:
  apikey: sua_chave_secreta_aqui
Body:
{
  "webhook": {
    "enabled": true,
    "url": "https://SEU_KAIROS_SKY.up.railway.app/webhook/whatsapp",
    "webhookByEvents": true,
    "events": ["MESSAGES_UPSERT"]
  }
}
```

### Passo 4: Criar o endpoint no KAIROS SKY (já parcialmente pronto)

O KAIROS SKY que criamos já tem o `call_model()` com Knowledge Brain. Só falta adicionar um endpoint HTTP que recebe o webhook e responde. Isso eu posso criar pra você quando voltarmos a mexer no orquestrador.

---

## CAMINHO C: KAIROS SKY COMPLETO (Versão Enterprise)

Este é o caminho B + o orquestrador + Supabase + multi-cliente. É o que vamos construir na versão final. Mas para HOJE, o Caminho A resolve.

---

## 📱 ENQUANTO ISSO: O QUE FAZER COM AS FOTOS

A foto `Hortifruti-elaine.jpg` pode ser usada para:

1. **Posts do Instagram** — Use o Canva ou [remove.bg](https://remove.bg) pra editar
2. **Tabela de Preços visual** — Crie uma imagem com a lista de preços no Canva
3. **Status do WhatsApp** — Poste como status do número do Hortifruti

### Template de Post Instagram (copiar pro Canva):

```
🥬 FRESQUINHO DO DIA! 🥬

🍌 Banana Prata — R$5,99/kg
🍎 Maçã Fuji — R$8,99/kg
🍊 Laranja Pera — R$4,99/kg
🥕 Cenoura — R$4,99/kg
🥚 Ovos Caipira — R$12,99/dz

📍 [Endereço]
⏰ Seg-Sáb 7h-19h
💳 PIX | Cartão | Dinheiro

Peça pelo WhatsApp! 📱
```

---

## RESUMO — O QUE FAZER NAS PRÓXIMAS 2 HORAS

| Tempo          | Ação                                                             |
| :------------- | :--------------------------------------------------------------- |
| **0-15 min**   | Criar conta Botpress + colar o system prompt da Safra            |
| **15-45 min**  | Testar o bot com as 5 mensagens de teste                         |
| **45-60 min**  | Decidir: Webchat (demo) ou WhatsApp real (precisa Meta Business) |
| **60-90 min**  | Ir na Elaine e mostrar o bot ao vivo                             |
| **90-120 min** | Fechar a permuta e tirar fotos novas dos produtos                |

---

*"O WhatsApp bot não é tecnologia. É um funcionário que nunca falta, nunca erra e trabalha de graça."*
