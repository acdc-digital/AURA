// SESSION SYNC HOOK - Synchronize terminal sessions between client and Convex
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useSessionSync.ts

"use client";

import { api } from "@/convex/_generated/api";
import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useUser } from "./useUser";
import { useOnboarding } from "./useOnboarding";
import { useCallback, useEffect, useRef } from "react";
import { useTerminalStore } from "@/lib/store/terminal";

// Global lock to prevent duplicate session creation across all hook instances
let globalSessionCreationLock = false;

interface SessionUpdate {
  title?: string;
  isActive?: boolean;
  lastActivity?: number;
  preview?: string;
}

export function useSessionSync(enableSync: boolean = true) {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const { needsOnboarding } = useOnboarding();
  
  const userId = user?.clerkId;
  
  // Query sessions from Convex
  const convexSessions = useQuery(
    api.chat.getUserSessions,
    userId ? { userId } : "skip"
  );
  
  // Reset sync state when user changes
  useEffect(() => {
    if (userId) {
      const storeState = useTerminalSessionStore.getState();
      console.log('👤 User ID effect triggered:', {
        userId,
        currentlySynced: storeState.isSynced,
        activeSessionId: storeState.activeSessionId
      });
      
      // Only reset if we have a different user than before
      // Don't reset on first load or same user
      if (storeState.isSynced && storeState.activeSessionId) {
        console.log('ℹ️ User has existing session state, keeping it');
      } else {
        console.log('🔄 User has no session state, will sync from Convex');
      }
    }
  }, [userId]);
  
  // Mutations for session operations
  const createSessionMutation = useMutation(api.chat.createSession);
  const updateSessionMutation = useMutation(api.chat.updateSession);
  const deleteSessionMutation = useMutation(api.chat.deleteSession);
  
  // Terminal session mutation
  const createTerminalSessionMutation = useMutation(api.terminal.saveTerminalSession);
  
  // Create session with sync to Convex
  const createSessionWithSync = useCallback(async (title: string) => {
    if (!isAuthenticated || !userId) {
      return;
    }
    
    // Global lock to prevent duplicate creation across all instances
    if (globalSessionCreationLock) {
      console.log('⚠️ Global session creation lock active, waiting...');
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100));
      if (globalSessionCreationLock) {
        throw new Error('Another session creation is in progress');
      }
    }

    try {
      globalSessionCreationLock = true;
      const sessionId = crypto.randomUUID();
      console.log('📝 Creating new session:', { sessionId, title, userId });
      
      // Create chat session
      await createSessionMutation({
        sessionId,
        title,
        userId,
      });
      
      // Create corresponding terminal session
      await createTerminalSessionMutation({
        terminalId: sessionId,
        buffer: [],
        title: title,
        currentDirectory: "~",
      });
      
      // Set as active session in both stores
      const chatStore = useTerminalSessionStore.getState();
      const terminalStore = useTerminalStore.getState();
      chatStore.setActiveSession(sessionId);
      terminalStore.setActiveTerminal(sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    } finally {
      globalSessionCreationLock = false;
    }
  }, [isAuthenticated, userId, createSessionMutation, createTerminalSessionMutation]);
  
  // Track if we're currently creating a session to prevent duplicates
  const isCreatingSession = useRef(false);
  
  // Reset sync state when user logs out or changes
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚪 User logged out, resetting session state');
      const store = useTerminalSessionStore.getState();
      store.resetState();
      isCreatingSession.current = false;
      globalSessionCreationLock = false;
    } else if (!userId) {
      console.log('⏳ User authenticated but no userId yet, waiting...');
    } else {
      console.log('✅ User authenticated with ID:', userId);
    }
  }, [isAuthenticated, userId]);
  
  // Sync Convex sessions to local store - only once per data change
  useEffect(() => {
    if (!enableSync || !isAuthenticated || !userId) {
      return;
    }

    const store = useTerminalSessionStore.getState();
    console.log('🔄 useSessionSync effect running:', {
      convexSessionsCount: convexSessions?.length || 0,
      synced: store.isSynced,
      activeSessionId: store.activeSessionId,
      needsOnboarding,
      isCreatingSession: isCreatingSession.current,
      convexSessionsLoaded: convexSessions !== undefined
    });
    
    // Wait for Convex sessions to load before making decisions
    if (convexSessions === undefined) {
      console.log('⏳ Waiting for Convex sessions to load...');
      return;
    }
    
    // Prevent multiple simultaneous session creations
    if (isCreatingSession.current || globalSessionCreationLock) {
      console.log('⚠️ Session creation already in progress, skipping');
      return;
    }
    
    // If we're already synced and have an active session, verify it exists in Convex
    if (store.isSynced && store.activeSessionId && convexSessions.length > 0) {
      const activeSessionExists = convexSessions.find(s => s.sessionId === store.activeSessionId);
      if (activeSessionExists) {
        console.log('✅ Active session still exists in Convex, no sync needed');
        return;
      } else {
        console.log('⚠️ Active session no longer exists in Convex, needs re-sync');
        // Reset sync state to allow re-syncing
        store.setSynced(false);
      }
    }
    
    // If no sessions exist, create a default one
    if (convexSessions.length === 0) {
      console.log('📝 No sessions found, creating initial session...');
      const title = needsOnboarding ? 'Onboarding Chat' : 'Terminal Chat';
      
      // Set creation flag to prevent duplicates
      isCreatingSession.current = true;
      globalSessionCreationLock = true;
      
      // Use the mutation directly to avoid circular dependency
      const sessionId = crypto.randomUUID();
      
      Promise.all([
        createSessionMutation({
          sessionId,
          title,
          userId,
        }),
        createTerminalSessionMutation({
          terminalId: sessionId,
          buffer: [],
          title: title,
          currentDirectory: "~",
        })
      ]).then(() => {
        // Set as active session in both stores
        const chatStore = useTerminalSessionStore.getState();
        const terminalStore = useTerminalStore.getState();
        chatStore.setActiveSession(sessionId);
        terminalStore.setActiveTerminal(sessionId);
        chatStore.setSynced(true);
        isCreatingSession.current = false;
        globalSessionCreationLock = false;
        console.log('✅ Initial session created successfully:', sessionId);
      }).catch((error) => {
        console.error('Failed to create initial session:', error);
        isCreatingSession.current = false;
        globalSessionCreationLock = false;
      });
      return;
    }
    
    // Set active session if none exists but we have sessions
    if (convexSessions.length > 0 && (!store.activeSessionId || !store.isSynced)) {
      let sessionToActivate;

      if (needsOnboarding) {
        // During onboarding, prioritize onboarding sessions
        sessionToActivate = convexSessions.find(session =>
          session.title?.toLowerCase().includes('onboarding') ||
          session.title?.toLowerCase().includes('welcome')
        );
        
        // If no onboarding session exists during onboarding, create one
        if (!sessionToActivate) {
          console.log('📝 No onboarding session found during onboarding, creating one...');
          
          // Prevent duplicate creation
          if (isCreatingSession.current || globalSessionCreationLock) {
            return;
          }
          
          isCreatingSession.current = true;
          globalSessionCreationLock = true;
          const sessionId = crypto.randomUUID();
          
          Promise.all([
            createSessionMutation({
              sessionId,
              title: 'Onboarding Chat',
              userId,
            }),
            createTerminalSessionMutation({
              terminalId: sessionId,
              buffer: [],
              title: 'Onboarding Chat',
              currentDirectory: "~",
            })
          ]).then(() => {
            const chatStore = useTerminalSessionStore.getState();
            const terminalStore = useTerminalStore.getState();
            chatStore.setActiveSession(sessionId);
            terminalStore.setActiveTerminal(sessionId);
            chatStore.setSynced(true);
            isCreatingSession.current = false;
            globalSessionCreationLock = false;
            console.log('✅ Onboarding session created successfully:', sessionId);
          }).catch((error) => {
            console.error('Failed to create onboarding session:', error);
            isCreatingSession.current = false;
            globalSessionCreationLock = false;
          });
          return;
        }
      }

      // If no onboarding session found or not onboarding, use latest session
      if (!sessionToActivate) {
        sessionToActivate = convexSessions.reduce((latest, current) =>
          current.lastActivity > latest.lastActivity ? current : latest
        );
      }

      if (sessionToActivate) {
        console.log('🎯 Activating session:', sessionToActivate.sessionId);
        const chatStore = useTerminalSessionStore.getState();
        const terminalStore = useTerminalStore.getState();
        chatStore.setActiveSession(sessionToActivate.sessionId);
        terminalStore.setActiveTerminal(sessionToActivate.sessionId);
        chatStore.setSynced(true);
      }
    }
  }, [convexSessions, isAuthenticated, userId, needsOnboarding, enableSync, createSessionMutation, createTerminalSessionMutation]);
  
  // Sync session to Convex
  const syncSessionToConvex = useCallback(async (sessionId: string, updates: SessionUpdate) => {
    if (isAuthenticated) {
      try {
        await updateSessionMutation({
          sessionId,
          updates: {
            title: updates.title,
            isActive: updates.isActive,
            lastActivity: updates.lastActivity || Date.now(),
            preview: updates.preview,
          },
        });
      } catch (error) {
        console.error('Failed to sync session to Convex:', error);
      }
    }
  }, [isAuthenticated, updateSessionMutation]);
  
  // Create session in Convex
  const createSessionInConvex = useCallback(async (sessionId: string, title?: string) => {
    if (isAuthenticated && userId) {
      try {
        await createSessionMutation({
          sessionId,
          title,
          userId,
        });
      } catch (error) {
        console.error('Failed to create session in Convex:', error);
      }
    }
  }, [isAuthenticated, createSessionMutation, userId]);
  
  // Delete session in Convex
  const deleteSessionInConvex = useCallback(async (sessionId: string) => {
    if (isAuthenticated) {
      try {
        await deleteSessionMutation({ sessionId });
      } catch (error) {
        console.error('Failed to delete session in Convex:', error);
      }
    }
  }, [isAuthenticated, deleteSessionMutation]);
  
  return { 
    syncSessionToConvex, 
    createSessionInConvex, 
    deleteSessionInConvex,
    createSessionWithSync,
    isLoading: !convexSessions && isAuthenticated,
  };
}
