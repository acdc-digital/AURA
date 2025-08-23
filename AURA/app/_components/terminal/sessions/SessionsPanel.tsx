// SESSIONS PANEL - Terminal sessions management panel
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/sessions/SessionsPanel.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { cn } from "@/lib/utils";
import { useConvexAuth, useMutation } from "convex/react";
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
  const {
    sessions,
    activeSessionId,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
  } = useTerminalSessionStore();
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Mutation for deleting sessions
  const deleteSessionMutation = useMutation(api.chat.deleteSession);

  const handleCreateSession = async () => {
    if (!isAuthenticated) return;
    
    await createSession(); // Auto-generate title, no input needed
    onSessionSelected?.(); // Switch to chat tab
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (sessions.length <= 1) {
      return; // Don't delete the last session
    }
    
    try {
      await deleteSessionMutation({ sessionId });
      deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    switchSession(sessionId);
    onSessionSelected?.(); // Switch to chat tab when session is selected
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    if (newTitle.trim() && newTitle !== sessions.find(s => s.sessionId === sessionId)?.title) {
      renameSession(sessionId, newTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className={cn("flex-1 bg-[#0e0e0e] flex items-center justify-center", className)}>
        <div className="text-xs text-[#858585]">Please sign in to manage sessions</div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2d2d30]">
        <div className="text-xs text-white flex items-center">
          <MessageSquare className="w-3 h-3 mr-2" />
          Chat Sessions ({sessions.length})
        </div>
        <Button
          onClick={handleCreateSession}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
        >
          <Plus className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-xs text-[#858585]">No sessions yet</div>
            <Button
              onClick={handleCreateSession}
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-[#0ea5e9] hover:text-white"
            >
              Create your first session
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {sessions
              .sort((a, b) => b.lastActivity - a.lastActivity)
              .map((session) => (
                <div
                  key={session.sessionId}
                  className={cn(
                    "group p-3 rounded border cursor-pointer transition-colors mb-2",
                    session.sessionId === activeSessionId
                      ? "bg-[#1e1e1e] border-[#007acc] text-[#cccccc]"
                      : "bg-[#161616] border-[#2d2d30] hover:bg-[#1a1a1a] hover:border-[#454545] text-[#858585] hover:text-[#cccccc]"
                  )}
                  onClick={() => handleSessionClick(session.sessionId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.sessionId ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              handleRenameSession(session.sessionId, editTitle);
                            } else if (e.key === 'Escape') {
                              setEditingSessionId(null);
                              setEditTitle('');
                            }
                          }}
                          onBlur={() => handleRenameSession(session.sessionId, editTitle)}
                          className="bg-transparent border-none text-sm font-medium p-0 h-auto focus-visible:ring-0"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="text-sm font-medium truncate pr-2">
                          {session.title}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatTime(session.lastActivity)}
                        </span>
                        {session.messageCount > 0 && (
                          <span>{session.messageCount} messages</span>
                        )}
                        {session.totalTokens > 0 && (
                          <span>{session.totalTokens.toLocaleString()} tokens</span>
                        )}
                      </div>
                      
                      {session.preview && (
                        <div className="text-xs opacity-60 mt-1 truncate">
                          {session.preview}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.sessionId);
                          setEditTitle(session.title);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-[#2d2d2d]"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      {sessions.length > 1 && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.sessionId);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-red-600/20 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-[#2d2d30] text-xs text-[#858585]">
        {activeSessionId && (
          <div>
            Active: {sessions.find(s => s.sessionId === activeSessionId)?.title}
          </div>
        )}
      </div>
    </div>
  );
}
