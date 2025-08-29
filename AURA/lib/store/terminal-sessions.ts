// TERMINAL SESSION UI STORE - UI state management for terminal sessions (data from Convex)
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/terminal-sessions.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

// This interface is kept for compatibility but data comes from Convex
export interface ChatSession {
  sessionId: string;
  title: string;
  isActive: boolean;
  totalTokens: number;
  totalCost: number;
  messageCount: number;
  createdAt: number;
  lastActivity: number;
  preview: string;
  userId?: string;
  convexId?: string; // Track the Convex document ID
}

interface TerminalSessionUIState {
  // UI State only - sessions data comes from Convex via useTerminal hook
  activeSessionId: string | null;
  isLoadingSessions: boolean;

  // UI Actions only
  setActiveSession: (sessionId: string) => void;
  setLoadingSessions: (loading: boolean) => void;
  
  // Utility functions for UI
  getActiveSessionId: () => string | null;
}

export const useTerminalSessionStore = create<TerminalSessionUIState>()(
  persist(
    (set, get) => ({
      // Initial UI state
      activeSessionId: null,
      isLoadingSessions: false,

      // UI actions
      setActiveSession: (sessionId: string) => {
        set({ activeSessionId: sessionId });
      },

      setLoadingSessions: (loading: boolean) => {
        set({ isLoadingSessions: loading });
      },

      // Utility functions
      getActiveSessionId: () => {
        const state = get();
        return state.activeSessionId;
      },
    }),
    {
      name: "terminal-session-ui-store",
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        // Don't persist loading states
      }),
    }
  )
);

// Type exports for compatibility
export type { TerminalSessionUIState };
