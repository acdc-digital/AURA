// TERMINAL SESSION STORE - Session management for terminal chat
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/terminal-sessions.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface TerminalSessionState {
  // Session Management
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoadingSessions: boolean;

  // Actions
  createSession: (title?: string, userId?: string) => Promise<string>;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
  
  // Session Operations
  loadSessions: (sessions: ChatSession[]) => void;
  setActiveSession: (sessionId: string) => void;
  updateSessionMetadata: (sessionId: string, metadata: Partial<ChatSession>) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setLoadingSessions: (loading: boolean) => void;

  // Utilities
  getActiveSession: () => ChatSession | null;
  getSessionById: (sessionId: string) => ChatSession | null;
}

export const useTerminalSessionStore = create<TerminalSessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      isLoadingSessions: false,

      createSession: async (title?: string, userId?: string) => {
        const sessionId = crypto.randomUUID();
        
        // Auto-generate intuitive title
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const defaultTitle = `Chat ${timeString}`;
        
        const newSession: ChatSession = {
          sessionId,
          title: title || defaultTitle,
          isActive: true,
          totalTokens: 0,
          totalCost: 0,
          messageCount: 0,
          createdAt: Date.now(),
          lastActivity: Date.now(),
          preview: '',
          userId,
        };
        
        // Add to local store immediately for instant UI feedback
        set(state => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: sessionId,
        }));
        
        // Note: Convex sync will happen through useSessionSync hook
        // which will create the session in the backend
        
        return sessionId;
      },

      switchSession: (sessionId: string) => {
        const session = get().getSessionById(sessionId);
        if (session) {
          set({ activeSessionId: sessionId });
          // Update last activity
          get().updateSessionMetadata(sessionId, { lastActivity: Date.now() });
        }
      },

      deleteSession: (sessionId: string) => {
        const state = get();
        const updatedSessions = state.sessions.filter(s => s.sessionId !== sessionId);
        
        // If we're deleting the active session, switch to another one
        let newActiveSessionId = state.activeSessionId;
        if (state.activeSessionId === sessionId) {
          newActiveSessionId = updatedSessions.length > 0 ? updatedSessions[0].sessionId : null;
        }

        set({
          sessions: updatedSessions,
          activeSessionId: newActiveSessionId,
        });
      },

      renameSession: (sessionId: string, newTitle: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.sessionId === sessionId
              ? { ...session, title: newTitle, lastActivity: Date.now() }
              : session
          ),
        }));
      },

      loadSessions: (sessions: ChatSession[]) => {
        set({ 
          sessions,
          isLoadingSessions: false,
        });
      },

      setActiveSession: (sessionId: string) => {
        set({ activeSessionId: sessionId });
      },

      updateSessionMetadata: (sessionId: string, metadata: Partial<ChatSession>) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.sessionId === sessionId
              ? { ...session, ...metadata, lastActivity: Date.now() }
              : session
          ),
        }));
      },

      setSessions: (sessions: ChatSession[]) => {
        set({ sessions });
      },

      setLoadingSessions: (loading: boolean) => {
        set({ isLoadingSessions: loading });
      },

      // Utilities
      getActiveSession: () => {
        const state = get();
        return state.sessions.find(s => s.sessionId === state.activeSessionId) || null;
      },

      getSessionById: (sessionId: string) => {
        const state = get();
        return state.sessions.find(s => s.sessionId === sessionId) || null;
      },
    }),
    {
      name: 'terminal-sessions',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
