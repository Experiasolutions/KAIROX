import { CurrentQuestPanel } from "./CurrentQuestPanel";
import { QuestlinesPanel } from "./QuestlinesPanel";
import { SkillsPanel } from "./SkillsPanel";
import { Cpu, Activity, Flame, Target, Zap, Trophy, TrendingUp } from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-8 relative overflow-hidden animate-fade-in">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-neon-magenta/10" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-8 h-8 text-primary" />
              <span className="text-sm font-mono text-primary">SYSTEM_ONLINE</span>
              <Activity className="w-4 h-4 text-neon-green animate-pulse" />
            </div>
            
            <h2 className="font-display text-4xl text-primary glow-cyan mb-2 uppercase tracking-wider">
              Bem-vindo, Orquestrador
            </h2>
            <p className="text-muted-foreground max-w-xl font-mono text-sm">
              &gt; Neural_connection: ACTIVE | System_integrity: 100% | Ready for command input...
            </p>
            
            {/* Quick Stats Row - Zeradas */}
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
                <Flame className="w-5 h-5 text-neon-orange" />
                <span className="text-sm font-mono text-neon-orange">0 dias streak</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30">
                <Target className="w-5 h-5 text-neon-magenta" />
                <span className="text-sm font-mono text-neon-magenta">0 Bosses pendentes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
                <Zap className="w-5 h-5 text-neon-green" />
                <span className="text-sm font-mono text-neon-green">100% energia</span>
              </div>
            </div>
          </div>
          
          {/* Decorative cyber element */}
          <div className="hidden xl:block relative">
            <div className="w-32 h-32 border-2 border-primary/30 rounded-lg rotate-45 relative">
              <div className="absolute inset-4 border border-primary/50 rounded-lg" />
              <div className="absolute inset-8 bg-primary/20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Zeradas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-5 animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <Trophy className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-secondary">0</span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            <p className="text-sm text-muted-foreground">Fechamentos do Mês</p>
          </div>
        </div>
        
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start justify-between mb-3">
            <Target className="w-6 h-6 text-neon-purple" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neon-purple">0</span>
              <span className="text-sm text-muted-foreground">/ 80</span>
            </div>
            <p className="text-sm text-muted-foreground">Leads Qualificados</p>
          </div>
        </div>
        
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-start justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-neon-green" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neon-green">0%</span>
            </div>
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
          </div>
        </div>
        
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-start justify-between mb-3">
            <Zap className="w-6 h-6 text-neon-orange" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neon-orange">100%</span>
            </div>
            <p className="text-sm text-muted-foreground">Stamina Atual</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Current Quest Panel - 2 cols */}
        <div className="col-span-2">
          <CurrentQuestPanel />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <QuestlinesPanel />
          <SkillsPanel />
        </div>
      </div>
    </div>
  );
}
