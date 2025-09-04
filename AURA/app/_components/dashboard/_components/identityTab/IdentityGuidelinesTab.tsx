// IDENTITY GUIDELINES TAB - Brand identity management interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/identityTab/IdentityGuidelinesTab.tsx

"use client";

import { useEffect } from 'react';
import { useIdentityGuidelines } from '@/lib/hooks';
import { useIdentityGuidelinesStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  AlertCircle,
  Users,
  Palette,
  Type,
  Building2,
  MessageSquare,
  Eye,
  Download,
  Clock,
  Image,
  Shield,
  Bookmark,
  Globe,
  Save
} from 'lucide-react';

// Import form sections
import { CoreBrandSection } from './sections/CoreBrandSection';
import { ColorPaletteSection } from './sections/ColorPaletteSection';
import {
  TargetAudienceSection,
  BrandPersonalitySection,
  ContentGuidelinesSection,
  LogoGuidelinesSection,
  TypographySection,
  VisualStyleSection,
  ApplicationGuidelinesSection,
  LegalResourcesSection
} from './sections/index';

import { BrandPreviewPanel } from './BrandPreviewPanel';

interface IdentityGuidelinesTabProps {
  isReadOnly?: boolean;
}

export function IdentityGuidelinesTab({ isReadOnly = false }: IdentityGuidelinesTabProps) {
  const {
    guidelines,
    isLoading,
    hasGuidelines,
    createInitialGuidelines,
    completionPercentage,
    sectionsComplete,
    totalSections,
    isComplete
  } = useIdentityGuidelines();

  // Use store for state management
  const {
    viewMode,
    activeSection,
    isSaving,
    lastSaved,
    setActiveSection,
    togglePreview,
    setIsSaving,
    setLastSaved
  } = useIdentityGuidelinesStore();
  
  // Function to trigger save for the current section
  const handleHeaderSave = () => {
    console.log('🎯 Header save button clicked for section:', activeSection);
    // This will trigger a custom event that the active section can listen for
    const saveEvent = new CustomEvent('triggerSectionSave', {
      detail: { section: activeSection }
    });
    window.dispatchEvent(saveEvent);
  };

  // Function to toggle preview mode
  const handlePreviewToggle = () => {
    togglePreview();
  };

  // Initialize guidelines if they don't exist
  useEffect(() => {
    if (!isLoading && !hasGuidelines && !isReadOnly) {
      createInitialGuidelines().catch(console.error);
    }
  }, [isLoading, hasGuidelines, createInitialGuidelines, isReadOnly]);

  // Navigation items - Based on comprehensive brand identity guide elements
  const navigationItems = [
    {
      id: 'brand-overview',
      label: 'Brand Overview',
      icon: Building2,
      description: 'Brand story, mission, vision, values',
      completed: !!(guidelines?.businessName && guidelines?.missionStatement && guidelines?.visionStatement)
    },
    {
      id: 'target-audience',
      label: 'Target Audience',
      icon: Users,
      description: 'Primary & secondary audiences',
      completed: !!guidelines?.targetAudience
    },
    {
      id: 'brand-personality',
      label: 'Brand Personality',
      icon: MessageSquare,
      description: 'Voice, tone, and archetype',
      completed: !!guidelines?.brandPersonality
    },
    {
      id: 'logo-guidelines',
      label: 'Logo Guidelines',
      icon: Bookmark,
      description: 'Primary logo, variations, usage rules',
      completed: !!guidelines?.logoGuidelines
    },
    {
      id: 'color-palette',
      label: 'Color Palette',
      icon: Palette,
      description: 'Primary, secondary & accent colors',
      completed: !!guidelines?.colorPalette?.primaryColors
    },
    {
      id: 'typography',
      label: 'Typography',
      icon: Type,
      description: 'Font families, hierarchy, usage',
      completed: !!guidelines?.typography
    },
    {
      id: 'visual-style',
      label: 'Visual Style',
      icon: Image,
      description: 'Imagery, iconography, style guide',
      completed: !!guidelines?.visualStyle
    },
    {
      id: 'tone-messaging',
      label: 'Tone & Messaging',
      icon: MessageSquare,
      description: 'Voice attributes, key messages',
      completed: !!guidelines?.contentGuidelines
    },
    {
      id: 'applications',
      label: 'Brand Applications',
      icon: Globe,
      description: 'Website, marketing, stationery',
      completed: !!guidelines?.applicationGuidelines
    },
    {
      id: 'legal-resources',
      label: 'Legal & Resources',
      icon: Shield,
      description: 'Copyright, contacts, downloads',
      completed: !!guidelines?.legalInformation
    }
  ];

  const renderSection = () => {
    if (!guidelines) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-[#858585] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#cccccc] mb-2">No Guidelines Found</h3>
            <p className="text-[#858585] mb-4">Create your brand identity guidelines to get started.</p>
            {!isReadOnly && (
              <Button onClick={createInitialGuidelines} className="bg-[#007acc] hover:bg-[#005a9e]">
                Create Guidelines
              </Button>
            )}
          </div>
        </div>
      );
    }

    const sectionProps = {
      guidelines,
      isReadOnly: isReadOnly,
      onSave: () => {
        setIsSaving(true);
        // Update the save timestamp to indicate successful save
        setTimeout(() => {
          setLastSaved(new Date());
          setIsSaving(false);
        }, 500); // Small delay to show saving state
      }
    };

    switch (activeSection) {
      case 'brand-overview':
        return <CoreBrandSection {...sectionProps} />;
      case 'target-audience':
        return <TargetAudienceSection {...sectionProps} />;
      case 'brand-personality':
        return <BrandPersonalitySection {...sectionProps} />;
      case 'logo-guidelines':
        return <LogoGuidelinesSection {...sectionProps} />;
      case 'color-palette':
        return <ColorPaletteSection {...sectionProps} />;
      case 'typography':
        return <TypographySection {...sectionProps} />;
      case 'visual-style':
        return <VisualStyleSection {...sectionProps} />;
      case 'tone-messaging':
        return <ContentGuidelinesSection {...sectionProps} />;
      case 'applications':
        return <ApplicationGuidelinesSection {...sectionProps} />;
      case 'legal-resources':
        return <LegalResourcesSection {...sectionProps} />;
      default:
        return <CoreBrandSection {...sectionProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#858585]">Loading identity guidelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Unified Header */}
      <div className="border-b border-[#2d2d30] bg-[#252526] px-6">
        {/* Top row with title and buttons */}
        <div className="h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[#cccccc] font-[system-ui]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>Identity Guidelines</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="flex items-center gap-1 text-xs text-[#858585]">
                <Clock className="w-3 h-3" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            
            {isSaving && (
              <div className="flex items-center gap-2 text-xs text-[#858585]">
                <div className="w-3 h-3 border border-[#007acc] border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {/* Preview Button */}
              <button
                onClick={handlePreviewToggle}
                className={`h-7 w-7 bg-[#252526] border rounded text-[#858585] hover:text-[#cccccc] hover:border-[#007acc] transition-colors flex items-center justify-center ${
                  viewMode === 'preview' ? 'border-[#007acc] text-[#cccccc]' : 'border-[#454545]'
                }`}
                title="Preview Brand Document"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              {/* Save Button */}
              {!isReadOnly && (
                <button
                  onClick={handleHeaderSave}
                  disabled={isSaving}
                  className="h-7 w-7 bg-[#252526] border border-[#454545] rounded text-[#858585] hover:text-[#cccccc] hover:border-[#007acc] transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Save Current Section"
                >
                  {isSaving ? (
                    <div className="w-3 h-3 border border-[#007acc] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {/* Download Button */}
              <button
                className="h-7 w-7 bg-[#252526] border border-[#454545] rounded text-[#858585] hover:text-[#cccccc] hover:border-[#007acc] transition-colors flex items-center justify-center"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar row */}
        <div className="pb-3 -mt-2">
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.25 bg-[#2d2d30] rounded-full overflow-hidden">
              <div 
                className={`h-full bg-[#007acc] transition-all duration-300`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm text-[#858585]">
              {completionPercentage}% complete
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-[#2d2d30] bg-[#181818] flex flex-col">
          <div className="p-2">
            <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
              <span>Brand Guide</span>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-1 mt-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <div key={item.id} className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
                    <button
                      onClick={() => setActiveSection(item.id as 'brand-overview')}
                      className={`w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors ${
                        isActive ? 'bg-[#2d2d2d]/50' : ''
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#858585]" />
                      <span className={`text-xs font-medium flex-1 text-left ${
                        isActive ? 'text-[#007acc]' : 'text-[#cccccc]'
                      }`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {isActive && <CheckCircle className="w-3 h-3 text-[#007acc]" />}
                        {item.completed && !isActive && <CheckCircle className="w-3 h-3 text-green-400" />}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Brand Status Overview */}
            <div className="mt-4">
              <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-3.5 h-3.5 text-[#858585]" />
                    <span className="text-xs font-medium text-[#cccccc]">Overview</span>
                  </div>
                  <div className="text-[10px] text-[#858585] space-y-1">
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="text-[#cccccc]">{sectionsComplete}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="text-[#cccccc]">{totalSections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="text-[#cccccc]">{completionPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`text-${isComplete ? '[#4ade80]' : '[#fbbf24]'}`}>
                        {isComplete ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4">
              <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-[#858585]" />
                    <span className="text-xs font-medium text-[#cccccc]">Quick Actions</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        // Export guidelines functionality
                      }}
                      className="w-full text-left text-xs text-[#858585] hover:text-[#cccccc] px-2 py-1 hover:bg-[#2d2d2d]/30 rounded transition-colors"
                    >
                      Export Guidelines
                    </button>
                    <button
                      onClick={() => {
                        // Import guidelines functionality  
                      }}
                      className="w-full text-left text-xs text-[#858585] hover:text-[#cccccc] px-2 py-1 hover:bg-[#2d2d2d]/30 rounded transition-colors"
                    >
                      Import Guidelines
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {viewMode === 'edit' ? renderSection() : <BrandPreviewPanel />}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
