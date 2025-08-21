// TERMINAL COMPONENT - AURA Advanced Terminal Panel with Multi-Terminal Support
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/Terminal.tsx

"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { useTerminalStore } from "@/lib/store/terminal";
import { useConvexAuth } from "convex/react";
import { Bell, History, Settings, Terminal as TerminalIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { AdvancedTerminalDisplay, HistoryTab, TerminalHeaderRow } from "./_components";

export function Terminal() {
  const { 
    isCollapsed, 
    toggleCollapse, 
    setCollapsed,
    setSize,
    activeTab,
    setActiveTab,
    alerts,
    terminals,
    activeTerminalId,
    createTerminal,
  } = useTerminalStore();
  const { isAuthenticated } = useConvexAuth();

  // Track if we've already handled the initial authentication state
  const hasHandledInitialAuth = useRef(false);
  const previousAuthState = useRef(isAuthenticated);

  // Auto-open terminal only on initial authentication, allow manual control afterwards
  useEffect(() => {
    // Only handle the transition from unauthenticated to authenticated
    if (!previousAuthState.current && isAuthenticated && !hasHandledInitialAuth.current) {
      // First time signing in - auto-open terminal and create default terminal
      setCollapsed(false);
      if (terminals.size === 0) {
        createTerminal(undefined, "Main Terminal");
      }
      hasHandledInitialAuth.current = true;
    } else if (!isAuthenticated && previousAuthState.current) {
      // User signed out - close terminal and reset the flag
      setCollapsed(true);
      hasHandledInitialAuth.current = false;
    }
    
    // Update the previous state
    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated, setCollapsed, terminals.size, createTerminal]);

  const handleResize = (size: number) => {
    try {
      // Simple size update - no complex logic
      setSize(size);
    } catch (error) {
      console.error('Error in terminal resize:', error);
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'terminal':
        if (!activeTerminalId || !terminals.has(activeTerminalId)) {
          return (
            <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
              <div className="text-center text-xs text-[#858585]">
                <div>No terminal available</div>
                {isAuthenticated && (
                  <button
                    onClick={() => createTerminal()}
                    className="mt-2 px-3 py-1 bg-[#0ea5e9] text-white rounded text-xs hover:bg-[#0284c7]"
                  >
                    Create Terminal
                  </button>
                )}
              </div>
            </div>
          );
        }
        return <AdvancedTerminalDisplay terminalId={activeTerminalId} />;
      
      case 'history':
        return <HistoryTab />;
      
      case 'alerts':
        return (
          <div className="flex-1 bg-[#0e0e0e] p-3">
            {alerts.length === 0 ? (
              <div className="text-xs text-[#858585]">No alerts</div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded border-l-4 ${
                      alert.level === 'error' ? 'border-red-500 bg-red-500/10' :
                      alert.level === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-blue-500 bg-blue-500/10'
                    }`}
                  >
                    <div className="text-xs font-medium text-white">{alert.title}</div>
                    <div className="text-xs text-[#cccccc] mt-1">{alert.message}</div>
                    <div className="text-xs text-[#858585] mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ResizablePanel
      key={`terminal-${isCollapsed}`}
      id="terminal"
      defaultSize={isCollapsed ? 6 : 40}
      minSize={isCollapsed ? 6 : 15}
      maxSize={isCollapsed ? 6 : 60}
      onResize={handleResize}
      className={isCollapsed ? "flex-shrink-0 overflow-hidden" : ""}
    >
      <div className={`flex flex-col h-full ${isCollapsed ? 'justify-end bg-[#1e1e1e]' : 'bg-[#181818]'}`}>
        {isCollapsed ? (
          // Collapsed view - simple tab bar
          <div className={`h-[35px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 rounded-t-sm`}>
            <div className="flex items-center h-full">
              <div className="h-[35px] bg-transparent rounded-none border-none justify-start p-0 flex items-center">
                <button
                  className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center bg-transparent text-white rounded-none ${
                    isAuthenticated 
                      ? 'hover:bg-[#ffffff20] cursor-pointer' 
                      : 'opacity-60 cursor-default'
                  }`}
                  onClick={() => {
                    if (!isAuthenticated) return;
                    toggleCollapse();
                    setActiveTab("terminal");
                  }}
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? "Terminal" : ""}
                >
                  <TerminalIcon className="w-3 h-3 mr-1" />
                  Terminal
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Expanded view - full interface
          <>
            {/* Multi-terminal header row or regular tab bar */}
            {activeTab === 'terminal' ? (
              <TerminalHeaderRow />
            ) : (
              <div className={`h-[35px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0 rounded-t-sm`}>
                <div className="flex items-center h-full">
                  <div className="h-[35px] bg-transparent rounded-none border-none justify-start p-0 flex items-center">
                    <button
                      className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center ${
                        activeTab === 'terminal' 
                          ? 'bg-[#094771] text-white rounded-tl-sm' 
                          : 'bg-transparent text-white rounded-none'
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
                      className={`text-xs h-[35px] px-3 min-w-[70px] flex items-center justify-center opacity-60 cursor-default`}
                      disabled
                      title="Settings (Coming Soon)"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Settings
                    </button>
                  </div>
                </div>
                
                {/* Collapse button */}
                <button
                  className="h-[35px] px-2 text-white hover:bg-[#ffffff20] flex items-center justify-center"
                  onClick={toggleCollapse}
                  title="Collapse Terminal"
                >
                  <span className="text-xs">−</span>
                </button>
              </div>
            )}

            {/* Tab content */}
            {renderActiveTabContent()}
          </>
        )}
      </div>
    </ResizablePanel>
  );
}
