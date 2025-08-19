// CONVEX CHAT FUNCTIONS - Chat message management for agent system
// /Users/matthewsimon/Projects/AURA/AURA/convex/chat.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a new chat message
export const addMessage = mutation({
  args: {
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
      v.literal("terminal"),
      v.literal("thinking")
    ),
    content: v.string(),
    sessionId: v.optional(v.string()),
    userId: v.optional(v.string()),
    tokenCount: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    operation: v.optional(v.object({
      type: v.union(
        v.literal("file_created"),
        v.literal("project_created"),
        v.literal("tool_executed"),
        v.literal("error"),
        v.literal("campaign_created")
      ),
      details: v.optional(v.any()),
    })),
    processIndicator: v.optional(v.object({
      type: v.union(v.literal("continuing"), v.literal("waiting")),
      processType: v.string(),
      color: v.union(v.literal("blue"), v.literal("green")),
    })),
    interactiveComponent: v.optional(v.object({
      type: v.union(
        v.literal("project_selector"),
        v.literal("file_name_input"),
        v.literal("file_type_selector"),
        v.literal("file_selector"),
        v.literal("edit_instructions_input"),
        v.literal("multi_file_selector"),
        v.literal("url_input")
      ),
      data: v.optional(v.any()),
      status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
      result: v.optional(v.any()),
    })),
    isTemporary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      ...args,
      createdAt: Date.now(),
    });
    
    return messageId;
  },
});

// Update an existing chat message
export const updateMessage = mutation({
  args: {
    id: v.id("chatMessages"),
    content: v.optional(v.string()),
    interactiveComponent: v.optional(v.object({
      type: v.union(
        v.literal("project_selector"),
        v.literal("file_name_input"),
        v.literal("file_type_selector"),
        v.literal("file_selector"),
        v.literal("edit_instructions_input"),
        v.literal("multi_file_selector"),
        v.literal("url_input")
      ),
      data: v.optional(v.any()),
      status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
      result: v.optional(v.any()),
    })),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates);
  },
});

// Get messages for a session
export const getMessages = query({
  args: {
    sessionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, limit = 50 }) => {
    let query = ctx.db.query("chatMessages");
    
    if (sessionId) {
      query = query.filter((q) => q.eq(q.field("sessionId"), sessionId));
    }
    
    const messages = await query
      .order("desc")
      .take(limit);
    
    return messages.reverse();
  },
});

// Get recent messages for current user
export const getRecentMessages = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 20 }) => {
    let query = ctx.db.query("chatMessages");
    
    if (userId) {
      query = query.filter((q) => q.eq(q.field("userId"), userId));
    }
    
    return await query
      .order("desc")
      .take(limit);
  },
});

// Update agent progress
export const updateAgentProgress = mutation({
  args: {
    sessionId: v.string(),
    agentType: v.string(),
    percentage: v.number(),
    status: v.string(),
    isComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if progress record exists
    const existing = await ctx.db
      .query("agentProgress")
      .filter((q) => 
        q.and(
          q.eq(q.field("sessionId"), args.sessionId),
          q.eq(q.field("agentType"), args.agentType)
        )
      )
      .first();
    
    const now = Date.now();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("agentProgress", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get agent progress
export const getAgentProgress = query({
  args: {
    sessionId: v.string(),
    agentType: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, agentType }) => {
    let query = ctx.db
      .query("agentProgress")
      .filter((q) => q.eq(q.field("sessionId"), sessionId));
    
    if (agentType) {
      query = query.filter((q) => q.eq(q.field("agentType"), agentType));
    }
    
    return await query.collect();
  },
});

// Clean up old temporary messages
export const cleanupTemporaryMessages = mutation({
  args: {
    olderThanMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { olderThanMs = 5 * 60 * 1000 } = args; // 5 minutes default
    const cutoff = Date.now() - olderThanMs;
    
    const temporaryMessages = await ctx.db
      .query("chatMessages")
      .filter((q) => 
        q.and(
          q.eq(q.field("isTemporary"), true),
          q.lt(q.field("createdAt"), cutoff)
        )
      )
      .collect();
    
    for (const message of temporaryMessages) {
      await ctx.db.delete(message._id);
    }
    
    return temporaryMessages.length;
  },
});
