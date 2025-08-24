// SESSION TOKENS HOOK - Hook for tracking token usage in terminal sessions
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useSessionTokens.ts

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatTokenCount, formatCost, getTokenUsageStatus } from "../utils/tokens";

/**
 * Hook to get token statistics for a session
 */
export function useSessionTokens(sessionId: string | null) {
  const tokenStats = useQuery(
    api.chat.getSessionTokens,
    sessionId ? { sessionId } : "skip"
  );

  return {
    tokenStats,
    isLoading: tokenStats === undefined,
    totalTokens: tokenStats?.totalTokens ?? 0,
    totalInputTokens: tokenStats?.totalInputTokens ?? 0,
    totalOutputTokens: tokenStats?.totalOutputTokens ?? 0,
    totalCost: tokenStats?.totalCost ?? 0,
    messageCount: tokenStats?.messageCount ?? 0,
    maxTokensAllowed: tokenStats?.maxTokensAllowed ?? 180000,
    percentageUsed: tokenStats?.percentageUsed ?? 0,
    
    // Helper function to format token count
    formatTokenCount: (tokens: number) => formatTokenCount(tokens),
    
    // Helper function to format cost
    formatCost: (cost: number) => formatCost(cost),
    
    // Helper function to get token usage status
    getUsageStatus: () => getTokenUsageStatus(tokenStats?.percentageUsed ?? 0),
  };
}
