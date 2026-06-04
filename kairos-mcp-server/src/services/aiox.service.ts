import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";

const KAIROS_ROOT = path.resolve(process.cwd(), "..");

// Cache em memória simples para reduzir leituras no disco
const memCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCached<T>(key: string): T | null {
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: any) {
  memCache.set(key, { data, timestamp: Date.now() });
}

export class AioxService {
  async listSquads() {
    const cacheKey = "listSquads";
    const cached = getCached<string[]>(cacheKey);
    if (cached) return cached;

    const squadsDir = path.join(KAIROS_ROOT, "squads");
    logger.debug(`Lendo squads de ${squadsDir}`);
    
    try {
      await fs.access(squadsDir);
      const files = await fs.readdir(squadsDir);
      const squads = files.filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", ""));
      setCache(cacheKey, squads);
      return squads;
    } catch (e) {
      logger.warn(`Pasta squads não acessível em ${squadsDir}`);
      return [];
    }
  }

  async listAgents(squad: string) {
    const cacheKey = `listAgents_${squad || "all"}`;
    const cached = getCached<string[]>(cacheKey);
    if (cached) return cached;

    // Tenta caminhos atualizados (AIOX) primeiro
    const possibleDirs = [
      path.join(KAIROS_ROOT, ".agents"),
      path.join(KAIROS_ROOT, ".agent"),
      path.join(KAIROS_ROOT, ".aiox", "agents"),
      path.join(KAIROS_ROOT, ".aiox-core", "development", "agents")
    ];

    for (const dir of possibleDirs) {
      try {
        await fs.access(dir);
        const files = await fs.readdir(dir);
        const agents = files.filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", ""));
        if (agents.length > 0) {
          setCache(cacheKey, agents);
          return agents;
        }
      } catch (e) {
        continue;
      }
    }
    logger.warn("Nenhuma pasta de agentes encontrada");
    return [];
  }

  async getAgent(squad: string, agentId: string) {
    const cacheKey = `getAgent_${agentId}`;
    const cached = getCached<string>(cacheKey);
    if (cached) return cached;

    const possiblePaths = [
      path.join(KAIROS_ROOT, ".agents", `${agentId}.md`),
      path.join(KAIROS_ROOT, ".agent", `${agentId}.md`),
      path.join(KAIROS_ROOT, ".aiox", "agents", `${agentId}.md`),
      path.join(KAIROS_ROOT, ".aiox-core", "development", "agents", `${agentId}.md`)
    ];

    for (const p of possiblePaths) {
      try {
        await fs.access(p);
        const content = await fs.readFile(p, "utf-8");
        setCache(cacheKey, content);
        return content;
      } catch (e) {
        continue;
      }
    }
    
    throw new NotFoundError("Agente", agentId);
  }

  async listSkills() {
    const cacheKey = "listSkills";
    const cached = getCached<string[]>(cacheKey);
    if (cached) return cached;

    const possibleDirs = [
      path.join(KAIROS_ROOT, "tools", "integrations"),
      path.join(KAIROS_ROOT, "skills")
    ];

    for (const dir of possibleDirs) {
      try {
        await fs.access(dir);
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const skills = entries.filter(e => e.isDirectory()).map(e => e.name);
        if (skills.length > 0) {
          setCache(cacheKey, skills);
          return skills;
        }
      } catch (e) {
        continue;
      }
    }
    return [];
  }

  async readSkill(skillId: string) {
    const cacheKey = `readSkill_${skillId}`;
    const cached = getCached<string>(cacheKey);
    if (cached) return cached;

    const possiblePaths = [
      path.join(KAIROS_ROOT, "tools", "integrations", skillId, "SKILL.md"),
      path.join(KAIROS_ROOT, "skills", skillId, "SKILL.md")
    ];

    for (const p of possiblePaths) {
      try {
        await fs.access(p);
        const content = await fs.readFile(p, "utf-8");
        setCache(cacheKey, content);
        return content;
      } catch (e) {
        continue;
      }
    }
    
    throw new NotFoundError("Skill", skillId);
  }
}

export const aioxService = new AioxService();
