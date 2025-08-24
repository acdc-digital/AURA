// IDENTITY GUIDELINES HOOK - Custom hook for managing brand identity guidelines
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useIdentityGuidelines.ts

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Define the identity guidelines types
export interface TargetAudience {
  primaryDemographic?: string;
  ageRange?: string;
  interests?: string[];
  painPoints?: string[];
  psychographics?: string;
}

export interface BrandPersonality {
  traits?: string[];
  toneOfVoice?: string;
  communicationStyle?: string;
  brandArchetype?: string;
}

export interface ColorPalette {
  primaryColors?: string[];
  secondaryColors?: string[];
  accentColors?: string[];
  neutralColors?: string[];
}

export interface Typography {
  primaryFont?: string;
  secondaryFont?: string;
  headingFont?: string;
  bodyFont?: string;
  webFonts?: string[];
  fontHierarchy?: string;
}

export interface LogoGuidelines {
  logoVariants?: string[];
  logoUsage?: string;
  logoRestrictions?: string[];
  minimumSize?: string;
  clearSpace?: string;
  fileFormats?: string[];
  colorVariations?: string[];
}

export interface VisualStyle {
  photographyStyle?: string;
  illustrationStyle?: string;
  iconographyStyle?: string;
  dataVisualizationStyle?: string;
  videoAnimationStyle?: string;
}

export interface ApplicationGuidelines {
  websiteGuidelines?: string;
  marketingMaterials?: string;
  stationeryGuidelines?: string;
  merchandiseGuidelines?: string;
  signageGuidelines?: string;
  templates?: string[];
}

export interface LegalInformation {
  trademarkInfo?: string;
  copyrightInfo?: string;
  usageRights?: string;
  disclaimers?: string[];
  brandContact?: string;
  assetLibrary?: string;
  versionHistory?: Array<{
    version: string;
    date: number;
    changes: string;
  }>;
}

export interface IndustryContext {
  industry?: string;
  businessModel?: string;
  keyCompetitors?: string[];
  competitiveAdvantage?: string;
  uniqueSellingProposition?: string;
}

export interface ContentGuidelines {
  contentPillars?: string[];
  messagingFramework?: string;
  keyMessages?: string[];
  doNotUse?: string[];
  preferredTerminology?: string[];
}

export interface SocialMediaGuidelines {
  platforms?: string[];
  postingFrequency?: {
    platform: string;
    frequency: string;
  };
  hashtagStrategy?: string[];
  mentionGuidelines?: string;
}

export interface IdentityGuidelines {
  _id: Id<"identityGuidelines">;
  userId: string | Id<"users">;
  
  // Core Brand Information
  businessName?: string;
  brandSlogan?: string;
  businessDescription?: string;
  missionStatement?: string;
  visionStatement?: string;
  coreValues?: string[];
  
  // Target Audience
  targetAudience?: TargetAudience;
  
  // Brand Personality & Voice
  brandPersonality?: BrandPersonality;
  
  // Visual Identity
  colorPalette?: ColorPalette;
  typography?: Typography;
  logoGuidelines?: LogoGuidelines;
  
  // Visual Style Guidelines
  visualStyle?: VisualStyle;
  
  // Brand Applications
  applicationGuidelines?: ApplicationGuidelines;
  
  // Legal & Resources
  legalInformation?: LegalInformation;
  
  // Industry & Competition
  industryContext?: IndustryContext;
  
  // Content Guidelines
  contentGuidelines?: ContentGuidelines;
  
  // Social Media Guidelines
  socialMediaGuidelines?: SocialMediaGuidelines;
  
  // Metadata
  version?: number;
  lastUpdated?: number;
  completionPercentage?: number;
  status: "draft" | "in-progress" | "complete" | "needs-review";
  
  // Timestamps
  _creationTime: number;
  createdAt: number;
  updatedAt: number;
}

export interface IdentityGuidelinesStats {
  completionPercentage: number;
  status: string;
  lastUpdated: number | null;
  sectionsComplete: number;
  totalSections: number;
  version?: number;
}

export function useIdentityGuidelines() {
  // Queries
  const guidelines = useQuery(api.identityGuidelines.get);
  const stats = useQuery(api.identityGuidelines.getStats);

  // Mutations
  const ensureGuidelines = useMutation(api.identityGuidelines.ensureGuidelines);
  const updateGuidelines = useMutation(api.identityGuidelines.update);
  const deleteGuidelines = useMutation(api.identityGuidelines.remove);

  // Helper function to update specific sections
  const updateSection = async (sectionData: Partial<IdentityGuidelines>) => {
    try {
      let guidelinesId = guidelines?._id;
      
      // Ensure guidelines exist if they don't
      if (!guidelinesId) {
        guidelinesId = await ensureGuidelines();
      }

      return await updateGuidelines({
        id: guidelinesId,
        ...sectionData,
      });
    } catch (error) {
      console.error('Failed to update identity guidelines:', error);
      throw error;
    }
  };

  // Helper function to update core brand information
  const updateCoreBrand = async (data: {
    businessName?: string;
    brandSlogan?: string;
    businessDescription?: string;
    missionStatement?: string;
    visionStatement?: string;
    coreValues?: string[];
  }) => {
    return updateSection(data);
  };

  // Helper function to update target audience
  const updateTargetAudience = async (targetAudience: TargetAudience) => {
    return updateSection({ targetAudience });
  };

  // Helper function to update brand personality
  const updateBrandPersonality = async (brandPersonality: BrandPersonality) => {
    return updateSection({ brandPersonality });
  };

  // Helper function to update visual identity
  const updateVisualIdentity = async (data: {
    colorPalette?: ColorPalette;
    typography?: Typography;
    logoGuidelines?: LogoGuidelines;
  }) => {
    return updateSection(data);
  };

  // Helper function to update industry context
  const updateIndustryContext = async (industryContext: IndustryContext) => {
    return updateSection({ industryContext });
  };

  // Helper function to update content guidelines
  const updateContentGuidelines = async (contentGuidelines: ContentGuidelines) => {
    return updateSection({ contentGuidelines });
  };

  // Helper function to update social media guidelines
  const updateSocialMediaGuidelines = async (socialMediaGuidelines: SocialMediaGuidelines) => {
    return updateSection({ socialMediaGuidelines });
  };

  // Helper function to mark guidelines as complete
  const markAsComplete = async () => {
    return updateSection({ 
      status: "complete",
      completionPercentage: 100,
    });
  };

  // Helper function to create initial guidelines
  const createInitialGuidelines = async () => {
    try {
      return await ensureGuidelines();
    } catch (error) {
      console.error('Failed to create identity guidelines:', error);
      throw error;
    }
  };

  return {
    // Data
    guidelines,
    stats,
    isLoading: guidelines === undefined,
    hasGuidelines: !!guidelines,
    
    // Actions
    createInitialGuidelines,
    updateSection,
    updateCoreBrand,
    updateTargetAudience,
    updateBrandPersonality,
    updateVisualIdentity,
    updateIndustryContext,
    updateContentGuidelines,
    updateSocialMediaGuidelines,
    markAsComplete,
    deleteGuidelines,
    
    // Computed values
    completionPercentage: stats?.completionPercentage || 0,
    sectionsComplete: stats?.sectionsComplete || 0,
    totalSections: stats?.totalSections || 10,
    isComplete: stats?.status === "complete",
    isDraft: stats?.status === "draft" || stats?.status === "not-started",
  };
}
