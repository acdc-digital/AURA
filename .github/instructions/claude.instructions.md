# Claude Development Instructions for AURA

## About Claude Integration
These instructions are specifically designed for Claude Sonnet 4 to provide optimal development assistance for the AURA project. Claude should follow these guidelines to maintain consistency with the project's architecture and development standards.

## Project Context for Claude
AURA is an audience control and management platform designed to help content creators broadcast content across multiple platforms. The project uses a modern tech stack with emphasis on real-time functionality and type safety.

## Claude-Specific Development Approach

### 1. Code Analysis & Problem Solving
- **Always analyze the full context** before making suggestions
- **Think step-by-step** through complex problems
- **Provide comprehensive solutions** rather than partial fixes
- **Explain the reasoning** behind architectural decisions
- **Consider edge cases** and error scenarios

### 2. Code Generation Philosophy
- **Write complete, production-ready code** - no placeholders or TODOs
- **Implement full functionality** as requested
- **Include proper error handling** in all functions
- **Add comprehensive TypeScript types** for everything
- **Follow the project's established patterns** consistently

### 3. Documentation & Communication
- **Explain complex concepts clearly** with examples
- **Provide context** for architectural decisions
- **Suggest improvements** when patterns could be enhanced
- **Reference official documentation** when applicable
- **Break down large changes** into understandable steps

## Tech Stack Expertise Expected

### Next.js App Router (Primary Framework)
- **Server Components first** - use client components only when necessary
- **Proper data fetching** with server-side rendering
- **Optimal performance** with image optimization and caching
- **SEO optimization** with proper metadata handling
- **Error boundaries** and loading states

### Convex Backend (Database & Functions)
- **Reactive patterns** for real-time updates
- **Type-safe database operations** with proper validation
- **Efficient query patterns** using indexes instead of filters
- **Proper function organization** (queries, mutations, actions)
- **Authentication integration** with Clerk

### TypeScript Development
- **Strict type checking** enabled
- **Interface-first design** over type aliases
- **Proper generic usage** for reusable components
- **Utility types** for complex transformations
- **No `any` types** - use `unknown` or proper typing

### Styling & UI Framework
- **Tailwind CSS** with mobile-first approach
- **Shadcn UI components** as primary component library
- **Radix UI primitives** for accessibility
- **Consistent design system** implementation
- **Responsive design patterns**

## Development Workflow for Claude

### 1. Before Writing Code
- **Understand the user's complete requirement**
- **Review existing code patterns** in the project
- **Check for similar implementations** already present
- **Plan the solution architecture** before coding
- **Consider the impact** on other parts of the system

### 2. Code Implementation Standards
- **Follow existing file and folder naming conventions**
- **Use established import patterns**
- **Implement proper error boundaries**
- **Add appropriate loading states**
- **Include accessibility features**

### 3. Testing & Validation Approach
- **Suggest testing strategies** for new features
- **Consider edge cases** in implementation
- **Validate TypeScript types** are working correctly
- **Ensure real-time updates** work as expected
- **Test authentication flows** when applicable

## AURA-Specific Patterns

### Audience Management Features
- **Multi-platform synchronization** patterns
- **Real-time audience engagement** tracking
- **Content scheduling** and automation
- **Analytics and reporting** functionality
- **Permission and access control** systems

### Content Broadcasting
- **Cross-platform content distribution**
- **Content versioning** and management
- **Media handling** and optimization
- **Engagement tracking** across platforms
- **Automated posting** and scheduling

### User Experience Priorities
- **Real-time feedback** and updates
- **Responsive design** for all devices
- **Intuitive navigation** patterns
- **Fast loading times** and optimization
- **Accessibility compliance**

## Error Handling & Debugging

### Claude's Debugging Approach
- **Provide comprehensive error analysis**
- **Suggest multiple solution approaches**
- **Include debugging steps** for developers
- **Reference documentation** for complex issues
- **Explain potential causes** of problems

### Production Considerations
- **Security best practices** implementation
- **Performance optimization** strategies
- **Error monitoring** and logging
- **Graceful degradation** patterns
- **Rate limiting** and abuse prevention

## Integration Guidelines

### Working with Existing Tools
- **Respect existing Copilot instructions**
- **Complement rather than conflict** with other AI tools
- **Maintain consistency** with established patterns
- **Reference existing documentation** appropriately
- **Suggest improvements** to current workflows

### Claude-Specific Strengths
- **Complex problem decomposition**
- **Architectural decision making**
- **Code review and optimization**
- **Documentation and explanation**
- **Integration pattern suggestions**

## Quality Assurance

### Code Quality Standards
- **All code must be TypeScript compliant**
- **Follow ESLint and Prettier configurations**
- **Implement proper component composition**
- **Use appropriate design patterns**
- **Include comprehensive error handling**

### Performance Standards
- **Optimize for Core Web Vitals**
- **Implement proper caching strategies**
- **Use efficient data fetching patterns**
- **Minimize bundle size impact**
- **Ensure fast time-to-interactive**

## Communication Style

### With Developers
- **Be concise but comprehensive**
- **Provide actionable suggestions**
- **Explain the "why" behind recommendations**
- **Offer alternative approaches** when appropriate
- **Ask clarifying questions** when requirements are unclear

### Code Comments & Documentation
- **Write self-documenting code** with clear naming
- **Add JSDoc comments** for complex functions
- **Include inline comments** for business logic
- **Document API interfaces** thoroughly
- **Explain architectural decisions**

Remember: The goal is to help build a production-ready audience management platform that serves content creators effectively while maintaining high code quality and developer experience.
