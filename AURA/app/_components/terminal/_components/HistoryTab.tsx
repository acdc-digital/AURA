// HISTORY TAB - Terminal command history
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/HistoryTab.tsx

"use client";

export function HistoryTab() {
  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* History header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#1f1f1f] flex-shrink-0">
        <div className="text-xs text-[#cccccc]">Command History</div>
        <button
          className="text-[10px] px-2 py-1 rounded border border-[#2d2d2d] text-[#6a6a6a] opacity-60 cursor-not-allowed"
          disabled
        >
          Clear
        </button>
      </div>
      
      {/* History content */}
      <div className="flex-1 p-2 overflow-auto">
        <div className="text-xs text-[#858585]">
          No command history available.
        </div>
      </div>
    </div>
  );
}
