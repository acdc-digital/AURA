// Terminal Sessions Row Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/sessionsRow.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store";
import { useChatStore } from "@/store/terminal/chat";
import { useSessionStore } from "@/store/terminal/session";
import { useConvexAuth, useQuery } from "convex/react";
import { Bot } from "lucide-react";
import { useEffect } from "react";

interface SessionsRowProps {
  className?: string;
}

export function SessionsRow({ className }: SessionsRowProps) {
  const { isAuthenticated } = useConvexAuth();
  const { agents, activeAgentId, setActiveAgent } = useAgentStore();
  const {
    sessions,
    activeSessionId,
    isSessionsPanelOpen,
    isAgentsPanelOpen,
    isExtensionsPanelOpen,
    activeExtensionId,
    setSessions,
    setActiveSession,
    createNewSession,
    toggleSessionsPanel,
    toggleAgentsPanel,
    toggleExtensionsPanel,
    setSessionsPanelOpen,
    setAgentsPanelOpen,
    setExtensionsPanelOpen,
    setActiveExtension,
  } = useSessionStore();
  
  const { setSessionId } = useChatStore();
  
  // Fetch user sessions from Convex
  const userSessions = useQuery(
    api.chat.getUserSessions,
    isAuthenticated ? {} : "skip"
  );

  // Update sessions when data loads
  useEffect(() => {
    if (userSessions) {
      setSessions(userSessions);
      
      // If no active session and we have sessions, set the first one as active
      if (!activeSessionId && userSessions.length > 0) {
        setActiveSession(userSessions[0].sessionId);
        setSessionId(userSessions[0].sessionId);
      }
    }
  }, [userSessions, activeSessionId, setSessions, setActiveSession, setSessionId]);

  // Clear active agent if it becomes disabled
  useEffect(() => {
    if (activeAgentId) {
      const activeAgent = agents.find(agent => agent.id === activeAgentId);
      if (activeAgent?.disabled) {
        console.log(`🚫 Auto-clearing disabled agent: ${activeAgentId} (${activeAgent.disabledReason})`);
        setActiveAgent(null);
      }
    }
  }, [activeAgentId, agents, setActiveAgent]);

  const handleChatClick = () => {
    setSessionsPanelOpen(false);
    setAgentsPanelOpen(false);
    setExtensionsPanelOpen(false);
  };

  const handleAgentsClick = () => {
    if (isAgentsPanelOpen) {
      setAgentsPanelOpen(false);
    } else {
      toggleAgentsPanel();
      // Don't clear extension when opening agents panel - let them coexist
    }
  };

  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId);
    setSessionId(sessionId);
  };

  const handleNewSession = () => {
    const newSessionId = createNewSession();
    setSessionId(newSessionId);
    setSessionsPanelOpen(false);
    setAgentsPanelOpen(false); // Close agents panel when creating new session
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={cn("h-[30px] bg-[#1a1a1a] border-b border-[#2d2d2d] flex items-center px-3", className)}>
        <div className="text-xs text-[#858585]">
          Sign in to access chat sessions
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-[30px] bg-[#1a1a1a] border-b border-[#2d2d2d] flex items-center justify-between", className)}>
      <div className="flex items-center gap-1 px-3">
        {/* Chat Button */}
        <button
          onClick={handleChatClick}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs",
            !isSessionsPanelOpen && !isAgentsPanelOpen && !isExtensionsPanelOpen
              ? "text-[#6dd4b7] hover:text-[#4ec9b0]"
              : "text-[#ffffff] hover:text-[#cccccc]"
          )}
          title="Back to Chat"
        >
          Chat
        </button>

        {/* Sessions Toggle Button */}
        <button
          onClick={toggleSessionsPanel}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs",
            isSessionsPanelOpen
              ? "text-[#6dd4b7] hover:text-[#4ec9b0]"
              : "text-[#ffffff] hover:text-[#cccccc]"
          )}
          title="Chat Sessions"
        >
          Sessions
          {sessions.length > 0 && (
            <span className="text-xs text-[#4fc3f7] font-medium">
              {sessions.length}
            </span>
          )}
        </button>

        {/* Agents Toggle Button */}
        <button
          onClick={handleAgentsClick}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs",
            isAgentsPanelOpen
              ? "text-[#6dd4b7] hover:text-[#4ec9b0]"
              : "text-[#ffffff] hover:text-[#cccccc]"
          )}
          title="AI Agents"
        >
          Agents
        </button>

        {/* Extensions Toggle Button */}
        <button
          onClick={toggleExtensionsPanel}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs",
            isExtensionsPanelOpen
              ? "text-[#6dd4b7] hover:text-[#4ec9b0]"
              : "text-[#ffffff] hover:text-[#cccccc]"
          )}
          title="Extensions"
        >
          Extensions
        </button>

        {/* New Session Button */}
        <button
          onClick={handleNewSession}
          className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-[#858585] hover:text-[#ffffff] hover:bg-[#2a2a2a] rounded transition-colors border border-[#454545]"
          title="Create New Session"
        >
          +
        </button>
      </div>

      {/* Right Side - Active Agent/Extension & Thinking Indicator */}
      <div className="flex items-center gap-3 px-3">
        {/* Active Agent Indicator - Show when agent is active, not disabled, and no extension */}
        {activeAgentId && !activeExtensionId && (() => {
          // Handle special case for auto mode
          if (activeAgentId === 'auto') {
            return (
              <span className="text-xs font-medium text-white">
                Auto
              </span>
            );
          }
          
          // Handle regular agents from registry
          const activeAgent = agents.find(agent => agent.id === activeAgentId);
          // Only show if agent exists and is not disabled
          return activeAgent && !activeAgent.disabled ? (
            <span className="text-xs font-medium text-[#4fc3f7]">
              {activeAgent.name}
            </span>
          ) : null;
        })()}
        
        {/* Active Extension Indicator - Show when extension is active */}
        {activeExtensionId && (
          <span className="text-xs font-medium text-[#ffcc02]">
            {activeExtensionId === 'marketing-officer' ? 'Marketing Officer' : 
             activeExtensionId === 'campaign-director' ? 'Campaign Director' : 
             'Extension'}
          </span>
        )}
        
        {/* Thinking Active Indicator */}
        <div 
          className="flex items-center"
          title="AI Thinking Active - Enhanced reasoning enabled for all conversations"
        >
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </div>
  );
}
