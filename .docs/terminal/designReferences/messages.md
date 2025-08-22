# React AI Message
URL: /ai/message
Chat interface messages with avatars and role-based styling. Build conversational interfaces with React, Next.js, and TypeScript, featuring flexible content and avatar displays for shadcn/ui applications.

***

title: React AI Message
description: Chat interface messages with avatars and role-based styling. Build conversational interfaces with React, Next.js, and TypeScript, featuring flexible content and avatar displays for shadcn/ui applications.
icon: MessageCircle
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

Chat message containers with role-based styling for user vs assistant messages in conversational AI applications. This free open source React component handles layout, avatars, and content formatting so AI chat applications look professional in Next.js projects.

### Message display with avatars

Role-based styling with avatar support:

<Preview path="ai/message" />

Automatically adjusts layout based on message role (user messages align right, assistant left) in React applications. Includes avatar support with fallbacks and consistent spacing for TypeScript implementations.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import {
  Message,
  MessageContent,
  MessageAvatar
} from '@/components/ai/message';

<Message from="user">
  <MessageAvatar src="/user-avatar.jpg" name="User" />
  <MessageContent>Hello, how can I help you today?</MessageContent>
</Message>

<Message from="assistant">
  <MessageAvatar src="" name="AI" />
  <MessageContent>I'd be happy to help! What do you need assistance with?</MessageContent>
</Message>
```

## Why not just use divs with text-align?

Raw divs look amateur and break on mobile in React applications. Users need visual hierarchy to follow conversations—who said what, when, and in what order in JavaScript frameworks.

Most developers underestimate how much styling affects trust in Next.js projects. Professional-looking messages make AI responses feel more credible in TypeScript implementations.

## Usage with Vercel AI SDK

Build chat interfaces using Vercel AI SDK's useChat hook with proper message roles in React applications:

```tsx
"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai/conversation";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "@/components/ai/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
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
              <MessageAvatar
                src={message.role === "user" ? "/user.jpg" : ""}
                name={message.role === "user" ? "User" : "AI"}
              />
              <MessageContent>{message.content}</MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <PromptInputSubmit status={status} disabled={!input.trim()} />
      </PromptInput>
    </div>
  );
}
```

Backend route for chat responses:

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

## Features

* Role-based layout (user right, assistant left, system centered) in React applications
* Avatar support with automatic initials fallback for TypeScript projects
* Responsive padding and sizing for mobile in Next.js implementations
* Content wrapper that handles markdown and rich content in JavaScript frameworks
* Proper accessibility with ARIA labeling for screen readers
* Works with any Vercel AI SDK setup and AI chat applications
* Free open source component designed for conversational AI interfaces and customer support

## API Reference

### Message

Container component for a single message with role-based styling.

| Prop        | Type                             | Default | Description                        |
| ----------- | -------------------------------- | ------- | ---------------------------------- |
| `from`      | `"user" \| "assistant"`          | -       | **Required** - Message sender role |
| `className` | `string`                         | -       | Additional CSS classes             |
| `...props`  | `HTMLAttributes<HTMLDivElement>` | -       | Standard div attributes            |

### MessageContent

Content wrapper for message text or custom content.

| Prop        | Type                             | Description             |
| ----------- | -------------------------------- | ----------------------- |
| `className` | `string`                         | Additional CSS classes  |
| `...props`  | `HTMLAttributes<HTMLDivElement>` | Standard div attributes |

### MessageAvatar

Avatar display with name-based fallback.

| Prop        | Type                            | Description                                     |
| ----------- | ------------------------------- | ----------------------------------------------- |
| `src`       | `string`                        | **Required** - Avatar image source URL          |
| `name`      | `string`                        | Name for fallback initials (first 2 characters) |
| `className` | `string`                        | Additional CSS classes                          |
| `...props`  | `ComponentProps<typeof Avatar>` | Avatar component props                          |

## Keyboard interactions

| Key   | Description                                   |
| ----- | --------------------------------------------- |
| `Tab` | Navigate between interactive message elements |

## Message layout gotchas

**Inconsistent alignment breaks UX**: User messages always right, assistant always left in React applications. Don't get creative with this—users expect consistency across JavaScript frameworks.

**Missing avatar fallbacks**: Not everyone has profile pictures in TypeScript projects. Generate initials or use placeholder icons. Empty avatars look broken in Next.js implementations.

**Long messages break mobile**: Set max-width constraints in React components. 65ch works for desktop, shorter for mobile. Test with real AI responses that can be 500+ words.

**Forgetting loading states**: Show typing indicators when AI is generating in JavaScript applications. Dead silence makes users think it crashed in React projects.

**Avatar sizing on mobile**: Desktop avatars look huge on mobile in Next.js applications. Scale down or your chat will look cramped in TypeScript implementations.

## Integration with other components

Works great with [Conversation](/ai/conversation) for auto-scrolling chat containers in React applications. Combine with [Actions](/ai/actions) for message-specific operations like copy, regenerate, or edit in Next.js projects. Add [PromptInput](/ai/prompt-input) for complete chat interface. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="message-styling" title="How do I customize message appearance for different roles?">
    The React component applies role-based classes automatically. Don't override this unless you have a really good reason—users expect consistent alignment in JavaScript applications.
  </Accordion>

  <Accordion id="avatar-fallbacks" title="What happens when avatar images fail to load?">
    Shows the first 2 characters of the name prop in a circular background in TypeScript components. Use meaningful names like "User" or "AI Assistant" in React applications.
  </Accordion>

  <Accordion id="message-content" title="Can MessageContent render markdown or JSX?">
    Yeah. MessageContent accepts any React children—markdown components, formatted text, custom elements, whatever in Next.js projects.
  </Accordion>

  <Accordion id="message-timestamps" title="How do I add timestamps to messages?">
    Add timestamp elements as children alongside MessageContent in React applications. The layout accommodates additional metadata in JavaScript implementations.
  </Accordion>

  <Accordion id="message-grouping" title="Should I group consecutive messages from the same sender?">
    Consider grouping for visual flow in TypeScript projects. Hide avatars on subsequent messages and reduce spacing between grouped ones in React applications.
  </Accordion>
</Accordions>