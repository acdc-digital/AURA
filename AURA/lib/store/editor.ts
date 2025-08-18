// EDITOR STORE - Editor UI state management
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/editor.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Tab {
  id: string;
  title: string;
  type: 'file' | 'welcome' | 'settings' | 'subscription' | 'user-profile';
  filePath?: string;
  isDirty: boolean;
  isPinned: boolean;
}

interface EditorSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
}

interface EditorState {
  // Tab management
  tabs: Tab[];
  activeTabId: string | null;
  
  // Editor settings
  settings: EditorSettings;
  
  // Layout
  editorWidth: number;
  
  // User profile tab state
  userProfileView: 'profile' | 'settings';
  
  // Actions
  openTab: (tab: Omit<Tab, 'isDirty' | 'isPinned'>) => void;
  openSpecialTab: (id: string, title: string, type: Tab['type']) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  pinTab: (tabId: string) => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  setEditorWidth: (width: number) => void;
  setUserProfileView: (view: 'profile' | 'settings') => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      settings: {
        theme: 'dark',
        fontSize: 14,
        wordWrap: true,
        lineNumbers: true,
        minimap: false,
      },
      editorWidth: 800,
      userProfileView: 'profile',
      
      // Actions
      openTab: (tab) => set((state) => {
        const exists = state.tabs.find(t => t.id === tab.id);
        if (exists) {
          return { activeTabId: tab.id };
        }
        const newTab: Tab = {
          ...tab,
          isDirty: false,
          isPinned: false,
        };
        return {
          tabs: [...state.tabs, newTab],
          activeTabId: tab.id,
        };
      }),
      
      openSpecialTab: (id, title, type) => set((state) => {
        const exists = state.tabs.find(t => t.id === id);
        if (exists) {
          return { activeTabId: id };
        }
        const newTab: Tab = {
          id,
          title,
          type,
          isDirty: false,
          isPinned: false,
        };
        return {
          tabs: [...state.tabs, newTab],
          activeTabId: id,
        };
      }),
      
      closeTab: (tabId) => set((state) => {
        const tabs = state.tabs.filter(t => t.id !== tabId);
        const activeTabId = state.activeTabId === tabId 
          ? tabs[tabs.length - 1]?.id ?? null
          : state.activeTabId;
        return { tabs, activeTabId };
      }),
      
      setActiveTab: (tabId) => set({ activeTabId: tabId }),
      
      updateTabTitle: (tabId, title) => set((state) => ({
        tabs: state.tabs.map(t => 
          t.id === tabId ? { ...t, title } : t
        ),
      })),
      
      markTabDirty: (tabId, isDirty) => set((state) => ({
        tabs: state.tabs.map(t => 
          t.id === tabId ? { ...t, isDirty } : t
        ),
      })),
      
      pinTab: (tabId) => set((state) => ({
        tabs: state.tabs.map(t => 
          t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
        ),
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      setEditorWidth: (width) => set({ editorWidth: width }),
      
      setUserProfileView: (view) => set({ userProfileView: view }),
    }),
    {
      name: 'aura-editor-storage',
      partialize: (state) => ({
        settings: state.settings,
        editorWidth: state.editorWidth,
      }),
    }
  )
);
