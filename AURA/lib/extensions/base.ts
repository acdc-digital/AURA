// EXTENSIONS BASE - Base extension class and interfaces
// /Users/matthewsimon/Projects/AURA/AURA/lib/extensions/base.ts

export interface ExtensionTool {
  command: string;
  name: string;
  description: string;
  usage?: string;
}

export interface ExtensionPricing {
  price: number;
  model: 'one-time' | 'subscription' | 'usage-based';
  currency: 'USD';
}

export interface ExtensionState {
  [key: string]: unknown;
}

export interface ExtensionSession {
  id: string;
  extensionId: string;
  startedAt: Date;
  expiresAt: Date;
  state: ExtensionState;
  isActive: boolean;
}

export interface ExtensionExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  shouldContinue?: boolean;
  stateUpdate?: ExtensionState;
}

export abstract class BaseExtension {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly pricing: ExtensionPricing;
  abstract readonly tools: ExtensionTool[];
  abstract readonly isPremium: boolean;

  // Extension lifecycle
  abstract onActivate(): Promise<void>;
  abstract onDeactivate(): Promise<void>;
  
  // Session management
  abstract createSession(userId: string): Promise<ExtensionSession>;
  abstract validateSession(sessionId: string): Promise<boolean>;
  abstract endSession(sessionId: string): Promise<void>;

  // Tool execution
  abstract executeCommand(
    command: string, 
    args: string[], 
    sessionId: string,
    userId: string
  ): Promise<ExtensionExecutionResult>;

  // State management
  abstract getSessionState(sessionId: string): Promise<ExtensionState>;
  abstract updateSessionState(sessionId: string, updates: ExtensionState): Promise<void>;

  // Extension metadata
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      pricing: this.pricing,
      tools: this.tools,
      isPremium: this.isPremium,
    };
  }

  // Validation helpers
  protected validateCommand(command: string): boolean {
    return this.tools.some(tool => tool.command === command);
  }

  protected createSessionId(): string {
    return `ext_${this.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  protected isSessionExpired(session: ExtensionSession): boolean {
    return new Date() > session.expiresAt;
  }
}
