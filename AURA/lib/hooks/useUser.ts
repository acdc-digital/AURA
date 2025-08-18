// USER DATA HOOK - Custom hook for user data management following state architecture
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useUser.ts

import { useUser as useClerkUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect } from "react";

export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface UseUserReturn {
  // User data from Convex (source of truth for profile data)
  user: ReturnType<typeof useQuery<typeof api.users.getCurrentUser>>;
  clerkUser: ReturnType<typeof useClerkUser>["user"];
  isLoading: boolean;
  isSignedIn: boolean;
  
  // Actions
  updateProfile: (data: UserProfileUpdateData) => Promise<void>;
  ensureUserExists: () => Promise<void>;
  
  // User stats
  stats: ReturnType<typeof useQuery<typeof api.users.getUserStats>>;
  isStatsLoading: boolean;
}

/**
 * Custom hook that manages user data following AURA state architecture:
 * - Clerk handles authentication state
 * - Convex stores and manages persistent user profile data
 * - This hook bridges the two systems
 */
export function useUser(): UseUserReturn {
  const { user: clerkUser, isSignedIn, isLoaded } = useClerkUser();
  
  // Convex queries - these are our source of truth for user data
  const user = useQuery(api.users.getCurrentUser);
  // Only fetch stats if user is authenticated (user exists)
  const stats = useQuery(api.users.getUserStats, user ? {} : "skip");
  
  // Convex mutations
  const upsertUser = useMutation(api.users.upsertUser);
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  // Loading states
  const isLoading = !isLoaded || (isSignedIn && user === undefined);
  const isStatsLoading = stats === undefined;

  // Ensure user exists in Convex when they sign in
  const ensureUserExists = useCallback(async () => {
    if (!clerkUser || !isSignedIn) return;

    try {
      await upsertUser({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        username: clerkUser.username || undefined,
        imageUrl: clerkUser.imageUrl || undefined,
      });
    } catch (error) {
      console.error("Failed to upsert user:", error);
      throw error;
    }
  }, [clerkUser, isSignedIn, upsertUser]);

  // Auto-sync user on sign in
  useEffect(() => {
    if (isSignedIn && clerkUser && !user) {
      ensureUserExists();
    }
  }, [isSignedIn, clerkUser, user, ensureUserExists]);

  // Update user profile
  const updateProfile = useCallback(async (data: UserProfileUpdateData) => {
    if (!isSignedIn || !user) {
      throw new Error("User must be signed in to update profile");
    }

    try {
      await updateUserProfile(data);
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  }, [isSignedIn, user, updateUserProfile]);

  return {
    user,
    clerkUser,
    isLoading,
    isSignedIn: isSignedIn ?? false,
    updateProfile,
    ensureUserExists,
    stats,
    isStatsLoading,
  };
}
