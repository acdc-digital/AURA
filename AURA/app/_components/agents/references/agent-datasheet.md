# EAC Agent System - Technical Overview

_Last Updated: 2025-08-07_

## Executive Summary

The EAC Financial Dashboard features an advanced **Agent System** that provides specialized AI-powered tools for automating workflows, managing content, and enhancing productivity. Agents are modular, extensible assistants that integrate seamlessly with the dashboard's terminal interface and file system.

## System Architecture

### Core Components

| Component            | Path                                                     | Purpose                                                                                          |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Agent Store          | `eac/store/agents/index.ts`                              | Zustand-backed activation & UI state (thin wrapper around registry)                              |
| Agent Registry       | `eac/store/agents/registry.ts`                           | Central registration & execution routing for all agents                                          |
| Base Class           | `eac/store/agents/base.ts`                               | Abstract `BaseAgent` & shared interfaces                                                         |
| Individual Agents    | `eac/store/agents/*.ts`                                  | Concrete implementations (instructions, twitter-post, scheduling, project-creator, file-creator) |
| Terminal Integration | `eac/app/_components/terminal/terminal.tsx` & sub-panels | Command parsing, autocomplete, execution feedback                                                |
| Agents Panel UI      | `eac/app/_components/dashboard/dashAgents.tsx`           | Activation toggles & metadata display                                                            |
| Editor Integration   | Various editor components (e.g. `dashEditor.tsx`)        | Auto-opening created files / posts                                                               |

Notes:

- The legacy monolithic implementation has been superseded; `index-old-backup.ts` is retained only for historical reference.
- All commands registered by agents include a leading slash (e.g. `/twitter`, `/instructions`, `/schedule`).

### Data Flow

```
User Input → Agent Command → Agent Registry → Specific Agent → Convex Database
     ↓            ↓              ↓                ↓              ↓
Terminal Chat → Parse → Route → Execute → Store Results → Update UI
```

## Agent Activation

1. Click the **🤖 Bot icon** in the activity bar
2. Select an agent to activate (green checkmark appears)
3. Open terminal and type `/` to see available commands
4. Toggle to "Agent Tools" mode if needed
5. Execute agent commands with natural language input

---

## Agent Specifications

Currently registered (see `registry.ts`):

| ID                | Command(s)                                | Primary Purpose                                            | Status        |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------- | ------------- |
| `instructions`    | `/instructions`                           | Generate & persist structured instruction markdown         | ✅ Production |
| `twitter-post`    | `/twitter`                                | Create & manage Twitter/X post files                       | ✅ Production |
| `scheduling`      | `/schedule`                               | Batch schedule unscheduled social content                  | ✅ Production |
| `project-creator` | `/create-project`                         | Natural language multi-file project bootstrap              | ✅ Production |
| `file-creator`    | `create-file` (invoked as `/create-file`) | Guided multi‑step file creation with interactive selectors | ✅ Production |

> The terminal autocomplete lists tools by their declared `command` (always typed with `/`). Some legacy references without a slash have been normalized.

### 📚 Instructions Agent

**Purpose**: Generate and maintain project documentation with AI context awareness

| Property     | Details                 |
| ------------ | ----------------------- |
| **ID**       | `instructions`          |
| **Command**  | `/instructions`         |
| **Icon**     | 📚 FileText             |
| **Status**   | ✅ Production Ready     |
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

### 🐦 Twitter Post Agent

**Purpose**: Create, schedule, and manage Twitter/X content with intelligent workflow automation

| Property     | Details             |
| ------------ | ------------------- |
| **ID**       | `twitter-post`      |
| **Command**  | `/twitter`          |
| **Icon**     | @ AtSign            |
| **Status**   | ✅ Production Ready |
| **Database** | Convex posts table  |

**Features**:

- Natural language post creation
- Intelligent project assignment
- Advanced scheduling with date parsing
- Form field auto-population
- Settings management (audience, style)
- Direct posting or draft creation

**Usage Examples**:

```bash
/twitter Check out our new dashboard!
/twitter New feature launch! --project Marketing --schedule "tomorrow 2pm"
/twitter Big announcement coming --settings professional --schedule "Dec 25 9am"
```

**Technical Details**:

- Creates `.x` files in project folders
- Integrates with Twitter post editor
- Supports all Twitter post parameters
- Smart defaults for missing fields

---

### 📝 File Creator Agent

**Purpose**: Create files in existing projects using natural language input with interactive project selection

