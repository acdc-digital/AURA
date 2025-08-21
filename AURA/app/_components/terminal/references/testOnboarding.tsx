// Test Onboarding Component - for development testing
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/testOnboarding.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding";

interface TestOnboardingProps {
  forceNewUserState?: () => void;
}

export function TestOnboarding({ forceNewUserState }: TestOnboardingProps) {
  const { resetOnboarding, setOnboardingActive, setCurrentStep } = useOnboardingStore();

  const handleResetOnboarding = () => {
    resetOnboarding();
    setOnboardingActive(true);
    setCurrentStep('welcome');
    
    // Clear onboarding completion states
    const completionKeys = [
      'onboardingCompleted',
      'onboarding_completed',
      'hasCompletedOnboarding'
    ];
    completionKeys.forEach(key => localStorage.removeItem(key));
    
    // Refresh the page to trigger onboarding
    window.location.reload();
  };

  const handleResetNewUser = () => {
    // Clear all storage including onboarding storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes("eac_user_visited_") || key.startsWith("eac_") || key.includes("onboarding") || key.includes("chat") || key.includes("editor")) {
        localStorage.removeItem(key);
      }
    });
    
    // Also clear specific onboarding completion keys
    const completionKeys = [
      'onboardingCompleted',
      'onboarding_completed',
      'hasCompletedOnboarding'
    ];
    completionKeys.forEach(key => localStorage.removeItem(key));
    
    sessionStorage.clear();
    
    // Reset new user detection state
    if (forceNewUserState) {
      forceNewUserState();
    }
    
    // Reset onboarding state
    resetOnboarding();
    
    console.log('🧹 Reset complete - cleared all storage and reset onboarding & new user detection');
    
    // Refresh the page to simulate new user experience
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="p-2 border border-[#333] rounded bg-[#1a1a1a] mb-2">
      <p className="text-xs text-[#888] mb-2">Development Testing:</p>
      <div className="flex gap-2">
        <Button 
          onClick={handleResetOnboarding}
          size="sm"
          variant="outline"
          className="text-xs h-6"
        >
          🔄 Reset Onboarding
        </Button>
        <Button 
          onClick={handleResetNewUser}
          size="sm"
          variant="outline"
          className="text-xs h-6"
        >
          🎯 Force New User
        </Button>
      </div>
    </div>
  );
}
