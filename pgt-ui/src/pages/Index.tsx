import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DailyQuestTracker } from "@/components/quests/DailyQuestTracker";
import { BossRoom } from "@/components/bosses/BossRoom";
import { LootShop } from "@/components/loot/LootShop";
import { Sanctuary } from "@/components/sanctuary/Sanctuary";
import { AgendaCalendar } from "@/components/agenda/AgendaCalendar";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "agenda":
        return <AgendaCalendar />;
      case "quests":
        return <DailyQuestTracker />;
      case "bosses":
        return <BossRoom />;
      case "loot":
        return <LootShop />;
      case "sanctuary":
        return <Sanctuary />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 overflow-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Index;
