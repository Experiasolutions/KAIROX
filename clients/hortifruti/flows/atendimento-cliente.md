# Flow: Atendimento ao Cliente

> Fluxo principal quando um cliente envia mensagem pelo WhatsApp

---

## Trigger
Mensagem de número **não cadastrado** como dono/gerente

## Fluxo

```
[MENSAGEM RECEBE]
       │
       ▼
┌──────────────────┐
│ Safra Master:    │
│ É dono/gerente?  │──── SIM → Modo Gestão
│                  │
└──────┬───────────┘
       │ NÃO
       ▼
┌──────────────────────────────────────────┐
│ Identificar intenção pela keyword:       │
│                                          │
│ • cardápio/produtos/lista → CARDÁPIO     │
│ • quero/pedir/encomendar → PEDIDO        │
│ • promoção/desconto      → PROMOÇÃO      │
│ • horário/endereço        → INFO         │
│ • entrega/delivery        → ENTREGA      │
│ • (não identificado)     → MENU GERAL    │
└──────────────────────────────────────────┘
```

### CARDÁPIO
```
Safra: "Oi! 🥬 Olha o que tem fresquinho hoje:

🍎 Frutas: [lista do dia]
🥬 Verduras: [lista do dia]
🥕 Legumes: [lista do dia]

🔥 Oferta do dia: [se houver]

Quer encomendar alguma coisa? 😊"
```

### PEDIDO
```
Safra: "Ótimo! Me diz o que você quer e a quantidade:
(ex: 2kg banana, 1 maço couve)"

[Cliente lista itens]

Safra: "Anotei! ✅
📋 Seu pedido:
• 2kg Banana Prata — R$11,98
• 1 Maço Couve — R$4,50
💰 Total: R$16,48

Vai retirar ou quer entrega? 🚚"

[Se retirada] → "Beleza! Separei pra você. Pode buscar em [unidade] até [horário] 📍"
[Se entrega] → "Me passa o endereço. A taxa de entrega é R$X até [raio]km 🚚"
```

### PROMOÇÃO
```
Safra: "Temos sim! 🔥

🏷️ Ofertas de hoje:
• Banana Prata — R$3,99/kg (era R$5,99)
• Tomate — R$4,99/kg

💡 Dica: entre no nosso grupo de descontos pra receber ofertas todo dia!
Link: [link do grupo]"
```

### INFO
```
Safra: "Claro! 📍

🏪 Unidade 1 (Elaine):
📍 [Endereço]
⏰ Seg-Sáb: 7h-19h | Dom: 7h-13h

🏪 Unidade 2 (Douglas):
📍 [Endereço]
⏰ Seg-Sáb: 7h-19h | Dom: 7h-12h

💳 Aceitamos: Dinheiro, PIX, Cartão"
```

### MENU GERAL
```
Safra: "Oi! Sou a Safra 🥬, assistente do Hortifruti!

Como posso ajudar?
1️⃣ Ver produtos de hoje
2️⃣ Fazer um pedido
3️⃣ Ver promoções
4️⃣ Horários e endereços
5️⃣ Entrar no grupo de ofertas

Responda com o número 😊"
```
