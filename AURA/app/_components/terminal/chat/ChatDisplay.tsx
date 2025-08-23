// CHAT TAB - Chat/AI interface display with Session Management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/ChatDisplay.tsx

"use client";

import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { MessageCircle } from "lucide-react";
import { SessionManager } from "../sessions";
import { OrchestratorAgent } from "../../agents/_components/orchestrator";

export function ChatDisplay() {
  const { activeSessionId, getActiveSession } = useTerminalSessionStore();
  
  const activeSession = getActiveSession();

  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* Session Management Header */}
      <SessionManager />
      
      {/* Chat Header */}
      <div className="flex-shrink-0 p-3 border-b border-[#2d2d30]">
        <div className="text-xs text-white flex items-center">
          <MessageCircle className="w-3 h-3 mr-2" />
          AI Chat - {activeSession?.title || 'No Session'}
          {activeSessionId && (
            <span className="ml-2 text-[#858585]">
              ({activeSessionId.substring(0, 8)}...)
            </span>
          )}
        </div>
      </div>
      
      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        {activeSessionId ? (
          <OrchestratorAgent
            sessionId={activeSessionId}
            onSessionUpdate={() => {}} // Session updates now handled by store
            className="h-full"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-xs text-[#858585]">
              No active session. Creating session...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
