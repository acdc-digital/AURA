# AURA Agent System - Technical Overview

_Last Updated: 2025-08-21_

## Executive Summary

The AURA platform features an advanced **Agent System** that provides specialized AI-powered tools for automating workflows, managing content, and enhancing productivity. Agents are modular, extensible assistants that integrate seamlessly with the platform's terminal interface, file system, and Convex real-time database.

## System Architecture

### Core Components

| Component            | Path                                                     | Purpose                                                                                          |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Agent Store          | `AURA/lib/agents/store.ts`                               | Zustand-backed activation & UI state (thin wrapper around registry)                              |
| Agent Registry       | `AURA/lib/agents/registry.ts`                            | Central registration & execution routing for all agents                                          |
| Base Class           | `AURA/lib/agents/base.ts`                                | Abstract `BaseAgent` & shared interfaces                                                         |
| Individual Agents    | `AURA/lib/agents/*.ts`                                   | Concrete implementations (instructions, twitter, scheduling, project-creator, file-creator)      |
| Terminal Integration | `AURA/app/_components/terminal/`                          | Command parsing, autocomplete, execution feedback                                                |
| Agents Panel UI      | `AURA/app/_components/agents/AgentsPanel.tsx`            | Activation toggles & metadata display                                                            |
| Agent System Provider| `AURA/app/_components/agents/AgentSystemProvider.tsx`    | Context provider for agent system state                                                         |

### Data Flow

```
User Input → Agent Command → Agent Registry → Specific Agent → Convex Database
     ↓            ↓              ↓                ↓              ↓
Terminal Chat → Parse → Route → Execute → Store Results → Update UI
```

## Agent Activation

1. Click the **🤖 Agents icon** in the activity bar
2. Select an agent to activate (green checkmark appears)
3. Open terminal and type `/` to see available commands
4. Execute agent commands with natural language input
5. View results and interact with generated content

---

## Agent Specifications

Currently registered (see `registry.ts`):

| ID                | Command(s)                                | Primary Purpose                                            | Status        | Premium |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------- | ------------- | ------- |
| `instructions`    | `/instructions`                           | Generate & persist structured instruction markdown         | ✅ Production | No      |
| `cmo`             | `/twitter`                                | Create & manage Twitter/X post files                       | ✅ Production | Yes     |
| `scheduling`      | `/schedule`                               | Batch schedule unscheduled social content                  | ✅ Production | No      |
| `project-creator` | `/create-project`                         | Natural language multi-file project bootstrap              | ✅ Production | No      |
| `file-creator`    | `/create-file`                            | Guided multi‑step file creation with interactive selectors | ✅ Production | No      |

> The terminal autocomplete lists tools by their declared `command` (always typed with `/`). Some agents are marked as premium and require appropriate access levels.

### 📚 Instructions Agent

**Purpose**: Generate and maintain project documentation with AI context awareness

| Property     | Details                 |
| ------------ | ----------------------- |
| **ID**       | `instructions`          |
| **Command**  | `/instructions`         |
| **Icon**     | 📚 FileText             |
| **Status**   | ✅ Production Ready     |
| **Premium**  | No                      |
| **Database** | Full Convex integration |

**Features**:

- Auto-creates "Instructions" project for every user
- Generates context-aware documentation
- Supports multiple audience types (developers, users, admins)
- Persists instructions across sessions
- Automatically injects context into AI conversations

**Usage Examples**:

```bash
/instructions always use TypeScript strict mode
/instructions component development guidelines audience:developers
/instructions user onboarding flow audience:users
```

**Technical Details**:

- Files saved as `.md` in Instructions folder
- Automatic filename generation from content
- Full markdown formatting support
- Pinned project folder for easy access

---

### 🐦 CMO Agent (Twitter)

**Purpose**: Premium social media content creation and strategy with intelligent workflow automation

| Property     | Details             |
| ------------ | ------------------- |
| **ID**       | `cmo`               |
| **Command**  | `/twitter`          |
| **Icon**     | 🐦 Bird             |
| **Status**   | ✅ Production Ready |
| **Premium**  | Yes                 |
| **Database** | Convex posts table  |

**Features**:

- Natural language post creation
- Intelligent project assignment
- Advanced scheduling with date parsing
- Form field auto-population
- Settings management (audience, style)
- Direct posting or draft creation
- Premium optimization features

**Usage Examples**:

```bash
/twitter Check out our new platform!
/twitter New feature launch! --project Marketing --schedule "tomorrow 2pm"
/twitter Big announcement coming --settings professional --schedule "Dec 25 9am"
```