| Property     | Details                 |
| ------------ | ----------------------- |
| **ID**       | `file-creator`          |
| **Command**  | `/create-file`          |
| **Icon**     | 📂 FilePlus             |
| **Status**   | ✅ Production Ready     |
| **Database** | Full Convex integration |

**Features**:

- Natural language initiation ("create a new twitter post", "make meeting notes")
- Multi-stage guided workflow: file type → file name → project selection
- Interactive terminal components: project selector, file name & type input
- Contextual thinking messages (`role: "thinking"`) persisted to `chatMessages` for transparency
- Template injection per type (currently robust template for X/Twitter `.x` files; markdown/general types expanding)
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
- Current stable extension set: `.x` (Twitter) and `.md` (markdown); others queued for rollout

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
| **Database** | Convex posts & analytics |

**Features**:

- Batch scheduling of unscheduled social content (initial focus: X/Twitter; extensible)
- Strategy-driven timing (optimal / spread / custom patterns)
- Avoids collisions & respects existing scheduledAt timestamps
- Calendar surface integration (updates appear in content calendar & editor panels)
- Uses agentPosts / platform-specific tables (e.g. `redditPosts`) for persistence

**Usage Examples**:

```bash
/schedule                                    # Schedule all unscheduled posts
/schedule --platform twitter --strategy optimal
/schedule --timeframe "next 7 days" --strategy spread
/schedule --platform all --custom "9am,2pm,5pm"
```

**Technical Details**:

- Scheduling mutations patch unscheduled items with computed timestamps
- Index usage: leverages `by_status` / platform indexes for efficient unscheduled retrieval
- Future enhancement hooks: analytics scoring & platform-specific prime-time windows

---

## Agent Integration Points

### 1. **Convex Database**

- Agents persist artifacts (files, posts, scheduling updates) via scoped mutations
- Chat-centric operations persist messages with roles: `user`, `assistant`, `thinking`, `system`, `terminal`

### 2. **File System**

- File & post creation flows route through editor store then Convex for durable storage
- Standardized naming & extension handling; future slug normalization planned

### 3. **AI Context**

- Instructions automatically added to chat context
- Agents can access project history
- Context-aware responses and suggestions

### 4. **Editor Integration**

- Generated files open in tabbed editor
- Syntax highlighting and formatting
- Live preview capabilities

### 5. **Content Calendar Integration**

- Scheduler + post agents emit updates reflected in calendar UI without manual refresh
- Color & icon semantics derived from platform metadata

---

## Technical Specifications

### Agent Interface

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  icon: string;
  tools: AgentTool[];
}

interface AgentTool {
  id: string;
  name: string;
  command: string;
  description: string;
  parameters?: AgentParameter[];
}
```

### Performance Notes

- Registry initialization logs each agent; consider gating console logs in production
- Command dispatch is O(n) over registered tools (acceptable at current scale)
- No heavy model inference executed client-side; external API latency dominates

---

## Security & Privacy

- **User Isolation**: Each user's agents and data are completely isolated
- **Permission System**: Role-based access control ready
- **Data Encryption**: All database communications encrypted
- **Audit Trail**: Full execution history maintained

---

## Future Roadmap

Planned / Proposed:

- Reddit Agent (platform parity & cross-posting)
- Analytics/Insights Agent (engagement & performance aggregation)
- SEO Optimization Agent (content scoring & recommendations)
- Campaign Orchestration Agent (multi-platform sequencing)

Enhancement Tracks:

- Visual workflow composer
- User-defined custom agents (configurable tool chains)
- Pluggable validation schemas for tool parameters
- Multi-agent collaborative sessions & tool handoff

---

## Best Practices

1. **Activate only needed agents** to reduce UI clutter
2. **Use descriptive parameters** for better results
3. **Check execution history** for debugging
4. **Combine agents** for complex workflows
5. **Provide clear instructions** for context-aware AI

---

## Troubleshooting

| Issue                  | Solution                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| Agent not appearing    | Check `registry.ts` initialization & console logs                     |
| Command not working    | Confirm leading slash and that tool command matches registry          |
| File not created       | Check project permissions and folder structure                        |
| Context not applied    | Verify Instructions project exists in database                        |
| Stuck in file creation | Provide required file name / select project via interactive component |

---

## Summary

The EAC Agent System provides a powerful, extensible framework for automating common tasks and enhancing productivity. With three production-ready agents and a robust architecture, users can streamline their workflow while maintaining full control over their content and data.

For detailed implementation guides, see:

- [Agent System Implementation](agent-system-implementation.md)
- [Agent Architecture](agent-architecture-refactoring.md)
- [Agent Testing Guide](agent-system-testing.md)
