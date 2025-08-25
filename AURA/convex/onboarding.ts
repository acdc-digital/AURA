// ONBOARDING AGENT CONVEX FUNCTIONS - Backend functions for user onboarding flow
// /Users/matthewsimon/Projects/AURA/AURA/convex/onboarding.ts

import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { ONBOARDING_SYSTEM_PROMPT } from "./prompts";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Action to handle onboarding conversation
export const handleOnboardingMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { message, sessionId, userId }) => {
    // Save user message
    await ctx.runMutation(api.chat.addMessage, {
      role: "user",
      content: message,
      sessionId,
      userId,
    });

    // Get conversation history
    const history = await ctx.runQuery(api.chat.getMessages, {
      sessionId,
      limit: 20,
    });

    // Build messages for Anthropic
    const messages: Anthropic.MessageParam[] = [];
    
    for (const msg of history) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    try {
      // Call Anthropic API
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 2048,
        system: ONBOARDING_SYSTEM_PROMPT,
        messages,
      });

      // Extract response text
      const responseText = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

      // Save assistant response
      await ctx.runMutation(api.chat.addMessage, {
        role: "assistant",
        content: responseText,
        sessionId,
        userId,
      });

      return {
        success: true,
        response: responseText,
      };
    } catch (error) {
      console.error("Onboarding agent error:", error);
      
      // Save error message
      await ctx.runMutation(api.chat.addMessage, {
        role: "assistant",
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment, or feel free to skip the onboarding and explore AURA on your own.",
        sessionId,
        userId,
      });

      return {
        success: false,
        error: "Failed to process onboarding message",
      };
    }
  },
});

// Action to send initial onboarding welcome message
export const sendWelcomeMessage = action({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, userId }) => {
    const welcomeMessage = `Welcome to AURA! 🌟

I'm here to help you get started with your brand and content creation journey. You have a few options:

**Option 1: Quick Setup** - I can guide you through creating your first brand guidelines and project structure (recommended for new users)

**Option 2: Skip & Explore** - Jump right in and start exploring AURA on your own

If you'd like me to help you get started, what's the name of your product or brand? If you don't have one yet, that's perfectly fine - we can work with your name or any project you're excited about!

*You can always skip this onboarding and return to it later from your settings.*`;

    // Save the welcome message
    await ctx.runMutation(api.chat.addMessage, {
      role: "assistant",
      content: welcomeMessage,
      sessionId,
      userId,
    });

    return welcomeMessage;
  },
});

// Mutation to mark onboarding as complete and create initial project
export const completeOnboarding = mutation({
  args: {
    brandName: v.string(),
    brandDescription: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ projectId: string }> => {
    // Update user onboarding status
    if (args.userId) {
      await ctx.runMutation(api.users.updateOnboardingStatus, {
        status: "completed",
      });
    }

    // Create initial project
    const projectId = await ctx.runMutation(api.projects.create, {
      name: args.brandName,
      description: args.brandDescription || `Brand guidelines and content for ${args.brandName}`,
      status: "active",
    });

    return { projectId: projectId.toString() };
  },
});

// Mutation to skip onboarding
export const skipOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(api.users.updateOnboardingStatus, {
      status: "skipped",
    });
    
    return { success: true };
  },
});
