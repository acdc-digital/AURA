# Agent Selector Components - Design & Implementation Guide

_AURA Platform - Interactive Component Patterns for Agent Workflows_

_Last Updated: August 21, 2025_

## Overview

This document provides a comprehensive guide for creating interactive selector components within the AURA Agent System. Based on proven patterns and AURA's design principles, this guide establishes standards and best practices for building seamless, terminal-style interactive components that integrate with agent workflows.

## Core Concept

Agent selectors are interactive UI components that appear within chat messages to collect user input for multi-step workflows. They provide a seamless, terminal-style interface that maintains consistency with AURA's design system while enabling complex user interactions through the Convex real-time database.

## Architecture Pattern

### 1. **Agent-Driven Component Injection**

Following AURA's state management principles, components are injected via Convex mutations:

```typescript
// Agent triggers component injection (Server State)
await mutations.addChatMessage({
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
// Chat message renderer handles component display (Client State)
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
// Update component status when complete (Server State Update)
await mutations.updateChatMessage({
  id: messageId,
  interactiveComponent: {
    type: 'project_selector',
    status: 'completed',
    result: { selectedProject: project }
  }
});
```

## AURA Design System Integration

### Visual Hierarchy

Following AURA's terminal-style design principles with Shadcn UI and Tailwind:

```tsx
// AURA color palette using CSS variables
const styles = {
  background: 'bg-[#1e1e1e]',          // Component background
  border: 'border-[#2d2d2d]',          // Container borders
  accent: 'text-[#007acc]',            // Primary blue for selections
  text: 'text-[#cccccc]',              // Primary text
  muted: 'text-[#858585]',             // Secondary text
  success: 'text-[#4ec9b0]',           // Success/active states
  hover: 'hover:bg-[#2d2d2d]/30'       // Hover states
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

  {/* Collapsible Drawer using Shadcn UI */}
  <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded">
    <Button 
      variant="ghost" 
      onClick={toggleExpanded} 
      className="w-full flex items-center gap-2 p-2 justify-start"
    >
      <ChevronIcon className="w-3.5 h-3.5 text-[#858585] transition-transform" />
      <span className="text-xs text-[#007acc] flex-1 text-left">
        Available Options ({count})
      </span>
    </Button>
    
    {isExpanded && (
      <div className="px-2 pb-2">
        <ScrollArea className="max-h-48">
          {/* Selectable Items */}
        </ScrollArea>
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

  {/* Action Buttons using Shadcn UI */}
  <div className="space-y-1">
    <Button 
      onClick={handleConfirm} 
      disabled={!selectedItem}
      className="w-full"
    >
      Confirm Selection
    </Button>
    <Button 
      variant="ghost" 
      onClick={handleCancel}
      className="w-full text-[#858585] hover:text-[#cccccc]"
    >
      Cancel
    </Button>
  </div>
</div>
```

## Component Implementation Blueprint

### 1. **Base Interface Structure**

```typescript
// AURA specific interface following TypeScript strict mode
interface BaseSelectorProps<T> {
  onItemSelected: (item: T) => void;
  onCancel: () => void;
  context?: Record<string, unknown>;
  className?: string;
}

interface SelectorState<T> {
  items: T[];
  selectedItem: T | null;
  isExpanded: boolean;
  isLoading: boolean;
}

// Generic selector component following AURA patterns
interface SelectorComponentProps<T> extends BaseSelectorProps<T> {
  items: T[];
  isLoading?: boolean;
  title: string;
  emptyMessage?: string;
  getItemId: (item: T) => string;
  getItemDisplay: (item: T) => string;
  getItemDescription?: (item: T) => string;
  filterPredicate?: (item: T) => boolean;
}
```

### 2. **Data Fetching Pattern with Convex**

```typescript
// Use Convex query with proper loading states (Server State)
function useProjectSelector() {
  const allProjects = useQuery(api.projects.list);
  const user = useQuery(api.users.getCurrentUser);
  
  // Filter out system projects
  const userProjects = useMemo(() => {
    if (!allProjects) return [];
    return allProjects.filter(project => 
      project.userId === user?._id && 
      !project.isSystem
    );
  }, [allProjects, user]);

  return {
    projects: userProjects,
    isLoading: allProjects === undefined,
    error: null // Convex handles errors automatically
  };
}
```

### 3. **Selection Logic with State Management**