**Technical Details**:

- Creates `.x` files in project folders
- Integrates with Twitter post editor
- Supports all Twitter post parameters
- Smart defaults for missing fields
- Premium features require subscription

---

### 📄 File Creator Agent

**Purpose**: Create files in existing projects using natural language input with interactive project selection

| Property     | Details                 |
| ------------ | ----------------------- |
| **ID**       | `file-creator`          |
| **Command**  | `/create-file`          |
| **Icon**     | 📄 FileText             |
| **Status**   | ✅ Production Ready     |
| **Premium**  | No                      |
| **Database** | Full Convex integration |

**Features**:

- Natural language initiation ("create a new twitter post", "make meeting notes")
- Multi-stage guided workflow: file type → file name → project selection
- Interactive terminal components: project selector, file name & type input
- Contextual thinking messages (`role: "thinking"`) persisted to `chatMessages` for transparency
- Template injection per type (robust templates for various file types)
- System folder filtering (skips protected/system folders where applicable)
- Resilient pending-state handling (timeouts, validation feedback)

**Usage Examples**:

```bash
/create-file marketing launch tweet draft
/create-file meeting notes for client onboarding
/create-file help                 # Lists supported file types
```

**Technical Details**:

- Convex mutations invoked for persistence only after full detail resolution
- Pending creation states stored statically in agent class (time-bound)
- Project selection supports numeric and fuzzy name matching
- Emits guidance when ambiguous or invalid input supplied in intermediate stages
- Supports multiple file extensions: `.x` (Twitter), `.md` (markdown), `.txt`, `.json`, etc.

**Interactive Workflow**:

1. User requests file creation in natural language
2. Agent parses file details (name, type, description)
3. Project selector component appears in chat
4. User selects target project from filtered list
5. File created with appropriate template content
6. Success confirmation with file location

---

### 📅 Content Scheduler (Scheduling Agent)

**Purpose**: Automatically schedule unscheduled content posts based on optimal timing strategies

| Property     | Details                  |
| ------------ | ------------------------ |
| **ID**       | `scheduling`             |
| **Command**  | `/schedule`              |
| **Icon**     | 📅 Calendar              |
| **Status**   | ✅ Production Ready      |
| **Premium**  | No                       |
| **Database** | Convex posts & analytics |

**Features**:

- Batch scheduling of unscheduled social content (multi-platform support)
- Strategy-driven timing (optimal / spread / custom patterns)
- Avoids collisions & respects existing scheduledAt timestamps
- Calendar surface integration (updates appear in content calendar & editor panels)
- Uses platform-specific tables for persistence
- Analytics-driven optimization

**Usage Examples**:

```bash
/schedule                                    # Schedule all unscheduled posts
/schedule platform:twitter strategy:optimal
/schedule timeframe:"next 7 days" strategy:spread
/schedule platform:all custom:"9am,2pm,5pm"
```

**Technical Details**:

- Scheduling mutations patch unscheduled items with computed timestamps
- Index usage: leverages `by_status` / platform indexes for efficient unscheduled retrieval
- Analytics scoring & platform-specific prime-time windows
- Collision detection and resolution

---

### 📁 Project Creator Agent

**Purpose**: Create new projects with natural language descriptions and optional scaffolding

| Property     | Details                 |
| ------------ | ----------------------- |
| **ID**       | `project-creator`       |
| **Command**  | `/create-project`       |
| **Icon**     | 📁 Folder               |
| **Status**   | ✅ Production Ready     |
| **Premium**  | No                      |
| **Database** | Full Convex integration |

**Features**:

- Natural language project creation
- Template-based scaffolding
- Automatic folder structure generation
- Initial file creation based on project type
- Integration with file system and editor
- Project metadata management

**Usage Examples**:

```bash
/create-project Marketing Campaign Q4 2024
/create-project Personal Blog template:blog
/create-project Client Presentation for Acme Corp
```

**Technical Details**:

- Creates project with proper metadata
- Supports multiple project templates
- Automatic initial file generation
- Integration with project management system
- Proper user permission handling

---

## Agent Integration Points

### 1. **Convex Database**

- Agents persist artifacts (files, posts, scheduling updates) via scoped mutations
- Chat-centric operations persist messages with roles: `user`, `assistant`, `thinking`, `system`, `terminal`
- Real-time reactivity for immediate UI updates

### 2. **File System**

- File & post creation flows route through editor store then Convex for durable storage
- Standardized naming & extension handling with slug normalization
- Template system for different file types

