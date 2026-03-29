# Monetization KPIs — Canonical Reference

> **Origem:** DooMMasteRBot V5 Fusion → AIOS Core
> **Versão:** 1.0.0
> **Última atualização:** 2026-02-13

## Propósito

Referência canônica de KPIs de monetização disponível para qualquer squad.
Qualquer operação de revenue DEVE medir e reportar estes KPIs.

---

## KPIs Primários (Obrigatórios)

| # | KPI | Sigla | Descrição | Target Padrão | Frequência |
|---|-----|-------|-----------|---------------|------------|
| 1 | Tempo até 1ª Cobrança | T1C | Do 1º contato ao 1º pagamento | ≤ 7 dias | Por deal |
| 2 | Taxa de Aceite | TA | % aceite na 1ª proposta | ≥ 30% | Semanal |
| 3 | Margem | MM | Margem sob risco controlado | ≥ 20% | Por operação |
| 4 | CAC | CAC | Custo de Aquisição | Decrescente | Mensal |
| 5 | LTV | LTV | Lifetime Value por coorte | Crescente | Mensal |
| 6 | Payback | PB | Tempo de retorno do investimento | ≤ SLO | Por campanha |

## KPIs Secundários (Recomendados)

| # | KPI | Sigla | Descrição | Frequência |
|---|-----|-------|-----------|------------|
| 7 | Uplift por Criativo | UC | Uplift médio por arquétipo de copy | Por criativo |
| 8 | % Handoff Humano | HH | Em dor aguda, % que handoff real | Semanal |
| 9 | Churn Rate | CR | Taxa de cancelamento por coorte | Mensal |
| 10 | NPS / CSAT | NPS | Satisfação pós-atendimento | Mensal |
| 11 | EPM Score | EPM | Experience Profit Multiplier | Contínuo |
| 12 | Arena Win Rate | AWR | % de vitórias em Arena tests | Por tournament |

## Fórmulas

### Juiz de Caixa
```
Score = P(aceite) × margem × payback_inverso
```

### Unit Economics
```
LTV:CAC ratio = LTV / CAC  (target ≥ 3:1)
Payback = CAC / (receita_mensal × margem)
```

### Profit Firewall Threshold
```
margem_esperada >= config.revenueOps.profitFirewall.brownoutThreshold
```

## Como usar

Qualquer task ou agent pode referenciar estes KPIs:
```yaml
dependencies:
  core_data:
    - monetization-kpis.md
```

Os KPIs devem ser reportados pelo agent responsável ao final de cada operation cycle.
