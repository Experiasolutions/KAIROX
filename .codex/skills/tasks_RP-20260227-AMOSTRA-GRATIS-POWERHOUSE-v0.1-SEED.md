╔══════════════════════════════════════════════════════════════════════════╗
║ REASONING PACKAGE                                                        ║
║ ID: RP-20260227-AMOSTRA-GRATIS-POWERHOUSE                               ║
║ Versão: 0.1-SEED                                                         ║
║ Executor: KAIROS (Gemini 3.1 Pro + Noesis ativo)                        ║
║ Objetivo: Pipeline de amostras grátis + ROI + OpenClaw Skills           ║
╚══════════════════════════════════════════════════════════════════════════╝

## CONTEXTO

Gabriel tem ~14 negócios locais como leads.
Tem arsenal completo de ferramentas de mídia IA (R$0).
Tem KAIROS como motor de execução.
Tem OpenClaw como gateway de entrega.

A estratégia: entregar uma amostra grátis personalizada
para cada negócio ANTES de qualquer pitch.
Eles experimentam o poder. O desejo se cria sozinho.

---

## AS 3 AMOSTRAS GRÁTIS

### AMOSTRA 1 — Vídeo Comercial IA
**Para quem:** marmitaria, padaria, petshop, bazar, açougue
**O que é:** vídeo de 30-60s nível comercial de TV com os produtos deles
**Ferramentas:** Kling AI + ElevenLabs + CapCut
**Tempo de produção:** 30-45 min por negócio

Estrutura do vídeo:
```
0-3s   → Logo/nome do negócio com animação
3-15s  → Imagens dos produtos com narração profissional
15-25s → Oferta do dia / destaque da semana
25-30s → CTA: endereço + WhatsApp + "peça já"
```

Narração gerada por ElevenLabs.
Imagens: fotos que Gabriel tira no local OU geradas por Kling/Qwen.
Entrega: MP4 pronto para postar no Instagram/WhatsApp.

**O que dizer ao entregar:**
> "Fiz isso em 30 minutos. Imagina o que eu faço
> trabalhando pro seu negócio todo dia."

---

### AMOSTRA 2 — Projeção de ROI Personalizada
**Para quem:** todos os 14 negócios
**O que é:** documento de 1 página mostrando quanto dinheiro
o negócio está deixando na mesa hoje — e quanto vai recuperar
com o sistema.
**Ferramentas:** KAIROS gera o cálculo + Canva formata
**Tempo de produção:** 15 min por negócio (após template pronto)

Estrutura do ROI:

```
DIAGNÓSTICO ATUAL:
• Tempo respondendo WhatsApp por dia: X horas
• Leads perdidos por demora: Y/mês
• Valor médio por cliente: R$Z
• Receita perdida estimada: R$ [Y × Z] /mês

COM O SISTEMA EXPERIA:
• Tempo recuperado: X horas/dia → X × 30 = [horas/mês]
• Leads capturados: [80% dos Y perdidos]
• Receita recuperada estimada: R$ [0,8 × Y × Z] /mês
• Investimento Experia: R$497/mês
• ROI mês 1: [receita recuperada - 497] / 497 × 100%

EXEMPLO REAL PARA [NOME DO NEGÓCIO]:
Se você perde só 5 clientes por mês por falta de resposta
e cada cliente vale R$150:
→ R$750/mês perdido
→ Sistema custa R$497/mês
→ Lucro líquido: R$253/mês só de recuperação
→ ROI: +50% no primeiro mês
```

**Dados coletados antes de gerar:**
Gabriel faz 3 perguntas rápidas ao dono:
1. Quantas mensagens recebe por dia no WhatsApp?
2. Qual o valor médio de uma venda/serviço?
3. Quantos clientes estima perder por falta de resposta?

KAIROS calcula o ROI em tempo real e gera o PDF.

---

### AMOSTRA 3 — Assistente Demo Funcional
**Para quem:** assistência técnica, negócios que entendem tecnologia
**O que é:** bot Telegram configurado com o nome e serviços
do negócio deles — funcionando ao vivo na frente deles
**Ferramentas:** bot Telegram já existente de Gabriel
**Tempo de produção:** 20 min por negócio

O que o bot faz na demo:
- Responde as 5 perguntas mais comuns do negócio
- Manda um "relatório matinal" fictício mas realista
- Responde comandos /status /hoje /leads

**O que dizer ao mostrar:**
> "Isso é o seu assistente. Com a sua cara.
> Respondi a pergunta em 2 segundos.
> Você estava ocupado — ele fechou por você."

---

## PIPELINE DE PRODUÇÃO — 1 DIA PARA 14 NEGÓCIOS

### Fase 1 — Templates (2 horas, faz uma vez)

```
KAIROS executa:

1. Template de roteiro de vídeo (variáveis: [nome], [produto], [endereço])
2. Template de cálculo de ROI (variáveis: [mensagens/dia], [ticket], [perdas])
3. Template de bot demo (variáveis: [nome], [serviços], [preços])
4. Template de mensagem de entrega WhatsApp
5. Skill OpenClaw: gerar_video_comercial
6. Skill OpenClaw: gerar_roi_pdf
7. Skill OpenClaw: configurar_bot_demo
```

