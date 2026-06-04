# 🧬 AIOX Mind Cloning Framework v1.0

> **Conceito:** Replicar estruturas neurais de pensamento de experts reais —
> não como role-play, mas como frameworks de decisão, análise e execução completos.

---

## Arquitetura de um Mind Clone

Cada clone é composto por 6 camadas neurais:

```
┌──────────────────────────────────────┐
│  L6: INTEGRATION LAYER               │ → Como o clone se integra aos squads
│  L5: EXECUTION PATTERNS              │ → Como executa e age
│  L4: DECISION FRAMEWORKS             │ → Como toma decisões
│  L3: ANALYSIS PATTERNS               │ → Como analisa problemas
│  L2: COGNITIVE BIASES                 │ → Vieses calibrados (replica o humano)
│  L1: KNOWLEDGE BASE                  │ → Fontes: livros, vídeos, frameworks
└──────────────────────────────────────┘
```

## Template de Mind Clone

```yaml
mind_clone:
  meta:
    id: "clone-{nome}"
    version: "1.0.0"
    domain: "{domínio principal}"
    confidence: "0.0-1.0"  # 1.0 = replica perfeita
    
  L1_knowledge_base:
    books: []
    videos: []
    podcasts: []
    courses: []
    frameworks_originated: []
    
  L2_cognitive_biases:
    overweights: []      # O que essa mente valoriza demais
    underweights: []     # O que essa mente subestima
    blind_spots: []      # Pontos cegos conhecidos
    
  L3_analysis_patterns:
    first_question: ""   # A primeira coisa que pergunta
    metrics_focus: []    # Quais números olha primeiro
    red_flags: []        # O que rejeita imediatamente
    green_flags: []      # O que aprova imediatamente
    
  L4_decision_frameworks:
    primary: ""          # Framework principal de decisão
    secondary: []        # Frameworks complementares
    speed: ""            # Fast/Medium/Slow
    reversibility_bias: "" # Tende a decidir reversível ou irreversível
    
  L5_execution_patterns:
    speed: ""            # Velocidade de execução
    iteration_style: ""  # Build-measure-learn? Ship-fix-ship?
    communication: ""    # Direto? Empático? Brutal?
    delegation: ""       # Delega muito ou faz sozinho?
    
  L6_integration:
    primary_squads: []
    activation_command: ""
    weight_in_decisions: {}
    conflicts_with: []   # Clones que discordam frequentemente
```

---

## Mind Clone Registry

| # | Clone | Domínio | Status | Squads |
|---|-------|---------|--------|--------|
| 1 | Alex Hormozi | Ofertas, Scale, Revenue | ✅ Ativo | doombot, vendas |
| 2 | Thiago Finch | Revenue OS, Copy, AIOX | 🔜 Próximo | doombot, marketing |
| 3 | Robert Cialdini | Persuasão, Influência | 🔜 Planejado | doom-persuader |
| 4 | Naval Ravikant | Leverage, Strategy | 🔜 Planejado | decisões pessoais |
| 5 | Dan Kennedy | Direct Response Marketing | 🔜 Planejado | marketing, vendas |

---

## Como Usar Mind Clones

### Consulta individual
```
@clone-hormozi "Analise esta oferta para clínica de estética: 
limpeza de pele por R$89. Devo manter?"
```

### War Room (múltiplos clones)
```
@clone-hormozi @clone-finch @clone-cialdini
"War Room: Como vender programa de emagrecimento de R$3.000 
para lead frio que veio do Instagram?"
```

### Integração com Squad
Os clones funcionam como "consultores" dos agentes existentes. Quando @doom-offers constrói uma oferta, ele pode consultar @clone-hormozi para validação.

---

*A obsessão não é por copiar experts — é por ter o melhor conselho possível, 24/7, de graça.*
