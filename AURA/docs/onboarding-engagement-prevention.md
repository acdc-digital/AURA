# Onboarding Engagement Prevention System

## Overview
Implemented a system to prevent users from skipping onboarding after they have started actively engaging with the process by submitting their first response.

## Changes Made

### 1. Database Schema Update (`convex/schema.ts`)
- Added `hasStartedEngaging: v.optional(v.boolean())` field to `onboardingResponses` table
- This flag tracks when a user submits their first response (preventing skip after starting)

### 2. Backend Logic Updates (`convex/onboarding.ts`)

#### `updateOnboardingResponse` mutation:
- **Creation path**: Sets `hasStartedEngaging: true` for any step that isn't "welcome", "skipped", "completion_pending", or "completed"
- **Update path**: Sets `hasStartedEngaging: true` when updating and user hasn't started engaging yet

#### `getOnboardingProgress` query:
- Returns the `hasStartedEngaging` flag along with other onboarding state

#### `handleOnboardingMessage` action:
- Automatically sets engagement flag when user submits any message during onboarding
- Ensures the flag is set even if no specific data is extracted from the message
- Uses appropriate step typing to avoid TypeScript errors

### 3. Frontend Hook Updates (`lib/hooks/useOnboarding.ts`)
- Added `hasStartedEngaging` to the returned state from the hook
- Frontend components can now access this flag to adjust behavior

### 4. Skip Button Component Updates (`app/_components/terminal/chat/_components/OnboardingSkipButton.tsx`)
- Uses `hasStartedEngaging` flag to determine if button should be disabled
- Button logic: `const shouldDisable = isDisabled || hasStartedEngaging`
- Dynamic button text:
  - Normal: "Skip"
  - After engagement: "Onboarding Started"
  - After completed: "Skipped"
- Visual disabled state with opacity and cursor changes

## User Experience Flow

### Initial State
1. User sees onboarding welcome message
2. Skip and Continue buttons are both available
3. `hasStartedEngaging` is `false` or `undefined`

### After First User Response
1. User types a message and submits (instead of clicking Skip)
2. `handleOnboardingMessage` action is triggered
3. `hasStartedEngaging` flag is set to `true`
4. Skip button becomes disabled with "Onboarding Started" text
5. Continue button remains functional

### Prevention Logic
- Once `hasStartedEngaging` is `true`, the user cannot skip
- This prevents users from backing out after they've committed to the onboarding process
- Skip button remains visible but disabled for UI consistency and to show interaction history

## Technical Implementation Details

### Engagement Detection Triggers
1. **Direct step updates**: Any call to `updateOnboardingResponse` with meaningful steps
2. **Message submission**: Any user message during active onboarding automatically sets the flag
3. **Safeguard logic**: Even if no data is extracted, the engagement flag is set

### Type Safety
- All TypeScript types updated to include the new field
- Proper union types for step validation
- No `any` types used in the implementation

### Error Handling
- Graceful error handling if engagement flag setting fails
- Continues with normal onboarding flow even if flag update fails
- Logs errors for debugging purposes

## Testing Scenarios

### Scenario 1: Skip Before Engagement
- User sees welcome message → Can click Skip → Onboarding ends

### Scenario 2: Skip After Engagement (Prevented)
- User sees welcome message → Types response → Submits → Skip button disabled

### Scenario 3: Normal Completion
- User engages → Completes onboarding → Both buttons show completed state

## Benefits
1. **Prevents abandonment**: Users can't skip after starting, improving completion rates
2. **Clear intent**: Once a user starts, they've shown commitment to the process  
3. **Better UX**: Prevents accidental skips after users have invested time
4. **Visual feedback**: Button state clearly indicates current interaction status
5. **Persistent history**: Buttons remain visible showing interaction history
