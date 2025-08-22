// HISTORY TAB - Command history display and management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/history/HistoryDisplay.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";

export function HistoryDisplay() {
  const { commandHistory } = useTerminalStore();

  return (
    <div className="flex-1 bg-[#0e0e0e] p-3">
      <div className="text-xs text-white mb-3">Command History</div>
      {commandHistory.length === 0 ? (
        <div className="text-xs text-[#858585]">No command history available</div>
      ) : (
        <div className="space-y-1 max-h-full overflow-y-auto">
          {commandHistory.map((command, index) => (
            <div
              key={index}
              className="text-xs text-[#cccccc] hover:bg-[#ffffff10] p-1 rounded cursor-pointer"
              title="Click to copy command"
              onClick={() => {
                navigator.clipboard.writeText(command);
              }}
            >
              <span className="text-[#858585] mr-2">{index + 1}:</span>
              {command}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
