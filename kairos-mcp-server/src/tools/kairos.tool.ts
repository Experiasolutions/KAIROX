import { kairosService } from "../services/kairos.service.js";

export const kairosTools = [
  {
    name: "kairos_health",
    description: "Full KAIROS system health check — verifica subsistemas reais (context, hivemind, aios, arsenal, hydra)",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: "kairos_read_context",
    description: "Lê SELF_CONTEXT.md e/ou STATUS.md. Parâmetro file: 'self_context' | 'status' | 'both' | 'all'",
    inputSchema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          enum: ["self_context", "status", "both", "all"],
          description: "Qual arquivo ler. 'all' é alias de 'both'",
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "kairos_write_context",
    description: "Escreve ou atualiza SELF_CONTEXT.md ou STATUS.md. Faz backup automático antes de sobrescrever. Suporta substituição total (content) ou patch por seção H2 (patch).",
    inputSchema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          enum: ["self_context", "status"],
          description: "Qual arquivo atualizar",
        },
        content: {
          type: "string",
          description: "Substituição completa do arquivo (opcional — use patch para mudanças parciais)",
        },
        patch: {
          type: "object",
          description: "Atualização parcial de uma seção H2 específica",
          properties: {
            section: { type: "string", description: "Nome da seção H2 (sem o ##)" },
            value: { type: "string", description: "Novo conteúdo da seção" },
          },
          required: ["section", "value"],
        },
      },
      required: ["file"],
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  },
  {
    name: "kairos_explore_arsenal",
    description: "Lista scripts do arsenal (pasta arsenal/ na raiz do KAIROS)",
    inputSchema: {
      type: "object",
      properties: { category: { type: "string", description: "Subcategoria (opcional). 'all' lista tudo." } },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "kairos_read_script",
    description: "Lê código fonte de um script do arsenal pelo nome do arquivo",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Nome ou caminho relativo do script" } },
      required: ["path"],
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "kairos_log_artifact",
    description: "Registra um artefato produzido na sessão (código, doc, spec, decisão de design, config) no hivemind/artifacts.json",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Nome do artefato" },
        type: {
          type: "string",
          enum: ["code", "doc", "spec", "decision", "config", "other"],
          description: "Tipo do artefato",
        },
        project: { type: "string", description: "Projeto relacionado (opcional)" },
        path: { type: "string", description: "Caminho no filesystem se existir (opcional)" },
        summary: { type: "string", description: "Descrição do que é o artefato" },
        tags: { type: "array", items: { type: "string" }, description: "Tags livres (opcional)" },
        produced_by: { type: "string", description: "Ferramenta que produziu: cursor, claude, antigravity... (opcional)" },
      },
      required: ["title", "summary"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: "kairos_list_artifacts",
    description: "Lista artefatos registrados no hivemind/artifacts.json com filtros opcionais",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Filtrar por nome do projeto relacionado ao artefato" },
        type: { type: "string", enum: ["code", "doc", "spec", "decision", "config", "other"], description: "Filtrar por tipo de artefato" },
        produced_by: { type: "string", description: "Filtrar por ferramenta que produziu o artefato (ex: 'cursor', 'claude', 'antigravity')" },
        limit: { type: "number", description: "Máximo de resultados a retornar (padrão: 50)", default: 50 },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "skyros_isolation",
    description: "Gerencia o Modo Deep Work. action: 'enable' | 'disable' | 'status' (padrão: status — apenas consulta sem alterar)",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["enable", "disable", "status"],
          description: "Ação a executar. 'status' apenas consulta o estado atual.",
        },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "skyros_triage",
    description: "Executa a Triage Matinal — consolida dados reais de SELF_CONTEXT.md, STATUS.md, hivemind decisions/states/tasks e kairos_health em um briefing estruturado",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
];

export const kairosHandlers: Record<string, Function> = {
  kairos_health: async () => await kairosService.health(),
  kairos_read_context: async (args: any) => await kairosService.readContext(args.file),
  kairos_write_context: async (args: any) => await kairosService.writeContext(args.file, args.content, args.patch),
  kairos_explore_arsenal: async (args: any) => await kairosService.exploreArsenal(args.category),
  kairos_read_script: async (args: any) => await kairosService.readScript(args.path),
  kairos_log_artifact: async (args: any) => await kairosService.logArtifact(args),
  kairos_list_artifacts: async (args: any) => await kairosService.listArtifacts(args),
  skyros_isolation: async (args: any) => await kairosService.skyrosIsolation(args.action),
  skyros_triage: async () => await kairosService.skyrosTriage(),
};
