---
description: SKORTEX Engine & Red Hat Infrastructure Synthesis
category: strategic
created_at: '2026-04-01T13:30:00.000Z'
tags: [skortex, skyros, red-hat, openshift, local-llm, qwen, architecture]
---

# SKORTEX: The Autonomous Terminal Operator

Este documento sintetiza a arquitetura definitiva estabelecida por Gabriel Ferreira (Voice of the Dragonborn) para a separação de responsabilidades do Sistema KAIROS e a adoção de inferência pesada via infraestrutura Red Hat.

## Nomenclatura e Separação de Concerns

1. **SKYROS (The Interface/Dashboard):**
   O Personal OS. A camada "frontend" e de gerenciamento humano. É onde o Obsidian (Anamnesis), os templates de RPG pareto e o acompanhamento de vida ocorrem. SKYROS *observa* e *direciona*.
2. **SKORTEX (The Operator Engine):**
   O motor CLI/Agentico em Node.js (ex-`skyros-agent`). É o "músculo e sistema nervoso periférico". Projetado para libertar o operador das dependências de plataformas engessadas (como o Antigravity). SKORTEX opera os terminais, manipula arquivos, roda sub-agentes isolados (Harness S04/S12) e orquestra a máquina local de forma autônoma.

## A Infraestrutura de Inferência: Red Hat Hive

A limitação de hardware local (GPU não-CUDA e pouca RAM) será contornada de forma agressiva utilizando os 7 trials empresariais da Red Hat recém ativados:

### Stack Red Hat
- **Red Hat AI Enterprise & Inference Server:** Backbone para hospedar modelos pesados fora da máquina local, mas ainda sob total controle de rede (Virtualization/Sandbox).
- **OpenShift AI:** Para orquestração, pipelines (MLOps) e gestão do ciclo de vida dos modelos.
- **Red Hat Sandbox & Virtualization:** Ambientes efêmeros e seguros para o SKORTEX despachar "Worktree Isolations" pesadas sem tocar no host físico principal.

### O Cérebro Uncensored (Qwen3.5 x Claude 4.6 Distilled)
O SKORTEX não dependerá de APIs comerciais limitadas (OpenAI/Anthropic oficiais). O motor conectará no Red Hat Inference consumindo modelos state-of-the-art destilados e heréticos:
1. `Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled`: O core logístico e lógico.
2. `Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive`: O executor para tarefas que exigem bypass de guardrails burocráticos e operações diretas de sistema de alto risco.
3. `Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking`: A entidade primária de raciocínio. "Opus 4.6" em raw power, servindo como o NOESIS isolado para planejamento profundo e predição.

## O Pipeline Desejado
1. **Ativação:** SKORTEX desperta via shell local.
2. **Contexto:** Extrai ordens do SKYROS (Triage/Dashboard).
3. **Roteamento:** O `ProviderRouter` não chama Gemini/Groq, conecta diretamente com o *Red Hat OpenShift Endpoint* autenticado.
4. **Execução:** O modelo *Deckard-Heretic* raciocina (S08 Background), gera as bash tools imperativas e o SKORTEX aplica localmente ou em sandboxes.
5. **Autonomia:** O operador deixa de ser um "prompt engineer" e se torna um Comandante que observa o painel SKYROS enquanto o SKORTEX devora as tarefas no terminal.
