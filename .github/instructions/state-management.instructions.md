# State Management Instructions

## Core State Management Philosophy

AURA follows a **domain-driven, layered state architecture** that separates concerns and optimizes for real-time collaboration, performance, and maintainability.

### State Architecture Layers

#### 1. Server State (Convex)

**Single Source of Truth** - All persistent data lives in Convex

- **Projects**: CRUD operations, real-time collaboration
- **Files**: Content, metadata, version history
- **User Data**: Profiles, preferences, settings
- **Social Media**: Posts, analytics, scheduling
- **Financial Data**: Transactions, budgets, reports

#### 2. Client/UI State (Zustand)

**Ephemeral UI State** - Local interface state that doesn't need persistence

- **Editor State**: Open tabs, active tab, scroll positions
- **UI Preferences**: Sidebar collapsed, panel visibility, layouts
- **Form State**: Temporary input values, validation states
- **Optimistic Updates**: Local cache for pending server operations

#### 3. Authentication State (Clerk)

**User Session Management** - Handled by Clerk with Convex integration

- **User Identity**: Profile, email, authentication status
- **Permissions**: Role-based access control
- **Session**: Login state, token management

## State Management Rules

### Rule 1: Server State Dominance

```typescript
// ✅ CORRECT: Use Convex for all persistent data
const projects = useQuery(api.projects.list);
const updateProject = useMutation(api.projects.update);

// ❌ INCORRECT: Don't use useState for server data
const [projects, setProjects] = useState([]);
```

### Rule 2: Minimal Client State

```typescript
// ✅ CORRECT: Only UI-specific state in client stores
interface EditorUIStore {
  activeTabId: string | null;
  openTabs: Map<string, TabMetadata>;
  sidebarCollapsed: boolean;
}

// ❌ INCORRECT: Don't mix business data with UI state
interface BadStore {
  activeTabId: string;
  projectData: Project; // This belongs in Convex!
  userFiles: File[]; // This belongs in Convex!
}
```

### Rule 3: Optimistic Updates Pattern

```typescript
// ✅ CORRECT: Optimistic updates with rollback
const useProjectUpdate = (projectId: string) => {
  const updateMutation = useMutation(api.projects.update);
  const { addOptimisticUpdate, removeOptimisticUpdate } = useProjectStore();

  const update = async (data: Partial<Project>) => {
    // 1. Optimistic update
    addOptimisticUpdate(projectId, data);

    try {
      // 2. Server update
      await updateMutation({ id: projectId, ...data });
      // 3. Success - Convex will update automatically
      removeOptimisticUpdate(projectId);
    } catch (error) {
      // 4. Rollback on error
      removeOptimisticUpdate(projectId);
      throw error;
    }
  };

  return { update };
};
```

### Rule 4: Domain-Driven Store Structure

```typescript
// ✅ CORRECT: Separate stores by domain
// stores/ui/editor.ts - Pure UI state
export const useEditorUIStore = create<EditorUIStore>(...);

// stores/ui/sidebar.ts - Pure UI state
export const useSidebarStore = create<SidebarStore>(...);

// stores/domain/project.ts - Domain logic + optimistic updates
export const useProjectStore = create<ProjectStore>(...);
```

### Rule 5: Component State Hierarchy

```typescript
// Component state priority (use in this order):
// 1. Server state (Convex hooks)
// 2. Global UI state (Zustand stores)
// 3. Local component state (useState)
// 4. Derived state (useMemo)

export function DashEditor() {
  // 1. Server state first
  const projects = useQuery(api.projects.list);
  const activeProject = useQuery(api.projects.get, { id: activeProjectId });

  // 2. Global UI state
  const { activeTabId, openTab, closeTab } = useEditorUIStore();

  // 3. Local component state (minimal)
  const [isDragging, setIsDragging] = useState(false);

  // 4. Derived state
  const sortedTabs = useMemo(
    () => Array.from(openTabs.values()).sort(byLastAccessed),
    [openTabs],
  );
}
```

### Rule 6: Type Safety Throughout

```typescript
// ✅ CORRECT: Use Convex validators and TypeScript interfaces
import { v } from "convex/values";
import type { Doc, Id } from "../convex/_generated/dataModel";

// Server validation
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, args);
  },
});

// Client types derived from Convex
type Project = Doc<"projects">;
type ProjectId = Id<"projects">;
```

### Rule 7: Real-time Reactivity

```typescript
// ✅ CORRECT: Let Convex handle real-time updates
export function ProjectList() {
  // Automatically updates when data changes on server
  const projects = useQuery(api.projects.list);

  // No manual state synchronization needed
  return (
    <div>
      {projects?.map(project => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}
```

### Rule 8: Error Boundaries and Loading States

```typescript
// ✅ CORRECT: Handle loading and error states consistently
export function useProjectWithState(projectId: string) {
  const project = useQuery(api.projects.get, { id: projectId });
  const updateMutation = useMutation(api.projects.update);

  return {
    project,
    isLoading: project === undefined,
    error: project === null ? new Error("Project not found") : null,
    update: updateMutation,
    isUpdating: updateMutation.isLoading,
  };
}
```

## Anti-Patterns to Avoid

### ❌ Don't: Mix Server and Client State

```typescript
// Bad - mixing concerns
const [projects, setProjects] = useState([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  fetchProjects().then((data) => {
    setProjects(data);
    setIsLoading(false);
  });
}, []);
```

### ❌ Don't: Duplicate Server Data in Client State

```typescript
// Bad - duplicating server data
const projects = useQuery(api.projects.list);
const [localProjects, setLocalProjects] = useState(projects);
```

### ❌ Don't: Use useState for Persistent Data

```typescript
// Bad - losing data on refresh
const [userNotes, setUserNotes] = useState("");
```

### ❌ Don't: Complex State Logic in Components

```typescript
// Bad - business logic in component
export function ProjectEditor({ projectId }) {
  const [project, setProject] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  // Complex save logic in component...
}
```

## Implementation Guidelines

### Custom Hooks Pattern

```typescript
// ✅ Create domain-specific hooks
export function useProject(projectId: string) {
  const project = useQuery(api.projects.get, { id: projectId });
  const updateMutation = useMutation(api.projects.update);
  const deleteMutation = useMutation(api.projects.delete);

  const update = async (data: Partial<Project>) => {
    await updateMutation({ id: projectId, ...data });
  };

  const remove = async () => {
    await deleteMutation({ id: projectId });
  };

  return {
    project,
    update,
    remove,
    isLoading: project === undefined,
    error: project === null,
  };
}
```

### Store Organization

```typescript
// stores/index.ts - Central exports
export { useEditorUIStore } from "./ui/editor";
export { useSidebarStore } from "./ui/sidebar";
export { useProjectStore } from "./domain/project";

// Clear separation of concerns
// ui/ - Pure UI state stores
// domain/ - Business logic + optimistic updates
```

## Testing Strategy

### Server State Testing

```typescript
// Test Convex functions in isolation
test("updates project title", async () => {
  const projectId = await ctx.db.insert("projects", { title: "Old Title" });
  await updateProject(ctx, { id: projectId, title: "New Title" });

  const updated = await ctx.db.get(projectId);
  expect(updated.title).toBe("New Title");
});
```

### Client State Testing

```typescript
// Test Zustand stores with mock data
test("opens and closes editor tabs", () => {
  const store = useEditorUIStore.getState();

  store.openTab("file-1");
  expect(store.openTabs.has("file-1")).toBe(true);

  store.closeTab("file-1");
  expect(store.openTabs.has("file-1")).toBe(false);
});
```

These rules ensure maintainable, performant, and type-safe state management throughout the AURA platform.
