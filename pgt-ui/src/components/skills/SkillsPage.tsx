import { useState } from "react";
import { Brain, Zap, Target, Mic, Lightbulb, TrendingUp, Bot, Plus, Lock, Star, Info, ArrowRight, Megaphone, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSharedBrain } from "../../hooks/useSharedBrain";

// ═══ SKILL NODE DEFINITIONS ═══

interface SkillNode {
  id: string;
  name: string;
  emoji: string;
  description: string;
  zone: "genius" | "excellence" | "impact";
  maxLevel: number;
  unlocks: string[];
  children?: string[];
  requires?: string;
  // Position in SVG canvas
  x: number;
  y: number;
}

const CANVAS_W = 900;
const CANVAS_H = 750;

const skillTree: SkillNode[] = [
  // ═══ ROW 1 — ROOT NODES (Top) ═══
  {
    id: "voice",
    name: "Voz & Comunicação",
    emoji: "🎙️",
    description: "A arma primária. Herdada da mãe locutora.",
    zone: "genius",
    maxLevel: 5,
    x: 150, y: 80,
    unlocks: [
      "Narrar demos e vídeos para a Experia",
      "Gravar auto-hipnose guiada",
      "Canal de voz (YouTube / podcast)",
      "Produtos monetizados de narração",
      "THE WAY OF THE VOICE (Dragonborn Mode)",
    ],
    children: ["hypnosis"],
  },
  {
    id: "architecture",
    name: "Arquitetura de Sistemas",
    emoji: "🏗️",
    description: "Construir pontes entre IA e negócios reais.",
    zone: "genius",
    maxLevel: 5,
    x: 450, y: 80,
    unlocks: [
      "Mapear processos de clientes",
      "Desenhar squads de agentes por departamento",
      "Quality Gates + Handoff automático",
      "Dashboard de governança para cliente",
      "KAIROS SKY multi-tenant escalável",
    ],
    children: ["agentification"],
  },
  {
    id: "execution",
    name: "Execução Disciplinada",
    emoji: "⚡",
    description: "Anti-procrastinação. O gargalo histórico quebrado.",
    zone: "impact",
    maxLevel: 5,
    x: 750, y: 80,
    unlocks: [
      "RITUAL completo por 7 dias seguidos",
      "Primeiro Streak Shield conquistado",
      "Pareto Score >30% por uma semana",
      "Missão 🔵 concluída 5 dias seguidos",
      "MODO DE GUERRA dominado (T1 encerrada)",
    ],
    children: ["sales"],
  },

  // ═══ ROW 2 — TIER 2 NODES ═══
  {
    id: "hypnosis",
    name: "Domínio do Subconsciente",
    emoji: "🌀",
    description: "A chave trancada. Bypass via sistema externo.",
    zone: "genius",
    maxLevel: 5,
    x: 150, y: 270,
    requires: "voice",
    unlocks: [
      "Auto-hipnose leve (5min diários)",
      "Protocolo anti-procrastinação",
      "Flow state on demand (30min+ 🔵)",
      "Hipnose para outros (produto terapêutico)",
      "Domínio pleno do subconsciente",
    ],
  },
  {
    id: "agentification",
    name: "Agentificação",
    emoji: "🤖",
    description: "KAIROS, AIOS, fluxos multi-agente. IA como equipe infinita.",
    zone: "excellence",
    maxLevel: 5,
    x: 450, y: 270,
    requires: "architecture",
    unlocks: [
      "Configurar agentes básicos KAIROS",
      "Multi-agente flows (Worker + Analyst)",
      "KAIROS SKY 24/7 autônomo",
      "Squad builder Experia (4 executores)",
      "God Pool + Multi-LLM routing soberano",
    ],
    children: ["marketing"],
  },
  {
    id: "sales",
    name: "Vendas & Fechamento",
    emoji: "🎯",
    description: "Cold approach, pitch, proposta, fechar.",
    zone: "excellence",
    maxLevel: 5,
    x: 750, y: 270,
    requires: "execution",
    unlocks: [
      "Script de abordagem local pronto",
      "Cold call com case documentado",
      "Demo regional fechada",
      "Proposta industrial (Master Pumps)",
      "Contrato R$10K+ assinado",
    ],
    children: ["leadership"],
  },

  // ═══ ROW 3 — TIER 3 NODES ═══
  {
    id: "marketing",
    name: "Marketing Digital",
    emoji: "📣",
    description: "Instagram, funis, copy, prova social. A máquina de leads.",
    zone: "excellence",
    maxLevel: 5,
    x: 350, y: 460,
    requires: "agentification",
    unlocks: [
      "Grid IG 9 posts + identidade visual",
      "Funil de captação via quiz gamificado",
      "Campanha local com cases reais",
      "Ads pagos com ROI positivo",
      "Motor perpétuo de inbound leads",
    ],
  },
  {
    id: "leadership",
    name: "Liderança & Delegação",
    emoji: "👑",
    description: "Sair da execução. Liderar agentes e pessoas.",
    zone: "impact",
    maxLevel: 5,
    x: 650, y: 460,
    requires: "sales",
    unlocks: [
      "Delegar 1 tarefa completa para agente IA",
      "Montar squad humano (1 estagiário/freelancer)",
      "Processo de onboarding documentado",
      "Time de 3+ operando sem supervisão direta",
      "CEO Mode — só decisões estratégicas",
    ],
  },
  {
    id: "growth",
    name: "Crescimento Perpétuo",
    emoji: "📚",
    description: "Estudo que expande a Zona de Genialidade.",
    zone: "impact",
    maxLevel: 5,
    x: 500, y: 640,
    unlocks: [
      "5 sessões de estudo/semana",
      "Método de idiomas via IA (inglês MVP)",
      "Mentor IA tier (Alan Nicolas style)",
      "Academia Gamer prototipada",
      "Liberdade do aprendizado perpétuo",
    ],
  },
];

