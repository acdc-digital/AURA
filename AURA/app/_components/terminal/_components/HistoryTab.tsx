// HISTORY TAB - Enhanced terminal command history display
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/HistoryTab.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";
import { useConvexAuth } from "convex/react";
import { Clock, Copy, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

export function HistoryTab() {
  const { isAuthenticated } = useConvexAuth();
  const { commandHistory, clearHistory } = useTerminalStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCommand = useCallback(async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Clear copied state after 2 seconds
    } catch (error) {
      console.error('Failed to copy command:', error);
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the command history?')) {
      clearHistory();
    }
  }, [clearHistory]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-xs text-[#858585]">Please sign in to view command history</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#cccccc]" />
          <span className="text-xs text-[#cccccc] font-medium">Command History</span>
          <span className="text-xs text-[#858585]">({commandHistory.length} commands)</span>
        </div>
        
        {commandHistory.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-[#858585] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* History list */}
      <div className="flex-1 overflow-auto">
        {commandHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-xs text-[#858585]">
              <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div>No commands in history</div>
              <div className="mt-1">Start typing commands in the terminal</div>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {commandHistory.map((command, index) => (
              <div
                key={`${index}-${command}`}
                className="group flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-[#ffffff08] transition-colors"
              >
                {/* Command number */}
                <div className="text-xs text-[#858585] font-mono w-12 text-right">
                  {index + 1}
                </div>

                {/* Command text */}
                <div className="flex-1 text-xs text-[#cccccc] font-mono break-all">
                  {command}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyCommand(command, index)}
                    className="flex items-center justify-center w-6 h-6 hover:bg-[#ffffff20] rounded transition-colors"
                    title="Copy Command"
                  >
                    {copiedIndex === index ? (
                      <span className="text-xs text-green-400">✓</span>
                    ) : (
                      <Copy className="w-3 h-3 text-[#858585]" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      {commandHistory.length > 0 && (
        <div className="px-3 py-2 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-[#858585] bg-[#1a1a1a] flex-shrink-0">
          <div>
            Total: {commandHistory.length} commands
          </div>
          <div>
            Use ↑↓ in terminal to navigate history
          </div>
        </div>
      )}
    </div>
  );
}
