# AURA State Management Architecture

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [State Categories](#state-categories)
4. [Implementation Guide](#implementation-guide)
5. [Patterns & Best Practices](#patterns--best-practices)
6. [Migration Strategy](#migration-strategy)
7. [Testing Guidelines](#testing-guidelines)
8. [Performance Optimization](#performance-optimization)

## Overview

AURA follows a **domain-driven, server-first** state management architecture that clearly separates concerns between server state (Convex) and client state (Zustand/React). This architecture ensures data consistency, optimal performance, and maintainable code.

### Core Technologies

- **Convex**: Primary data store for all persistent business data
- **Zustand**: Lightweight store for UI-only state
- **React Hooks**: Component-level ephemeral state
- **React Query Pattern**: Via Convex's built-in caching and real-time updates

## Architecture Principles

### 1. Single Source of Truth

```
Convex Database = Source of Truth for Business Data
Zustand = Source of Truth for UI Preferences
Component State = Source of Truth for Ephemeral UI State
```

### 2. Unidirectional Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│ Convex DB   │────▶│ Custom Hooks │────▶│ Components  │────▶│ User     │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
       ▲                                         │                   │
       │                                         └───────────────────┘
       │                                              User Actions
       └──────────────────────────────────────────────────────────────
                          Mutations
```

### 3. Separation of Concerns

| Layer        | Responsibility            | Examples                            |
| ------------ | ------------------------- | ----------------------------------- |
| **Convex**   | Persistent business data  | Projects, Files, Users, Posts       |
| **Zustand**  | UI preferences & state    | Theme, Sidebar state, Active panels |
| **useState** | Ephemeral component state | Form inputs, Dropdowns, Modals      |
| **useMemo**  | Derived/computed state    | Filtered lists, Calculations        |

## State Categories

### 1. Server State (Convex)

All data that needs to:

- Persist across sessions
- Be shared across devices
- Be accessible by multiple users
- Maintain consistency

```typescript
// convex/schema.ts
export default defineSchema({
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  files: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    content: v.string(),
    type: v.string(),
    path: v.string(),
  }).index("by_project", ["projectId"]),
});
```

### 2. UI State (Zustand)

Application-wide UI preferences that:

- Don't need server persistence
- Affect multiple components
- Represent user preferences

```typescript
// store/ui/appUIStore.ts
interface AppUIStore {
  // Sidebar
  sidebarCollapsed: boolean;
  activePanel: "explorer" | "search" | "git" | "debug";

  // Editor
  editorTheme: "dark" | "light";
  fontSize: number;
  wordWrap: boolean;

  // Actions
  toggleSidebar: () => void;
  setActivePanel: (panel: string) => void;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
}

export const useAppUIStore = create<AppUIStore>((set) => ({
  sidebarCollapsed: false,
  activePanel: "explorer",
  editorTheme: "dark",
  fontSize: 14,
  wordWrap: true,

  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  setActivePanel: (panel) => set({ activePanel: panel }),

  updateEditorSettings: (settings) =>
    set((state) => ({
      ...state,
      ...settings,
    })),
}));
```

### 3. Component State (useState)

Local, ephemeral state that:

- Is specific to a single component
- Doesn't need to persist
- Represents temporary UI state

```typescript
// components/FileExplorer.tsx
function FileExplorer() {
  // Ephemeral UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Server state via custom hook
  const { files, createFile, deleteFile } = useFiles();

  // Derived state
  const filteredFiles = useMemo(() =>
    files.filter(f => f.name.includes(searchQuery)),
    [files, searchQuery]
  );

  return <div>...</div>;
}
```

## Implementation Guide

### Step 1: Define Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Define your tables with proper validation
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    tags: v.array(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_status", ["status"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["status"],
    }),
});
```

### Step 2: Create Convex Functions

```typescript
// convex/projects.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let query = ctx.db.query("projects");
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await query.collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const projectId = await ctx.db.insert("projects", {
      ...args,
      status: "active",
      userId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});
```

### Step 3: Create Custom Hooks

```typescript
// lib/hooks/useProjects.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";

export function useProjects(status?: string) {
  const projects = useQuery(api.projects.list, { status });
  const createMutation = useMutation(api.projects.create);
  const updateMutation = useMutation(api.projects.update);
  const deleteMutation = useMutation(api.projects.delete);

  // Optimistic update state
  const [optimisticProjects, setOptimisticProjects] = useState<
    Map<string, any>
  >(new Map());

  const createProject = useCallback(
    async (data: CreateProjectInput) => {
      const tempId = `temp_${Date.now()}`;

      // Optimistic update
      setOptimisticProjects((prev) =>
        new Map(prev).set(tempId, {
          ...data,
          _id: tempId,
          _creationTime: Date.now(),
        }),
      );

      try {
        const projectId = await createMutation(data);
        // Clear optimistic update
        setOptimisticProjects((prev) => {
          const next = new Map(prev);
          next.delete(tempId);
          return next;
        });
        return projectId;
      } catch (error) {
        // Rollback optimistic update
        setOptimisticProjects((prev) => {
          const next = new Map(prev);
          next.delete(tempId);
          return next;
        });
        throw error;
      }
    },
    [createMutation],
  );

  // Merge real data with optimistic updates
  const mergedProjects = [
    ...(projects ?? []),
    ...Array.from(optimisticProjects.values()),
  ];

  return {
    projects: mergedProjects,
    isLoading: projects === undefined,
    createProject,
    updateProject: updateMutation,
    deleteProject: deleteMutation,
  };
}
```

### Step 4: Create UI Stores

```typescript
// store/ui/editorUIStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Tab {
  id: string;
  title: string;
  isPinned: boolean;
  isDirty: boolean;
}

interface EditorUIStore {
  // State
  tabs: Tab[];
  activeTabId: string | null;
  fontSize: number;
  wordWrap: boolean;

  // Actions
  openTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
}

export const useEditorUIStore = create<EditorUIStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      fontSize: 14,
      wordWrap: true,

      openTab: (tab) =>
        set((state) => {
          const exists = state.tabs.find((t) => t.id === tab.id);
          if (exists) {
            return { activeTabId: tab.id };
          }
          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        }),

      closeTab: (tabId) =>
        set((state) => {
          const tabs = state.tabs.filter((t) => t.id !== tabId);
          const activeTabId =
            state.activeTabId === tabId
              ? (tabs[tabs.length - 1]?.id ?? null)
              : state.activeTabId;
          return { tabs, activeTabId };
        }),

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      pinTab: (tabId) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, isPinned: !t.isPinned } : t,
          ),
        })),

      updateEditorSettings: (settings) => set(settings),
    }),
    {
      name: "editor-ui-storage",
      partialize: (state) => ({
        fontSize: state.fontSize,
        wordWrap: state.wordWrap,
      }),
    },
  ),
);
```

### Step 5: Implement Components

```typescript
// components/ProjectList.tsx
import { useProjects } from '@/lib/hooks/useProjects';
import { useEditorUIStore } from '@/store/ui/editorUIStore';
import { useState } from 'react';

export function ProjectList() {
  // Server state
  const { projects, isLoading, createProject } = useProjects();

  // UI state
  const { openTab } = useEditorUIStore();

  // Local state
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const projectId = await createProject({ name: newProjectName });
      openTab({
        id: projectId,
        title: newProjectName,
        isPinned: false,
        isDirty: false,
      });
      setNewProjectName('');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div>
      {projects.map(project => (
        <div key={project._id} onClick={() => openTab({
          id: project._id,
          title: project.name,
          isPinned: false,
          isDirty: false,
        })}>
          {project.name}
        </div>
      ))}

      {/* Create new project */}
      <input
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        placeholder="New project name"
        disabled={isCreating}
      />
      <button onClick={handleCreateProject} disabled={isCreating}>
        Create Project
      </button>
    </div>
  );
}
```

## Patterns & Best Practices

### 1. Optimistic Updates Pattern

```typescript
export function useOptimisticMutation<T>(
  mutation: any,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  },
) {
  const [isPending, setIsPending] = useState(false);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const execute = useCallback(
    async (input: any) => {
      setIsPending(true);
      setOptimisticData(input);

      try {
        const result = await mutation(input);
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        setOptimisticData(null);
        options?.onError?.(error as Error);
        throw error;
      } finally {
        setIsPending(false);
        setOptimisticData(null);
      }
    },
    [mutation, options],
  );

  return { execute, isPending, optimisticData };
}
```

### 2. Real-time Subscription Pattern

```typescript
export function useRealtimeProject(projectId: string) {
  const project = useQuery(api.projects.get, { id: projectId });
  const [localEdits, setLocalEdits] = useState<Partial<Project>>({});

  // Merge server state with local edits
  const mergedProject = { ...project, ...localEdits };

  const updateLocally = (updates: Partial<Project>) => {
    setLocalEdits((prev) => ({ ...prev, ...updates }));
  };

  const saveToServer = useMutation(api.projects.update);

  const save = async () => {
    if (Object.keys(localEdits).length === 0) return;

    await saveToServer({ id: projectId, ...localEdits });
    setLocalEdits({});
  };

  return {
    project: mergedProject,
    updateLocally,
    save,
    hasLocalEdits: Object.keys(localEdits).length > 0,
  };
}
```

### 3. Error Boundary Pattern

```typescript
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (fn: () => Promise<any>) => {
    try {
      setError(null);
      return await fn();
    } catch (err) {
      setError(err as Error);
      // Log to monitoring service
      console.error("Operation failed:", err);
      throw err;
    }
  }, []);

  return { error, execute };
}
```

## Migration Strategy

### Phase 1: Audit Current State Usage

1. Identify all useState instances storing business data
2. Map out all Zustand stores with mixed concerns
3. Document component prop drilling issues

### Phase 2: Setup Convex Schema

1. Define schema for all business entities
2. Create necessary indexes
3. Implement authentication

### Phase 3: Migrate Business Data

1. Move data from useState to Convex queries
2. Replace Zustand business data with Convex
3. Create custom hooks for each resource

### Phase 4: Refactor UI State

1. Consolidate UI-only Zustand stores
2. Remove unnecessary useState instances
3. Implement proper optimistic updates

### Phase 5: Testing & Optimization

1. Add error boundaries
2. Implement loading states
3. Optimize query performance

## Testing Guidelines

### Unit Testing Custom Hooks

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { ConvexProvider } from "convex/react";
import { useProjects } from "./useProjects";

describe("useProjects", () => {
  it("should load projects", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjects(), {
      wrapper: ConvexProvider,
    });

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.projects).toBeDefined();
  });

  it("should handle optimistic updates", async () => {
    const { result } = renderHook(() => useProjects());

    act(() => {
      result.current.createProject({ name: "Test Project" });
    });

    // Should immediately show optimistic update
    expect(result.current.projects).toContainEqual(
      expect.objectContaining({ name: "Test Project" }),
    );
  });
});
```

### Integration Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { ProjectList } from './ProjectList';
import { ConvexProvider } from 'convex/react';

describe('ProjectList Integration', () => {
  it('should display projects from server', async () => {
    render(
      <ConvexProvider>
        <ProjectList />
      </ConvexProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### 1. Query Optimization

```typescript
// Use indexes for efficient queries
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    // This uses the "by_status" index
    return await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});
