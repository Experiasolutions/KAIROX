import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";

const KAIROS_ROOT = path.resolve(process.cwd(), "..");
const ISOLATION_STATE_FILE = path.join(KAIROS_ROOT, "hivemind", "isolation_state.json");

export class KairosService {
  // ---------------------------------------------------------------------------
  // Health — verifica subsistemas reais
  // ---------------------------------------------------------------------------
  async health() {
    const selfContextPath = path.join(KAIROS_ROOT, "SELF_CONTEXT.md");
    const statusPath = path.join(KAIROS_ROOT, "STATUS.md");
    const hivemindDir = path.join(KAIROS_ROOT, "hivemind");
    const arsenalDir = path.join(KAIROS_ROOT, "arsenal");

    // Context
    const selfContextExists = await fs.access(selfContextPath).then(() => true).catch(() => false);
    const statusExists = await fs.access(statusPath).then(() => true).catch(() => false);
    const contextStatus = selfContextExists && statusExists ? "ok" : "missing";

    // Hivemind
    let hivemindDecisions = 0;
    let hivemindStates = 0;
    let hivemindStatus: string;
    try {
      const decisionsRaw = await fs.readFile(path.join(hivemindDir, "decisions.jsonl"), "utf-8");
      hivemindDecisions = decisionsRaw.split("\n").filter(Boolean).length;
      const statesRaw = await fs.readFile(path.join(hivemindDir, "agent-states.json"), "utf-8");
      hivemindStates = Object.keys(JSON.parse(statesRaw)).length;
      hivemindStatus = "ok";
    } catch {
      hivemindStatus = hivemindDecisions === 0 ? "empty" : "missing";
    }

    // AIOS / AIOX squads
    let squadsCount = 0;
    let agentsCount = 0;
    let skillsCount = 0;
    let aiosStatus: string;
    try {
      const squadsDir = path.join(KAIROS_ROOT, "aios", "squads");
      const squads = await fs.readdir(squadsDir);
      squadsCount = squads.length;
      for (const squad of squads) {
        const agentsDir = path.join(squadsDir, squad, "agents");
        const agents = await fs.readdir(agentsDir).catch(() => []);
        agentsCount += agents.length;
      }
      const intDir = path.join(KAIROS_ROOT, "integrations");
      const skills = await fs.readdir(intDir).catch(() => []);
      skillsCount = skills.filter((f) => f.endsWith(".md")).length;
      aiosStatus = squadsCount > 0 ? "ok" : "empty";
    } catch {
      aiosStatus = "empty";
    }

    // Arsenal
    let arsenalScripts = 0;
    let arsenalStatus: string;
    try {
      const scripts = await fs.readdir(arsenalDir);
      arsenalScripts = scripts.filter((f) => !f.startsWith(".")).length;
      arsenalStatus = arsenalScripts > 0 ? "ok" : "empty";
    } catch {
      arsenalStatus = "empty";
    }

    // Status geral
    const criticalIssues = contextStatus === "missing";
    const degradedIssues = aiosStatus === "empty" || arsenalStatus === "empty" || hivemindStatus === "empty";
    const overallStatus = criticalIssues ? "critical" : degradedIssues ? "degraded" : "ok";

    return {
      status: overallStatus,
      version: "3.1 KAIROX Engine",
      timestamp: new Date().toISOString(),
      subsystems: {
        context: {
          status: contextStatus,
          self_context_exists: selfContextExists,
          status_file_exists: statusExists,
        },
        hivemind: {
          status: hivemindStatus,
          decisions_count: hivemindDecisions,
          states_count: hivemindStates,
        },
        aios: {
          status: aiosStatus,
          squads_count: squadsCount,
          agents_count: agentsCount,
          skills_count: skillsCount,
        },
        arsenal: {
          status: arsenalStatus,
          scripts_count: arsenalScripts,
        },
        hydra: {
          status: "deferred",
          note: "suspended until phase 3",
        },
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Read Context — com erro explícito e alias "all"
  // ---------------------------------------------------------------------------
  async readContext(file: string = "both") {
    const result: Record<string, unknown> = {};
    const readFile = async (key: string, filename: string) => {
      const filePath = path.join(KAIROS_ROOT, filename);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const stat = await fs.stat(filePath);
        if (stat.size > 50 * 1024) {
          result[key] = content;
          result[`${key}_warning`] = "context_file_large";
        } else {
          result[key] = content;
        }
      } catch {
        result[`${key}_error`] = {
          error: "context_not_found",
          message: `${filename} not found at expected path`,
          expected_path: filePath,
          hint: "Create the file using the template in the refactoring plan",
        };
        logger.warn(`${filename} não encontrado`);
      }
    };

    const readSelf = file === "self_context" || file === "both" || file === "all";
    const readStatus = file === "status" || file === "both" || file === "all";

    if (readSelf) await readFile("self_context", "SELF_CONTEXT.md");
    if (readStatus) await readFile("status", "STATUS.md");

    return result;
  }

  // ---------------------------------------------------------------------------
  // Write Context — com backup atômico e patch por seção
  // ---------------------------------------------------------------------------
  async writeContext(
    file: "self_context" | "status",
    content?: string,
    patch?: { section: string; value: string }
  ) {
    const filename = file === "self_context" ? "SELF_CONTEXT.md" : "STATUS.md";
    const filePath = path.join(KAIROS_ROOT, filename);

    // Backup atômico
    const backupDir = path.join(KAIROS_ROOT, "_backup");
    await fs.mkdir(backupDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `${file}_${ts}.md`);
    await fs.copyFile(filePath, backupPath).catch(() => {
      logger.warn(`Backup de ${filename} falhou — arquivo pode não existir ainda`);
    });

    if (content !== undefined) {
      await fs.writeFile(filePath, content, "utf-8");
    } else if (patch) {
      let src = "";
      try {
        src = await fs.readFile(filePath, "utf-8");
      } catch {
        src = `# ${filename}\n\n## ${patch.section}\n`;
      }
      const regex = new RegExp(`(## ${patch.section}\n)([\\s\\S]*?)(?=\n## |$)`, "m");
      if (regex.test(src)) {
        src = src.replace(regex, `$1${patch.value}\n`);
      } else {
        src += `\n## ${patch.section}\n${patch.value}\n`;
      }
      await fs.writeFile(filePath, src, "utf-8");
    }

    const stat = await fs.stat(filePath);
    logger.info(`kairos_write_context: ${filename} atualizado (${stat.size} bytes)`);
    return { success: true, file, bytes_written: stat.size, backed_up_to: backupPath };
  }

  // ---------------------------------------------------------------------------
  // Arsenal — path corrigido para arsenal/
  // ---------------------------------------------------------------------------
  async exploreArsenal(category: string = "all") {
    const arsenalBase = path.join(KAIROS_ROOT, "arsenal");
    const targetDir = category === "all" ? arsenalBase : path.join(arsenalBase, category);
    try {
      const files = await fs.readdir(targetDir);
      return files.filter((f) => !f.startsWith("."));
    } catch {
      return [];
    }
  }

  async readScript(scriptPath: string) {
    // Tenta primeiro em arsenal/, depois na raiz
    const candidates = [
      path.join(KAIROS_ROOT, "arsenal", scriptPath),
      path.join(KAIROS_ROOT, scriptPath),
    ];
    for (const candidate of candidates) {
      try {
        return await fs.readFile(candidate, "utf-8");
      } catch {
        // tenta próximo
      }
    }
    throw new NotFoundError("Script", scriptPath);
  }

  // ---------------------------------------------------------------------------
  // Log Artifact
  // ---------------------------------------------------------------------------
  async logArtifact(params: {
    title: string;
    type?: string;
    project?: string;
    path?: string;
    summary: string;
    tags?: string[];
    produced_by?: string;
  }) {
    const artifactsFile = path.join(KAIROS_ROOT, "hivemind", "artifacts.json");
    await fs.mkdir(path.dirname(artifactsFile), { recursive: true });

    let data: { artifacts: unknown[]; total: number } = { artifacts: [], total: 0 };
    try {
      data = JSON.parse(await fs.readFile(artifactsFile, "utf-8"));
    } catch {
      // arquivo não existe ainda — usa default
    }

    const artifact = {
      id: `art_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...params,
    };
    data.artifacts.unshift(artifact);
    data.total = data.artifacts.length;

    // Escrita atômica: temp → rename
    const tmpFile = artifactsFile + ".tmp";
    await fs.writeFile(tmpFile, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(tmpFile, artifactsFile);

    logger.info(`Artifact registrado: ${params.title}`);
    return { success: true, id: artifact.id, total: data.total };
  }

  async listArtifacts(filters: {
    project?: string;
    type?: string;
    produced_by?: string;
    limit?: number;
  } = {}) {
    const artifactsFile = path.join(KAIROS_ROOT, "hivemind", "artifacts.json");
    try {
      const data: { artifacts: Record<string, unknown>[]; total: number } =
        JSON.parse(await fs.readFile(artifactsFile, "utf-8"));

      let results = data.artifacts;
      if (filters.project) results = results.filter((a) => a["project"] === filters.project);
      if (filters.type) results = results.filter((a) => a["type"] === filters.type);
      if (filters.produced_by) results = results.filter((a) => a["produced_by"] === filters.produced_by);
      results = results.slice(0, filters.limit ?? 50);

      return { artifacts: results, total: data.total, returned: results.length };
    } catch {
      return { artifacts: [], total: 0, returned: 0 };
    }
  }

  // ---------------------------------------------------------------------------
  // Skyros Isolation — com persistência e action: "status"
  // ---------------------------------------------------------------------------
  async skyrosIsolation(action: string = "status") {
    await fs.mkdir(path.dirname(ISOLATION_STATE_FILE), { recursive: true });

    let state: { active: boolean; activated_at: string | null; deactivated_at: string | null } = {
      active: false,
      activated_at: null,
      deactivated_at: null,
    };

    try {
      state = JSON.parse(await fs.readFile(ISOLATION_STATE_FILE, "utf-8"));
    } catch {
      // estado inicial
    }

    if (action === "enable") {
      state = { active: true, activated_at: new Date().toISOString(), deactivated_at: null };
      await fs.writeFile(ISOLATION_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
      logger.info("SKYROS Isolation mode: ATIVADO");
    } else if (action === "disable") {
      state = { ...state, active: false, deactivated_at: new Date().toISOString() };
      await fs.writeFile(ISOLATION_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
      logger.info("SKYROS Isolation mode: DESATIVADO");
    } else {
      logger.info("SKYROS Isolation mode: consulta de estado");
    }

    return { status: "success", isolation: state };
  }

  // ---------------------------------------------------------------------------
  // Skyros Triage — briefing com dados reais de 6 fontes
  // ---------------------------------------------------------------------------
  async skyrosTriage() {
    const [selfContextResult, statusResult, healthResult] = await Promise.allSettled([
      fs.readFile(path.join(KAIROS_ROOT, "SELF_CONTEXT.md"), "utf-8"),
      fs.readFile(path.join(KAIROS_ROOT, "STATUS.md"), "utf-8"),
      this.health(),
    ]);

    // Decisions
    let recentDecisions: unknown[] = [];
    try {
      const decisionsRaw = await fs.readFile(
        path.join(KAIROS_ROOT, "hivemind", "decisions.jsonl"),
        "utf-8"
      );
      recentDecisions = decisionsRaw
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l))
        .reverse()
        .slice(0, 5);
    } catch {
      // sem decisões ainda
    }

    // States
    let activeAgents: unknown[] = [];
    try {
      const statesRaw = await fs.readFile(
        path.join(KAIROS_ROOT, "hivemind", "agent-states.json"),
        "utf-8"
      );
      activeAgents = Object.entries(JSON.parse(statesRaw)).map(([id, s]) => ({ id, ...s as object }));
    } catch {
      // sem estados
    }

    // Tasks pendentes
    let pendingTasks: unknown[] = [];
    try {
      const decisionsRaw = await fs.readFile(
        path.join(KAIROS_ROOT, "hivemind", "decisions.jsonl"),
        "utf-8"
      );
      pendingTasks = decisionsRaw
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l))
        .filter((d) => d.type === "task")
        .reverse()
        .slice(0, 10);
    } catch {
      // sem tasks
    }

    const selfCtx = selfContextResult.status === "fulfilled"
      ? selfContextResult.value.slice(0, 500)
      : "SELF_CONTEXT.md ausente — execute kairos_write_context para criá-lo";

    const health = healthResult.status === "fulfilled" ? healthResult.value : null;

    logger.info("SKYROS Triage executada com dados reais");

    return {
      status: "success",
      generated_at: new Date().toISOString(),
      briefing: {
        context_summary: selfCtx,
        recent_decisions: recentDecisions,
        active_agents: activeAgents,
        pending_tasks: pendingTasks,
        system_health: health,
      },
    };
  }
}

export const kairosService = new KairosService();