### 3. **AI Context**

- Instructions automatically added to chat context
- Agents can access project history
- Context-aware responses and suggestions
- Token tracking and cost management

### 4. **Editor Integration**

- Generated files open in tabbed editor
- Syntax highlighting and formatting
- Live preview capabilities
- Multi-file editing support

### 5. **Content Calendar Integration**

- Scheduler + post agents emit updates reflected in calendar UI without manual refresh
- Color & icon semantics derived from platform metadata
- Real-time collaboration features

---

## Technical Specifications

### Agent Interface

```typescript
interface AgentTool {
  command: string;
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
}

interface AgentExecutionContext {
  sessionId?: string;
  userId?: string | Id<"users">;
  projectId?: Id<"projects">;
}

interface AgentExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  requiresUserInput?: boolean;
  interactiveComponent?: {
    type: string;
    data?: Record<string, unknown>;
  };
}

abstract class BaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly isPremium: boolean;
  abstract readonly tools: AgentTool[];
  
  abstract execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult>;
}
```

### Performance Notes

- Registry initialization logs each agent; console logs are gated in production
- Command dispatch is O(n) over registered tools (acceptable at current scale)
- Real-time database operations with optimistic updates
- Efficient indexing for fast data retrieval

---

## Security & Privacy

- **User Isolation**: Each user's agents and data are completely isolated
- **Permission System**: Role-based access control with premium features
- **Data Encryption**: All database communications encrypted
- **Audit Trail**: Full execution history maintained
- **Premium Access Control**: Subscription-based feature gating

---

## State Management Architecture

Following AURA's state management principles:

### Server State (Convex) = Source of Truth
- All persistent data (projects, files, posts, user data)
- Real-time synchronization across clients
- ACID transactions for data integrity

### Client State (Zustand) = UI-only concerns
- Agent activation states
- UI panel visibility
- Terminal interaction state
- Temporary form data

### Component State (useState) = Ephemeral UI state
- Modal visibility
- Loading states
- Form inputs (before submission)

---

## Future Roadmap

Planned / Proposed:

- **Reddit Agent**: Platform parity & cross-posting capabilities
- **Analytics Agent**: Engagement & performance aggregation
- **SEO Agent**: Content scoring & optimization recommendations
- **Campaign Director**: Multi-platform sequencing and orchestration
- **Code Generation Agent**: Development workflow automation

Enhancement Tracks:

- Visual workflow composer for agent chains
- User-defined custom agents (configurable tool chains)
- Pluggable validation schemas for tool parameters
- Multi-agent collaborative sessions & tool handoff
- Advanced analytics and reporting dashboard

---

## Best Practices

1. **Activate only needed agents** to reduce UI clutter and improve performance
2. **Use descriptive parameters** for better results and clearer execution
3. **Check execution history** for debugging and optimization
4. **Combine agents** for complex workflows and automation
5. **Provide clear instructions** for context-aware AI assistance
6. **Monitor premium usage** for cost management
7. **Follow state separation rules** when extending agent functionality

---

## Troubleshooting

| Issue                     | Solution                                                              |
| ------------------------- | --------------------------------------------------------------------- |
| Agent not appearing       | Check `registry.ts` initialization & browser console logs            |
| Command not working       | Confirm leading slash and that tool command matches registry         |
| File not created          | Check project permissions, folder structure, and Convex connectivity |
| Context not applied       | Verify Instructions project exists in database                       |
| Stuck in file creation    | Provide required file name / select project via interactive component|
| Premium agent unavailable | Verify subscription status and user permissions                      |
| Performance issues        | Check network connectivity and Convex status                         |

---

## Migration from EAC

Key differences from the EAC implementation:

1. **Project Structure**: Updated paths to match AURA monorepo structure
2. **Database Schema**: Enhanced Convex schema with better indexing and relationships
3. **State Management**: Follows AURA's strict state separation principles
4. **Premium Features**: Added premium agent support with subscription gating
5. **Real-time Features**: Enhanced real-time synchronization and collaboration
6. **Performance**: Optimized for larger scale with better caching and indexing

---

## Summary

The AURA Agent System provides a powerful, extensible framework for automating common tasks and enhancing productivity. With five production-ready agents and a robust architecture, users can streamline their workflow while maintaining full control over their content and data. The system follows AURA's architectural principles with proper state management, real-time synchronization, and premium feature support.

For detailed implementation guides, see the individual agent documentation files in this directory.
