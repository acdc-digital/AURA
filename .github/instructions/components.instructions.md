---
applyTo: "AURA/components/**/*.{ts,tsx}"
---

# Component Development Instructions

## Component Standards
- Use React Server Components by default
- Minimize 'use client', 'useEffect', and 'setState' - favor React Server Components (RSC)
- Wrap client components in Suspense with fallback
- Add 'use client' directive only when client-side features are needed
- Use functional components with TypeScript interfaces
- Favor named exports for components

## Component Structure
- Import React first, then Next.js components, then external libraries, then internal imports
- Define TypeScript interfaces before the component with descriptive names (e.g., `UserProfileProps`)
- Use TypeScript interfaces over types
- Include proper prop validation and typing
- Leave NO todo's, placeholders or missing pieces

## Styling with Shadcn UI & Tailwind
- Use Shadcn UI and Radix UI for components and styling
- Use Tailwind CSS classes exclusively with mobile-first approach
- Follow mobile-first responsive design patterns
- Use semantic HTML elements
- Include proper ARIA attributes for accessibility
- Use CSS variables for theme values

## Performance
- Use dynamic loading for non-critical components
- Implement proper key props for lists
- Avoid creating objects or functions inside render methods
- Focus on readability over being performant
