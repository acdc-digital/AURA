// BRAND PREVIEW PANEL - Preview display for brand identity guidelines
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/identityTab/BrandPreviewPanel.tsx

"use client";

import { useIdentityGuidelines } from '@/lib/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Target, Heart, Palette } from 'lucide-react';

export function BrandPreviewPanel() {
  const { guidelines, isLoading } = useIdentityGuidelines();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007acc]"></div>
      </div>
    );
  }

  if (!guidelines) {
    return (
      <div className="flex items-center justify-center h-full text-[#858585]">
        <p>No brand guidelines found. Please create your brand identity first.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#cccccc] mb-4">
            {guidelines.businessName || 'Brand Identity'}
          </h1>
          {guidelines.brandSlogan && (
            <p className="text-xl text-[#007acc] italic">
              "{guidelines.brandSlogan}"
            </p>
          )}
        </div>

        {/* Business Overview */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-[#007acc]" />
            <h2 className="text-2xl font-semibold text-[#cccccc]">Business Overview</h2>
          </div>
          
          {guidelines.businessDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#cccccc] mb-2">Description</h3>
              <p className="text-[#858585] leading-relaxed">{guidelines.businessDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.missionStatement && (
              <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                <h3 className="text-lg font-medium text-[#cccccc] mb-3">Mission</h3>
                <p className="text-[#858585] leading-relaxed">{guidelines.missionStatement}</p>
              </div>
            )}

            {guidelines.visionStatement && (
              <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                <h3 className="text-lg font-medium text-[#cccccc] mb-3">Vision</h3>
                <p className="text-[#858585] leading-relaxed">{guidelines.visionStatement}</p>
              </div>
            )}
          </div>
        </div>

        {/* Core Values */}
        {guidelines.coreValues && guidelines.coreValues.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-[#007acc]" />
              <h2 className="text-2xl font-semibold text-[#cccccc]">Core Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guidelines.coreValues.map((value, index) => (
                <div key={index} className="bg-[#2d2d30] border border-[#454545] rounded-lg p-4">
                  <p className="text-[#cccccc] font-medium capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Audience */}
        {guidelines.targetAudience && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-[#007acc]" />
              <h2 className="text-2xl font-semibold text-[#cccccc]">Target Audience</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guidelines.targetAudience.primaryDemographic && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Primary Demographic</h3>
                  <p className="text-[#858585]">{guidelines.targetAudience.primaryDemographic}</p>
                </div>
              )}

              {guidelines.targetAudience.ageRange && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Age Range</h3>
                  <p className="text-[#858585]">{guidelines.targetAudience.ageRange}</p>
                </div>
              )}

              {guidelines.targetAudience.interests && guidelines.targetAudience.interests.length > 0 && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {guidelines.targetAudience.interests.map((interest, index) => (
                      <span 
                        key={index} 
                        className="bg-[#007acc]/20 text-[#007acc] px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {guidelines.targetAudience.painPoints && guidelines.targetAudience.painPoints.length > 0 && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Pain Points</h3>
                  <div className="space-y-2">
                    {guidelines.targetAudience.painPoints.map((point, index) => (
                      <p key={index} className="text-[#858585]">• {point}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {guidelines.targetAudience.psychographics && (
              <div className="mt-6 bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                <h3 className="text-lg font-medium text-[#cccccc] mb-3">Psychographics</h3>
                <p className="text-[#858585] leading-relaxed">{guidelines.targetAudience.psychographics}</p>
              </div>
            )}
          </div>
        )}

        {/* Brand Personality */}
        {guidelines.brandPersonality && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-[#007acc]" />
              <h2 className="text-2xl font-semibold text-[#cccccc]">Brand Personality</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guidelines.brandPersonality.traits && guidelines.brandPersonality.traits.length > 0 && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Personality Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {guidelines.brandPersonality.traits.map((trait, index) => (
                      <span 
                        key={index} 
                        className="bg-[#007acc]/20 text-[#007acc] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {guidelines.brandPersonality.toneOfVoice && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Tone of Voice</h3>
                  <p className="text-[#858585] leading-relaxed">{guidelines.brandPersonality.toneOfVoice}</p>
                </div>
              )}

              {guidelines.brandPersonality.communicationStyle && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Communication Style</h3>
                  <p className="text-[#858585] leading-relaxed">{guidelines.brandPersonality.communicationStyle}</p>
                </div>
              )}

              {guidelines.brandPersonality.brandArchetype && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Brand Archetype</h3>
                  <p className="text-[#858585] leading-relaxed">{guidelines.brandPersonality.brandArchetype}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color Palette */}
        {guidelines.colorPalette && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-[#007acc]" />
              <h2 className="text-2xl font-semibold text-[#cccccc]">Color Palette</h2>
            </div>
            
            {guidelines.colorPalette.primaryColors && guidelines.colorPalette.primaryColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-[#cccccc] mb-3">Primary Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {guidelines.colorPalette.primaryColors.map((colorHex, index) => (
                    <div key={index} className="bg-[#2d2d30] border border-[#454545] rounded-lg p-4 text-center">
                      <div 
                        className="w-full h-16 rounded-md mb-3 border border-[#454545]"
                        style={{ backgroundColor: colorHex }}
                      ></div>
                      <p className="text-[#858585] text-sm">{colorHex}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guidelines.colorPalette.secondaryColors && guidelines.colorPalette.secondaryColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-[#cccccc] mb-3">Secondary Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {guidelines.colorPalette.secondaryColors.map((colorHex, index) => (
                    <div key={index} className="bg-[#2d2d30] border border-[#454545] rounded-lg p-4 text-center">
                      <div 
                        className="w-full h-16 rounded-md mb-3 border border-[#454545]"
                        style={{ backgroundColor: colorHex }}
                      ></div>
                      <p className="text-[#858585] text-sm">{colorHex}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typography */}
        {guidelines.typography && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-[#007acc]" />
              <h2 className="text-2xl font-semibold text-[#cccccc]">Typography</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guidelines.typography.primaryFont && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Primary Font</h3>
                  <p className="text-[#858585]">{guidelines.typography.primaryFont}</p>
                </div>
              )}

              {guidelines.typography.secondaryFont && (
                <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#cccccc] mb-3">Secondary Font</h3>
                  <p className="text-[#858585]">{guidelines.typography.secondaryFont}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
