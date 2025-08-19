// AGENT BASE CLASSES - Abstract base classes and interfaces for the agent system
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/base.ts

import type { Id } from "@/convex/_generated/dataModel";

export interface AgentTool {
  command: string;
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
}

export interface AgentExecutionContext {
  sessionId?: string;
  userId?: string | Id<"users">;
  projectId?: Id<"projects">;
}

export interface ConvexMutations {
  createProject: (args: {
    name: string;
    description?: string;
    status?: "active" | "completed" | "on-hold";
    userId?: string | Id<"users">;
  }) => Promise<Id<"projects">>;
  createFile: (args: {
    name: string;
    type: "post" | "campaign" | "note" | "document" | "image" | "video" | "other";
    content?: string;
    projectId: Id<"projects">;
    userId?: string | Id<"users">;
    extension?: string;
    platform?: "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube";
  }) => Promise<Id<"files">>;
  updateFile: (args: {
    id: Id<"files">;
    content?: string;
    lastModified?: number;
  }) => Promise<void>;
  addChatMessage: (args: {
    role: "user" | "assistant" | "system" | "terminal" | "thinking";
    content: string;
    sessionId?: string;
    userId?: string | Id<"users">;
    operation?: {
      type: "file_created" | "project_created" | "tool_executed" | "error" | "campaign_created";
      details?: Record<string, unknown>;
    };
    interactiveComponent?: {
      type: "project_selector" | "file_name_input" | "file_type_selector" | "file_selector" | "edit_instructions_input" | "multi_file_selector" | "url_input";
      data?: Record<string, unknown>;
      status: "pending" | "completed" | "cancelled";
      result?: Record<string, unknown>;
    };
  }) => Promise<Id<"chatMessages">>;
  updateChatMessage: (args: {
    id: Id<"chatMessages">;
    content?: string;
    interactiveComponent?: {
      type: "project_selector" | "file_name_input" | "file_type_selector" | "file_selector" | "edit_instructions_input" | "multi_file_selector" | "url_input";
      data?: Record<string, unknown>;
      status: "pending" | "completed" | "cancelled";
      result?: Record<string, unknown>;
    };
  }) => Promise<void>;
  updateAgentProgress: (args: {
    sessionId: string;
    agentType: string;
    percentage: number;
    status: string;
    isComplete: boolean;
  }) => Promise<void>;
}

export interface AgentExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  requiresUserInput?: boolean;
  interactiveComponent?: {
    type: string;
    data?: Record<string, unknown>;
  };
}

export abstract class BaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly isPremium: boolean;
  abstract readonly tools: AgentTool[];

  /**
   * Execute a tool with the given input and context
   */
  abstract execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult>;

  /**
   * Get tool by command string
   */
  getTool(command: string): AgentTool | undefined {
    return this.tools.find(tool => tool.command === command);
  }

  /**
   * Validate if agent can execute in current context
   */
  canExecute(): boolean {
    // Base implementation - always allow execution
    return true;
  }

  /**
   * Get agent metadata for UI display
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      isPremium: this.isPremium,
      toolCount: this.tools.length,
      tools: this.tools,
    };
  }
}

export interface AgentActivationState {
  agentId: string;
  isActive: boolean;
  activatedAt: number;
}

export interface AgentSystemState {
  activeAgents: string[];
  agentActivations: Record<string, AgentActivationState>;
  lastExecutedTool?: {
    agentId: string;
    tool: string;
    timestamp: number;
  };
}
