// ONBOARDING SKIP BUTTON - Interactive button for skipping onboarding process
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/_components/OnboardingSkipButton.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOnboarding } from "@/lib/hooks";
import { useUser } from "@/lib/hooks";
import { ArrowRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface OnboardingSkipButtonProps {
  messageId: Id<"chatMessages">;
  isDisabled?: boolean;
  onSkipped?: () => void;
}

export function OnboardingSkipButton({ 
  messageId, 
  isDisabled = false,
  onSkipped 
}: OnboardingSkipButtonProps) {
  const { handleSkipOnboarding, hasStartedEngaging = false } = useOnboarding();
  const { user } = useUser();
  const updateComponent = useMutation(api.chat.updateInteractiveComponent);
  
  // Get the message to extract sessionId
  const message = useQuery(api.chat.getMessage, { messageId });

  // Determine if button should be disabled: either explicitly disabled or user has started engaging
  const shouldDisable = isDisabled || hasStartedEngaging;

  const handleSkip = async () => {
    if (shouldDisable) return; // Don't handle clicks when disabled
    
    try {
      console.log("🎯 Skip button clicked, calling handleSkipOnboarding...");
      if (!message?.sessionId) {
        console.error("No session ID found for message");
        return;
      }

      if (!user?._id) {
        console.error("No user ID found");
        return;
      }

      console.log("📤 Calling handleSkipOnboarding with:", {
        sessionId: message.sessionId,
        userId: user._id
      });

      // Handle complete skip workflow (updates status + sends orchestrator welcome)
      await handleSkipOnboarding({
        sessionId: message.sessionId,
        userId: user._id,
      });
      
      console.log("✅ handleSkipOnboarding completed, updating component status...");

      // Mark component as completed
      await updateComponent({
        messageId,
        status: "completed",
        result: { action: "skipped" }
      });
      
      console.log("🎉 Skip process completed successfully");

      // Optional callback
      if (onSkipped) {
        onSkipped();
      }
    } catch (error) {
      console.error("❌ Failed to skip onboarding:", error);
    }
  };  return (
    <div className="mt-3 max-w-xs">
      <Button
        onClick={handleSkip}
        disabled={shouldDisable}
        variant="outline"
        size="sm"
        className={`bg-[#1e1e1e] border-[#2d2d2d] text-xs px-2 py-1 h-6 ${
          shouldDisable
            ? 'text-[#666666] cursor-not-allowed opacity-50'
            : 'text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white'
        }`}
      >
        <ArrowRight className="w-3 h-3 mr-1.5" />
        {hasStartedEngaging ? 'Onboarding Started' : shouldDisable ? 'Skipped' : 'Skip'}
      </Button>
    </div>
  );
}
