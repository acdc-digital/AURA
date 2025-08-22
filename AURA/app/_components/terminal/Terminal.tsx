// TERMINAL COMPONENT - AURA Advanced Terminal Panel with Multi-Terminal Support
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/Terminal.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";
import { useConvexAuth } from "convex/react";
import { Bell, History, Settings, Terminal as TerminalIcon } from "lucide-react";
import { useEffect } from "react";
import { AlertsDisplay } from "./alerts";
import { HistoryDisplay } from "./history";
import { SettingsDisplay } from "./settings";
import { AdvancedTerminalDisplay, TerminalHeaderRow } from "./_components";

export function Terminal() {
  const { 
    isCollapsed,
    toggleCollapse,
    activeTab,
    setActiveTab,
    alerts,
    terminals,
    activeTerminalId,
    createTerminal,
  } = useTerminalStore();
  const { isAuthenticated } = useConvexAuth();

  // Auto-create chat terminal when terminal tab is active but no terminal exists
  useEffect(() => {
    if (activeTab === 'terminal' && isAuthenticated && (!activeTerminalId || !terminals.has(activeTerminalId))) {
      console.log("Creating terminal for authenticated user");
      createTerminal(undefined, "Chat");
    }
  }, [isAuthenticated, terminals, createTerminal, activeTab, activeTerminalId]);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'terminal':
        if (!activeTerminalId || !terminals.has(activeTerminalId)) {
          if (isAuthenticated) {
            // Terminal creation is handled by useEffect
            return (
              <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
                <div className="text-xs text-[#858585]">Starting chat...</div>
              </div>
            );
          } else {
            return (
              <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
                <div className="text-xs text-[#858585]">Please sign in to use chat</div>
              </div>
            );
          }
        }
        return <AdvancedTerminalDisplay terminalId={activeTerminalId} />;

      case 'history':
        return <HistoryDisplay />;

      case 'alerts':
        return <AlertsDisplay />;

      case 'settings':
        return <SettingsDisplay />;

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col ${isCollapsed ? 'h-[35px]' : 'h-full'} bg-[#181818]`}>
      {isCollapsed ? (
        // Collapsed view - just header with expand functionality
        <div className="h-[35px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 rounded-t-sm">
          <div className="flex items-center h-full">
            <button
              className="text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center bg-transparent text-white rounded-none hover:bg-[#ffffff20] cursor-pointer"
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
          
          {/* Expand button - positioned on far right */}
          <button
            className="h-[25px] px-2 text-white bg-transparent border border-[#cccccc40] hover:bg-[#ffffff20] rounded flex items-center justify-center mr-2 text-xs transition-colors duration-150"
            onClick={toggleCollapse}
            title="Expand Terminal"
          >
            +
          </button>
        </div>
      ) : (
        // Expanded view - full terminal interface
        <>
          {/* Multi-terminal header row or regular tab bar */}
          {activeTab === 'terminal' ? (
            <TerminalHeaderRow />
          ) : (
            <div className="h-[35px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 rounded-t-sm">
              <div className="flex items-center h-full">
                <div className="h-[35px] bg-transparent rounded-none border-none justify-start p-0 flex items-center">
                  <button
                    className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center bg-transparent text-white rounded-none ${
                      activeTab === 'terminal'
                        ? 'bg-[#094771] text-white'
                        : 'bg-transparent text-white'
                    } ${
                      isAuthenticated
                        ? 'hover:bg-[#ffffff20] cursor-pointer'
                        : 'opacity-60 cursor-default'
                    }`}
                    onClick={() => {
                      if (!isAuthenticated) return;
                      setActiveTab("terminal");
                    }}
                    disabled={!isAuthenticated}
                    title={isAuthenticated ? "Terminal" : ""}
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
                    title={isAuthenticated ? "History" : ""}
                  >
                    <History className="w-3 h-3 mr-1" />
                    History
                  </button>

                  <button
                    className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center ${
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
                    title={isAuthenticated ? `Alerts (${alerts.length})` : ""}
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    Alerts
                    {alerts.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                        {alerts.length}
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
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {renderActiveTabContent()}
          </div>
        </>
      )}
    </div>
  );
}
