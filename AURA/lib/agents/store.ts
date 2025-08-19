// AGENT STORE - Zustand state management for agent system
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/store.ts

import { create } from "zustand";
import type { BaseAgent } from "./base";
import { agentRegistry } from "./registry";

interface AgentActivationState {
  agentId: string;
  isActive: boolean;
  activatedAt: number;
}

interface AgentExecutionHistory {
  agentId: string;
  command: string;
  input: string;
  result: {
    success: boolean;
    message: string;
  };
  timestamp: number;
}

interface AgentState {
  // Agent activation state
  activeAgents: Set<string>;
  agentActivations: Record<string, AgentActivationState>;
  
  // Execution state
  isExecuting: boolean;
  currentExecution?: {
    agentId: string;
    command: string;
    startTime: number;
  };
  executionHistory: AgentExecutionHistory[];
  
  // UI state
  selectedAgentId?: string;
  showAgentPanel: boolean;
  agentToolsMode: boolean; // Toggle between MCP and Agent tools
  
  // Actions
  activateAgent: (agentId: string) => void;
  deactivateAgent: (agentId: string) => void;
  toggleAgent: (agentId: string) => void;
  isAgentActive: (agentId: string) => boolean;
  
  setSelectedAgent: (agentId?: string) => void;
  setShowAgentPanel: (show: boolean) => void;
  setAgentToolsMode: (enabled: boolean) => void;
  
  setExecuting: (executing: boolean, execution?: { agentId: string; command: string }) => void;
  addExecutionHistory: (execution: Omit<AgentExecutionHistory, 'timestamp'>) => void;
  clearExecutionHistory: () => void;
  
  // Computed properties
  getActiveAgents: () => BaseAgent[];
  getAgentActivationState: (agentId: string) => AgentActivationState | undefined;
  getRecentExecutions: (limit?: number) => AgentExecutionHistory[];
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Initial state
  activeAgents: new Set<string>(),
  agentActivations: {},
  
  isExecuting: false,
  currentExecution: undefined,
  executionHistory: [],
  
  selectedAgentId: undefined,
  showAgentPanel: false,
  agentToolsMode: false,
  
  // Agent activation actions
  activateAgent: (agentId: string) => {
    const agent = agentRegistry.getAgent(agentId);
    if (!agent) {
      console.warn(`Cannot activate unknown agent: ${agentId}`);
      return;
    }

    set((state) => {
      const newActiveAgents = new Set(state.activeAgents);
      newActiveAgents.add(agentId);
      
      const newActivations = {
        ...state.agentActivations,
        [agentId]: {
          agentId,
          isActive: true,
          activatedAt: Date.now(),
        }
      };

      console.log(`🟢 Agent activated: ${agent.name}`);
      
      return {
        activeAgents: newActiveAgents,
        agentActivations: newActivations,
      };
    });
  },

  deactivateAgent: (agentId: string) => {
    const agent = agentRegistry.getAgent(agentId);
    
    set((state) => {
      const newActiveAgents = new Set(state.activeAgents);
      newActiveAgents.delete(agentId);
      
      const newActivations = { ...state.agentActivations };
      if (newActivations[agentId]) {
        newActivations[agentId] = {
          ...newActivations[agentId],
          isActive: false,
        };
      }

      if (agent) {
        console.log(`🔴 Agent deactivated: ${agent.name}`);
      }
      
      return {
        activeAgents: newActiveAgents,
        agentActivations: newActivations,
        selectedAgentId: state.selectedAgentId === agentId ? undefined : state.selectedAgentId,
      };
    });
  },

  toggleAgent: (agentId: string) => {
    const { isAgentActive, activateAgent, deactivateAgent } = get();
    
    if (isAgentActive(agentId)) {
      deactivateAgent(agentId);
    } else {
      activateAgent(agentId);
    }
  },

  isAgentActive: (agentId: string) => {
    return get().activeAgents.has(agentId);
  },

  // UI actions
  setSelectedAgent: (agentId?: string) => set({ selectedAgentId: agentId }),
  
  setShowAgentPanel: (show: boolean) => set({ showAgentPanel: show }),
  
  setAgentToolsMode: (enabled: boolean) => set({ agentToolsMode: enabled }),

  // Execution actions
  setExecuting: (executing: boolean, execution?: { agentId: string; command: string }) => {
    set({
      isExecuting: executing,
      currentExecution: executing && execution ? {
        ...execution,
        startTime: Date.now(),
      } : undefined,
    });
  },

  addExecutionHistory: (execution: Omit<AgentExecutionHistory, 'timestamp'>) => {
    set((state) => ({
      executionHistory: [
        {
          ...execution,
          timestamp: Date.now(),
        },
        ...state.executionHistory,
      ].slice(0, 100) // Keep last 100 executions
    }));
  },

  clearExecutionHistory: () => set({ executionHistory: [] }),

  // Computed properties
  getActiveAgents: () => {
    const { activeAgents } = get();
    return Array.from(activeAgents)
      .map(agentId => agentRegistry.getAgent(agentId))
      .filter((agent): agent is BaseAgent => agent !== undefined);
  },

  getAgentActivationState: (agentId: string) => {
    return get().agentActivations[agentId];
  },

  getRecentExecutions: (limit = 10) => {
    return get().executionHistory.slice(0, limit);
  },
}));
