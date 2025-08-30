// ONBOARDING TO IDENTITY MAPPING COMPONENT
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/identityTab/OnboardingMappingCard.tsx

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboardingMapping } from '@/lib/hooks/useOnboardingMapping';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  FileText,
  Users,
  Palette,
  Target,
  Heart,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap
} from 'lucide-react';

interface OnboardingMappingCardProps {
  onMappingComplete?: (guidelinesId: string) => void;
}

export function OnboardingMappingCard({ onMappingComplete }: OnboardingMappingCardProps) {
  const { 
    hasOnboardingData, 
    applyOnboardingToGuidelines, 
    getPreviewMapping 
  } = useOnboardingMapping();
  
  const [isApplying, setIsApplying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const preview = getPreviewMapping();
  
  const handleApplyMapping = async () => {
    setIsApplying(true);
    setResult(null);
    
    try {
      const mappingResult = await applyOnboardingToGuidelines();
      
      if (mappingResult.success) {
        setResult({
          success: true,
          message: `Successfully applied onboarding data to identity guidelines!`
        });
        
        if (mappingResult.guidelinesId && onMappingComplete) {
          onMappingComplete(mappingResult.guidelinesId);
        }
      } else {
        setResult({
          success: false,
          message: mappingResult.error || 'Failed to apply onboarding data'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  if (!hasOnboardingData) {
    return (
      <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 text-[#007acc]" />
          <h3 className="text-lg font-semibold text-[#cccccc]">No Onboarding Data Found</h3>
        </div>
        <p className="text-[#858585] mb-4">
          Complete the onboarding process to automatically populate your identity guidelines with your brand information.
        </p>
        <div className="flex items-center gap-2 text-sm text-[#858585]">
          <FileText className="w-4 h-4" />
          <span>You&apos;ll need to fill out identity guidelines manually</span>
        </div>
      </div>
    );
  }
  

  
  return (
    <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-[#cccccc]">Ready to Apply Onboarding Data</h3>
        </div>
        <Button
          onClick={handleApplyMapping}
          disabled={isApplying}
          className="bg-[#007acc] hover:bg-[#005a9e] text-white"
        >
          {isApplying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Applying...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Apply Now
            </>
          )}
        </Button>
      </div>
      
      <p className="text-[#858585]">
        Your onboarding responses can automatically populate {preview?.estimatedCompletion || 0}% of your identity guidelines.
      </p>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-green-400">
            {preview?.estimatedCompletion || 0}%
          </div>
          <div className="text-xs text-[#858585]">Auto-filled</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-[#007acc]">
            {preview?.fieldsNeedingAttention.required.length || 0}
          </div>
          <div className="text-xs text-[#858585]">Need Attention</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-[#fbbf24]">
            {preview?.fieldsNeedingAttention.recommended.length || 0}
          </div>
          <div className="text-xs text-[#858585]">Recommended</div>
        </div>
      </div>
      
      {/* Preview Toggle */}
      <div className="border-t border-[#2d2d2d] pt-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm text-[#858585] hover:text-[#cccccc] transition-colors"
        >
          {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        
        {showPreview && preview && (
          <div className="mt-4 space-y-4">
            {/* What Will Be Filled */}
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4">
              <h4 className="text-sm font-medium text-[#cccccc] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                Will Be Auto-Filled
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {preview.transformedData.businessName && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-[#858585]" />
                    <span className="text-[#cccccc]">Brand Name:</span>
                    <span className="text-[#858585]">{preview.transformedData.businessName}</span>
                  </div>
                )}
                {preview.transformedData.businessDescription && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-[#858585]" />
                    <span className="text-[#cccccc]">Description</span>
                  </div>
                )}
                {preview.transformedData.targetAudience?.primaryDemographic && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-[#858585]" />
                    <span className="text-[#cccccc]">Target Audience</span>
                  </div>
                )}
                {preview.transformedData.brandPersonality?.traits?.length && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-[#858585]" />
                    <span className="text-[#cccccc]">Brand Personality</span>
                  </div>
                )}
                {preview.transformedData.coreValues?.length && (
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-[#858585]" />
                    <span className="text-[#cccccc]">Core Values</span>
                  </div>
                )}
                {preview.transformedData.colorPalette?.primaryColors?.length && (
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3 text-[#858585]" />
                    <span className="text-[#cccccc]">Color Preferences</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fields Needing Attention */}
            {preview.fieldsNeedingAttention.required.length > 0 && (
              <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#cccccc] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                  Will Need Your Attention
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preview.fieldsNeedingAttention.required.map((field) => (
                    <Badge key={field} variant="outline" className="bg-[#2d2d30] border-[#fbbf24]/30 text-[#fbbf24]">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Validation Warnings */}
            {preview.validation.warnings.length > 0 && (
              <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#cccccc] mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#007acc]" />
                  Additional Notes
                </h4>
                <ul className="space-y-1 text-sm text-[#858585]">
                  {preview.validation.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#007acc] mt-2 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Result Message */}
      {result && (
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          result.success 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {result.success ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{result.message}</span>
          {result.success && (
            <ArrowRight className="w-4 h-4 ml-auto" />
          )}
        </div>
      )}
      
      {/* Time Saved Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#858585] border-t border-[#2d2d2d] pt-4">
        <Clock className="w-3 h-3" />
        <span>This will save you ~15-20 minutes of manual data entry</span>
      </div>
    </div>
  );
}