```tsx
// Component state (useState for ephemeral UI state)
function ProjectSelector({ onProjectSelected, onCancel }: ProjectSelectorProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { projects, isLoading } = useProjectSelector();

  const handleProjectSelect = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedProject) {
      onProjectSelected(selectedProject);
    }
  }, [selectedProject, onProjectSelected]);

  // Rest of component implementation...
}
```

### 4. **Visual States with Shadcn UI**

```tsx
// Selection highlight using Shadcn UI patterns
<div className="space-y-1">
  {projects.map((project) => (
    <Button
      key={project._id}
      variant={selectedProject?._id === project._id ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start text-left h-auto py-2",
        selectedProject?._id === project._id && "bg-[#007acc]/20 border-[#007acc]/50"
      )}
      onClick={() => handleProjectSelect(project)}
    >
      <div className="flex items-center gap-2">
        {getStatusIcon(project.status)}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#cccccc] truncate">
            {project.name}
          </div>
          {project.description && (
            <div className="text-xs text-[#858585] truncate">
              {project.description}
            </div>
          )}
        </div>
        <div className="text-xs text-[#858585]">
          {project.fileCount} files
        </div>
      </div>
    </Button>
  ))}
</div>

// Status indicators with consistent icons
const getStatusIcon = (status: ProjectStatus) => {
  const iconClass = "w-3 h-3";
  switch (status) {
    case 'active': 
      return <CheckCircle className={cn(iconClass, "text-[#4ec9b0]")} />;
    case 'completed': 
      return <CheckCircle className={cn(iconClass, "text-[#858585]")} />;
    case 'on-hold': 
      return <Clock className={cn(iconClass, "text-[#ffd700]")} />;
    default: 
      return <XCircle className={cn(iconClass, "text-[#f44747]")} />;
  }
};
```

## Integration Patterns

### 1. **Agent-Side Implementation**

```typescript
// FILE CREATOR AGENT - Following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/fileCreatorAgent.ts

export class FileCreatorAgent extends BaseAgent {
  readonly id = "file-creator";
  readonly name = "File Creator Agent";
  readonly description = "Guided file creation with interactive selectors";
  readonly icon = "📄";
  readonly isPremium = false;

  // Static pending state (Component State pattern)
  private static pendingCreation: {
    details: FileCreationDetails;
    timestamp: number;
  } | null = null;

  async execute(
    tool: AgentTool, 
    input: string, 
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Check for pending selection response
      if (FileCreatorAgent.pendingCreation) {
        return await this.handleProjectSelection(input, mutations, context);
      }

      // Parse input and determine if selection needed
      const details = await this.parseFileCreationRequest(input);
      if (this.needsProjectSelection(details)) {
        return await this.promptForProjectSelection(details, mutations, context);
      }

      // Direct execution if no selection needed
      return await this.createFileDirectly(details, mutations, context);
    } catch (error) {
      console.error("File Creator Agent error:", error);
      return {
        success: false,
        message: `File creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async promptForProjectSelection(
    details: FileCreationDetails, 
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    // Store pending state (Component State)
    FileCreatorAgent.pendingCreation = {
      details,
      timestamp: Date.now()
    };

    // Set 5-minute timeout for pending state
    setTimeout(() => {
      if (FileCreatorAgent.pendingCreation?.timestamp === Date.now()) {
        FileCreatorAgent.pendingCreation = null;
      }
    }, 5 * 60 * 1000);

    // Trigger interactive component (Server State)
    await mutations.addChatMessage({
      role: 'assistant',
      content: 'Please select a project for your new file:',
      sessionId: context?.sessionId,
      userId: context?.userId,
      interactiveComponent: {
        type: 'project_selector',
        status: 'pending',
        data: { fileDetails: details }
      }
    });

    return {
      success: true,
      message: 'Please use the project selector above to choose where to create your file.',
      requiresUserInput: true,
      interactiveComponent: {
        type: 'project_selector',
        data: { fileDetails: details }
      }
    };
  }

  private async handleProjectSelection(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const pending = FileCreatorAgent.pendingCreation;
    if (!pending) {
      return {
        success: false,
        message: 'No pending file creation found. Please start a new file creation request.'
      };
    }

    // Parse project selection (could be project name or numeric selection)
    const projectSelection = this.parseProjectSelection(input);
    if (!projectSelection) {
      return {
        success: false,
        message: 'Please select a project using the selector above or specify a project name.'
      };
    }

    // Create file with selected project
    const result = await this.createFileWithProject(
      pending.details,
      projectSelection,
      mutations,
      context
    );

    // Clear pending state
    FileCreatorAgent.pendingCreation = null;

    return result;
  }
}
```

### 2. **Chat Message Integration**

```tsx
// CHAT MESSAGES COMPONENT - AURA integration
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/chatMessages.tsx

