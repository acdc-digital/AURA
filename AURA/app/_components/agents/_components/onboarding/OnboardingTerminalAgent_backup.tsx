// ONBOARDING TERMINAL AGENT - Terminal-based onboarding agent with proper session management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/onboarding/OnboardingTerminalAgent.tsx

"use client";

import { FC, useCallback, useEffect, useState, useMemo } from "react";
import { useConvexAuth } from "convex/react";
import { useQuery, useAction, useMutation } from "convex/react";
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Convex mutations and actions
  const handleOnboardingMessage = useAction(api.onboarding.handleOnboardingMessage);
  const sendWelcome = useAction(api.onboarding.sendWelcomeMessage);
  const createChatSession = useMutation(api.chat.createSession);

  // Create or get session ID
  useEffect(() => {
    const initSession = async () => {
      if (sessionId) {
        setCurrentSessionId(sessionId);
      } else if (!currentSessionId && user) {
        // Create a new onboarding session
        const newSessionId = `onboarding-${Date.now()}`;
        
        try {
          // Create the session in the database
          await createChatSession({
            sessionId: newSessionId,
            title: "Onboarding Chat",
            userId: user._id,
          });
          
          setCurrentSessionId(newSessionId);
          
          if (onSessionUpdate) {
            onSessionUpdate(newSessionId);
          }
        } catch (error) {
          console.error("Failed to create onboarding session:", error);
        }
      }
    };

    initSession();
  }, [sessionId, currentSessionId, user, createChatSession, onSessionUpdate]);

  const messagesData = useQuery(api.chat.getMessages, {
    sessionId: currentSessionId || undefined,
  });
  
  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => messagesData ?? [], [messagesData]);

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
    
    if (!inputValue.trim() || isSubmitting || !currentSessionId) {
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
      console.log('🚀 Calling handleOnboardingMessage with:', {
        message,
        sessionId: currentSessionId,
        userObject: user,
        isAuthenticated,
        hasUser: !!user,
      });
      
      const result = await handleOnboardingMessage({
        message,
        sessionId: currentSessionId,
      });
      
      console.log('📥 handleOnboardingMessage result:', result);

      if (!result.success) {
        console.error('❌ Failed to process onboarding message:', result.error);
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, isSubmitting, currentSessionId, user, isAuthenticated, handleOnboardingMessage, updateOnboardingStatus]);

  // Loading state
  if (authLoading || !currentSessionId) {
    return (
      <div className={`flex items-center justify-center h-64 ${className || ""}`}>
        <div className="text-[#888888]">Initializing onboarding...</div>
      </div>
    );
  }

  // Authentication required
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center h-64 ${className || ""}`}>
        <div className="text-[#888888]">Authentication required</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      {/* Messages Container */}
      <div className="flex-1 min-h-0">
        <Conversation className="h-full">
          <ConversationContent className="pb-2">
            {messages.map((message, index) => (
              <TerminalMessage
                key={message._id || `${message.role}-${index}`}
                message={{
                  role: message.role as "user" | "assistant" | "system",
                  content: message.content,
                  timestamp: message._creationTime,
                }}
                className="mb-2"
              />
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#333333] p-4 bg-[#1e1e1e]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me about your brand..."
            className="flex-1 bg-[#2d2d2d] border-[#404040] text-[#cccccc] focus:border-[#0078d4] focus:outline-none"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !inputValue.trim()}
            className="px-6 bg-[#0078d4] hover:bg-[#106ebe] text-white disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};
