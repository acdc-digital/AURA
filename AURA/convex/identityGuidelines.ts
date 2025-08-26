// IDENTITY GUIDELINES API - Convex functions for brand identity management
// /Users/matthewsimon/Projects/AURA/AURA/convex/identityGuidelines.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get identity guidelines for current authenticated user
export const get = query({
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

    // Get the user's identity guidelines
    return await ctx.db
      .query("identityGuidelines")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

// Get identity guidelines by ID
export const getById = query({
  args: { id: v.id("identityGuidelines") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const guidelines = await ctx.db.get(id);
    if (!guidelines) {
      return null;
    }

    // Get user record to verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns these guidelines
    if (guidelines.userId !== user._id && guidelines.userId !== identity.subject) {
      throw new ConvexError("Unauthorized - cannot access these guidelines");
    }

    return guidelines;
  },
});

// Create or ensure identity guidelines exist for user
export const ensureGuidelines = mutation({
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

    // Check if guidelines already exist
    const existingGuidelines = await ctx.db
      .query("identityGuidelines")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingGuidelines) {
      return existingGuidelines._id;
    }

    // Create new identity guidelines
    const now = Date.now();
    const guidelinesId = await ctx.db.insert("identityGuidelines", {
      userId: user._id,
      status: "draft",
      completionPercentage: 0,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    return guidelinesId;
  },
});

// Update identity guidelines
export const update = mutation({
  args: {
    id: v.optional(v.id("identityGuidelines")),
    
    // Core Brand Information
    businessName: v.optional(v.string()),
    brandSlogan: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
    missionStatement: v.optional(v.string()),
    visionStatement: v.optional(v.string()),
    coreValues: v.optional(v.array(v.string())),
    
    // Target Audience
    targetAudience: v.optional(v.object({
      primaryDemographic: v.optional(v.string()),
      ageRange: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
      painPoints: v.optional(v.array(v.string())),
      psychographics: v.optional(v.string()),
    })),
    
    // Brand Personality & Voice
    brandPersonality: v.optional(v.object({
      traits: v.optional(v.array(v.string())),
      toneOfVoice: v.optional(v.string()),
      communicationStyle: v.optional(v.string()),
      brandArchetype: v.optional(v.string()),
    })),
    
    // Visual Identity
    colorPalette: v.optional(v.object({
      primaryColors: v.optional(v.array(v.string())),
      secondaryColors: v.optional(v.array(v.string())),
      accentColors: v.optional(v.array(v.string())),
      neutralColors: v.optional(v.array(v.string())),
    })),
    
    typography: v.optional(v.object({
      primaryFont: v.optional(v.string()),
      secondaryFont: v.optional(v.string()),
      headingFont: v.optional(v.string()),
      bodyFont: v.optional(v.string()),
    })),
    
    logoGuidelines: v.optional(v.object({
      logoVariants: v.optional(v.array(v.string())),
      logoUsage: v.optional(v.string()),
      logoRestrictions: v.optional(v.array(v.string())),
      minimumSize: v.optional(v.string()),
      clearSpace: v.optional(v.string()),
    })),
    
    // Industry & Competition
    industryContext: v.optional(v.object({
      industry: v.optional(v.string()),
      businessModel: v.optional(v.string()),
      keyCompetitors: v.optional(v.array(v.string())),
      competitiveAdvantage: v.optional(v.string()),
      uniqueSellingProposition: v.optional(v.string()),
    })),
    
    // Content Guidelines
    contentGuidelines: v.optional(v.object({
      contentPillars: v.optional(v.array(v.string())),
      messagingFramework: v.optional(v.string()),
      keyMessages: v.optional(v.array(v.string())),
      doNotUse: v.optional(v.array(v.string())),
      preferredTerminology: v.optional(v.array(v.string())),
    })),
    
    // Social Media Guidelines
    socialMediaGuidelines: v.optional(v.object({
      platforms: v.optional(v.array(v.string())),
      postingFrequency: v.optional(v.object({
        platform: v.string(),
        frequency: v.string(),
      })),
      hashtagStrategy: v.optional(v.array(v.string())),
      mentionGuidelines: v.optional(v.string()),
    })),
    
    // Status and metadata
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("in-progress"),
      v.literal("complete"),
      v.literal("needs-review")
    )),
    completionPercentage: v.optional(v.number()),
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
    
    // If no ID provided, ensure guidelines exist first
    if (!args.id) {
      // Check if guidelines already exist
      const existingGuidelines = await ctx.db
        .query("identityGuidelines")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      if (existingGuidelines) {
        args.id = existingGuidelines._id;
      } else {
        // Create new identity guidelines
        const guidelinesId = await ctx.db.insert("identityGuidelines", {
          userId: user._id,
          status: "draft",
          completionPercentage: 0,
          version: 1,
          createdAt: now,
          updatedAt: now,
        });
        args.id = guidelinesId;
      }
    }

    // Get existing guidelines to verify ownership
    const existingGuidelines = await ctx.db.get(args.id!);
    if (!existingGuidelines) {
      throw new ConvexError("Identity guidelines not found");
    }

    // Verify user owns these guidelines
    if (existingGuidelines.userId !== user._id && existingGuidelines.userId !== identity.subject) {
      throw new ConvexError("Unauthorized - cannot modify these guidelines");
    }

    // Calculate completion percentage based on filled fields
    let filledFields = 0;
    const totalFields = 9; // Adjust based on main sections

    if (args.businessName) filledFields++;
    if (args.businessDescription) filledFields++;
    if (args.targetAudience) filledFields++;
    if (args.brandPersonality) filledFields++;
    if (args.colorPalette) filledFields++;
    if (args.typography) filledFields++;
    if (args.industryContext) filledFields++;
    if (args.contentGuidelines) filledFields++;
    if (args.socialMediaGuidelines) filledFields++;

    const completionPercentage = Math.round((filledFields / totalFields) * 100);

    // Determine status based on completion
    let status = args.status || existingGuidelines.status;
    if (completionPercentage === 100 && status === "draft") {
      status = "complete";
    } else if (completionPercentage > 0 && status === "draft") {
      status = "in-progress";
    }

    // Update the guidelines (exclude id from the patch)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = args;
    await ctx.db.patch(args.id!, {
      ...updateData,
      status,
      completionPercentage: args.completionPercentage || completionPercentage,
      version: (existingGuidelines.version || 1) + 1,
      lastUpdated: now,
      updatedAt: now,
    });

    return args.id!;
  },
});

