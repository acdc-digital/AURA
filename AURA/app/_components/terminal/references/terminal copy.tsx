// Terminal Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/terminal.tsx

// Terminal Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/terminal.tsx

"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { useTerminalStore } from "@/store/terminal";
import { useSessionStore } from "@/store/terminal/session";
import { useConvexAuth } from "convex/react";
import { Bell, History, Settings, Terminal as TerminalIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { AgentsPanel, ChatMessages, ExtensionsPanel, SessionsPanel, SessionsRow } from "./_components";
import { HistoryTab } from "./historyTab";

export function Terminal() {
  const { 
    isCollapsed, 
    toggleCollapse, 
    setCollapsed,
    setSize,
    activeTab,
    setActiveTab,
    alerts
  } = useTerminalStore();
  const { isAuthenticated } = useConvexAuth();
  const { isSessionsPanelOpen, isAgentsPanelOpen, isExtensionsPanelOpen } = useSessionStore();

  // Track if we've already handled the initial authentication state
  const hasHandledInitialAuth = useRef(false);
  const previousAuthState = useRef(isAuthenticated);

  // Auto-open terminal only on initial authentication, allow manual control afterwards
  useEffect(() => {
    // Only handle the transition from unauthenticated to authenticated
    if (!previousAuthState.current && isAuthenticated && !hasHandledInitialAuth.current) {
      // First time signing in - auto-open terminal
      setCollapsed(false);
      hasHandledInitialAuth.current = true;
    } else if (!isAuthenticated && previousAuthState.current) {
      // User signed out - close terminal and reset the flag
      setCollapsed(true);
      hasHandledInitialAuth.current = false;
    }
    
    // Update the previous state
    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated, setCollapsed]);

  const handleResize = (size: number) => {
    try {
      // Simple size update - no complex logic
      setSize(size);
    } catch (error) {
      console.error('Error in terminal resize:', error);
    }
  };

  return (
    <ResizablePanel
      key={`terminal-${isCollapsed}`}
      id="terminal"
      defaultSize={isCollapsed ? 3 : 40}
      minSize={isCollapsed ? 3 : 15}
      maxSize={isCollapsed ? 3 : 60}
      onResize={handleResize}
      className={isCollapsed ? "flex-shrink-0" : ""}
    >
      <div className={`flex flex-col ${isCollapsed ? 'h-[25px]' : 'h-full bg-[#181818]'}`}>
        {/* Fixed Header */}
        <div className={`h-[25px] bg-[#0e639c] flex items-center justify-between px-0 flex-shrink-0`}>
          <div className="flex items-center">
            <div className="h-[25px] bg-transparent rounded-none border-none justify-start p-0 flex items-center">
              <button
                className={`rounded-none text-xs h-[25px] px-3 min-w-[70px] flex items-center justify-center ${
                  !isCollapsed && activeTab === 'terminal' 
                    ? 'bg-[#0e639c] text-white' 
                    : 'bg-transparent text-white'
                } ${
                  isAuthenticated 
                    ? 'hover:bg-[#ffffff20] cursor-pointer' 
                    : 'opacity-60 cursor-default pointer-events-none'
                }`}
                onClick={() => {
                  if (!isAuthenticated) return;
                  
                  // Handle terminal tab click behavior
                  if (isCollapsed) {
                    // If collapsed, expand and set as active tab
                    toggleCollapse();
                    setActiveTab("terminal");
                  } else if (activeTab === 'terminal') {
                    // If already active and expanded, collapse the terminal
                    toggleCollapse();
                  } else {
                    // If not active but expanded, just set as active tab
                    setActiveTab("terminal");
                  }
                }}
                disabled={!isAuthenticated}
                title={isAuthenticated ? "Terminal" : ""}
              >
                <TerminalIcon className="w-3 h-3 mr-1" />
                Terminal
              </button>
              <button
                className={`rounded-none text-xs h-[25px] ${!isCollapsed && activeTab === 'history' ? 'bg-[#094771] text-white' : 'bg-transparent text-white'} ${isAuthenticated && !isCollapsed ? 'hover:bg-[#ffffff20] cursor-pointer' : 'opacity-60 cursor-default'} px-3 min-w-[70px] flex items-center justify-center`}
                onClick={() => {
                  if (!isAuthenticated) return;
                  
                  // Only handle history tab click if terminal is expanded
                  if (!isCollapsed) {
                    if (activeTab === 'history') {
                      // If already active and expanded, collapse the terminal
                      toggleCollapse();
                    } else {
                      // If not active but expanded, just set as active tab
                      setActiveTab("history");
                    }
                  }
                  // If collapsed, do nothing - don't expand the terminal
                }}
                disabled={!isAuthenticated || isCollapsed}
                title={isAuthenticated ? "History" : ""}
              >
                <History className="w-3 h-3 mr-1" />
                History
              </button>
              <button
                className={`rounded-none text-xs h-[25px] ${!isCollapsed && activeTab === 'alerts' ? 'bg-[#094771] text-white' : 'bg-transparent text-white'} ${isAuthenticated && !isCollapsed ? 'hover:bg-[#ffffff20] cursor-pointer' : 'opacity-60 cursor-default'} px-3 min-w-[70px] flex items-center justify-center`}
                onClick={() => {
                  if (!isAuthenticated) return;
                  if (!isCollapsed) {
                    if (activeTab === 'alerts') {
                      toggleCollapse();
                    } else {
                      setActiveTab('alerts');
                    }
                  }
                }}
                disabled={!isAuthenticated || isCollapsed}
                title={isAuthenticated ? 'Alerts' : ''}
              >
                <Bell className="w-3 h-3 mr-1" />
                Alerts
                {alerts && alerts.length > 0 && (
                  <span
                    className="ml-2 inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full text-[10px] leading-none bg-[#f2f2f2] text-[#d83b01]"
                    title={`${alerts.length} alert${alerts.length === 1 ? '' : 's'}`}
                  >
                    {alerts.length > 9 ? '9+' : alerts.length}
                  </span>
                )}
              </button>
              <button
                className="rounded-none text-xs h-[25px] bg-transparent text-white opacity-60 px-3 min-w-[70px] flex items-center justify-center"
                disabled
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Row - Only show when not collapsed and terminal tab is active */}
        {!isCollapsed && activeTab === "terminal" && (
          <SessionsRow />
        )}

        {/* Content Area - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === "terminal" && (
              <>
                {isSessionsPanelOpen ? (
                  <SessionsPanel />
                ) : isAgentsPanelOpen ? (
                  <AgentsPanel />
                ) : isExtensionsPanelOpen ? (
                  <ExtensionsPanel />
                ) : (
                  <ChatMessages />
                )}
              </>
            )}
            {activeTab === "history" && <HistoryTab />}
            {activeTab === "alerts" && (
              <div className="flex-1 bg-[#0e0e0e] min-h-0 flex flex-col">
                <div className="flex items-center justify-between px-2 py-1 border-b border-[#1f1f1f] flex-shrink-0">
                  <div className="text-xs text-[#cccccc]">Alerts</div>
                  <button
                    className={`text-[10px] px-2 py-1 rounded border border-[#2d2d2d] ${alerts.length ? 'text-[#cccccc] hover:bg-[#2a2a2a]' : 'text-[#6a6a6a] opacity-60 cursor-not-allowed'}`}
                    onClick={() => alerts.length && useTerminalStore.getState().clearAlerts()}
                    disabled={alerts.length === 0}
                    title={alerts.length ? 'Clear all alerts' : ''}
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex-1 p-2 overflow-auto">
                  {alerts.length === 0 ? (
                    <div className="text-xs text-[#858585]">No alerts at this time.</div>
                  ) : (
                    <ul className="space-y-2">
                      {alerts.map(a => (
                        <li key={a.id} className="p-2 rounded border border-[#2d2d2d] bg-[#121212]">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${a.level === 'error' ? 'text-[#f28b82]' : a.level === 'warning' ? 'text-[#fbbc04]' : 'text-[#8ab4f8]'}`}>
                              {a.title}
                            </span>
                            <span className="text-[10px] text-[#6a6a6a]">{new Date(a.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-[#cccccc] mt-1 whitespace-pre-wrap">{a.message}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="flex-1 bg-[#0e0e0e] p-2 min-h-0">
                <div className="text-xs text-[#858585]">
                  Terminal settings coming soon...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ResizablePanel>
  );
}