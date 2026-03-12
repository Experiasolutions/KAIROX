import { 
  LayoutDashboard, 
  Swords, 
  CalendarDays, 
  ShoppingBag, 
  Sparkles,
  Hexagon,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Command Center" },
  { id: "agenda", icon: Calendar, label: "Agenda" },
  { id: "quests", icon: CalendarDays, label: "Questlines" },
  { id: "bosses", icon: Swords, label: "Boss Room" },
  { id: "loot", icon: ShoppingBag, label: "Loot Shop" },
  { id: "sanctuary", icon: Sparkles, label: "Santuário" },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-20 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-2 relative">
      {/* Decorative line */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/50 via-transparent to-primary/50" />
      
      {/* Logo */}
      <div className="mb-8 p-3 relative">
        <Hexagon className="w-10 h-10 text-primary glow-cyan" />
        <div className="absolute inset-0 bg-primary/10 blur-xl" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "icon-btn group relative",
              activeSection === item.id && "icon-btn-active"
            )}
            title={item.label}
          >
            <item.icon className="w-6 h-6" />
            
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-3 py-2 bg-card/95 backdrop-blur-xl rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-primary/30 z-50 text-primary">
              {item.label}
            </span>

            {/* Active indicator */}
            {activeSection === item.id && (
              <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Version Badge */}
      <div className="text-xs text-primary/60 font-mono">
        v2.0
      </div>
    </aside>
  );
}
