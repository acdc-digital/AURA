// AUTH SYNCHRONIZATION - Handles user sync between Clerk and Convex
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/auth/AuthSync.tsx

"use client";

import { useUser } from "@/lib/hooks";
import { useEffect } from "react";

/**
 * AuthSync component ensures user data is synchronized between Clerk and Convex
 * This component should be rendered once in the app layout to handle automatic user sync
 */
export function AuthSync() {
  const { clerkUser, user, isLoading, ensureUserExists } = useUser();

  useEffect(() => {
    // Auto-sync user when they sign in and don't exist in Convex yet
    if (clerkUser && !isLoading && !user) {
      ensureUserExists().catch((error) => {
        console.error("Failed to sync user with Convex:", error);
      });
    }
  }, [clerkUser, user, isLoading, ensureUserExists]);

  // This component doesn't render anything - it's just for sync logic
  return null;
}
