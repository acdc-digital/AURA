// CORE BRAND SECTION - Comprehensive brand foundation and identity
// Based on professional brand identity guide best practices

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IdentityGuidelines } from '@/lib/hooks';
import { Building2, Target, Heart, Plus, X } from 'lucide-react';

interface CoreBrandSectionProps {
  guidelines: IdentityGuidelines;
  isReadOnly?: boolean;
}

export function CoreBrandSection({ guidelines, isReadOnly = false }: CoreBrandSectionProps) {
  const [formData, setFormData] = useState({
    businessName: guidelines?.businessName || '',
    brandSlogan: guidelines?.brandSlogan || '',
    businessDescription: guidelines?.businessDescription || '',
    missionStatement: guidelines?.missionStatement || '',
    visionStatement: guidelines?.visionStatement || '',
    coreValues: guidelines?.coreValues || []
  });

  const [newValue, setNewValue] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddValue = () => {
    if (newValue.trim() && !formData.coreValues.includes(newValue.trim())) {
      setFormData(prev => ({
        ...prev,
        coreValues: [...prev.coreValues, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      coreValues: prev.coreValues.filter(value => value !== valueToRemove)
    }));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          {/* Business Identity Card */}
          <div className="bg-[#2d2d30] border border-[#454545] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#007acc]" />
              <h3 className="text-md font-semibold text-[#cccccc]">Business Identity</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#cccccc] mb-2">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  readOnly={isReadOnly}
                  className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] focus:border-[#007acc]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#cccccc] mb-2">
                  Brand Slogan/Tagline
                </label>
                <Input
                  value={formData.brandSlogan}
                  onChange={(e) => handleInputChange('brandSlogan', e.target.value)}
                  placeholder="Your memorable tagline"
                  readOnly={isReadOnly}
                  className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] focus:border-[#007acc]"
                />
                <p className="text-xs text-[#858585] mt-1">
                  A brief, memorable phrase that captures your brand essence
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cccccc] mb-2">
                  Business Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  placeholder="Describe what your business does, your products/services, and what makes you unique..."
                  readOnly={isReadOnly}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#454545] text-[#cccccc] placeholder-[#858585] rounded-md resize-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Purpose & Vision */}
        <div className="space-y-6">
          {/* Mission & Vision Card */}
          <div className="bg-[#2d2d30] border border-[#454545] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[#007acc]" />
              <h3 className="text-md font-semibold text-[#cccccc]">Purpose & Vision</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#cccccc] mb-2">
                  Mission Statement <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.missionStatement}
                  onChange={(e) => handleInputChange('missionStatement', e.target.value)}
                  placeholder="What is your company's purpose? Why does your business exist?"
                  readOnly={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#454545] text-[#cccccc] placeholder-[#858585] rounded-md resize-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                />
                <p className="text-xs text-[#858585] mt-1">
                  Your purpose and what you aim to achieve today
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#cccccc] mb-2">
                  Vision Statement <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.visionStatement}
                  onChange={(e) => handleInputChange('visionStatement', e.target.value)}
                  placeholder="What future state does your company aspire to create or achieve?"
                  readOnly={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#454545] text-[#cccccc] placeholder-[#858585] rounded-md resize-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                />
                <p className="text-xs text-[#858585] mt-1">
                  The aspirational future you&apos;re working toward
                </p>
              </div>
            </div>
          </div>

          {/* Core Values Card */}
          <div className="bg-[#2d2d30] border border-[#454545] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-[#007acc]" />
              <h3 className="text-md font-semibold text-[#cccccc]">Core Values</h3>
            </div>
            <p className="text-xs text-[#858585] mb-4">
              The fundamental beliefs and principles that guide your brand&apos;s decisions and actions
            </p>
            
            {/* Add new value input */}
            {!isReadOnly && (
              <div className="flex gap-2 mb-4">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Add a core value (e.g., Innovation, Integrity, Customer-first)"
                  className="bg-[#1e1e1e] border-[#454545] text-[#cccccc] placeholder-[#858585] focus:border-[#007acc]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                />
                <Button
                  onClick={handleAddValue}
                  disabled={!newValue.trim()}
                  size="sm"
                  className="bg-[#007acc] hover:bg-[#005a9e]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Values list */}
            <div className="flex flex-wrap gap-2">
              {formData.coreValues.length > 0 ? (
                formData.coreValues.map((value, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-[#1e1e1e] border-[#007acc] text-[#cccccc] hover:bg-[#2d2d30] transition-colors"
                  >
                    {value}
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveValue(value)}
                        className="ml-2 text-[#858585] hover:text-red-400 transition-colors"
                        title={`Remove ${value}`}
                        aria-label={`Remove ${value}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-[#858585] italic">
                  No core values added yet. Add values that represent your brand&apos;s principles.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
