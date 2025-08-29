// ONBOARDING CONTINUE BUTTON - Interactive button for completing onboarding process
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/_components/OnboardingContinueButton.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOnboarding } from "@/lib/hooks";
import { useUser } from "@/lib/hooks";
import { ArrowRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface OnboardingContinueButtonProps {
  messageId: Id<"chatMessages">;
  onContinued?: () => void;
}

export function OnboardingContinueButton({ 
  messageId, 
  onContinued 
}: OnboardingContinueButtonProps) {
  const { handleContinueOnboarding } = useOnboarding();
  const { user } = useUser();
  const updateComponent = useMutation(api.chat.updateInteractiveComponent);
  
  // Get the message to extract sessionId
  const message = useQuery(api.chat.getMessage, { messageId });

  const handleContinue = async () => {
    try {
      if (!message?.sessionId) {
        console.error("No session ID found for message");
        return;
      }

      if (!user?._id) {
        console.error("No user ID found");
        return;
      }

      console.log("🎯 Continue button clicked, calling handleContinueOnboarding...");
      console.log("📤 Calling handleContinueOnboarding with:", {
        sessionId: message.sessionId,
        userId: user._id,
      });

      // Handle complete continue workflow (updates status + sends orchestrator welcome)
      await handleContinueOnboarding({
        sessionId: message.sessionId,
        userId: user._id,
      });
      
      // Mark component as completed
      await updateComponent({
        messageId,
        status: "completed",
        result: { action: "continued" }
      });
      
      console.log("✅ handleContinueOnboarding completed, updating component status...");
      
      // Optional callback
      if (onContinued) {
        onContinued();
      }
    } catch (error) {
      console.error("Failed to continue from onboarding:", error);
    }
  };

  return (
    <div className="mt-3 max-w-xs">
      <Button
        onClick={handleContinue}
        variant="default"
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-6"
      >
        <ArrowRight className="w-3 h-3 mr-1.5" />
        Continue
      </Button>
    </div>
  );
}
