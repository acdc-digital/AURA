// CONVEX SOCIAL POSTS FUNCTIONS - Social media post management functions for AURA Calendar
// /Users/matthewsimon/Projects/AURA/AURA/convex/socialPosts.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all agent posts for authenticated user
export const getAllAgentPosts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return await ctx.db
      .query("agentPosts")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .collect();
  },
});

// Get posts by date range for calendar
export const getPostsByDateRange = query({
  args: { 
    startDate: v.number(), 
    endDate: v.number(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return await ctx.db
      .query("agentPosts")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.gte(q.field("scheduledFor"), startDate),
          q.lte(q.field("scheduledFor"), endDate)
        )
      )
      .order("asc") // Chronological order for calendar
      .collect();
  },
});

// Get posts for today
export const getTodayPosts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Calculate today's time range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    return await ctx.db
      .query("agentPosts")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.gte(q.field("scheduledFor"), startOfDay),
          q.lte(q.field("scheduledFor"), endOfDay)
        )
      )
      .order("asc")
      .collect();
  },
});

// Get overdue posts (scheduled in past but not posted)
export const getOverduePosts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const now = Date.now();

    return await ctx.db
      .query("agentPosts")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.lt(q.field("scheduledFor"), now),
          q.eq(q.field("status"), "scheduled")
        )
      )
      .order("asc")
      .collect();
  },
});

// Get posts by platform
export const getPostsByPlatform = query({
  args: { platform: v.union(
    v.literal('reddit'), 
    v.literal('twitter'), 
    v.literal('linkedin'), 
    v.literal('facebook'), 
    v.literal('instagram')
  ) },
  handler: async (ctx, { platform }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return await ctx.db
      .query("agentPosts")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("fileType"), platform)
        )
      )
      .order("desc")
      .collect();
  },
});

// Create new social media post
export const createPost = mutation({
  args: {
    fileName: v.string(),
    fileType: v.union(
      v.literal('reddit'), 
      v.literal('twitter'), 
      v.literal('linkedin'), 
      v.literal('facebook'), 
      v.literal('instagram')
    ),
    content: v.string(),
    title: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('posting'),
      v.literal('posted'),
      v.literal('failed')
    )),
    campaignId: v.optional(v.string()),
    platformData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const now = Date.now();
    const postId = await ctx.db.insert("agentPosts", {
      ...args,
      status: args.status || "draft",
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Update post status
export const updatePostStatus = mutation({
  args: {
    id: v.id("agentPosts"),
    status: v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('posting'),
      v.literal('posted'),
      v.literal('failed')
    ),
    postId: v.optional(v.string()),
    postUrl: v.optional(v.string()),
    postedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const post = await ctx.db.get(id);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !post.userId || post.userId !== user._id) {
      throw new ConvexError("Post not found or access denied");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Update post scheduling
export const updatePostSchedule = mutation({
  args: {
    id: v.id("agentPosts"),
    scheduledFor: v.number(),
  },
  handler: async (ctx, { id, scheduledFor }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const post = await ctx.db.get(id);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !post.userId || post.userId !== user._id) {
      throw new ConvexError("Post not found or access denied");
    }

    await ctx.db.patch(id, {
      scheduledFor,
      status: scheduledFor > Date.now() ? "scheduled" : post.status,
      updatedAt: Date.now(),
    });
  },
});

// Delete post
export const deletePost = mutation({
  args: { id: v.id("agentPosts") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const post = await ctx.db.get(id);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !post.userId || post.userId !== user._id) {
      throw new ConvexError("Post not found or access denied");
    }

    await ctx.db.delete(id);
  },
});
