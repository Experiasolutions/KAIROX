---
description: SKYROS Agent Architecture Standard - The 12 Progressive Harness Mechanisms based on lean-coding-agent.
category: core
created_at: '2026-04-01T13:20:00.000Z'
tags: [architecture, skyros, agent-loop, harness, claude-code-patterns]
---

# SKYROS Architecture Gold: The Progressive Harness

Este documento internaliza o "ouro" extraído da arquitetura do `claude-code` (via repo de pesquisa `lean-coding-agent`) e define o padrão oficial para o runtime do **SKYROS (Personal OS / AIOS)**.

A fundação do SKYROS não é um prompt gigante bloqueante, mas sim um loop mínimo de query envolto por um "production-grade harness" progressivo.

## The Core Agent Loop (A Batalha Inicial)
No coração do SKYROS está o **The Core Loop**:
1. Lê inputs do usuário.
2. Anexa ao array de mensagens (History).
3. Chama a API do LLM (streaming).
4. Avalia `stop_reason == "tool_use"`.
5. Executa paralelamente as ferramentas permitidas.
6. Anexa `tool_result` e volta para o passo 3.

*A magia não está no loop, está no "Harness" (arreio/armadura) envolta dele.*

## The 12 Progressive Harness Mechanisms (Padrão SKYROS)

A evolução do motor SKYROS obedecerá as seguintes camadas arquiteturais progressivas:

### S01. The Loop ("One loop & Bash is all you need")
A base de tudo. O arquivo de entrada principal processa a chamada de API e a lógica base de parada.

### S02. Tool Dispatch ("Adicionar ferramenta = Adicionar um handler")
Registrar ferramentas puras no `ToolRegistry`. O loop não deve ser reescrito ao adicionar ferramentas novas. A classe BaseTool precisa prover os metadados dinamicamente para a runtime.

### S03. Planning ("Um agente sem plano deriva")
Incorporação de ferramentas explícitas de planejamento (`EnterPlanModeTool`, `TodoWriteTool`). O fluxo da Triage Matinal do SKYROS opera diretamente na formatação do plano em JSON/TXT, quebrando a tarefa antes de iterar e focar.

### S04. Sub-Agents ("Quebrar grandes tarefas; limpar contexto")
A capacidade de fazer HAT-SWITCHING (@dev, @architect) de maneira real: spawn de sub-processos (via Node.js `fork`) ou instâncias isoladas do motor onde o array `messages[]` começa limpo. Compartilha-se apenas a memória persistente (cache), mas a poluição do chat local fica retida no filho. **Critical para o limite de tokens.**

### S05. Knowledge on Demand ("Carregar apenas quando precisar")
Não inflar o _System Prompt_ primário com manuais da AIOX. O SKYROS lê os RPs (`Reasoning Packages`), `SKILL.md` ou `framework agents` dinamicamente quando recebe um comando (`SkillTool`) ou precisa resolver um domínio específico.

### S06. Context Compression ("Abra espaço no contexto")
O Sistema de Memória do SKYROS (`src/memory/context-compactor.js`):
1. **autoCompact:** O sistema invoca internamente o LLM secundário (groq `llama-3.1-8b`) para resumir mensagens antigas e inserir no array gerencial.
2. **snipCompact:** Apagar mensagens erradas e ferramentas corrompidas, limpando o lixo.
3. **contextCollapse:** Colapsar mensagens curtas do usuário em uma única intencionalidade.

### S07. Persistent Tasks ("Objetivos -> Tarefas -> Disco")
O histórico do agente não perde o estado atual. Gravação dos arrays de conversação (via logs em JSONL, sem usar SQLite para manter `lean`). Retoma o trabalho exatamente no passo que travou, tolerante à falhas. (Implementado via `session-store.js`).

### S08. Background Tasks ("Pensamento Contínuo")
Jobs de linting, testes end-to-end ou builds grandes rodam como processos desanexados (Daemon threads). O SKYROS não espera travado. Quando acabar, o `LocalShellTask` emite sinal (`SIGUSR` ou EventEmitter interno), o sistema acorda e reporta no terminal. (Vide: `night-shift-automator.js`).

### S09. Agent Teams ("Delegar para Companheiros de Equipe")
Workflows coordenados em cross-terminal. N8N (Hydra-Head) passa as requests para Node local, e Node local dispara processo filho e devolvem um sumário síncrono.

### S10. Team Protocols ("Regras Compartilhadas de Comunicação")
Toda transferência de contexto entre agente Tático A e Agente Auditor B ocorre via Message Protocols rígidos. Envia-se Markdown + Status do Repositório (gitStatus). Não pode faltar metadados.

### S11. Autonomous Agents ("Self-Claim de Tarefas")
O `IA Council` ou Modo `YOLO` permite varrer o Kanban interno (STATUS.md) passivamente em Background e pegar as "P0", processando-as de modo invisível no sistema. Ao levantar o editor, a pull request está pronta.

### S12. Worktree Isolation ("Separation of Concerns Absoluto")
Para grandes mudanças de framework, o SKYROS Agent aciona o `git worktree add`, clona temporariamente um diretório branch no `c:/Temp/skyros-worktree-X/`, faz todas as besteiras, compila, testa (sem poluir o CWD atual do humano). Se passar, faz merge; caso contrário, joga o worktree fora sem impacto no editor ativo do usuário.

## Conclusões Direcionais para o Projeto Atual
O CLI Base que foi feito (`skyros-agent`) possui até a camada **S02** sólida e arranhões na **S05** e **S07**.
As camadas de **S04**, **S06** (Compaction Crítico) e **S12** (Worktree Isolation) precisam ser as primeiras a serem embutidas na refatoração principal do Core AIOX do KAIROS.
