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
    const welcomeMessage = `Time to grow your Aura.

Let's get started by creating your brand identity. You can skip the setup and add the details later, or begin by simply letting me know the name of your brand or product.`;

    // Save the welcome message with interactive skip button
    const messageId = await ctx.runMutation(api.chat.addMessage, {
      role: "assistant",
      content: welcomeMessage,
      sessionId,
      userId,
      tokenCount: welcomeMessage.length, // Rough token count
      inputTokens: 0, // No input tokens for welcome message
      outputTokens: Math.ceil(welcomeMessage.length / 4), // Estimate output tokens
      interactiveComponent: {
        type: "onboarding_skip_button",
        data: { label: "Skip" },
        status: "pending",
      },
    });

    console.log("✅ Onboarding welcome message created:", {
      messageId,
      sessionId,
      hasInteractiveComponent: true
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

// Action to handle complete skip workflow
export const handleSkipOnboarding = action({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, userId }) => {
    try {
      // Update user onboarding status to skipped
      await ctx.runMutation(api.users.updateOnboardingStatus, {
        status: "skipped",
      });

      // Send orchestrator welcome message
      await ctx.runAction(api.orchestrator.sendWelcomeMessage, {
        sessionId,
        userId,
      });

      return {
        success: true,
        message: "Onboarding skipped successfully. Orchestrator welcome message sent.",
      };
    } catch (error) {
      console.error("Error handling skip onboarding:", error);
      return {
        success: false,
        error: "Failed to skip onboarding",
      };
    }
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