### Fase 2 — Produção em série (30 min por negócio)

```
Para cada negócio:
10 min → Gabriel coleta: fotos, nome, serviços, dados básicos
15 min → KAIROS gera: vídeo + ROI + bot configurado
5 min  → Gabriel revisa e personaliza se necessário
```

### Fase 3 — Entrega (5 min por negócio)

```
Gabriel aparece pessoalmente:
"Fiz isso pra você. Sem compromisso. Quer ver?"
Mostra o vídeo. Mostra o ROI. Mostra o bot.
Silêncio. Deixa o dono reagir.
```

---

## SKILLS OPENCLAW — O QUE CRIAR

Para transformar o KAIROS em powerhouse de execução,
criar estas skills no OpenClaw:

### Skill 1: `video_comercial`
```
Input: nome_negocio, produto_destaque, endereco, fotos[]
Processo:
  1. Gera roteiro via KAIROS
  2. Gera narração via ElevenLabs API
  3. Gera imagens via Kling/Qwen API
  4. Monta vídeo via CapCut API ou FFmpeg
Output: arquivo MP4 pronto
Tempo: 20 min automático
```

### Skill 2: `roi_personalizado`
```
Input: nome_negocio, mensagens_dia, ticket_medio, perdas_estimadas
Processo:
  1. KAIROS calcula métricas
  2. Gera PDF formatado via Canva API ou HTML→PDF
  3. Inclui gráfico de projeção 3 meses
Output: PDF 1 página
Tempo: 5 min automático
```

### Skill 3: `bot_demo`
```
Input: nome_negocio, servicos[], precos[], horarios
Processo:
  1. KAIROS gera as 5 respostas principais
  2. Configura bot Telegram com as respostas
  3. Gera relatório matinal fictício realista
Output: bot ativo + link para demo
Tempo: 10 min automático
```

### Skill 4: `pacote_completo_lead`
```
Input: dados básicos do negócio
Processo: executa skills 1 + 2 + 3 em sequência
Output: vídeo + PDF + bot configurado
Tempo: 35 min automático
Uso: Gabriel faz intake, KAIROS entrega tudo
```

---

## PROJEÇÃO DE ROI — PARA O PRÓPRIO GABRIEL

Quantas amostras grátis para quantas vendas:

```
14 amostras entregues
→ Taxa de conversão esperada: 20-30% (produto gratuito primeiro)
→ Vendas estimadas: 3-4 negócios

Cenário conservador (3 clientes × R$497):
→ R$1.491/mês recorrente

Cenário médio (4 clientes × R$497):
→ R$1.988/mês recorrente

Mais permuta:
→ Alimentação (marmitaria)
→ Máquina ou periférico (informática)
→ Remédios Tigrinho (petshop)
→ Produtos (bazar)

MRR real do mês 1: R$1.491 + ~R$800 em permutas
= equivalente a R$2.291 sem sair do bairro
```

---

## MENSAGEM DE ENTREGA — TEMPLATE WHATSAPP

Para enviar junto com cada amostra:

```
Oi [nome]! Sou o Gabriel, moro aqui no bairro mesmo.

Fiz uma coisa pra você sem compromisso nenhum 👇

[vídeo comercial anexo]

Em 30 minutos criei isso usando o sistema que desenvolvi.
Também fiz uma análise rápida de quanto seu negócio
pode estar perdendo por mês — posso te mandar?

Não precisa me pagar nada pra ver. É só pra você conhecer.
```

---

## CRITÉRIO DE SUCESSO

```
□ Templates criados (faz uma vez, usa 14 vezes)
□ Skills OpenClaw especificadas e prontas para implementar
□ Pipeline de 30 min/negócio funcionando
□ Pelo menos 5 amostras entregues no primeiro dia
□ Pelo menos 2 respostas positivas
□ Pelo menos 1 reunião marcada
□ Pelo menos 1 permuta fechada (remédios ou alimentação)
```

---

## ORDEM DE EXECUÇÃO

```
HOJE:
  1. KAIROS cria os 4 templates (2h)
  2. KAIROS especifica as 4 skills OpenClaw (1h)
  3. Gabriel produz amostras para os 2 alvos quentes
     (técnico informática + bazar) (1h)
  4. Entrega pessoalmente hoje ainda

AMANHÃ:
  5. Produz mais 5-6 amostras
  6. Entrega pessoalmente
  7. Follow-up nos que receberam hoje

EM 3 DIAS:
  8. Skills OpenClaw implementadas
  9. Pipeline totalmente automático
  10. Gabriel só faz a coleta e a entrega
      KAIROS faz tudo no meio
```

---

*"A amostra grátis não é custo. É o investimento mais
inteligente que existe — porque o produto se vende sozinho."*

**ID:** RP-20260227-AMOSTRA-GRATIS-POWERHOUSE
**Versão:** 0.1-SEED
**Próximo passo:** KAIROS criar os 4 templates agora
