# AURA Agent Prompts System

## Overview
This document describes the centralized prompts system for AURA's agent circle, designed to maintain consistent voice, personality, and capabilities across all chat agents.

## Structure

### Core Files
- **`convex/prompts.ts`** - Centralized prompt definitions and shared components
- **Agent Implementation Files** - Import and use prompts from the centralized file

### Prompt Architecture

```typescript
// Shared foundation across all agents
AURA_CORE_VOICE          // Personality traits and communication style
AURA_CORE_CAPABILITIES   // Platform integration and technical context

// Individual agent prompts
ORCHESTRATOR_SYSTEM_PROMPT  // Main development assistant
ONBOARDING_SYSTEM_PROMPT   // New user guidance specialist

// Reusable prompt fragments
PROMPT_FRAGMENTS           // Common scenarios and responses
```

## Design Principles

### 1. Consistent Voice
All agents share core personality traits:
- Professional yet approachable
- Thoughtful and methodical
- Encouraging and supportive
- Clear and actionable
- Respectful of user autonomy

### 2. Modular Architecture
- **Core Voice**: Shared personality foundation
- **Core Capabilities**: Platform integration context
- **Agent-Specific**: Specialized role definitions
- **Fragments**: Reusable response patterns

### 3. Maintainability
- Single source of truth for voice and personality
- Easy to update across all agents simultaneously
- Clear separation between shared and agent-specific content
- Token estimation for cost management

## Usage Patterns

### Adding New Agents
1. Define agent-specific role and responsibilities
2. Combine with `AURA_CORE_VOICE` and `AURA_CORE_CAPABILITIES`
3. Add any specialized guidelines or constraints
4. Export as `[AGENT_NAME]_SYSTEM_PROMPT`

### Updating Existing Prompts
1. Modify shared components to affect all agents
2. Update specific agent prompts for targeted changes
3. Use prompt fragments for common scenario updates
4. Test across all affected agents

### Example Implementation
```typescript
// In agent implementation file
import { ORCHESTRATOR_SYSTEM_PROMPT } from "./prompts";

// Use in Anthropic API call
const response = await anthropic.messages.create({
  model: "claude-3-7-sonnet-20250219",
  system: ORCHESTRATOR_SYSTEM_PROMPT,
  messages: conversationHistory,
});
```

## Agent Responsibilities

### Orchestrator Agent
- Primary development assistant
- Complex technical challenges
- Project planning and architecture
- Code review and optimization
- Integration support
- Troubleshooting and debugging

### Onboarding Agent
- New user welcome and guidance
- Brand/product identity creation
- Basic project setup
- Essential information collection
- First-time user experience optimization

### Future Agents
The system is designed to easily accommodate new agents by following the established pattern of combining shared voice components with agent-specific roles.

## Best Practices

### Voice Consistency
- Always use shared core voice components
- Maintain professional yet approachable tone
- Focus on practical, actionable guidance
- Respect user autonomy and preferences

### Prompt Development
- Test prompts across different user scenarios
- Monitor token usage and optimize for efficiency
- Keep agent roles clearly differentiated
- Update documentation when adding new components

### Quality Assurance
- Regularly review agent responses for voice consistency
- Ensure prompts align with AURA's brand values
- Test edge cases and error scenarios
- Gather user feedback on agent interactions

## Token Management

The system includes token estimation metadata to help manage API costs:
- `ORCHESTRATOR_ESTIMATED_TOKENS`: ~450 tokens
- `ONBOARDING_ESTIMATED_TOKENS`: ~380 tokens
- Individual components tracked separately

## Future Enhancements

Potential improvements to consider:
- Dynamic prompt adaptation based on user context
- A/B testing framework for prompt optimization
- Multi-language support for international users
- Agent personality customization options
- Advanced prompt templating system
