// SESSION SYNC HOOK - Synchronize terminal sessions between client and Convex
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useSessionSync.ts

"use client";

import { api } from "@/convex/_generated/api";
import { useTerminalSessionStore } from "@/lib/store/terminal-sessions";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useUser } from "./useUser";
import { useCallback, useEffect, useRef } from "react";

interface SessionUpdate {
  title?: string;
  isActive?: boolean;
  lastActivity?: number;
  preview?: string;
}

export function useSessionSync() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const syncedRef = useRef(false);
  
  // Get user ID from auth
  const userId = user?.clerkId || undefined;
  
  // Load sessions from Convex
  const convexSessions = useQuery(api.chat.getUserSessions, {
    userId: userId,
  });
  
  // Mutations for session operations
  const createSessionMutation = useMutation(api.chat.createSession);
  const updateSessionMutation = useMutation(api.chat.updateSession);
  const deleteSessionMutation = useMutation(api.chat.deleteSession);
  
  // Create session with sync to Convex
  const createSessionWithSync = useCallback(async (title: string) => {
    if (!isAuthenticated || !userId) {
      return;
    }

    try {
      const sessionId = crypto.randomUUID();
      await createSessionMutation({
        sessionId,
        title,
        userId,
      });
      
      // Set as active session
      const store = useTerminalSessionStore.getState();
      store.setActiveSession(sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, [isAuthenticated, userId, createSessionMutation]);
  
  // Sync Convex sessions to local store - only once per data change
  useEffect(() => {
    if (!convexSessions || !isAuthenticated || !userId) {
      return;
    }

    const store = useTerminalSessionStore.getState();
    
    // If no sessions exist, create a default one
    // REMOVED: Auto-creation now handled by Terminal component to prevent duplicates
    // if (convexSessions.length === 0 && !syncedRef.current) {
    //   console.log('📝 No sessions found, creating initial session...');
    //   createSessionWithSync('Terminal Chat').catch(console.error);
    //   syncedRef.current = true;
    //   return;
    // }
    
    // Set active session if none exists but we have sessions
    if (convexSessions.length > 0 && !store.activeSessionId) {
      const latestSession = convexSessions.reduce((latest, current) =>
        current.lastActivity > latest.lastActivity ? current : latest
      );
      store.setActiveSession(latestSession.sessionId);
      syncedRef.current = true;
    }
  }, [convexSessions, isAuthenticated, userId, createSessionWithSync]);
  
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
