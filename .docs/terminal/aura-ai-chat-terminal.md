# AURA Platform - AI Chat Terminal

_Integrated AI Assistant with Real-time Convex Backend_

_Last Updated: August 21, 2025_

## Overview

The AURA Platform includes an integrated AI chat terminal powered by Anthropic's Claude model with real-time Convex database synchronization. The chat interface uses a terminal-style format with authentic development experience, supporting both AI conversations and agent workflows through the AURA Agent System.

## Features

### 🤖 AI Integration

- **Anthropic Claude 3.5 Sonnet** for intelligent responses
- **Context-aware** about AURA platform architecture and technologies
- **Real-time synchronization** with Convex backend storage
- **Session management** with user authentication integration
- **Agent system integration** for advanced workflows
- **Premium feature gating** for subscription-based access

### 💬 Terminal Interface

- **Terminal-style prompts**: Modern VS Code inspired design
- **Auto-scroll** to newest messages with smooth animations
- **Auto-focus** input for seamless typing experience
- **Command suggestions** with intelligent autocomplete
- **Message status indicators** for delivery confirmation
- **Typing indicators** for real-time conversation feel

### ⚡ Built-in Commands

| Command       | Description                      | Example                | Premium |
|---------------|----------------------------------|------------------------|---------|
| `/help`       | Show all available commands      | `$ /help`             | No      |
| `/clear`      | Clear current session history    | `$ /clear`            | No      |
| `/project`    | Get project structure info       | `$ /project`          | No      |
| `/files`      | List project files and structure | `$ /files`            | No      |
| `/agents`     | Show available agents            | `$ /agents`           | No      |
| `/create-file`| Trigger File Creator Agent       | `$ /create-file blog` | No      |
| `/schedule`   | Access Scheduling Agent          | `$ /schedule meeting` | Yes     |
| `/campaign`   | Launch Campaign Director         | `$ /campaign launch`  | Yes     |
| `/debug`      | Get debugging and system help    | `$ /debug`            | No      |
| `/export`     | Export conversation history      | `$ /export markdown`  | Yes     |

### 🎯 Agent System Integration

- **Agent activation** through chat commands
- **Interactive components** for multi-step workflows
- **Project selector** interfaces embedded in chat
- **File creation wizards** with visual feedback
- **Real-time collaboration** with team members
- **Workflow status tracking** and notifications

## Architecture

### File Structure

```
AURA/
├── app/_components/terminal/
│   ├── index.ts                     # Terminal exports
│   ├── Terminal.tsx                 # Main terminal interface
│   └── _components/
│       ├── chatMessages.tsx         # Chat messages display
│       ├── messageStatus.tsx        # Message delivery status
│       ├── typingIndicator.tsx      # Real-time typing indicator
│       ├── commandSuggestions.tsx   # Command autocomplete
│       └── agentIntegration.tsx     # Agent workflow components
├── lib/hooks/
│   ├── useChat.ts                   # Chat functionality hook
│   ├── useTerminal.ts               # Terminal state management
│   └── useAgentWorkflow.ts          # Agent integration hook
├── lib/
│   ├── chatCommands.ts              # Command definitions
│   ├── agents/                      # Agent system integration
│   └── terminal/
│       ├── messageProcessor.ts      # Message parsing and routing
│       ├── sessionManager.ts        # Session handling
│       └── premiumFeatures.ts       # Premium feature gating
└── convex/
    ├── chat.ts                      # Message storage functions
    ├── chatActions.ts               # Anthropic Claude integration
    ├── terminal.ts                  # Terminal session management
    └── schema.ts                    # Database schema
```

### AURA State Management Integration

Following AURA's strict state separation principles:

