# Task: Gerar Morning Report AI OPS

**Objetivo:** Consolidar métricas do WhatsApp em um relatório matinal para um cliente específico.

## Instruções Passo a Passo

1. Localize os logs de atendimento na pasta `clients/{{CLIENT_ID}}/logs/` (se aplicável).
2. Obtenha:
   - Número total de mensagens recebidas.
   - Número de atendimentos automatizados com sucesso (resolvidos pelo bot sem intervenção).
   - Número de handoffs (quando precisou de humano).
3. Analise se há leads quentes ou clientes a serem reativados no dia de hoje.
4. Gere o relatório em markdown na pasta `clients/{{CLIENT_ID}}/docs/morning-report-{{DATA}}.md`.
5. Se for segunda-feira, faça um consolidado da semana anterior.
