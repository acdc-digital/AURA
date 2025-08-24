// COLOR PALETTE SECTION - Brand color palette management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/identityTab/sections/ColorPaletteSection.tsx

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIdentityGuidelines, IdentityGuidelines } from '@/lib/hooks';
import { Palette } from 'lucide-react';

interface ColorPaletteSectionProps {
  guidelines: IdentityGuidelines;
  isReadOnly?: boolean;
  onSave?: () => void;
}

// Default Tailwind color options for the palette
const TAILWIND_COLORS = [
  { name: 'Blue', class: 'bg-blue-500', value: 'blue-500' },
  { name: 'Red', class: 'bg-red-500', value: 'red-500' },
  { name: 'Green', class: 'bg-green-500', value: 'green-500' },
  { name: 'Purple', class: 'bg-purple-500', value: 'purple-500' },
  { name: 'Orange', class: 'bg-orange-500', value: 'orange-500' },
  { name: 'Pink', class: 'bg-pink-500', value: 'pink-500' },
  { name: 'Indigo', class: 'bg-indigo-500', value: 'indigo-500' },
  { name: 'Teal', class: 'bg-teal-500', value: 'teal-500' },
  { name: 'Yellow', class: 'bg-yellow-500', value: 'yellow-500' },
  { name: 'Emerald', class: 'bg-emerald-500', value: 'emerald-500' },
];

export function ColorPaletteSection({ guidelines, isReadOnly = false, onSave }: ColorPaletteSectionProps) {
  const { updateVisualIdentity } = useIdentityGuidelines();
  
  // Get current colors from guidelines or use default placeholders
  const [selectedColors, setSelectedColors] = useState<string[]>(
    guidelines?.colorPalette?.primaryColors || ['blue-500', 'gray-500', 'green-500', 'purple-500', 'orange-500']
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleColorChange = (index: number, newColor: string) => {
    if (isReadOnly) return;
    
    const updatedColors = [...selectedColors];
    updatedColors[index] = newColor;
    setSelectedColors(updatedColors);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateVisualIdentity({
        colorPalette: {
          primaryColors: selectedColors,
          secondaryColors: [], // For future expansion
          accentColors: [] // For future expansion
        }
      });
      onSave?.();
    } catch (error) {
      console.error('Error saving color palette:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Always render the component
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-[#cccccc]" />
          <h2 className="text-lg font-semibold text-[#cccccc]">Color Palette</h2>
        </div>
        <p className="text-sm text-[#858585] mb-6">
          Select your brand&apos;s primary colors using Tailwind CSS color palette.
        </p>
      </div>

      {/* Current Color Display */}
      <div className="bg-[#2d2d30] border border-[#454545] rounded-lg p-6">
        <h3 className="text-md font-medium text-[#cccccc] mb-4">Current Brand Colors</h3>
        
        <div className="flex gap-4 mb-6">
          {selectedColors.map((color, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`w-16 h-16 rounded-lg border-2 border-[#454545] bg-${color} shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:border-[#007acc]`}
                title={`Color ${index + 1}: ${color}`}
              />
              <span className="text-xs text-[#858585] font-mono">
                {color}
              </span>
            </div>
          ))}
        </div>

        {!isReadOnly && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[#cccccc] mb-3">
                Available Colors - Click to Add to Palette
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {TAILWIND_COLORS.map((tailwindColor) => (
                  <button
                    key={tailwindColor.value}
                    className={`w-12 h-12 rounded-md ${tailwindColor.class} border border-[#454545] hover:border-[#007acc] transition-colors flex items-center justify-center group`}
                    title={`Add ${tailwindColor.name} to palette`}
                    onClick={() => {
                      // Replace the first selected color for now - in future we can make this smarter
                      handleColorChange(0, tailwindColor.value);
                    }}
                  >
                    <div className="w-full h-full rounded-md opacity-90 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#2d2d30]">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#007acc] hover:bg-[#005a9e] text-white"
              >
                {isSaving ? 'Saving...' : 'Save Color Palette'}
              </Button>
              <p className="text-xs text-[#858585]">
                Colors will be available across your brand materials
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-[#1e1e1e] border border-[#2d2d30] rounded-lg p-4">
        <h4 className="text-sm font-medium text-[#cccccc] mb-2">Debug Information</h4>
        <div className="space-y-1 text-xs text-[#858585]">
          <div>Guidelines loaded: {guidelines ? 'Yes' : 'No'}</div>
          <div>Current colors: {JSON.stringify(selectedColors)}</div>
          <div>Read-only mode: {isReadOnly ? 'Yes' : 'No'}</div>
          <div>Saving: {isSaving ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}
