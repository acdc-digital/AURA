# Convex LLM Guidelines & Best Practices

> This file incorporates official Convex guidance for LLMs from https://www.convex.dev/llms.txt and comprehensive documentation insights.

## Core Convex Concepts

### What is Convex?
Convex is a reactive database with TypeScript queries that provides:
- **Real-time synchronization** across all clients
- **TypeScript end-to-end type safety** 
- **Serverless functions** (queries, mutations, actions)
- **Built-in authentication** integration
- **File storage** and **vector search**
- **Optimistic concurrency control** for data consistency

### The Convex Philosophy (Zen of Convex)
- **Reactive by default**: Data changes automatically propagate to all clients
- **Type-safe**: Full TypeScript support from database to frontend
- **Simple**: Minimal configuration, maximum developer experience
- **Scalable**: Built to handle production workloads

## Architecture Overview

### Function Types
- **Queries**: Read data, cached and reactive (`query`)
- **Mutations**: Write data, transactional (`mutation`) 
- **Actions**: Call external APIs, non-transactional (`action`)
- **Internal Functions**: Private functions callable only by other Convex functions

### Data Flow
```
Frontend ↔ Convex Client ↔ Convex Backend ↔ Database
                                    ↓
                            External APIs (via Actions)
```

## Development Workflow Best Practices

### 1. Schema-First Development
- Always define schemas in `convex/schema.ts`
- Use proper validation with `v.*` validators
- Design for relationships using document IDs
- Plan indexes for query performance

### 2. Function Organization
- Use file-based routing thoughtfully
- Separate public and internal functions
- Group related functionality in modules
- Follow naming conventions consistently

### 3. Type Safety
- Leverage generated types from `_generated/`
- Use strict TypeScript configuration
- Validate all function arguments and returns
- Handle errors gracefully with proper types

### 4. Performance Optimization
- Use indexes instead of filters
- Implement pagination for large datasets
- Leverage real-time subscriptions efficiently
- Cache expensive operations appropriately

## Integration Patterns

### Next.js App Router (Primary Target)
- Use Server Components by default
- Implement proper loading states
- Handle authentication server-side
- Optimize for SEO with proper metadata

### Authentication
- Integrate with Clerk, Auth0, or custom providers
- Store user data in Convex database
- Handle authentication in functions properly
- Debug authentication issues systematically

### Real-time Features
- Subscribe to data changes automatically
- Handle optimistic updates in React
- Implement proper error boundaries
- Design for offline scenarios

## Common Patterns & Solutions

### Data Modeling
- Use document IDs for relationships
- Implement proper pagination
- Design schemas for query patterns
- Plan for data migration strategies

### Error Handling
- Use `ConvexError` for application errors
- Implement proper retry logic
- Log errors for debugging
- Provide meaningful error messages

### Testing
- Use `convex-test` for unit testing
- Test with local Convex backend
- Implement CI/CD testing
- Mock external dependencies

### Production Deployment
- Configure environment variables
- Set up monitoring and logging
- Implement proper backup strategies
- Plan for scaling and performance

## Advanced Features

### Components
- Build reusable functionality blocks
- Share components across projects
- Implement proper component architecture
- Document component interfaces

### AI & Search
- Implement full-text search
- Use vector search for embeddings
- Build AI agents with proper context
- Optimize search performance

### File Storage
- Store and serve files efficiently
- Handle file metadata properly
- Implement proper access controls
- Optimize for different file types

This comprehensive guide should inform all Convex-related development decisions and ensure alignment with official best practices and architectural patterns.
