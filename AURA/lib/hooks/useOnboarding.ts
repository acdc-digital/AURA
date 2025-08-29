// ONBOARDING HOOK - Enhanced custom hook for managing comprehensive onboarding workflow
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useOnboarding.ts

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "./useUser";

export function useOnboarding() {
  const { user, isLoading: userLoading } = useUser();
  
  // Check if user needs onboarding
  const needsOnboarding = useQuery(api.users.needsOnboarding);
  
  // Get current onboarding progress and state
  const onboardingProgress = useQuery(api.onboarding.getOnboardingProgress, {
    userId: user?._id,
  });
  
  // Get full onboarding state with responses
  const onboardingState = useQuery(api.onboarding.getOnboardingState, {
    userId: user?._id,
  });
  
  // Mutations and actions
  const updateOnboardingStatus = useMutation(api.users.updateOnboardingStatus);
  const updateOnboardingResponse = useMutation(api.onboarding.updateOnboardingResponse);
  const sendWelcome = useAction(api.onboarding.sendWelcomeMessage);
  const handleSkipOnboarding = useAction(api.onboarding.handleSkipOnboarding);
  const handleContinueOnboarding = useAction(api.onboarding.handleContinueOnboarding);
  const handleOnboardingMessage = useAction(api.onboarding.handleOnboardingMessage);
  const generateBrandGuidelines = useAction(api.onboarding.generateBrandGuidelines);
  
  return {
    // User data
    user,
    
    // Onboarding status
    needsOnboarding: !userLoading && needsOnboarding,
    isLoading: userLoading || needsOnboarding === undefined,
    onboardingStatus: user?.onboardingStatus,
    
    // Enhanced onboarding state
    currentStep: onboardingProgress?.currentStep || "welcome",
    completionPercentage: onboardingProgress?.completionPercentage || 0,
    isCompleted: onboardingProgress?.isCompleted || false,
    isSkipped: onboardingProgress?.isSkipped || false,
    responses: onboardingState?.responses || {},
    
    // Actions
    updateOnboardingStatus,
    updateOnboardingResponse,
    sendWelcome,
    handleSkipOnboarding,
    handleContinueOnboarding,
    handleOnboardingMessage,
    generateBrandGuidelines,
    
    // Helper methods with error handling
    startOnboarding: async () => {
      try {
        return await updateOnboardingStatus({ status: "in_progress" });
      } catch (error) {
        console.error('Failed to start onboarding:', error);
        throw new Error(`Unable to start onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    completeOnboarding: async () => {
      try {
        return await updateOnboardingStatus({ status: "completed" });
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        throw new Error(`Unable to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    skipOnboarding: async () => {
      try {
        return await updateOnboardingStatus({ status: "skipped" });
      } catch (error) {
        console.error('Failed to skip onboarding:', error);
        throw new Error(`Unable to skip onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    // Workflow helpers with error handling
    updateBrandName: async (brandName: string, sessionId: string) => {
      try {
        return await updateOnboardingResponse({
          userId: user?._id || "",
          sessionId,
          step: "brand_name",
          responseData: brandName,
        });
      } catch (error) {
        console.error('Failed to update brand name:', error);
        throw new Error(`Unable to update brand name: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateBrandDescription: async (description: string, sessionId: string) => {
      try {
        return await updateOnboardingResponse({
          userId: user?._id || "",
          sessionId,
          step: "brand_description",
          responseData: description,
        });
      } catch (error) {
        console.error('Failed to update brand description:', error);
        throw new Error(`Unable to update brand description: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateTargetAudience: async (audience: { primaryAudience: string; secondaryAudience?: string }, sessionId: string) => {
      try {
        return await updateOnboardingResponse({
          userId: user?._id || "",
          sessionId,
          step: "target_audience",
          responseData: audience,
        });
      } catch (error) {
        console.error('Failed to update target audience:', error);
        throw new Error(`Unable to update target audience: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
      
    updateBrandPersonality: async (personality: string[], sessionId: string) => {
      try {
        return await updateOnboardingResponse({
          userId: user?._id || "",
          sessionId,
          step: "brand_personality",
          responseData: personality,
        });
      } catch (error) {
        console.error('Failed to update brand personality:', error);
        throw new Error(`Unable to update brand personality: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
      
    updateBrandValues: async (values: string[], sessionId: string) => {
      try {
        return await updateOnboardingResponse({
          userId: user?._id || "",
          sessionId,
          step: "brand_values",
          responseData: values,
        });
      } catch (error) {
        console.error('Failed to update brand values:', error);
        throw new Error(`Unable to update brand values: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
      
    // Complete the onboarding workflow with error handling
    completeOnboardingWorkflow: async () => {
      try {
        if (!user?._id) {
          throw new Error('User ID is required to complete onboarding');
        }
        await generateBrandGuidelines({ userId: user._id });
        await updateOnboardingStatus({ status: "completed" });
      } catch (error) {
        console.error('Failed to complete onboarding workflow:', error);
        throw new Error(`Unable to complete onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  };
}
