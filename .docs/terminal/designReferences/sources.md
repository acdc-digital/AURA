# React AI Sources
URL: /ai/sources
Collapsible citation display for AI-generated content. Build transparent AI interfaces with React, Next.js, and TypeScript, featuring expandable source links and customizable citation counts for shadcn/ui applications.

***

title: React AI Sources
description: Collapsible citation display for AI-generated content. Build transparent AI interfaces with React, Next.js, and TypeScript, featuring expandable source links and customizable citation counts for shadcn/ui applications.
icon: BookOpen
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

Collapsible source citations for AI responses with React, Next.js, and TypeScript. Because when your AI claims something cost $50M to build, users want to see the actual press release, not just trust the chatbot. This free open source shadcn/ui component provides transparent AI citations for your conversational AI applications using Vercel AI SDK in JavaScript frameworks.

### Collapsible source citations

Expandable list with source links:

<Preview path="ai/sources" />

The React component provides a clean trigger showing source count, smooth expand/collapse animations, and clickable source links that open in new tabs. Built with TypeScript for type safety and designed for seamless integration in your JavaScript projects.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai/sources";

<Sources>
  <SourcesTrigger count={3} />
  <SourcesContent>
    <Source href="https://example.com/doc1" title="Documentation" />
    <Source href="https://example.com/research" title="Research Paper" />
    <Source href="https://example.com/blog" title="Blog Article" />
  </SourcesContent>
</Sources>;
```

## Why show sources at all?

AI models hallucinate confidently in conversational AI applications. They'll cite studies that don't exist and quote statistics from nowhere in React projects. Sources let users fact-check the claims that matter in AI chat applications.

Collapsible design works because most people trust AI responses in TypeScript implementations, but skeptical users (the smart ones) want to verify everything. Give them the option without cluttering your Next.js AI application UI in JavaScript frameworks.

## Usage with AI SDK

Display sources from search-enabled models in React applications:

```tsx
"use client";

import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai/sources";
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
import { Response } from "@/components/ai/response";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function SourcesChat() {
  const [input, setInput] = useState("");
  const { messages, append, status } = useChat({
    api: "/api/sources",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      append({ role: "user", content: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "assistant" && message.sources && (
                <Sources>
                  <SourcesTrigger count={message.sources.length} />
                  <SourcesContent>
                    {message.sources.map((source, i) => (
                      <Source
                        key={i}
                        href={source.url}
                        title={source.title || source.url}
                      />
                    ))}
                  </SourcesContent>
                </Sources>
              )}

              <Message from={message.role}>
                <MessageContent>
                  <Response>{message.content}</Response>
                </MessageContent>
              </Message>
            </div>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask a question with sources..."
        />
        <PromptInputSubmit disabled={!input.trim()} status={status} />
      </PromptInput>
    </div>
  );
}
```

Backend route with source-enabled model:

```tsx
// app/api/sources/route.ts
import { streamText, convertToModelMessages } from "ai";
import { perplexity } from "@ai-sdk/perplexity";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: "perplexity/sonar",
    system:
      "You are a helpful assistant. Always use search to provide sources.",
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    sendSources: true, // Enable source streaming
  });
}
```

## Examples

### Custom source rendering

Override default book icon and styling:

<Preview path="ai/sources-custom" />

## Features

* Collapsible container with smooth Radix UI animations in React applications
* Source count display in trigger button for TypeScript components
* Animated chevron icon showing open/closed state in JavaScript frameworks
* Individual source links with book icons for Next.js projects
* Opens sources in new tabs with proper rel attributes
* Accessible keyboard navigation
* Responsive design adapting to different screen sizes
* Theme-aware styling for light and dark modes
* Perfect for AI search results, AI chat applications, research citations, and fact-checking
* Free open source component built for Next.js with shadcn/ui design system and AI Elements
* Optimized for Vercel AI SDK streaming and conversational AI transparency

## API Reference

### Sources

Container component managing collapsible state.

| Prop        | Type                    | Description             |
| ----------- | ----------------------- | ----------------------- |
| `className` | `string`                | Additional CSS classes  |
| `...props`  | `ComponentProps<'div'>` | Standard div attributes |

### SourcesTrigger

Clickable trigger showing source count.

| Prop        | Type                                        | Default | Description                      |
| ----------- | ------------------------------------------- | ------- | -------------------------------- |
| `count`     | `number`                                    | -       | **Required** - Number of sources |
| `className` | `string`                                    | -       | Additional CSS classes           |
| `children`  | `ReactNode`                                 | -       | Custom trigger content           |
| `...props`  | `ComponentProps<typeof CollapsibleTrigger>` | -       | Collapsible trigger props        |

### SourcesContent

Container for source links with animations.

| Prop        | Type                                        | Description               |
| ----------- | ------------------------------------------- | ------------------------- |
| `className` | `string`                                    | Additional CSS classes    |
| `...props`  | `ComponentProps<typeof CollapsibleContent>` | Collapsible content props |

### Source

Individual source link with icon.

| Prop       | Type                  | Description                 |
| ---------- | --------------------- | --------------------------- |
| `href`     | `string`              | Source URL                  |
| `title`    | `string`              | Source title or description |
| `children` | `ReactNode`           | Custom source content       |
| `...props` | `ComponentProps<'a'>` | Standard anchor attributes  |

## Keyboard interactions

| Key               | Description                               |
| ----------------- | ----------------------------------------- |
| `Space` / `Enter` | Toggle sources visibility on trigger      |
| `Tab`             | Navigate between trigger and source links |
| `Enter`           | Open source link (when focused)           |

## Production tips

**Validate source URLs.** Always ensure URLs are valid and safe before rendering in React applications. Consider domain allowlists for security in TypeScript projects.

**Limit source count.** Too many sources overwhelm users in JavaScript implementations. 3-5 sources usually suffice for most responses in Next.js applications.

**Provide meaningful titles.** Don't just show URLs—extract page titles or provide descriptive labels in React components.

**Consider mobile space.** Collapsible design helps, but test source display on small screens in TypeScript frameworks.

**Track source clicks.** Analytics on which sources users verify helps improve AI trustworthiness in JavaScript applications.

**Handle missing sources gracefully.** If no sources available, consider hiding the component entirely in React projects.

## Integration with other components

Sources works seamlessly with [Response](/ai/response) for cited content in React applications. Use alongside [Message](/ai/message) for chat interfaces with sources in Next.js projects. Combine with [InlineCitation](/ai/inline-citation) for inline references. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="source-models" title="Which AI models provide sources?">
    Perplexity models (like Sonar) and search-enabled models provide sources in React applications. Enable with sendSources: true in the response options for TypeScript components.
  </Accordion>

  {" "}

  <Accordion id="source-extraction" title="How do I extract sources from the AI response?">
    Sources come as separate parts in the message in React applications. Look for parts with type "source-url" or check the message.sources array in JavaScript implementations.
  </Accordion>

  {" "}

  <Accordion id="custom-icons" title="Can I use different icons for sources?">
    Pass custom children to the Source component to override the default book icon and layout in TypeScript components.
  </Accordion>

  {" "}

  <Accordion id="source-grouping" title="Should I group sources by type or domain?">
    Consider categorizing sources (research, documentation, news) for better organization when you have many sources in React applications.
  </Accordion>

  <Accordion id="source-validation" title="How do I validate source URLs before displaying?">
    Use URL validation and consider allowlists for trusted domains in React applications. Check for proper protocols (https\://) before rendering in Next.js projects.
  </Accordion>
</Accordions>