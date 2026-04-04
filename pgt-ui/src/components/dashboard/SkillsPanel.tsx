import { useState, useEffect } from "react";
import { Brain, Zap, Target, Users, Code, Lightbulb, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
  icon: typeof Brain;
  color: string;
}

const initialSkills: Skill[] = [
  {
    id: "sales",
    name: "Vendas",
    level: 0,
    maxLevel: 10,
    xp: 0,
    xpToNext: 500,
    icon: Target,
    color: "text-neon-magenta",
  },
  {
    id: "productivity",
    name: "Produtividade",
    level: 0,
    maxLevel: 10,
    xp: 0,
    xpToNext: 400,
    icon: Zap,
    color: "text-neon-orange",
  },
  {
    id: "networking",
    name: "Networking",
    level: 0,
    maxLevel: 10,
    xp: 0,
    xpToNext: 600,
    icon: Users,
    color: "text-neon-cyan",
  },
  {
    id: "automation",
    name: "Automação",
    level: 0,
    maxLevel: 10,
    xp: 0,
    xpToNext: 500,
    icon: Code,
    color: "text-neon-purple",
  },
  {
    id: "mindset",
    name: "Mindset",
    level: 0,
    maxLevel: 10,
    xp: 0,
    xpToNext: 300,
    icon: Brain,
    color: "text-neon-green",
  },
  {
    id: "strategy",
    name: "Estratégia",
    level: 0,
    maxLevel: 10,
    xp: 0,
    xpToNext: 700,
    icon: Lightbulb,
    color: "text-secondary",
  },
];

export function SkillsPanel() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);

  const totalLevel = skills.reduce((acc, skill) => acc + skill.level, 0);
  const maxTotalLevel = skills.reduce((acc, skill) => acc + skill.maxLevel, 0);

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-neon-green" />
          <h3 className="font-display text-lg uppercase tracking-wide">Skills</h3>
        </div>
        
        <div className="px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30">
          <span className="text-xs font-mono text-neon-green">
            LVL {totalLevel}/{maxTotalLevel}
          </span>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 gap-3">
        {skills.map((skill) => {
          const Icon = skill.icon;
          const xpProgress = (skill.xp / skill.xpToNext) * 100;
          
          return (
            <div
              key={skill.id}
              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center",
                  skill.level > 0 && "bg-primary/10"
                )}>
                  <Icon className={cn("w-4 h-4", skill.level > 0 ? skill.color : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{skill.name}</h4>
                  <span className="text-xs font-mono text-muted-foreground">
                    Nível {skill.level}
                  </span>
                </div>
              </div>
              
              {/* XP Progress */}
              <div className="space-y-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      skill.level > 0 ? "bg-gradient-to-r from-primary to-neon-cyan" : "bg-muted-foreground/30"
                    )}
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{skill.xp} XP</span>
                  <span>{skill.xpToNext} XP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center font-mono">
          Complete quests para ganhar XP nas skills relacionadas
        </p>
      </div>
    </div>
  );
}
