// AGENT REGISTRY - Central registration and routing system for all agents
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/registry.ts

import { BaseAgent, ConvexMutations, AgentExecutionContext, AgentExecutionResult } from "./base";

export class AgentRegistry {
  private agents = new Map<string, BaseAgent>();
  private commandToAgent = new Map<string, string>();

  /**
   * Register an agent in the registry
   */
  register(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
    
    // Register all agent tools/commands
    agent.tools.forEach(tool => {
      if (this.commandToAgent.has(tool.command)) {
        console.warn(`Command "${tool.command}" already exists. Overwriting...`);
      }
      this.commandToAgent.set(tool.command, agent.id);
    });

    console.log(`✅ Agent registered: ${agent.name} (${agent.id})`);
    console.log(`   Tools: ${agent.tools.map(t => t.command).join(', ')}`);
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get agent by command
   */
  getAgentByCommand(command: string): BaseAgent | undefined {
    const agentId = this.commandToAgent.get(command);
    return agentId ? this.agents.get(agentId) : undefined;
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all available commands
   */
  getAllCommands(): string[] {
    return Array.from(this.commandToAgent.keys());
  }

  /**
   * Execute a command through the appropriate agent
   */
  async executeCommand(
    command: string,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      const agent = this.getAgentByCommand(command);
      
      if (!agent) {
        return {
          success: false,
          message: `Unknown command: ${command}. Available commands: ${this.getAllCommands().join(', ')}`
        };
      }

      const tool = agent.getTool(command);
      if (!tool) {
        return {
          success: false,
          message: `Tool not found for command: ${command}`
        };
      }

      // Check if agent can execute in current context
      if (!agent.canExecute()) {
        return {
          success: false,
          message: `Agent ${agent.name} cannot execute in current context`
        };
      }

      console.log(`🤖 Executing ${agent.name} - ${tool.name}: ${input.substring(0, 50)}...`);
      
      const result = await agent.execute(tool, input, mutations, context);
      
      console.log(`✅ ${agent.name} execution completed:`, result.success ? 'SUCCESS' : 'FAILED');
      
      return result;
    } catch (error) {
      console.error(`❌ Agent execution error:`, error);
      
      return {
        success: false,
        message: `Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get agent metadata for UI display
   */
  getAgentMetadata() {
    return this.getAllAgents().map(agent => agent.getMetadata());
  }

  /**
   * Check if a command exists
   */
  hasCommand(command: string): boolean {
    return this.commandToAgent.has(command);
  }

  /**
   * Get command suggestions based on partial input
   */
  getCommandSuggestions(partial: string): string[] {
    return this.getAllCommands()
      .filter(cmd => cmd.toLowerCase().includes(partial.toLowerCase()))
      .sort();
  }
}

// Global registry instance
export const agentRegistry = new AgentRegistry();
