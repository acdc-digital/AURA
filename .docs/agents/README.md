# AURA Agent System Documentation

_Complete documentation for the AURA platform's intelligent agent system_

## Overview

The AURA Agent System is a powerful, extensible framework that provides specialized AI-powered tools for automating workflows, managing content, and enhancing productivity. Built on modern architectural principles with real-time synchronization through Convex, the system offers both free and premium agent capabilities.

## Documentation Structure

### 📖 Core Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [**Agent System Overview**](./aura-agent-system-overview.md) | Complete technical overview and specifications | All users, developers |
| [**Implementation Guide**](./agent-system-implementation.md) | Detailed implementation and integration guide | Developers, architects |
| [**Architecture Guide**](./agent-architecture.md) | Architectural patterns and design decisions | Senior developers, architects |

### 🔧 Detailed Specifications

| Document | Description | Audience |
|----------|-------------|----------|
| [**Individual Agents**](./individual-agents.md) | Detailed specifications for each agent | Users, developers |
| [**Testing Guide**](./agent-testing-guide.md) | Comprehensive testing strategy and implementation | QA engineers, developers |

## Quick Start

### For Users

1. **Activate Agents**: Click the 🤖 Agents icon in the activity bar
2. **Select Agent**: Choose from available agents (some require premium)
3. **Use Commands**: Type `/` in terminal to see available tools
4. **Execute Tasks**: Run agent commands with natural language input

### For Developers

1. **Review Architecture**: Start with the [Architecture Guide](./agent-architecture.md)
2. **Study Implementation**: Read the [Implementation Guide](./agent-system-implementation.md)
3. **Understand Agents**: Review [Individual Agents](./individual-agents.md) specifications
4. **Setup Testing**: Follow the [Testing Guide](./agent-testing-guide.md)

## Available Agents

### Free Agents

| Agent | Command | Purpose | Status |
|-------|---------|---------|--------|
| **Instructions Agent** | `/instructions` | Generate documentation with AI context | ✅ Production |
| **File Creator Agent** | `/create-file` | Guided file creation with templates | ✅ Production |
| **Project Creator Agent** | `/create-project` | Bootstrap projects with scaffolding | ✅ Production |
| **Scheduling Agent** | `/schedule` | Batch schedule social media posts | ✅ Production |

### Premium Agents

| Agent | Command | Purpose | Status |
|-------|---------|---------|--------|
| **CMO Agent** | `/twitter` | Advanced social media content creation | ✅ Production |

## Key Features

### 🎯 Core Capabilities
- **Natural Language Processing**: Understand and execute complex requests
- **Real-time Synchronization**: Instant updates across all clients via Convex
- **Interactive Workflows**: Multi-step processes with user guidance
- **Template System**: Intelligent templates for different content types
- **Premium Features**: Advanced capabilities with subscription gating

### 🏗️ Architecture Highlights
- **Modular Design**: Each agent is independent and focused
- **Extensible Registry**: Easy addition of new agents without system changes
- **State Management**: Follows AURA's strict state separation principles
- **Error Handling**: Comprehensive error handling and recovery
- **Performance Optimized**: Efficient command routing and caching

### 🔒 Security & Privacy
- **User Isolation**: Complete data isolation between users
- **Permission System**: Role-based access control
- **Premium Validation**: Secure subscription verification
- **Input Sanitization**: Comprehensive input validation and safety

## System Requirements

### Technical Requirements
- **Frontend**: React 18+, TypeScript, Next.js 14+ (App Router)
- **Backend**: Convex real-time database
- **State Management**: Zustand (UI state), Convex (server state)
- **UI Components**: Shadcn UI, Radix UI, Tailwind CSS

### Infrastructure Requirements
- **Database**: Convex real-time database with proper indexing
- **Authentication**: Clerk or equivalent auth provider
- **Payments**: Stripe for premium feature gating
- **Monitoring**: Error tracking and performance monitoring

## Development Workflow

### Adding New Agents

1. **Create Agent Class**: Extend `BaseAgent` with proper interface implementation
2. **Define Tools**: Specify commands, descriptions, and usage examples
3. **Implement Logic**: Build agent execution logic with error handling
4. **Register Agent**: Add to registry in initialization
5. **Add Tests**: Write comprehensive unit and integration tests
6. **Update Documentation**: Document agent capabilities and usage

### Agent Development Pattern

