# Agent System Implementation Guide

_AURA Platform - Agent System Architecture_

## Overview

The AURA platform includes a comprehensive **Agent System** that allows users to interact with specialized AI agents through the terminal chat interface. The system provides structured access to agent-specific tools and functionality while maintaining seamless integration with the Convex real-time database and file system.

**🎯 KEY FEATURES:**

- **Auto-created Instructions project** for every user
- **Real-time database persistence** via Convex for cross-session availability  
- **Automatic AI context injection** using instruction files
- **Seamless agent tool execution** with full error handling
- **Premium agent support** with subscription-based access control

## Architecture

### Components

1. **Agent Store** (`/lib/agents/store.ts`)
   - Manages agent state and configuration using Zustand
   - Handles agent tool execution and history
   - Persists agent selections and execution history
   - Follows AURA's state separation principles

2. **Activity Bar Integration** (`/app/_components/activity/_components/agents/`)
   - Added agents icon (🤖) to the activity panel
   - Positioned for easy access and visibility
   - Shows activation status and available agents

3. **Agent Panel** (`/app/_components/agents/AgentsPanel.tsx`)
   - Displays available agents with activation controls
   - Shows active agent details and available tools
   - Provides usage instructions and tool descriptions
   - Handles premium feature gating

4. **Terminal Integration** (`/app/_components/terminal/`)
   - Command parsing and autocomplete for agent tools
   - Enhanced chat interface supporting agent commands
   - Unified tool selection and execution
   - Interactive component support

5. **Agent System Provider** (`/app/_components/agents/AgentSystemProvider.tsx`)
   - Provides agent system context to components
   - Manages global agent state
   - Handles authentication and permissions

### Data Flow

```
User Input → Terminal Parser → Agent Registry → Agent Execution → Convex Mutation → UI Update
     ↓              ↓               ↓                ↓               ↓           ↓
  "/twitter"   → Parse Command  → Route to CMO   → Create Post  → Save to DB → Update Chat
```

## Agent Registry System

The `AgentRegistry` class manages all agent registration, routing, and execution:

### Key Methods

```typescript
class AgentRegistry {
  register(agent: BaseAgent): void
  getAgent(agentId: string): BaseAgent | undefined
  getAgentByCommand(command: string): BaseAgent | undefined
  executeCommand(command: string, input: string, mutations: ConvexMutations): Promise<AgentExecutionResult>
  getAgentMetadata(): AgentMetadata[]
  getAllCommands(): string[]
}
```

### Agent Registration

```typescript
// Auto-registration of all agents
agentRegistry.register(new InstructionsAgent());
agentRegistry.register(new FileCreatorAgent());
agentRegistry.register(new ProjectCreatorAgent());
agentRegistry.register(new TwitterAgent());
agentRegistry.register(new SchedulingAgent());
```

## Current Agents

### Instructions Agent
- **Purpose**: Generate and manage structured documentation
- **Command**: `/instructions`
- **Features**: AI context injection, auto-project creation, markdown generation
- **Premium**: No

### CMO Agent (Twitter)
- **Purpose**: Premium social media content creation
- **Command**: `/twitter`
- **Features**: Intelligent scheduling, optimization, brand voice
- **Premium**: Yes

### File Creator Agent
- **Purpose**: Guided file creation with templates
- **Command**: `/create-file`
- **Features**: Interactive workflows, multi-step creation, template system
- **Premium**: No

### Project Creator Agent
- **Purpose**: Bootstrap new projects with scaffolding
- **Command**: `/create-project`
- **Features**: Template-based creation, automatic file generation
- **Premium**: No

### Scheduling Agent
- **Purpose**: Batch schedule social media content
- **Command**: `/schedule`
- **Features**: Optimal timing, collision detection, analytics integration
- **Premium**: No

## State Management

### Server State (Convex)
```typescript
// Projects, files, posts, user data
const projects = useQuery(api.projects.list);
const files = useQuery(api.files.listByProject, { projectId });
```

### Client State (Zustand)
```typescript
// Agent activation, UI state
interface AgentStore {
  activeAgents: string[];
  activateAgent: (agentId: string) => void;
  deactivateAgent: (agentId: string) => void;
  executionHistory: AgentExecution[];
}
```

### Component State (useState)
```typescript
// Ephemeral UI state
const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false);
const [selectedTool, setSelectedTool] = useState<string | null>(null);
```

## Usage Workflow

### Step 1: Agent Activation

1. Click the **Agents** icon (🤖) in the activity bar
2. View available agents in the panel
3. Click on an agent to activate/deactivate it
4. Active agent shows with checkmark and details
5. Premium agents require subscription verification

### Step 2: Tool Access

1. Open terminal chat interface
2. Type `/` to show available tools menu
3. Navigate with arrow keys or click to select tools
4. View tool descriptions and usage examples

### Step 3: Tool Execution

1. Select agent tool (e.g., `/twitter`)
2. Add parameters: `/twitter Check out our new feature! --schedule "tomorrow 2pm"`
3. Agent executes and provides real-time feedback
4. Results are stored in Convex and displayed in chat
5. Generated files automatically open in editor

