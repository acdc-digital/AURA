// CONVEX PROJECTS FUNCTIONS - Project management functions for AURA
// /Users/matthewsimon/Projects/AURA/AURA/convex/projects.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all projects for authenticated user
export const list = query({
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
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get single project
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const project = await ctx.db.get(id);
    if (!project) {
      return null;
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the project
    if (project.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    return project;
  },
});

// Create new project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"), 
      v.literal("completed"), 
      v.literal("on-hold")
    )),
    budget: v.optional(v.number()),
    projectNo: v.optional(v.string()),
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
    const projectId = await ctx.db.insert("projects", {
      ...args,
      status: args.status || "active",
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

// Update project
export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"), 
      v.literal("completed"), 
      v.literal("on-hold")
    )),
    budget: v.optional(v.number()),
    projectNo: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const project = await ctx.db.get(id);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the project
    if (project.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete project
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const project = await ctx.db.get(id);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the project
    if (project.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    // Also delete all files in the project
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();

    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    await ctx.db.delete(id);
  },
});

// Duplicate project
export const duplicate = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const project = await ctx.db.get(id);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the project
    if (project.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    const now = Date.now();
    const duplicatedProjectId = await ctx.db.insert("projects", {
      name: `${project.name} (Copy)`,
      description: project.description,
      status: "active", // Reset to active for duplicated project
      budget: project.budget,
      projectNo: project.projectNo,
      userId: project.userId,
      createdAt: now,
      updatedAt: now,
    });

    // Duplicate all files in the project
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .filter((q) => q.eq(q.field("isDeleted"), undefined))
      .collect();

    for (const file of files) {
      await ctx.db.insert("files", {
        name: file.name,
        type: file.type,
        content: file.content,
        extension: file.extension,
        size: file.size,
        projectId: duplicatedProjectId,
        userId: file.userId,
        path: file.path,
        mimeType: file.mimeType,
        platform: file.platform,
        postStatus: "draft", // Reset status to draft for duplicated files
        lastModified: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    return duplicatedProjectId;
  },
});
