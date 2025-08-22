# React AI Tool
URL: /ai/tool
Collapsible tool execution display with status tracking. Build transparent AI tool calls with React, Next.js, and TypeScript, featuring expandable parameters, results, and error states for shadcn/ui applications.

***

title: React AI Tool
description: Collapsible tool execution display with status tracking. Build transparent AI tool calls with React, Next.js, and TypeScript, featuring expandable parameters, results, and error states for shadcn/ui applications.
icon: Wrench
component: true
---------------

<PoweredBy
  packages={[
  { name: "AI Elements", url: "https://ai-sdk.dev/elements/overview" },
  { name: "Radix UI", url: "https://radix-ui.com/" },
]}
/>

<Callout title="Trying to implement AI Elements?">
  [Join our Discord community](https://discord.com/invite/Z9NVtNE7bj) for help
  from other developers.
</Callout>

<br />

Collapsible tool execution display with status tracking for AI function calls using React, Next.js, and TypeScript. Tool calls without visibility are sketchy. Users want to see what APIs the AI is hitting and with what parameters, especially when things go wrong. This free open source shadcn/ui component provides transparent AI tool calls for your conversational AI applications using Vercel AI SDK in JavaScript frameworks.

### Tool execution with status

Collapsible tool call with parameters and results:

<Preview path="ai/tool" />

The React component provides expandable tool containers, status badges (pending, running, completed, error), parameter display with JSON formatting, and result/error handling. Built with TypeScript for type safety and designed for seamless integration in your JavaScript projects.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai/tool";

<Tool>
  <ToolHeader type="web_search" state="output-available" />
  <ToolContent>
    <ToolInput input={{ query: "Latest AI news", limit: 10 }} />
    <ToolOutput output="Search results..." />
  </ToolContent>
</Tool>;
```

## Why not just log tool calls to console?

Console logging is for developers, not users in React applications. Plus users can't see console output in production. When your AI calls 5 different APIs to answer one question in Next.js projects, users deserve to know what's happening.

Status indicators prevent panic in TypeScript components. "Searching web..." tells users the 10-second delay is normal, not a crash. Failed tools need clear error messages so users understand what broke in JavaScript implementations.

## Usage with AI SDK

Display tool calls from AI models in React applications:

```tsx
"use client";

import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai/tool";
import { Response } from "@/components/ai/response";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ToolDemo() {
  const [input, setInput] = useState("");
  const { messages, append, status } = useChat({
    api: "/api/tools",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      append({ role: "user", content: input });
      setInput("");
    }
  };

  // Find tool calls in messages
  const toolCalls = messages.flatMap(
    (msg) => msg.parts?.filter((part) => part.type?.startsWith("tool-")) || []
  );

  return (
    <div className="space-y-4 max-w-3xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to search, calculate, or fetch data..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <Button type="submit" disabled={status === "streaming"}>
          Send
        </Button>
      </form>

      <div className="space-y-3">
        {toolCalls.map((tool, index) => (
          <Tool key={index} defaultOpen={tool.state === "output-available"}>
            <ToolHeader type={tool.type} state={tool.state} />
            <ToolContent>
              <ToolInput input={tool.input} />
              {tool.state === "output-available" && (
                <ToolOutput
                  output={<Response>{tool.output}</Response>}
                  errorText={tool.errorText}
                />
              )}
            </ToolContent>
          </Tool>
        ))}
      </div>
    </div>
  );
}
```

Backend route with tool definitions:

```tsx
// app/api/tools/route.ts
import { streamText, convertToModelMessages } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: "openai/gpt-4o",
    messages: convertToModelMessages(messages),
    tools: {
      calculate: {
        description: "Perform mathematical calculations",
        parameters: z.object({
          expression: z.string().describe("Math expression to evaluate"),
        }),
        execute: async ({ expression }) => {
          // Simulate calculation
          const result = eval(expression); // Use a safe math parser in production
          return { expression, result };
        },
      },
      web_search: {
        description: "Search the web for information",
        parameters: z.object({
          query: z.string().describe("Search query"),
          limit: z.number().default(5).describe("Number of results"),
        }),
        execute: async ({ query, limit }) => {
          // Simulate web search
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return {
            query,
            results: `Found ${limit} results for "${query}"`,
          };
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
```

## Examples

### Tool with streaming input

Tool receiving parameters in real-time:

<Preview path="ai/tool-streaming" />

### Tool with error state

Failed tool execution with error display:

<Preview path="ai/tool-error" />

### Multiple tool calls

Sequential tool executions in a workflow:

<Preview path="ai/tool-multiple" />

## Features

* Collapsible containers with smooth Radix UI animations in React applications
* Visual status badges (pending, running, completed, error) for TypeScript components
* JSON-formatted parameter display with syntax highlighting in JavaScript frameworks
* Flexible output rendering supporting markdown and custom components for Next.js projects
* Error state handling with clear error messages
* Auto-open for completed/errored tools for immediate visibility
* Keyboard navigation with proper focus management
* Screen reader accessible with semantic HTML
* Perfect for AI agents, AI chat applications, and conversational AI function calling
* Free open source component built for Next.js with shadcn/ui design system and AI Elements
* Optimized for Vercel AI SDK streaming and function calling

## API Reference

### Tool

Container component managing collapsible state.

| Prop          | Type                                 | Default | Description                 |
| ------------- | ------------------------------------ | ------- | --------------------------- |
| `defaultOpen` | `boolean`                            | `false` | Initial expanded state      |
| `className`   | `string`                             | -       | Additional CSS classes      |
| `...props`    | `ComponentProps<typeof Collapsible>` | -       | Collapsible component props |

### ToolHeader

Header showing tool name and status badge.

| Prop        | Type                                                                             | Description                    |
| ----------- | -------------------------------------------------------------------------------- | ------------------------------ |
| `type`      | `string`                                                                         | **Required** - Tool name/type  |
| `state`     | `"input-streaming" \| "input-available" \| "output-available" \| "output-error"` | **Required** - Execution state |
| `className` | `string`                                                                         | Additional CSS classes         |
| `...props`  | `ComponentProps<typeof CollapsibleTrigger>`                                      | Trigger props                  |

### ToolContent

Container for tool parameters and results.

| Prop        | Type                                        | Description            |
| ----------- | ------------------------------------------- | ---------------------- |
| `className` | `string`                                    | Additional CSS classes |
| `...props`  | `ComponentProps<typeof CollapsibleContent>` | Content props          |

### ToolInput

Display for tool input parameters.

| Prop        | Type                    | Description                                        |
| ----------- | ----------------------- | -------------------------------------------------- |
| `input`     | `any`                   | **Required** - Tool parameters (displayed as JSON) |
| `className` | `string`                | Additional CSS classes                             |
| `...props`  | `ComponentProps<'div'>` | Standard div attributes                            |

### ToolOutput

Display for tool results or errors.

| Prop        | Type                    | Description             |
| ----------- | ----------------------- | ----------------------- |
| `output`    | `ReactNode`             | Tool execution result   |
| `errorText` | `string`                | Error message if failed |
| `className` | `string`                | Additional CSS classes  |
| `...props`  | `ComponentProps<'div'>` | Standard div attributes |

## Keyboard interactions

| Key               | Description            |
| ----------------- | ---------------------- |
| `Space` / `Enter` | Toggle tool expansion  |
| `Tab`             | Navigate between tools |
| `Escape`          | Close expanded tool    |

## Tool execution gotchas that will bite you

**Long-running tools freeze the UI**: Weather APIs take 3+ seconds, database queries even longer in React applications. Show progress or users think it crashed. "Searching..." beats dead silence in TypeScript components.

**JSON parameter formatting breaks**: Complex objects get mangled in display in JavaScript implementations. Use proper JSON.stringify with 2-space indentation or your parameters look like garbage in Next.js projects.

**Error messages are useless**: "Something went wrong" tells users nothing in React applications. Show the actual API error: "Rate limit exceeded, try again in 60 seconds."

**Tool result size crashes browsers**: Some APIs return 50KB responses in TypeScript components. Truncate after 1000 characters or add pagination. Don't let a Wikipedia API call freeze the page in JavaScript frameworks.

**Tool dependencies create confusion**: When one tool's output feeds into another, users lose track in React applications. Number them or show the flow visually.

**Failed tools disappear**: Keep failed tools visible with retry buttons in Next.js projects. Users want to debug what broke, not guess why their query vanished in TypeScript implementations.

## Integration with other components

Tool works seamlessly with [Response](/ai/response) for formatted output in React applications. Use alongside [CodeBlock](/ai/code-block) for JSON results in Next.js projects. Combine with [Task](/ai/task) for multi-step workflows. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="tool-streaming" title="How do I show tools as they execute?">
    The state prop changes from input-streaming → input-available → output-available in React applications. Update the UI based on these states for real-time feedback in TypeScript components.
  </Accordion>

  {" "}

  <Accordion id="custom-output" title="Can I customize how results are displayed?">
    Yes. Pass any React component to the output prop in JavaScript implementations. Use Response for markdown, CodeBlock for code, or build custom visualizations in Next.js projects.
  </Accordion>

  {" "}

  <Accordion id="tool-icons" title="How do I add icons for different tools?">
    Create a mapping of tool types to icons and render them in ToolHeader based on the type prop in React applications.
  </Accordion>

  {" "}

  <Accordion id="parallel-tools" title="How do I show parallel tool execution?">
    Display multiple Tool components side-by-side with appropriate status indicators in TypeScript components. Consider a grid layout for parallel operations in JavaScript frameworks.
  </Accordion>

  <Accordion id="tool-timing" title="Should I show execution duration?">
    Yes, especially for slow tools in React applications. Track start/end times and display duration in the header or content area in Next.js projects.
  </Accordion>
</Accordions>