interface InteractiveComponentProps {
  component: {
    type: string;
    status: 'pending' | 'completed' | 'cancelled';
    data?: Record<string, unknown>;
    result?: Record<string, unknown>;
  };
  messageId: Id<"chatMessages">;
  onComponentUpdate: (update: any) => void;
}

function InteractiveComponent({ component, messageId, onComponentUpdate }: InteractiveComponentProps) {
  const updateComponent = useMutation(api.chat.updateInteractiveComponent);

  const handleSelection = useCallback(async (result: any) => {
    try {
      // Update component status (Server State)
      await updateComponent({
        messageId,
        status: 'completed',
        result
      });

      // Continue agent workflow by sending selection as new message
      await addChatMessage({
        role: 'user',
        content: `Selected: ${result.name || result.id}`,
        sessionId: getCurrentSessionId(),
        operation: {
          type: 'tool_executed',
          details: { selection: result }
        }
      });

      onComponentUpdate({ status: 'completed', result });
    } catch (error) {
      console.error('Component update failed:', error);
      toast.error('Failed to process selection');
    }
  }, [messageId, updateComponent, onComponentUpdate]);

  const handleCancel = useCallback(async () => {
    try {
      await updateComponent({
        messageId,
        status: 'cancelled'
      });

      await addChatMessage({
        role: 'user',
        content: 'Selection cancelled',
        sessionId: getCurrentSessionId()
      });

      onComponentUpdate({ status: 'cancelled' });
    } catch (error) {
      console.error('Component cancellation failed:', error);
    }
  }, [messageId, updateComponent, onComponentUpdate]);

  // Component registry following AURA patterns
  switch (component.type) {
    case 'project_selector':
      return (
        <ProjectSelector
          fileDetails={component.data?.fileDetails as FileCreationDetails}
          onProjectSelected={handleSelection}
          onCancel={handleCancel}
        />
      );

    case 'file_name_input':
      return (
        <FileNameInput
          suggestedName={component.data?.suggestedName as string}
          fileType={component.data?.fileType as string}
          onNameConfirmed={handleSelection}
          onCancel={handleCancel}
        />
      );

    case 'file_type_selector':
      return (
        <FileTypeSelector
          availableTypes={component.data?.availableTypes as FileType[]}
          onTypeSelected={handleSelection}
          onCancel={handleCancel}
        />
      );

    default:
      return (
        <div className="text-xs text-[#f44747] p-2 border border-[#f44747]/30 rounded">
          Unknown component type: {component.type}
        </div>
      );
  }
}

