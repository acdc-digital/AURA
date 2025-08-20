// CONVEX TRASH FUNCTIONS - Advanced trash management system for AURA
// /Users/matthewsimon/Projects/AURA/AURA/convex/trash.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all deleted files for authenticated user
export const getDeletedFiles = query({
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
      .query("deletedFiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get all deleted projects for authenticated user
export const getDeletedProjects = query({
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
      .query("deletedProjects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Move file to trash (soft delete with database backup)
export const moveFileToTrash = mutation({
  args: { 
    id: v.id("files"),
    deletedBy: v.optional(v.string())
  },
  handler: async (ctx, { id, deletedBy }) => {
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

    // Get parent project name for reference
    const project = await ctx.db.get(file.projectId);
    const parentProjectName = project ? project.name : "Unknown Project";

    // Create snapshot in deletedFiles table
    const deletedFileId = await ctx.db.insert("deletedFiles", {
      originalId: id,
      name: file.name,
      type: file.type,
      extension: file.extension,
      content: file.content,
      size: file.size,
      projectId: file.projectId,
      userId: file.userId,
      path: file.path,
      mimeType: file.mimeType,
      platform: file.platform,
      postStatus: file.postStatus,
      scheduledAt: file.scheduledAt,
      originalCreatedAt: file.createdAt,
      originalUpdatedAt: file.updatedAt,
      originalLastModified: file.lastModified,
      deletedAt: Date.now(),
      deletedBy: deletedBy || user._id,
      parentProjectName,
    });

    // Mark original file as deleted
    await ctx.db.patch(id, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    return deletedFileId;
  },
});

// Move project to trash (soft delete with database backup)
export const moveProjectToTrash = mutation({
  args: { 
    id: v.id("projects"),
    deletedBy: v.optional(v.string())
  },
  handler: async (ctx, { id, deletedBy }) => {
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

    // Get all project files for snapshot
    const projectFiles = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .filter((q) => q.eq(q.field("isDeleted"), undefined))
      .collect();

    // Create file snapshots
    const associatedFiles = projectFiles.map(file => ({
      fileId: file._id,
      name: file.name,
      type: file.type,
      size: file.size || 0,
    }));

    // Create snapshot in deletedProjects table
    const deletedProjectId = await ctx.db.insert("deletedProjects", {
      originalId: id,
      name: project.name,
      description: project.description,
      status: project.status,
      budget: project.budget,
      projectNo: project.projectNo,
      userId: project.userId,
      originalCreatedAt: project.createdAt,
      originalUpdatedAt: project.updatedAt,
      deletedAt: Date.now(),
      deletedBy: deletedBy || user._id,
      associatedFiles,
    });

    // Move all project files to trash
    for (const file of projectFiles) {
      await ctx.db.patch(file._id, {
        isDeleted: true,
        updatedAt: Date.now(),
      });

      // Create individual file trash records
      await ctx.db.insert("deletedFiles", {
        originalId: file._id,
        name: file.name,
        type: file.type,
        extension: file.extension,
        content: file.content,
        size: file.size,
        projectId: file.projectId,
        userId: file.userId,
        path: file.path,
        mimeType: file.mimeType,
        platform: file.platform,
        postStatus: file.postStatus,
        scheduledAt: file.scheduledAt,
        originalCreatedAt: file.createdAt,
        originalUpdatedAt: file.updatedAt,
        originalLastModified: file.lastModified,
        deletedAt: Date.now(),
        deletedBy: deletedBy || user._id,
        parentProjectName: project.name,
      });
    }

    // Delete the original project (permanent removal from active projects)
    await ctx.db.delete(id);

    return deletedProjectId;
  },
});

// Restore file from trash
export const restoreFileFromTrash = mutation({
  args: { id: v.id("deletedFiles") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const deletedFile = await ctx.db.get(id);
    if (!deletedFile) {
      throw new ConvexError("Deleted file not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the deleted file
    if (deletedFile.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    // Restore original file (new ID will be generated)
    const restoredFileId = await ctx.db.insert("files", {
      name: deletedFile.name,
      type: deletedFile.type,
      extension: deletedFile.extension,
      content: deletedFile.content,
      size: deletedFile.size,
      projectId: deletedFile.projectId,
      userId: deletedFile.userId,
      path: deletedFile.path,
      mimeType: deletedFile.mimeType,
      platform: deletedFile.platform,
      postStatus: deletedFile.postStatus,
      scheduledAt: deletedFile.scheduledAt,
      isDeleted: false,
      lastModified: deletedFile.originalLastModified,
      createdAt: deletedFile.originalCreatedAt,
      updatedAt: Date.now(),
    });

    // Remove from deleted files table
    await ctx.db.delete(id);

    return restoredFileId;
  },
});

// Restore project from trash
export const restoreProjectFromTrash = mutation({
  args: { id: v.id("deletedProjects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const deletedProject = await ctx.db.get(id);
    if (!deletedProject) {
      throw new ConvexError("Deleted project not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the deleted project
    if (deletedProject.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    // Restore original project (new ID will be generated)
    const restoredProjectId = await ctx.db.insert("projects", {
      name: deletedProject.name,
      description: deletedProject.description,
      status: deletedProject.status,
      budget: deletedProject.budget,
      projectNo: deletedProject.projectNo,
      userId: deletedProject.userId,
      createdAt: deletedProject.originalCreatedAt,
      updatedAt: Date.now(),
    });

    // Restore associated files
    if (deletedProject.associatedFiles) {
      for (const fileSnapshot of deletedProject.associatedFiles) {
        // Find the file in deleted files and restore it
        const deletedFileRecord = await ctx.db
          .query("deletedFiles")
          .withIndex("by_original_id", (q) => q.eq("originalId", fileSnapshot.fileId))
          .filter((q) => q.eq(q.field("userId"), user._id))
          .first();

        if (deletedFileRecord) {
          // Restore file with new project ID
          await ctx.db.insert("files", {
            name: deletedFileRecord.name,
            type: deletedFileRecord.type,
            extension: deletedFileRecord.extension,
            content: deletedFileRecord.content,
            size: deletedFileRecord.size,
            projectId: restoredProjectId, // Use new project ID
            userId: deletedFileRecord.userId,
            path: deletedFileRecord.path,
            mimeType: deletedFileRecord.mimeType,
            platform: deletedFileRecord.platform,
            postStatus: deletedFileRecord.postStatus,
            scheduledAt: deletedFileRecord.scheduledAt,
            isDeleted: false,
            lastModified: deletedFileRecord.originalLastModified,
            createdAt: deletedFileRecord.originalCreatedAt,
            updatedAt: Date.now(),
          });

          // Remove file from deleted files table
          await ctx.db.delete(deletedFileRecord._id);
        }
      }
    }

    // Remove from deleted projects table
    await ctx.db.delete(id);

    return restoredProjectId;
  },
});

// Permanently delete file from trash
export const permanentlyDeleteFile = mutation({
  args: { id: v.id("deletedFiles") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const deletedFile = await ctx.db.get(id);
    if (!deletedFile) {
      throw new ConvexError("Deleted file not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the deleted file
    if (deletedFile.userId !== user._id) {
      throw new ConvexError("File not found or access denied");
    }

    // Permanently delete from deletedFiles table
    await ctx.db.delete(id);

    return id;
  },
});

// Permanently delete project from trash
export const permanentlyDeleteProject = mutation({
  args: { id: v.id("deletedProjects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const deletedProject = await ctx.db.get(id);
    if (!deletedProject) {
      throw new ConvexError("Deleted project not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns the deleted project
    if (deletedProject.userId !== user._id) {
      throw new ConvexError("Project not found or access denied");
    }

    // Also permanently delete all associated files from trash
    if (deletedProject.associatedFiles) {
      for (const fileSnapshot of deletedProject.associatedFiles) {
        const deletedFileRecord = await ctx.db
          .query("deletedFiles")
          .withIndex("by_original_id", (q) => q.eq("originalId", fileSnapshot.fileId))
          .filter((q) => q.eq(q.field("userId"), user._id))
          .first();

        if (deletedFileRecord) {
          await ctx.db.delete(deletedFileRecord._id);
        }
      }
    }

    // Permanently delete from deletedProjects table
    await ctx.db.delete(id);

    return id;
  },
});

// Empty entire trash (with confirmation safeguards)
export const emptyTrash = mutation({
  args: { 
    confirmation: v.string() // Requires "EMPTY_TRASH" as confirmation
  },
  handler: async (ctx, { confirmation }) => {
    if (confirmation !== "EMPTY_TRASH") {
      throw new ConvexError("Invalid confirmation - operation aborted");
    }

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

    // Get all user's deleted files and projects
    const deletedFiles = await ctx.db
      .query("deletedFiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const deletedProjects = await ctx.db
      .query("deletedProjects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Permanently delete all files
    for (const file of deletedFiles) {
      await ctx.db.delete(file._id);
    }

    // Permanently delete all projects
    for (const project of deletedProjects) {
      await ctx.db.delete(project._id);
    }

    return {
      deletedFiles: deletedFiles.length,
      deletedProjects: deletedProjects.length,
      timestamp: Date.now(),
    };
  },
});

// Get trash statistics
export const getTrashStats = query({
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

    const deletedFiles = await ctx.db
      .query("deletedFiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const deletedProjects = await ctx.db
      .query("deletedProjects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      totalFiles: deletedFiles.length,
      totalProjects: deletedProjects.length,
      totalItems: deletedFiles.length + deletedProjects.length,
      oldestDeletion: Math.min(
        ...deletedFiles.map(f => f.deletedAt),
        ...deletedProjects.map(p => p.deletedAt)
      ),
      latestDeletion: Math.max(
        ...deletedFiles.map(f => f.deletedAt),
        ...deletedProjects.map(p => p.deletedAt)
      ),
    };
  },
});
