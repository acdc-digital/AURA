# React AI Task
URL: /ai/task
Collapsible task lists with file references and progress tracking. Build transparent AI workflows with React, Next.js, and TypeScript, featuring expandable details and visual status indicators for shadcn/ui applications.

***

title: React AI Task
description: Collapsible task lists with file references and progress tracking. Build transparent AI workflows with React, Next.js, and TypeScript, featuring expandable details and visual status indicators for shadcn/ui applications.
icon: NotebookPen
component: true
---------------

<PoweredBy
  packages={[
  { name: "AI Elements", url: "https://ai-sdk.dev/elements/overview" },
  { name: "Radix UI", url: "https://radix-ui.com/" },
  { name: "Simple Icons", url: "https://simpleicons.org/" },
]}
/>

<Callout title="Trying to implement AI Elements?">
  [Join our Discord community](https://discord.com/invite/Z9NVtNE7bj) for help
  from other developers.
</Callout>

<br />

Collapsible task lists for AI workflows with file references and progress tracking. Because when your AI says "analyzing codebase" for 30 seconds, users want to see what files it's actually reading, not just watch a spinner. This free open source React component provides transparent workflow visualization for your Next.js AI applications using Vercel AI SDK in JavaScript frameworks.

### Expandable task workflow

Collapsible task list with file references:

<Preview path="ai/task" />

The React component provides expandable task containers, file references with icons, and progress tracking through items. Built with TypeScript for type safety and designed for seamless integration in your JavaScript projects.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from "@/components/ai/task";

<Task>
  <TaskTrigger title="Analyzing project structure" />
  <TaskContent>
    <TaskItem>Scanning workspace for configuration files</TaskItem>
    <TaskItem>
      Found <TaskItemFile>package.json</TaskItemFile>
    </TaskItem>
    <TaskItem>
      Reading <TaskItemFile>tsconfig.json</TaskItemFile>
    </TaskItem>
  </TaskContent>
</Task>;
```

## Why show the process?

AI agents do complex work behind the scenes—reading files, making API calls, running analysis in React applications. Users get nervous when nothing happens for 20+ seconds during AI operations.

Showing task lists builds confidence in your conversational AI. "Reading package.json", "Scanning TypeScript files", "Generating suggestions" tells users the AI is working, not frozen in Next.js projects. Plus developers actually want to see what files got touched during AI chat applications in JavaScript implementations.

## Usage with AI SDK

Stream task progress with structured generation in React applications:

```tsx
"use client";

import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from "@/components/ai/task";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      type: z.enum(["text", "file"]),
      text: z.string(),
      file: z
        .object({
          name: z.string(),
          icon: z.string(),
        })
        .optional(),
    })
  ),
  status: z.enum(["pending", "in_progress", "completed"]),
});

const tasksSchema = z.object({
  tasks: z.array(taskSchema),
});

