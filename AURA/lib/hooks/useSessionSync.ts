// SESSION SYNC HOOK - Synchronize terminal sessions between client and Convex
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useSessionSync.ts

"use client";

import { api } from "@/convex/_generated/api";
import { useTerminalSessionStore, ChatSession } from "@/lib/store/terminal-sessions";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useUser } from "./useUser";
import { useCallback, useEffect, useRef } from "react";

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
  
  // Function to create session in both local store and Convex
  const createSessionWithSync = useCallback(async (title?: string) => {
    if (!isAuthenticated || !userId) return null;
    
    const sessionId = crypto.randomUUID();
    
    // Auto-generate intuitive title
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const defaultTitle = `Chat ${timeString}`;
    const finalTitle = title || defaultTitle;
    
    // Create session in Convex first
    const convexId = await createSessionMutation({
      sessionId,
      title: finalTitle,
      userId,
    });
    
    // Create local session with Convex ID
    const newSession: ChatSession = {
      sessionId,
      title: finalTitle,
      isActive: true,
      totalTokens: 0,
      totalCost: 0,
      messageCount: 0,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      preview: '',
      userId,
      convexId,
    };
    
    // Update local store
    const store = useTerminalSessionStore.getState();
    store.setSessions([...store.sessions, newSession]);
    store.setActiveSession(sessionId);
    
    return sessionId;
  }, [isAuthenticated, userId, createSessionMutation]);
  
  // Sync Convex sessions to local store - only once per data change
  useEffect(() => {
    if (convexSessions && isAuthenticated && userId) {
      const syncedSessions: ChatSession[] = convexSessions.map(session => ({
        sessionId: session.sessionId,
        title: session.title || 'Untitled Session',
        isActive: session.isActive,
        totalTokens: session.totalTokens,
        totalCost: session.totalCost,
        messageCount: session.messageCount,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        preview: session.preview || '',
        userId: session.userId || undefined,
      }));
      
      const store = useTerminalSessionStore.getState();
      
      // Only sync if we haven't already synced or if the data changed
      const currentSessionIds = store.sessions.map(s => s.sessionId).sort().join(',');
      const newSessionIds = syncedSessions.map(s => s.sessionId).sort().join(',');
      
      if (currentSessionIds !== newSessionIds || !syncedRef.current) {
        store.loadSessions(syncedSessions);
        
        // Set active session if none exists
        if (!store.activeSessionId && syncedSessions.length > 0) {
          store.setActiveSession(syncedSessions[0].sessionId);
        }
        
        syncedRef.current = true;
      }
    }
  }, [convexSessions, isAuthenticated, userId]);
  
  // Create initial session if none exist
  useEffect(() => {
    if (isAuthenticated && userId && convexSessions && convexSessions.length === 0) {
      const store = useTerminalSessionStore.getState();
      
      // Only create if we haven't already created one locally
      if (store.sessions.length === 0) {
        createSessionMutation({
          sessionId: crypto.randomUUID(),
          title: "Terminal Chat",
          userId,
        }).catch(console.error);
      }
    }
  }, [isAuthenticated, userId, convexSessions, createSessionMutation]);
  
  // Sync session to Convex
  const syncSessionToConvex = useCallback(async (sessionId: string, updates: Partial<ChatSession>) => {
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
