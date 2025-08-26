// COLOR PALETTE SECTION - Professional brand color palette management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/identityTab/sections/ColorPaletteSection.tsx

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useIdentityGuidelines, IdentityGuidelines } from '@/lib/hooks';
import { Palette, Check, Minus, Plus, Copy, Edit3, RotateCcw, Shuffle } from 'lucide-react';

interface ColorPaletteSectionProps {
  guidelines: IdentityGuidelines;
  isReadOnly?: boolean;
  onSave?: () => void;
}

// Professional color palette - curated selection
const CURATED_COLORS = [
  { name: 'Ocean Blue', hex: '#3b82f6', category: 'Professional' },
  { name: 'Forest Green', hex: '#10b981', category: 'Natural' },
  { name: 'Deep Purple', hex: '#7c3aed', category: 'Creative' },
  { name: 'Sunset Orange', hex: '#f97316', category: 'Energetic' },
  { name: 'Rose Pink', hex: '#f43f5e', category: 'Vibrant' },
  { name: 'Charcoal', hex: '#374151', category: 'Neutral' },
  { name: 'Slate Blue', hex: '#6366f1', category: 'Modern' },
  { name: 'Emerald', hex: '#059669', category: 'Fresh' },
  { name: 'Amber', hex: '#f59e0b', category: 'Warm' },
  { name: 'Crimson', hex: '#dc2626', category: 'Bold' },
  { name: 'Teal', hex: '#14b8a6', category: 'Calm' },
  { name: 'Violet', hex: '#8b5cf6', category: 'Elegant' },
];

// Predefined color palette suggestions
const PALETTE_SUGGESTIONS = [
  {
    name: 'Professional',
    description: 'Corporate and trustworthy',
    colors: ['#3b82f6', '#64748b', '#10b981', '#f59e0b']
  },
  {
    name: 'Creative',
    description: 'Bold and innovative',
    colors: ['#7c3aed', '#ec4899', '#f97316', '#06b6d4']
  },
  {
    name: 'Natural',
    description: 'Organic and sustainable',
    colors: ['#10b981', '#84cc16', '#78716c', '#6b7280']
  },
  {
    name: 'Tech',
    description: 'Modern and digital',
    colors: ['#6366f1', '#14b8a6', '#64748b', '#f43f5e']
  },
];

