# NIGHT SHIFT — Turno Autônomo

## Horário padrão
Início: 23h00 | Fim: 07h00 (configurável)

## Tarefas fixas (toda noite — execução SERIAL)

### 00h00 — Evolution Cycle
node scripts/evolution/evolution-engine.js --auto
Detecta gaps, propõe melhorias, aplica as aprovadas previamente.
Salva relatório em .aios-core/night-reports/[data]-evolution.md

### 02h00 — Content Generation (Experia)
Para cada cliente ativo:
- Gera 3 sugestões de post para o dia seguinte
- Gera follow-up para leads que não responderam há 48h
- Gera relatório de métricas do dia
Salva em clients/[cliente]/pending-review/

### 04h00 — Cognitive State Compression
node scripts/evolution/cognitive-state-engine.js --compress
Consolida memórias do dia, remove ruído, fortalece padrões.

### 06h00 — Morning Brief
Compila relatório do que foi feito na noite.
Envia para Gabriel via Telegram antes de acordar.
Formato: resumo em 5 bullets + itens que precisam de decisão.

## Tarefas variáveis (fila de Gabriel)
Gabriel pode adicionar tarefas para a noite via Telegram:
/noite [descrição da tarefa]
O Night Shift processa na ordem da fila após as tarefas fixas.

## Restrições de hardware (8GB RAM, Celeron)
- Tarefas NUNCA rodam em paralelo — sempre SERIAL
- Timeout de 5 minutos por tarefa (evita loops infinitos)
- Se uma tarefa falhar, logar erro e prosseguir para a próxima
- Não rodar mais de 3 ciclos de Evolution por noite

## O que o Night Shift NUNCA faz
- Envia mensagem para clientes reais sem aprovação
- Faz deploy em produção
- Gasta mais de $5 em APIs em uma noite
- Modifica arquivos de identidade (identity-anchor.json, etc.)
