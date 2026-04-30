---
task: Pitch de Free Trial para Comércio Local
responsavel: "@commerce-sales"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - nome_prospect: Nome do dono do comércio
  - nome_negocio: Nome do comércio
  - segmento: Tipo de negócio
  - contexto: O que já sabemos sobre o negócio (dor, volume, forma de atendimento)
  - canal_abordagem: Presencial / WhatsApp / Indicação
Saida: |
  - script_pitch: Hook + Story + Offer personalizado (< 2 min de fala)
  - respostas_objecoes: As 3 objeções mais prováveis com respostas
  - oferta_trial: O que está incluído no free trial deste negócio
  - metrica_sucesso: O que precisa acontecer para o trial ser "sucesso"
  - proximo_passo: Ação imediata após o aceite
Checklist:
  - "[ ] Pesquisar o negócio antes da abordagem (horário, produto, atendimento)"
  - "[ ] Identificar a maior dor visível do negócio"
  - "[ ] Criar Hook personalizado (começa com o problema do dono, não com IA)"
  - "[ ] Criar Story em 3 frases (por que a Experia existe)"
  - "[ ] Definir Offer do free trial (o que eles recebem, sem custo)"
  - "[ ] Preparar respostas para as 3 objeções mais prováveis"
  - "[ ] Definir métrica de sucesso acordada com o dono"
  - "[ ] Próximo passo claro: 'Preciso de 30 min seu nos próximos 3 dias'"
---

# free-trial-pitch

Prepara Gabriel para abordar um novo comércio local com o pitch do free trial da Experia.
Filosofia Hormozi: a oferta tem que ser tão boa que a pessoa se sente idiota dizendo não.
Filosofia Brunson: Hook (atenção) → Story (conexão) → Offer (ação).

## Uso

```
@commerce-sales
*prospect [Nome] [Negócio] [contexto]
*pitch [Negócio] [segmento]
```

## Protocolo de Execução

### Step 1 — Pesquisa Prévia (5 min)

Antes de abordar, responder:
- Qual o horário de funcionamento?
- Como eles atendem hoje (WhatsApp/presencial)?
- Qual a dor mais visível? (ex: demora pra responder, sem agendamento online)
- Gabriel já conhece o dono? Qual o contexto do relacionamento?

### Step 2 — Estrutura do Pitch (Hook → Story → Offer)

**Hook (1 frase — começa com o problema, nunca com "tenho uma tecnologia"):**
```
Opção A: "Você percebeu quantas mensagens você deixa sem responder por dia?"
Opção B: "Quanto tempo você acha que leva até um cliente desistir quando
          você não responde rápido?"
Opção C: "Você já calculou quanto você perde quando um agendamento some?"
```

**Story (2-3 frases — por que a Experia existe):**
```
"Eu montei um sistema que responde pelo dono do negócio quando ele não pode.
Com a voz dele, do jeito dele. Não parece robô — parece o próprio dono.
Já tô usando com [referência relevante] e funcionou muito bem."
```

**Offer (o free trial — claro, específico, sem catch):**
```
"Quero testar aqui com você de graça por 30 dias.
Vou configurar tudo, você só vai precisar me dar 30 minutos
pra eu entender como você atende. Se não gostar, a gente para e acabou.
Se gostar, a gente vê o que faz sentido continuar."
```

### Step 3 — Respostas para Objeções

| Objeção | Resposta |
|---|---|
| "Aqui tá bom assim" | "Entendo! Me fala: quando você não consegue responder rápido, o cliente vai aonde?" |
| "Deve ser caro" | "Por isso quero testar de graça primeiro. 30 dias. Sem custo, sem contrato." |
| "Não entendo de tecnologia" | "Você não precisa. Você continua o que já faz — eu resolvo a parte técnica." |
| "Já tenho alguém pra isso" | "Ótimo! Isso libera seu funcionário pra coisas mais importantes." |
| "Já tentei chatbot e não funcionou" | "Faz sentido. A diferença aqui é que configuro com a sua voz, do seu jeito." |

### Step 4 — Definir Métrica de Sucesso

Antes de começar o trial, combinar UMA métrica:
```
"O que seria um sucesso pra você em 30 dias?
Se isso acontecer, você vai sentir que valeu?"

Exemplos:
• "Nenhuma mensagem sem resposta por mais de 15 minutos"
• "X agendamentos confirmados via WhatsApp por semana"
• "Tempo de resposta médio abaixo de 5 minutos"
```

### Step 5 — Próximo Passo Imediato

Após o aceite:
```
"Ótimo! Então eu preciso de uns 30 minutos com você ainda essa semana
pra entender como você atende. Quando você tem?"

→ Marcar data e hora específica
→ Executar: onboard-comercio.md
```

## Output Esperado

Script completo salvo em `clients/[negocio]/pitch-script.md` com:
- Hook personalizado
- Story adaptada ao segmento
- Offer específica para este negócio
- Top 3 objeções + respostas
- Métrica de sucesso acordada
- Próximo passo definido

## Related

- **Agent:** @commerce-sales
- **Task derivada:** onboard-comercio.md (após aceite do free trial)
- **Case:** Hortifruti (Elaine) — trial ativo, referência disponível
