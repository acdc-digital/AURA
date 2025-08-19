# Agent Selector Components - Design & Implementation Blueprint

_Last Updated: August 4, 2025_

## Overview

This document provides a comprehensive blueprint for creating interactive selector components within the EAC Agent System. Based on the successful implementation of the **Project Selector** component used in the File Creator Agent, this guide establishes patterns and best practices for future selector components.

## Core Concept

Agent selectors are interactive UI components that appear within chat messages to collect user input for multi-step workflows. They provide a seamless, terminal-style interface that maintains consistency with the overall EAC dashboard aesthetic while enabling complex user interactions.

## Architecture Pattern

### 1. **Agent-Driven Component Injection**

```typescript
// Agent triggers component injection
await storeChatMessage({
  role: 'assistant',
  content: 'Please select a project for your file:',
  interactiveComponent: {
    type: 'project_selector',
    status: 'pending',
    data: { fileDetails: extractedDetails }
  }
});
```

### 2. **Component Registration in Chat Messages**

```tsx
// Chat message renderer handles component display
{msg.interactiveComponent && msg.interactiveComponent.status === 'pending' && (
  <div className="mt-3 ml-1">
    {msg.interactiveComponent.type === 'project_selector' && (
      <ProjectSelector
        fileDetails={msg.interactiveComponent.data?.fileDetails}
        onProjectSelected={handleSelection}
        onCancel={handleCancel}
      />
    )}
  </div>
)}
```

### 3. **State Management & Completion**

```typescript
// Update component status when complete
await updateInteractiveComponent({
  messageId: msg._id,
  status: 'completed',
  result: { selectedProject: project }
});
```

## Design System Guidelines

### Visual Hierarchy

The Project Selector demonstrates key terminal-style design principles:

```tsx
// Terminal-style color palette
const colors = {
  background: '#1e1e1e',      // Component background
  border: '#2d2d2d',          // Container borders
  accent: '#007acc',          // Primary blue for selections
  text: '#cccccc',            // Primary text
  muted: '#858585',           // Secondary text
  success: '#4ec9b0',         // Success/active states
  hover: '#2d2d2d/30'         // Hover states
};
```

### Layout Pattern

```tsx
<div className="space-y-2">
  {/* Header Section */}
  <div className="flex items-center gap-2 text-xs text-[#858585]">
    <Icon className="w-3.5 h-3.5 text-[#4ec9b0]" />
    <span>Section Title</span>
  </div>

  {/* Context Information */}
  <div className="flex items-center gap-2 text-xs text-[#858585]">
    <Plus className="w-3 h-3 text-[#4ec9b0]" />
    <span>Context:</span>
    <span className="text-[#cccccc] font-mono">Value</span>
  </div>

  {/* Collapsible Drawer */}
  <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded">
    <button onClick={toggleExpanded} className="w-full flex items-center gap-2 p-2">
      <ChevronIcon className="w-3.5 h-3.5 text-[#858585]" />
      <span className="text-xs text-[#007acc] flex-1 text-left">
        Available Options ({count})
      </span>
    </button>
    
    {isExpanded && (
      <div className="px-2 pb-2">
        {/* Selectable Items */}
      </div>
    )}
  </div>

  {/* Selection Preview */}
  {selectedItem && (
    <div className="flex items-center gap-2 text-xs text-[#858585]">
      <CheckCircle className="w-3 h-3 text-[#007acc]" />
      <span>Selected:</span>
      <span className="text-[#cccccc] font-mono">{selectedItem.name}</span>
    </div>
  )}

  {/* Action Buttons */}
  <div className="space-y-1">
    <button className="traditional-button-style">Confirm</button>
    <button className="text-link-style">Cancel</button>
  </div>
</div>
```

## Component Implementation Blueprint

### 1. **Base Interface Structure**

```typescript
interface BaseSelectorProps<T> {
  onItemSelected: (item: T) => void;
  onCancel: () => void;
  context?: Record<string, any>;
  className?: string;
}

interface SelectorState<T> {
  items: T[];
  selectedItem: T | null;
  isExpanded: boolean;
  isLoading: boolean;
}
```

### 2. **Data Fetching Pattern**

```typescript
// Use Convex query with loading states
const allItems = useQuery(api.collection.getItems, {}) || [];
const items = allItems.filter(filterCondition);
const isLoading = allItems === undefined;
```

### 3. **Selection Logic**

```tsx
const handleItemSelect = (item: T) => {
  setSelectedItem(item);
};

const handleConfirm = () => {
  if (selectedItem) {
    onItemSelected(selectedItem);
  }
};
```

### 4. **Visual States**

```tsx
// Selection highlight
className={`selector-row ${
  selectedItem?.id === item.id ? 'bg-[#007acc]/20' : ''
}`}

// Status indicators with consistent icons
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="w-3 h-3 text-[#858585]" />;
    case 'completed': return <CheckCircle className="w-3 h-3 text-[#858585]" />;
    case 'on-hold': return <Clock className="w-3 h-3 text-[#858585]" />;
    default: return <XCircle className="w-3 h-3 text-[#858585]" />;
  }
};
```

## Integration Patterns

### 1. **Agent-Side Implementation**

