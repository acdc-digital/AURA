// EXTENSIONS PANEL - Extensions management placeholder
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/extensions/ExtensionsPanel.tsx

"use client";

import { cn } from "@/lib/utils";

interface ExtensionsPanelProps {
  className?: string;
}

export function ExtensionsPanel({ className }: ExtensionsPanelProps) {
  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex items-center justify-center", className)}>
      <div className="text-xs text-[#858585]">Extensions panel coming soon...</div>
    </div>
  );
}