```typescript
export class NewAgent extends BaseAgent {
  readonly id = "new-agent";
  readonly name = "New Agent";
  readonly description = "Agent description";
  readonly icon = "🆕";
  readonly isPremium = false;
  readonly tools: AgentTool[] = [
    {
      command: "/new-command",
      name: "New Command",
      description: "Command description",
      usage: "/new-command <params>",
      examples: ["Example usage"]
    }
  ];

  async execute(tool: AgentTool, input: string, mutations: ConvexMutations): Promise<AgentExecutionResult> {
    // Implementation
  }
}
```

## State Management Guidelines

The AURA Agent System follows strict state management principles:

### Server State (Convex) = Source of Truth
```typescript
// Projects, files, posts, user data
const projects = useQuery(api.projects.list);
const files = useQuery(api.files.listByProject, { projectId });
```

### Client State (Zustand) = UI-only concerns
```typescript
// Agent activation, UI panels, temporary state
const { activeAgents, activateAgent } = useAgentStore();
```

### Component State (useState) = Ephemeral UI state
```typescript
// Loading states, modal visibility, form inputs
const [isLoading, setIsLoading] = useState(false);
```

## Best Practices

### For Agents
1. **Single Responsibility**: Each agent should have a clear, focused purpose
2. **Error Handling**: Provide meaningful error messages and recovery options
3. **Input Validation**: Validate and sanitize all user inputs
4. **Performance**: Use efficient algorithms and avoid blocking operations
5. **Testing**: Write comprehensive tests for all agent functionality

### For UI Integration
1. **State Separation**: Keep server state in Convex, UI state in Zustand
2. **Loading States**: Provide clear feedback during agent execution
3. **Error Display**: Show helpful error messages and recovery options
4. **Accessibility**: Ensure agent interfaces are accessible to all users

### For Premium Features
1. **Clear Boundaries**: Clearly communicate what requires premium access
2. **Graceful Degradation**: Provide alternatives for non-premium users
3. **Upgrade Paths**: Make subscription upgrades easy and clear
4. **Value Proposition**: Ensure premium features provide clear value

## Migration Guide

### From EAC to AURA

The agent system has been updated to work with AURA's architecture:

1. **Path Updates**: All file paths updated to AURA structure
2. **State Management**: Updated to follow AURA's state separation principles
3. **Database Schema**: Enhanced Convex schema with better relationships
4. **Premium Features**: Added premium agent support with proper gating
5. **Real-time Features**: Enhanced synchronization and collaboration

### Breaking Changes
- Agent registry path changed from `eac/store/agents/` to `AURA/lib/agents/`
- State management updated to use AURA patterns
- Premium validation added for certain agents
- Database schema updated with new fields and relationships

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Agent not appearing | Check registry initialization and browser console |
| Command not working | Verify command starts with `/` and agent is activated |
| File creation fails | Check project permissions and Convex connectivity |
| Premium features blocked | Verify subscription status and user permissions |

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG_AGENTS=true
```

## Roadmap

### Planned Enhancements

#### Short Term (Q1 2025)
- **Reddit Agent**: Cross-platform social media management
- **Analytics Agent**: Performance insights and recommendations
- **Enhanced Templates**: More intelligent content templates

#### Medium Term (Q2-Q3 2025)
- **Visual Workflow Builder**: Drag-and-drop agent composition
- **Custom Agent Creator**: User-defined agents with visual builder
- **Multi-Agent Collaboration**: Coordinated workflows across agents

#### Long Term (Q4 2025+)
- **AI Learning**: Agents that improve based on user feedback
- **External Integrations**: Third-party service connections
- **Enterprise Features**: Advanced collaboration and management tools

## Contributing

### Development Setup
1. Clone the AURA repository
2. Install dependencies: `pnpm install`
3. Set up Convex: Follow database setup guide
4. Run development server: `pnpm dev`
5. Run tests: `pnpm test:agents`

### Contribution Guidelines
1. Follow the existing code patterns and architecture
2. Write comprehensive tests for new features
3. Update documentation for any changes
4. Ensure all tests pass before submitting PRs
5. Follow the commit message conventions

## Support

### Documentation
- [GitHub Repository](https://github.com/acdc-digital/AURA)
- [API Documentation](../api/)
- [Architecture Guide](../architecture/)

### Community
- [Discord Server](#) - Community discussions
- [GitHub Issues](https://github.com/acdc-digital/AURA/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/acdc-digital/AURA/discussions) - General questions

### Enterprise Support
For enterprise support and custom agent development, contact the AURA team.

---

## License

This documentation is part of the AURA platform and is subject to the project's licensing terms.

_Last updated: August 21, 2025_
