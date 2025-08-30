// ONBOARDING TO IDENTITY GUIDELINES TRANSFORMER
// /Users/matthewsimon/Projects/AURA/AURA/lib/utils/onboardingTransformer.ts

import { IdentityGuidelines } from '@/lib/hooks/useIdentityGuidelines';

// Interface for onboarding response data (matching convex schema)
export interface OnboardingResponse {
  brandName?: string;
  brandDescription?: string;
  brandIndustry?: string;
  targetAudience?: {
    demographics?: string;
    psychographics?: string;
    primaryAudience?: string;
    secondaryAudience?: string;
  };
  brandPersonality?: string[];
  brandValues?: string[];
  brandGoals?: {
    shortTerm?: string;
    longTerm?: string;
    keyObjectives?: string[];
  };
  colorPreferences?: {
    preferredColors?: string[];
    colorMood?: string;
    avoidColors?: string[];
  };
  stylePreferences?: {
    visualStyle?: string;
    typographyStyle?: string;
    imageStyle?: string;
  };
  existingBrand?: boolean;
  competitorReferences?: string[];
  additionalNotes?: string;
}

// Enhanced brand context interface for better form mapping
export interface EnhancedBrandContext {
  // Core Brand Identity
  brand: {
    name: string;
    tagline?: string; // Generated or empty for user to fill
    description: string;
    industry: string;
  };
  
  // Mission, Vision, Values
  purpose: {
    mission?: string; // Generated from brandGoals
    vision?: string; // Generated from brandGoals  
    values: string[];
  };
  
  // Target Audience (expanded)
  audience: {
    primaryDemographic: string;
    psychographics: string;
    ageRange?: string; // Left empty for user to specify
    interests?: string[]; // Left empty for user to specify
    painPoints?: string[]; // Left empty for user to specify
  };
  
  // Brand Personality (expanded)
  personality: {
    traits: string[];
    toneOfVoice?: string; // Generated from brandPersonality
    communicationStyle?: string; // Generated from brandPersonality
    brandArchetype?: string; // Left empty for user to specify
  };
  
  // Visual Identity (structured from preferences)
  visual: {
    colorPalette: {
      primaryColors: string[];
      colorMood: string;
      avoidColors?: string[];
    };
    typography: {
      style: string; // sans-serif, serif, etc.
      // Other typography fields left empty for user customization
    };
    visualStyle: {
      overallStyle: string; // modern, professional, etc.
      imageStyle?: string; // photography, illustration, etc.
    };
  };
  
  // Industry Context
  industry: {
    sector: string;
    competitorReferences?: string[];
    // Other fields left empty for detailed user input
  };
  
  // Additional metadata
  metadata: {
    completionSource: 'onboarding' | 'manual';
    onboardingTimestamp: number;
    hasExistingBrand: boolean;
    additionalNotes?: string;
  };
}

/**
 * Transform onboarding response data into identity guidelines structure
 */
export function transformOnboardingToIdentity(
  onboardingData: OnboardingResponse
): Partial<IdentityGuidelines> {
  const now = Date.now();
  
  // Generate mission and vision from goals if available
  const generatedMission = onboardingData.brandGoals?.keyObjectives?.length 
    ? `To ${onboardingData.brandGoals.keyObjectives.join(', ')}.`
    : undefined;
    
  const generatedVision = onboardingData.brandGoals?.longTerm 
    ? onboardingData.brandGoals.longTerm
    : undefined;

  // Generate tone of voice from personality traits
  const generatedTone = onboardingData.brandPersonality?.length
    ? `${onboardingData.brandPersonality.slice(0, 3).join(', ')} tone`
    : undefined;

  // Transform color preferences to structured palette
  const colorPalette = onboardingData.colorPreferences ? {
    primaryColors: onboardingData.colorPreferences.preferredColors || [],
    // Leave secondary, accent, neutral colors empty for user to define
  } : undefined;

  // Transform typography preferences
  const typography = onboardingData.stylePreferences?.typographyStyle ? {
    primaryFont: onboardingData.stylePreferences.typographyStyle === 'sans-serif' 
      ? 'Inter, system-ui, sans-serif' 
      : onboardingData.stylePreferences.typographyStyle === 'serif'
      ? 'Georgia, Times, serif'
      : undefined,
    // Leave other typography fields empty for user customization
  } : undefined;

  return {
    // Core brand information
    businessName: onboardingData.brandName || '',
    businessDescription: onboardingData.brandDescription || '',
    missionStatement: generatedMission,
    visionStatement: generatedVision,
    coreValues: onboardingData.brandValues || [],
    
    // Target audience
    targetAudience: onboardingData.targetAudience ? {
      primaryDemographic: onboardingData.targetAudience.primaryAudience || 
                          onboardingData.targetAudience.demographics || '',
      psychographics: onboardingData.targetAudience.psychographics,
      // Leave ageRange, interests, painPoints empty for user to specify
    } : undefined,
    
    // Brand personality
    brandPersonality: {
      traits: onboardingData.brandPersonality || [],
      toneOfVoice: generatedTone,
      // Leave communicationStyle and brandArchetype empty for user input
    },
    
    // Visual identity
    colorPalette,
    typography,
    
    // Visual style guidelines
    visualStyle: onboardingData.stylePreferences ? {
      photographyStyle: onboardingData.stylePreferences.imageStyle === 'photography' 
        ? `${onboardingData.stylePreferences.visualStyle || 'professional'} photography style`
        : undefined,
      illustrationStyle: onboardingData.stylePreferences.imageStyle === 'illustration'
        ? `${onboardingData.stylePreferences.visualStyle || 'modern'} illustration style`
        : undefined,
      // Leave other visual style fields empty for user customization
    } : undefined,
    
    // Industry context
    industryContext: {
      industry: onboardingData.brandIndustry || '',
      // Leave businessModel, keyCompetitors etc. empty for user input
    },
    
    // Set status and completion
    status: "draft" as const, // Start as draft, user can complete later
    completionPercentage: calculateInitialCompletion(onboardingData),
    lastUpdated: now,
    updatedAt: now,
  };
}

