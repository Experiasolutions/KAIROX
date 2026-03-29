---
task: arenaTournament()
responsavel: "@aios-master"
responsavel_type: Agent
atomic_layer: Task
Entrada:
  - campo: variantes
    tipo: list
    origem: any agent
    obrigatorio: true
    minimo: 3
Saida:
  - campo: vencedor
    tipo: document
    destino: requesting agent
  - campo: ranking
    tipo: document
    destino: requesting agent
Checklist:
  - "[ ] Mínimo 3 variantes recebidas"
  - "[ ] Tournament executado (bandit bayesiano)"
  - "[ ] Vencedor identificado"
  - "[ ] Derrotados killed ou documentados"
---
# Task: Arena Tournament (Universal)

> **Disponível para:** QUALQUER agent no AIOS

## Input
- [ ] Lista de variantes para competição (mínimo 3)
- [ ] Critério de avaliação (conversão, CTR, margem, etc.)

## Processo
1. [ ] **Setup:** Registrar variantes na Arena
2. [ ] **Tournament:** Avaliação pairwise com Thompson Sampling
3. [ ] **Score:** Calcular score por variante
4. [ ] **Kill rule:** Aplicar kill em derrotadas consecutivas
5. [ ] **Vencedor:** Identificar e documentar vencedor + justificativa

## Mecânica
- **DSL genética:** Crossover e mutação de componentes
- **Otimizador:** Thompson Sampling bayesiano
- **Kill rule:** N derrotas consecutivas → kill automático
- **Cache:** Vencedores por segmento e contexto

## Output
- Vencedor com score e justificativa
- Ranking completo
- Kills documentados com lessons learned
