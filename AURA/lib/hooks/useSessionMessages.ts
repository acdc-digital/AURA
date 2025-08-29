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
  
  // Function to add a user message with error handling
  const addUserMessage = async (content: string) => {
    try {
      if (!activeSessionId || !isAuthenticated) {
        throw new Error('Session ID and authentication required');
      }
      
      await addMessage({
        role: "user",
        content,
        sessionId: activeSessionId,
        userId: undefined, // Will be set by auth context in Convex
      });
    } catch (error) {
      console.error('Failed to add user message:', error);
      throw new Error(`Unable to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Function to add assistant response with error handling
  const addAssistantMessage = async (
    content: string, 
    tokenData?: {
      tokenCount?: number;
      inputTokens?: number;
      outputTokens?: number;
      estimatedCost?: number;
    }
  ) => {
    try {
      if (!activeSessionId || !isAuthenticated) {
        throw new Error('Session ID and authentication required');
      }
      
      await addMessage({
        role: "assistant",
        content,
        sessionId: activeSessionId,
        userId: undefined,
        ...tokenData,
      });
    } catch (error) {
      console.error('Failed to add assistant message:', error);
      throw new Error(`Unable to send assistant message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return {
    messages: messages || [],
    rawMessages: messages || [], // Add raw messages for action handling
    formattedMessages,
    isLoading: messages === undefined,
    addUserMessage,
    addAssistantMessage,
    activeSessionId,
  };
}
