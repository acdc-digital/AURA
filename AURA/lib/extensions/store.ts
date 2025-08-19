// EXTENSIONS STORE - Zustand store for extension UI state management
// /Users/matthewsimon/Projects/AURA/AURA/lib/extensions/store.ts

import { create } from 'zustand';
import { extensionRegistry } from './registry';
import { BaseExtension, ExtensionSession } from './base';

interface ExtensionStore {
  // UI State
  selectedExtensionId: string | undefined;
  purchasingExtensionId: string | undefined;
  activeSessions: Map<string, ExtensionSession>;
  
  // Extension Management
  availableExtensions: BaseExtension[];
  purchasedExtensions: Set<string>;
  
  // Actions
  setSelectedExtension: (extensionId: string | undefined) => void;
  refreshExtensions: () => void;
  
  // Purchase Actions
  purchaseExtension: (extensionId: string, userId: string) => Promise<boolean>;
  setPurchasing: (extensionId: string | undefined) => void;
  
  // Session Management
  createSession: (extensionId: string, userId: string) => Promise<ExtensionSession | null>;
  endSession: (sessionId: string) => Promise<void>;
  getSession: (sessionId: string) => ExtensionSession | undefined;
  
  // Utility
  hasAccess: (extensionId: string, userId: string) => boolean;
  isPurchased: (extensionId: string) => boolean;
  getExtensionById: (extensionId: string) => BaseExtension | undefined;
}

export const useExtensionStore = create<ExtensionStore>((set, get) => ({
  // Initial UI State
  selectedExtensionId: undefined,
  purchasingExtensionId: undefined,
  activeSessions: new Map(),
  availableExtensions: [],
  purchasedExtensions: new Set(),

  // Actions
  setSelectedExtension: (extensionId) => {
    set({ selectedExtensionId: extensionId });
  },

  refreshExtensions: () => {
    const extensions = extensionRegistry.getAllExtensions();
    set({ availableExtensions: extensions });
  },

  // Purchase Actions
  purchaseExtension: async (extensionId, userId) => {
    set({ purchasingExtensionId: extensionId });
    
    try {
      const success = await extensionRegistry.purchaseExtension(extensionId, userId);
      
      if (success) {
        const purchased = new Set(get().purchasedExtensions);
        purchased.add(extensionId);
        set({ purchasedExtensions: purchased });
      }
      
      return success;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    } finally {
      set({ purchasingExtensionId: undefined });
    }
  },

  setPurchasing: (extensionId) => {
    set({ purchasingExtensionId: extensionId });
  },

  // Session Management
  createSession: async (extensionId, userId) => {
    try {
      const session = await extensionRegistry.createSession(extensionId, userId);
      
      if (session) {
        const sessions = new Map(get().activeSessions);
        sessions.set(session.id, session);
        set({ activeSessions: sessions });
      }
      
      return session;
    } catch (error) {
      console.error('Session creation failed:', error);
      return null;
    }
  },

  endSession: async (sessionId) => {
    try {
      await extensionRegistry.endSession(sessionId);
      
      const sessions = new Map(get().activeSessions);
      sessions.delete(sessionId);
      set({ activeSessions: sessions });
    } catch (error) {
      console.error('Session end failed:', error);
    }
  },

  getSession: (sessionId) => {
    return get().activeSessions.get(sessionId);
  },

  // Utility
  hasAccess: (extensionId, userId) => {
    return extensionRegistry.hasAccess(extensionId, userId);
  },

  isPurchased: (extensionId) => {
    return get().purchasedExtensions.has(extensionId);
  },

  getExtensionById: (extensionId) => {
    return extensionRegistry.getExtension(extensionId);
  },
}));
