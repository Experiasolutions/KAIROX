import { Lock, Unlock, ShoppingBag, Gem, Laptop, Home, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LootItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  requiredLevel: number;
  requirement: string;
  category: "upgrade" | "reward" | "style";
  icon: typeof Gem;
  unlocked: boolean;
}

const lootItems: LootItem[] = [
  {
    id: "l1",
    name: "Cadeira Gamer Pro",
    description: "Upgrade de conforto para longas sessões",
    cost: 1500,
    requiredLevel: 8,
    requirement: "1ª Recorrência Ativa",
    category: "upgrade",
    icon: Laptop,
    unlocked: false,
  },
  {
    id: "l2",
    name: "Tattoo Nova",
    description: "Marca de vitória permanente",
    cost: 800,
    requiredLevel: 10,
    requirement: "R$ 10k em dívidas quitadas",
    category: "style",
    icon: Sparkles,
    unlocked: false,
  },
  {
    id: "l3",
    name: "Reforma Cozinha",
    description: "Upgrade do Castelo - Fase 1",
    cost: 3000,
    requiredLevel: 12,
    requirement: "Boss SERASA derrotado",
    category: "upgrade",
    icon: Home,
    unlocked: false,
  },
  {
    id: "l4",
    name: "Academia MMA",
    description: "Buff de Força e Disciplina",
    cost: 250,
    requiredLevel: 15,
    requirement: "Faturamento R$ 15k/mês",
    category: "reward",
    icon: Dumbbell,
    unlocked: false,
  },
  {
    id: "l5",
    name: "Notebook High-End",
    description: "Arma lendária de produtividade",
    cost: 8000,
    requiredLevel: 20,
    requirement: "3 Recorrências Ativas",
    category: "upgrade",
    icon: Laptop,
    unlocked: false,
  },
  {
    id: "l6",
    name: "Premium Quality Herbs",
    description: "Recompensa de final de semana",
    cost: 150,
    requiredLevel: 7,
    requirement: "100% Daily Quests na semana",
    category: "reward",
    icon: Gem,
    unlocked: true,
  },
];

const categoryColors = {
  upgrade: "from-blue-500/20 to-blue-600/5",
  reward: "from-green-500/20 to-green-600/5",
  style: "from-purple-500/20 to-purple-600/5",
};

export function LootShop() {
  const currentGold = 8750;
  const currentLevel = 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-secondary glow-gold flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Loot Shop
          </h2>
          <p className="text-muted-foreground">Invista seu Gold em upgrades e recompensas</p>
        </div>

        <div className="glass-card-gold px-6 py-3">
          <p className="text-xs text-muted-foreground">Saldo Disponível</p>
          <p className="font-mono text-2xl text-secondary">R$ {currentGold.toLocaleString()}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4">
        {["Todos", "Upgrades", "Recompensas", "Estilo"].map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-3 gap-6">
        {lootItems.map((item, index) => {
          const canAfford = currentGold >= item.cost;
          const meetsLevel = currentLevel >= item.requiredLevel;
          const available = item.unlocked && canAfford && meetsLevel;

          return (
            <div
              key={item.id}
              className={cn(
                "relative overflow-hidden rounded-xl border transition-all duration-300 animate-fade-in",
                available 
                  ? "loot-item-unlocked cursor-pointer hover:scale-[1.02]" 
                  : "loot-item-locked"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br",
                categoryColors[item.category]
              )} />

              <div className="relative p-6">
                {/* Lock Status */}
                <div className="absolute top-4 right-4">
                  {available ? (
                    <Unlock className="w-5 h-5 text-secondary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-card/80 flex items-center justify-center mb-4 mx-auto">
                  <item.icon className={cn(
                    "w-8 h-8",
                    available ? "text-secondary" : "text-muted-foreground"
                  )} />
                </div>

                {/* Info */}
                <h3 className={cn(
                  "font-serif text-lg text-center mb-1",
                  available ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {item.description}
                </p>

                {/* Price */}
                <div className="text-center mb-4">
                  <span className={cn(
                    "font-mono text-xl",
                    canAfford ? "text-secondary" : "text-destructive"
                  )}>
                    R$ {item.cost.toLocaleString()}
                  </span>
                </div>

                {/* Requirements */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Nível</span>
                    <span className={meetsLevel ? "text-green-400" : "text-destructive"}>
                      {item.requiredLevel}
                    </span>
                  </div>
                  <div className="px-3 py-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">{item.requirement}</span>
                  </div>
                </div>

                {/* Buy Button */}
                {available && (
                  <button className="w-full mt-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors">
                    Adquirir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
