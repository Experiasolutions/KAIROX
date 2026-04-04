import { useState } from "react";
import { Sun, Sunset, Moon, CheckCircle2, Circle, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quest {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
}

interface QuestBlock {
  id: string;
  name: string;
  time: string;
  icon: typeof Sun;
  quests: Quest[];
}

const initialBlocks: QuestBlock[] = [
  {
    id: "morning",
    name: "Ritual do Despertar",
    time: "06:00 - 12:00",
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
    time: "13:00 - 18:00",
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
    time: "20:00 - 23:30",
    icon: Moon,
    quests: [
      { id: "n1", title: "Biblioteca da Sabedoria (2h estudo)", xpReward: 200, completed: false },
      { id: "n2", title: "Journaling de Gratidão", xpReward: 100, completed: false },
      { id: "n3", title: "Reset de Energia (Meditação noturna)", xpReward: 100, completed: false },
    ],
  },
];

export function DailyQuestTracker() {
  const [blocks, setBlocks] = useState<QuestBlock[]>(initialBlocks);
  const [streak, setStreak] = useState(0);

  const toggleQuest = (blockId: string, questId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          quests: block.quests.map(quest => {
            if (quest.id === questId) {
              return { ...quest, completed: !quest.completed };
            }
            return quest;
          }),
        };
      }
      return block;
    }));
  };

  const totalQuests = blocks.reduce((acc, block) => acc + block.quests.length, 0);
  const completedQuests = blocks.reduce((acc, block) => 
    acc + block.quests.filter(q => q.completed).length, 0);
  const dailyProgress = (completedQuests / totalQuests) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-secondary glow-gold">Daily Quests</h2>
          <p className="text-muted-foreground">Complete todas as missões para maximizar XP</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Streak */}
          <div className="flex items-center gap-2 glass-card px-4 py-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-mono text-lg">{streak} dias</span>
          </div>
          
          {/* Daily Progress */}
          <div className="w-48">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso Diário</span>
              <span className="text-secondary">{completedQuests}/{totalQuests}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill-gold" style={{ width: `${dailyProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quest Blocks */}
      <div className="grid grid-cols-3 gap-6">
        {blocks.map((block, blockIndex) => (
          <div 
            key={block.id} 
            className="glass-card p-6 animate-fade-in"
            style={{ animationDelay: `${blockIndex * 150}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <block.icon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-serif text-lg">{block.name}</h3>
                <p className="text-xs text-muted-foreground">{block.time}</p>
              </div>
            </div>

            <div className="space-y-3">
              {block.quests.map((quest) => (
                <button
                  key={quest.id}
                  onClick={() => toggleQuest(block.id, quest.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all duration-300",
                    quest.completed 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-muted/30 border-border hover:border-secondary/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {quest.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm",
                        quest.completed && "line-through text-muted-foreground"
                      )}>
                        {quest.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap className="w-3 h-3 text-purple-glow" />
                        <span className="text-xs text-purple-glow">+{quest.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
