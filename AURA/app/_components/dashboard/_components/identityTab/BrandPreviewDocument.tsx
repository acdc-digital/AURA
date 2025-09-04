// BRAND PREVIEW DOCUMENT - Professional presentation-style brand identity document
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/identityTab/BrandPreviewDocument.tsx

"use client";

import { useIdentityGuidelines } from '@/lib/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Download, Share2 } from 'lucide-react';

interface BrandPreviewDocumentProps {
  onClose: () => void;
}

export function BrandPreviewDocument({ onClose }: BrandPreviewDocumentProps) {
  const { guidelines } = useIdentityGuidelines();

  if (!guidelines) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#1e1e1e] border border-[#454545] rounded-lg p-8 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-[#cccccc] mb-4">No Guidelines Found</h3>
          <p className="text-[#858585] mb-6">Please complete your brand identity guidelines first.</p>
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-[#1e1e1e] border-b border-[#454545] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#cccccc]">Brand Identity Preview</h2>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" className="h-8">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" variant="outline" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-[#252526] overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto bg-white p-8 m-8 shadow-xl rounded-lg">
              {/* Cover Page */}
              <div className="text-center py-16 border-b border-gray-200 mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {guidelines.businessName || 'Brand Identity'}
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  {guidelines.brandSlogan || 'Brand Guidelines'}
                </p>
                <p className="text-sm text-gray-500">
                  Generated on {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Table of Contents */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                    <span>1. Brand Overview</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                    <span>2. Visual Identity</span>
                    <span>4</span>
                  </div>
                  <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                    <span>3. Color Palette</span>
                    <span>5</span>
                  </div>
                  <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                    <span>4. Typography</span>
                    <span>6</span>
                  </div>
                  <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                    <span>5. Brand Voice</span>
                    <span>7</span>
                  </div>
                  <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                    <span>6. Applications</span>
                    <span>8</span>
                  </div>
                </div>
              </div>

              {/* Brand Overview Section */}
              <section className="mb-12 page-break">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
                  1. Brand Overview
                </h2>
                
                {guidelines.businessDescription && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">About Us</h3>
                    <p className="text-gray-700 leading-relaxed">{guidelines.businessDescription}</p>
                  </div>
                )}

                {guidelines.missionStatement && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Mission Statement</h3>
                    <p className="text-gray-700 leading-relaxed italic border-l-4 border-blue-500 pl-4">
                      &ldquo;{guidelines.missionStatement}&rdquo;
                    </p>
                  </div>
                )}

                {guidelines.visionStatement && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Vision Statement</h3>
                    <p className="text-gray-700 leading-relaxed italic border-l-4 border-green-500 pl-4">
                      &ldquo;{guidelines.visionStatement}&rdquo;
                    </p>
                  </div>
                )}

                {guidelines.coreValues && guidelines.coreValues.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Core Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guidelines.coreValues.map((value, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                          <span className="font-medium text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Color Palette Section */}
              <section className="mb-12 page-break">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
                  2. Color Palette
                </h2>
                
                {guidelines.colorPalette?.primaryColors && guidelines.colorPalette.primaryColors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Colors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {guidelines.colorPalette.primaryColors.map((color: string, index: number) => (
                        <div key={index} className="text-center">
                          <div 
                            className="w-full h-24 rounded-lg mb-3 border border-gray-200"
                            style={{ backgroundColor: color }}
                          ></div>
                          <h4 className="font-medium text-gray-800">Primary {index + 1}</h4>
                          <p className="text-sm text-gray-600 uppercase font-mono">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guidelines.colorPalette?.secondaryColors && guidelines.colorPalette.secondaryColors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Secondary Colors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {guidelines.colorPalette.secondaryColors.map((color: string, index: number) => (
                        <div key={index} className="text-center">
                          <div 
                            className="w-full h-24 rounded-lg mb-3 border border-gray-200"
                            style={{ backgroundColor: color }}
                          ></div>
                          <h4 className="font-medium text-gray-800">Secondary {index + 1}</h4>
                          <p className="text-sm text-gray-600 uppercase font-mono">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guidelines.colorPalette?.accentColors && guidelines.colorPalette.accentColors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Accent Colors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {guidelines.colorPalette.accentColors.map((color: string, index: number) => (
                        <div key={index} className="text-center">
                          <div 
                            className="w-full h-24 rounded-lg mb-3 border border-gray-200"
                            style={{ backgroundColor: color }}
                          ></div>
                          <h4 className="font-medium text-gray-800">Accent {index + 1}</h4>
                          <p className="text-sm text-gray-600 uppercase font-mono">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Target Audience Section */}
              {guidelines.targetAudience && (
                <section className="mb-12 page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
                    3. Target Audience
                  </h2>
                  
                  {guidelines.targetAudience.primaryDemographic && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Demographics</h3>
                      <p className="text-gray-700 leading-relaxed">{guidelines.targetAudience.primaryDemographic}</p>
                    </div>
                  )}

                  {guidelines.targetAudience.ageRange && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Age Range</h3>
                      <p className="text-gray-700 leading-relaxed">{guidelines.targetAudience.ageRange}</p>
                    </div>
                  )}

                  {guidelines.targetAudience.psychographics && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Psychographics</h3>
                      <p className="text-gray-700 leading-relaxed">{guidelines.targetAudience.psychographics}</p>
                    </div>
                  )}

                  {guidelines.targetAudience.interests && guidelines.targetAudience.interests.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {guidelines.targetAudience.interests.map((interest: string, index: number) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {guidelines.targetAudience.painPoints && guidelines.targetAudience.painPoints.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Pain Points</h3>
                      <div className="space-y-2">
                        {guidelines.targetAudience.painPoints.map((painPoint: string, index: number) => (
                          <div key={index} className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                            <span className="text-red-800">{painPoint}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Brand Personality Section */}
              {guidelines.brandPersonality && (
                <section className="mb-12 page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
                    4. Brand Personality
                  </h2>
                  
                  {guidelines.brandPersonality.traits && guidelines.brandPersonality.traits.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Personality Traits</h3>
                      <div className="flex flex-wrap gap-2">
                        {guidelines.brandPersonality.traits.map((trait, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {guidelines.brandPersonality.toneOfVoice && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Tone of Voice</h3>
                      <p className="text-gray-700 leading-relaxed">{guidelines.brandPersonality.toneOfVoice}</p>
                    </div>
                  )}

                  {guidelines.brandPersonality.communicationStyle && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Communication Style</h3>
                      <p className="text-gray-700 leading-relaxed">{guidelines.brandPersonality.communicationStyle}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Typography Section */}
              {guidelines.typography && (
                <section className="mb-12 page-break">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
                    5. Typography
                  </h2>
                  
                  {guidelines.typography.primaryFont && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Primary Font</h3>
                      <p className="text-gray-700 leading-relaxed font-mono text-lg">{guidelines.typography.primaryFont}</p>
                    </div>
                  )}

                  {guidelines.typography.secondaryFont && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Secondary Font</h3>
                      <p className="text-gray-700 leading-relaxed font-mono text-lg">{guidelines.typography.secondaryFont}</p>
                    </div>
                  )}

                  {guidelines.typography.fontHierarchy && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Font Hierarchy & Usage</h3>
                      <p className="text-gray-700 leading-relaxed">{guidelines.typography.fontHierarchy}</p>
                    </div>
                  )}

                  {guidelines.typography.webFonts && guidelines.typography.webFonts.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Web Fonts</h3>
                      <div className="space-y-2">
                        {guidelines.typography.webFonts.map((font: string, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <span className="font-mono text-gray-800">{font}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Footer */}
              <div className="text-center pt-12 mt-12 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  This document was generated by AURA Brand Identity System
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  © {new Date().getFullYear()} {guidelines.businessName || 'Your Business'}. All rights reserved.
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
