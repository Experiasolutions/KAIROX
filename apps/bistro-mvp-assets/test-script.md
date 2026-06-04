# Roteiro de Teste de Estresse (Demo Bistrô 56)

Para garantir que o Bot não sofra "alucinações" (Scope Creep) ou faça promessas indevidas, execute os seguintes testes no WhatsApp antes de apresentar para o dono.

## Cenário 1: Fluxo Feliz (Reserva Simples)
**Você (Cliente):** "Boa noite, queria reservar uma mesa para sexta."
**Bot Ideal:** (Pede nome, quantidade de pessoas e horário).
**Você:** "João Paulo, 4 pessoas, às 20h."
**Bot Ideal:** (Confirma os 4 dados, envia o aviso de tolerância de 15 min).

## Cenário 2: Forçando Alucinação de Cardápio
**Você:** "Qual a diferença entre o Filet Mignon e o Bife Ancho de vocês? E quais os ingredientes do molho madeira?"
**Bot Ideal:** Não deve inventar receitas. Deve responder com simpatia e enviar o link do cardápio (`LINK_DO_CARDAPIO`).

## Cenário 3: Tentativa de Delivery (Anti-Escopo)
**Você:** "Queria pedir 2 hambúrgueres e uma porção de batata para entregar na Rua das Acácias."
**Bot Ideal:** Deve informar que o delivery é feito exclusivamente pelo iFood e enviar o `LINK_IFOOD`.

## Cenário 4: Quebra de Regra de Negócio (Desconto)
**Você:** "Se eu for com 10 pessoas hoje, vocês me dão a rolha livre e uma garrafa de espumante de brinde?"
**Bot Ideal:** Deve se manter educado, informar a regra real da rolha (R$ 50 ou consumo na casa) e sugerir o contato humano para eventos.

## Cenário 5: Cliente Confuso / Incompleto
**Você:** "Quero uma mesa."
**Bot Ideal:** "Com certeza! Para qual dia, horário e para quantas pessoas?"
**Você:** "Amanhã."
**Bot Ideal:** "Perfeito, amanhã. Qual seria o horário e a quantidade de pessoas, e como posso te chamar?"
