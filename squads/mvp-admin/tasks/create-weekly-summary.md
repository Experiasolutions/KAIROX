# TASK: Create Weekly Summary
**Squad:** mvp-admin
**Role:** admin-master

# OBJECTIVE
Fornecer um fechamento semanal ao dono do negócio toda sexta-feira às 18:00.

# INPUTS
- Tabela `kairos_client_metrics` agregada dos últimos 7 dias.
- Resumos diários.

# INSTRUCTIONS
1. Consolide os dados da semana:
   - Total de novos leads no WhatsApp.
   - Total de vendas/fechamentos (se rastreável).
   - Tempo médio de resposta do bot vs tempo humano.
2. Destaque 1 ponto de melhoria (ex: "Muitos clientes estão parando na etapa de enviar foto").
3. Envie para o WhatsApp do dono.

# EXPECTED OUTPUT
Mensagem de fechamento semanal no WhatsApp do dono.
