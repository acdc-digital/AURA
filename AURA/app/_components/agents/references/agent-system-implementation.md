# Agent System Implementation Guide

_EAC Financial Dashboard - COMPLETE IMPLEMENTATION_

## Overview

The EAC Financial Dashboard includes a comprehensive **Agent System** that allows users to interact with specialized AI agents through the terminal chat interface. The system provides structured access to agent-specific tools and functionality while maintaining existing MCP (Model Context Protocol) integration.

**🎯 KEY FEATURES:**

- **Auto-created Instructions project** for every user
- **Database persistence** via Convex for cross-session availability
- **Automatic AI context injection** using instruction files
- **Seamless agent tool execution** with full error handling

## Architecture

### Components

1. **Agent Store** (`/store/agents/`)
   - Manages agent state and configuration
   - Handles agent tool execution
   - Persists agent selections and execution history

2. **Activity Bar Integration** (`/app/_components/dashboard/dashActivityBar.tsx`)
   - Added agent icon (🤖) to the activity panel
   - Positioned above user profile for easy access

3. **Agent Panel** (`/app/_components/dashboard/dashAgents.tsx`)
   - Displays available agents with activation controls
   - Shows active agent details and available tools
   - Provides usage instructions and tool descriptions

4. **Terminal Integration** (`/app/_components/terminal/_components/`)
   - Tools toggle for switching between MCP and Agent tools
   - Enhanced chat interface supporting agent commands
   - Unified tool selection and execution

### Data Flow

```
User Sign-in → Auto-create Instructions Project → User types /instructions → Store in Database
                                                            ↓
AI Chat ← Instruction Context ← Database Retrieval ← Agent Tool Execution
```

**Enhanced Flow with Database Integration:**

1. User signs in → Instructions project automatically created in Convex
2. User activates Instructions agent → Agent tools become available
3. User types `/instructions` → Agent creates file in database and local editor
4. User chats normally → AI receives instruction context automatically
5. Instructions persist across sessions and devices

## Agent Implementation

### Current Agents

#### Instructions Agent

### Current Agents (Registry)

| ID                | Primary Command   | Purpose                                                     | Status        |
| ----------------- | ----------------- | ----------------------------------------------------------- | ------------- |
| `instructions`    | `/instructions`   | Structured instruction markdown generation & persistence    | ✅ Production |
| `twitter-post`    | `/twitter`        | Create & manage Twitter/X post files (content + scheduling) | ✅ Production |
| `scheduling`      | `/schedule`       | Batch schedule unscheduled social content                   | ✅ Production |
| `project-creator` | `/create-project` | Natural language multi‑file project bootstrap               | ✅ Production |
| `file-creator`    | `/create-file`    | Guided multi‑step file creation (type → name → project)     | ✅ Production |

> All commands are slash-prefixed in terminal autocomplete. Legacy non‑slash forms are deprecated.

#### Instructions Agent (Overview)

- **Command**: `/instructions`
- **Scopes**: Audience targeting (`audience:developers` etc.)
- **Output**: `.md` files in auto-created Instructions system project
- **Context**: Injected into AI sessions for enriched responses

#### Twitter Post Agent (Overview)

- **Command**: `/twitter`
- **Workflow**: Parse params → ensure Content Creation folder → generate/create `.x` file → store platform metadata → populate editor form
- **Scheduling**: Inline via `--schedule "tomorrow 2pm"`
- **Safety**: Prevents accidental instruction file creation

#### Scheduling Agent (Overview)

- **Command**: `/schedule`
- **Function**: Assign timestamps to unscheduled posts (strategy aware)
- **Extensibility**: Strategy plug points for future analytics‑based optimization

#### Project Creator Agent (Overview)

- **Command**: `/create-project` (user types natural language; internal tool id `create` normalized in UI)
- **Workflow**: Intent detect → pending project name input (if generic) → Convex project create → optional file scaffolding

#### File Creator Agent (Overview)

- **Command**: `/create-file`
- **Multi‑Step Flow**: Detect request → THINKING message persisted → file type selection → file name capture → project selector → template creation
- **Interactive Components**: Project selector, file name input, type picker
- **State Handling**: Static, time‑bound pending states (5‑minute expiry)

### Database Schema Integration

The agent system integrates with the following Convex tables:

**Projects Table**

- Instructions project auto-created for each user
- `name: "Instructions"` with special handling
- Linked to user via `userId` field

**Files Table**

- Instruction documents stored as `type: "document"`
- `extension: "md"` for markdown format
- `projectId` links to Instructions project
- Full content stored in `content` field

### Agent Store Structure

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  tools: AgentTool[];
  icon: string; // emoji representation
}

interface AgentTool {
  id: string;
  name: string;
  command: string; // slash command (e.g., '/instructions')
  description: string;
  parameters?: AgentToolParameter[];
}
```

## Usage Workflow

### Step 1: Agent Selection

1. Click the **Agents** icon (🤖) in the activity bar
2. View available agents in the panel
3. Click on an agent to activate/deactivate it
4. Active agent shows with checkmark and details

### Step 2: Tool Access

1. Open terminal chat
2. Type `/` to show tools menu
3. Use toggle to switch between **MCP Tools** and **Agent Tools**
4. Navigate with arrow keys or click to select tools

### Step 3: Tool Execution

1. Select agent tool (e.g., `/instructions`)
2. Add parameters: `/instructions topic audience:developers`
3. Agent executes and provides feedback
4. Results are stored and displayed in chat

## Design Consistency

### Visual Elements

- Primary: `#007acc` (blue)
- Success: `#4ec9b0` (green)
- Text: `#cccccc` (light gray)
- Muted: `#858585` (medium gray)

- Monospace fonts for commands
- Clear hierarchy with font sizes
- Appropriate contrast ratios

- Header with title
- Scrollable content area
- Action controls at bottom

### Component Patterns

## Technical Implementation

### State Management

### Integration Points

### Error Handling

## Future Enhancements

### Planned Features

1. **Additional Agents**
   - Code generation agent
   - Database query agent
   - Testing helper agent
   - Documentation maintenance agent

2. **Enhanced Functionality**
   - Agent configuration UI
   - Custom agent creation
   - Agent marketplace/sharing
   - Advanced parameter handling

3. **Integration Improvements**
   - Calendar integration for scheduled tasks
   - Project management automation
   - Real-time collaboration features
   - External API integrations

### Extensibility

The agent system is designed for easy extension:

## Benefits

### For Users

### For Developers

### For the Project

## Troubleshooting

### Common Issues

1. **Agent not appearing in panel**
   - Check agent store initialization
   - Verify agent configuration is valid
   - Clear browser storage and refresh

2. **Tools not showing in terminal**
   - Ensure agent is activated (check for green indicator)
   - Toggle to "Agent Tools" mode in terminal
   - Verify agent has configured tools

3. **Tool execution fails**
   - Check console for error messages
   - Verify tool parameters are correct
   - Ensure agent execution logic is implemented

### Debug Information

## Architecture Decisions

### Why Agents vs Direct Functions?

### Why Terminal Integration?

### Why Zustand Store?

This agent system enhances the EAC Financial Dashboard with intelligent, specialized tools while maintaining the project's design principles and user experience standards.