```typescript
// SERVER STATE (Convex) - All persistent data
interface ChatMessage {
  _id: Id<"chatMessages">;
  role: "user" | "assistant" | "system" | "agent";
  content: string;
  sessionId: string;
  userId?: Id<"users">;
  createdAt: number;
  status: "sending" | "delivered" | "error";
  operation?: {
    type: "agent_executed" | "file_created" | "error";
    details?: any;
  };
  interactiveComponent?: {
    type: string;
    status: "pending" | "completed" | "cancelled";
    data?: any;
  };
}

// CLIENT STATE (Zustand) - UI concerns only
interface TerminalUIStore {
  isExpanded: boolean;
  activeTab: "chat" | "logs" | "debug";
  commandSuggestions: string[];
  isTyping: boolean;
  lastCommand: string;
  
  // UI actions
  toggleTerminal: () => void;
  setActiveTab: (tab: string) => void;
  setTyping: (isTyping: boolean) => void;
  addCommandSuggestion: (command: string) => void;
}

// COMPONENT STATE (useState) - Ephemeral UI state
const [inputValue, setInputValue] = useState('');
const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
const [showSuggestions, setShowSuggestions] = useState(false);
```

### Data Flow Architecture

```
User Input → Message Processor → Agent System / AI Router → Convex Storage → Real-time UI Update
     ↓              ↓                     ↓                    ↓                ↓
Command Check → Local Handler → Interactive Component → Database Mutation → Live Sync
```

## Setup

### 1. Environment Configuration

Add your Anthropic API key to `AURA/.env.local`:

```bash
# ANTHROPIC CLAUDE API - AI Chat Terminal Integration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# CONVEX CONFIGURATION - Real-time Database
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_public_convex_url

# CLERK AUTHENTICATION - User Session Management
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# STRIPE PREMIUM FEATURES - Subscription Gating
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Install Dependencies

```bash
# From AURA root directory
pnpm install

# Install additional terminal dependencies if needed
pnpm add @anthropic-ai/sdk lucide-react
```

### 3. Start Development Environment

```bash
# Start Convex backend (from AURA directory)
cd AURA && pnpm convex:dev

# Start Next.js frontend (separate terminal)
cd AURA && pnpm dev

# Optional: Start Stripe webhook listener for premium features
pnpm stripe:listen
```

## Usage

### Accessing the Chat Terminal

1. Open AURA dashboard at `http://localhost:3000`
2. Navigate to the **Terminal** panel (bottom of interface)
3. Click the **"Chat"** tab in the terminal interface
4. Start typing your questions or commands!

### Example Conversations

```bash
$ How do I create a new marketing blog post in AURA?
AI: I'll help you create a marketing blog post! Let me guide you through the File Creator Agent workflow.

[Interactive Project Selector Component Appears]

Please select a project for your blog post:
📂 Marketing Campaign 2025 (12 files)
📂 Content Strategy (8 files)
📂 Brand Guidelines (4 files)

[User selects "Marketing Campaign 2025"]

$ Selected: Marketing Campaign 2025
AI: Perfect! I'll create a marketing blog post in your Marketing Campaign 2025 project.

[File created: /Marketing Campaign 2025/blog-post-2025-08-21.md]

Your blog post template is ready! I've included:
- SEO-optimized structure
- Brand voice guidelines
- Content strategy alignment
- Social media integration hooks

$ /agents
AI: Available AURA Agents:

**Free Agents:**
🎯 Instructions Agent - Project guidance and setup
📄 File Creator Agent - Guided file creation
📋 Project Creator Agent - New project workflows

**Premium Agents:** 
⏰ Scheduling Agent - Calendar and timeline management
🎬 Campaign Director - Marketing campaign orchestration
📱 Twitter/X Agent - Social media content creation

To activate an agent, use: /[agent-name] [instruction]
Example: /create-file marketing presentation

$ /schedule team meeting next Tuesday
AI: I'll help you schedule a team meeting! 

[Premium feature check passes]

**Scheduling Agent Activated**

Let me check your calendar availability for next Tuesday...

Available slots for team meeting:
• Tuesday, Aug 26 at 10:00 AM (2 hours)
• Tuesday, Aug 26 at 2:00 PM (1.5 hours)  
• Tuesday, Aug 26 at 4:00 PM (1 hour)

Which time works best for your team?
```

### AI Context & Knowledge

The AI assistant has comprehensive context about:

- **AURA Platform Architecture**: Components, state management, routing patterns
- **Technology Stack**: Next.js 15, React 18, TypeScript, Convex, Tailwind CSS
- **Agent System**: All available agents and their capabilities
- **Development Patterns**: Hooks, stores, component organization
- **Premium Features**: Subscription-based functionality
- **Project Management**: File organization, workflow optimization

