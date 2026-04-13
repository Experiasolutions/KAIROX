╔══════════════════════════════════════════════════════════════════════════╗
║ REASONING PACKAGE                                                        ║
║ ID: RP-GABRIEL-OS-GAMIFICATION-AUDIT                                     ║
║ Versão: 1.0                                                              ║
║ Data: 2026-04-11                                                         ║
║ Mindclones consultados: Hormozi, Naval, Brunson, Finch                   ║
║ Objetivo: Auditoria completa das mecânicas viciantes Tencent             ║
║           aplicadas ao Gabriel OS como sistema de vida gamificado        ║
╚══════════════════════════════════════════════════════════════════════════╝

---

## CONTEXTO

A Tencent (COD Mobile, PUBG Mobile, Honor of Kings) é a maior empresa de
games do mundo. Seus sistemas de engajamento são estudados pela psicologia
comportamental como os mais eficazes em criar hábito e retenção.

O Gabriel OS usa as mesmas mecânicas — mas a serviço de objetivos reais:
construir a Experia, quitar dívidas, desenvolver habilidades genuínas.

**Diferença crítica:** em games da Tencent, o loop vicia para consumir.
No Gabriel OS, o loop vicia para CRIAR e EXECUTAR.

---

## AUDITORIA — MECÂNICAS TENCENT → GABRIEL OS

### 1. VARIABLE REWARD (Recompensa Variável)

**Tencent:** Caixas de loot com drop rate variável. O cérebro não sabe o que vem.
Isso é a máquina caça-níquel aplicada aos games.

**Gabriel OS v4.1:**
- Missões com bônus de XP randômico (+0% a +50% em dias de alta performance)
- "Bônus de Primeiro RAID" — primeira missão 🔵 do dia = 2x GEMS (variável por dia da semana)
- Streak Shields têm probabilidade de dar 1 escudo extra em dias especiais
- (Implementar como easter eggs nos blocos do Santuário)

**Hormozi says:** "A variability creates anticipation. Anticipation precedes action."

---

### 2. LOSS AVERSION — STREAK PROTECTION

**Tencent:** Streak de vitórias com símbolo visual. Perder o streak dói mais
do que o prazer de ganhar. COD Mobile usa "First Win of the Day" para
criar hábito de logar diariamente.

**Gabriel OS v4.1:**
- Streak visual na Header (já implementado) + Flame icon pulsante
- Streak Shield: 1 disponível por semana → "usar ou perder"
- Notificação: "Seu streak de X dias está em risco" (futuro: Telegram bot)
- Breaking the streak NAO pune o progresso permanente (conquistas ficam)
- Psicologia: o Streak Shield cria RECIPROCIDADE — o sistema "salvou" o jogador

---

### 3. SEASONAL PASS (Battle Pass / Temporadas)

**Tencent:** Battle Pass com mapa visual de recompensas. Você vê EXATAMENTE
o que vai ganhar se continuar. Prazo fixo cria urgência.

**Gabriel OS v4.1:**
- Temporadas de 90 dias (T1, T2, T3) com Boss final
- Roadmap visual da Experia Empire (já implementado no Dashboard)
- Cada Temporada tem recompensas declaradas no início
- T1 FUNDAÇÃO: Boss = Primeiro Contrato Pago
  T2 ASCENSÃO: Boss = Master Pumps R$10K
  T3 EXPANSÃO: Boss = Primeiro cliente outreach remoto
- "Dia X/90" visível na Header cria urgência real

---

### 4. COMPLETION PULL (78% = precisa completar)

**Tencent:** Barra de progresso sempre mostrando quanto falta, não quanto
foi feito. O cérebro humano precisa fechar loops abertos (Efeito Zeigarnik).

**Gabriel OS v4.1:**
- Progresso de XP na Header: "78/100 → Nível X+1" (sempre visível)
- Quest Panel: "Você completou 3/5 missões do dia" — a barra quase cheia chama
- Questlines expandidas mostram "[X] etapas faltando para o reward"
- O Design intencional: barra QUASE CHEIA, não pequena

**Naval says:** "The brain is a completion machine. Use it."

---

### 5. ATTRIBUTE POINTS (Alocação de Poder)

**Tencent (e RPGs clássicos):** Level up → pontos para alocar → o jogador
sente que tem poder de escolha. Isso aumenta o engagement porque a build
é PESSOAL — é sua.

**Gabriel OS v4.1 — Skill Tree completa:**
- 1 ponto de atributo por level-up (a cada 100 XP)
- 7 skills: Voz, Arquitetura, Agentificação, Vendas, Execução, Hipnose, Crescimento
- Desbloqueios tangíveis por nível (não só +5% abstrato)
  Ex: Voz Nível 1 = narrar demos da Experia | Nível 5 = The Way of the Voice
- Skills com pré-requisitos criam expectativa de longo prazo
- "Disponível: 0 pontos → Complete missões para ganhar XP → Level up → Aloque"
- CHAVE: os desbloqueios são COISAS REAIS que Gabriel vai fazer

