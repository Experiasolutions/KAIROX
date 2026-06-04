# 🔧 Engine/Client Separation — Multi-Tenancy Pattern for AIOX

## O Problema

Quando você usa o AIOX para um negócio específico (clínica, agência, e-commerce), é natural colocar tudo junto: agentes genéricos e agentes específicos do domínio no mesmo lugar. Isso funciona no começo, mas quando você quer atender **2 clientes diferentes**, o sistema quebra:

- Agentes do Cliente A veem dados do Cliente B
- Um deploy pode derrubar todos os clientes
- Não dá pra reutilizar o motor em outro domínio sem limpar manualmente

## A Solução

Separar o **motor** (engine) da **aplicação** (client). O AIOX é o motor. O negócio do cliente é a aplicação que roda no motor.

```
project-root/
│
├── squads/                      ← ENGINE (motor — domain-agnostic)
│   ├── doombot/                 ← squad de desenvolvimento
│   │   └── agents/
│   ├── meta/                    ← squad de meta-agentes
│   │   └── agents/
│   └── mind-clones/             ← clones mentais (genéricos)
│       └── agents/
│
├── clients/                     ← APPLICATION (domínio)
│   ├── clinica-joana/           ← Cliente 1
│   │   ├── config.json
│   │   ├── agents/              ← agentes específicos deste cliente
│   │   ├── templates/           ← mensagens, responses
│   │   └── data/                ← dados do cliente
│   │
│   └── pet-shop-rex/            ← Cliente 2 (totalmente isolado)
│       ├── config.json
│       ├── agents/
│       ├── templates/
│       └── data/
│
├── scripts/                     ← ENGINE scripts
├── .aiox-core/                  ← ENGINE configuration
└── tools/                       ← ENGINE tools
```

## Regras

### ✅ O que fica no ENGINE (squads/, scripts/, .aiox-core/):
- Agentes genéricos (dev, QA, PM, analytics, etc.)
- Scripts de orquestração
- Configuração do AIOX
- Tools e skills
- **NUNCA** referência a um cliente específico

### ✅ O que fica no CLIENT (clients/[nome]/):
- Agentes específicos do domínio ("agente de agendamento da Clínica Joana")
- Templates de mensagem do cliente
- Dados e configurações específicas
- Fluxos de atendimento customizados
- Tom de voz e branding do cliente

### ❌ O que NUNCA misturar:
- Arquivo em `squads/` que menciona "Joana" ou "Rex"
- Arquivo em `clients/` que modifica comportamento do engine
- Credenciais de cliente no `.env` global (use `clients/[nome]/.env`)

## Como detectar "contaminação de domínio"

Se algum destes existir em `squads/` ou `scripts/`, está contaminado:

```bash
# Buscar contaminação
grep -r "clinica\|joana\|rex\|pet.shop" squads/ scripts/
```

Se encontrar resultados → mover para `clients/[nome]/`.

## Para quem tem 1 cliente só

Mesmo com 1 cliente, implemente a separação. Motivos:

1. **Futuro:** Quando o segundo cliente chegar, já está pronto
2. **Clareza:** Saber o que é do motor e o que é do negócio
3. **Portabilidade:** Copiar o motor para outro projeto sem arrastar o domínio
4. **Evolução:** Facilita auditoria e manutenção — ferramentas podem validar a separação automaticamente

## Implementação em 5 minutos

```bash
# 1. Criar a pasta do cliente
mkdir -p clients/meu-cliente/{agents,templates,data}

# 2. Mover arquivos de domínio
mv squads/atendimento-clinica/ clients/meu-cliente/agents/

# 3. Criar config do cliente
cat > clients/meu-cliente/config.json << 'EOF'
{
  "name": "Clínica Joana",
  "domain": "saúde/estética",
  "channels": ["whatsapp", "instagram"],
  "tone": "acolhedor e profissional",
  "created": "2026-02-23"
}
EOF

# 4. Verificar que não ficou contaminação
grep -r "joana\|clinica" squads/ scripts/
# Se vazio → está limpo ✅
```

## Princípio Imutável

> **"O AIOX é motor, não aplicação. Não tem domínio."**

O mesmo motor que atende uma clínica de estética pode atender um pet shop, uma imobiliária, ou uma fintech. A inteligência está no motor. O domínio está no cliente.

---

*Contribuição: KAIROS Project — Community Edition*
*Padrão testado com 270+ arquivos de aplicação isolados do engine*
