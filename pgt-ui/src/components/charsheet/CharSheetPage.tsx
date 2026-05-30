import { Shield, Brain, Heart, Wallet, Target, Activity } from "lucide-react";
import { useSharedBrain } from "@/hooks/useSharedBrain";
import { cn } from "@/lib/utils";

const dimensions = [
  { id: "health", label: "Saúde Física", score: 85, icon: Heart, color: "text-red-400" },
  { id: "mind", label: "Mente & Foco", score: 72, icon: Brain, color: "text-blue-400" },
  { id: "wealth", label: "Finanças", score: 90, icon: Wallet, color: "text-green-400" },
  { id: "purpose", label: "Missão", score: 80, icon: Target, color: "text-orange-400" },
];

export function CharSheetPage() {
  const brain = useSharedBrain();
  const { skyrosScore, level, attributes } = brain;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-xl border-2 border-primary/50 bg-muted/20 flex items-center justify-center overflow-hidden">
            <Shield className="w-10 h-10 text-primary opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
          </div>
          <div className="absolute -bottom-3 -right-3 bg-background border-2 border-primary text-primary font-mono font-bold text-xs px-2 py-0.5 rounded shadow-[0_0_10px_rgba(201,168,76,0.3)]">
            LVL {level}
          </div>
        </div>
        <div>
          <h2 className="font-serif text-3xl text-primary glow-cyan uppercase tracking-wider">
            Gabriel OS
          </h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Classe: Arquiteto / Fundador
          </p>
        </div>
        
        <div className="ml-auto text-right">
          <div className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Life Score Global
          </div>
          <div className="text-5xl font-display text-primary glow-cyan">
            {skyrosScore}
          </div>
          <div className="text-xs text-green-400 font-mono mt-1">
            ↑ +5 pts esta semana
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Dimensões da Vida (AlfaLab Inspired) */}
        <div className="glass-card p-6 border-primary/20">
          <h3 className="font-serif text-xl mb-6 text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Performance Dimensional
          </h3>
          
          <div className="space-y-6">
            {dimensions.map(dim => (
              <div key={dim.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <dim.icon className={cn("w-4 h-4", dim.color)} />
                    <span className="font-mono text-sm uppercase">{dim.label}</span>
                  </div>
                  <span className={cn("font-bold font-mono", dim.color)}>{dim.score}/100</span>
                </div>
                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", dim.color.replace('text', 'bg'))}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atributos Básicos (RPG) */}
        <div className="glass-card p-6 border-blue-500/20">
          <h3 className="font-serif text-xl mb-6 text-blue-400 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Atributos de Personagem
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
              <span className="font-mono font-medium text-sm">Força (STR)</span>
              <span className="font-bold text-lg">{attributes.str}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
              <span className="font-mono font-medium text-sm">Inteligência (INT)</span>
              <span className="font-bold text-lg">{attributes.int}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
              <span className="font-mono font-medium text-sm">Destreza (DEX)</span>
              <span className="font-bold text-lg">{attributes.dex}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10">
              <span className="font-mono font-medium text-sm">Vontade (WIL)</span>
              <span className="font-bold text-lg">{attributes.wil}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="text-xs text-muted-foreground font-mono text-center">
              Você possui <span className="text-primary font-bold">2</span> pontos de atributo não distribuídos.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
