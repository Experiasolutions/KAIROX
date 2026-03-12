# Flow: Entregas

> Fluxo para registrar e acompanhar entregas

---

## Trigger
Keyword de entrega de número cadastrado como dono/gerente

## Fluxos

### Listar Entregas Pendentes
```
Douglas: "entregas hoje"

Safra: "🚚 Entregas pendentes — 05/03:

1. Maria (Rua X, 123)
   📦 2kg banana + 1 alface
   💰 R$16,48 + R$5 entrega
   ⏰ Pedido às 9h

2. João (Av Y, 456)
   📦 Cesta da semana
   💰 R$24,90 + R$5 entrega
   ⏰ Pedido às 10h30

3. Ana (Rua Z, 789)
   📦 3kg tomate + temperos
   💰 R$28,97 + R$8 entrega
   ⏰ Pedido às 11h

Total: 3 pendentes | 0 despachadas"
```

### Despachar Entrega
```
Douglas: "saiu entrega Maria"

Safra: "✅ Entrega #1 despachada!
        📍 Maria — Rua X, 123
        💰 R$21,48 (produto + entrega)
        🕐 Despachada às 14h30

        Restam 2 pendentes."
```

### Marcar como Entregue
```
Douglas: "entregue Maria"

Safra: "✅ Entrega #1 concluída!
        📍 Maria — Rua X, 123
        ⏱️ Tempo: 45min

        Restam 2 pendentes."
```

### Resumo de Entregas
```
Elaine: "quantas entregas hoje?"

Safra: "🚚 Entregas — 05/03:

        ✅ Concluídas: 4
        🔄 Em trânsito: 1
        ⏳ Pendentes: 2
        ❌ Canceladas: 0

        💰 Total entregas: R$35,00
        Faturamento delivery: R$156,30"
```
