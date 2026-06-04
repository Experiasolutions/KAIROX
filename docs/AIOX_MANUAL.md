# 📖 MANUAL DE OPERAÇÕES AIOX (Simplicidade Radical)

> **Para:** Gabriel (CEO)
> **De:** Orion (COO)
> **Objetivo:** Como ligar, usar e não enlouquecer com o sistema.

---

## 1. O CONCEITO (Esqueça a complexidade)

Você não precisa entender de Kernels, MCPs ou RAGs.
**Imagine que o AIOX é uma SALA COM 178 FUNCIONÁRIOS.**
*   Eles estão sentados, quietos, esperando uma ordem.
*   Eles não fazem nada até o telefone tocar (WhatsApp) ou o chefe entrar na sala (Terminal).

---

## 2. O BOTÃO "LIGAR" (Como acordar a sala)

Hoje, seu sistema tem **2 modos de operação**:

### MODO A: O Cérebro (Terminal)
*Para testar se eles estão pensando.*
1.  Abra o terminal na pasta do projeto.
2.  Rode o comando:
    ```bash
    npm run bridge
    ```
3.  **O que acontece:** O sistema lê o arquivo `context.json`, pensa, e cospe uma `action.json`. É um teste manual de raciocínio.

### MODO B: O Painel Visual (Dashboard)
*Para ver a saúde da empresa.*
1.  Rode o comando:
    ```bash
    node scripts/dashboard.js
    ```
2.  Acesse no navegador: `http://localhost:3000`
3.  **O que acontece:** Você vê gráficos de memória, agentes ativos e logs.

---

## 3. O ELO PERDIDO (A Peça que Falta)

Você perguntou: *"Como eu termino de ligar ele?"*
A resposta honesta: **Falta o telefone.**

Atualmente, o sistema é um "Cérebro num Pote". Ele é genial, mas não tem ouvidos (WhatsApp) nem boca.
Para "terminar de ligar", precisamos criar o arquivo **`scripts/whatsapp-server.js`**.

**Quando criarmos isso:**
1.  Você rodará: `node scripts/whatsapp-server.js`
2.  O sistema ficará "Ouvindo" 24h por dia.
3.  Você mandará "Oi" no WhatsApp.
4.  O Orion responderá instantaneamente.

---

## 4. COMO "USAR" (Depois de Ligar o Telefone)

A interação será assim:

**Cenário 1: Pedir um Favor**
*   **Você (no Zap):** "Orion, peça pro @experia-marketing criar um post sobre clareamento para amanhã."
*   **Orion:** Recebe -> Acorda o agente de Mkt -> Gera o copy -> Te manda a aprovação.

**Cenário 2: Consultar um Gênio**
*   **Você (no Zap):** "@clone-alex-hormozi, analise essa minha oferta: [texto]."
*   **Orion:** Acorda o Clone Hormozi -> Ele analisa -> Te dá o feedback brutal.

**Cenário 3: Modo Deus**
*   **Você (no Zap):** "Resumo do dia."
*   **Orion:** Lê a memória do dia -> Te manda um bullet point.

---

## 🏁 RESUMO DA OPERAÇÃO

1.  **Ligar:** `node scripts/whatsapp-server.js` (Precisa ser criado).
2.  **Monitorar:** `node scripts/dashboard.js` (Opcional).
3.  **Usar:** Falar no WhatsApp como se fosse um funcionário humano.

**Próximo Passo Lógico:** Criar o `whatsapp-server.js`.