export function ColorPaletteSection({ guidelines, isReadOnly = false, onSave }: ColorPaletteSectionProps) {
  const { updateVisualIdentity } = useIdentityGuidelines();
  
  // Get current colors from guidelines or use sophisticated defaults
  const [selectedColors, setSelectedColors] = useState<string[]>(
    guidelines?.colorPalette?.primaryColors || ['#3b82f6', '#64748b', '#10b981', '#7c3aed']
  );

  // Update colors when guidelines change
  useEffect(() => {
    if (guidelines?.colorPalette?.primaryColors) {
      setSelectedColors(guidelines.colorPalette.primaryColors);
    }
  }, [guidelines?.colorPalette?.primaryColors]);

  const [isSaving, setIsSaving] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleColorSelect = (colorHex: string, index?: number) => {
    if (isReadOnly) return;
    
    if (index !== undefined) {
      // Replace specific color
      const updatedColors = [...selectedColors];
      updatedColors[index] = colorHex;
      setSelectedColors(updatedColors);
    } else {
      // Add new color if space available
      if (selectedColors.length < 6) {
        setSelectedColors([...selectedColors, colorHex]);
      }
    }
  };

  const handleRemoveColor = (index: number) => {
    if (isReadOnly || selectedColors.length <= 2) return;
    
    const updatedColors = selectedColors.filter((_, i) => i !== index);
    setSelectedColors(updatedColors);
  };

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const handleUsePaletteSuggestion = (palette: typeof PALETTE_SUGGESTIONS[0]) => {
    if (isReadOnly) return;
    setSelectedColors(palette.colors);
  };

  const handleShuffleColors = () => {
    if (isReadOnly) return;
    const shuffled = [...CURATED_COLORS]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(selectedColors.length, 4))
      .map(color => color.hex);
    setSelectedColors(shuffled);
  };

  const handleAddColor = () => {
    if (isReadOnly || selectedColors.length >= 6) return;
    setShowColorPicker(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateVisualIdentity({
        colorPalette: {
          primaryColors: selectedColors,
          secondaryColors: [],
          accentColors: []
        }
      });
      onSave?.();
    } catch (error) {
      console.error('Error saving color palette:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-[#007acc]" />
          <h2 className="text-[13px] font-medium text-[#cccccc] uppercase tracking-wider">Brand Colors</h2>
        </div>
        <p className="text-[11px] text-[#858585] leading-relaxed">
          Your brand&apos;s core color palette. Click colors to copy, use quick actions to modify.
        </p>
      </div>

      {/* Current Brand Colors with Quick Actions */}
      <div className="bg-[#252526] border border-[#2d2d30] rounded p-4">
        {/* Quick Actions Bar */}
        {!isReadOnly && (
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2d2d30]">
            <div className="flex items-center gap-1">
              <button
                onClick={handleAddColor}
                disabled={selectedColors.length >= 6}
                className="text-[10px] uppercase font-medium text-[#cccccc] hover:text-[#007acc] disabled:text-[#6a6a6a] disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                title="Add new color"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
              
              <div className="w-px h-4 bg-[#2d2d30] mx-2" />
              
              <button
                onClick={handleShuffleColors}
                className="text-[10px] uppercase font-medium text-[#cccccc] hover:text-[#007acc] transition-colors flex items-center gap-1"
                title="Generate random palette"
              >
                <Shuffle className="w-3 h-3" />
                Shuffle
              </button>
              
              <div className="w-px h-4 bg-[#2d2d30] mx-2" />
              
              <button
                onClick={() => setSelectedColors(['#3b82f6', '#64748b', '#10b981', '#7c3aed'])}
                className="text-[10px] uppercase font-medium text-[#cccccc] hover:text-[#007acc] transition-colors flex items-center gap-1"
                title="Reset to default palette"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>
        )}
        
        {/* Color Swatches */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {selectedColors.map((color, index) => (
            <div key={index} className="group relative mt-6">
              {/* Debug: Show what color we're trying to render */}
              <div className="absolute -top-6 left-0 text-[8px] text-[#858585] z-10">
                Color: {color} (Length: {color?.length})
              </div>
              
              {/* Simple color test - most basic possible approach */}
              <div
                onClick={() => {
                  console.log('Clicked color:', color);
                  handleCopyColor(color);
                }}
                style={{
                  width: '100%',
                  height: '64px',
                  backgroundColor: color,
                  border: '2px solid white',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                title={`Click to copy ${color}`}
              >
                {/* Test with actual hex value visible inside */}
                <div style={{
                  color: 'white',
                  fontSize: '10px',
                  padding: '4px',
                  textShadow: '1px 1px 1px black'
                }}>
                  {color}
                </div>
              </div>
              
              {/* Color info */}
              <div className="mt-1.5 text-[10px] font-mono text-[#858585] text-center truncate">
                {color}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Palette Suggestions */}
        {!isReadOnly && (
          <div className="pt-3 border-t border-[#2d2d30]">
            <h4 className="text-[10px] uppercase font-medium text-[#cccccc] tracking-wider mb-2">
              Quick Palettes
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PALETTE_SUGGESTIONS.map((palette) => (
                <button
                  key={palette.name}
                  className="group p-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#454545] hover:border-[#007acc] rounded transition-all duration-150"
                  onClick={() => handleUsePaletteSuggestion(palette)}
                  title={`Apply ${palette.name} palette`}
                >
                  <div className="flex gap-0.5 mb-1">
                    {palette.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          background: color,
                          height: '12px',
                          width: '12px',
                          border: '1px solid #454545'
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] text-[#cccccc] font-medium">{palette.name}</div>
                  <div className="text-[8px] text-[#6a6a6a]">{palette.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && !isReadOnly && (
        <div className="bg-[#252526] border border-[#2d2d30] rounded p-4">
          <h4 className="text-[11px] uppercase font-medium text-[#cccccc] tracking-wider mb-3">
            {editingIndex !== null ? 'Edit Color' : 'Add Color'}
          </h4>
          
          <div className="grid grid-cols-6 gap-2 mb-3">
            {CURATED_COLORS.map((color) => (
              <button
                key={color.hex}
                className="group relative"
                onClick={() => {
                  if (editingIndex !== null) {
                    handleColorSelect(color.hex, editingIndex);
                  } else {
                    handleColorSelect(color.hex);
                  }
                  setShowColorPicker(false);
                  setEditingIndex(null);
                }}
              >
                <div
                  className="w-10 h-10 rounded transition-colors"
                  style={{
                    background: color.hex,
                    height: '40px',
                    width: '40px',
                    border: '2px solid #454545',
                    cursor: 'pointer'
                  }}
                  title={`${color.name} (${color.hex})`}
                />
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShowColorPicker(false);
                setEditingIndex(null);
              }}
              className="bg-[#2d2d30] hover:bg-[#3a3a3a] text-[#cccccc] text-[10px] px-3 py-1.5 h-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#007acc] hover:bg-[#005a9e] text-white text-[11px] px-3 py-1.5 h-auto"
          >
            {isSaving ? 'Saving...' : 'Update Palette'}
          </Button>
          <p className="text-[10px] text-[#6a6a6a]">
            Colors will be available across your brand materials
          </p>
        </div>
      )}
    </div>
  );
}