// ═══ ZONE COLORS ═══
const zoneColors = {
  genius: { fill: "#3b82f6", stroke: "#60a5fa", bg: "rgba(59,130,246,0.1)", label: "🔵 Genialidade" },
  excellence: { fill: "#22c55e", stroke: "#4ade80", bg: "rgba(34,197,94,0.1)", label: "🟢 Excelência" },
  impact: { fill: "#eab308", stroke: "#facc15", bg: "rgba(234,179,8,0.1)", label: "🟡 Impacto" },
};

// ═══ COMPONENT ═══

export function SkillsPage() {
  const { skillPoints, availableAttributePoints, level, allocateSkillPoint } = useSharedBrain();
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  const getSkillLevel = (id: string) => skillPoints[id] ?? 0;

  const canAllocate = (skill: SkillNode) => {
    if (availableAttributePoints <= 0) return false;
    if (getSkillLevel(skill.id) >= skill.maxLevel) return false;
    if (skill.requires && getSkillLevel(skill.requires) < 1) return false;
    return true;
  };

  const isLocked = (skill: SkillNode) => {
    return skill.requires ? getSkillLevel(skill.requires) < 1 : false;
  };

  // Find connections between nodes
  const connections: { from: SkillNode; to: SkillNode }[] = [];
  skillTree.forEach(skill => {
    if (skill.children) {
      skill.children.forEach(childId => {
        const child = skillTree.find(s => s.id === childId);
        if (child) connections.push({ from: skill, to: child });
      });
    }
  });

  const NODE_R = 38;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-primary glow-gold flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Skill Tree — Árvore de Habilidades
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Zona de Genialidade · Pareto Cubed · SVG Tree
          </p>
        </div>

        {/* Points counter */}
        <div className={cn(
          "glass-card px-5 py-3 text-center border",
          availableAttributePoints > 0 ? "border-yellow-400/50 bg-yellow-500/10" : "border-border"
        )}>
          <div className={cn(
            "font-display text-2xl",
            availableAttributePoints > 0 ? "text-yellow-400 glow-gold" : "text-muted-foreground"
          )}>
            {availableAttributePoints}
          </div>
          <div className="text-[9px] text-muted-foreground font-mono">PONTOS</div>
        </div>
      </div>

      {/* Zone legend */}
      <div className="flex gap-4">
        {Object.entries(zoneColors).map(([z, cfg]) => (
          <div key={z} className="px-3 py-1.5 rounded-lg text-xs font-mono border" style={{
            background: cfg.bg,
            borderColor: cfg.stroke + "44",
            color: cfg.stroke,
          }}>
            {cfg.label}
          </div>
        ))}
      </div>

      {/* SVG Skill Tree */}
      <div className="glass-card p-4 overflow-x-auto" style={{ minHeight: "700px" }}>
        <svg
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          className="w-full"
          style={{ maxHeight: "700px" }}
        >
          {/* Connection lines */}
          {connections.map(({ from, to }) => {
            const fromLevel = getSkillLevel(from.id);
            const unlocked = fromLevel >= 1;
            return (
              <line
                key={`${from.id}-${to.id}`}
                x1={from.x}
                y1={from.y + NODE_R}
                x2={to.x}
                y2={to.y - NODE_R}
                className={cn(
                  "skill-tree-line",
                  unlocked && "skill-tree-line--unlocked"
                )}
                strokeDasharray={unlocked ? "none" : "6 4"}
              />
            );
          })}

          {/* Nodes */}
          {skillTree.map(skill => {
            const currentLevel = getSkillLevel(skill.id);
            const locked = isLocked(skill);
            const zc = zoneColors[skill.zone];
            const progressPct = currentLevel / skill.maxLevel;
            const selected = selectedSkill?.id === skill.id;

            // Calculate circumference for progress ring
            const circumference = 2 * Math.PI * (NODE_R - 4);
            const dashOffset = circumference - (circumference * progressPct);

            return (
              <g
                key={skill.id}
                className="skill-tree-node"
                onClick={() => setSelectedSkill(selected ? null : skill)}
                style={{ opacity: locked ? 0.3 : 1 }}
              >
                {/* Outer glow ring (selected) */}
                {selected && (
                  <circle
                    cx={skill.x}
                    cy={skill.y}
                    r={NODE_R + 6}
                    fill="none"
                    stroke={zc.stroke}
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                )}

                {/* Background circle */}
                <circle
                  cx={skill.x}
                  cy={skill.y}
                  r={NODE_R}
                  fill={locked ? "#111" : zc.bg}
                  stroke={selected ? zc.stroke : zc.stroke + "66"}
                  strokeWidth={selected ? 2.5 : 1.5}
                />

                {/* Progress ring */}
                {currentLevel > 0 && (
                  <circle
                    cx={skill.x}
                    cy={skill.y}
                    r={NODE_R - 4}
                    fill="none"
                    stroke={zc.stroke}
                    strokeWidth="3"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${skill.x} ${skill.y})`}
                    style={{ transition: "stroke-dashoffset 0.5s" }}
                  />
                )}

                {/* Emoji */}
                <text
                  x={skill.x}
                  y={skill.y - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-lg"
                  style={{ fontSize: "20px" }}
                >
                  {skill.emoji}
                </text>

                {/* Level badge */}
                <text
                  x={skill.x}
                  y={skill.y + 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={currentLevel > 0 ? zc.stroke : "#666"}
                  style={{ fontSize: "9px", fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}
                >
                  {currentLevel}/{skill.maxLevel}
                </text>

                {/* Lock icon for locked nodes */}
                {locked && (
                  <text
                    x={skill.x + NODE_R - 8}
                    y={skill.y - NODE_R + 10}
                    textAnchor="middle"
                    style={{ fontSize: "12px" }}
                  >
                    🔒
                  </text>
                )}

                {/* Name label below node */}
                <text
                  x={skill.x}
                  y={skill.y + NODE_R + 16}
                  textAnchor="middle"
                  fill="#888"
                  style={{ fontSize: "10px", fontFamily: "Inter, sans-serif" }}
                >
                  {skill.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail Panel */}
      {selectedSkill && (
        <div className="glass-card p-6 border-2 animate-fade-in" style={{
          borderColor: zoneColors[selectedSkill.zone].stroke + "66",
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedSkill.emoji}</span>
              <div>
                <h3 className="font-display text-xl" style={{ color: zoneColors[selectedSkill.zone].stroke }}>
                  {selectedSkill.name}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedSkill.description}</p>
              </div>
            </div>

            {/* Allocate button */}
            {canAllocate(selectedSkill) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  allocateSkillPoint(selectedSkill.id);
                }}
                className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 text-yellow-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                Alocar Ponto
              </button>
            )}
          </div>

          {/* Level progression */}
          <div className="grid grid-cols-5 gap-3">
            {selectedSkill.unlocks.map((unlock, i) => {
              const thisLevel = i + 1;
              const currentLevel = getSkillLevel(selectedSkill.id);
              const isAchieved = currentLevel >= thisLevel;

              return (
                <div key={i} className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  isAchieved
                    ? "bg-muted/20"
                    : "border-border bg-muted/5 opacity-50"
                )} style={{
                  borderColor: isAchieved ? zoneColors[selectedSkill.zone].stroke + "55" : undefined,
                }}>
                  <Star
                    className="w-4 h-4 mx-auto mb-1"
                    style={{ color: isAchieved ? zoneColors[selectedSkill.zone].stroke : "#444" }}
                    fill={isAchieved ? "currentColor" : "none"}
                  />
                  <div className="text-[10px] font-mono mb-1" style={{
                    color: isAchieved ? zoneColors[selectedSkill.zone].stroke : "#666"
                  }}>
                    NÍVEL {thisLevel}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    {unlock}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Requires info */}
          {selectedSkill.requires && (
            <div className="mt-4 text-xs text-muted-foreground font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Requer: {skillTree.find(s => s.id === selectedSkill.requires)?.name} nível 1+
            </div>
          )}
        </div>
      )}

      {/* Audit Note */}
      <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-blue-400 font-mono">AUDITORIA GAMIFICAÇÃO (Hormozi + Naval + Tencent):</span>{" "}
            Skills refletem alavancagem real — cada nível desbloqueado tem impacto tangível.
            Pontos de atributo = 1 por level-up. 10 skills · 3 zonas · SVG Tree com conexões.
          </div>
        </div>
      </div>
    </div>
  );
}