// Delete identity guidelines
export const remove = mutation({
  args: { id: v.id("identityGuidelines") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get guidelines to verify ownership
    const guidelines = await ctx.db.get(id);
    if (!guidelines) {
      throw new ConvexError("Identity guidelines not found");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify user owns these guidelines
    if (guidelines.userId !== user._id && guidelines.userId !== identity.subject) {
      throw new ConvexError("Unauthorized - cannot delete these guidelines");
    }

    // Delete the guidelines
    await ctx.db.delete(id);
    return true;
  },
});

// Get completion statistics
export const getStats = query({
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

    // Get the user's identity guidelines
    const guidelines = await ctx.db
      .query("identityGuidelines")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!guidelines) {
      return {
        completionPercentage: 0,
        status: "not-started",
        lastUpdated: null,
        sectionsComplete: 0,
        totalSections: 9,
      };
    }

    // Count completed sections
    let sectionsComplete = 0;
    if (guidelines.businessName || guidelines.businessDescription) sectionsComplete++;
    if (guidelines.targetAudience) sectionsComplete++;
    if (guidelines.brandPersonality) sectionsComplete++;
    if (guidelines.colorPalette) sectionsComplete++;
    if (guidelines.typography) sectionsComplete++;
    if (guidelines.logoGuidelines) sectionsComplete++;
    if (guidelines.industryContext) sectionsComplete++;
    if (guidelines.contentGuidelines) sectionsComplete++;
    if (guidelines.socialMediaGuidelines) sectionsComplete++;

    return {
      completionPercentage: guidelines.completionPercentage || 0,
      status: guidelines.status,
      lastUpdated: guidelines.lastUpdated || guidelines.updatedAt,
      sectionsComplete,
      totalSections: 9,
      version: guidelines.version || 1,
    };
  },
});
