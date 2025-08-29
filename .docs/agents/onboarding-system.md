# AURA Onboarding System

## Overview

The AURA onboarding system provides a comprehensive, conversational workflow for collecting user brand information and generating professional brand guidelines. The system is designed to be user-friendly, intelligent, and thorough.

## Architecture

### Database Schema

**`onboardingResponses` Table:**
- Stores all user responses throughout the onboarding workflow
- Tracks progress and completion status
- Links to generated brand guidelines and projects
- Supports analytics and workflow optimization

### Key Components

1. **Onboarding Agent** (`convex/onboarding.ts`)
   - Intelligent conversational AI for guiding users
   - Extracts information from natural language responses
   - Contextual prompting based on current progress
   - Brand guidelines generation upon completion

2. **Enhanced Hook** (`lib/hooks/useOnboarding.ts`)
   - React hook for managing onboarding state
   - Helper methods for updating specific response types
   - Integration with user authentication and session management

3. **Comprehensive Workflow** (8 Core Steps)
   - Brand Name Collection
   - Brand Description & Story
   - Industry & Market Context
   - Target Audience Analysis
   - Brand Personality Traits
   - Core Values Definition
   - Goals & Objectives
   - Visual & Style Preferences

## Workflow Steps

### 1. Welcome & Brand Name
- Initial greeting and platform introduction
- Collection of brand/product/service name
- Skip option always available

### 2. Brand Description
- Detailed brand story and description
- Mission, vision, and core purpose
- Business model and offerings

### 3. Industry Context
- Industry categorization
- Market positioning
- Competitive landscape awareness

### 4. Target Audience
- Primary audience demographics
- Secondary audience segments
- Psychographics and behavior patterns

### 5. Brand Personality
- Personality trait extraction
- Brand archetype identification
- Voice and tone characteristics

### 6. Brand Values
- Core principles and beliefs
- Value proposition elements
- Ethical and cultural considerations

### 7. Brand Goals
- Short-term objectives
- Long-term vision
- Key performance indicators

### 8. Visual Preferences
- Color preferences and mood
- Typography style preferences
- Visual style and imagery approach

## Features

### Intelligent Information Extraction
- Natural language processing of user responses
- Automatic extraction of relevant brand attributes
- Context-aware follow-up questions

### Progress Tracking
- Real-time completion percentage calculation
- Step-by-step progress visualization
- Resume capability for incomplete sessions

### Brand Guidelines Generation
- Automatic creation of comprehensive brand guidelines
- Integration with identity guidelines system
- Project structure initialization

### Analytics & Optimization
- Completion rate tracking
- Drop-off point analysis
- User behavior insights

## API Reference

### Queries
- `getOnboardingState(userId)` - Get current onboarding state
- `getOnboardingProgress(userId)` - Get progress summary
- `getOnboardingAnalytics()` - Get system-wide analytics

### Mutations
- `updateOnboardingResponse(userId, sessionId, step, responseData)` - Update specific step
- `cleanupOldOnboardings(olderThanDays)` - Maintenance cleanup

### Actions
- `handleOnboardingMessage(message, sessionId, userId)` - Process conversation
- `generateBrandGuidelines(userId)` - Create final brand guidelines
- `sendWelcomeMessage(sessionId, userId)` - Initialize onboarding
- `handleSkipOnboarding(sessionId, userId)` - Skip workflow

## Usage Example

```typescript
import { useOnboarding } from '@/lib/hooks/useOnboarding';

export function OnboardingComponent() {
  const {
    currentStep,
    completionPercentage,
    responses,
    handleOnboardingMessage,
    updateBrandName,
    completeOnboardingWorkflow,
  } = useOnboarding();

  // Use the hook methods to interact with the onboarding system
}
```

## Integration Points

### Identity Guidelines System
- Automatic brand guideline creation upon completion
- Integration with existing identity guidelines schema
- Project and file structure initialization

### User Management
- Onboarding status tracking in user records
- Authentication integration
- Session management

### Chat System
- Conversational interface through chat messages
- Message history and context preservation
- Interactive component support

## Customization

The system is designed to be highly customizable:

- **Workflow Steps**: Add or modify steps in the schema and workflow logic
- **Information Extraction**: Enhance the natural language processing capabilities
- **Brand Guidelines**: Customize the generated guidelines format and content
- **Analytics**: Add additional metrics and tracking points

## Maintenance

- **Cleanup**: Automated cleanup of abandoned onboarding sessions
- **Analytics**: Regular review of completion rates and optimization opportunities
- **Updates**: Schema migrations for new features and improvements
