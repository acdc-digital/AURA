# React AI Loader
URL: /ai/loader
Spinning animation for loading states. Build responsive loading indicators with React, Next.js, and TypeScript, featuring customizable size and styling for shadcn/ui applications.

***

title: React AI Loader
description: Spinning animation for loading states. Build responsive loading indicators with React, Next.js, and TypeScript, featuring customizable size and styling for shadcn/ui applications.
icon: Loader
component: true
---------------

<PoweredBy
  packages={[
  { name: "AI Elements", url: "https://ai-sdk.dev/elements/overview" },
  { name: "Lucide React", url: "https://lucide.dev/" },
]}
/>

{" "}

<Callout title="Trying to implement AI Elements?">
  [Join our Discord community](https://discord.com/invite/Z9NVtNE7bj) for help
  from other developers.
</Callout>

<br />

Loading spinners for AI operations in conversational AI applications. Because users need to know something's happening during the 10-30 seconds it takes to generate responses in React applications.

### Spinning loader animation

Customizable size with smooth CSS animation:

<Preview path="ai/loader" />

Simple animated spinner that scales to different sizes and inherits colors from your theme in TypeScript components. Uses CSS animations so it doesn't kill performance in JavaScript frameworks.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import { Loader } from '@/components/ai/loader';

<Loader />
<Loader size={24} />
<Loader className="text-blue-500" />
```

## Why not just disable the button?

Disabled buttons tell users they can't do something, but not why in React applications. A loading spinner communicates that work is happening and will finish eventually.

AI operations take 10-30 seconds regularly in Next.js projects. Without feedback, users refresh the page or click submit again. Both break your app.

## Usage with Vercel AI SDK

Show loading states during Vercel AI SDK operations using status from useChat in React applications:

```tsx
"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { Loader } from "@/components/ai/loader";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, append, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      append({ role: "user", content: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>{message.content}</MessageContent>
            </Message>
          ))}
          {status === "loading" && (
            <div className="flex items-center gap-2 p-4">
              <Loader size={20} />
              <span className="text-muted-foreground text-sm">Thinking...</span>
            </div>
          )}
        </ConversationContent>
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          placeholder="Ask something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <PromptInputSubmit status={status} disabled={!input.trim()} />
      </PromptInput>
    </div>
  );
}
```

Backend route for streaming:

```tsx
// app/api/chat/route.ts
import { streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: "openai/gpt-4o",
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

## Examples

### Custom styling variations

Different colors, animation speeds, and background contexts:

<Preview path="ai/loader-custom" />

## Features

* CSS animations that don't block the main thread in React applications
* Scales to any size without looking pixelated in Next.js projects
* Inherits text color from parent (use text-primary, text-muted, etc.) with TypeScript support
* Proper accessibility with role="status"
* Works with any Vercel AI SDK hook status and AI chat applications
* Free open source component designed for conversational AI operations in JavaScript frameworks

## API Reference

### Loader

Spinning animation component for loading states.

| Prop        | Type                             | Default | Description                |
| ----------- | -------------------------------- | ------- | -------------------------- |
| `size`      | `number`                         | `16`    | Width and height in pixels |
| `className` | `string`                         | -       | Additional CSS classes     |
| `...props`  | `HTMLAttributes<HTMLDivElement>` | -       | Standard div attributes    |

## Keyboard interactions

| Key   | Description                      |
| ----- | -------------------------------- |
| `Tab` | Skip over loader (not focusable) |

## Loading spinner gotchas

**Don't show loaders for fast operations**: Sub-200ms operations should complete without spinners in React applications. They flash and feel broken.

**Size for context**: 16px for inline text, 24px for buttons, 32px+ for page-level loading in Next.js projects. Too small looks weak, too big dominates.

**JavaScript animations kill performance**: Use CSS transforms and opacity in TypeScript components. Avoid updating DOM properties in animation loops.

**Generic "Loading..." is useless**: Say "Generating response..." or "Processing image..." so users know what's actually happening in React applications.

**Forgetting mobile considerations**: Spinners need to be readable on small screens. Test at actual mobile sizes in JavaScript implementations.

## Integration with other components

Works great with [PromptInput](/ai/prompt-input) for input states in React applications. Drop into [Message](/ai/message) for typing indicators in Next.js projects. Combine with [Conversation](/ai/conversation) for chat loading states. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="custom-colors" title="How do I change the loader color?">
    Add text color classes like text-blue-500 in React applications. The loader inherits currentColor from the parent element in TypeScript components.
  </Accordion>

  <Accordion id="loader-sizing" title="What sizes work best?">
    16px for inline use, 20-24px for buttons, 32px+ for full-screen loading in React applications. Match the context where it appears in Next.js projects.
  </Accordion>

  <Accordion id="animation-speed" title="Can I change animation speed?">
    Override the animate-spin class with custom CSS in React applications. Default speed works for most AI operations in TypeScript components.
  </Accordion>

  <Accordion id="accessibility" title="Is the loader accessible?">
    The SVG includes proper accessibility attributes in this React component. Screen readers announce loading state changes in JavaScript applications.
  </Accordion>

  <Accordion id="performance" title="Does the animation impact performance?">
    CSS animations are hardware-accelerated in React applications. Multiple loaders might slow down older devices in Next.js projects.
  </Accordion>
</Accordions>