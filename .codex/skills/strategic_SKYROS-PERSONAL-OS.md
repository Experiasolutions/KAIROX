---
title: SKYROS (Personal OS Framework)
type: strategic-reasoning-package
status: active
date: 2026-03-30
author: NOESIS
version: 1.0.0
---

# SKYROS: Personal Operating System

## 1. O Problema (A Perda de Controle)
O volume de informações, ferramentas, sprints corporativas (Experia), demandas freelance e vida pessoal ultrapassaram a capacidade de tracking linear ("to-do lists"). O resultado é a fadiga de decisão e a fragmentação do foco, resultando na sensação letárgica de "perda de controle".

## 2. A Solução (SKYROS + P2P Hivemind)
O SKYROS não é um software novo, é um **Framework Mental e Operacional** que roda por cima do KAIROS. Ele unifica o Notebook e o PC via "Syncthing P2P" transformando-os em Hemisférios do seu cérebro.

### Hemisfério Esquerdo (O PC Opus)
- **Função:** Deep Work, Engenharia, Experia Solutions.
- **Regra SKYROS:** Quando o Operador senta neste terminal, o Antigravity não pergunta "o que vamos fazer?". Ele aplica o protocolo de Foco Isolado, bloqueando abstrações e exigindo execução de Sprints P0.

### Hemisfério Direito (O Notebook Gemini)
- **Função:** Triage rápida, Planejamento Diário (Morning Brief), Email, Estudos, Controle de Vida.
- **Regra SKYROS:** Terminal de descompressão e organização. Todo o caos mental deve ser descarregado aqui via Áudio (Telegram local) ou Texto Rápido.

## 3. O Core do SKYROS (Módulos de Regresso ao Controle)

### 3.1. Módulo "Anamnesis" (Brain Dump Contínuo)
A regra de ouro do SKYROS é a **Lata de Lixo Mental**.
Você está proibido de tentar "lembrar" de processos. Qualquer pensamento, ideia incrível para a Experia, preocupação pessoal ou dor latente deve ser imediatamente despejada.
- **Vault Real:** `C:\Users\GABS\Documents\Haha²` (Obsidian)
- **Junction KAIROS:** `docs/anamnesis/` → Vault Haha² (leitura nativa pelo AIOX)
- **Ação:** Abrir o Obsidian no celular/notebook e jogar texto bruto. O NOESIS se encarrega de refatorar e triar essas memórias toda sexta-feira.
- **Git:** Apenas conteúdo `.md` é rastreado. Metadados `.obsidian/` e `.smart-env/` são ignorados.

### 3.2. Módulo "Triage Matinal" (Morning Briefing)
A primeira hora do dia define o controle. O terminal de borda (Notebook) rodará `@pm *status`.
- O AIOX varre o `roadmap.md` e os e-mails/Telegram não lidos.
- Apenas 1 (uma) task com Prioridade `P0 🔥` será exigida para a manhã. Todo o resto é ruído.

### 3.3. Módulo "Isolation Mode"
O Isolation Mode é ativado **internamente pelo orquestrador NOESIS** (via `/kairos`), sem necessidade de comando manual.
1. O NOESIS injeta a tag de bloqueio no `STATUS.md` automaticamente quando detecta Sprint P0 ativa.
2. O Sistema suspende o acesso ao RAG de clientes e foca exclusivamente na tarefa corrente.
3. A desativação também é automática ao concluir o ciclo de trabalho.

## 4. Orquestração Técnica (O Elixir)

O elo que faz tudo isso funcionar sem mensalidades de nuvem (Dropbox/Google Drive) é a arquitetura **Syncthing P2P**:
1. O Operador instala o Syncthing nos 2 terminais.
2. Compartilha silenciosamente a pasta local `C:\Users\GABS\.gemini\antigravity\brain`.
3. Ambos os terminais escrevem e leem do mesmo banco de dados simultaneamente (Eventos em tempo real P2P).
4. Uma ideia gerada na cama com o notebook é automaticamente carregada na tela do PC quando o Operador acorda e liga a máquina principal.

---
> "Não se trata de gerenciar o tempo, mas de externalizar a memória e delegar a execução ao sistema." — SKYROS Foundation.
