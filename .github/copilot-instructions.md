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
