import { useState, useEffect } from "react";
import { Sun, Sunset, Moon, CheckCircle2, Circle, Zap, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quest {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
}

interface TimePeriod {
  id: string;
  name: string;
  timeRange: string;
  icon: typeof Sun;
  quests: Quest[];
}

const timePeriods: TimePeriod[] = [
  {
    id: "morning",
    name: "Ritual do Despertar",
    timeRange: "06:00 - 12:00",
    icon: Sun,
    quests: [
      { id: "m1", title: "Holy Triad (Meditação + Journaling + Exercício)", xpReward: 150, completed: false },
      { id: "m2", title: "Hydration Check (2L água)", xpReward: 50, completed: false },
      { id: "m3", title: "Raid de Prospecção (8 contatos)", xpReward: 200, completed: false },
    ],
  },
  {
    id: "afternoon",
    name: "Arena de Conversão",
    timeRange: "13:00 - 18:00",
    icon: Sunset,
    quests: [
      { id: "a1", title: "Call de Fechamento (1x)", xpReward: 300, completed: false },
      { id: "a2", title: "Follow-up de Leads (5x)", xpReward: 100, completed: false },
      { id: "a3", title: "Laboratório Hot IA (1h)", xpReward: 150, completed: false },
    ],
  },
  {
    id: "night",
    name: "Santuário",
    timeRange: "20:00 - 23:30",
    icon: Moon,
    quests: [
      { id: "n1", title: "Biblioteca da Sabedoria (2h estudo)", xpReward: 200, completed: false },
      { id: "n2", title: "Journaling de Gratidão", xpReward: 100, completed: false },
      { id: "n3", title: "Reset de Energia (Meditação noturna)", xpReward: 100, completed: false },
    ],
  },
];

function getCurrentPeriod(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 13 && hour < 18) return "afternoon";
  if (hour >= 20 || hour < 6) return "night";
  return "morning"; // Default
}

export function CurrentQuestPanel() {
  const [periods, setPeriods] = useState<TimePeriod[]>(timePeriods);
  const [currentPeriodId, setCurrentPeriodId] = useState(getCurrentPeriod());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPeriodId(getCurrentPeriod());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const currentPeriod = periods.find(p => p.id === currentPeriodId) || periods[0];
  const completedCount = currentPeriod.quests.filter(q => q.completed).length;
  const totalXp = currentPeriod.quests.reduce((acc, q) => acc + (q.completed ? q.xpReward : 0), 0);
  const maxXp = currentPeriod.quests.reduce((acc, q) => acc + q.xpReward, 0);

  const toggleQuest = (questId: string) => {
    setPeriods(prev => prev.map(period => {
      if (period.id === currentPeriodId) {
        return {
          ...period,
          quests: period.quests.map(quest => 
            quest.id === questId ? { ...quest, completed: !quest.completed } : quest
          ),
        };
      }
      return period;
    }));
  };

  const PeriodIcon = currentPeriod.icon;

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <PeriodIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-neon-magenta" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Período Atual
              </span>
            </div>
            <h2 className="font-display text-2xl text-primary glow-cyan uppercase tracking-wide">
              {currentPeriod.name}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{currentPeriod.timeRange}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-4 h-4 text-neon-purple" />
            <span className="font-mono text-neon-purple">{totalXp}/{maxXp} XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground font-mono">PROGRESSO DO PERÍODO</span>
          <span className="text-primary font-mono">{completedCount}/{currentPeriod.quests.length}</span>
        </div>
        <div className="progress-bar h-3">
          <div 
            className="progress-fill-cyan" 
            style={{ width: `${(completedCount / currentPeriod.quests.length) * 100}%` }} 
          />
        </div>
      </div>

      {/* Quest Checklist */}
      <div className="space-y-3">
        {currentPeriod.quests.map((quest, index) => (
          <button
            key={quest.id}
            onClick={() => toggleQuest(quest.id)}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all duration-300 group",
              quest.completed 
                ? "bg-neon-green/10 border-neon-green/30" 
                : "bg-muted/30 border-border hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                quest.completed 
                  ? "border-neon-green bg-neon-green/20" 
                  : "border-muted-foreground group-hover:border-primary"
              )}>
                {quest.completed && <CheckCircle2 className="w-4 h-4 text-neon-green" />}
              </div>
              
              <div className="flex-1">
                <p className={cn(
                  "font-medium transition-all",
                  quest.completed && "line-through text-muted-foreground"
                )}>
                  {quest.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3 text-neon-purple" />
                  <span className="text-xs text-neon-purple font-mono">+{quest.xpReward} XP</span>
                </div>
              </div>

              <span className={cn(
                "text-xs font-mono px-2 py-1 rounded",
                quest.completed 
                  ? "bg-neon-green/20 text-neon-green" 
                  : "bg-muted text-muted-foreground"
              )}>
                {quest.completed ? "DONE" : `#${index + 1}`}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Period Indicators */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
        {periods.map(period => {
          const Icon = period.icon;
          const isActive = period.id === currentPeriodId;
          const periodComplete = period.quests.filter(q => q.completed).length;
          
          return (
            <button
              key={period.id}
              onClick={() => setCurrentPeriodId(period.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                isActive 
                  ? "bg-primary/20 border border-primary/50" 
                  : "bg-muted/30 border border-transparent hover:border-border"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "font-mono text-sm",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {periodComplete}/{period.quests.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
