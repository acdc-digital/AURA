// TERMINAL HEADER ROW - Multi-terminal tab management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/TerminalHeaderRow.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";
import { useConvexAuth } from "convex/react";
import { Loader2, Plus, X } from "lucide-react";
import { useCallback } from "react";

export function TerminalHeaderRow() {
  const { isAuthenticated } = useConvexAuth();
  const {
    terminals,
    activeTerminalId,
    isProcessing,
    createTerminal,
    removeTerminal,
    setActiveTerminal,
  } = useTerminalStore();

  const handleCreateTerminal = useCallback(() => {
    if (!isAuthenticated) return;
    createTerminal();
  }, [isAuthenticated, createTerminal]);

  const handleCloseTerminal = useCallback((terminalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    removeTerminal(terminalId);
  }, [isAuthenticated, removeTerminal]);

  const handleSwitchTerminal = useCallback((terminalId: string) => {
    if (!isAuthenticated) return;
    setActiveTerminal(terminalId);
  }, [isAuthenticated, setActiveTerminal]);

  const terminalArray = Array.from(terminals.entries());

  return (
    <div className="h-[35px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 rounded-t-sm">
      {/* Terminal tabs */}
      <div className="flex items-center h-full overflow-x-auto">
        {terminalArray.map(([id, terminal]) => (
          <div
            key={id}
            className={`flex items-center h-[35px] px-3 min-w-[120px] max-w-[200px] border-r border-[#ffffff10] cursor-pointer ${
              activeTerminalId === id 
                ? 'bg-[#094771] text-white' 
                : 'bg-transparent text-white hover:bg-[#ffffff20]'
            } ${!isAuthenticated ? 'opacity-60 cursor-default' : ''}`}
            onClick={() => handleSwitchTerminal(id)}
            title={terminal.title}
          >
            {/* Terminal status indicator */}
            <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
              terminal.isProcessing 
                ? 'bg-[#fbbf24]' 
                : terminal.process.status === 'idle' 
                  ? 'bg-[#22c55e]' 
                  : 'bg-[#ef4444]'
            }`} />
            
            {/* Terminal title */}
            <span className="text-xs truncate flex-1">{terminal.title}</span>
            
            {/* Processing indicator */}
            {terminal.isProcessing && (
              <Loader2 className="w-3 h-3 ml-1 animate-spin" />
            )}
            
            {/* Close button */}
            {terminalArray.length > 1 && (
              <button
                className="ml-2 p-0.5 hover:bg-[#ffffff30] rounded transition-colors"
                onClick={(e) => handleCloseTerminal(id, e)}
                title="Close terminal"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        {/* Add new terminal button */}
        <button
          className={`h-[35px] px-3 flex items-center justify-center text-white transition-colors ${
            isAuthenticated 
              ? 'hover:bg-[#ffffff20] cursor-pointer' 
              : 'opacity-60 cursor-default'
          }`}
          onClick={handleCreateTerminal}
          disabled={!isAuthenticated}
          title={isAuthenticated ? "New Terminal" : "Sign in to create terminals"}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      {/* Global status */}
      <div className="flex items-center space-x-2 px-3 text-xs text-white">
        {isProcessing && (
          <div className="flex items-center space-x-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
        <span>{terminalArray.length} terminal{terminalArray.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}
