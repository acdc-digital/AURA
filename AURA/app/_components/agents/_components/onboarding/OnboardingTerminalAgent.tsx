// ONBOARDING TERMINAL AGENT - Terminal-based onboarding agent matching orchestrator interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/onboarding/OnboardingTerminalAgent.tsx

"use client";

import { FC, useCallback, useEffect, useState, useMemo } from "react";
import { useConvexAuth } from "convex/react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TerminalMessage } from "../../../terminal/chat/_components/TerminalMessage";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/app/_components/chat";

// Hooks
import { useUser, useOnboarding } from "@/lib/hooks";

interface OnboardingTerminalAgentProps {
  sessionId?: string;
  onSessionUpdate?: (sessionId: string) => void;
  className?: string;
}

export const OnboardingTerminalAgent: FC<OnboardingTerminalAgentProps> = ({
  sessionId,
  onSessionUpdate,
  className,
}) => {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { user } = useUser();
  const { updateOnboardingStatus } = useOnboarding();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Generate session ID if not provided
  const currentSessionId = sessionId || `onboarding-${Date.now()}`;
  
  // Convex mutations and actions
  const handleOnboardingMessage = useAction(api.onboarding.handleOnboardingMessage);
  const sendWelcome = useAction(api.onboarding.sendWelcomeMessage);
  const messagesData = useQuery(api.chat.getMessages, {
    sessionId: currentSessionId,
  });
  
  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => messagesData ?? [], [messagesData]);

  // Handle session update
  useEffect(() => {
    if (currentSessionId && onSessionUpdate) {
      onSessionUpdate(currentSessionId);
    }
  }, [currentSessionId, onSessionUpdate]);

  // Initialize onboarding with welcome message
  useEffect(() => {
    const initializeOnboarding = async () => {
      if (!hasInitialized && isAuthenticated && user && currentSessionId) {
        setHasInitialized(true);
        
        try {
          // Update user status to in_progress
          await updateOnboardingStatus({ status: "in_progress" });
          
          // Send welcome message
          await sendWelcome({
            sessionId: currentSessionId,
            userId: user._id,
          });
        } catch (error) {
          console.error("Failed to initialize onboarding:", error);
        }
      }
    };
    
    initializeOnboarding();
  }, [hasInitialized, isAuthenticated, user, currentSessionId, updateOnboardingStatus, sendWelcome]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSubmitting || !isAuthenticated || !user) {
      return;
    }

    const message = inputValue.trim();
    setInputValue("");
    setIsSubmitting(true);

    try {
      // Check for skip or completion commands
      if (message.toLowerCase().includes("skip") || message.toLowerCase().includes("no thanks")) {
        await updateOnboardingStatus({ status: "skipped" });
        return;
      }

      // Send message to onboarding agent
      await handleOnboardingMessage({
        message,
        sessionId: currentSessionId,
        userId: user._id,
      });
    } catch (error) {
      console.error("Failed to send onboarding message:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, isSubmitting, isAuthenticated, user, currentSessionId, handleOnboardingMessage, updateOnboardingStatus]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  }, [handleSubmit]);

  // Skip onboarding
  const handleSkip = useCallback(async () => {
    try {
      await updateOnboardingStatus({ status: "skipped" });
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
    }
  }, [updateOnboardingStatus]);

  // Complete onboarding
  const handleComplete = useCallback(async () => {
    try {
      await updateOnboardingStatus({ status: "completed" });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  }, [updateOnboardingStatus]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-xs text-[#858585]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-xs text-[#858585]">Please sign in to continue</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Display with proper auto-scroll */}
      <Conversation className="flex-1" style={{ minHeight: 0 }}>
        <ConversationContent className="px-4 py-2">
          {messages.map((message) => (
            <div
              key={message._id}
              className="mb-4"
            >
              <TerminalMessage
                message={message}
                isLast={false}
                onRegenerate={() => {
                  // TODO: Implement regeneration logic for onboarding
                  console.log('Regenerate onboarding message:', message._id);
                }}
              />
            </div>
          ))}
          
          {isSubmitting && (
            <div className="text-xs text-[#858585] italic px-2 py-2">
              Processing your response...
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-[#2d2d30] bg-[#0e0e0e]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={isSubmitting}
            className="flex-1 bg-[#1e1e1e] border-[#2d2d30] text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isSubmitting}
            className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </Button>
        </form>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-[#858585]">
            Press Enter to send &bull; Say &quot;skip&quot; to skip onboarding
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-[#858585] hover:text-white"
            >
              Skip Setup
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-xs text-green-400 hover:text-green-300"
            >
              I&apos;m Ready!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
