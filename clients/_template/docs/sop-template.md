# SOP: Operação Padrão — {{NOME_NEGOCIO}}

## 1. Visão Geral
Este SOP define o protocolo padrão de atendimento automático e intervenção humana para o(a) {{NOME_NEGOCIO}}.

## 2. Automação WhatsApp (Bot)
- **Instância Evolution:** `{{INSTANCE_NAME}}`
- **Atuação:** O bot deve agir como o(a) {{NOME_DONO}} ou como primeiro(a) atendente.
- **Filtros de Segurança:**
  - Não responder fora do horário comercial (caso configurado).
  - Ignorar contatos pessoais do dono.

## 3. Casos de Transbordo Humano
O bot deve avisar o(a) {{NOME_DONO}} e parar de responder quando:
- O cliente fizer uma reclamação grave (palavras-chave: estorno, raiva, polícia, procon, péssimo).
- O cliente solicitar falar com atendente humano especificamente.
- O cliente fizer uma pergunta altamente técnica não mapeada nos scripts.

## 4. Rotina de Follow-up (Recuperação)
- Leads que orçaram e não responderam em 24h recebem mensagem 1.
- Leads frios (72h) recebem mensagem 2 (oferta ou urgência).

## 5. Rotina de Reativação
- No dia 5 de cada mês, extrair lista de clientes inativos há >60 dias do Supabase.
- Disparar campanha de reativação (Script de Reativação).
