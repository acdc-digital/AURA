// CONVEX SOCIAL CONNECTIONS FUNCTIONS - Social media connection management for AURA platform
// /Users/matthewsimon/Projects/AURA/AURA/convex/socialConnections.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all social connections for authenticated user
export const getSocialConnections = query({
  args: {
    userId: v.optional(v.string()) // Accept Clerk user ID as string
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Use provided userId or get from identity
    const targetUserId = args.userId || identity.subject;

    return await ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();
  },
});

// Get social connection by platform
export const getSocialConnectionByPlatform = query({
  args: { 
    platform: v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("reddit"),
      v.literal("linkedin"),
      v.literal("tiktok")
    )
  },
  handler: async (ctx, { platform }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    return await ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("platform"), platform))
      .first();
  },
});

// Create social connection
export const createSocialConnection = mutation({
  args: {
    userId: v.string(), // Accept Clerk user ID as string
    platform: v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("twitter"), 
      v.literal("reddit"),
      v.literal("linkedin"),
      v.literal("tiktok")
    ),
    username: v.string(),
    clientId: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
    userAgent: v.optional(v.string()), // For Reddit
    apiKey: v.optional(v.string()), // For Twitter
    apiSecret: v.optional(v.string()), // For Twitter
    apiTier: v.optional(v.union(v.literal("free"), v.literal("basic"), v.literal("pro"))), // For Twitter
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Check if connection already exists
    const existing = await ctx.db
      .query("socialConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("platform"), args.platform))
      .first();

    if (existing) {
      throw new ConvexError(`${args.platform} connection already exists`);
    }

    const now = Date.now();
    
    return await ctx.db.insert("socialConnections", {
      userId: args.userId,
      platform: args.platform,
      username: args.username,
      clientId: args.clientId,
      clientSecret: args.clientSecret,
      userAgent: args.userAgent,
      apiKey: args.apiKey,
      apiSecret: args.apiSecret,
      apiTier: args.apiTier,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update social connection (for OAuth tokens)
export const updateSocialConnection = mutation({
  args: {
    connectionId: v.id("socialConnections"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    twitterAccessToken: v.optional(v.string()),
    twitterRefreshToken: v.optional(v.string()),
    twitterUserId: v.optional(v.string()),
    twitterScreenName: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new ConvexError("Connection not found");
    }

    if (connection.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    const updateData: {
      updatedAt: number;
      accessToken?: string;
      refreshToken?: string;
      twitterAccessToken?: string;
      twitterRefreshToken?: string;
      twitterUserId?: string;
      twitterScreenName?: string;
      tokenExpiry?: number;
    } = {
      updatedAt: Date.now(),
    };

    // Add only provided fields
    if (args.accessToken !== undefined) updateData.accessToken = args.accessToken;
    if (args.refreshToken !== undefined) updateData.refreshToken = args.refreshToken;
    if (args.twitterAccessToken !== undefined) updateData.twitterAccessToken = args.twitterAccessToken;
    if (args.twitterRefreshToken !== undefined) updateData.twitterRefreshToken = args.twitterRefreshToken;
    if (args.twitterUserId !== undefined) updateData.twitterUserId = args.twitterUserId;
    if (args.twitterScreenName !== undefined) updateData.twitterScreenName = args.twitterScreenName;
    if (args.tokenExpiry !== undefined) updateData.tokenExpiry = args.tokenExpiry;

    return await ctx.db.patch(args.connectionId, updateData);
  },
});

// Delete social connection
export const deleteSocialConnection = mutation({
  args: { 
    connectionId: v.id("socialConnections")
  },
  handler: async (ctx, { connectionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const connection = await ctx.db.get(connectionId);
    if (!connection) {
      throw new ConvexError("Connection not found");
    }

    if (connection.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.delete(connectionId);
  },
});

// Reactivate social connection
export const reactivateSocialConnection = mutation({
  args: { 
    connectionId: v.id("socialConnections")
  },
  handler: async (ctx, { connectionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const connection = await ctx.db.get(connectionId);
    if (!connection) {
      throw new ConvexError("Connection not found");
    }

    if (connection.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.patch(connectionId, {
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

// Deactivate social connection
export const deactivateSocialConnection = mutation({
  args: { 
    connectionId: v.id("socialConnections")
  },
  handler: async (ctx, { connectionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const connection = await ctx.db.get(connectionId);
    if (!connection) {
      throw new ConvexError("Connection not found");
    }

    if (connection.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.patch(connectionId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
