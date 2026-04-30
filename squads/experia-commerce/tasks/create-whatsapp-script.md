---
task: Criar Script de Atendimento WhatsApp
responsavel: "@commerce-clone"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - nome_negocio: Nome do comércio
  - segmento: Tipo de negócio
  - nome_dono: Nome do dono (para personalização)
  - tom_desejado: Formal / Descontraído / Caloroso (ou capturar via entrevista)
  - top5_perguntas: As 5 perguntas mais frequentes dos clientes
  - objecao_principal: Objeção mais comum (preço, prazo, disponibilidade)
Saida: |
  - script_recepcao: Mensagem de boas-vindas personalizada
  - faq_10: 10 respostas para perguntas frequentes
  - script_followup: Sequência 1h / 24h / 72h
  - script_reativacao: Mensagem para cliente inativo (30/60/90 dias)
  - handoff_humano: Quando e como o bot passa para o dono
Checklist:
  - "[ ] Entrevistar dono (capturar voz e vocabulário)"
  - "[ ] Identificar Top 5 perguntas mais frequentes"
  - "[ ] Redigir mensagem de recepção (sem soar robótico)"
  - "[ ] Criar FAQ com tom da voz do dono"
  - "[ ] Criar sequência de follow-up (1h/24h/72h)"
  - "[ ] Criar mensagem de reativação de inativo"
  - "[ ] Definir handoff humano (quando bot cede para dono)"
  - "[ ] Teste dos 5 cenários: interesse, preço, sumiço, reclamação, urgência"
  - "[ ] Aprovação do dono: 'Parece eu falando?'"
---

# create-whatsapp-script

Cria o conjunto completo de scripts de atendimento WhatsApp para um comércio local,
capturando a voz autêntica do dono e configurando os flows principais.

## Uso

```
@commerce-clone
*interview [Nome do Negócio]
*script recepcao [Nome do Negócio]
*faq [Nome do Negócio] 10
*script followup [Nome do Negócio]
```

## Protocolo de Execução

### Step 1 — Entrevista de Voz (15 min)

Perguntas essenciais para o dono:

1. "Como você costuma se apresentar para um cliente novo? Me diz exatamente as palavras."
2. "Qual a frase que você mais fala durante o dia no balcão?"
3. "Quando um cliente pergunta o preço e você acha caro pra eles, o que você fala?"
4. "Você usa emojis nas mensagens? Me mostra um exemplo de como você responde hoje."
5. "Tem alguma palavra que você odeia e nunca usaria?"
6. "Por que você abriu esse negócio? O que te faz diferente?"

### Step 2 — Script de Recepção

Estrutura:
```
[Saudação personalizada com nome do negócio]
[Apresentação calorosa — 1 frase]
[Pergunta aberta de intenção]
[Opções de menu se necessário]
```

Exemplo (Petshop):
```
Oi! 🐾 Aqui é o [Nome], do [Petshop]!
Fico feliz que você entrou em contato.
Me conta: é pra agendar banho/tosa ou tem outra dúvida?
```

### Step 3 — FAQ (Top 10 Perguntas)

Formato para cada resposta:
```
P: [Pergunta exata como o cliente faz]
R: [Resposta na voz do dono — curta, humana, sem robô]
```

Categorias universais: preço, horário, localização, pagamento, prazo, produto específico

### Step 4 — Sequência de Follow-up

```
1h (se não respondeu):
"Oi [Nome]! Vi que você perguntou sobre [assunto].
Ainda precisa? Tô aqui 😊"

24h (se ainda não converteu):
"[Nome], tudo bem? Ainda tenho [disponibilidade/produto].
Se quiser, posso reservar pra você."

72h (última tentativa):
"[Nome], última vez que falo sobre isso pra não encher o saco 😅
Se mudar de ideia, é só chamar. Qualquer coisa tô aqui."
```

### Step 5 — Reativação de Inativos

```
30 dias sem comprar:
"[Nome]! Saudade de ver você aqui. Tem [novidade/promoção] que acho que você vai gostar."

60 dias:
"[Nome], tá tudo bem? Faz tempo! O [pet/pedido/produto] que você costumava pedir, ainda precisa?"
```

### Step 6 — Quality Gates

- [ ] Leu em voz alta? Soa humano?
- [ ] O dono reconhece a própria voz?
- [ ] Testado nos 5 cenários?
- [ ] Handoff para humano configurado?

## Output Esperado

Arquivo `scripts-[negocio].md` com todos os scripts organizados e prontos para
configuração no Evolution API / Typebot / bot.js do cliente.

## Related

- **Agent:** @commerce-clone
- **Integration:** Evolution API, Typebot, bot.js (clients/)
- **Task derivada:** onboard-comercio.md (deve vir antes)
