import { useState } from "react";
import { Skull, Swords, Shield, Crown, ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Boss {
  id: string;
  name: string;
  description: string;
  totalHp: number;
  currentHp: number;
  priority: "high" | "medium" | "low";
  defeated: boolean;
}

const initialBosses: Boss[] = [
  {
    id: "b1",
    name: "SERASA DRAGON",
    description: "Nome sujo no mercado",
    totalHp: 2500,
    currentHp: 2500,
    priority: "high",
    defeated: false,
  },
  {
    id: "b2",
    name: "GUILHERME'S DEBT",
    description: "Empréstimo pessoal",
    totalHp: 5300,
    currentHp: 5300,
    priority: "high",
    defeated: false,
  },
  {
    id: "b3",
    name: "IPTU GOLEM",
    description: "Impostos atrasados",
    totalHp: 3200,
    currentHp: 1800,
    priority: "medium",
    defeated: false,
  },
  {
    id: "b4",
    name: "CDHU WRAITH",
    description: "Financiamento habitacional",
    totalHp: 8500,
    currentHp: 6200,
    priority: "low",
    defeated: false,
  },
];

export function BossRoom() {
  const [bosses, setBosses] = useState<Boss[]>(initialBosses);
  const [expandedBoss, setExpandedBoss] = useState<string | null>(null);
  const [attackAmount, setAttackAmount] = useState(500);

  const totalDebt = bosses.reduce((acc, b) => acc + b.currentHp, 0);
  const totalPaid = bosses.reduce((acc, b) => acc + (b.totalHp - b.currentHp), 0);

  const attackBoss = (bossId: string, amount: number) => {
    setBosses(prev => prev.map(boss => {
      if (boss.id === bossId) {
        const newHp = Math.max(0, boss.currentHp - amount);
        return { 
          ...boss, 
          currentHp: newHp,
          defeated: newHp === 0
        };
      }
      return boss;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-secondary glow-gold flex items-center gap-3">
            <Skull className="w-8 h-8" />
            The Boss Room
          </h2>
          <p className="text-muted-foreground">Derrote seus inimigos financeiros</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="glass-card px-4 py-2">
            <p className="text-xs text-muted-foreground">Total em Dívidas</p>
            <p className="font-mono text-xl text-destructive">R$ {totalDebt.toLocaleString()}</p>
          </div>
          <div className="glass-card-gold px-4 py-2">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="font-mono text-xl text-secondary">R$ {totalPaid.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Boss Grid */}
      <div className="grid grid-cols-2 gap-6">
        {bosses.map((boss, index) => {
          const hpPercentage = (boss.currentHp / boss.totalHp) * 100;
          const isExpanded = expandedBoss === boss.id;

          return (
            <div 
              key={boss.id}
              className={cn(
                "boss-card transition-all duration-500 animate-fade-in",
                boss.defeated && "opacity-50 grayscale"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Boss Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    boss.defeated 
                      ? "bg-secondary/20" 
                      : "bg-destructive/20"
                  )}>
                    {boss.defeated ? (
                      <Crown className="w-7 h-7 text-secondary animate-float" />
                    ) : (
                      <Skull className="w-7 h-7 text-destructive" />
                    )}
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-serif text-xl",
                      boss.defeated ? "text-secondary line-through" : "text-foreground"
                    )}>
                      {boss.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{boss.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Shield className={cn("w-4 h-4", getPriorityColor(boss.priority))} />
                  <span className={cn("text-xs uppercase", getPriorityColor(boss.priority))}>
                    {boss.priority}
                  </span>
                </div>
              </div>

              {/* HP Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">HP</span>
                  <span className={boss.defeated ? "text-secondary" : "text-destructive"}>
                    R$ {boss.currentHp.toLocaleString()} / R$ {boss.totalHp.toLocaleString()}
                  </span>
                </div>
                <div className="progress-bar h-4">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      boss.defeated ? "progress-fill-gold" : "progress-fill-hp"
                    )} 
                    style={{ width: `${hpPercentage}%` }} 
                  />
                </div>
              </div>

              {/* Attack Controls */}
              {!boss.defeated && (
                <>
                  <button
                    onClick={() => setExpandedBoss(isExpanded ? null : boss.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Swords className="w-4 h-4" />
                    Atacar
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </button>

                  {isExpanded && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg animate-fade-in">
                      <p className="text-sm text-muted-foreground mb-3">Registrar pagamento:</p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setAttackAmount(a => Math.max(100, a - 100))}
                          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1 text-center">
                          <span className="font-mono text-xl">R$ {attackAmount.toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => setAttackAmount(a => a + 100)}
                          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => attackBoss(boss.id, attackAmount)}
                        className="w-full mt-4 py-3 rounded-lg bg-destructive hover:bg-destructive/80 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Swords className="w-5 h-5" />
                        ATACAR!
                      </button>
                    </div>
                  )}
                </>
              )}

              {boss.defeated && (
                <div className="text-center py-4">
                  <p className="text-secondary font-serif text-lg glow-gold">
                    ✦ DERROTADO ✦
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
