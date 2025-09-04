// AGENT SYSTEM - Main export and initialization
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/index.ts

// Export base classes and interfaces
export { BaseAgent } from "./base";
export type { 
  AgentTool, 
  AgentExecutionContext, 
  AgentExecutionResult, 
  ConvexMutations,
  AgentSystemState,
  AgentActivationState
} from "./base";

// Export registry
export { AgentRegistry, agentRegistry } from "./registry";

// Export store
export { useAgentStore } from "./store";

// Export individual agents
export { InstructionsAgent } from "./instructionsAgent";
export { FileCreatorAgent } from "./fileCreatorAgent";
export { ProjectCreatorAgent } from "./projectCreatorAgent";
export { TwitterAgent } from "./twitterAgent";
export { SchedulingAgent } from "./schedulingAgent";
export { PreviewAgent } from "./previewAgent";

// Import for initialization
import { agentRegistry } from "./registry";
import { InstructionsAgent } from "./instructionsAgent";
import { FileCreatorAgent } from "./fileCreatorAgent";
import { ProjectCreatorAgent } from "./projectCreatorAgent";
import { TwitterAgent } from "./twitterAgent";
import { SchedulingAgent } from "./schedulingAgent";
import { PreviewAgent } from "./previewAgent";

// Agent initialization function
export function initializeAgents() {
  // Register agents
  agentRegistry.register(new InstructionsAgent());
  agentRegistry.register(new FileCreatorAgent());
  agentRegistry.register(new ProjectCreatorAgent());
  agentRegistry.register(new TwitterAgent());
  agentRegistry.register(new SchedulingAgent());
  agentRegistry.register(new PreviewAgent());

  console.log("🤖 Agent system initialized with", agentRegistry.getAllAgents().length, "agents");
  
  return agentRegistry;
}
