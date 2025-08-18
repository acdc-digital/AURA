// TERMINAL STORE - Terminal panel state management
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/terminal.ts

import { create } from "zustand";

interface Alert {
  id: string;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: number;
}

interface TerminalState {
  // Panel state
  isCollapsed: boolean;
  activeTab: 'terminal' | 'history' | 'alerts';
  size: number;
  
  // Alerts
  alerts: Alert[];
  
  // Actions
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  setActiveTab: (tab: 'terminal' | 'history' | 'alerts') => void;
  setSize: (size: number) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  // Initial state
  isCollapsed: true,
  activeTab: 'terminal',
  size: 40,
  alerts: [],
  
  // Actions
  setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
  
  toggleCollapse: () => set((state: TerminalState) => ({ 
    isCollapsed: !state.isCollapsed,
    // Reset to terminal tab when opening
    activeTab: !state.isCollapsed ? state.activeTab : 'terminal'
  })),
  
  setActiveTab: (tab: 'terminal' | 'history' | 'alerts') => set({ activeTab: tab }),
  
  setSize: (size: number) => set({ size }),
  
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    set((state: TerminalState) => ({ 
      alerts: [...state.alerts, newAlert] 
    }));
  },
  
  clearAlerts: () => set({ alerts: [] }),
}));
