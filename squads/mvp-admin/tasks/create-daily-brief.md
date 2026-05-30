# TASK: Create Daily Brief
**Squad:** mvp-admin
**Role:** admin-master

# OBJECTIVE
Gerar um resumo diário rápido e direto para o dono do negócio, contendo o que aconteceu enquanto ele estava fora/dormindo e as prioridades de hoje.

# INPUTS
- Logs do bot do WhatsApp nas últimas 24h.
- Agendamentos do dia.
- Tarefas pendentes.

# INSTRUCTIONS
1. Leia a tabela `kairos_messages_log` do cliente no Supabase, filtrando por ontem/madrugada.
2. Extraia:
   - Número de novos contatos.
   - Orçamentos enviados.
   - Mensagens aguardando intervenção humana (escaladas).
3. Leia a agenda (se aplicável, via N8N ou Google Calendar).
4. Formate a mensagem de forma enxuta usando emojis.
5. Envie para o WhatsApp pessoal do dono via Evolution API.

# EXPECTED OUTPUT
Uma mensagem via WhatsApp para o dono às 07:00 da manhã.
Exemplo:
"Bom dia, {{NOME_DONO}}! ☀️
Aqui é o seu assistente de back-office.
- Ontem tivemos 3 orçamentos enviados pelo bot.
- 1 cliente pediu pra falar com você (Link da conversa: ...).
- Hoje você tem 2 entregas programadas.
Bom trabalho!"
