// ONBOARDING SKIP BUTTON - Interactive button for skipping onboarding process
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/_components/OnboardingSkipButton.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOnboarding } from "@/lib/hooks";
import { ArrowRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface OnboardingSkipButtonProps {
  messageId: Id<"chatMessages">;
  onSkipped?: () => void;
}

export function OnboardingSkipButton({ 
  messageId, 
  onSkipped 
}: OnboardingSkipButtonProps) {
  const { handleSkipOnboarding } = useOnboarding();
  const updateComponent = useMutation(api.chat.updateInteractiveComponent);
  
  // Get the message to extract sessionId and userId
  const message = useQuery(api.chat.getMessage, { messageId });

  const handleSkip = async () => {
    try {
      if (!message?.sessionId) {
        console.error("No session ID found for message");
        return;
      }

      // Handle complete skip workflow (updates status + sends orchestrator welcome)
      await handleSkipOnboarding({
        sessionId: message.sessionId,
        userId: message.userId,
      });
      
      // Mark component as completed
      await updateComponent({
        messageId,
        status: "completed",
        result: { action: "skipped" }
      });
      
      // Optional callback
      if (onSkipped) {
        onSkipped();
      }
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
    }
  };

  return (
    <div className="mt-3 max-w-xs">
      <Button
        onClick={handleSkip}
        variant="outline"
        size="sm"
        className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white text-xs px-2 py-1 h-6"
      >
        <ArrowRight className="w-3 h-3 mr-1.5" />
        Skip
      </Button>
    </div>
  );
}
