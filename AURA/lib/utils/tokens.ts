// TOKEN UTILS - Utilities for token counting and cost estimation
// /Users/matthewsimon/Projects/AURA/AURA/lib/utils/tokens.ts

/**
 * Count tokens in a text string using character-based estimation
 * Note: Actual token counting is done server-side via Anthropic API
 * This is just for rough client-side estimation
 */
export function countTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for most text
  // This is less accurate than real tokenization but good for estimation
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost based on token usage
 * Using Anthropic Claude pricing: $3/1M input tokens, $15/1M output tokens
 */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  return inputCost + outputCost;
}

/**
 * Format token count for display (e.g., 1500 -> "1.5K")
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  } else if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Format cost for display (e.g., 0.0025 -> "$0.0025")
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

/**
 * Get token usage status based on percentage used
 */
export function getTokenUsageStatus(percentage: number): 'normal' | 'warning' | 'critical' {
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'normal';
}

/**
 * Get color class for token usage display
 */
export function getTokenUsageColor(status: 'normal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'critical':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    default:
      return 'text-[#858585]';
  }
}

/**
 * Calculate tokens for a conversation/session messages
 */
export function calculateSessionTokens(messages: Array<{ content: string; tokenCount?: number }>): {
  totalTokens: number;
  messageTokens: number[];
} {
  const messageTokens = messages.map(msg => {
    if (msg.tokenCount) {
      return msg.tokenCount;
    }
    return countTokens(msg.content);
  });
  
  const totalTokens = messageTokens.reduce((sum, tokens) => sum + tokens, 0);
  
  return {
    totalTokens,
    messageTokens,
  };
}
