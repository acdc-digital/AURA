// EXTENSIONS REGISTRY - Central extension management and routing
// /Users/matthewsimon/Projects/AURA/AURA/lib/extensions/registry.ts

import { BaseExtension, ExtensionExecutionResult, ExtensionSession } from './base';

interface ExtensionPurchase {
  extensionId: string;
  userId: string;
  purchasedAt: Date;
  isActive: boolean;
}

export class ExtensionRegistry {
  private extensions = new Map<string, BaseExtension>();
  private sessions = new Map<string, ExtensionSession>();
  private purchases = new Map<string, ExtensionPurchase[]>();

  // Extension registration
  register(extension: BaseExtension): void {
    if (this.extensions.has(extension.id)) {
      console.warn(`Extension ${extension.id} is already registered`);
      return;
    }
    
    this.extensions.set(extension.id, extension);
    console.log(`✅ Extension registered: ${extension.name} (${extension.id})`);
  }

  unregister(extensionId: string): void {
    const extension = this.extensions.get(extensionId);
    if (extension) {
      // End all active sessions for this extension
      this.endAllSessions(extensionId);
      this.extensions.delete(extensionId);
      console.log(`❌ Extension unregistered: ${extensionId}`);
    }
  }

  // Extension access
  getExtension(extensionId: string): BaseExtension | undefined {
    return this.extensions.get(extensionId);
  }

  getAllExtensions(): BaseExtension[] {
    return Array.from(this.extensions.values());
  }

  getExtensionMetadata() {
    return Array.from(this.extensions.values()).map(ext => ext.getMetadata());
  }

  // Purchase management (placeholder for future payment integration)
  purchaseExtension(extensionId: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      // TODO: Integrate with actual payment system
      console.log(`🔄 Processing purchase: ${extensionId} for user ${userId}`);
      
      if (!this.purchases.has(userId)) {
        this.purchases.set(userId, []);
      }
      
      const userPurchases = this.purchases.get(userId)!;
      const existingPurchase = userPurchases.find(p => p.extensionId === extensionId);
      
      if (existingPurchase) {
        console.log(`⚠️ Extension already purchased: ${extensionId}`);
        resolve(false);
        return;
      }
      
      // Simulate purchase process
      setTimeout(() => {
        userPurchases.push({
          extensionId,
          userId,
          purchasedAt: new Date(),
          isActive: true,
        });
        
        console.log(`✅ Purchase completed: ${extensionId} for user ${userId}`);
        resolve(true);
      }, 1000);
    });
  }

  hasAccess(extensionId: string, userId: string): boolean {
    const extension = this.extensions.get(extensionId);
    if (!extension) return false;
    
    // Free extensions are always accessible
    if (!extension.isPremium) return true;
    
    // Check purchase status for premium extensions
    const userPurchases = this.purchases.get(userId) || [];
    return userPurchases.some(p => p.extensionId === extensionId && p.isActive);
  }

  // Session management
  async createSession(extensionId: string, userId: string): Promise<ExtensionSession | null> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      console.error(`Extension not found: ${extensionId}`);
      return null;
    }

    if (!this.hasAccess(extensionId, userId)) {
      console.error(`User ${userId} does not have access to extension ${extensionId}`);
      return null;
    }

    try {
      const session = await extension.createSession(userId);
      this.sessions.set(session.id, session);
      console.log(`🎯 Session created: ${session.id} for extension ${extensionId}`);
      return session;
    } catch (error) {
      console.error(`Failed to create session for extension ${extensionId}:`, error);
      return null;
    }
  }

  getSession(sessionId: string): ExtensionSession | undefined {
    return this.sessions.get(sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const extension = this.extensions.get(session.extensionId);
    if (extension) {
      try {
        await extension.endSession(sessionId);
      } catch (error) {
        console.error(`Error ending session ${sessionId}:`, error);
      }
    }

    this.sessions.delete(sessionId);
    console.log(`🔚 Session ended: ${sessionId}`);
  }

  private async endAllSessions(extensionId: string): Promise<void> {
    const extensionSessions = Array.from(this.sessions.values())
      .filter(session => session.extensionId === extensionId);

    for (const session of extensionSessions) {
      await this.endSession(session.id);
    }
  }

  // Command execution
  async executeCommand(
    extensionId: string,
    command: string,
    args: string[],
    sessionId: string,
    userId: string
  ): Promise<ExtensionExecutionResult> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      return {
        success: false,
        error: `Extension not found: ${extensionId}`,
      };
    }

    if (!this.hasAccess(extensionId, userId)) {
      return {
        success: false,
        error: `Access denied to extension: ${extensionId}`,
      };
    }

    const session = this.sessions.get(sessionId);
    if (!session || session.extensionId !== extensionId) {
      return {
        success: false,
        error: `Invalid session for extension: ${extensionId}`,
      };
    }

    try {
      const result = await extension.executeCommand(command, args, sessionId, userId);
      
      // Update session state if provided
      if (result.stateUpdate) {
        await extension.updateSessionState(sessionId, result.stateUpdate);
        session.state = { ...session.state, ...result.stateUpdate };
      }

      return result;
    } catch (error) {
      console.error(`Extension execution error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Utility methods
  getAllCommands(): Array<{ command: string; extensionId: string; extensionName: string }> {
    const commands: Array<{ command: string; extensionId: string; extensionName: string }> = [];
    
    for (const extension of this.extensions.values()) {
      for (const tool of extension.tools) {
        commands.push({
          command: tool.command,
          extensionId: extension.id,
          extensionName: extension.name,
        });
      }
    }
    
    return commands;
  }

  getExtensionByCommand(command: string): BaseExtension | undefined {
    for (const extension of this.extensions.values()) {
      if (extension.tools.some(tool => tool.command === command)) {
        return extension;
      }
    }
    return undefined;
  }

  // Cleanup expired sessions
  cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions = Array.from(this.sessions.values())
      .filter(session => now > session.expiresAt);

    for (const session of expiredSessions) {
      this.endSession(session.id);
    }
  }
}

// Global registry instance
export const extensionRegistry = new ExtensionRegistry();

// Auto-cleanup expired sessions every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    extensionRegistry.cleanupExpiredSessions();
  }, 5 * 60 * 1000);
}
