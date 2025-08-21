// TERMINAL CONVEX FUNCTIONS - Terminal session and command management
// /Users/matthewsimon/Projects/AURA/AURA/convex/terminal.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get terminal sessions for a user
export const getTerminalSessions = query({
  args: {
    userId: v.optional(v.union(v.string(), v.id("users"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = args.userId ?? identity?.subject;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const sessions = await ctx.db
      .query("terminalSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10); // Limit to recent sessions

    return sessions;
  },
});

// Get a specific terminal session
export const getTerminalSession = query({
  args: {
    terminalId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const session = await ctx.db
      .query("terminalSessions")
      .withIndex("by_terminal_id", (q) => q.eq("terminalId", args.terminalId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return session;
  },
});

// Create or update terminal session
export const saveTerminalSession = mutation({
  args: {
    terminalId: v.string(),
    buffer: v.array(v.string()),
    title: v.optional(v.string()),
    currentDirectory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const existingSession = await ctx.db
      .query("terminalSessions")
      .withIndex("by_terminal_id", (q) => q.eq("terminalId", args.terminalId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    const now = Date.now();

    if (existingSession) {
      // Update existing session
      await ctx.db.patch(existingSession._id, {
        buffer: args.buffer,
        title: args.title,
        currentDirectory: args.currentDirectory,
        lastActivity: now,
        updatedAt: now,
      });
      return existingSession._id;
    } else {
      // Create new session
      const sessionId = await ctx.db.insert("terminalSessions", {
        userId,
        terminalId: args.terminalId,
        buffer: args.buffer,
        title: args.title,
        currentDirectory: args.currentDirectory,
        status: "active",
        lastActivity: now,
        createdAt: now,
        updatedAt: now,
      });
      return sessionId;
    }
  },
});

// Save terminal command to history
export const saveTerminalCommand = mutation({
  args: {
    terminalId: v.string(),
    input: v.string(),
    output: v.optional(v.string()),
    exitCode: v.optional(v.number()),
    workingDirectory: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Get the session if it exists
    const session = await ctx.db
      .query("terminalSessions")
      .withIndex("by_terminal_id", (q) => q.eq("terminalId", args.terminalId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    const now = Date.now();

    const commandId = await ctx.db.insert("terminalCommands", {
      userId,
      terminalId: args.terminalId,
      sessionId: session?._id,
      input: args.input,
      output: args.output,
      exitCode: args.exitCode,
      workingDirectory: args.workingDirectory,
      duration: args.duration,
      timestamp: now,
      createdAt: now,
    });

    return commandId;
  },
});

// Get command history for a terminal
export const getCommandHistory = query({
  args: {
    terminalId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    let commands;

    if (args.terminalId) {
      const terminalId = args.terminalId; // Explicit assignment to help TypeScript
      commands = await ctx.db
        .query("terminalCommands")
        .withIndex("by_terminal", (q) => q.eq("terminalId", terminalId))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      commands = await ctx.db
        .query("terminalCommands")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(args.limit ?? 50);
    }

    return commands;
  },
});

// Update terminal session status
export const updateTerminalStatus = mutation({
  args: {
    terminalId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("terminated"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const session = await ctx.db
      .query("terminalSessions")
      .withIndex("by_terminal_id", (q) => q.eq("terminalId", args.terminalId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!session) {
      throw new ConvexError("Terminal session not found");
    }

    await ctx.db.patch(session._id, {
      status: args.status,
      lastActivity: Date.now(),
      updatedAt: Date.now(),
    });

    return session._id;
  },
});

// Clean up old terminal sessions (can be called periodically)
export const cleanupOldSessions = mutation({
  args: {
    olderThanMs: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const cutoff = Date.now() - (args.olderThanMs ?? 7 * 24 * 60 * 60 * 1000); // 7 days default

    const oldSessions = await ctx.db
      .query("terminalSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.lt(q.field("lastActivity"), cutoff))
      .collect();

    // Delete old sessions and their commands
    for (const session of oldSessions) {
      // Delete associated commands
      const commands = await ctx.db
        .query("terminalCommands")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();

      for (const command of commands) {
        await ctx.db.delete(command._id);
      }

      // Delete session
      await ctx.db.delete(session._id);
    }

    return oldSessions.length;
  },
});
