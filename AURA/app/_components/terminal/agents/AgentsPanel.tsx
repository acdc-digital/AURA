// AGENTS PANEL - Agent management placeholder
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/agents/AgentsPanel.tsx

"use client";

import { cn } from "@/lib/utils";

interface AgentsPanelProps {
  className?: string;
}

export function AgentsPanel({ className }: AgentsPanelProps) {
  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex items-center justify-center", className)}>
      <div className="text-xs text-[#858585]">Agents panel coming soon...</div>
    </div>
  );
}
