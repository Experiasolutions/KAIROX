╔══════════════════════════════════════════════════════════════════════════╗
║                    REASONING PACKAGE                                     ║
║  ID: RP-20260227-MEGABRAIN-JARVIS-PIPELINE                               ║
║  Versão: 1.0-HARVEST — Target Architecture Defined                       ║
║  Natureza: ANÁLISE ARQUITETURAL + MAPEAMENTO TOPOLÓGICO                  ║
║  Input: 20 prints da Live Mega Brain (Thiago Finch) + Transcrição 6h     ║
║  Objetivo: Mapear e internalizar o "Projeto Híbrido Jarvis" no KAIROS    ║
╚══════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PREMISSA FUNDAMENTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A live revelou que a "Mente do Finch" opera em um sistema chamado **Projeto Híbrido Jarvis** (construído no HappyBack).
O problema central que ele resolve é perfeitamente alinhado à missão do KAIROS:
> Como fazer um agente de IA lembrar, entender e sintetizar
> conversas, reuniões e interações de forma inteligente e pesquisável?

A solução deles é um **Pipeline Dinâmico de 3 Prompts** que ingere dados brutos e os transforma em narrativas estratégicas (agrupadas por Pessoa e Tema).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📡 A ARQUITETURA MEGA BRAIN (O PIPELINE DE 3 CAMADAS)

O fluxo de processamento de memórias ocorre da seguinte forma:

1. **INPUT BRUTO:** O sistema suga conversas de WhatsApp, Slack, Calls e Aulas. Tudo entra como texto bruto.
2. **AUTOMAÇÃO & DIARIZATION:** Identifica quem falou o quê.
3. **[PROMPT 1.1] VECTOR MEMORY INDEX & ENTITY RESOLUTION:**
   - Corta as falas em "Chunks" semânticos.
   - Aplica Fuzzy Matching para unificar nomes (ex: "Camosi" = "Claudio Camozzi").
   - Associa cada chunk simultaneamente a Pessoas e Temas encontrados.
4. **[PROMPT 2.1] CONTEXTUAL INSIGHT EXTRACTION:**
   - Varre os chunks do banco de dados.
   - Escreve um *Insight Específico* e atribui uma prioridade (high, medium, low).
   - Saída estruturada em JSON separando Insights de Pessoas e Insights de Temas.
5. **[PROMPT 3.1] STRATEGIC NARRATIVE SYNTHESIS:**
   - Agrupa os insights validados e escreve ou atualiza uma narrativa coerente.
   - Tem a inteligência de atualizar uma biografia/narrativa progressivamente sem reescrever o passado (seta pontilhada).

---

## 🔬 ANÁLISE DELTA (MegaBrain Jarvis vs KAIROS Engine)

Ao analisar a estrutura revelada, encontramos lacunas críticas que precisamos codificar no motor KAIROS para alcançar a mesma excelência de autonomia.

| Funcionalidade MegaBrain            | Equivalente Atual no KAIROS                                                                | Delta a Desenvolver                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Chunking Automático                 | Nós criamos o Extrator de Live que corta áudio de 10 min. Mas o texto final ainda é longo. | Precisamos de um cortador semântico de transcrições antes de ir pro RAG.                   |
| Entity Resolution (Canonicalização) | O KAIROS gera o Contexto, mas se alguém digitar "Gabriel" ou "GB", ele abre duas portas.   | Criar um `entity_normalizer.js` (Prompt 1.1) para unificar aliases em Knowledge Entities.  |
| Insight Extraction JSON             | O `noesis-pipeline.js` extrai traces para destilação.                                      | Criar um pipeline focado em resumir o que cada "Pessoa" fez.                               |
| Strategic Narrative Synthesis       | Parcialmente funcional pelo `learning-model.json`.                                         | Criar o "Organograma Vivo": perfis de cada membro da equipe mantidos pela IA (Prompt 3.1). |

---

## 🛠 PONTOS DE INTEGRAÇÃO NO KAIROS V8 (AÇÃO)

Para absorvermos os 30% que faltavam do MegaBrain, precisamos erguer a arquitetura do Jarvis Híbrido aqui dentro:

1. **Implementar o Pipeline de 3 Camadas:** Criar um script `scripts/evolution/jarvis-pipeline.js` que executa as 3 etapas de prompts sequenciais (Index → Insight → Narrative) em cima dos arquivos de transcrição (`transcript_full.txt` e logs do Telegram).
2. **Registro de Entidades (Entity Registry):** Criar a fundação da Canonicalização. Um dicionário ativo onde o motor consolida nomes de Pessoas e Projetos para não poluir o RAG.
3. **Narrativas Contínuas (Organograma Vivo):** O sistema deve manter um `.md` para cada membro da equipe/parceiro da Experia, atualizando as ações daquela pessoa baseando-se nas reuniões ingeridas sem deletar o histórico (atualização incremental).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FIM DO RP-20260227-MEGABRAIN-JARVIS-PIPELINE v1.0-HARVEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
