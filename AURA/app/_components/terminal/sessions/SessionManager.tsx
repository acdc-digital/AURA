// SESSION MANAGER - Terminal session management UI
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/sessions/SessionManager.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { useConvexAuth } from "convex/react";
import { Plus } from "lucide-react";
import { SessionTab } from "./SessionTab";
import { useSessionSync } from "@/lib/hooks";
import { useUser } from "@/lib/hooks";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SessionManagerProps {
  className?: string;
}

export function SessionManager({ className }: SessionManagerProps) {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const { createSessionWithSync } = useSessionSync(false); // Don't run sync logic here
  
  // Get sessions from Convex
  const sessions = useQuery(
    api.chat.getUserSessions,
    user?.clerkId ? { userId: user.clerkId } : "skip"
  );
  
  // Transform Convex data to ChatSession format
  const transformedSessions = sessions?.map(session => ({
    sessionId: session.sessionId,
    title: session.title || 'Untitled Session',
    isActive: session.isActive,
    totalTokens: session.totalTokens,
    totalCost: session.totalCost,
    messageCount: session.messageCount,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    preview: session.preview || '',
    userId: typeof session.userId === 'string' ? session.userId : undefined,
    convexId: session._id,
  })) || [];
  
  // Get UI state from store
  const { activeSessionId, setActiveSession } = useTerminalSessionStore();
  
  const handleCreateSession = async () => {
    if (!isAuthenticated) return;
    
    try {
      await createSessionWithSync("New Chat Session");
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    setActiveSession(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    // TODO: Implement delete session functionality
    console.log("Delete session:", sessionId);
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    // TODO: Implement rename session functionality
    console.log("Rename session:", sessionId, newTitle);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b border-[#2d2d2d] bg-[#1e1e1e] ${className}`}>
      {/* Session Tabs */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {transformedSessions?.map((session) => (
          <SessionTab
            key={session.sessionId}
            session={session}
            isActive={session.sessionId === activeSessionId}
            onSwitch={() => handleSwitchSession(session.sessionId)}
            onDelete={() => handleDeleteSession(session.sessionId)}
            onRename={(newTitle: string) => handleRenameSession(session.sessionId, newTitle)}
            canDelete={(transformedSessions?.length || 0) > 1}
          />
        ))}
        
        {/* New Session Creation */}
        <Button
          onClick={handleCreateSession}
          variant="ghost"
          size="sm"
          className="p-1 h-7 w-7 rounded hover:bg-[#2d2d2d] text-[#858585] hover:text-[#cccccc]"
          title="New session"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
