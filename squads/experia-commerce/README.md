# 🏪 Experia Commerce Squad

> **Squad de Governança Digital Autônoma para Comércios Locais**  
> Experia Solutions — by Gabriel Ferreira (KAIROS OS)

---

## O que é este Squad

O `experia-commerce` é o squad operacional da Experia para **qualquer tipo de comércio local** — padarias, petshops, hortifruti, restaurantes, salões, bazares, farmácias, academias e mais.

É a versão generalista do squad `experia` (focado em clínicas). Opera com a filosofia:

> **"1 operador humano + squads de agentes = output de 10+ pessoas"**

---

## Estratégia GTM

```
Free Trial (3-5 comércios locais via permuta)
        ↓
Squads KAIROX operam 24/7 (Clone + Analyst + Worker)
        ↓
Gabriel = Arquiteto da operação (não operador)
        ↓
Case documentado → "1 pessoa entregou o que 10 não fariam"
        ↓
Conversão para plano pago (Regional R$2.997/mês)
```

---

## Os 5 Executores

| Agente | Função | DNA |
|---|---|---|
| `@commerce-master` | Orquestrador central — onboarding, diagnóstico, delegação | Hormozi + Naval |
| `@commerce-clone` | Voz do dono em escala — scripts WhatsApp, FAQ, follow-up | Seth Godin + Brunson + Simon Sinek |
| `@commerce-analyst` | Dados & relatórios — KPIs, relatório matinal, ROI | Tim Ferriss + Hormozi |
| `@commerce-worker` | Automações & SOPs — processos, integrações, checklists | Tim Ferriss + Linus |
| `@commerce-sales` | Pitch & conversão — free trial, objeções, cases | Hormozi + Brunson |

---

## Segmentos Suportados

- 🥖 Padaria / Confeitaria
- 🥬 Hortifruti / Mercadinho  
- 🐾 Petshop
- 🍔 Restaurante / Lanchonete
- 👗 Bazar / Loja de Roupas
- ✂️ Salão / Barbearia
- 💊 Farmácia / Drogaria
- 🏋️ Academia / Fitness

---

## Prospects Pipeline

| Negócio | Status | Próximo Passo |
|---|---|---|
| Hortifruti (Elaine) | 🟢 FREE_TRIAL ativo | Calibrar voz do clone, apresentar relatório |
| Porto Alemão (Rogério) | 🟡 MAPEADO | QR Code + reconexão |
| Master Pumps | 🟡 MAPEADO | Trojan Horse via RH |

---

## Como Usar

### Onboarding de novo comércio
```
@commerce-master
*onboard [Nome do Negócio]
```

### Criar script de atendimento WhatsApp
```
@commerce-clone
*interview [Nome do Negócio]
*script recepcao [Nome do Negócio]
```

### Definir métricas e relatório matinal
```
@commerce-analyst
*kpis [Nome do Negócio] [segmento]
*morning-report [Nome do Negócio]
```

### Mapear e automatizar processo
```
@commerce-worker
*map [Processo]
*sop [Processo] [Negócio]
*automate [Processo]
```

### Abordar novo prospect
```
@commerce-sales
*prospect [Nome] [Negócio] [O que sabemos]
*pitch [Negócio] [Segmento]
```

---

## Quality Gates (Pré-Produção)

- [ ] Script de WhatsApp testado nos 5 cenários (interesse, preço, sumiço, reclamação, urgência)
- [ ] Dono aprovou a voz do clone ("Parece eu falando?")
- [ ] KPIs definidos antes de começar automação
- [ ] SOP documentado antes de implementar
- [ ] Rollback testado e funcional
- [ ] Métrica de sucesso do free trial definida no dia 0
- [ ] Case documentado ao encerrar o free trial

---

## Infraestrutura (Free Trial — Zero Custo)

| Componente | Ferramenta | Status |
|---|---|---|
| WhatsApp Gateway | Evolution API | ✅ Ativo no Railway |
| CRM Mínimo | Google Sheets | 🟡 A configurar por cliente |
| Automação de Flows | Make.com (free tier) | 🟡 A ativar |
| Relatório Matinal | WhatsApp direto | 🟡 A configurar |
| Bot Conversacional | Typebot (free) | 🟡 A configurar |

---

## Arquitetura do Squad

```
squads/experia-commerce/
├── squad.yaml               # Manifest do squad
├── README.md                # Este arquivo
├── agents/
│   ├── commerce-master.md   # Orquestrador
│   ├── commerce-clone.md    # Voz & Persona
│   ├── commerce-analyst.md  # Dados & Relatórios
│   ├── commerce-worker.md   # Automações & SOPs
│   └── commerce-sales.md    # Pitch & Conversão
└── tasks/
    ├── onboard-comercio.md
    ├── diagnose-comercio.md
    ├── create-whatsapp-script.md
    ├── create-morning-report.md
    ├── create-sop.md
    └── free-trial-pitch.md
```

---

*Squad criado via `squad-creator-design` + `squad-creator-create` workflow — KAIROS OS v3.1*
