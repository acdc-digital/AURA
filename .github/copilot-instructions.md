# AURA Project Instructions

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.
You use the latest versions of popular frameworks and libraries such as React & NextJS (with app router).
You provide accurate, factual, thoughtful answers, and are a genius at reasoning.

## AI Development Tools Integration
This project uses multiple AI development tools working together:
- **GitHub Copilot**: For code completion and inline suggestions
- **Claude Sonnet 4**: For complex problem solving and architectural guidance (see `.github/instructions/claude.instructions.md`)
- **Convex MCP Server**: For database and backend assistance

## Project Overview
AURA is a modern web application built with a pnpm workspace monorepo structure that delivers exceptional user experience through real-time data synchronization and a responsive design system.

## Approach
- This project uses Next.js App Router - never suggest using the pages router or provide code using the pages router
- Follow the user's requirements carefully & to the letter
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail
- Confirm, then write code!
- Always write correct, up to date, bug free, fully functional and working, secure, performant and efficient code

## UI Design Preferences
- **NO TOOLTIPS**: Never use tooltips - they are disliked and should be avoided entirely
- **NO FOCUS RINGS**: Never add focus rings or focus:ring classes - disable them with focus:outline-none only
- **CURSOR PREFERENCE**: Always use grab/grabbing cursor variants (`cursor-grab` and `active:cursor-grabbing`) instead of resize cursors (`cursor-row-resize`, `cursor-col-resize`, etc.) for any draggable or resizable elements
- Use terminal-style interfaces with tight, compact design
- Prefer thin, subtle icons over bold or prominent elements

## Key Principles
- Focus on readability over being performant
- Fully implement all requested functionality
- Leave NO todo's, placeholders or missing pieces
- Be sure to reference file names
- Be concise. Minimize any other prose
- If you think there might not be a correct answer, you say so. If you do not know the answer, say so instead of guessing
- Only write code that is necessary to complete the task
- Rewrite the complete code only if necessary
- Update relevant tests or create new tests if necessary

## Repository Structure
```
AURA/
├── .github/                 # GitHub configuration and workflows
├── .vscode/                 # VS Code workspace settings
├── AURA/                   # Main Next.js application (red project folder)
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utility functions and configurations
│   ├── convex/             # Convex backend functions and schema
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── public/             # Static assets
├── packages/               # Shared workspace packages
├── apps/                   # Additional applications
├── tools/                  # Development tools and scripts
├── docs/                   # Documentation and notebooks
├── package.json            # Root workspace configuration
└── pnpm-workspace.yaml     # pnpm workspace definition
```

## Tech Stack
- Next.js 14+ with App Router (never use pages router)
- Convex for real-time database and backend functions
- TypeScript with strict type checking
- Shadcn UI and Radix UI for components
- Tailwind CSS for styling
- pnpm for package management
- React 18+ with Server Components

## Coding Standards

### File Header Requirements
- **ALWAYS add descriptive file headers to every new file, script, or page**
- Include the file purpose and absolute filepath for context and organization
- Use consistent comment formatting across all file types

**Header Format:**
```typescript
// [PURPOSE] - Brief description
// [ABSOLUTE_FILEPATH]

// Rest of your code...
```

**Examples:**
```typescript
// HOMEPAGE - Main landing page for AURA platform
// /Users/matthewsimon/Projects/AURA/AURA/app/page.tsx

// USER AUTHENTICATION - Clerk auth integration
// /Users/matthewsimon/Projects/AURA/AURA/lib/auth.ts

// CONVEX SCHEMA - Database table definitions
// /Users/matthewsimon/Projects/AURA/AURA/convex/schema.ts

// API ROUTE - User profile management endpoint
// /Users/matthewsimon/Projects/AURA/AURA/app/api/users/route.ts
```

**Requirements:**
- First line: Purpose in ALL CAPS with brief description
- Second line: Complete absolute filepath
- Third line: Empty line before code begins
- Apply to all TypeScript, JavaScript, and React files

