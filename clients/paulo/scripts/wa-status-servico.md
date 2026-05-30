# Script: Status do Serviço (Paulo)

**Gatilho:** Mudança de status do pedido/serviço no sistema por parte do Paulo.

**Script Base:**

*Status: Em Andamento / Costura*
"Olá! Passando para atualizar sobre a sua peça. O Seu Paulo me informou que o seu estofado já está na fase de {{FASE_ATUAL_EX_COSTURA_DO_TECIDO}}. Está ficando excelente. Qualquer novidade, aviso por aqui."

*Status: Pronto para Retirada/Entrega*
"Boas notícias! A restauração da sua peça foi concluída com sucesso pelo Seu Paulo.
A qualidade ficou excepcional.

Para combinarmos a entrega/retirada, qual seria o melhor dia e horário para o senhor(a)?"

**Ação Pós-Script:**
- Se o cliente responder, notificar o Paulo para agendar o transporte.
