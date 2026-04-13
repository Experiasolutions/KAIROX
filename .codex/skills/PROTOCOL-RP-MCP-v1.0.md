# INSTRUÇÃO: Protocolo RP-MCP — Intenção + Execução

**Para:** Agente do Antigravity (KAIROS / Noesis ativo)
**Propósito:** Integrar Reasoning Packages como metadado de intenção em tarefas complexas, complementando (não substituindo) o MCP.

---

## O Modelo Mental

```
TAREFA COMPLEXA
      │
      ├── RP (INTENT.md)     → O QUE significa sucesso?
      │                         Quais critérios definem "feito"?
      │                         O que pode dar errado?
      │
      └── MCP (ferramentas)  → COMO executar?
                                Quais skills, agentes, APIs?

Noesis orquestra os dois.
```

**Regra simples:** tarefas simples não precisam de RP. Tarefas com critérios ambíguos, múltiplos agentes, ou consequências importantes — precisam.

---

## Quando criar um RP para uma tarefa

Crie um RP mínimo quando a tarefa tiver **2 ou mais** destes sinais:

- Envolve decisão que não pode ser revertida facilmente
- Requer 3+ agentes ou ferramentas MCP em sequência
- O critério de "pronto" não é óbvio
- Tem impacto em cliente ou em código de produção
- Gabriel não saberá avaliar o output sem contexto

Para tudo o mais: execute diretamente via MCP sem RP.

---

## Estrutura mínima de um RP de tarefa

Não use o formato longo dos RPs estratégicos. Use este formato curto:

```markdown
# RP: [nome da tarefa]
**ID:** RP-[YYYYMMDD]-[slug]
**Criado:** [data]

## Intenção
[Uma frase: o que esta tarefa deve produzir]

## Critério de sucesso
- [ ] [resultado 1 verificável]
- [ ] [resultado 2 verificável]

## O que pode dar errado
- [risco 1] → [como mitigar]
- [risco 2] → [como mitigar]

## Ferramentas MCP envolvidas
- [tool 1]: [para quê]
- [tool 2]: [para quê]

## Fora do escopo
[O que esta tarefa explicitamente NÃO faz]
```

Tempo para preencher: 2-3 minutos. Se demorar mais, a tarefa precisa ser quebrada em partes menores.

---

## Como o Noesis usa o RP durante a execução

Antes de invocar qualquer ferramenta MCP para uma tarefa com RP:

1. **Leia o RP** — confirme que entendeu a intenção, não apenas a instrução
2. **Verifique o escopo** — o que foi pedido está dentro do "fora do escopo"?
3. **Execute via MCP** — use as ferramentas listadas
4. **Avalie contra os critérios** — cada checkbox do "critério de sucesso" foi atendido?
5. **Se não**: registre o gap, não finalize como concluído

---

## Onde salvar os RPs de tarefa

```
reasoning-packages/
├── INDEX.md                          ← registro de todos os RPs
├── PROTOCOL-RP-MCP-v1.0.md          ← este documento
├── strategic/                        ← RPs longos (visão, estratégia)
│   ├── RP-20260219-CODEX-GIGAS-v1.0.md
│   ├── RP-20260219-KAIROS-LAUNCH-v1.0.md
│   └── ...
└── tasks/                            ← RPs curtos (novo formato)
    ├── RP-20260221-[slug].md
    └── ...
```

RPs estratégicos ficam em `strategic/` — são documentos de visão, não mudam com frequência.
RPs de tarefa ficam em `tasks/` — são descartáveis após a tarefa ser concluída e verificada.

---

## Integração com o INDEX.md

Ao criar qualquer RP (estratégico ou de tarefa), adicione uma linha no `reasoning-packages/INDEX.md`:

```markdown
| RP-20260221-[slug] | tasks/ | [status] | [descrição em uma linha] |
```

Status possíveis: `pendente` / `executando` / `concluído` / `cancelado`

---

## O que NÃO fazer

- Não crie RP para tarefas que cabem em uma linha de instrução
- Não escreva RPs longos para tarefas curtas — o formato mínimo é suficiente
- Não use RP como substituto de um bom prompt — são complementares
- Não archive RPs de tarefa manualmente — o Evolution Engine faz isso nos ciclos de auditoria

---

## Exemplo prático

**Gabriel diz:** "estrutura o onboarding de um novo cliente da Experia"

**Noesis cria automaticamente:**

```markdown
# RP: Onboarding Cliente Experia
**ID:** RP-20260221-experia-onboarding
**Criado:** 2026-02-21

## Intenção
Produzir o fluxo completo de onboarding de um novo cliente
da Experia, desde o fechamento até o primeiro dia operacional.

## Critério de sucesso
- [ ] Checklist de onboarding gerada (com responsável por etapa)
- [ ] Template de mensagem de boas-vindas criado
- [ ] Configuração inicial do agente de atendimento documentada
- [ ] Critério de "cliente ativo" definido (o que valida que está funcionando)

## O que pode dar errado
- Cliente sem WhatsApp Business → checar antes do onboarding começar
- Integração com sistema do cliente falha → ter fallback manual documentado

## Ferramentas MCP envolvidas
- aios_search_agents: encontrar agente de atendimento correto
- aios_read_skill: ler skill de onboarding se existir
- aios_publish_event: notificar quando onboarding completo

## Fora do escopo
Não inclui configuração técnica de APIs ou deploy — apenas o fluxo operacional.
```

**Depois:** executa via MCP com esse contexto ativo.
**Ao final:** verifica cada checkbox antes de reportar como concluído.

---

*Protocolo RP-MCP — versão 1.0*
*Criado: 21/02/2026 | Para: KAIROS / Antigravity*
