---
task: criticGate()
responsavel: "@aios-master"
responsavel_type: Agent
atomic_layer: Task
Entrada:
  - campo: output
    tipo: document
    origem: any agent
    obrigatorio: true
  - campo: tipo
    tipo: text
    origem: auto-detect
    obrigatorio: true
Saida:
  - campo: score
    tipo: number
    destino: requesting agent
  - campo: aprovado
    tipo: boolean
    destino: requesting agent
  - campo: feedback
    tipo: document
    destino: requesting agent
Checklist:
  - "[ ] Output recebido com tipo identificado"
  - "[ ] Pipeline Planner→Solver→Crítico executado"
  - "[ ] 7 rubricas avaliadas"
  - "[ ] Score global calculado"
  - "[ ] Decisão: APROVADO / REWRITE / ESCALATE"
---
# Task: Critic-Gate (Universal)

> **Princípio constitucional:** IX. Critic-Gate (MUST)
> **Disponível para:** QUALQUER agent no AIOS

## Input
- [ ] Output de alta aposta de qualquer agent
- [ ] Tipo do output (auto-detectado)

## Pipeline — Planner → Solver → Crítico

### 1. Planner
Analisar o output e definir:
- Tipo do entregável
- Critérios de sucesso
- Rubricas aplicáveis

### 2. Solver
Avaliar execução contra critérios:
- Completude
- Coerência
- Alinhamento com objetivo

### 3. Crítico — 7 Rubricas (Score 0-10)
| # | Rubrica | Descrição | Min Score |
|---|---------|-----------|-----------|
| 1 | Clareza | Sem ambiguidade | 8 |
| 2 | Promessa | Específica e crível | 8 |
| 3 | Prova | Evidência concreta | 8 |
| 4 | Preço | Justificado e ancorado | 8 |
| 5 | Prazo | Urgência real | 8 |
| 6 | CTA | Claro e acionável | 8 |
| 7 | Objeções | Antecipadas e tratadas | 8 |

> **Nota:** Nem todas as rubricas se aplicam a todos os tipos de output.
> O Planner define quais rubricas são relevantes por tipo.

## Decisão
- **Score ≥ 8 em todas as rubricas aplicáveis** → APROVADO ✅
- **Score < 8 em qualquer rubrica** → REWRITE 🔄 (feedback específico)
- **3 loops sem atingir SLO** → ESCALATE ⚠️ (humano decide)

## Output
- Score por rubrica
- Score global
- Decisão + feedback detalhado