export default function TaskWorkflow() {
  const [prompt, setPrompt] = useState("");

  const { object, submit, isLoading } = useObject({
    api: "/api/task",
    schema: tasksSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      submit({ prompt });
      setPrompt("");
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a task..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Generate Tasks
        </button>
      </form>

      {isLoading && !object && (
        <p className="text-muted-foreground">Generating workflow...</p>
      )}

      <div className="space-y-3">
        {object?.tasks?.map((task, index) => (
          <Task key={index} defaultOpen={index === 0}>
            <TaskTrigger title={task.title} />
            <TaskContent>
              {task.items?.map((item, i) => (
                <TaskItem key={i}>
                  {item.type === "file" && item.file ? (
                    <span>
                      {item.text} <TaskItemFile>{item.file.name}</TaskItemFile>
                    </span>
                  ) : (
                    item.text
                  )}
                </TaskItem>
              ))}
            </TaskContent>
          </Task>
        ))}
      </div>
    </div>
  );
}
```

Backend route for task generation:

```tsx
// app/api/task/route.ts
import { streamObject } from "ai";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      type: z.enum(["text", "file"]),
      text: z.string(),
      file: z
        .object({
          name: z.string(),
          icon: z.string(),
        })
        .optional(),
    })
  ),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export const tasksSchema = z.object({
  tasks: z.array(taskSchema),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: "openai/gpt-4o",
    schema: tasksSchema,
    prompt: `Generate a realistic task workflow for: ${prompt}
    
    Include file operations, scanning steps, and progress indicators.
    Make it feel like a real development workflow.`,
  });

  return result.toTextStreamResponse();
}
```

## Examples

### Progressive task reveal

Tasks appearing one by one with timing:

<Preview path="ai/task-progressive" />

## Features

* Collapsible task containers with smooth animations in React applications
* File reference badges with icon support for TypeScript components
* Progress tracking through task items in JavaScript frameworks
* Status indicators (pending, in-progress, completed) for Next.js projects
* Nested task support for complex workflows
* Keyboard navigation with proper focus management
* Screen reader accessible with semantic HTML
* Responsive design adapting to different screens
* Perfect for AI agents, AI chat applications, and conversational AI workflow visualization
* Free open source component built for Next.js with shadcn/ui design system and AI Elements
* Optimized for Vercel AI SDK streaming and structured generation

## API Reference

### Task

Container component managing collapsible state.

| Prop          | Type                                 | Default | Description                 |
| ------------- | ------------------------------------ | ------- | --------------------------- |
| `defaultOpen` | `boolean`                            | `false` | Initial expanded state      |
| `className`   | `string`                             | -       | Additional CSS classes      |
| `...props`    | `ComponentProps<typeof Collapsible>` | -       | Collapsible component props |

### TaskTrigger

Clickable header showing task title.

| Prop        | Type                                        | Description                          |
| ----------- | ------------------------------------------- | ------------------------------------ |
| `title`     | `string`                                    | **Required** - Task title to display |
| `className` | `string`                                    | Additional CSS classes               |
| `...props`  | `ComponentProps<typeof CollapsibleTrigger>` | Trigger component props              |

### TaskContent

Container for task items with animations.

| Prop        | Type                                        | Description             |
| ----------- | ------------------------------------------- | ----------------------- |
| `className` | `string`                                    | Additional CSS classes  |
| `...props`  | `ComponentProps<typeof CollapsibleContent>` | Content component props |

### TaskItem

Individual task item with progress indicator.

| Prop        | Type                    | Description             |
| ----------- | ----------------------- | ----------------------- |
| `className` | `string`                | Additional CSS classes  |
| `children`  | `ReactNode`             | Task item content       |
| `...props`  | `ComponentProps<'div'>` | Standard div attributes |

### TaskItemFile

File reference badge with optional icon.

| Prop        | Type                    | Description                 |
| ----------- | ----------------------- | --------------------------- |
| `className` | `string`                | Additional CSS classes      |
| `children`  | `ReactNode`             | File name and optional icon |
| `...props`  | `ComponentProps<'div'>` | Standard div attributes     |

## Keyboard interactions

| Key               | Description            |
| ----------------- | ---------------------- |
| `Space` / `Enter` | Toggle task expansion  |
| `Tab`             | Navigate between tasks |
| `Escape`          | Close expanded task    |

## Production tips

**Keep task titles descriptive.** Users should understand what's happening from the title alone in React applications.

**Show real progress.** Update task items as operations complete, don't just dump everything at once in TypeScript components.

**File references need context.** Show why a file is being accessed: "Reading config from package.json" in JavaScript implementations.

**Status indicators help.** Consider adding visual indicators for pending/completed states in Next.js projects.

**Limit nesting depth.** Too many nested tasks become hard to follow in React applications. Keep it shallow.

**Performance with many tasks.** Consider virtualization for very long task lists in TypeScript frameworks.

## Integration with other components

Task works seamlessly with [Loader](/ai/loader) for pending states in React applications. Use alongside [Response](/ai/response) for task results in Next.js projects. Combine with [Reasoning](/ai/reasoning) for decision explanations. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="task-updates" title="How do I update tasks in real-time?">
    Use the experimental\_useObject hook with streaming to update task items as they complete in React applications. The schema allows partial updates during generation in TypeScript components.
  </Accordion>

  {" "}

  <Accordion id="file-icons" title="How do I add file type icons?">
    Pass icon components as children to TaskItemFile in React applications. Use libraries like Simple Icons or Lucide for consistent file type icons in JavaScript frameworks.
  </Accordion>

  {" "}

  <Accordion id="task-status" title="Should I show task status visually?">
    Yes. Consider adding checkmarks for completed tasks, spinners for in-progress, and different colors for status states in TypeScript components.
  </Accordion>

  {" "}

  <Accordion id="task-timing" title="How do I add timing information?">
    Store start/end times in your task schema and display duration in React applications. Users appreciate knowing how long operations take in Next.js projects.
  </Accordion>

  <Accordion id="error-handling" title="How do I handle failed tasks?">
    Add an "error" status to your schema and show failed tasks with error messages in JavaScript implementations. Let users retry or skip failed tasks in React applications.
  </Accordion>
</Accordions>