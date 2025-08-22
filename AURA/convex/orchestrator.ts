// ORCHESTRATOR CONVEX FUNCTIONS - Main orchestrator agent backend integration
// /Users/matthewsimon/Projects/AURA/AURA/convex/orchestrator.ts

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Anthropic Claude API integration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// System prompt for the orchestrator agent
const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Orchestrator Agent for the AURA platform, a powerful IDE-style development environment. Your role is to:

1. **Understand User Intent**: Analyze user requests and determine what they want to accomplish
2. **Provide Helpful Guidance**: Offer clear, actionable responses to user questions
3. **Coordinate Tasks**: When complex tasks require specialized tools or agents, explain what would be needed
4. **Maintain Context**: Keep track of the conversation and provide contextually relevant responses

## About AURA Platform:
- Modern IDE-style development environment with VS Code inspired interface
- Built with Next.js, TypeScript, Tailwind CSS, and Convex backend
- Includes terminal, project management, file operations, and agent system
- Supports both individual development and team collaboration

## Your Capabilities:
- Conversational AI assistance for development tasks
- Guidance on AURA platform features and usage
- Help with project planning and task breakdown
- Code review and development best practices
- Troubleshooting and debugging assistance

## Communication Style:
- Be conversational but professional
- Provide clear, actionable guidance
- Ask clarifying questions when needed
- Break down complex tasks into manageable steps
- Reference specific AURA features when relevant

## Important Notes:
- You currently operate as a conversational agent without access to external tools
- When users request actions that would require tools (file operations, API calls, etc.), explain what would be needed
- Focus on providing maximum value through guidance, planning, and conversation
- Always be helpful and aim to move the user forward in their goals

Engage naturally and help users accomplish their development goals within the AURA platform.`;

// Helper query to get conversation history
export const getConversationHistory = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const messages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .order("asc")
      .take(20); // Last 20 messages for context

    return messages;
  },
});

// Helper mutation to save a chat message
export const saveChatMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("terminal"), v.literal("thinking")),
    content: v.string(),
    sessionId: v.string(),
    userId: v.optional(v.string()),
    tokenCount: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Send message to orchestrator and get response
export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { message, sessionId, userId }): Promise<{
    success: boolean;
    response: string;
    tokenCount: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  }> => {
    try {
      // Get conversation history for context
      const messages: any[] = await ctx.runQuery(api.orchestrator.getConversationHistory, {
        sessionId,
      });

      // Save user message to database first
      await ctx.runMutation(api.orchestrator.saveChatMessage, {
        role: "user",
        content: message,
        sessionId,
        userId,
      });

      // Format conversation history for Anthropic API
      const conversationHistory: Array<{ role: string; content: string }> = messages
        .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
        .map((msg: any) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }));

      // Add current message
      conversationHistory.push({
        role: "user",
        content: message,
      });

      // Prepare request to Anthropic API
      const requestBody: any = {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.7,
        system: ORCHESTRATOR_SYSTEM_PROMPT,
        messages: conversationHistory,
      };

      // Make request to Anthropic API
      if (!ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY environment variable is not set");
      }

      const response: Response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Anthropic API error:", response.status, errorText);
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data: any = await response.json();
      
      // Extract response content
      const assistantResponse: string = data.content?.[0]?.text || "I apologize, but I encountered an issue processing your request.";
      
      // Calculate token usage and estimated cost
      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      // Rough cost estimation for Claude 3.5 Sonnet (as of late 2024)
      // Input: ~$3 per 1M tokens, Output: ~$15 per 1M tokens
      const estimatedCost = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);

      // Save assistant response to database
      await ctx.runMutation(api.orchestrator.saveChatMessage, {
        role: "assistant",
        content: assistantResponse,
        sessionId,
        userId,
        tokenCount: totalTokens,
        inputTokens,
        outputTokens,
        estimatedCost,
      });

      return {
        success: true,
        response: assistantResponse,
        tokenCount: totalTokens,
        inputTokens,
        outputTokens,
        estimatedCost,
      };

    } catch (error) {
      console.error("Orchestrator error:", error);
      
      // Save error message to chat
      await ctx.runMutation(api.orchestrator.saveChatMessage, {
        role: "system",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        sessionId,
        userId,
      });

      throw new Error(`Orchestrator failed: ${error}`);
    }
  },
});

// Get orchestrator session info
export const getSessionInfo = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const messages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .order("desc")
      .take(50);

    const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
    const totalCost = messages.reduce((sum, msg) => sum + (msg.estimatedCost || 0), 0);

    return {
      messageCount: messages.length,
      totalTokens,
      totalCost,
      sessionId,
    };
  },
});
