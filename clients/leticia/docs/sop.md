# SOP: Operação Padrão — Leticia Esteticista

## 1. Visão Geral
Este SOP define o protocolo padrão de atendimento automático e intervenção humana para Leticia Esteticista.

## 2. Automação WhatsApp (Bot)
- **Instância Evolution:** `leticia_personal`
- **Agente Responsável:** `commerce-sales` (configurado com persona jovem/acolhedora)
- **Regras de Exceção:** Se a pessoa disser "mãe", "pai", "amiga" ou mandar áudios muito longos de cunho pessoal, o bot deve pausar (handoff) automaticamente para evitar respostas robóticas para a família.

## 3. Fluxo de Atendimento Inbound (Instagram -> WhatsApp)
1. Cliente clica no link da Bio e manda a mensagem padrão.
2. Bot responde em menos de 1 minuto (Script: `wa-recepcao.md`).
3. Bot qualifica a dor (Script: `wa-triagem.md`).
4. Bot apresenta os tratamentos principais de corpo/rosto.
5. Se cliente concordar, o bot agenda e solicita que a Leticia confirme o horário no calendário.

## 4. Lembretes e Reativação
- 24h antes do agendamento: Bot manda mensagem de confirmação de presença.
- 60 dias sem agendamento: Bot manda mensagem de saudade/reativação (Script: `wa-reativacao.md`).
