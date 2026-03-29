---
task: revenueGate()
responsavel: "@aios-master"
responsavel_type: Agent
atomic_layer: Task
Entrada:
  - campo: operacao
    tipo: document
    origem: any agent
    obrigatorio: true
Saida:
  - campo: go_nogo
    tipo: boolean
    destino: requesting agent
  - campo: profit_check
    tipo: document
    destino: requesting agent
Checklist:
  - "[ ] Operação recebida para avaliação"
  - "[ ] Auto-P&L calculado ou projetado"
  - "[ ] Profit Firewall checado"
  - "[ ] Decisão GO/NO-GO emitida"
---
# Task: Revenue Gate (Universal)

> **Princípio constitucional:** VII. Revenue-First (MUST)
> **Disponível para:** QUALQUER agent no AIOS

## Input
- [ ] Operação para avaliação (campanha, oferta, feature)

## Processo
1. [ ] **Auto-P&L:** Calcular ou projetar P&L da operação
2. [ ] **Juiz de Caixa:** `P(aceite) × margem × payback`
3. [ ] **Profit Firewall:** Verificar se margem ≥ threshold
4. [ ] **Emitir decisão:**
   - Margem ≥ threshold → **GO** ✅
   - Margem < threshold → **NO-GO** 🚫 (brownout)
   - Dados insuficientes → **CONDICIONAL** ⚠️ (liberar com monitoring)

## Output
- GO/NO-GO com justificativa
- Auto-P&L da operação
- Ações recomendadas (se NO-GO)
