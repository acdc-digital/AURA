// ONBOARDING HOOK - Custom hook for managing onboarding state
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useOnboarding.ts

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "./useUser";

export function useOnboarding() {
  const { user, isLoading: userLoading } = useUser();
  
  // Check if user needs onboarding
  const needsOnboarding = useQuery(api.users.needsOnboarding);
  
  // Update onboarding status mutation
  const updateOnboardingStatus = useMutation(api.users.updateOnboardingStatus);
  
  // Send welcome message action
  const sendWelcome = useAction(api.onboarding.sendWelcomeMessage);
  
  return {
    user,
    needsOnboarding: !userLoading && needsOnboarding,
    isLoading: userLoading || needsOnboarding === undefined,
    onboardingStatus: user?.onboardingStatus,
    updateOnboardingStatus,
    sendWelcome,
    
    // Helper methods
    startOnboarding: () => updateOnboardingStatus({ status: "in_progress" }),
    completeOnboarding: () => updateOnboardingStatus({ status: "completed" }),
    skipOnboarding: () => updateOnboardingStatus({ status: "skipped" }),
  };
}
