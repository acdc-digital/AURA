# State Management Audit System

## Overview

The AURA State Management Audit System provides automated verification that our codebase follows unified state management principles. This system ensures compliance with our architectural decisions and catches state management violations before they reach production.

## Quick Start

Run the state audit at any time:

```bash
npm run audit:state
```

## State Management Principles

Our audit system enforces these core principles:

### 1. **Server State (Convex) = Source of Truth**
- All persistent data must be stored in Convex
- Business entities (users, projects, files, documents) belong in the database
- Never duplicate server state in client stores

### 2. **Client State (Zustand) = UI-only Concerns**
- Zustand stores are for UI state only (sidebar, modals, themes, etc.)
- No API calls or business logic in Zustand stores
- UI state should be ephemeral and non-critical

### 3. **No Business Data in Zustand Stores**
- Never store `projects[]`, `users[]`, `files[]` in Zustand
- Avoid fields like `setProjects()`, `fetchUsers()`, `data[]`
- Focus on UI concerns: `activePanel`, `isModalOpen`, `theme`

### 4. **Use Custom Hooks for Convex Operations**
- Wrap Convex queries/mutations in custom hooks
- Avoid direct `useQuery(api.*)` calls in components
- Custom hooks should handle loading states, error handling

### 5. **Component State Only for Ephemeral UI**
- `useState` for temporary interactions (form inputs, dropdowns)
- Never `useState` for business data that needs persistence
- Prefer React Server Components when possible

## Audit Results

### ✅ **Passing Audit**
```
🔍 STATE MANAGEMENT AUDIT RESULTS
==================================================

✅ AUDIT PASSED!
   Files Audited: 26
   No critical violations found.
```

### ❌ **Failing Audit**
```
🔍 STATE MANAGEMENT AUDIT RESULTS
==================================================

🔴 AUDIT FAILED!
   Files Audited: 26
   Errors: 2
   Warnings: 1

📋 VIOLATIONS BY PRINCIPLE:
------------------------------

Rule 4: Custom Hooks Pattern
  Errors: 1, Warnings: 0
  ❌ app/dashboard/page.tsx:15 - Direct Convex API usage in component. Use custom hooks instead.

Rule 1: Convex for Persistent Data
  Errors: 1, Warnings: 0  
  ❌ components/UserList.tsx:8 - Business data stored in useState. Use Convex for persistent data.
```

## Violation Types

### **Error Violations (Fail Build)**
- Direct Convex API usage in components
- Business data in `useState`
- Business data in Zustand stores
- API calls in Zustand stores
- Missing `"use client"` for client components

### **Warning Violations (Non-blocking)**
- Missing TypeScript interfaces in stores
- Too many Convex calls suggesting need for custom hooks
- Potential business data patterns (requires manual review)

## Fixing Common Violations

### **Direct Convex Usage → Custom Hook**

❌ **Before:**
```tsx
function ProjectList() {
  const projects = useQuery(api.projects.list, {});
  const createProject = useMutation(api.projects.create);
  // ...
}
```

✅ **After:**
```tsx
// lib/hooks/useProjects.ts
export function useProjects() {
  const projects = useQuery(api.projects.list, {});
  const createProject = useMutation(api.projects.create);
  
  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
    createProject,
  };
}

// Component
function ProjectList() {
  const { projects, isLoading, createProject } = useProjects();
  // ...
}
```

### **Business Data in useState → Convex**

❌ **Before:**
```tsx
function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  // ...
}
```

✅ **After:**
```tsx
function Dashboard() {
  const { projects } = useProjects();
  const { user } = useCurrentUser();
  // ...
}
```

### **Business Data in Zustand → Convex**

❌ **Before:**
```tsx
const useAppStore = create((set) => ({
  projects: [],
  user: null,
  setProjects: (projects) => set({ projects }),
  fetchProjects: async () => {
    // API call...
  }
}));
```

✅ **After:**
```tsx
// Move to Convex + custom hooks
const useUIStore = create((set) => ({
  activePanel: 'explorer',
  sidebarCollapsed: false,
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
```

## File Structure

```
app/tests/
├── state-audit.ts          # TypeScript implementation
├── state-audit.test.ts     # Jest test wrapper
└── run-audit.js           # Node.js CLI runner
```

## Integration

### **CI/CD Pipeline**
Add to your GitHub Actions:

```yaml
- name: State Management Audit
  run: npm run audit:state
```

### **Pre-commit Hook**
Add to `.husky/pre-commit`:

```bash
npm run audit:state
```

### **Development Workflow**
Run audit before:
- Creating pull requests
- Adding new state management
- Refactoring components
- Code reviews

## Customization

### **Add Custom Business Data Patterns**
Edit `run-audit.js`:

```javascript
const businessDataPatterns = [
  /projects?/i,
  /users?/i,
  /customEntity/i,  // Add your patterns
];
```

### **Add UI Exclusions**
Update `isUIRelated()`:

```javascript
const uiPatterns = [
  /modal/i,
  /sidebar/i,
  /customUIPattern/i,  // Add your UI patterns
];
```

## Troubleshooting

### **False Positives**
If the audit incorrectly flags legitimate UI state:
1. Check if the pattern should be in `uiPatterns`
2. Rename variables to be more UI-specific
3. Add comments explaining the UI nature

### **Performance**
The audit scans all `.tsx` and store `.ts` files. For large codebases:
- Exclude test files and build directories
- Run audit on specific file patterns
- Use in focused CI jobs

### **TypeScript Errors**
If the audit script has TypeScript issues:
- Use the Node.js runner (`run-audit.js`) instead
- Update TypeScript paths if project structure changes

## Success Metrics

A passing audit indicates:
- ✅ Clean separation between server and client state
- ✅ Proper use of custom hooks for data fetching
- ✅ UI-focused Zustand stores
- ✅ No business logic in client stores
- ✅ Consistent state management patterns

This system helps maintain architectural consistency as the team and codebase grow.