### Step 4: Interactive Components

1. Some agents provide interactive components (file selectors, project pickers)
2. Complete multi-step workflows through chat interface
3. Progress tracking and status updates
4. Error handling and retry mechanisms

## Database Integration

### Chat Messages
```typescript
chatMessages: defineTable({
  role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("terminal"), v.literal("thinking")),
  content: v.string(),
  operation: v.optional(v.object({
    type: v.union(v.literal("file_created"), v.literal("project_created"), v.literal("tool_executed")),
    details: v.optional(v.any()),
  })),
  interactiveComponent: v.optional(v.object({
    type: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    result: v.optional(v.any()),
  })),
})
```

### Agent Execution Tracking
```typescript
agentExecutions: defineTable({
  agentId: v.string(),
  command: v.string(),
  input: v.string(),
  result: v.object({
    success: v.boolean(),
    message: v.string(),
    data: v.optional(v.any()),
  }),
  userId: v.id("users"),
  executedAt: v.number(),
})
```

## Premium Features

### Access Control
```typescript
// Premium agent check
if (agent.isPremium && !userHasPremiumAccess) {
  return {
    success: false,
    message: "This agent requires a premium subscription",
    requiresUpgrade: true
  };
}
```

### Feature Gating
- Premium agents show crown icon in UI
- Subscription status checks before execution
- Graceful degradation for non-premium users
- Clear upgrade prompts and messaging

## Performance Optimization

### Efficient Command Routing
- O(1) command lookup using Map data structure
- Lazy agent initialization to reduce startup time
- Cached agent metadata for UI rendering

### Real-time Updates
- Convex reactive queries for instant UI updates
- Optimistic updates for better user experience
- Proper error boundaries and rollback mechanisms

### Memory Management
- Bounded execution history to prevent memory leaks
- Cleanup of completed interactive components
- Efficient garbage collection of temporary state

## Security Considerations

### User Isolation
- All agent operations scoped to authenticated user
- Project and file access validation
- Proper permission checking before mutations

### Input Validation
- Command parameter sanitization
- File path traversal prevention
- Content filtering and safety checks

### Premium Access Control
- Secure subscription verification
- Rate limiting for premium features
- Audit logging for premium usage

## Testing Strategy

### Unit Tests
```typescript
// Agent execution tests
describe('InstructionsAgent', () => {
  it('should create instructions file', async () => {
    const result = await agent.execute(tool, input, mutations);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
```typescript
// End-to-end agent workflow tests
describe('Agent System Integration', () => {
  it('should complete file creation workflow', async () => {
    // Test full workflow from command to file creation
  });
});
```

## Future Enhancements

### Planned Features

1. **Visual Agent Composer**
   - Drag-and-drop agent workflow creation
   - Visual representation of agent chains
   - Save and share custom workflows

2. **Custom Agent Creation**
   - User-defined agents with custom tools
   - Plugin marketplace for community agents
   - Visual agent builder interface

3. **Advanced Analytics**
   - Agent usage analytics and insights
   - Performance monitoring and optimization
   - Cost tracking for premium features

4. **Multi-Agent Collaboration**
   - Agent-to-agent communication
   - Coordinated multi-step workflows
   - Shared context and handoffs

### Enhancement Tracks

- **Workflow Automation**: Chain multiple agents for complex tasks
- **External Integrations**: Connect with third-party services and APIs
- **Advanced AI Features**: Enhanced natural language processing
- **Collaboration Tools**: Real-time multi-user agent interactions

## Best Practices

### For Developers

1. **Follow State Separation**: Keep server state in Convex, UI state in Zustand
2. **Error Handling**: Always provide meaningful error messages and recovery options
3. **Performance**: Use efficient data structures and minimize re-renders
4. **Testing**: Write comprehensive tests for agent logic and integrations

### For Users

1. **Activate Selectively**: Only activate agents you need to reduce UI complexity
2. **Use Clear Commands**: Provide specific parameters for better results
3. **Monitor Usage**: Track premium feature usage for cost management
4. **Explore Features**: Try different agent combinations for complex workflows

## Troubleshooting

### Common Issues

1. **Agent Not Responding**
   - Check network connectivity and Convex status
   - Verify agent is properly activated
   - Review browser console for error messages

2. **Premium Features Unavailable**
   - Verify subscription status and payment
   - Check user permissions and access levels
   - Contact support for account issues

3. **File Creation Failures**
   - Check project permissions and folder structure
   - Verify disk space and file system access
   - Review Convex database connectivity

4. **Interactive Components Stuck**
   - Refresh the page to reset component state
   - Check for JavaScript errors in console
   - Try using keyboard navigation instead of mouse

### Debug Information

Enable debug mode by setting `DEBUG_AGENTS=true` in environment variables for additional logging and diagnostic information.

---

This implementation guide provides comprehensive coverage of the AURA Agent System architecture, ensuring proper integration with the platform's design principles and technical requirements.
