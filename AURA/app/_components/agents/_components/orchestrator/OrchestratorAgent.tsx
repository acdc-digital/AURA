// ORCHESTRATOR AGENT - Main orchestrator component for multi-agent conversation system
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/orchestrator/OrchestratorAgent.tsx

"use client";

import { FC, useCallback, useEffect, useState, useMemo } from "react";
import { useConvexAuth } from "convex/react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleAutoScrollTest } from "./SimpleAutoScrollTest";
import { TerminalMessage } from "../../../terminal/chat/_components/TerminalMessage";

// Hooks
import { useUser } from "@/lib/hooks/useUser";

// Types
interface OrchestratorAgentProps {
  sessionId?: string;
  onSessionUpdate?: (sessionId: string) => void;
  className?: string;
}

export const OrchestratorAgent: FC<OrchestratorAgentProps> = ({
  sessionId,
  onSessionUpdate,
  className,
}) => {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { user } = useUser();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate session ID if not provided
  const currentSessionId = sessionId || `orchestrator-${Date.now()}`;
  
  // Convex mutations and queries
  const sendToOrchestrator = useAction(api.orchestrator.sendMessage);
  const addMessage = useMutation(api.chat.addMessage);
  const messagesData = useQuery(api.orchestrator.getConversationHistory, {
    sessionId: currentSessionId,
  });
  
  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => {
    const msgs = messagesData ?? [];
    
    // Debug logging for interactive components
    msgs.forEach(msg => {
      if (msg.interactiveComponent) {
        console.log("🎯 OrchestratorAgent - Message with interactive component:", {
          messageId: msg._id,
          type: msg.interactiveComponent.type,
          status: msg.interactiveComponent.status,
          content: msg.content?.substring(0, 50) + "..."
        });
      }
    });
    
    return msgs;
  }, [messagesData]);

  // Handle session update
  useEffect(() => {
    if (onSessionUpdate && currentSessionId) {
      onSessionUpdate(currentSessionId);
    }
  }, [currentSessionId, onSessionUpdate]);

  // Handle message submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Add user message to chat
      await addMessage({
        role: "user",
        content: inputValue.trim(),
        sessionId: currentSessionId,
        userId: user?._id,
      });

      // Clear input immediately for better UX
      setInputValue("");

      // Send to orchestrator for processing
      await sendToOrchestrator({
        message: inputValue.trim(),
        sessionId: currentSessionId,
        userId: user?._id,
      });
    } catch (error) {
      console.error("Failed to send message to orchestrator:", error);
      
      // Add error message to chat
      await addMessage({
        role: "system",
        content: "Failed to send message. Please try again.",
        sessionId: currentSessionId,
        userId: user?._id,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, isSubmitting, addMessage, sendToOrchestrator, currentSessionId, user?._id]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading orchestrator...</div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Please sign in to use the orchestrator agent.
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${className || ""}`}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-medium text-foreground">Orchestrator Agent</h3>
        <p className="text-xs text-muted-foreground">
          Session: {currentSessionId.substring(0, 16)}...
        </p>
      </div>

      {/* Messages Area with Simple Auto-scroll Test */}
      <SimpleAutoScrollTest messages={messages} className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-lg font-medium">
                Orchestrator Agent Ready
              </div>
              <div className="text-sm text-muted-foreground">
                Start a conversation with the orchestrator agent. It will help you
                <br />
                navigate tasks and coordinate with specialized agents when needed.
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message._id}
              className="mb-4"
            >
              <TerminalMessage
                message={message}
                isLast={false}
                onRegenerate={() => {
                  // TODO: Implement regeneration logic
                  console.log('Regenerate message:', message._id);
                }}
              />
            </div>
          ))}
        </div>
      </SimpleAutoScrollTest>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the orchestrator agent for help with any task..."
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isSubmitting}
            className="px-4"
          >
            {isSubmitting ? "..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};
