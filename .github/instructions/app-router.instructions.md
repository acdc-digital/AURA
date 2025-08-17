---
applyTo: "AURA/app/**/*.{ts,tsx}"
---

# Next.js App Router Instructions

## App Router Principles
- This project uses Next.js App Router - never suggest using the pages router or provide code using the pages router
- Use React Server Components by default for better performance
- Minimize 'use client', 'useEffect', and 'setState' - favor React Server Components (RSC)
- Wrap client components in Suspense with fallback
- Add 'use client' only when client-side features are required

## Page and Layout Structure
- Implement proper loading states with loading.tsx files
- Create error boundaries with error.tsx files
- Use proper metadata for SEO optimization
- Follow the user's requirements carefully & to the letter
- Leave NO todo's, placeholders or missing pieces

## Routing & Performance
- Use Next.js App Router patterns exclusively
- Use dynamic routes with proper TypeScript typing
- Leverage parallel and intercepting routes when appropriate
- Use dynamic loading for non-critical components
- Implement proper code splitting and caching strategies

## Data Fetching
- Prefer Server Components for initial data loading
- Use Suspense boundaries for better UX
- Handle loading and error states gracefully
- Always write correct, up to date, bug free, fully functional and working code

## Image Optimization
- Use Next.js Image component for all images
- Optimize images: use WebP format, include size data, implement lazy loading
- Implement proper bundle size optimization
