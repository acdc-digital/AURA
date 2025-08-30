// ONBOARDING TO IDENTITY GUIDELINES MAPPER HOOK
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useOnboardingMapping.ts

"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  transformOnboardingToIdentity, 
  generateEnhancedBrandContext,
  getFieldsNeedingAttention,
  validateOnboardingData,
  type OnboardingResponse,
  type EnhancedBrandContext
} from '@/lib/utils/onboardingTransformer';

export interface OnboardingMappingResult {
  success: boolean;
  guidelinesId?: string;
  fieldsNeedingAttention?: ReturnType<typeof getFieldsNeedingAttention>;
  error?: string;
}

export function useOnboardingMapping() {
  const applyOnboardingAction = useAction(api.onboarding.applyOnboardingToGuidelines);
  
  /**
   * Get completed onboarding data for current user
   */
  const getCompletedOnboarding = useQuery(api.onboarding.getCompletedOnboarding);
  
  /**
   * Apply onboarding data to identity guidelines
   */
  const applyOnboardingToGuidelines = async (): Promise<OnboardingMappingResult> => {
    try {
      if (!getCompletedOnboarding) {
        return {
          success: false,
          error: 'No completed onboarding found'
        };
      }
      
      const onboardingData = getCompletedOnboarding.responses as OnboardingResponse;
      
      // Validate the onboarding data
      const validation = validateOnboardingData(onboardingData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Missing required fields: ${validation.missingFields.join(', ')}`
        };
      }
      
      // Use the action to apply onboarding data
      const result = await applyOnboardingAction({});
      
      if (result.success) {
        // Get fields that need user attention
        const fieldsNeedingAttention = getFieldsNeedingAttention(onboardingData);
        
        return {
          success: true,
          guidelinesId: result.guidelinesId,
          fieldsNeedingAttention
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to apply onboarding data'
        };
      }
      
    } catch (error) {
      console.error('Error applying onboarding to guidelines:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  
  /**
   * Generate enhanced brand context for AI tools
   */
  const generateBrandContext = (): EnhancedBrandContext | null => {
    if (!getCompletedOnboarding) return null;
    
    const onboardingData = getCompletedOnboarding.responses as OnboardingResponse;
    return generateEnhancedBrandContext(
      onboardingData, 
      getCompletedOnboarding.completedAt || Date.now()
    );
  };
  
  /**
   * Check if onboarding data exists and can be mapped
   */
  const canMapOnboarding = (): boolean => {
    if (!getCompletedOnboarding) return false;
    
    const onboardingData = getCompletedOnboarding.responses as OnboardingResponse;
    const validation = validateOnboardingData(onboardingData);
    return validation.isValid;
  };
  
  /**
   * Get preview of what will be mapped to identity guidelines
   */
  const getPreviewMapping = () => {
    if (!getCompletedOnboarding) return null;
    
    const onboardingData = getCompletedOnboarding.responses as OnboardingResponse;
    const transformedData = transformOnboardingToIdentity(onboardingData);
    const fieldsNeedingAttention = getFieldsNeedingAttention(onboardingData);
    const validation = validateOnboardingData(onboardingData);
    
    return {
      transformedData,
      fieldsNeedingAttention,
      validation,
      estimatedCompletion: transformedData.completionPercentage || 0
    };
  };
  
  return {
    // Data
    onboardingData: getCompletedOnboarding,
    hasOnboardingData: !!getCompletedOnboarding,
    canMapOnboarding: canMapOnboarding(),
    
    // Actions  
    applyOnboardingToGuidelines,
    generateBrandContext,
    getPreviewMapping,
    
    // Utilities
    validateOnboardingData: (data: OnboardingResponse) => validateOnboardingData(data),
    getFieldsNeedingAttention: (data: OnboardingResponse) => getFieldsNeedingAttention(data),
  };
}
