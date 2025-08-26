// ORCHESTRATOR CONVEX FUNCTIONS - Main orchestrator agent backend integration
// /Users/matthewsimon/Projects/AURA/AURA/convex/orchestrator.ts

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "./prompts";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      .take(50); // Increased for better context

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

// Helper mutation to update an existing chat message
export const updateChatMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
    content: v.optional(v.string()),
    tokenCount: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { messageId, ...updates } = args;
    return await ctx.db.patch(messageId, updates);
  },
});

// Helper mutation to save a thinking message with parsed task/tool data
export const saveThinkingMessage = mutation({
  args: {
    content: v.string(),
    sessionId: v.string(),
    userId: v.optional(v.string()),
    thinkingData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      role: "thinking",
      content: args.content,
      sessionId: args.sessionId,
      userId: args.userId,
      createdAt: Date.now(),
      operation: args.thinkingData ? {
        type: "tool_executed",
        details: args.thinkingData,
      } : undefined,
    });
  },
});

// Helper mutation to update an existing thinking message
export const updateThinkingMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
    content: v.string(),
    thinkingData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.messageId, {
      content: args.content,
      operation: args.thinkingData ? {
        type: "tool_executed",
        details: args.thinkingData,
      } : undefined,
    });
  },
});

// Helper function to parse thinking content into visual tasks and tools
function parseThinkingContent(thinkingText: string, isComplete: boolean = false): {
  status: "thinking" | "processing" | "completed";
  tasks?: Array<{
    id: string;
    title: string;
    items: Array<{ type: "text" | "file"; text: string; file?: { name: string } }>;
    status: "completed";
  }>;
  tools?: Array<{
    id: string;
    type: string;
    state: "output-available";
    input: { operation: string };
    output: string;
  }>;
} {
  const tasks: Array<{
    id: string;
    title: string;
    items: Array<{ type: "text" | "file"; text: string; file?: { name: string } }>;
    status: "completed";
  }> = [];
  
  const tools: Array<{
    id: string;
    type: string;
    state: "output-available";
    input: { operation: string };
    output: string;
  }> = [];

  // Extract numbered steps and create tasks - more flexible patterns
  const patterns = [
    // Original pattern: "1. **Title**: description"
    /\d+\.\s*\*\*(.*?)\*\*:?\s*(.*?)(?=\d+\.\s*\*\*|$)/gs,
    // Alternative pattern: "1. Title:" or just "1. Title"
    /\d+\.\s*([^:\n]+):?\s*(.*?)(?=\d+\.|$)/gs,
    // Pattern for simple numbered lists without bold
    /^(\d+)\.\s+(.+?)$/gm,
  ];
  
  let foundSteps = false;
  
  for (const pattern of patterns) {
    const stepMatches = [...thinkingText.matchAll(pattern)];
    if (stepMatches.length > 0) {
      stepMatches.forEach((match, index) => {
        const title = match[1]?.trim() || `Step ${index + 1}`;
        const description = match[2]?.trim() || match[0]?.trim() || '';
        
        // Create task items from the description
        const items: Array<{ type: "text" | "file"; text: string; file?: { name: string } }> = [];
        
        if (description) {
          const lines = description.split('\n').filter(line => line.trim());
          
          lines.forEach(line => {
            const trimmedLine = line.trim();
            // Check if line mentions a file
            const fileMatch = trimmedLine.match(/`([^`]+\.(ts|tsx|js|jsx|json|md))`/);
            if (fileMatch) {
              items.push({
                type: "file",
                text: trimmedLine,
                file: { name: fileMatch[1] }
              });
            } else if (trimmedLine.length > 0) {
              items.push({
                type: "text",
                text: trimmedLine
              });
            }
          });
        }

        tasks.push({
          id: `task-${index + 1}`,
          title: title,
          items: items.length > 0 ? items : [{ type: "text", text: description || title }],
          status: "completed"
        });
      });
      foundSteps = true;
      break; // Use the first pattern that matches
    }
  }
  
  // If no numbered steps found, create a single task from the thinking content
  if (!foundSteps && thinkingText.trim()) {
    tasks.push({
      id: "task-1",
      title: "Thinking Process",
      items: [{ type: "text", text: thinkingText.trim() }],
      status: "completed"
    });
  }

  // Extract tool-like operations (file operations, API calls, etc.)
  const toolPatterns = [
    /checking\s+(.+)/gi,
    /analyzing\s+(.+)/gi,
    /reading\s+(.+)/gi,
    /creating\s+(.+)/gi,
    /updating\s+(.+)/gi,
    /implementing\s+(.+)/gi,
  ];

  toolPatterns.forEach((pattern, patternIndex) => {
    const matches = [...thinkingText.matchAll(pattern)];
    matches.forEach((match, index) => {
      const operation = match[1].trim();
      tools.push({
        id: `tool-${patternIndex}-${index}`,
        type: ["file_operation", "analysis", "read_operation", "create_operation", "update_operation", "implementation"][patternIndex] || "operation",
        state: "output-available",
        input: { operation },
        output: `Completed: ${operation}`
      });
    });
  });

  return {
    status: isComplete ? "completed" : "thinking",
    tasks: tasks.length > 0 ? tasks : undefined,
    tools: tools.length > 0 ? tools : undefined,
  };
}

// Send message to orchestrator with streaming thinking support
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
      // Check if user needs onboarding first
      const needsOnboarding = await ctx.runQuery(api.users.needsOnboarding);
      
      // If user needs onboarding, redirect to onboarding agent
      if (needsOnboarding) {
        const onboardingResponse = await ctx.runAction(api.onboarding.handleOnboardingMessage, {
          message,
          sessionId,
          userId,
        });
        
        if (onboardingResponse.success) {
          return {
            success: true,
            response: onboardingResponse.response || "Onboarding message processed",
            tokenCount: 0,
            inputTokens: 0,
            outputTokens: 0,
            estimatedCost: 0,
          };
        }
        
        // If onboarding failed, fall back to regular orchestrator
      }

      // Continue with regular orchestrator logic
      // Get conversation history for context
      const messages = await ctx.runQuery(api.orchestrator.getConversationHistory, {
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
      const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role === "user" ? "user" as const : "assistant" as const,
          content: msg.content,
        }));

      // Add current message
      conversationHistory.push({
        role: "user" as const,
        content: message,
      });

      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY environment variable is not set");
      }

                  // Use streaming with extended thinking
      const stream = anthropic.messages.stream({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 8192, // Must be greater than thinking budget_tokens
        temperature: 1.0, // Required to be 1.0 when thinking is enabled
        thinking: {
          type: "enabled",
          budget_tokens: 4000 // Reduced to be less than max_tokens
        },
        system: ORCHESTRATOR_SYSTEM_PROMPT,
        messages: conversationHistory,
      });

      let thinkingContent = "";
      let responseContent = "";
      let thinkingMessageId: Id<"chatMessages"> | null = null;
      let responseMessageId: Id<"chatMessages"> | null = null;
      let inputTokens = 0;
      let outputTokens = 0;

      // Throttling for response updates to prevent UI overwhelm
      let lastResponseUpdate = 0;
      const RESPONSE_THROTTLE_MS = 200; // Update every 200ms max for smooth streaming

      // Process streaming events
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'thinking_delta') {
            // Accumulate thinking content
            thinkingContent += event.delta.thinking;
            
            // Parse current thinking content and update UI (thinking in progress)
            const thinkingData = parseThinkingContent(thinkingContent, false);
            
            if (!thinkingMessageId) {
              // Create initial thinking message
              thinkingMessageId = await ctx.runMutation(api.orchestrator.saveThinkingMessage, {
                content: thinkingContent,
                sessionId,
                userId,
                thinkingData,
              });
            } else {
              // Update existing thinking message
              await ctx.runMutation(api.orchestrator.updateThinkingMessage, {
                messageId: thinkingMessageId,
                content: thinkingContent,
                thinkingData,
              });
            }
          } else if (event.delta.type === 'text_delta') {
            // Accumulate response content and stream it to UI (with throttling)
            responseContent += event.delta.text;
            
            const now = Date.now();
            const shouldUpdate = now - lastResponseUpdate > RESPONSE_THROTTLE_MS;
            
            if (!responseMessageId) {
              // Always create initial response message
              responseMessageId = await ctx.runMutation(api.orchestrator.saveChatMessage, {
                role: "assistant",
                content: responseContent,
                sessionId,
                userId,
                tokenCount: 0, // Will be updated at the end
                inputTokens: 0,
                outputTokens: 0,
                estimatedCost: 0,
              });
              lastResponseUpdate = now;
            } else if (shouldUpdate) {
              // Update existing response message with throttled streaming content
              await ctx.runMutation(api.orchestrator.updateChatMessage, {
                messageId: responseMessageId,
                content: responseContent,
              });
              lastResponseUpdate = now;
            }
            // If not shouldUpdate, we accumulate content but don't trigger DB update
          }
        } else if (event.type === 'message_delta') {
          // Extract token usage
          if (event.usage) {
            outputTokens = event.usage.output_tokens || 0;
          }
        } else if (event.type === 'message_start') {
          // Extract input tokens
          if (event.message.usage) {
            inputTokens = event.message.usage.input_tokens || 0;
          }
        }
      }

      // Mark thinking as completed if there was thinking content
      if (thinkingMessageId && thinkingContent) {
        const finalThinkingData = parseThinkingContent(thinkingContent, true);
        await ctx.runMutation(api.orchestrator.updateThinkingMessage, {
          messageId: thinkingMessageId,
          content: thinkingContent,
          thinkingData: finalThinkingData,
        });
      }

      const totalTokens = inputTokens + outputTokens;
      const estimatedCost = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);

      // Update session token statistics
      await ctx.runMutation(api.chat.updateSessionTokens, {
        sessionId,
        inputTokens,
        outputTokens,
        estimatedCost,
      });

      // Update final assistant response with token info (if response message was created)
      if (responseMessageId) {
        await ctx.runMutation(api.orchestrator.updateChatMessage, {
          messageId: responseMessageId,
          content: responseContent, // Ensure final content is saved
          tokenCount: totalTokens,
          inputTokens,
          outputTokens,
          estimatedCost,
        });
      } else if (responseContent) {
        // Fallback: save response if no streaming occurred
        await ctx.runMutation(api.orchestrator.saveChatMessage, {
          role: "assistant",
          content: responseContent,
          sessionId,
          userId,
          tokenCount: totalTokens,
          inputTokens,
          outputTokens,
          estimatedCost,
        });
      }

      return {
        success: true,
        response: responseContent,
        tokenCount: totalTokens,
        inputTokens,
        outputTokens,
        estimatedCost,
      };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      
      // Save error message
      await ctx.runMutation(api.orchestrator.saveChatMessage, {
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        sessionId,
        userId,
      });

      return {
        success: false,
        response: "Error processing request",
        tokenCount: 0,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
      };
    }
  },
});

// Action to send orchestrator welcome message (after skipping onboarding)
export const sendWelcomeMessage = action({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, userId }) => {
    const welcomeMessage = `Welcome to AURA! 🌟

I'm your orchestrator agent, ready to help you build, create, and grow your projects. Since you've chosen to skip the onboarding, you can dive right in and explore at your own pace.

Here's what I can help you with:
• **Project Management**: Create and organize your projects
• **Development Tasks**: Code reviews, debugging, and technical guidance
• **Architecture Planning**: System design and best practices
• **Problem Solving**: Break down complex challenges into manageable steps

What would you like to work on today?`;

    // Save the welcome message
    const messageId = await ctx.runMutation(api.orchestrator.saveChatMessage, {
      role: "assistant",
      content: welcomeMessage,
      sessionId,
      userId,
      tokenCount: welcomeMessage.length,
      inputTokens: 0,
      outputTokens: Math.ceil(welcomeMessage.length / 4),
    });

    console.log("🎯 Orchestrator welcome message sent:", {
      messageId,
      sessionId,
      userId
    });

    return welcomeMessage;
  },
});

// Get session info
export const getSessionInfo = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const messages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .collect();

    return {
      sessionId,
      messageCount: messages.length,
      lastActivity: messages.length > 0 ? Math.max(...messages.map(m => m.createdAt)) : Date.now(),
    };
  },
});
