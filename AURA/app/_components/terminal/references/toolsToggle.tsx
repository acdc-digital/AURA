// Terminal Tools Toggle Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/toolsToggle.tsx

"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ToolsToggleProps {
  mode: 'mcp' | 'agents';
  onModeChange: (mode: 'mcp' | 'agents') => void;
  className?: string;
}

export function ToolsToggle({ mode, onModeChange, className }: ToolsToggleProps) {
  return (
    <div className={cn("flex items-center bg-[#1a1a1a] border border-[#333] rounded-md", className)}>
      {/* Left Arrow */}
      <button
        onClick={() => onModeChange(mode === 'mcp' ? 'agents' : 'mcp')}
        className="p-1 hover:bg-[#2a2a2a] rounded-l-md transition-colors"
        aria-label="Previous mode"
      >
        <ChevronLeft className="w-3 h-3 text-[#858585]" />
      </button>

      {/* MCP Toggle Button */}
      <button
        onClick={() => onModeChange('mcp')}
        className={cn(
          "px-3 py-1 text-xs font-medium transition-colors border-r border-[#333]",
          mode === 'mcp'
            ? "bg-[#007acc] text-white"
            : "text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2a2a]"
        )}
      >
        MCP Tools
      </button>

      {/* Agents Toggle Button */}
      <button
        onClick={() => onModeChange('agents')}
        className={cn(
          "px-3 py-1 text-xs font-medium transition-colors",
          mode === 'agents'
            ? "bg-[#007acc] text-white"
            : "text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2a2a]"
        )}
      >
        Agent Tools
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => onModeChange(mode === 'mcp' ? 'agents' : 'mcp')}
        className="p-1 hover:bg-[#2a2a2a] rounded-r-md transition-colors"
        aria-label="Next mode"
      >
        <ChevronRight className="w-3 h-3 text-[#858585]" />
      </button>
    </div>
  );
}