### Naming Conventions
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`)
- Files: kebab-case (`user-profile.tsx`)
- Components: PascalCase (`UserProfile`) 
- Functions: camelCase (`getUserData`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types/Interfaces: PascalCase (`UserProfileData`)
- Favor named exports for components

### TypeScript Rules
- Use TypeScript for all code - prefer interfaces over types
- Avoid enums - use maps instead
- Use functional components with TypeScript interfaces
- Define proper interfaces for props and data
- Use strict type checking
- Implement proper error handling with try/catch

### React/Next.js Patterns
- Use React Server Components by default
- Minimize 'use client', 'useEffect', and 'setState' - favor React Server Components (RSC)
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Add 'use client' only when client-side features needed
- Prefer function components over class components
- Use custom hooks for reusable stateful logic
- Implement proper error boundaries
- Use Next.js optimizations (Image, Link, etc.)

### UI and Styling Guidelines
- Use Shadcn UI, Radix UI, and Tailwind for components and styling
- Implement responsive design with Tailwind CSS - use mobile-first approach
- Follow mobile-first responsive design
- Implement proper accessibility (ARIA labels, semantic HTML)
- Use CSS variables for theme values

### Performance Optimization
- Optimize images: use WebP format, include size data, implement lazy loading
- Minimize bundle size with tree shaking
- Use proper code splitting
- Implement proper caching strategies

### Convex Database Patterns
- Use Convex queries for read operations with caching and reactivity
- Use Convex mutations for write operations with ACID transactions
- Use Convex actions for external API calls and side effects
- Implement proper error handling with ConvexError for application errors
- Use TypeScript schema validation for data integrity
- Follow real-time subscription best practices for reactive UX
- Reference comprehensive Convex guidelines in `.github/instructions/convex-comprehensive.instructions.md`

## Component Structure Template
```typescript
import { FC } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserData } from '@/types/user'

interface UserProfileProps {
  userData: UserData
  onUserUpdate?: (user: UserData) => void
}

export const UserProfile: FC<UserProfileProps> = ({ 
  userData, 
  onUserUpdate 
}) => {
  return (
    <div className="space-y-4">
      {/* Component JSX */}
    </div>
  )
}
```

## Common Patterns

### Error Handling
```typescript
try {
  const result = await api.users.get({ id: userId })
  return result
} catch (error) {
  console.error('Failed to fetch user:', error)
  throw new Error('Unable to load user data')
}
```

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await submitData()
  } finally {
    setIsLoading(false)
  }
}
```

### Type-Safe API Calls
```typescript
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

const user = await convex.query(api.users.get, { 
  id: userId as Id<"users"> 
})
```

## What to Avoid
- Don't use `any` type - prefer `unknown` or proper typing
- Avoid inline styles - use Tailwind classes
- Don't mutate props directly
- Avoid deeply nested components - prefer composition
- Don't ignore TypeScript errors - fix them properly
- Avoid large components - break them into smaller pieces

## Security Considerations
- Validate all user inputs
- Use proper authentication patterns
- Sanitize data before database operations
- Follow OWASP security guidelines
- Implement proper CORS policies

Remember: Write code that is readable, maintainable, and follows modern React/Next.js best practices. When in doubt, prefer explicit over implicit, and clarity over cleverness.

# GitHub Copilot State Management Instructions for AURA

## Core Principles

When implementing state management in this project, follow these strict guidelines:

### 1. State Separation Rule
```
Server State (Convex) = Source of Truth
Client State (Zustand) = UI-only concerns
```

- **NEVER** store business data in Zustand
- **NEVER** duplicate server state in client state
- **ALWAYS** use Convex for persistent data

### 2. Component State Hierarchy

```typescript
// ✅ CORRECT: Use useState only for ephemeral UI state
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [draggedItem, setDraggedItem] = useState<string | null>(null);

// ❌ WRONG: Don't use useState for business data
const [projects, setProjects] = useState([]); // Use Convex instead
const [userProfile, setUserProfile] = useState({}); // Use Convex instead
```

### 3. Data Flow Architecture

```
Convex DB → useQuery/useMutation → Custom Hook → Component → User Action → Mutation → Convex DB
```

## Implementation Rules

### Rule 1: Convex for All Persistent Data

```typescript
// ✅ CORRECT: Use Convex for data that needs to persist
const projects = useQuery(api.projects.list);
const createProject = useMutation(api.projects.create);

// ❌ WRONG: Don't store persistent data in Zustand
const { projects, setProjects } = useProjectStore(); // Don't do this
```

### Rule 2: Zustand for UI State Only

```typescript
// ✅ CORRECT: Zustand store for UI concerns
interface UIStore {
  sidebarCollapsed: boolean;
  activePanel: string;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setActivePanel: (panel: string) => void;
}

// ❌ WRONG: Don't mix business data in UI stores
interface BadStore {
  projects: Project[]; // This belongs in Convex
  sidebarCollapsed: boolean;
}
```

