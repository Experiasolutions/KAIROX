import { useState } from "react";
import { HubHeader } from "@/components/hub/HubHeader";
import { StellarHub } from "@/components/hub/StellarHub";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DailyQuestTracker } from "@/components/quests/DailyQuestTracker";
import { BossRoom } from "@/components/bosses/BossRoom";
import { LootShop } from "@/components/loot/LootShop";
import { Sanctuary } from "@/components/sanctuary/Sanctuary";
import { AgendaCalendar } from "@/components/agenda/AgendaCalendar";
import { SkillsPage } from "@/components/skills/SkillsPage";
import { QuestlinesPage } from "@/components/questlines/QuestlinesPage";

const sectionLabels: Record<string, string> = {
  hub: "Gabriel OS",
  dashboard: "Command Center",
  quests: "Daily Quests",
  questlines: "Questlines",
  skills: "Skill Tree",
  bosses: "Boss Room",
  loot: "Arsenal de Recompensas",
  sanctuary: "Santuário",
  agenda: "Agenda",
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("hub");
  const [expandedQuestline, setExpandedQuestline] = useState<string | null>(null);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  const handleBack = () => {
    setActiveSection("hub");
  };

  const handleQuestlineClick = (questlineId: string) => {
    setExpandedQuestline(questlineId);
    setActiveSection("questlines");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "hub":
        return <StellarHub onNavigate={handleNavigate} />;
      case "dashboard":
        return <Dashboard onQuestlineClick={handleQuestlineClick} />;
      case "agenda":
        return <AgendaCalendar />;
      case "quests":
        return <DailyQuestTracker />;
      case "questlines":
        return <QuestlinesPage expandedId={expandedQuestline} />;
      case "skills":
        return <SkillsPage />;
      case "bosses":
        return <BossRoom />;
      case "loot":
        return <LootShop />;
      case "sanctuary":
        return <Sanctuary />;
      default:
        return <StellarHub onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <HubHeader
        activeSection={activeSection}
        onBack={handleBack}
        sectionLabel={sectionLabels[activeSection]}
      />

      <main className="flex-1 p-6 overflow-auto">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
