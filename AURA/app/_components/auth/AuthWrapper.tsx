// AUTHENTICATION WRAPPER - Handles auth state and redirects
// /Users/matthewsimon/Projects/AURA/AURA/components/auth/AuthWrapper.tsx

"use client";

import { useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { SignInCard } from "@/app/_components/auth/SignInCard";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const { isSignedIn, isLoaded } = useUser();

  // Combined authentication state
  const isAuthenticated = isSignedIn && isConvexAuthenticated;
  const isLoading = !isLoaded || isConvexLoading;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0e0e0e] text-[#cccccc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e639c] mx-auto mb-4"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-[#0e0e0e]">
        <SignInCard />
      </div>
    );
  }

  return <>{children}</>;
}
