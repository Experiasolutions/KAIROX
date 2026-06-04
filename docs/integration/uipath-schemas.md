# Schemas de Integração: UiPath ↔ Experia AIOX

## 1. Contexto (Entrada)
O UiPath deve gerar este JSON e salvar como `context.json` antes de chamar o script.

```json
{
  "source": "whatsapp_web",
  "trigger": "new_message",
  "timestamp": "2026-02-13T10:00:00Z",
  "data": {
    "sender_name": "Maria Silva",
    "sender_phone": "+5511999998888",
    "message_text": "Olá, quanto custa o botox?",
    "chat_history": [
      {"role": "assistant", "text": "Bom dia! Tudo bem?"},
      {"role": "user", "text": "Tudo. Quanto é o botox?"}
    ],
    "screen_context": {
      "is_chat_open": true,
      "last_message_visible": true
    }
  }
}
```

## 2. Ação (Saída)
O AIOX vai gerar este JSON como `action.json` para o UiPath ler e executar.

### Cenário A: Responder Texto
```json
{
  "status": "success",
  "agent": "experia-copy",
  "confidence": 0.95,
  "action": {
    "type": "reply_message",
    "payload": {
      "text": "Olá Maria! O valor varia conforme a avaliação. Você prefere vir numa manhã ou tarde?"
    }
  },
  "log": "Identificada intenção de orçamento. Aplicado script de qualificação."
}
```

### Cenário B: Agendar (Uso Interno)
```json
{
  "status": "success",
  "agent": "experia-master",
  "action": {
    "type": "schedule_appointment",
    "payload": {
      "date": "2026-02-14",
      "time": "14:00",
      "patient": "Maria Silva",
      "procedure": "Avaliação Botox"
    }
  }
}
```

### Cenário C: Escalar para Humano
```json
{
  "status": "success",
  "agent": "experia-master",
  "action": {
    "type": "mark_as_unread",
    "payload": {
      "tag": "human_handoff",
      "reason": "Pergunta médica complexa detectada"
    }
  }
}
```

---

## 3. Instruções para o UiPath Copilot

Copie e cole isso no prompt do UiPath:

> "Crie um workflow que monitora o WhatsApp Web.
> Quando chegar mensagem nova:
> 1. Extraia o texto, nome do remetente e últimas 3 mensagens.
> 2. Salve esses dados num arquivo 'context.json' seguindo o schema JSON fornecido.
> 3. Execute o script 'node scripts/experia_bridge.js'.
> 4. Leia o arquivo 'action.json' gerado.
> 5. Se type for 'reply_message', digite o texto no campo e envie.
> 6. Se type for 'mark_as_unread', marque a conversa como não lida."