### Command System Architecture

Commands are processed through a sophisticated routing system:

```typescript
// COMMAND PROCESSOR - Intelligent routing
// /Users/matthewsimon/Projects/AURA/AURA/lib/terminal/messageProcessor.ts

export class MessageProcessor {
  static async processMessage(
    content: string, 
    sessionId: string, 
    userId?: string
  ): Promise<ProcessingResult> {
    
    // Check for commands (starts with /)
    if (content.startsWith('/')) {
      return await this.handleCommand(content, sessionId, userId);
    }
    
    // Check for agent activation patterns
    const agentMatch = this.detectAgentIntent(content);
    if (agentMatch) {
      return await this.routeToAgent(agentMatch, content, sessionId, userId);
    }
    
    // Route to AI assistant
    return await this.routeToAI(content, sessionId, userId);
  }
  
  private static handleCommand(
    command: string, 
    sessionId: string, 
    userId?: string
  ): Promise<ProcessingResult> {
    const [cmd, ...args] = command.slice(1).split(' ');
    
    switch (cmd) {
      case 'help':
        return this.showHelp(userId);
      case 'clear':
        return this.clearSession(sessionId);
      case 'agents':
        return this.listAgents(userId);
      case 'create-file':
        return this.activateAgent('file-creator', args.join(' '), sessionId, userId);
      case 'schedule':
        return this.activateAgent('scheduling', args.join(' '), sessionId, userId);
      default:
        return this.unknownCommand(cmd);
    }
  }
}
```

## Component Implementation

### Main Terminal Component

```typescript
// TERMINAL COMPONENT - Main interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/Terminal.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useTerminalStore } from '@/lib/store/terminal';
import { ChatMessages } from './_components/chatMessages';
import { CommandSuggestions } from './_components/commandSuggestions';
import { TypingIndicator } from './_components/typingIndicator';

interface TerminalProps {
  sessionId?: string;
  className?: string;
}

export function Terminal({ sessionId, className }: TerminalProps) {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Terminal UI state (Client State)
  const { 
    isExpanded, 
    activeTab, 
    isTyping,
    setTyping 
  } = useTerminalStore();
  
  // Chat data (Server State)
  const messages = useQuery(api.chat.getMessages, { 
    sessionId: sessionId || 'default' 
  }) || [];
  
  const sendMessage = useMutation(api.chat.sendMessage);
  const processCommand = useMutation(api.terminal.processCommand);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const messageContent = input.trim();
    setInput('');
    setIsProcessing(true);
    setTyping(true);
    
    try {
      // Store user message immediately
      await sendMessage({
        role: 'user',
        content: messageContent,
        sessionId: sessionId || 'default',
        userId: user?.id
      });
      
      // Process through message processor
      await processCommand({
        content: messageContent,
        sessionId: sessionId || 'default',
        userId: user?.id
      });
      
    } catch (error) {
      console.error('Message processing failed:', error);
      // Show error message to user
      await sendMessage({
        role: 'system',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        sessionId: sessionId || 'default',
        status: 'error'
      });
    } finally {
      setIsProcessing(false);
      setTyping(false);
    }
  };
  
  // Auto-focus input
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);
  
  return (
    <div className={cn("flex flex-col h-full bg-[#1e1e1e]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f44747]" />
          <div className="w-3 h-3 rounded-full bg-[#ffcc02]" />
          <div className="w-3 h-3 rounded-full bg-[#4ec9b0]" />
          <span className="text-xs text-[#858585] ml-2">AURA Terminal</span>
        </div>
        <div className="text-xs text-[#858585]">
          Session: {sessionId?.slice(-8) || 'default'}
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={messages} 
          sessionId={sessionId || 'default'} 
        />
        {isTyping && <TypingIndicator />}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-[#2d2d2d] p-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-[#4ec9b0] text-sm font-mono">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AURA AI or use /commands..."
            className="flex-1 bg-transparent text-[#cccccc] placeholder-[#858585] outline-none font-mono text-sm"
            disabled={isProcessing}
          />
          {isProcessing && (
            <div className="w-4 h-4 border border-[#858585] border-t-transparent rounded-full animate-spin" />
          )}
        </form>
        <CommandSuggestions input={input} onSelect={setInput} />
      </div>
    </div>
  );
}
```

