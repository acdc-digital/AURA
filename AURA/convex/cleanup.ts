// DATABASE CLEANUP SCRIPT - Complete database reset functions for testing
// /Users/matthewsimon/Projects/AURA/AURA/convex/cleanup.ts

import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to see what's in the database
export const getDatabaseStatus = query({
  args: {},
  handler: async (ctx) => {
    try {
      const counts = {
        chatMessages: (await ctx.db.query("chatMessages").collect()).length,
        onboardingResponses: (await ctx.db.query("onboardingResponses").collect()).length,
        users: (await ctx.db.query("users").collect()).length,
        projects: (await ctx.db.query("projects").collect()).length,
        files: (await ctx.db.query("files").collect()).length,
        identityGuidelines: (await ctx.db.query("identityGuidelines").collect()).length,
      };

      const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);

      return { counts, totalRecords };
    } catch (error) {
      throw new ConvexError("Failed to retrieve database status");
    }
  },
});

// Clear everything - NUCLEAR OPTION
export const clearEverything = mutation({
  args: {
    confirmation: v.literal("DELETE_EVERYTHING"),
  },
  handler: async (ctx, { confirmation }) => {
    try {
      if (confirmation !== "DELETE_EVERYTHING") {
        throw new ConvexError("Invalid confirmation. Use 'DELETE_EVERYTHING' to proceed.");
      }

      let totalDeleted = 0;

    // Clear chat messages
    const chatMessages = await ctx.db.query("chatMessages").collect();
    for (const message of chatMessages) {
      await ctx.db.delete(message._id);
      totalDeleted++;
    }

    // Clear onboarding responses
    const onboardingResponses = await ctx.db.query("onboardingResponses").collect();
    for (const response of onboardingResponses) {
      await ctx.db.delete(response._id);
      totalDeleted++;
    }

    // Clear users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
      totalDeleted++;
    }

    // Clear projects
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
      totalDeleted++;
    }

    // Clear files
    const files = await ctx.db.query("files").collect();
    for (const file of files) {
      await ctx.db.delete(file._id);
      totalDeleted++;
    }

    // Clear identity guidelines
    const guidelines = await ctx.db.query("identityGuidelines").collect();
    for (const guideline of guidelines) {
      await ctx.db.delete(guideline._id);
      totalDeleted++;
    }

    return { totalDeleted };
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Failed to clear database");
    }
  },
});

// Clear just onboarding data
export const clearOnboardingData = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      let deletedCount = 0;
      
      const responses = await ctx.db.query("onboardingResponses").collect();
      for (const response of responses) {
        await ctx.db.delete(response._id);
        deletedCount++;
      }
      
      return { deletedCount };
    } catch (error) {
      throw new ConvexError("Failed to clear onboarding data");
    }
  },
});
