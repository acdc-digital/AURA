// USER MANAGEMENT API - Convex functions for user authentication and profile management
// /Users/matthewsimon/Projects/AURA/AURA/convex/users.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query to get current user based on Clerk authentication
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Try to find user by clerk ID first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (user) {
      return user;
    }

    // Fallback to email lookup for legacy users
    if (identity.email) {
      return await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
    }

    return null;
  },
});

// Query to check if user exists by Clerk ID
export const userExists = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    return !!user;
  },
});

// Mutation to create or update user from Clerk data
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Verify the clerkId matches the authenticated user
    if (identity.subject !== args.clerkId) {
      throw new ConvexError("Clerk ID mismatch - unauthorized");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();
    const name = `${args.firstName || ""} ${args.lastName || ""}`.trim() || args.username || "Anonymous User";
    
    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        imageUrl: args.imageUrl,
        name,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        imageUrl: args.imageUrl,
        name,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Mutation to update user profile information
export const updateUserProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Find the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check if username is already taken by another user
    if (args.username && args.username !== user.username) {
      const existingUserWithUsername = await ctx.db
        .query("users")
        .filter((q) => 
          q.and(
            q.eq(q.field("username"), args.username),
            q.neq(q.field("_id"), user._id)
          )
        )
        .first();

      if (existingUserWithUsername) {
        throw new ConvexError("Username is already taken");
      }
    }

    const now = Date.now();
    const name = `${args.firstName || user.firstName || ""} ${args.lastName || user.lastName || ""}`.trim() 
      || args.username || user.username || "Anonymous User";

    // Update user profile
    await ctx.db.patch(user._id, {
      firstName: args.firstName !== undefined ? args.firstName : user.firstName,
      lastName: args.lastName !== undefined ? args.lastName : user.lastName,
      username: args.username !== undefined ? args.username : user.username,
      name,
      updatedAt: now,
    });

    return user._id;
  },
});

// Query to get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    return await ctx.db.get(args.userId);
  },
});

// Query to get user by username
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();
  },
});

// Query to get all users (admin function - consider adding role-based access)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // TODO: Add admin role check here when role system is implemented
    // For now, return all users (consider limiting this in production)
    return await ctx.db.query("users").collect();
  },
});

// Query to search users by name or username
export const searchUsers = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const limit = args.limit || 10;
    const searchTerm = args.query.toLowerCase();

    const users = await ctx.db.query("users").collect();
    
    return users
      .filter(user => {
        const name = user.name?.toLowerCase() || "";
        const username = user.username?.toLowerCase() || "";
        const email = user.email.toLowerCase();
        
        return name.includes(searchTerm) || 
               username.includes(searchTerm) || 
               email.includes(searchTerm);
      })
      .slice(0, limit);
  },
});

// Mutation to delete user account (soft delete)
export const deleteUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Find the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // TODO: Implement proper soft delete or anonymization
    // For now, we'll mark the user with a flag (would need to extend schema)
    // const now = Date.now();
    // await ctx.db.patch(user._id, {
    //   isDeleted: true,
    //   deletedAt: now,
    //   updatedAt: now,
    // });

    // TODO: Consider moving user data to a deletedUsers table
    // TODO: Handle cleanup of user's projects, files, etc.
    
    throw new ConvexError("Account deletion not yet implemented - contact support");
  },
});

// Query to get user statistics
export const getUserStats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    let targetUserId: Id<"users">;

    if (args.userId) {
      // Getting stats for specific user (admin function)
      targetUserId = args.userId;
    } else {
      // Getting stats for current user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (!user) {
        throw new ConvexError("User not found");
      }
      targetUserId = user._id;
    }

    // Get user's project count
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), targetUserId))
      .collect();

    // Get user's file count
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("userId"), targetUserId))
      .collect();

    // Get user's social connections count
    const socialConnections = await ctx.db
      .query("socialConnections")
      .filter((q) => q.eq(q.field("userId"), targetUserId))
      .collect();

    // Calculate file types breakdown
    const fileTypeBreakdown = files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      projectCount: projects.length,
      fileCount: files.length,
      socialConnectionCount: socialConnections.length,
      fileTypeBreakdown,
      activeConnections: socialConnections.filter(conn => conn.isActive).length,
      accountCreated: await ctx.db.get(targetUserId).then(u => u?.createdAt),
    };
  },
});

// Mutation to update user preferences (for future use)
export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))),
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
      notifications: v.optional(v.object({
        email: v.boolean(),
        push: v.boolean(),
        sms: v.boolean(),
      })),
    }),
  },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Find the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // TODO: Implement user preferences when schema is extended
    throw new ConvexError("User preferences not yet implemented - extend schema first");
  },
});