### Chat Messages with Agent Integration

```typescript
// CHAT MESSAGES COMPONENT - Agent integration support
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/chatMessages.tsx

'use client';

import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, XCircle, Bot, User, System, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentInteractiveComponent } from './agentIntegration';

interface ChatMessagesProps {
  messages: ChatMessage[];
  sessionId: string;
}

export function ChatMessages({ messages, sessionId }: ChatMessagesProps) {
  const sortedMessages = useMemo(() => 
    [...messages].sort((a, b) => a.createdAt - b.createdAt),
    [messages]
  );
  
  const getMessageIcon = (role: string, operation?: any) => {
    const iconClass = "w-4 h-4";
    
    switch (role) {
      case 'user':
        return <User className={cn(iconClass, "text-[#007acc]")} />;
      case 'assistant':
        return <Bot className={cn(iconClass, "text-[#4ec9b0]")} />;
      case 'agent':
        return <Zap className={cn(iconClass, "text-[#ffcc02]")} />;
      case 'system':
        return <System className={cn(iconClass, "text-[#858585]")} />;
      default:
        return <Bot className={cn(iconClass, "text-[#858585]")} />;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-[#4ec9b0]" />;
      case 'sending':
        return <Clock className="w-3 h-3 text-[#ffcc02]" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-[#f44747]" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {sortedMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Bot className="w-12 h-12 text-[#858585] mb-4" />
          <h3 className="text-lg font-semibold text-[#cccccc] mb-2">
            Welcome to AURA AI Terminal
          </h3>
          <p className="text-sm text-[#858585] max-w-md">
            Ask me anything about your projects, use /commands, or activate agents for advanced workflows.
          </p>
        </div>
      ) : (
        sortedMessages.map((message) => (
          <div key={message._id} className="space-y-2">
            {/* Message */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {getMessageIcon(message.role, message.operation)}
                <span className="text-xs text-[#858585] font-mono">
                  {message.role}:
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#cccccc] font-mono leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
                
                {/* Operation Details */}
                {message.operation && (
                  <div className="mt-2 p-2 bg-[#2d2d2d] rounded text-xs text-[#858585]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Operation:</span>
                      <span className="text-[#4ec9b0]">{message.operation.type}</span>
                    </div>
                    {message.operation.details && (
                      <pre className="mt-1 text-[#cccccc] overflow-x-auto">
                        {JSON.stringify(message.operation.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-[#858585]">
                {getStatusIcon(message.status)}
                <span>
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {/* Interactive Agent Components */}
            {message.interactiveComponent && message.interactiveComponent.status === 'pending' && (
              <div className="ml-6 mt-3 animate-in slide-in-from-left-2 duration-300">
                <AgentInteractiveComponent
                  component={message.interactiveComponent}
                  messageId={message._id}
                  sessionId={sessionId}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

## Premium Features

### Subscription-Based Access Control

```typescript
// PREMIUM FEATURES GATING
// /Users/matthewsimon/Projects/AURA/AURA/lib/terminal/premiumFeatures.ts

export class PremiumFeatureGate {
  static async checkAccess(
    feature: string, 
    userId?: string
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    
    if (!userId) {
      return { hasAccess: false, reason: 'Authentication required' };
    }
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), userId))
      .first();
      
    if (!user) {
      return { hasAccess: false, reason: 'User not found' };
    }
    
    const premiumFeatures = [
      'scheduling-agent',
      'campaign-director',
      'export-conversations',
      'advanced-analytics',
      'team-collaboration'
    ];
    
    if (premiumFeatures.includes(feature)) {
      if (user.subscriptionStatus !== 'active') {
        return { 
          hasAccess: false, 
          reason: 'Premium subscription required. Upgrade at /pricing' 
        };
      }
    }
    
    return { hasAccess: true };
  }
  
  static getPremiumMessage(feature: string): string {
    return `🔒 Premium Feature: ${feature}
    
This feature requires an AURA Premium subscription.
    
Benefits include:
• Advanced agent workflows
• Priority AI processing
• Extended conversation history
• Team collaboration features
• Priority support

Upgrade now: /pricing`;
  }
}
```

## Agent System Integration

### Interactive Component Integration

```typescript
// AGENT INTEGRATION COMPONENT
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/agentIntegration.tsx

