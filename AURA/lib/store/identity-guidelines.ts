// IDENTITY GUIDELINES STORE - Identity guidelines tab UI state management
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/identity-guidelines.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type IdentitySection = 
  | 'brand-overview'
  | 'target-audience'
  | 'brand-personality'
  | 'color-palette'
  | 'typography'
  | 'logo-guidelines'
  | 'visual-style'
  | 'content-guidelines'
  | 'tone-messaging'
  | 'application-guidelines'
  | 'applications'
  | 'legal-resources';

export type IdentityViewMode = 'edit' | 'preview';

interface IdentityGuidelinesState {
  // View state
  viewMode: IdentityViewMode;
  activeSection: IdentitySection;
  
  // UI state
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  setViewMode: (mode: IdentityViewMode) => void;
  setActiveSection: (section: IdentitySection) => void;
  togglePreview: () => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
}

export const useIdentityGuidelinesStore = create<IdentityGuidelinesState>()(
  persist(
    (set, get) => ({
      // Initial state
      viewMode: 'edit',
      activeSection: 'brand-overview',
      isSaving: false,
      lastSaved: null,
      
      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setActiveSection: (section) => {
        // When switching sections, always go back to edit mode
        set({ activeSection: section, viewMode: 'edit' });
      },
      
      togglePreview: () => {
        const currentMode = get().viewMode;
        set({ viewMode: currentMode === 'edit' ? 'preview' : 'edit' });
      },
      
      setIsSaving: (saving) => set({ isSaving: saving }),
      
      setLastSaved: (date) => set({ lastSaved: date }),
    }),
    {
      name: 'identity-guidelines-store',
      // Only persist view preferences, not temporary state
      partialize: (state) => ({
        activeSection: state.activeSection,
        viewMode: state.viewMode,
      }),
    }
  )
);
