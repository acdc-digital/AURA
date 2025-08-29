// SESSIONS PANEL - Terminal sessions management panel
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/sessions/SessionsPanel.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { useTerminalStore } from "@/lib/store/terminal";
import { useUser, useSessionSync, useOnboarding } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { MessageSquare, Plus, Trash2, Edit3, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SessionsPanelProps {
  className?: string;
  onSessionSelected?: () => void; // Callback to switch to chat tab
}

export function SessionsPanel({ className, onSessionSelected }: SessionsPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const { createSessionWithSync } = useSessionSync(false); // Don't run sync logic here
  const { needsOnboarding } = useOnboarding();
  
  // Get sessions from Convex
  const sessions = useQuery(
    api.chat.getUserSessions,
    user?.clerkId ? { userId: user.clerkId } : "skip"
  );
  
  // Get UI state from store
  const { activeSessionId, setActiveSession } = useTerminalSessionStore();
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Mutations for managing sessions
  const deleteSessionMutation = useMutation(api.chat.deleteSession);
  const updateSessionMutation = useMutation(api.chat.updateSession);

  const handleCreateSession = async () => {
    if (!isAuthenticated || needsOnboarding) return;
    
    try {
      await createSessionWithSync("New Chat Session");
      onSessionSelected?.(); // Switch to chat tab
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessions) return;

    // Calculate filtered sessions
    const filteredSessions = sessions.filter((session) => {
      if (needsOnboarding) {
        return session.title?.toLowerCase().includes('onboarding') ||
               session.title?.toLowerCase().includes('welcome');
      }
      return true;
    });

    if (filteredSessions.length <= 1) {
      return; // Don't delete the last visible session
    }

    // During onboarding, don't allow deleting the onboarding session
    if (needsOnboarding) {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session?.title?.toLowerCase().includes('onboarding') ||
          session?.title?.toLowerCase().includes('welcome')) {
        return; // Don't delete onboarding session during onboarding
      }
    }
    
    try {
      await deleteSessionMutation({ sessionId });
      
      // If this was the active session, switch to another one
      if (sessionId === activeSessionId && sessions.length > 1) {
        const otherSession = sessions.find(s => s.sessionId !== sessionId);
        if (otherSession) {
          setActiveSession(otherSession.sessionId);
          
          // Also update terminal store to keep them in sync
          const terminalStore = useTerminalStore.getState();
          terminalStore.setActiveTerminal(otherSession.sessionId);
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    // Update both chat session and terminal session stores
    setActiveSession(sessionId);
    
    // Also update terminal store to keep them in sync
    const terminalStore = useTerminalStore.getState();
    terminalStore.setActiveTerminal(sessionId);
    
    onSessionSelected?.(); // Switch to chat tab
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    if (newTitle.trim() && sessions && newTitle !== sessions.find(s => s.sessionId === sessionId)?.title) {
      try {
        await updateSessionMutation({
          sessionId,
          updates: { title: newTitle.trim() }
        });
      } catch (error) {
        console.error("Failed to rename session:", error);
      }
    }
    setEditingSessionId(null);
    setEditTitle('');
  };

  const startEditing = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle || '');
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  if (!isAuthenticated) {
    return (
      <div className={cn("flex-1 bg-[#0e0e0e] flex items-center justify-center", className)}>
        <div className="text-xs text-[#858585]">Please sign in to view sessions</div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2d2d30]">
        <div className="text-xs text-white flex items-center">
          <MessageSquare className="w-3 h-3 mr-2" />
          Chat Sessions ({sessions?.filter((session) => {
            // During onboarding, only count onboarding-related sessions
            if (needsOnboarding) {
              return session.title?.toLowerCase().includes('onboarding') ||
                     session.title?.toLowerCase().includes('welcome');
            }
            return true;
          }).length || 0})
        </div>
        <Button
          onClick={handleCreateSession}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
          disabled={needsOnboarding}
        >
          <Plus className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        {(() => {
          // Apply filtering logic
          const filteredSessions = sessions?.filter((session) => {
            // During onboarding, only show onboarding-related sessions
            if (needsOnboarding) {
              return session.title?.toLowerCase().includes('onboarding') ||
                     session.title?.toLowerCase().includes('welcome');
            }
            // After onboarding, show all sessions
            return true;
          }) || [];

          return !filteredSessions || filteredSessions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-xs text-[#858585] text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                {needsOnboarding ? "Initializing onboarding session..." : "No chat sessions yet"}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions
                .sort((a, b) => b.lastActivity - a.lastActivity)
                .map((session) => (
                <div
                  key={session.sessionId}
                  className={`group relative p-2 rounded cursor-pointer transition-colors ${
                    session.sessionId === activeSessionId
                      ? 'bg-[#0e639c] text-white'
                      : 'bg-[#1e1e1e] hover:bg-[#2d2d30] text-[#cccccc]'
                  }`}
                  onClick={() => handleSwitchSession(session.sessionId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.sessionId ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleRenameSession(session.sessionId, editTitle)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameSession(session.sessionId, editTitle);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          className="h-6 text-xs bg-[#1e1e1e] border-[#2d2d30] text-white"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div>
                          <div className="text-xs font-medium truncate">
                            {session.title || 'Untitled Session'}
                          </div>
                          <div className="text-xs opacity-70 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(session.lastActivity).toLocaleDateString()}
                            {session.messageCount > 0 && (
                              <span className="ml-2">
                                {session.messageCount} messages
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {filteredSessions.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.sessionId);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session.sessionId, session.title || '');
                        }}
                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300"
                        title="Rename session"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Preview of last message */}
                  {session.preview && (
                    <div className="mt-1 text-xs opacity-60 truncate">
                      {session.preview}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[#2d2d30]">
        <div className="text-xs text-[#858585] flex items-center justify-between">
          <span>
            Active: {(() => {
              const filteredSessions = sessions?.filter((session) => {
                if (needsOnboarding) {
                  return session.title?.toLowerCase().includes('onboarding') ||
                         session.title?.toLowerCase().includes('welcome');
                }
                return true;
              }) || [];
              const activeSession = filteredSessions.find((s) => s.sessionId === activeSessionId);
              return activeSession?.title || 'None';
            })()}
          </span>
        </div>
      </div>
    </div>
  );
}