### Rule 3: Custom Hooks Pattern

Always wrap Convex queries with custom hooks that handle loading, error states, and optimistic updates:

```typescript
// ✅ CORRECT: Custom hook pattern
export function useProjects() {
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
    createProject,
    updateProject,
  };
}

// Component usage
function ProjectList() {
  const { projects, isLoading } = useProjects();
  // Clean component with no direct Convex calls
}
```

### Rule 4: Optimistic Updates Pattern

```typescript
// ✅ CORRECT: Handle optimistic updates in a dedicated layer
export function useOptimisticProject(projectId: string) {
  const project = useQuery(api.projects.get, { id: projectId });
  const updateMutation = useMutation(api.projects.update);
  const [optimisticData, setOptimisticData] = useState<Partial<Project> | null>(null);

  const update = async (data: Partial<Project>) => {
    // Set optimistic update
    setOptimisticData(data);

    try {
      await updateMutation({ id: projectId, ...data });
      // Clear on success
      setOptimisticData(null);
    } catch (error) {
      // Rollback on error
      setOptimisticData(null);
      throw error;
    }
  };

  return {
    project: { ...project, ...optimisticData },
    update,
  };
}
```

### Rule 5: Component State Guidelines

```typescript
// ✅ CORRECT: Component with clear state separation
export function DashboardComponent() {
  // Server state via custom hooks
  const { projects, createProject } = useProjects();
  const { user } = useUser();

  // UI state via Zustand
  const { activePanel, setActivePanel } = useUIStore();

  // Local ephemeral state
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // No business logic in component
  return <div>...</div>;
}
```

## File Organization

```
/lib/hooks/
  useProjects.ts    # Convex queries/mutations for projects
  useFiles.ts       # Convex queries/mutations for files
  useUser.ts        # Convex queries/mutations for user

/store/
  ui/
    editorUIStore.ts    # Tabs, panels, themes
    sidebarUIStore.ts   # Sidebar state
  temp/
    formStore.ts        # Temporary form state
    searchStore.ts      # Search filters

/convex/
  projects.ts       # Project queries/mutations
  files.ts          # File queries/mutations
  users.ts          # User queries/mutations
```

## Anti-Patterns to Avoid

### ❌ DON'T: Mix Server and Client State
```typescript
// WRONG
const useProjectStore = create((set) => ({
  projects: [], // Server data doesn't belong here
  activeProjectId: null, // This is OK (UI state)
  fetchProjects: async () => {
    const data = await fetch('/api/projects');
    set({ projects: data }); // Don't do this
  }
}));
```

### ❌ DON'T: Duplicate State
```typescript
// WRONG
function Component() {
  const serverProjects = useQuery(api.projects.list);
  const [localProjects, setLocalProjects] = useState(serverProjects);
  // This creates sync issues
}
```

### ❌ DON'T: Direct Convex Calls in Components
```typescript
// WRONG
function Component() {
  const projects = useQuery(api.projects.list); // Wrap in custom hook
  const create = useMutation(api.projects.create); // Wrap in custom hook
}
```

## Quick Decision Tree

When adding new state, ask:

1. **Does it need to persist across sessions?** → Use Convex
2. **Is it UI-only (theme, sidebar, modals)?** → Use Zustand
3. **Is it component-specific and temporary?** → Use useState
4. **Is it derived from other state?** → Use useMemo
5. **Does it need to be shared across many components?** → Use Zustand (UI) or Convex (data)

## Code Generation Templates

When Copilot generates state management code, use these templates:

### Custom Hook Template
```typescript
export function use[Resource]() {
  const data = useQuery(api.[resource].list);
  const create = useMutation(api.[resource].create);
  const update = useMutation(api.[resource].update);
  const remove = useMutation(api.[resource].remove);

  return {
    [resource]: data ?? [],
    isLoading: data === undefined,
    create,
    update,
    remove,
  };
}
```

### UI Store Template
```typescript
interface [Feature]UIStore {
  // UI state only
  is[Feature]Open: boolean;
  selected[Feature]Id: string | null;

  // UI actions
  open[Feature]: () => void;
  close[Feature]: () => void;
  select[Feature]: (id: string) => void;
}
```

Remember: When in doubt, prefer Convex over client state. Real persistence > temporary state.
