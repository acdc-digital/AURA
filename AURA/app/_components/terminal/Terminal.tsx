// TERMINAL COMPONENT - Main terminal interface with tabs and session management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/Terminal.tsx

"use client";

import React, { useEffect, useRef } from "react";
import { useTerminalStore } from "@/lib/store/terminal";
import { useTerminal } from "@/lib/hooks/useTerminal";
import { useConvexAuth } from "convex/react";
import { TerminalIcon, Mic } from "lucide-react";
import { AdvancedTerminalDisplay } from "./_components/AdvancedTerminalDisplay";
import { TerminalHeaderRow } from "./_components/TerminalHeaderRow";
import { useSessionSync } from "@/lib/hooks/useSessionSync";

export default function Terminal() {
  const {
    isCollapsed,
    toggleCollapse,
    activeTab,
    setActiveTab,
    activeTerminalId,
    isVoiceMode,
    toggleVoiceMode,
  } = useTerminalStore();
  
  const { terminals, createTerminal } = useTerminal();
  const { isAuthenticated } = useConvexAuth();

  // Track if we're already creating a terminal to prevent duplicates
  const creatingTerminalRef = useRef(false);

  // Initialize session sync once at the terminal level
  useSessionSync();

  // Ensure we always have a terminal when authenticated
  useEffect(() => {
    if (isAuthenticated && !creatingTerminalRef.current) {
      // If no active terminal or the active terminal doesn't exist, handle terminal creation/selection
      if (!activeTerminalId || !terminals.has(activeTerminalId)) {
        // Check if we have any terminals at all
        if (terminals.size === 0) {
          console.log("Creating initial terminal for authenticated user");
          creatingTerminalRef.current = true;
          try {
            createTerminal(undefined, "Chat");
            creatingTerminalRef.current = false;
          } catch (error) {
            console.error("Failed to create terminal:", error);
            creatingTerminalRef.current = false;
          }
        } else {
          // We have terminals but no active one selected, select the first one
          const firstTerminalId = Array.from(terminals.keys())[0];
          const { setActiveTerminal } = useTerminalStore.getState();
          setActiveTerminal(firstTerminalId);
          console.log("Set active terminal to:", firstTerminalId);
        }
      }
    }
  }, [isAuthenticated, terminals, createTerminal, activeTerminalId]);  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'terminal':
        if (!isAuthenticated) {
          return (
            <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
              <div className="text-xs text-[#858585]">Please sign in to use chat</div>
            </div>
          );
        }
        
        // If we have an active terminal ID and it exists, render it
        if (activeTerminalId && terminals.has(activeTerminalId)) {
          return <AdvancedTerminalDisplay terminalId={activeTerminalId} />;
        }
        
        // Loading state while terminal is being created
        return (
          <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
            <div className="text-xs text-[#858585]">Initializing terminal...</div>
          </div>
        );

      case 'history':
        return (
          <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
            <div className="text-xs text-[#858585]">History view coming soon...</div>
          </div>
        );

      case 'alerts':
        return (
          <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
            <div className="text-xs text-[#858585]">Alerts view coming soon...</div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
            <div className="text-xs text-[#858585]">Settings view coming soon...</div>
          </div>
        );

      default:
        return (
          <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
            <div className="text-xs text-[#858585]">Select a tab to begin</div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col ${isCollapsed ? 'h-[35px]' : 'h-full'}`}>
      {isCollapsed ? (
        // Collapsed view - just header with expand functionality
        <div className="h-[35px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 rounded-tl-lg">
          <div className="flex items-center h-full">
            <button
              className="text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center bg-transparent text-white rounded-tl-lg hover:bg-[#ffffff20] hover:rounded-tl-lg cursor-pointer"
              onClick={() => {
                if (!isAuthenticated) return;
                toggleCollapse();
                setActiveTab("terminal");
              }}
              title="Expand Terminal"
            >
              <TerminalIcon className="w-3 h-3 mr-1" />
              Terminal
            </button>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Microphone button */}
            <button
              className="h-[25px] px-2 text-white bg-transparent border border-[#cccccc40] hover:bg-[#ffffff20] rounded flex items-center justify-center text-xs transition-colors duration-150"
              onClick={() => {
                toggleVoiceMode();
              }}
              title={isVoiceMode ? "Exit Voice Mode" : "Voice Input Mode"}
            >
              <Mic className={`w-3 h-3 ${isVoiceMode ? 'text-[#0ea5e9]' : ''}`} />
            </button>
            
            {/* Expand button */}
            <button
              className="h-[25px] px-2 text-white bg-transparent border border-[#cccccc40] hover:bg-[#ffffff20] rounded flex items-center justify-center mr-2 text-xs transition-colors duration-150"
              onClick={toggleCollapse}
              title="Expand Terminal"
            >
              +
            </button>
          </div>
        </div>
      ) : (
        // Expanded view - full terminal interface
        <>
          {/* Always use TerminalHeaderRow when expanded */}
          <TerminalHeaderRow />

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {renderActiveTabContent()}
          </div>
        </>
      )}
    </div>
  );
}
