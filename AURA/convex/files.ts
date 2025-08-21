// CONVEX FILES FUNCTIONS - File management functions for AURA
// /Users/matthewsimon/Projects/AURA/AURA/convex/files.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all files for authenticated user
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
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .order("desc")
      .collect();
  },
});

// Get files by project
export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
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

    // Verify user owns the project
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    return await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .order("desc")
      .collect();
  },
});

// Get single file
export const get = query({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const file = await ctx.db.get(id);
    if (!file || file.isDeleted) {
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

    // Verify user owns the file
    if (file.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    return file;
  },
});

// Create new file
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"), 
      v.literal("image"), 
      v.literal("video"),
      v.literal("other")
    ),
    content: v.optional(v.string()),
    projectId: v.id("projects"),
    extension: v.optional(v.string()),
    path: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube")
    )),
    postStatus: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    )),
    lastModified: v.number(),
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

    // Verify user owns the project
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    const now = Date.now();
    const fileId = await ctx.db.insert("files", {
      ...args,
      userId: user._id,
      size: args.content?.length || 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return fileId;
  },
});

// Update file
export const update = mutation({
  args: {
    id: v.id("files"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"), 
      v.literal("image"), 
      v.literal("video"),
      v.literal("other")
    )),
    extension: v.optional(v.string()),
    path: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube")
    )),
    postStatus: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    )),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const file = await ctx.db.get(id);
    if (!file || file.isDeleted) {
      throw new ConvexError("File not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the file
    if (file.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    await ctx.db.patch(id, {
      ...updates,
      size: updates.content?.length || file.size,
      lastModified: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Soft delete file (move to trash)
export const softDelete = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const file = await ctx.db.get(id);
    if (!file || file.isDeleted) {
      throw new ConvexError("File not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the file
    if (file.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    await ctx.db.patch(id, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },
});

// Restore file from trash
export const restore = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const file = await ctx.db.get(id);
    if (!file) {
      throw new ConvexError("File not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the file
    if (file.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    await ctx.db.patch(id, {
      isDeleted: false,
      updatedAt: Date.now(),
    });
  },
});

// Permanently delete file
export const remove = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const file = await ctx.db.get(id);
    if (!file) {
      throw new ConvexError("File not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the file
    if (file.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    await ctx.db.delete(id);
  },
});

// Duplicate file
export const duplicate = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const file = await ctx.db.get(id);
    if (!file || file.isDeleted) {
      throw new ConvexError("File not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the file
    if (file.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    const now = Date.now();
    const duplicatedFileId = await ctx.db.insert("files", {
      name: `${file.name} (Copy)`,
      type: file.type,
      content: file.content,
      extension: file.extension,
      size: file.size,
      projectId: file.projectId,
      userId: file.userId,
      path: file.path,
      mimeType: file.mimeType,
      platform: file.platform,
      postStatus: "draft", // Reset status to draft for duplicated files
      lastModified: now,
      createdAt: now,
      updatedAt: now,
    });

    return duplicatedFileId;
  },
});
