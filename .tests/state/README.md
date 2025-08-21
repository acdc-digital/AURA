# State Management Audit System

## Overview

The AURA State Management Audit System provides automated verification that our codebase follows unified state management principles. This system ensures compliance with our architectural decisions and catches state management violations before they reach production.

## 🎯 Objective

A comprehensive state audit test system that provides clear success/fail results for our unified state management principles.

## Quick Start

Run the state audit at any time:

```bash
pnpm state
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
- Never use `useState` for persistent business data

### 6. **Authentication Synchronization**

- Validates proper Clerk/Convex user synchronization
- Ensures AuthSync component is implemented
- Checks for user hook bridge between Clerk and Convex

## Audit Workflow Breakdown

### 1. Automated State Auditor

- **File**: `app/tests/state-audit.ts` (TypeScript implementation)
- **Command**: `pnpm state`

### 2. Comprehensive Validation Categories

- 🔐 **Authentication Synchronization** - Validates Clerk/Convex user sync
- 🌊 **Data Flow Architecture** - Ensures Convex as source of truth
- 📊 **State Separation** - Enforces business data vs UI state separation
- 🔒 **Type Safety** - Validates TypeScript compliance
- ⚡ **Performance** - Checks for optimization patterns

### 3. Enhanced Audit Categories

- 🔐 **Authentication Synchronization** - Clerk/Convex integration
- 🌊 **Data Flow Architecture** - Convex as source of truth
- 📊 **State Separation** - Business data vs UI state
- 🔒 **Type Safety** - TypeScript compliance
- ⚡ **Performance** - Optimization patterns

### 4. Architecture Scoring System

Each category receives a score out of 100, with an overall architecture score:

- 🔐 Auth Sync: X/100
- 🌊 Data Flow: X/100
- 🎯 Overall: X/100

### 5. Clear Success/Fail Output

```bash
# ✅ Success
============================================================
🔍 ENHANCED STATE MANAGEMENT AUDIT RESULTS
============================================================

✅ COMPREHENSIVE AUDIT PASSED!

📊 ARCHITECTURE SCORES:
   🔐 Auth Sync: 100/100
   🌊 Data Flow: 100/100
   🎯 Overall: 100/100

📋 SUMMARY:
   Files Audited: 32
   Errors: 0
   Warnings: 0

🔐 AUTHENTICATION SYNCHRONIZATION:
   AuthSync Component: ✅
   Layout Integration: ✅
   User Hook Bridge: ✅
   Convex Integration: ✅

🌊 DATA FLOW ARCHITECTURE:
   Convex as Source of Truth: ✅
   Zustand UI-Only: ✅
   Custom Hooks Pattern: ✅
   No Direct Convex in Components: ✅
============================================================

# ❌ Failure
🔴 AUDIT FAILED - Critical Issues Found

📊 ARCHITECTURE SCORES:
   🔐 Auth Sync: 100/100
   🌊 Data Flow: 75/100
   🎯 Overall: 88/100

🚨 VIOLATIONS BY CATEGORY:
   STATE-SEPARATION: 2 errors, 0 warnings
     ❌ app/components/UserProfile.tsx:28 - Business data in useState
     ❌ app/components/Navigator.tsx:6 - Business data in useState
```

## 🛠️ Current Status: ✅ PASSING (100/100)

The audit currently passes with **perfect scores** across all categories:

- 📁 **23 component files** (.tsx)
- 🏪 **4 store files** (.ts)
- 🪝 **2 hook files** (.ts)
- 🗄️ **3 Convex files** (.ts)

## Maintenance

- Only one test file per function is kept in this directory.
- The README is the single source of truth and justification for our state test system.

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
  },
}));
```

✅ **After:**

```tsx
// Move to Convex + custom hooks
const useUIStore = create((set) => ({
  activePanel: "explorer",
  sidebarCollapsed: false,
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
```

## File Structure

```
app/tests/
├── state-audit.ts          # Enhanced TypeScript audit implementation
└── README.md              # Complete documentation and justification
```

## Integration

### **CI/CD Pipeline**

Add to your GitHub Actions:

```yaml
- name: State Management Audit
  run: pnpm state
```

### **Pre-commit Hook**

Add to `.husky/pre-commit`:

```bash
pnpm state
```

### **Development Workflow**

Run audit before:

- Creating pull requests
- Adding new state management
- Refactoring components
- Code reviews

## Customization

### **Add Custom Business Data Patterns**

Edit `state-audit.ts` in the `containsBusinessData()` method:

```typescript
private containsBusinessData(line: string): boolean {
  const businessDataPatterns = [
    /\bprojects?\b/i, /\busers?\b/i, /\bfiles?\b/i,
    /\bdocuments?\b/i, /\bentities\b/i, /\bmodels?\b/i,
    /\brecords?\b/i, /\bprofile\b/i, /\baccount\b/i,
    /\bsettings\b/i, /\bpreferences\b/i, /\bdata\b/i,
    /\bcustomEntity\b/i  // Add your patterns
  ];
  return businessDataPatterns.some(pattern => pattern.test(line));
}
```

### **Adjust Architecture Scoring**

Update scoring weights in the `StateAuditor` class methods:

```typescript
private calculateOverallScore(authScore: number, dataFlowScore: number): number {
  return Math.round((authScore + dataFlowScore) / 2);
}
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

A **100/100** passing audit indicates:

- ✅ **Authentication Sync (100/100)** - Perfect Clerk/Convex integration
  - AuthSync component properly implemented
  - User hook bridge functioning correctly
  - Layout integration complete
- ✅ **Data Flow Architecture (100/100)** - Clean state management
  - Convex as single source of truth for business data
  - Zustand limited to UI-only concerns
  - Custom hooks wrapping Convex operations
  - No direct Convex calls in components
- ✅ **State Separation** - No business data in useState or Zustand
- ✅ **Type Safety** - Full TypeScript compliance
- ✅ **Performance** - Optimized patterns throughout

This enhanced audit system ensures architectural consistency and helps maintain high code quality as the team and codebase grow.
