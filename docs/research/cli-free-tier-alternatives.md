# Alternativas CLI Free-Tier / Open Source para AIOX

Baseado nas diretrizes do projeto e nas restrições de orçamento (limitação para uso de APIs pagas como no Claude Code CLI), este documento explora as melhores alternativas gratuitas e open-source para rodar os agentes AIOX localmente ou utilizando free tiers generosos.

## 1. O Problema Atual
O **Claude Code CLI** exige consumo de API paga (Anthropic). O **Antigravity** tem algumas limitações de integração local profunda em workflows CLI pesados.

Para manter o ecossistema AIOX funcionando sem custos de API, precisamos de um "Agent Runner" CLI que suporte:
1. Execução de comandos bash nativa.
2. Leitura/escrita e manipulação de múltiplos arquivos.
3. Conexão com LLMs gratuitos (Gemini) ou rodando localmente (Ollama).

## 2. As Melhores Alternativas CLI Open-Source

### 2.1 Aider (Altamente Recomendado)
O [Aider](https://aider.chat/) é a ferramenta CLI open-source mais madura, é Git-native e extremamente flexível com modelos.

*   **Vantagem principal:** Suporte nativo ao Google Gemini Free Tier, Groq e ao Ollama.
*   **Como usar com Gemini (Free Tier):**
    A API do Gemini 2.5 Flash / Pro (via Google AI Studio) possui um excelente tier gratuito.
    ```powershell
    # Windows PowerShell
    $env:GEMINI_API_KEY="sua_chave_free"
    aider --model gemini/gemini-2.5-pro
    ```
*   **Como usar com Ollama (Totalmente Local/Grátis):**
    Utiliza poder computacional da sua máquina sem envio de dados.
    ```bash
    OLLAMA_API_BASE=http://127.0.0.1:11434 aider --model ollama/qwen2.5-coder:7b
    ```

### 2.2 Cline / Roo Code (Extension-based)
Uma extensão de VSCode (ex-Roo Cline) que opera abrindo um terminal de agente direto na IDE.
*   **Vantagem:** Permite apontar a API para o Gemini (Studio), Ollama ou Groq. Oferece aprovação visual de cada modificação/comando bash, sendo mais amigável que um CLI puro, mas mantendo a interface CLI integrada.

## 3. Provedores "Free-Tier" Estratégicos

Se a máquina local não tiver hardware para rodar Ollama bem, a estratégia é usar:

1.  **Google AI Studio (Gemini 2.5 Pro / Flash):**
    *   **Contexto:** Até 2 Milhões de tokens.
    *   **Custo:** Gratuito (mas a Google pode usar os inputs do Free Tier para treinamento).
    *   **Limites:** Até 15 RPM. Ótimo para manter o `STATUS.md` e o `SELF_CONTEXT.md` em memória.

2.  **Groq API:**
    *   **Modelos:** Llama 3, DeepSeek, Qwen.
    *   **Vantagem:** Inferência ultra-rápida. Free tier bom para refatorações ou criações isoladas de componentes.

## 4. O Fluxo AIOX Adaptado (Free CLI)

Para contornar a limitação de orçamento, o ecossistema AIOX operará assim no PC Principal (ou via notebook no sprint final):

### A. Preparação da Ferramenta
1. Instalar Python.
2. Instalar Aider: `pip install aider-chat`.

### B. Inicializando a Sessão de Agente (Triage AIOX)
Use o Aider para carregar a Triage Engine e os status:
```powershell
$env:GEMINI_API_KEY="sua-chave-api-studio"
aider --model gemini/gemini-2.5-pro --file STATUS.md SELF_CONTEXT.md .aiox-core/rules.md
```

### C. Invocação de Personas (Agentes)
Em vez de comandos slash nativos do framework pago (`/qa`), você instrui o CLI apontando os arquivos de agentes:
```text
> Atue como o /architect. Leia os requisitos em .aiox-core/development/agents/architect.md. Planeje a solução para a Epic atual.
```

## 5. Resumo da Ação Em 24h (Devolução do Notebook)

1.  **Handoff de 1-Clique:** Você pode usar o script `.\scripts\quick-handoff.ps1` que criei para subir KAIROS e Apex-Conductor em 3 segundos pro GitHub antes de desligar o notebook.
2.  **Novo Ambiente Híbrido:**
    *   **Motor Principal (CLI):** Usa Aider + Gemini API (Grátis) para escrever código, debugar bash e commitar.
    *   **Assistente / Co-Pilot Visual:** Usa Antigravity/Gemini (aqui) para pensar as histórias, gerenciar arquitetura, ver logs e revisar grandes pedaços de código.
