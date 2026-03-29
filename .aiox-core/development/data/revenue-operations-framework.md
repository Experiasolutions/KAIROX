# Revenue Operations Framework

> **Origem:** DooMMasteRBot V5 Fusion → AIOS Core
> **Versão:** 1.0.0
> **Última atualização:** 2026-02-13

## Propósito

Framework de Revenue Operations disponível para QUALQUER agent e squad no AIOS.
Define os sistemas, métricas e gates necessários para avaliar e otimizar outputs
por impacto financeiro real.

---

## 1. Núcleo de Monetização Imediata (NMI)

### Conceito
Motor de geração de ofertas acionáveis em tempo recorde.

### 7 Etapas
1. **Nicho** — Validar micro-nicho com capacidade de pagamento
2. **Dor** — Quantificar urgência × disposição a pagar × tamanho
3. **Gancho** — Conectar dor → solução em 1 frase
4. **Mecanismo** — "Como funciona" em 3 passos
5. **Prova** — Social proof + cases + resultados mensuráveis
6. **Oferta** — Compilar preço + bônus + garantia + prazo
7. **CTA** — Ação clara + deadline + custo da inação

### SLAs
| Fase | Tempo |
|------|-------|
| Draft | ≤ 60 segundos |
| Final | ≤ 10 minutos |
| Assets completos | ≤ 2 horas |

---

## 2. Juiz de Caixa

### Conceito
Avaliador de outputs por probabilidade de gerar caixa.

### Fórmula
```
Score = P(aceite) × margem × payback
```

### Método
- Pairwise-preference com Assinatura Decisional
- Judge-of-judges para reduzir viés
- Cache de vencedores por segmento

### Uso
Qualquer agent pode invocar o Juiz de Caixa para comparar alternativas.

---

## 3. Arena de Ofertas / Headlines

### Conceito
Tournament sandbox para testar variantes de ofertas e copy.

### Mecânica
- **DSL genética:** Crossover e mutação de componentes
- **Otimizador:** Thompson Sampling bayesiano
- **Kill rule:** N derrotas consecutivas → kill/rewrite automático
- **Mínimo:** 3 variantes por tournament
- **Tempo de vida:** 12-48h por variante

---

## 4. Profit Firewall

### Conceito
Gatilho automático quando métricas financeiras cruzam thresholds.

### Triggers
- Margem esperada < threshold configurado
- Payback > teto configurado
- CAC > LTV projetado

### Ações
- **Brownout:** Reduzir ou desativar campanha/feature
- **Alert:** Notificar doom-master ou responsável
- **Escalate:** Se persistir, escalar para humano

---

## 5. Cérebro de Cobrança (Critic-Gate)

### Pipeline
```
Planner → Solver → Crítico
```

### Rubricas do Crítico
| # | Rubrica | Descrição | Min Score |
|---|---------|-----------|-----------|
| 1 | Clareza | Sem ambiguidade, entendido em 3s | 8 |
| 2 | Promessa | Específica, crível, mensurável | 8 |
| 3 | Prova | Evidência que suporta | 8 |
| 4 | Preço | Justificado e ancorado | 8 |
| 5 | Prazo | Urgência real | 8 |
| 6 | CTA | Claro e acionável | 8 |
| 7 | Objeções | Antecipadas e tratadas | 8 |

### Regras
- Score < 8 em qualquer rubrica → rewrite automático
- Max 3 loops de rewrite
- Após 3 loops sem atingir SLO → escalate para humano

---

## 6. OPD++ (Orquestrador de Persona por Dor)

### Conceito
State machine que adapta tom e fricção por dor/urgência do interlocutor.

### Estados
| Estado | Quando | Tom |
|--------|--------|-----|
| Professoral | Dor baixa, curiosidade | Educativo, calmo |
| Clínico | Dor média, racional | Preciso, factual |
| Executivo | Dor alta, tem budget | Direto, ROI-focused |
| Agressivo | Dor aguda, urgente | Implacável, confrontativo |

### Regra de Ouro
Se dor "aguda" + sem fechamento → **handoff humano obrigatório**
(roteiro + ângulo de urgência providenciados)

---

## 7. KPIs Canônicos

| KPI | Sigla | Descrição | Target Padrão |
|-----|-------|-----------|---------------|
| Tempo até 1ª Cobrança | T1C | Do 1º contato ao 1º pagamento | ≤ 7 dias |
| Taxa de Aceite | TA | % de aceite na 1ª proposta | ≥ 30% |
| Margem | MM | Margem sob risco controlado | ≥ 20% |
| Uplift por Criativo | UC | Uplift médio por arquétipo | Positivo |
| % Handoff Humano | HH | Em dor aguda, % handoff real | 100% |
| CAC | CAC | Custo de Aquisição por segmento | Decrescente |
| LTV | LTV | Lifetime Value por coorte | Crescente |
| Payback | PB | Tempo de retorno do investimento | ≤ SLO |

---

## Como usar em qualquer squad

```yaml
# Em qualquer task file
dependencies:
  core_frameworks:
    - revenue-operations-framework.md
```

Qualquer agent pode referenciar este framework para aplicar NMI, Juiz de Caixa,
Arena, Profit Firewall, Critic-Gate, ou OPD++ em seus outputs.