```

### 2. Pagination

```typescript
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### 3. Selective Subscriptions

```typescript
// Only subscribe to specific fields
export function useProjectName(projectId: string) {
  const project = useQuery(api.projects.getName, { id: projectId });
  return project?.name;
}
```

### 4. Memoization

```typescript
export function useFilteredProjects(filter: string) {
  const projects = useQuery(api.projects.list);

  // Memoize expensive computations
  const filtered = useMemo(() => {
    if (!projects || !filter) return projects ?? [];

    return projects.filter((p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [projects, filter]);

  return filtered;
}
```

## Common Pitfalls & Solutions

### Pitfall 1: State Duplication

❌ **Wrong:**

```typescript
function BadComponent() {
  const serverData = useQuery(api.data.get);
  const [localData, setLocalData] = useState(serverData);
  // Creates sync issues
}
```

✅ **Correct:**

```typescript
function GoodComponent() {
  const serverData = useQuery(api.data.get);
  const [localEdits, setLocalEdits] = useState({});
  const mergedData = { ...serverData, ...localEdits };
}
```

### Pitfall 2: Unnecessary Re-renders

❌ **Wrong:**

```typescript
function BadComponent() {
  const allProjects = useQuery(api.projects.list);
  // Re-renders on any project change
}
```

✅ **Correct:**

```typescript
function GoodComponent() {
  const projectCount = useQuery(api.projects.count);
  // Only re-renders when count changes
}
```

### Pitfall 3: Missing Error Handling

❌ **Wrong:**

```typescript
async function handleSubmit() {
  await createProject(data); // No error handling
  navigate("/projects");
}
```

✅ **Correct:**

```typescript
async function handleSubmit() {
  try {
    await createProject(data);
    navigate("/projects");
  } catch (error) {
    showToast({ type: "error", message: "Failed to create project" });
  }
}
```

## Conclusion

This state management architecture provides:

1. **Clear separation** between server and client state
2. **Predictable data flow** with unidirectional updates
3. **Optimal performance** through proper caching and subscriptions
4. **Developer experience** with type safety and clear patterns
5. **Scalability** through modular, domain-driven design

By following these guidelines, AURA maintains a clean, efficient, and maintainable state management system that scales with the application's growth.
