// Sessions Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/sessionsPanel.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { useTokenManagement } from "@/lib/hooks/useTokenManagement";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/terminal/chat";
import { useSessionStore } from "@/store/terminal/session";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface SessionsPanelProps {
  className?: string;
}

export function SessionsPanel({ className }: SessionsPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const {
    sessions,
    activeSessionId,
    setSessions,
    setActiveSession,
    createNewSession,
    setSessionsPanelOpen,
    removeSession,
  } = useSessionStore();
  
  const { setSessionId } = useChatStore();
  
  // Fetch user sessions from Convex
  const userSessions = useQuery(
    api.chat.getUserSessions,
    isAuthenticated ? {} : "skip"
  );

  // Mutation for deleting sessions
  const deleteSessionMutation = useMutation(api.chat.deleteSession);

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

  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId);
    setSessionId(sessionId);
    // Close the sessions panel and return to chat
    setSessionsPanelOpen(false);
  };

  const handleNewSession = () => {
    const newSessionId = createNewSession();
    setSessionId(newSessionId);
    // Close the sessions panel and return to chat
    setSessionsPanelOpen(false);
  };

  const handleBackToChat = () => {
    setSessionsPanelOpen(false);
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    // Prevent the session click handler from firing
    event.stopPropagation();
    
    try {
      // Call the Convex mutation to soft delete the session
      await deleteSessionMutation({ sessionId });
      
      // Remove from local state
      removeSession(sessionId);
      
      // If this was the active session, switch to another session or create new one
      if (activeSessionId === sessionId) {
        if (sessions.length > 1) {
          // Switch to the next available session
          const remainingSessions = sessions.filter(s => s.sessionId !== sessionId);
          if (remainingSessions.length > 0) {
            setActiveSession(remainingSessions[0].sessionId);
            setSessionId(remainingSessions[0].sessionId);
          }
        } else {
          // No other sessions, create a new one
          const newSessionId = createNewSession();
          setSessionId(newSessionId);
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Component to display token usage for a session
  const TokenUsageCell = ({ sessionId }: { sessionId: string }) => {
    const { tokenUsage } = useTokenManagement(sessionId);
    
    if (!tokenUsage) {
      return (
        <span 
          className="text-[#858585]" 
          title="Token usage data not available"
        >
          --
        </span>
      );
    }

    const getTokenColor = (percent: number) => {
      if (percent >= 90) return 'text-red-400';
      if (percent >= 75) return 'text-yellow-400';
      if (percent >= 50) return 'text-blue-400';
      return 'text-[#858585]';
    };

    return (
      <span 
        className={getTokenColor(tokenUsage.percentUsed)}
        title={`Token Usage: ${tokenUsage.formattedTokens} / ${tokenUsage.maxTokens.toLocaleString()} (${tokenUsage.percentUsed}%)\nCost: ${tokenUsage.formattedCost}\nMessages: ${tokenUsage.messageCount}`}
      >
        {tokenUsage.totalTokens.toLocaleString()}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className={cn("flex-1 bg-[#0e0e0e] flex items-center justify-center", className)}>
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-[#858585] mx-auto mb-4" />
          <div className="text-sm text-[#cccccc] mb-2">Access Chat Sessions</div>
          <div className="text-xs text-[#858585]">Sign in to view and manage your chat sessions</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex flex-col min-h-0", className)}>
      {sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <MessageSquare className="w-12 h-12 text-[#858585] mb-4" />
          <div className="text-sm text-[#cccccc] mb-2">No chat sessions yet</div>
          <div className="text-xs text-[#858585] mb-4">Start a new conversation to create your first session</div>
          <button
            onClick={handleNewSession}
            className="flex items-center gap-2 px-3 py-2 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Start New Session
          </button>
        </div>
      ) : (
        <>
          {/* Table Header - Fixed */}
          <div className="flex items-center px-3 py-1.5 bg-[#2d2d30] border-b border-[#454545] text-xs text-[#858585] font-medium flex-shrink-0">
            <div className="flex-shrink-0 w-20">Session</div>
            <div className="flex-1 px-2">Preview</div>
            <div 
              className="flex-shrink-0 w-20 pl-2 text-center" 
              title="Total tokens used in this session out of 180K limit"
            >
              Tokens/180k
            </div>
            <div className="flex-shrink-0 w-24 pl-2 text-right">Time</div>
            <div className="flex-shrink-0 w-12"></div>
          </div>
          
          {/* Session Rows - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {sessions.map((session, index) => (
              <div
                key={session.sessionId}
                onClick={() => handleSessionClick(session.sessionId)}
                className={cn(
                  "w-full flex items-center px-3 py-1.5 transition-all duration-200 hover:bg-[#2a2a2a] border-b border-[#333] bg-[#1a1a1a] group cursor-pointer",
                  session.sessionId === activeSessionId
                    ? "border-l-2 border-l-[#0078d4]"
                    : ""
                )}
              >
                <div className="flex items-center flex-1 text-left min-w-0">
                  <div className="flex-shrink-0 w-20 text-xs text-[#cccccc] font-medium">
                    #{index + 1}
                  </div>
                  <div className="flex-1 px-2 min-w-0">
                    <div className="text-xs text-[#b3b3b3] truncate">
                      {session.preview}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-20 pl-2 text-center text-xs">
                    <TokenUsageCell sessionId={session.sessionId} />
                  </div>
                  <div className="flex-shrink-0 w-24 pl-2 text-right text-xs text-[#858585]">
                    {formatTime(session.lastActivity)}
                  </div>
                </div>
                
                {/* Delete Button */}
                <div className="flex-shrink-0 w-12 flex justify-center">
                  <button
                    onClick={(e) => handleDeleteSession(session.sessionId, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded transition-all text-[#858585] hover:text-red-400"
                    title="Delete Session"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
