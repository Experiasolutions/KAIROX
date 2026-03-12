# Flow: Gestão de Estoque

> Fluxo para Elaine e Douglas gerenciarem o estoque via WhatsApp

---

## Trigger
Mensagem de número **cadastrado** como dono/gerente + keyword de estoque

## Comandos

### Consultar Item
```
Elaine: "quanto tem de banana?"
Safra: "📦 Banana Prata
        Estoque: 45kg
        Mínimo: 10kg
        ✅ Nível OK

        Preço atual: R$5,99/kg
        Última atualização: hoje 7h"
```

### Registrar Entrada
```
Elaine: "chegou 100kg tomate"
Safra: "✅ Registrado!
        🍅 Tomate
        Antes: 15kg
        Entrada: +100kg
        Agora: 115kg

        Quer atualizar o preço? (atual: R$6,99/kg)"
```

### Registrar Saída
```
Douglas: "vendeu 30kg batata"
Safra: "✅ Baixa registrada!
        🥔 Batata
        Antes: 80kg
        Saída: -30kg
        Agora: 50kg"
```

### Zerar Item
```
Elaine: "acabou alface"
Safra: "⚠️ Alface zerada!
        🥬 Alface
        Estoque: 0
        ❗ Precisa repor

        Quer que eu tire do cardápio do dia?"
```

### Estoque Baixo
```
Douglas: "estoque baixo"
Safra: "⚠️ Itens abaixo do mínimo:

        🍌 Banana: 8kg (mín: 10kg)
        🥬 Couve: 3 maços (mín: 5)
        🍅 Tomate: 5kg (mín: 15kg)

        Quer que eu gere uma lista de reposição?"
```

### Relatório do Dia
```
Elaine: "como foi hoje?"
Safra: "📊 Resumo do dia — 05/03/2026

        📦 Estoque:
        • 12 entradas registradas
        • 34 saídas registradas
        • 3 itens em estoque baixo

        🚚 Entregas:
        • 8 pedidos recebidos
        • 6 entregues ✅
        • 2 pendentes

        🔝 Mais vendidos:
        1. Banana — 45kg
        2. Tomate — 38kg
        3. Alface — 22 maços

        💰 Faturamento estimado: R$1.247,00

        Boa noite, Elaine! 🌙"
```
