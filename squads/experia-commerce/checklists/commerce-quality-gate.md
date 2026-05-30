# Commerce Quality Gate — Checklist de Validação

> Checklist obrigatório antes de aprovar qualquer entrega do squad experia-commerce.
> Aplica-se a scripts, automações, relatórios e pitchs.

---

## 🏪 Gate 1: Requisitos do Negócio

- [ ] Brief do negócio 100% preenchido (nome, segmento, canal, dor, volume, quem responde, objetivo 30 dias)
- [ ] Diagnóstico financeiro calculado (3 vazamentos + impacto em R$)
- [ ] Plano P0/P1/P2 aprovado pelo dono

## 🎭 Gate 2: Scripts e Voz (commerce-clone)

- [ ] Script lido em voz alta — soa humano?
- [ ] Dono aprovou a voz como sua?
- [ ] 3 objeções comuns respondidas (preço, horário, produto específico)
- [ ] Handoff humano configurado para casos complexos
- [ ] Testado com 5 cenários: interesse, preço, sumiço, reclamação, urgência
- [ ] Nenhuma frase como "Olá! Sou um assistente virtual" ou "Em que posso ajudar?"
- [ ] Follow-up com tom humano (zero desespero, sem "promoção imperdível")

## 📊 Gate 3: Relatórios e Métricas (commerce-analyst)

- [ ] Relatório matinal cabe em 1 tela de celular (≤ 10 linhas)
- [ ] Tom caloroso mas direto
- [ ] Comparativo vs. dia/semana anterior presente
- [ ] Alerta acionável incluído quando aplicável
- [ ] Cada métrica mostra R$ (ganho, salvo ou perdido)
- [ ] ROI calculado com fórmula transparente

## ⚙️ Gate 4: Automações e SOPs (commerce-worker)

- [ ] SOP documentado ANTES de implementar (trigger + passos + exceções + rollback + métricas)
- [ ] 5 casos de teste definidos e executados
- [ ] Rollback testado e funcional
- [ ] Dono aprovou o fluxo em test mode
- [ ] Handoff manual configurado (casos que chegam para humano)
- [ ] Logs ativos (saber o que rodou e quando)
- [ ] Automação idempotente (rodar 2x não gera 2x resultado)

## 🎯 Gate 5: Pitch e Free Trial (commerce-sales)

- [ ] Hook personalizado para o prospect
- [ ] Story com case real (não hipotético)
- [ ] Offer de free trial com prazo máximo 30 dias
- [ ] 3 objeções antecipadas com respostas consultivas
- [ ] Métrica de sucesso definida ANTES do trial
- [ ] Entrega clara (o que inclui e o que não inclui)

## 🛑 Veto Conditions (BLOQUEIA ENTREGA)

Qualquer um destes itens **vetam** a entrega para produção:

1. **Script robótico** — soa como chatbot genérico → refazer com commerce-clone
2. **Sem métrica** — automação sem indicador de sucesso → definir com commerce-analyst
3. **Sem rollback** — automação sem botão de desligar → documentar com commerce-worker
4. **Sem aprovação do dono** — qualquer entrega não aprovada → apresentar primeiro
5. **Sem cases reais** — pitch usando dados hipotéticos → rodar diagnóstico real
6. **Spam** — disparo em massa sem segmentação → vetado absolutamente
7. **Dados sensíveis** — coleta de dados de clientes finais sem consentimento → vetado

---

## Assinatura

- **Agente revisou:** ________________
- **Dono aprovou:** ________________
- **Data:** ________________
