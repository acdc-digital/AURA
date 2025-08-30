// TERMINAL UI STORE - Terminal panel UI state management (business data in Convex)
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/terminal.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Alert {
  id: string;
  title: string;
  message: string;
  level: "info" | "warning" | "error";
  timestamp: number;
}

interface TerminalUIState {
  // Panel state
  isCollapsed: boolean;
  activeTab: "terminal" | "history" | "alerts" | "settings";
  size: number;
  height: number; // Terminal height in pixels

  // UI-only terminal management
  activeTerminalId: string | null;
  isProcessing: boolean; // UI processing state

  // Mode states
  isVoiceMode: boolean; // Voice input mode
  isChatMode: boolean; // Chat mode state (persisted across component mounts)

  // UI alerts
  alerts: Alert[];

  // Actions - Panel management
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  setActiveTab: (tab: "terminal" | "history" | "alerts" | "settings") => void;
  setSize: (size: number) => void;
  setHeight: (height: number) => void;

  // Actions - Mode management
  setVoiceMode: (enabled: boolean) => void;
  toggleVoiceMode: () => void;
  setChatMode: (enabled: boolean) => void;
  toggleChatMode: () => void;

  // Actions - UI state
  setActiveTerminal: (id: string) => void;
  setProcessing: (isProcessing: boolean) => void;

  // Actions - Alerts
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => void;
  clearAlerts: () => void;
  removeAlert: (id: string) => void;
}

export const useTerminalStore = create<TerminalUIState>()(
  persist(
    (set) => ({
      // Initial state
      isCollapsed: false,
      activeTab: "terminal",
      size: 40,
      height: 400,

      // UI-only terminal state
      activeTerminalId: null,
      isProcessing: false,

      // Mode states
      isVoiceMode: false,
      isChatMode: false,

      // Alerts (UI only)
      alerts: [],

      // Panel actions
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),

      toggleCollapse: () =>
        set((state: TerminalUIState) => ({
          isCollapsed: !state.isCollapsed,
          activeTab: !state.isCollapsed ? state.activeTab : "terminal",
        })),

      setActiveTab: (tab: "terminal" | "history" | "alerts" | "settings") =>
        set({ activeTab: tab }),

      setSize: (size: number) => set({ size }),

      setHeight: (height: number) => set({ height }),

      // Mode management actions
      setVoiceMode: (enabled: boolean) => set({ isVoiceMode: enabled }),

      toggleVoiceMode: () =>
        set((state: TerminalUIState) => ({
          isVoiceMode: !state.isVoiceMode
        })),

      // Chat mode management actions
      setChatMode: (enabled: boolean) => set({ isChatMode: enabled }),

      toggleChatMode: () =>
        set((state: TerminalUIState) => ({
          isChatMode: !state.isChatMode
        })),

      // UI state actions
      setActiveTerminal: (id: string) => {
        set({ activeTerminalId: id });
      },

      setProcessing: (isProcessing: boolean) => {
        set({ isProcessing });
      },

      // Alert actions
      addAlert: (alert: Omit<Alert, "id" | "timestamp">) => {
        const newAlert: Alert = {
          ...alert,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        
        set((state: TerminalUIState) => ({
          alerts: [...state.alerts, newAlert],
        }));
      },

      clearAlerts: () => set({ alerts: [] }),

      removeAlert: (id: string) =>
        set((state: TerminalUIState) => ({
          alerts: state.alerts.filter((alert: Alert) => alert.id !== id),
        })),
    }),
    {
      name: 'aura-terminal-ui-store',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        activeTab: state.activeTab,
        size: state.size,
        height: state.height,
        activeTerminalId: state.activeTerminalId,
        isVoiceMode: state.isVoiceMode,
      }),
      onRehydrateStorage: () => (state) => {
        // If this is a fresh session (no activeTerminalId), ensure terminal is expanded
        if (state && !state.activeTerminalId && state.isCollapsed) {
          console.log("Fresh session detected, expanding terminal");
          state.isCollapsed = false;
        }
      },
    }
  )
);