```typescript
class ExampleAgent extends BaseAgent {
  // Store pending state
  private static pendingSelection: {
    details: any;
    timestamp: number;
  } | null = null;

  async execute(tool: AgentTool, input: string, convexMutations: ConvexMutations) {
    // Check for pending selection response
    if (ExampleAgent.pendingSelection) {
      return await this.handleSelection(input, convexMutations);
    }

    // Parse input and determine if selection needed
    const details = this.extractDetails(input);
    if (this.needsSelection(details)) {
      return await this.promptForSelection(details, convexMutations);
    }

    // Direct execution if no selection needed
    return await this.executeAction(details, convexMutations);
  }

  private async promptForSelection(details: any, convexMutations: ConvexMutations) {
    // Store pending state
    ExampleAgent.pendingSelection = {
      details,
      timestamp: Date.now()
    };

    // Trigger interactive component
    await convexMutations.storeChatMessage({
      role: 'assistant',
      content: 'Please make a selection:',
      interactiveComponent: {
        type: 'example_selector',
        status: 'pending',
        data: { details }
      }
    });

    return 'Please use the selector above to make your choice.';
  }
}
```

### 2. **Chat Message Integration**

```tsx
// Add to chatMessages.tsx component registry
{msg.interactiveComponent && msg.interactiveComponent.status === 'pending' && (
  <div className="mt-3 ml-1">
    {msg.interactiveComponent.type === 'example_selector' && (
      <ExampleSelector
        details={msg.interactiveComponent.data?.details}
        onItemSelected={async (item) => {
          await updateInteractiveComponent({
            messageId: msg._id,
            status: 'completed',
            result: { selectedItem: item }
          });
          
          // Continue agent workflow
          await continueAgentWorkflow(item);
        }}
        onCancel={async () => {
          await updateInteractiveComponent({
            messageId: msg._id,
            status: 'cancelled'
          });
        }}
      />
    )}
  </div>
)}
```

## Specific Selector Examples

### File Name Input Selector

For scenarios requiring file name input with validation:

```typescript
interface FileNameSelectorProps {
  suggestedName?: string;
  fileType: string;
  existingFiles: string[];
  onNameConfirmed: (fileName: string) => void;
  onCancel: () => void;
}

// Features:
// - Real-time validation
// - Duplicate name checking
// - Extension auto-append
// - Suggested name prefill
// - Character limit enforcement
```

### Template Selector

For choosing from predefined templates:

```typescript
interface TemplateSelectorProps {
  templates: Template[];
  category?: string;
  onTemplateSelected: (template: Template) => void;
  onCancel: () => void;
}

// Features:
// - Category filtering
// - Template preview
// - Custom template option
// - Recent templates section
```

### Date/Time Selector

For scheduling and temporal selections:

```typescript
interface DateTimeSelectorProps {
  suggestedDates?: Date[];
  timeSlots?: string[];
  onDateTimeSelected: (dateTime: Date) => void;
  onCancel: () => void;
}

// Features:
// - Smart date parsing
// - Business hours highlighting
// - Conflict detection
// - Timezone handling
```

## Best Practices

### 1. **Performance**
- Use React.memo for selector components
- Implement virtual scrolling for large lists
- Debounce search/filter inputs
- Cache frequently accessed data

### 2. **Accessibility**
- Include proper ARIA labels
- Support keyboard navigation
- Provide screen reader friendly descriptions
- Maintain focus management

### 3. **Error Handling**
- Graceful loading states
- Clear error messages
- Fallback options when data unavailable
- Retry mechanisms for network failures

### 4. **User Experience**
- Preserve selections during navigation
- Provide undo capability
- Show progress indicators for multi-step workflows
- Clear visual feedback for all actions

## Testing Strategy

### Unit Tests
```typescript
describe('ProjectSelector', () => {
  it('filters system folders correctly', () => {
    // Test system folder exclusion
  });
  
  it('handles project selection workflow', () => {
    // Test selection state management
  });
  
  it('validates required props', () => {
    // Test prop validation
  });
});
```

### Integration Tests
```typescript
describe('Agent Selector Integration', () => {
  it('completes full workflow from agent to selection', () => {
    // Test end-to-end agent workflow
  });
  
  it('handles component state updates correctly', () => {
    // Test Convex integration
  });
});
```

## Future Enhancements

### 1. **Multi-Select Support**
- Checkbox-based selection
- Bulk actions
- Selection limits
- Category-based grouping

### 2. **Advanced Filtering**
- Search functionality
- Tag-based filtering
- Date range filters
- Custom filter predicates

### 3. **Drag & Drop**
- Reorderable lists
- Priority setting
- Visual feedback
- Mobile touch support

### 4. **Animation System**
- Smooth expand/collapse
- Selection transitions
- Loading animations
- State change feedback

## Conclusion

The Project Selector component establishes a robust pattern for creating interactive, terminal-style selector components within the EAC Agent System. This blueprint provides the foundation for building consistent, maintainable, and user-friendly selector interfaces that seamlessly integrate with the agent workflow system.

Key takeaways:
- **Consistency**: Follow established design patterns and color schemes
- **Integration**: Use standardized agent communication patterns
- **Scalability**: Build reusable components with clear interfaces
- **User Experience**: Prioritize clarity and ease of use
- **Performance**: Optimize for responsive interactions

By following this blueprint, future selector components will maintain design consistency while providing powerful, interactive capabilities for complex agent workflows.