// Main chat messages component integration
export function ChatMessages() {
  const messages = useQuery(api.chat.list) || [];
  const updateMessage = useMutation(api.chat.updateMessage);

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message._id} className="space-y-2">
          {/* Message content */}
          <MessageContent message={message} />
          
          {/* Interactive component */}
          {message.interactiveComponent && message.interactiveComponent.status === 'pending' && (
            <div className="mt-3 ml-1 animate-in slide-in-from-left-2 duration-300">
              <InteractiveComponent
                component={message.interactiveComponent}
                messageId={message._id}
                onComponentUpdate={(update) => {
                  // Update local state optimistically (Client State)
                  setMessages(prev => prev.map(msg => 
                    msg._id === message._id 
                      ? { ...msg, interactiveComponent: { ...msg.interactiveComponent, ...update }}
                      : msg
                  ));
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Specific Selector Components

### 1. Project Selector

```typescript
// PROJECT SELECTOR COMPONENT
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/ProjectSelector.tsx

interface ProjectSelectorProps {
  fileDetails?: FileCreationDetails;
  onProjectSelected: (project: Project) => void;
  onCancel: () => void;
}

export function ProjectSelector({ fileDetails, onProjectSelected, onCancel }: ProjectSelectorProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { projects, isLoading } = useProjects();

  // Filter out system projects
  const userProjects = useMemo(() => 
    projects.filter(project => !project.isSystem), 
    [projects]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#858585] py-2">
        <div className="animate-spin w-3 h-3 border border-[#858585] border-t-transparent rounded-full" />
        Loading projects...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Context Information */}
      {fileDetails && (
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <Plus className="w-3 h-3 text-[#4ec9b0]" />
          <span>Creating:</span>
          <span className="text-[#cccccc] font-mono">
            {fileDetails.name}.{fileDetails.extension}
          </span>
        </div>
      )}

      {/* Project List */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 p-2 justify-start"
        >
          <ChevronDown 
            className={cn(
              "w-3.5 h-3.5 text-[#858585] transition-transform duration-200",
              isExpanded && "rotate-180"
            )} 
          />
          <span className="text-xs text-[#007acc] flex-1 text-left">
            Available Projects ({userProjects.length})
          </span>
        </Button>

        {isExpanded && (
          <div className="px-2 pb-2">
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {userProjects.map((project) => (
                  <ProjectOption
                    key={project._id}
                    project={project}
                    isSelected={selectedProject?._id === project._id}
                    onSelect={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Selection Preview */}
      {selectedProject && (
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <CheckCircle className="w-3 h-3 text-[#007acc]" />
          <span>Selected:</span>
          <span className="text-[#cccccc] font-mono">{selectedProject.name}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-1">
        <Button
          onClick={() => selectedProject && onProjectSelected(selectedProject)}
          disabled={!selectedProject}
          className="w-full"
          size="sm"
        >
          Create File
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-[#858585] hover:text-[#cccccc]"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Reusable project option component
function ProjectOption({ 
  project, 
  isSelected, 
  onSelect 
}: { 
  project: Project; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  return (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start text-left h-auto py-2",
        isSelected && "bg-[#007acc]/20 border-[#007acc]/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 w-full">
        {getProjectStatusIcon(project.status)}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#cccccc] truncate">
            {project.name}
          </div>
          {project.description && (
            <div className="text-xs text-[#858585] truncate">
              {project.description}
            </div>
          )}
        </div>
        <div className="text-xs text-[#858585] shrink-0">
          {project.fileCount || 0} files
        </div>
      </div>
    </Button>
  );
}
```

### 2. File Name Input Selector

```typescript
// FILE NAME INPUT COMPONENT
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/FileNameInput.tsx

interface FileNameInputProps {
  suggestedName?: string;
  fileType: string;
  existingFiles?: string[];
  onNameConfirmed: (fileName: string) => void;
  onCancel: () => void;
}

export function FileNameInput({
  suggestedName = '',
  fileType,
  existingFiles = [],
  onNameConfirmed,
  onCancel
}: FileNameInputProps) {
  const [fileName, setFileName] = useState(suggestedName);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation logic
  const validateFileName = useCallback((name: string) => {
    if (!name.trim()) {
      setErrorMessage('File name is required');
      setIsValid(false);
      return;
    }

    if (name.length > 100) {
      setErrorMessage('File name is too long (max 100 characters)');
      setIsValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9-_\s\.]+$/.test(name)) {
      setErrorMessage('File name contains invalid characters');
      setIsValid(false);
      return;
    }

    if (existingFiles.includes(name)) {
      setErrorMessage('A file with this name already exists');
      setIsValid(false);
      return;
    }

    setErrorMessage(null);
    setIsValid(true);
  }, [existingFiles]);

  useEffect(() => {
    validateFileName(fileName);
  }, [fileName, validateFileName]);

  const handleSubmit = useCallback(() => {
    if (isValid && fileName.trim()) {
      onNameConfirmed(fileName.trim());
    }
  }, [isValid, fileName, onNameConfirmed]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-[#858585]">
        <Edit className="w-3.5 h-3.5 text-[#4ec9b0]" />
        <span>Enter file name for {fileType}</span>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <Input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter file name..."
          className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc] placeholder-[#858585]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValid) {
              handleSubmit();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          autoFocus
        />

        {/* Validation Feedback */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-xs text-[#f44747]">
            <AlertCircle className="w-3 h-3" />
            {errorMessage}
          </div>
        )}

        {isValid && fileName && (
          <div className="flex items-center gap-2 text-xs text-[#4ec9b0]">
            <CheckCircle className="w-3 h-3" />
            File name is valid
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-1">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full"
          size="sm"
        >
          Confirm Name
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-[#858585] hover:text-[#cccccc]"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
```

### 3. File Type Selector

```typescript
// FILE TYPE SELECTOR COMPONENT
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/FileTypeSelector.tsx

interface FileType {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: string;
  template?: string;
}

interface FileTypeSelectorProps {
  availableTypes: FileType[];
  onTypeSelected: (type: FileType) => void;
  onCancel: () => void;
}

const defaultFileTypes: FileType[] = [
  {
    id: 'document',
    name: 'Document',
    extension: 'md',
    description: 'Markdown documentation and notes',
    icon: '📄',
    template: '# Document Title\n\n## Overview\n\n[Your content here]\n'
  },
  {
    id: 'post',
    name: 'Social Media Post',
    extension: 'x',
    description: 'Twitter/X post with metadata',
    icon: '🐦',
    template: JSON.stringify({
      platform: 'twitter',
      content: '[Your post content]',
      status: 'draft'
    }, null, 2)
  },
  {
    id: 'note',
    name: 'Note',
    extension: 'md',
    description: 'Simple text note',
    icon: '📝',
    template: '# Note\n\n[Your note content]\n'
  },
  {
    id: 'other',
    name: 'Other',
    extension: 'txt',
    description: 'Plain text file',
    icon: '📋',
    template: ''
  }
];

export function FileTypeSelector({ 
  availableTypes = defaultFileTypes, 
  onTypeSelected, 
  onCancel 
}: FileTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<FileType | null>(null);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-[#858585]">
        <FileText className="w-3.5 h-3.5 text-[#4ec9b0]" />
        <span>Select file type</span>
      </div>

      {/* Type Options */}
      <div className="space-y-1">
        {availableTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType?.id === type.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-left h-auto py-3",
              selectedType?.id === type.id && "bg-[#007acc]/20 border-[#007acc]/50"
            )}
            onClick={() => setSelectedType(type)}
          >
            <div className="flex items-start gap-3 w-full">
              <span className="text-lg">{type.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#cccccc]">
                  {type.name} (.{type.extension})
                </div>
                <div className="text-xs text-[#858585] mt-1">
                  {type.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Selection Preview */}
      {selectedType && (
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <CheckCircle className="w-3 h-3 text-[#007acc]" />
          <span>Selected:</span>
          <span className="text-[#cccccc] font-mono">
            {selectedType.name} (.{selectedType.extension})
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-1">
        <Button
          onClick={() => selectedType && onTypeSelected(selectedType)}
          disabled={!selectedType}
          className="w-full"
          size="sm"
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-[#858585] hover:text-[#cccccc]"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
```

## Database Schema Integration

### Interactive Component Schema

```typescript
// CONVEX SCHEMA - Interactive components for chat messages
// /Users/matthewsimon/Projects/AURA/AURA/convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chatMessages: defineTable({
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
      v.literal("terminal"),
      v.literal("thinking"),
    ),
    content: v.string(),
    sessionId: v.optional(v.string()),
    userId: v.optional(v.union(v.string(), v.id("users"))),
    createdAt: v.number(),
    
    // Interactive component support
    interactiveComponent: v.optional(
      v.object({
        type: v.union(
          v.literal("project_selector"),
          v.literal("file_name_input"),
          v.literal("file_type_selector"),
          v.literal("file_selector"),
          v.literal("edit_instructions_input"),
          v.literal("multi_file_selector"),
          v.literal("url_input"),
          v.literal("date_time_selector"),
          v.literal("template_selector")
        ),
        status: v.union(
          v.literal("pending"),
          v.literal("completed"),
          v.literal("cancelled")
        ),
        data: v.optional(v.any()), // Component-specific data
        result: v.optional(v.any()), // User selection result
        timestamp: v.optional(v.number()),
        expiresAt: v.optional(v.number()) // Auto-cleanup timeout
      })
    ),
    
    // Operation tracking
    operation: v.optional(
      v.object({
        type: v.union(
          v.literal("file_created"),
          v.literal("project_created"),
          v.literal("tool_executed"),
          v.literal("error"),
          v.literal("campaign_created"),
          v.literal("selection_made")
        ),
        details: v.optional(v.any()),
      }),
    ),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_interactive_status", ["interactiveComponent.status"])
});
```

### Convex Functions

```typescript
// CONVEX FUNCTIONS - Interactive component management
// /Users/matthewsimon/Projects/AURA/AURA/convex/chat.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updateInteractiveComponent = mutation({
  args: {
    messageId: v.id("chatMessages"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    result: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { messageId, status, result } = args;

    // Update the message with new component status
    await ctx.db.patch(messageId, {
      interactiveComponent: {
        ...((await ctx.db.get(messageId))?.interactiveComponent || {}),
        status,
        result,
        timestamp: Date.now(),
      },
    });

    return messageId;
  },
});

export const cleanupExpiredComponents = mutation({
  handler: async (ctx) => {
    const expiredMessages = await ctx.db
      .query("chatMessages")
      .filter((q) => 
        q.and(
          q.neq(q.field("interactiveComponent"), undefined),
          q.eq(q.field("interactiveComponent.status"), "pending"),
          q.lt(q.field("interactiveComponent.expiresAt"), Date.now())
        )
      )
      .collect();

    for (const message of expiredMessages) {
      await ctx.db.patch(message._id, {
        interactiveComponent: {
          ...message.interactiveComponent!,
          status: "cancelled" as const,
          result: { reason: "timeout" },
        },
      });
    }

    return { cleanedUp: expiredMessages.length };
  },
});
```

## Testing Strategy

### Unit Tests

```typescript
// UNIT TESTS - Selector component testing
// /Users/matthewsimon/Projects/AURA/AURA/tests/components/selectors/ProjectSelector.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectSelector } from '@/app/_components/agents/_components/ProjectSelector';
import { useProjects } from '@/lib/hooks/useProjects';

// Mock Convex hooks
jest.mock('@/lib/hooks/useProjects');
const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>;

describe('ProjectSelector', () => {
  const mockProjects = [
    {
      _id: 'project-1',
      name: 'Test Project',
      description: 'Test description',
      status: 'active' as const,
      fileCount: 5,
      isSystem: false
    },
    {
      _id: 'project-2',
      name: 'System Project',
      description: 'System description',
      status: 'active' as const,
      fileCount: 0,
      isSystem: true
    }
  ];

  const defaultProps = {
    onProjectSelected: jest.fn(),
    onCancel: jest.fn(),
    fileDetails: {
      name: 'test-file',
      extension: 'md',
      type: 'document' as const
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProjects.mockReturnValue({
      projects: mockProjects,
      isLoading: false,
      error: null
    });
  });

  it('renders loading state correctly', () => {
    mockUseProjects.mockReturnValue({
      projects: [],
      isLoading: true,
      error: null
    });

    render(<ProjectSelector {...defaultProps} />);
    
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('filters out system projects', () => {
    render(<ProjectSelector {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/Available Projects/));
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('System Project')).not.toBeInTheDocument();
  });

  it('handles project selection correctly', async () => {
    render(<ProjectSelector {...defaultProps} />);
    
    // Expand project list
    fireEvent.click(screen.getByText(/Available Projects/));
    
    // Select a project
    fireEvent.click(screen.getByText('Test Project'));
    
    // Confirm selection
    fireEvent.click(screen.getByText('Create File'));
    
    await waitFor(() => {
      expect(defaultProps.onProjectSelected).toHaveBeenCalledWith(mockProjects[0]);
    });
  });

  it('handles cancellation correctly', () => {
    render(<ProjectSelector {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('disables confirm button when no project selected', () => {
    render(<ProjectSelector {...defaultProps} />);
    
    const confirmButton = screen.getByText('Create File');
    expect(confirmButton).toBeDisabled();
  });

  it('shows file details context', () => {
    render(<ProjectSelector {...defaultProps} />);
    
    expect(screen.getByText('Creating:')).toBeInTheDocument();
    expect(screen.getByText('test-file.md')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// INTEGRATION TESTS - Agent workflow with selectors
// /Users/matthewsimon/Projects/AURA/AURA/tests/integration/agent-selector-workflow.test.ts

import { test, expect } from '@playwright/test';

test.describe('Agent Selector Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="terminal-panel"]');
  });

  test('completes file creation workflow with project selector', async ({ page }) => {
    // Activate file creator agent
    await page.click('[data-testid="agents-button"]');
    await page.click('[data-testid="agent-file-creator"]');

    // Execute create file command
    await page.fill('[data-testid="terminal-input"]', '/create-file marketing blog post');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Wait for project selector to appear
    await expect(page.locator('[data-testid="project-selector"]')).toBeVisible();
    
    // Expand project list
    await page.click('[data-testid="project-selector-expand"]');
    
    // Select a project
    await page.click('[data-testid="project-option-marketing"]');
    
    // Verify selection preview
    await expect(page.locator('text=Selected: Marketing')).toBeVisible();
    
    // Confirm selection
    await page.click('[data-testid="project-selector-confirm"]');

    // Verify file creation success
    await expect(page.locator('text=File created successfully')).toBeVisible();
    await expect(page.locator('[data-testid="editor-tab"]')).toBeVisible();
  });

  test('handles selector cancellation gracefully', async ({ page }) => {
    // Activate agent and start workflow
    await page.click('[data-testid="agents-button"]');
    await page.click('[data-testid="agent-file-creator"]');
    await page.fill('[data-testid="terminal-input"]', '/create-file test file');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Wait for selector and cancel
    await expect(page.locator('[data-testid="project-selector"]')).toBeVisible();
    await page.click('[data-testid="project-selector-cancel"]');

    // Verify cancellation message
    await expect(page.locator('text=Selection cancelled')).toBeVisible();
    
    // Verify agent can be used again
    await page.fill('[data-testid="terminal-input"]', '/create-file another file');
    await page.press('[data-testid="terminal-input"]', 'Enter');
    await expect(page.locator('[data-testid="project-selector"]')).toBeVisible();
  });

  test('handles timeout for pending selectors', async ({ page }) => {
    // Mock time to speed up timeout testing
    await page.addInitScript(() => {
      // Override setTimeout to trigger after 1 second instead of 5 minutes
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = (fn, delay) => {
        if (delay === 5 * 60 * 1000) { // 5 minute timeout
          return originalSetTimeout(fn, 1000); // 1 second for testing
        }
        return originalSetTimeout(fn, delay);
      };
    });

    // Start workflow
    await page.click('[data-testid="agents-button"]');
    await page.click('[data-testid="agent-file-creator"]');
    await page.fill('[data-testid="terminal-input"]', '/create-file timeout test');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Wait for selector
    await expect(page.locator('[data-testid="project-selector"]')).toBeVisible();

    // Wait for timeout
    await page.waitForTimeout(2000);

    // Try to use agent again - should not be stuck in pending state
    await page.fill('[data-testid="terminal-input"]', '/create-file new request');
    await page.press('[data-testid="terminal-input"]', 'Enter');
    await expect(page.locator('[data-testid="project-selector"]')).toBeVisible();
  });
});
```

## Performance Optimization

### Lazy Loading and Virtualization

```typescript
// PERFORMANCE OPTIMIZED SELECTOR
// Using React.memo and virtual scrolling for large lists

import { memo, useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedSelectorProps<T> {
  items: T[];
  onItemSelected: (item: T) => void;
  getItemId: (item: T) => string;
  getItemDisplay: (item: T) => string;
  filterPredicate?: (item: T) => boolean;
  itemHeight?: number;
  maxHeight?: number;
}

export const VirtualizedSelector = memo(<T extends Record<string, any>>({
  items,
  onItemSelected,
  getItemId,
  getItemDisplay,
  filterPredicate,
  itemHeight = 60,
  maxHeight = 240
}: VirtualizedSelectorProps<T>) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    if (filterPredicate) {
      filtered = filtered.filter(filterPredicate);
    }
    
    if (searchFilter) {
      filtered = filtered.filter(item => 
        getItemDisplay(item).toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    
    return filtered;
  }, [items, filterPredicate, searchFilter, getItemDisplay]);

  // Virtualized row renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredItems[index];
    const itemId = getItemId(item);
    const isSelected = selectedId === itemId;

    return (
      <div style={style}>
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start text-left h-full",
            isSelected && "bg-[#007acc]/20 border-[#007acc]/50"
          )}
          onClick={() => {
            setSelectedId(itemId);
            onItemSelected(item);
          }}
        >
          {getItemDisplay(item)}
        </Button>
      </div>
    );
  }, [filteredItems, selectedId, getItemId, getItemDisplay, onItemSelected]);

  return (
    <div className="space-y-2">
      {/* Search Filter */}
      <Input
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        placeholder="Search items..."
        className="bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]"
      />

      {/* Virtualized List */}
      <div className="border border-[#2d2d2d] rounded">
        <List
          height={Math.min(filteredItems.length * itemHeight, maxHeight)}
          itemCount={filteredItems.length}
          itemSize={itemHeight}
        >
          {Row}
        </List>
      </div>

      {/* Items count */}
      <div className="text-xs text-[#858585]">
        {filteredItems.length} of {items.length} items
      </div>
    </div>
  );
});
```

## Accessibility Features

### Keyboard Navigation and Screen Reader Support

```typescript
// ACCESSIBLE SELECTOR COMPONENT
// Full keyboard navigation and ARIA support

export function AccessibleSelector<T>({
  items,
  onItemSelected,
  getItemId,
  getItemDisplay,
  title = "Select an item"
}: AccessibleSelectorProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          const item = items[focusedIndex];
          setSelectedIndex(focusedIndex);
          onItemSelected(item);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(null);
        break;
    }
  }, [items, focusedIndex, onItemSelected]);

  // Scroll focused item into view
  useEffect(() => {
    if (listRef.current && focusedIndex >= 0) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      focusedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  return (
    <div 
      role="listbox" 
      aria-label={title}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2 focus:ring-[#007acc] rounded"
    >
      <div 
        ref={listRef}
        className="space-y-1 max-h-60 overflow-y-auto"
      >
        {items.map((item, index) => {
          const itemId = getItemId(item);
          const isFocused = index === focusedIndex;
          const isSelected = index === selectedIndex;

          return (
            <div
              key={itemId}
              role="option"
              aria-selected={isSelected}
              aria-label={getItemDisplay(item)}
              className={cn(
                "p-2 rounded cursor-pointer transition-colors",
                isFocused && "bg-[#2d2d2d] outline outline-[#007acc]",
                isSelected && "bg-[#007acc]/20"
              )}
              onClick={() => {
                setSelectedIndex(index);
                setFocusedIndex(index);
                onItemSelected(item);
              }}
            >
              {getItemDisplay(item)}
            </div>
          );
        })}
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {focusedIndex >= 0 && items[focusedIndex] && (
          `Focused on ${getItemDisplay(items[focusedIndex])}, ${focusedIndex + 1} of ${items.length}`
        )}
      </div>
    </div>
  );
}
```

## Best Practices Summary

### 1. **State Management**
- **Server State (Convex)**: All persistent data, interactive component states
- **Client State (Zustand)**: UI panels, agent activation, temporary selections  
- **Component State (useState)**: Ephemeral UI states, form inputs, loading states

### 2. **Performance**
- Use `React.memo` for selector components to prevent unnecessary re-renders
- Implement virtual scrolling for large item lists (>100 items)
- Debounce search inputs to avoid excessive filtering
- Cache frequently accessed data using `useMemo`

### 3. **User Experience**
- Provide clear loading states with skeleton screens
- Show progress indicators for multi-step workflows
- Include search and filtering capabilities for large lists
- Implement undo/cancel functionality
- Maintain focus management for keyboard users

### 4. **Error Handling**
- Graceful degradation when data is unavailable
- Clear error messages with recovery suggestions
- Timeout handling for expired selections
- Retry mechanisms for failed operations

### 5. **Accessibility**
- Full keyboard navigation support
- ARIA labels and roles for screen readers
- Focus management and visual focus indicators
- Screen reader announcements for state changes

### 6. **Testing**
- Unit tests for individual selector components
- Integration tests for agent workflow completion
- E2E tests for user interaction scenarios
- Performance tests for large datasets

## Future Enhancements

### Planned Features

1. **Advanced Filtering System**
   - Multi-criteria filtering with tags and categories
   - Saved filter presets for common selections
   - Real-time search with fuzzy matching
   - Custom filter predicates

2. **Enhanced Visual Design**
   - Smooth animations for state transitions
   - Custom icons and visual indicators
   - Theme customization options
   - Mobile-optimized touch interactions

3. **Collaboration Features**
   - Real-time collaborative selection
   - Shared selection states across sessions
   - Selection history and favorites
   - Team-based project filtering

4. **Smart Suggestions**
   - AI-powered selection recommendations
   - Recently used items prioritization
   - Context-aware filtering
   - Usage analytics for optimization

## Conclusion

The AURA Agent Selector Components provide a robust, accessible, and performant foundation for building interactive workflows within the agent system. By following AURA's architectural principles, leveraging Convex for real-time synchronization, and maintaining consistency with the design system, these components enable seamless user experiences while supporting complex multi-step agent workflows.

Key benefits:
- **Consistency**: Unified design patterns across all selectors
- **Performance**: Optimized for large datasets and real-time updates
- **Accessibility**: Full keyboard navigation and screen reader support
- **Extensibility**: Easy to create new selector types following established patterns
- **Integration**: Seamless connection with agent workflows and database

This comprehensive guide ensures that future selector implementations maintain high quality standards while providing powerful interactive capabilities for the AURA Agent System.