---

### 6. MASTERY CURVE (Curva de Maestria)

**Tencent:** "First Win of the Day" dá 2x XP. Cria hábito de login diário
com recompensa imediata. Depois: desafios progressivamente mais difíceis
para manter o engagement sem frustrar.

**Gabriel OS v4.1:**
- Primeiro missão 🔵 concluída no dia = 2x GEMS (implementar)
- Missões diárias: escalam em complexidade ao longo das temporadas
- T1: Ritual simples + 1 missão Experia
  T2: Ritual + 2 missões Experia + 1 de vendas
  T3: Ritual + Pareto Score tracking + Sistema completo
- KAIROS gera missões progressivamente mais desafiadoras

---

### 7. SOCIAL PROOF — CONQUISTAS PERMANENTES

**Tencent:** Troféus, medalhas, skins únicas que ficam permanentemente.
Mostram "quem você é" mesmo que você pare de jogar por semanas.

**Gabriel OS v4.1:**
- Conquistas NUNCA se perdem (mesmo se o streak quebrar)
- Marcos permanentes visíveis no perfil:
  MARCO-F1: Primeiro R$100 faturado
  MARCO-G2: 60 dias consecutivos de rotina
  MARCO-C1: Serasa zerado
- Sistema de conquistas futuro: emblemas no Dashboard

---

### 8. NEAR MISS (Quase acertei!)

**Tencent:** Mostra quando você está "perto" de algo. Alerta a 80%, 90%, 95%.
Isso ativa o dopamine reward prediction error.

**Gabriel OS v4.1:**
- XP bar visível sempre com quanto falta → "Faltam 12 XP para Nível 3"
- Quest Panel: "Falta 1 missão para completar o dia"
- Questline: "[X etapas] para o Boss final desta questline"
- Streak: "X dias — amanhã você atinge os 14 dias!"

---

### 9. DAILY LOGIN BONUS (Sequência crescente)

**Tencent:** Login no Dia 1 = 10 moedas, Dia 7 = 100, Dia 14 = 500.
Cria hábito com recompensa crescente por consistência.

**Gabriel OS v4.1 (proposta futura — KAIROS):**
- RITUAL completo por 7 dias = Streak Shield bônus
- RITUAL completo por 14 dias = desbloqueio de Loot Tier 1
- RITUAL completo por 30 dias = conquista permanente MARCO-G1
- Dia 7/14/30/60/90 = marcos visuais no roadmap da temporada

---

### 10. NARRATIVE INVESTMENT (Lore e Identidade)

**Tencent:** Personagens com história, cutscenes, backstory que faz o jogador
se importar. Você não está "jogando" — você está "sendo" o personagem.

**Gabriel OS v4.1:**
- Arquétipo Dragonborn (Voice of the Dragonborn) — identidade visual e narrativa
- Questlines têm LORE (não só título + checklist)
- Bosses têm nome, descrição, lore ("O Golem do IPTU cresceu silencioso...")
- O Dashboard é "a tela do personagem" — você não vê um app, vê sua própria OS
- Brunson: "People don't buy products. They buy the story they tell about themselves."

---

## ELEMENTOS AINDA NÃO IMPLEMENTADOS (Backlog v4.2)

```
□ Variable XP bônus — missão 🔵 concluída = 100-150% randômico
□ Conquistas visuais permanentes no Dashboard
□ Streak Shield visual + contador de disponibilidade
□ "First RAID of the Day" — 2x GEMS na primeira missão 🔵
□ Near-miss alerts — "Faltam X XP para Level X+1" calculado dinamicamente
□ Day 7/14/30 milestone visual no roadmap da temporada
□ KAIROS morning brief integrado (Telegram → Dashboard sync)
□ Pareto Score trackado por dia (% tempo em 🔵)
```

---

## SÍNTESE — REGRA DE OURO DO GABRIEL OS

```
Hormozi: "Make progress visible even on bad days."
Naval:   "Skill unlocks must reflect real leverage, not fake numbers."
Brunson: "Every element must tell a story. You are the hero."
Finch:   "The system must be simpler than the resistance to using it."

REGRA GABRIEL OS:
Qualquer dia que Gabriel abrir o dashboard e completar UMA coisa,
ele deve sentir que PROGREDIU.

O Ritual mínimo (5 tasks simples = 35 XP) garante isso.
Mesmo no pior dia, a barra se move.
```

---

*ID:* RP-GABRIEL-OS-GAMIFICATION-AUDIT
*Versão:* 1.0
*Data:* 2026-04-11
*Mindclones:* Hormozi (retention hooks), Naval (leverage + skill design),
              Brunson (narrative + identity), Finch (system simplicity)
*Referências:* COD Mobile, PUBG Mobile, Honor of Kings, Diablo, Path of Exile
*Próxima revisão:* Implementar backlog v4.2 após PRD Experia concluído
