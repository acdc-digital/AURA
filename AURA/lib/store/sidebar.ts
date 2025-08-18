// SIDEBAR STORE - Sidebar and panel state management
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/sidebar.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PanelType = 
  | 'explorer' 
  | 'search-replace'
  | 'source-control'
  | 'extensions'
  | 'calendar' 
  | 'database' 
  | 'agents' 
  | 'terminal' 
  | 'trash' 
  | 'debug' 
  | 'account' 
  | 'settings';

interface SidebarState {
  // Panel state
  activePanel: PanelType;
  sidebarWidth: number;
  isCollapsed: boolean;
  
  // Actions
  setActivePanel: (panel: PanelType) => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      // Initial state
      activePanel: 'explorer',
      sidebarWidth: 320,
      isCollapsed: false,
      
      // Actions
      setActivePanel: (panel: PanelType) => set({ activePanel: panel }),
      
      setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
      
      toggleSidebar: () => set((state) => ({ 
        isCollapsed: !state.isCollapsed 
      })),
      
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'aura-sidebar-storage',
      partialize: (state) => ({
        activePanel: state.activePanel,
        sidebarWidth: state.sidebarWidth,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