/**
 * Calculate initial completion percentage based on onboarding data
 */
function calculateInitialCompletion(data: OnboardingResponse): number {
  let filledFields = 0;
  const totalCoreFields = 8; // Core fields we expect from onboarding
  
  if (data.brandName) filledFields++;
  if (data.brandDescription) filledFields++;
  if (data.brandIndustry) filledFields++;
  if (data.targetAudience?.primaryAudience || data.targetAudience?.demographics) filledFields++;
  if (data.brandPersonality?.length) filledFields++;
  if (data.brandValues?.length) filledFields++;
  if (data.colorPreferences?.preferredColors?.length || data.colorPreferences?.colorMood) filledFields++;
  if (data.stylePreferences?.visualStyle || data.stylePreferences?.typographyStyle) filledFields++;
  
  return Math.round((filledFields / totalCoreFields) * 60); // Max 60% from onboarding, rest needs manual input
}

/**
 * Generate enhanced brand context for AI tools and advanced features
 */
export function generateEnhancedBrandContext(
  onboardingData: OnboardingResponse,
  completionTimestamp: number = Date.now()
): EnhancedBrandContext {
  return {
    brand: {
      name: onboardingData.brandName || 'Your Brand',
      description: onboardingData.brandDescription || '',
      industry: onboardingData.brandIndustry || '',
    },
    
    purpose: {
      mission: onboardingData.brandGoals?.keyObjectives?.length 
        ? `To ${onboardingData.brandGoals.keyObjectives.join(', ')}.`
        : undefined,
      vision: onboardingData.brandGoals?.longTerm,
      values: onboardingData.brandValues || [],
    },
    
    audience: {
      primaryDemographic: onboardingData.targetAudience?.primaryAudience || 
                          onboardingData.targetAudience?.demographics || '',
      psychographics: onboardingData.targetAudience?.psychographics || '',
    },
    
    personality: {
      traits: onboardingData.brandPersonality || [],
      toneOfVoice: onboardingData.brandPersonality?.length
        ? `${onboardingData.brandPersonality.slice(0, 3).join(', ')} tone`
        : undefined,
    },
    
    visual: {
      colorPalette: {
        primaryColors: onboardingData.colorPreferences?.preferredColors || [],
        colorMood: onboardingData.colorPreferences?.colorMood || '',
        avoidColors: onboardingData.colorPreferences?.avoidColors,
      },
      typography: {
        style: onboardingData.stylePreferences?.typographyStyle || 'sans-serif',
      },
      visualStyle: {
        overallStyle: onboardingData.stylePreferences?.visualStyle || 'modern',
        imageStyle: onboardingData.stylePreferences?.imageStyle,
      },
    },
    
    industry: {
      sector: onboardingData.brandIndustry || '',
      competitorReferences: onboardingData.competitorReferences,
    },
    
    metadata: {
      completionSource: 'onboarding',
      onboardingTimestamp: completionTimestamp,
      hasExistingBrand: onboardingData.existingBrand || false,
      additionalNotes: onboardingData.additionalNotes,
    },
  };
}

/**
 * Helper function to identify which identity guideline fields need user attention
 */
export function getFieldsNeedingAttention(data: OnboardingResponse): {
  required: string[];
  recommended: string[];
  optional: string[];
} {
  const filled = {
    hasName: !!data.brandName,
    hasDescription: !!data.brandDescription,
    hasIndustry: !!data.brandIndustry,
    hasAudience: !!(data.targetAudience?.primaryAudience || data.targetAudience?.demographics),
    hasPersonality: !!(data.brandPersonality?.length),
    hasValues: !!(data.brandValues?.length),
    hasColors: !!(data.colorPreferences?.preferredColors?.length || data.colorPreferences?.colorMood),
    hasStyle: !!(data.stylePreferences?.visualStyle || data.stylePreferences?.typographyStyle),
  };
  
  return {
    required: [
      // Fields that should be filled but aren't
      ...(!filled.hasName ? ['Brand Name'] : []),
      ...(!filled.hasDescription ? ['Brand Description'] : []),
      'Brand Tagline', // Always empty from onboarding
      'Logo Guidelines', // Always needs attention
    ],
    
    recommended: [
      // Fields that would benefit from user refinement
      ...(!filled.hasIndustry ? ['Industry Context'] : []),
      'Target Audience Age Range',
      'Brand Archetype',
      'Typography Hierarchy',
      'Secondary Colors',
      'Voice & Messaging Guidelines',
    ],
    
    optional: [
      // Fields that can be filled later
      'Legal Information',
      'Application Guidelines',
      'Social Media Guidelines',
      'Visual Style Details',
    ],
  };
}

/**
 * Validate that onboarding data has minimum required fields for transformation
 */
export function validateOnboardingData(data: OnboardingResponse): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];
  
  if (!data.brandName) missingFields.push('Brand Name');
  if (!data.brandDescription) missingFields.push('Brand Description');
  
  if (!data.targetAudience?.primaryAudience && !data.targetAudience?.demographics) {
    warnings.push('No target audience specified - forms will have empty audience fields');
  }
  
  if (!data.brandPersonality?.length) {
    warnings.push('No brand personality traits - tone of voice will need manual input');
  }
  
  if (!data.colorPreferences?.preferredColors?.length && !data.colorPreferences?.colorMood) {
    warnings.push('No color preferences - color palette will be empty');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}
