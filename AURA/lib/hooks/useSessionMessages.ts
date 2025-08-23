// SESSION MESSAGES HOOK - Manage chat messages for active session
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useSessionMessages.ts

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { useConvexAuth } from "convex/react";
import { useMemo } from "react";

export function useSessionMessages() {
  const { isAuthenticated } = useConvexAuth();
  const { activeSessionId } = useTerminalSessionStore();
  
  // Get messages for the active session
  const messages = useQuery(
    api.chat.getMessages, 
    activeSessionId && isAuthenticated 
      ? { sessionId: activeSessionId, limit: 100 } 
      : "skip"
  );
  
  // Mutation to add new message
  const addMessage = useMutation(api.chat.addMessage);
  
  // Formatted messages for display
  const formattedMessages = useMemo(() => {
    if (!messages) return [];
    
    return messages.map(msg => {
      // Format message for terminal display
      const timestamp = new Date(msg.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      switch (msg.role) {
        case 'user':
          return `chat> ${msg.content}`;
        case 'assistant':
          return `🤖 Orchestrator: ${msg.content}`;
        case 'system':
          return `📋 ${msg.content}`;
        default:
          return msg.content;
      }
    });
  }, [messages]);
  
  // Function to add a user message
  const addUserMessage = async (content: string) => {
    if (!activeSessionId || !isAuthenticated) return;
    
    await addMessage({
      role: "user",
      content,
      sessionId: activeSessionId,
      userId: undefined, // Will be set by auth context in Convex
    });
  };
  
  // Function to add assistant response
  const addAssistantMessage = async (
    content: string, 
    tokenData?: {
      tokenCount?: number;
      inputTokens?: number;
      outputTokens?: number;
      estimatedCost?: number;
    }
  ) => {
    if (!activeSessionId || !isAuthenticated) return;
    
    await addMessage({
      role: "assistant",
      content,
      sessionId: activeSessionId,
      userId: undefined,
      ...tokenData,
    });
  };
  
  return {
    messages: messages || [],
    formattedMessages,
    isLoading: messages === undefined,
    addUserMessage,
    addAssistantMessage,
    activeSessionId,
  };
}
