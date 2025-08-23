// SESSION MANAGER - Terminal session management UI
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/sessions/SessionManager.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { useConvexAuth } from "convex/react";
import { Plus } from "lucide-react";
import { SessionTab } from "./SessionTab";

interface SessionManagerProps {
  className?: string;
}

export function SessionManager({ className }: SessionManagerProps) {
  const { isAuthenticated } = useConvexAuth();
  const { 
    sessions, 
    activeSessionId, 
    switchSession, 
    deleteSession,
    renameSession,
    createSession,
  } = useTerminalSessionStore();
  
  const handleCreateSession = async () => {
    if (!isAuthenticated) return;
    
    await createSession(); // Auto-generate title, no input needed
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b border-[#2d2d2d] bg-[#1e1e1e] ${className}`}>
      {/* Session Tabs */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {sessions.map((session) => (
          <SessionTab
            key={session.sessionId}
            session={session}
            isActive={session.sessionId === activeSessionId}
            onSwitch={() => switchSession(session.sessionId)}
            onDelete={() => deleteSession(session.sessionId)}
            onRename={(newTitle: string) => renameSession(session.sessionId, newTitle)}
            canDelete={sessions.length > 1}
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
