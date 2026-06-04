import { aioxService } from "../services/aiox.service.js";

export const aioxTools = [
  {
    name: "aiox_list_squads",
    description: "Lista todos os squads disponíveis",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "aiox_list_agents",
    description: "Lista todos os agentes (opcionalmente por squad)",
    inputSchema: {
      type: "object",
      properties: { squad: { type: "string" } },
      required: ["squad"],
    },
  },
  {
    name: "aiox_get_agent",
    description: "Lê todo o conteúdo de um agente específico",
    inputSchema: {
      type: "object",
      properties: { squad: { type: "string" }, agent: { type: "string" } },
      required: ["squad", "agent"],
    },
  },
  {
    name: "aiox_list_skills",
    description: "Lista as integrações (skills) disponíveis em tools/integrations",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "aiox_read_skill",
    description: "Lê a documentação SKILL.md de uma skill específica",
    inputSchema: {
      type: "object",
      properties: { skill_id: { type: "string" } },
      required: ["skill_id"],
    },
  },
];

export const aioxHandlers: Record<string, Function> = {
  aiox_list_squads: async () => await aioxService.listSquads(),
  aiox_list_agents: async (args: any) => await aioxService.listAgents(args.squad),
  aiox_get_agent: async (args: any) => await aioxService.getAgent(args.squad, args.agent),
  aiox_list_skills: async () => await aioxService.listSkills(),
  aiox_read_skill: async (args: any) => await aioxService.readSkill(args.skill_id),
};
