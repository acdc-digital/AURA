// TERMINAL HEADER ROW - Multi-terminal tab management with navigation buttons
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/TerminalHeaderRow.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";
import { useConvexAuth } from "convex/react";
import { Bell, History, Loader2, Settings, Terminal as TerminalIcon } from "lucide-react";

export function TerminalHeaderRow() {
  const { isAuthenticated } = useConvexAuth();
  const {
    isProcessing,
    activeTab,
    setActiveTab,
    alerts,
    toggleCollapse,
  } = useTerminalStore();

  return (
    <div className="h-[35px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 rounded-tl-lg">
      {/* Left side - Tab buttons and terminal tabs */}
      <div className="flex items-center h-full overflow-x-auto">
        {/* Navigation Tab Buttons */}
        <div className="flex items-center h-full border-r border-[#ffffff20] pr-2">
          <button
            className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center ${
              activeTab === 'terminal'
                ? 'bg-[#094771] text-white rounded-tl-lg'
                : 'bg-transparent text-white'
            } ${
              isAuthenticated
                ? 'hover:bg-[#ffffff20] hover:rounded-tl-lg cursor-pointer'
                : 'opacity-60 cursor-default'
            }`}
            onClick={() => {
              if (!isAuthenticated) return;
              if (activeTab === 'terminal') {
                // If terminal tab is already active, collapse the terminal
                toggleCollapse();
              } else {
                // If not active, switch to terminal tab
                setActiveTab("terminal");
              }
            }}
            disabled={!isAuthenticated}
            title={isAuthenticated ? (activeTab === 'terminal' ? "Collapse Terminal" : "Terminal") : ""}
          >
            <TerminalIcon className="w-3 h-3 mr-1" />
            Terminal
          </button>

          <button
            className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center ${
              activeTab === 'history'
                ? 'bg-[#094771] text-white'
                : 'bg-transparent text-white'
            } ${
              isAuthenticated
                ? 'hover:bg-[#ffffff20] cursor-pointer'
                : 'opacity-60 cursor-default'
            }`}
            onClick={() => {
              if (!isAuthenticated) return;
              setActiveTab("history");
            }}
            disabled={!isAuthenticated}
            title={isAuthenticated ? "Command History" : ""}
          >
            <History className="w-3 h-3 mr-1" />
            History
          </button>

          <button
            className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center relative ${
              activeTab === 'alerts'
                ? 'bg-[#094771] text-white'
                : 'bg-transparent text-white'
            } ${
              isAuthenticated
                ? 'hover:bg-[#ffffff20] cursor-pointer'
                : 'opacity-60 cursor-default'
            }`}
            onClick={() => {
              if (!isAuthenticated) return;
              setActiveTab("alerts");
            }}
            disabled={!isAuthenticated}
            title={isAuthenticated ? "Alerts" : ""}
          >
            <Bell className="w-3 h-3 mr-1" />
            Alerts
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {alerts.length > 9 ? '9+' : alerts.length}
              </span>
            )}
          </button>

          <button
            className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center ${
              activeTab === 'settings'
                ? 'bg-[#094771] text-white'
                : 'bg-transparent text-white'
            } ${
              isAuthenticated
                ? 'hover:bg-[#ffffff20] cursor-pointer'
                : 'opacity-60 cursor-default'
            }`}
            onClick={() => {
              if (!isAuthenticated) return;
              setActiveTab("settings");
            }}
            disabled={!isAuthenticated}
            title={isAuthenticated ? "Settings" : ""}
          >
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </button>
        </div>
      </div>
      
      {/* Right side - Tab-specific info, processing indicator, and collapse button */}
      <div className="flex items-center space-x-2">
        {/* Tab-specific status and counts */}
        <div className="px-3 text-xs text-white">
          {activeTab === 'history' && (
            <span>1 history</span>
          )}
          
          {activeTab === 'alerts' && (
            <span>{alerts.length} alert{alerts.length === 1 ? '' : 's'}</span>
          )}
          
          {activeTab === 'settings' && (
            <span>settings</span>
          )}
        </div>

        {/* Processing indicator - positioned at far right before collapse button */}
        {activeTab === 'terminal' && isProcessing && (
          <div className="flex items-center space-x-1 px-2 text-xs text-white">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
        
        {/* Collapse button with dynamic icon */}
        <button
          className="h-[25px] px-2 text-white border border-[#cccccc40] hover:bg-[#ffffff20] rounded flex items-center justify-center mr-2 transition-colors duration-150"
          onClick={toggleCollapse}
          title="Collapse Terminal"
        >
          <span className="text-xs">−</span>
        </button>
      </div>
    </div>
  );
}
