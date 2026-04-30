import { Lock, Unlock, ShoppingBag, Gem, Laptop, Home, Dumbbell, Sparkles, Smartphone, Shirt, Coffee, Wrench, Wifi, Monitor, Headphones, Globe, Gamepad2, GraduationCap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LootItem {
  id: string;
  name: string;
  description: string;
  currency: "REAL" | "GEMS" | "SEEDS" | "XP";
  cost: number;
  requirement: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  category: "work" | "castle" | "personal" | "dopamine" | "utility";
  icon: typeof Gem;
  unlocked: boolean;
}

const lootItems: LootItem[] = [
  // UTILITY — Custo zero, só disposição
  {
    id: "u1",
    name: "Consertar Registro do Chuveiro",
    description: "Fechar água da casa, trocar registro, parar o vazamento",
    currency: "XP",
    cost: 200,
    requirement: "5 dias de streak + dedicar 1 tarde",
    tier: 1,
    category: "utility",
    icon: Wrench,
    unlocked: false,
  },
  {
    id: "u2",
    name: "Desmontar Guarda-Roupa Amarelo",
    description: "Jogar fora, instalar o marrom do escritório. Ambiente melhorado.",
    currency: "XP",
    cost: 150,
    requirement: "1 dia livre + disposição",
    tier: 1,
    category: "utility",
    icon: Home,
    unlocked: false,
  },
  {
    id: "u3",
    name: "Doar Roupas da Mãe",
    description: "Sacolas para brechós locais. Processo de cura e espaço.",
    currency: "XP",
    cost: 100,
    requirement: "Qualquer tarde livre",
    tier: 1,
    category: "utility",
    icon: Shirt,
    unlocked: false, // Ainda não feito
  },
  // PERSONAL TIER 1 — Primeiros R$
  {
    id: "p1",
    name: "Skincare & Higiene Upgrade",
    description: "Produtos de cuidado pessoal básicos",
    currency: "REAL",
    cost: 200,
    requirement: "1ª semana de missões completas",
    tier: 1,
    category: "personal",
    icon: Sparkles,
    unlocked: false,
  },
  {
    id: "p2",
    name: "Roupa Nova",
    description: "Peças básicas — camisas, calça, bermuda que presta",
    currency: "REAL",
    cost: 300,
    requirement: "2 semanas consecutivas de missões",
    tier: 2,
    category: "personal",
    icon: Shirt,
    unlocked: false,
  },
  // WORK TIER
  {
    id: "w1",
    name: "Cartão Físico (Banco sem dívida)",
    description: "Solicitar cartão no banco onde não tem dívidas. Mobilidade financeira.",
    currency: "XP",
    cost: 50,
    requirement: "Fazer 1 visita presencial ao banco",
    tier: 1,
    category: "work",
    icon: Gem,
    unlocked: true, // Pode fazer agora!
  },
  {
    id: "w2",
    name: "Cadeira de Trabalho Decente",
    description: "Upgrade de ergonomia para as longas sessões de RAID",
    currency: "REAL",
    cost: 800,
    requirement: "1ª recorrência ativa (R$500+ MRR)",
    tier: 2,
    category: "work",
    icon: Laptop,
    unlocked: false,
  },
  {
    id: "w3",
    name: "Internet Móvel (Celular)",
    description: "Chip com dados. Mobilidade = mais oportunidades.",
    currency: "REAL",
    cost: 50,
    requirement: "Celular consertado + R$50 disponível",
    tier: 1,
    category: "work",
    icon: Smartphone,
    unlocked: false,
  },
  {
    id: "w4",
    name: "Notebook High-End",
    description: "Arma lendária. Fim das limitações de hardware.",
    currency: "REAL",
    cost: 5000,
    requirement: "3 recorrências ativas (R$3K+ MRR)",
    tier: 4,
    category: "work",
    icon: Laptop,
    unlocked: false,
  },
  // DOPAMINE — Recompensas de prazer (custo alto em GEMS para evitar acesso fácil)
  {
    id: "d1",
    name: "Dopamina Controlada (Fim de semana)",
    description: "Prêmio por 100% das missões semanais. Merece.",
    currency: "GEMS",
    cost: 500,
    requirement: "100% das daily quests nos 7 dias da semana",
    tier: 3,
    category: "dopamine",
    icon: Coffee,
    unlocked: false,
  },
  {
    id: "d2",
    name: "Academia MMA",
    description: "Buff de Força + Disciplina + saúde. Investimento de longo prazo.",
    currency: "REAL",
    cost: 250,
    requirement: "Faturamento >R$2K/mês por 2 meses",
    tier: 4,
    category: "personal",
    icon: Dumbbell,
    unlocked: false,
  },
  // CASTLE
  {
    id: "c1",
    name: "Dedetização Profissional",
    description: "Acabar com as baratas da cozinha de uma vez por todas",
    currency: "REAL",
    cost: 300,
    requirement: "R$300 disponível + agendar o serviço",
    tier: 2,
    category: "castle",
    icon: Home,
    unlocked: false,
  },
  {
    id: "c2",
    name: "Reforma da Cozinha (Fase 1)",
    description: "Azulejo + bancada. O Castelo começa a ser reconstruído.",
    currency: "REAL",
    cost: 3000,
    requirement: "Boss SERASA derrotado + R$3K reservado",
    tier: 4,
    category: "castle",
    icon: Home,
    unlocked: false,
  },
  // ═══ NOVOS ITENS ═══
  {
    id: "n1",
    name: "Internet Fibra Upgrade",
    description: "Conexão estável para trabalho sério. Sem cair no meio de call.",
    currency: "REAL",
    cost: 150,
    requirement: "R$150/mês disponível + dono pesquisado",
    tier: 2,
    category: "work",
    icon: Wifi,
    unlocked: false,
  },
  {
    id: "n2",
    name: "Mesa de Trabalho Nova",
    description: "Superfície decente para o setup. Fim da gambiarra.",
    currency: "REAL",
    cost: 600,
    requirement: "2ª recorrência ativa (R$1K+ MRR)",
    tier: 3,
    category: "work",
    icon: Monitor,
    unlocked: false,
  },
  {
    id: "n3",
    name: "Headset / Microfone Pro",
    description: "Buff de Voz. Para gravações, calls, narrações da Experia.",
    currency: "REAL",
    cost: 400,
    requirement: "Skill 'Voz' nível 2+ desbloqueada",
    tier: 3,
    category: "work",
    icon: Headphones,
    unlocked: false,
  },
  {
    id: "n4",
    name: "Domínio + Hospedagem Experia",
    description: "experia.com.br — presença digital oficial. Profissionalismo instantâneo.",
    currency: "REAL",
    cost: 100,
    requirement: "Landing Page v1 pronta + R$100 disponível",
    tier: 1,
    category: "work",
    icon: Globe,
    unlocked: false,
  },
  {
    id: "n5",
    name: "Escape Room / Experiência",
    description: "Recompensa imersiva. Saída da rotina, dopamina controlada.",
    currency: "GEMS",
    cost: 800,
    requirement: "Streak de 14 dias + 800 GEMS acumulados",
    tier: 4,
    category: "dopamine",
    icon: Gamepad2,
    unlocked: false,
  },
  {
    id: "n6",
    name: "Curso Online Premium",
    description: "Investimento em conhecimento selecionado. Alan Nicolas, Hormozi, etc.",
    currency: "SEEDS",
    cost: 300,
    requirement: "20 SEEDS acumulados + área de estudo definida",
    tier: 3,
    category: "personal",
    icon: GraduationCap,
    unlocked: false,
  },
  {
    id: "n7",
    name: "Dia de Folga Sem Culpa",
    description: "24h de zero obrigações. Só prazer. Merecido.",
    currency: "GEMS",
    cost: 1000,
    requirement: "100% das dailies por 14 dias consecutivos",
    tier: 5,
    category: "dopamine",
    icon: Coffee,
    unlocked: false,
  },
];

const categoryColors: Record<string, string> = {
  work: "from-blue-500/20 to-blue-600/5",
  castle: "from-orange-500/20 to-orange-600/5",
  personal: "from-purple-500/20 to-purple-600/5",
  dopamine: "from-red-500/10 to-red-600/5",
  utility: "from-green-500/20 to-green-600/5",
};

const categoryLabels: Record<string, string> = {
  work: "⚙️ Trabalho",
  castle: "🏠 Castelo",
  personal: "🧍 Pessoal",
  dopamine: "🔥 Dopamina",
  utility: "🔧 Utilidade",
};

const currencyColors: Record<string, string> = {
  REAL: "text-green-400",
  GEMS: "text-blue-400",
  SEEDS: "text-yellow-400",
  XP: "text-purple-400",
};

type FilterCat = "all" | "work" | "castle" | "personal" | "dopamine" | "utility";

export function LootShop() {
  const [filter, setFilter] = useState<FilterCat>("all");

  const filtered = lootItems.filter(i => filter === "all" || i.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-secondary glow-gold flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Arsenal de Recompensas
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Cada item custa realização — não dinheiro fácil</p>
        </div>
      </div>

      {/* Currency Legend */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(currencyColors).map(([cur, color]) => (
          <div key={cur} className="flex items-center gap-1 text-xs font-mono">
            <Gem className={cn("w-3 h-3", color)} />
            <span className={color}>{cur}</span>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "work", "castle", "personal", "dopamine", "utility"] as FilterCat[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono transition-all",
              filter === f
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
          >
            {f === "all" ? "Todos" : categoryLabels[f]}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((item, index) => {
          const Icon = item.icon;
          const curColor = currencyColors[item.currency];

          return (
            <div
              key={item.id}
              className={cn(
                "relative overflow-hidden rounded-xl border transition-all duration-300 animate-fade-in",
                item.unlocked
                  ? "loot-item-unlocked cursor-pointer hover:scale-[1.02]"
                  : "loot-item-locked"
              )}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Background Gradient */}
              <div className={cn("absolute inset-0 bg-gradient-to-br", categoryColors[item.category])} />

              <div className="relative p-5">
                {/* Lock Status */}
                <div className="absolute top-3 right-3">
                  {item.unlocked ? (
                    <Unlock className="w-4 h-4 text-secondary" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-card/80 flex items-center justify-center mb-3 mx-auto">
                  <Icon className={cn("w-6 h-6", item.unlocked ? "text-secondary" : "text-muted-foreground")} />
                </div>

                {/* Tier Badge */}
                <div className="flex justify-center mb-2">
                  <span className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">TIER {item.tier}</span>
                </div>

                {/* Info */}
                <h3 className={cn(
                  "font-serif text-sm text-center mb-1 leading-tight",
                  item.unlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Cost */}
                <div className="text-center mb-3">
                  <span className={cn("font-mono text-lg font-bold", curColor)}>
                    {item.cost.toLocaleString("pt-BR")} {item.currency}
                  </span>
                </div>

                {/* Requirement */}
                <div className="px-2 py-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">{item.requirement}</p>
                </div>

                {/* Unlock button */}
                {item.unlocked && (
                  <button className="w-full mt-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/90 transition-colors">
                    Resgatar
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