interface AgentInteractiveComponentProps {
  component: {
    type: string;
    status: 'pending' | 'completed' | 'cancelled';
    data?: any;
  };
  messageId: string;
  sessionId: string;
}

export function AgentInteractiveComponent({ 
  component, 
  messageId, 
  sessionId 
}: AgentInteractiveComponentProps) {
  
  const updateComponent = useMutation(api.chat.updateInteractiveComponent);
  const addMessage = useMutation(api.chat.sendMessage);
  
  const handleSelection = async (result: any) => {
    try {
      // Update component status
      await updateComponent({
        messageId: messageId as Id<"chatMessages">,
        status: 'completed',
        result
      });
      
      // Continue agent workflow
      await addMessage({
        role: 'user',
        content: `Selected: ${result.name || result.value}`,
        sessionId,
        operation: {
          type: 'selection_made',
          details: result
        }
      });
      
    } catch (error) {
      console.error('Component update failed:', error);
    }
  };
  
  const handleCancel = async () => {
    try {
      await updateComponent({
        messageId: messageId as Id<"chatMessages">,
        status: 'cancelled'
      });
      
      await addMessage({
        role: 'system',
        content: 'Operation cancelled by user.',
        sessionId
      });
      
    } catch (error) {
      console.error('Component cancellation failed:', error);
    }
  };
  
  // Component registry for different agent workflows
  switch (component.type) {
    case 'project_selector':
      return (
        <ProjectSelector
          fileDetails={component.data?.fileDetails}
          onProjectSelected={handleSelection}
          onCancel={handleCancel}
        />
      );
      
    case 'file_type_selector':
      return (
        <FileTypeSelector
          availableTypes={component.data?.types}
          onTypeSelected={handleSelection}
          onCancel={handleCancel}
        />
      );
      
    case 'schedule_time_picker':
      return (
        <ScheduleTimePicker
          availableSlots={component.data?.slots}
          onTimeSelected={handleSelection}
          onCancel={handleCancel}
        />
      );
      
    default:
      return (
        <div className="text-xs text-[#f44747] p-2 border border-[#f44747]/30 rounded">
          Unknown interactive component: {component.type}
        </div>
      );
  }
}
```

## Database Schema

### Enhanced Chat Schema for AURA

```typescript
// CONVEX SCHEMA - Terminal chat integration
// /Users/matthewsimon/Projects/AURA/AURA/convex/schema.ts

