// CHAT TAB - Chat/AI interface display with Orchestrator Agent
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/ChatDisplay.tsx

"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { OrchestratorAgent } from "../../agents/_components/orchestrator";

export function ChatDisplay() {
  const [sessionId, setSessionId] = useState<string>();

  const handleSessionUpdate = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-[#2d2d30]">
        <div className="text-xs text-white flex items-center">
          <MessageCircle className="w-3 h-3 mr-2" />
          AI Chat - Orchestrator Agent
          {sessionId && (
            <span className="ml-2 text-[#858585]">
              ({sessionId.substring(0, 8)}...)
            </span>
          )}
        </div>
      </div>
      
      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <OrchestratorAgent 
          sessionId={sessionId}
          onSessionUpdate={handleSessionUpdate}
          className="h-full"
        />
      </div>
    </div>
  );
}
