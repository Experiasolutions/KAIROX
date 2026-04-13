╔══════════════════════════════════════════════════════════════════════════╗
║ REASONING PACKAGE                                                        ║
║ ID: RP-20260324-NEXUS-v1.0-SEED                                         ║
║ Nome: NEXUS — Operador Universal de Sistemas                             ║
║ Versão: 1.0-SEED                                                         ║
║ Executor: NOESIS via Antigravity (sessão fe078e98)                       ║
║ Objetivo: Operador universal que se adapta a qualquer sistema do cliente ║
║ Contexto: Insight do operador 24/03 23:54, nome definido 25/03 12:37    ║
╚══════════════════════════════════════════════════════════════════════════╝

---

## VISÃO DO OPERADOR

Gabriel identificou um gap de mercado:
> Criar um "Operador Coringa" de sistemas — um agente que se adapta a QUALQUER
> sistema do cliente para operá-lo de forma autônoma, com orquestrador mestre
> falando diretamente com o humano.

**Insight-chave:** "Com um assistente desse, posso atender todo e qualquer
sistema de clientes... daria pra abrir uma startup só com essa premissa."

---

## SISTEMAS ALVOS INICIAIS

| Sistema | Cliente | Fornecedor | Contexto |
|---|---|---|---|
| STI3 Powerstock | Hortifruti Elaine | MAQ Extreme Automação | Contrato 2 anos, ~R$200/mês, PDV/estoque |
| Consumer | Porto Alemão | Consumer (líder iFood) | Recém-instalado, integração iFood |

---

## ARQUITETURA PROPOSTA: SQUAD HÍBRIDA

```
OPERADOR HUMANO (Gabriel)
       ↕
META-ORQUESTRADOR (KAIROS SKY / NOESIS)
  ├── Interpreta intenção do operador
  ├── Decompõe em micro-tarefas
  └── Delega para squad adequada
       ↕
SQUAD CORINGA (adapta-se ao sistema-alvo)
  ├── KAIROS AGENTS → Cognição, decisão, análise
  ├── OPENCLAW → Computer-use, scraping visual, click-by-click
  ├── UIPATH → RPA enterprise, automação de desktop
  └── [RELEVANTES A DESCOBRIR] → Playwright, Selenium, etc.
       ↕
SISTEMA DO CLIENTE (STI3 / Consumer / Qualquer)
  ├── Interface Web → OpenClaw/Playwright navega
  ├── API (se existir) → Integração direta
  └── Desktop App → UiPath opera
```

---

## COMO FUNCIONA NA PRÁTICA

```
1. OPERADOR: "Cadastra o produto X no sistema da Elaine com preço Y"
2. META-ORQUESTRADOR:
   - Identifica: sistema = STI3 Powerstock
   - Decompõe: login → nav → cadastrar → salvar → confirmar
   - Delega para: OpenClaw (computer-use no browser do STI3)
3. SQUAD CORINGA:
   - OpenClaw abre STI3, faz login, navega até cadastro
   - Preenche campos, salva, tira screenshot de confirmação
   - Retorna ao orquestrador: "Produto cadastrado com sucesso"
4. OPERADOR recebe confirmação via Telegram/Painel
```

---

## STACK TÉCNICA CANDIDATA

| Camada | Ferramenta | Papel |
|---|---|---|
| Cognição | KAIROS/AIOX Agents | Decisão, análise, decomposição de tarefas |
| Computer-Use | OpenClaw | Navegação visual web, click-by-click |
| RPA Desktop | UiPath Community | Automação de apps desktop |
| Browser Auto | Playwright / Selenium | Automação programática web |
| Orquestração | KAIROS SKY (Python) | Pipeline, routing, delegação |
| Interface | Painel Web + Telegram | Comunicação operador ↔ sistema |

---

## DIFERENCIAL COMPETITIVO

- Não é RPA tradicional (rígido, script-based)
- Não é chatbot (limitado a conversa)
- É um **OPERADOR COGNITIVO** que:
  1. Entende o que o humano quer (NLP)
  2. Conhece o sistema do cliente (mapeamento)
  3. Opera o sistema de forma autônoma (computer-use + RPA)
  4. Reporta ao humano (Telegram/Painel)
  5. Aprende com cada interação (memória persistente)

---

## POTENCIAL DE STARTUP

```
NOME CANDIDATO: ??? (a definir)
PITCH: "Seu funcionário digital que já sabe usar qualquer sistema"
MERCADO: Qualquer negócio com software complexo que ninguém sabe usar bem
MODELO: SaaS B2B — R$500-5.000/mês por sistema operado
DIFERENCIAL: Não precisa trocar o sistema — o agente se adapta ao que existe
```

---

## PRÓXIMOS PASSOS

1. [ ] Mapear interface do STI3 Powerstock (screenshots, fluxos)
2. [ ] Mapear interface do Consumer (screenshots, fluxos)
3. [ ] Pesquisar OpenClaw capabilities + integração com KAIROS
4. [ ] PoC: operação básica no STI3 via computer-use
5. [ ] Definir nome do projeto/produto

---

*ID:* RP-20260324-OPERADOR-CORINGA
*Versão:* 1.0-SEED
*Status:* IDEAÇÃO — capturado em stream of consciousness
*Dependências:* KAIROS SKY, OpenClaw, UiPath Community, STI3 Powerstock, Consumer
*Potencial:* ALTO — pode virar produto standalone / startup