export default defineSchema({
  // Enhanced chat messages for terminal integration
  chatMessages: defineTable({
    role: v.union(
      v.literal("user"),
      v.literal("assistant"), 
      v.literal("system"),
      v.literal("agent"),
      v.literal("terminal")
    ),
    content: v.string(),
    sessionId: v.string(),
    userId: v.optional(v.union(v.string(), v.id("users"))),
    createdAt: v.number(),
    status: v.union(
      v.literal("sending"),
      v.literal("delivered"), 
      v.literal("error")
    ),
    
    // Agent operation tracking
    operation: v.optional(
      v.object({
        type: v.union(
          v.literal("agent_executed"),
          v.literal("file_created"),
          v.literal("project_created"),
          v.literal("selection_made"),
          v.literal("command_executed"),
          v.literal("error")
        ),
        agentId: v.optional(v.string()),
        details: v.optional(v.any()),
      })
    ),
    
    // Interactive component support for agent workflows
    interactiveComponent: v.optional(
      v.object({
        type: v.string(),
        status: v.union(
          v.literal("pending"),
          v.literal("completed"),
          v.literal("cancelled")
        ),
        data: v.optional(v.any()),
        result: v.optional(v.any()),
        expiresAt: v.optional(v.number())
      })
    ),
    
    // Message metadata
    metadata: v.optional(
      v.object({
        tokens: v.optional(v.number()),
        processingTime: v.optional(v.number()),
        model: v.optional(v.string()),
        temperature: v.optional(v.number())
      })
    )
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_agent", ["operation.agentId"]),
    
  // Terminal sessions for state management
  terminalSessions: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.union(v.string(), v.id("users"))),
    title: v.optional(v.string()),
    createdAt: v.number(),
    lastActivity: v.number(),
    isActive: v.boolean(),
    
    // Session context
    context: v.optional(
      v.object({
        currentProject: v.optional(v.id("projects")),
        activeAgent: v.optional(v.string()),
        workflowState: v.optional(v.any()),
        preferences: v.optional(v.any())
      })
    ),
    
    // Session settings
    settings: v.optional(
      v.object({
        theme: v.optional(v.string()),
        fontSize: v.optional(v.number()),
        autoScroll: v.optional(v.boolean()),
        commandHistory: v.optional(v.array(v.string()))
      })
    )
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_active", ["isActive"])
});
```

## Testing

### Terminal Component Tests

```typescript
// TERMINAL TESTING SUITE
// /Users/matthewsimon/Projects/AURA/AURA/tests/components/terminal/Terminal.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Terminal } from '@/app/_components/terminal/Terminal';
import { ConvexReactClient } from 'convex/react';
import { ConvexProvider } from 'convex/react';

// Mock Convex
const convex = new ConvexReactClient('mock://convex');

describe('Terminal Component', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <ConvexProvider client={convex}>
        {component}
      </ConvexProvider>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders terminal interface correctly', () => {
    renderWithProviders(<Terminal />);
    
    expect(screen.getByText('AURA Terminal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask AURA AI or use /commands...')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });
  
  it('handles command input correctly', async () => {
    renderWithProviders(<Terminal />);
    
    const input = screen.getByPlaceholderText('Ask AURA AI or use /commands...');
    fireEvent.change(input, { target: { value: '/help' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
  
  it('shows loading state during processing', async () => {
    renderWithProviders(<Terminal />);
    
    const input = screen.getByPlaceholderText('Ask AURA AI or use /commands...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(input.closest('form')!);
    
    // Should show spinner during processing
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
  
  it('handles agent activation commands', async () => {
    renderWithProviders(<Terminal />);
    
    const input = screen.getByPlaceholderText('Ask AURA AI or use /commands...');
    fireEvent.change(input, { target: { value: '/create-file blog post' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText(/File Creator Agent/)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```typescript
// INTEGRATION TESTS - Terminal workflow
// /Users/matthewsimon/Projects/AURA/AURA/tests/integration/terminal-agent-workflow.test.ts

import { test, expect } from '@playwright/test';

test.describe('Terminal Agent Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="terminal-panel"]');
  });
  
  test('completes file creation workflow via terminal', async ({ page }) => {
    // Open terminal
    await page.click('[data-testid="terminal-toggle"]');
    await page.click('[data-testid="terminal-chat-tab"]');
    
    // Execute create file command
    await page.fill('[data-testid="terminal-input"]', '/create-file marketing blog post');
    await page.press('[data-testid="terminal-input"]', 'Enter');
    
    // Wait for agent response and interactive component
    await expect(page.locator('[data-testid="project-selector"]')).toBeVisible();
    
    // Complete workflow
    await page.click('[data-testid="project-marketing"]');
    await page.click('[data-testid="confirm-selection"]');
    
    // Verify success
    await expect(page.locator('text=File created successfully')).toBeVisible();
  });
  
  test('handles premium feature gating', async ({ page }) => {
    // Try premium command without subscription
    await page.fill('[data-testid="terminal-input"]', '/schedule team meeting');
    await page.press('[data-testid="terminal-input"]', 'Enter');
    
    // Should show premium upgrade message
    await expect(page.locator('text=Premium subscription required')).toBeVisible();
    await expect(page.locator('text=Upgrade now: /pricing')).toBeVisible();
  });
});
```

## Performance Optimization

### Message Virtualization

```typescript
// MESSAGE VIRTUALIZATION - Handle large chat histories
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/virtualizedMessages.tsx

import { FixedSizeList as List } from 'react-window';
import { memo, useMemo } from 'react';

interface VirtualizedMessagesProps {
  messages: ChatMessage[];
  height: number;
  itemHeight: number;
}

export const VirtualizedMessages = memo(({ messages, height, itemHeight }: VirtualizedMessagesProps) => {
  const MessageItem = useMemo(() => 
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const message = messages[index];
      
      return (
        <div style={style}>
          <MessageComponent message={message} />
        </div>
      );
    }, [messages]
  );
  
  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={itemHeight}
      overscanCount={5}
    >
      {MessageItem}
    </List>
  );
});
```

## Troubleshooting

### Common Issues

1. **AI Assistant Not Responding**
   - Check Anthropic API key in `.env.local`
   - Verify Convex deployment is active
   - Check browser console for JavaScript errors
   - Ensure user authentication is working

2. **Commands Not Executing**
   - Verify commands start with `/` character
   - Check `chatCommands.ts` for available commands
   - Ensure message processor is handling routing correctly
   - Check Convex mutations for command processing

3. **Agent Workflows Failing**
   - Verify agent registration in agent registry
   - Check premium feature access for subscription-gated agents
   - Ensure interactive components are properly registered
   - Check Convex schema for required fields

4. **Messages Not Persisting**
   - Verify Convex connection and authentication
   - Check database schema for `chatMessages` table
   - Ensure session ID generation is working
   - Check for proper error handling in mutations

5. **Real-time Updates Not Working**
   - Check Convex subscription queries
   - Verify WebSocket connection is established
   - Ensure proper query invalidation on mutations
   - Check for client-side state synchronization issues

### Debug Mode

Enable detailed logging in development:

```typescript
// Add to terminal component for debugging
if (process.env.NODE_ENV === 'development') {
  console.group('Terminal Debug');
  console.log('Session ID:', sessionId);
  console.log('Messages:', messages);
  console.log('User:', user);
  console.log('Processing state:', isProcessing);
  console.groupEnd();
}
```

## Future Enhancements

### Planned Features

- [ ] **Voice Input Integration**: Speech-to-text for hands-free operation
- [ ] **Code Execution Environment**: Safe sandbox for running terminal commands
- [ ] **Multi-Session Management**: Switch between different conversation contexts
- [ ] **Export & Import**: Save/load conversation history
- [ ] **Advanced Analytics**: Usage metrics and performance insights
- [ ] **Team Collaboration**: Shared terminal sessions
- [ ] **Plugin System**: Third-party integrations and extensions
- [ ] **Mobile Optimization**: Touch-friendly terminal interface
- [ ] **Offline Mode**: Limited functionality without internet
- [ ] **Custom Themes**: User-customizable terminal appearance

### Architecture Improvements

- [ ] **WebRTC Integration**: Real-time collaboration without server overhead
- [ ] **Edge Computing**: Faster response times with edge-deployed AI
- [ ] **Caching Layer**: Redis integration for improved performance
- [ ] **Rate Limiting**: Prevent API abuse and manage costs
- [ ] **Monitoring**: Application performance monitoring integration

## Contributing

When contributing to the terminal system:

1. **Follow AURA Patterns**: Use established state management and component patterns
2. **Test Coverage**: Ensure comprehensive test coverage for new features
3. **Documentation**: Update this documentation for any new functionality
4. **Performance**: Consider impact on message loading and real-time updates
5. **Accessibility**: Maintain keyboard navigation and screen reader support
6. **Premium Features**: Properly implement subscription gating where appropriate

## Conclusion

The AURA AI Chat Terminal provides a powerful, integrated development experience that combines intelligent AI assistance with advanced agent workflows. Built on Convex's real-time database with proper state management principles, it offers seamless user interactions while maintaining scalability and performance.

Key benefits:
- **Real-time Synchronization**: Instant updates across all connected clients
- **Agent Integration**: Seamless workflow automation through interactive components  
- **Premium Features**: Subscription-based access to advanced functionality
- **Terminal Experience**: Authentic development environment feel
- **Extensible Architecture**: Easy to add new commands, agents, and features

This comprehensive implementation ensures that AURA users have access to a state-of-the-art AI assistant that understands their projects, workflows, and goals while providing the tools needed for efficient development and project management.
