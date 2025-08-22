# React AI Actions
URL: /ai/actions
Interactive action buttons for AI chat interfaces. Build engaging conversational experiences with React, Next.js, and TypeScript, featuring tooltips and accessibility support with shadcn/ui integration.

***

title: React AI Actions
description: Interactive action buttons for AI chat interfaces. Build engaging conversational experiences with React, Next.js, and TypeScript, featuring tooltips and accessibility support with shadcn/ui integration.
icon: MousePointer
component: true
---------------

<PoweredBy
  packages={[
  { name: "AI Elements", url: "https://ai-sdk.dev/elements/overview" },
  { name: "Radix UI", url: "https://radix-ui.com/" },
  { name: "Lucide React", url: "https://lucide.dev/" },
]}
/>

<Callout title="Trying to implement AI Elements?">
  [Join our Discord community](https://discord.com/invite/Z9NVtNE7bj) for help
  from other developers.
</Callout>

<br />

Users expect copy buttons on AI responses. Add them or watch people right-click everything like savages. This component puts action buttons where they belong—right after the message content, not buried in some menu.

### Chat message actions

Quick action buttons for AI responses with tooltips:

<Preview path="ai/actions" />

Built with TypeScript and shadcn/ui for React applications, so it plays nice with your existing Next.js setup. Tooltips work properly, focus handling doesn't break tab navigation, and screen readers won't hate you.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import { Actions, Action } from "@/components/ai/actions";
import { ThumbsUpIcon } from "lucide-react";

<Actions className="mt-2">
  <Action label="Like">
    <ThumbsUpIcon className="size-4" />
  </Action>
</Actions>;
```

## Why most action implementations suck

Most developers either forget action buttons entirely or put them in weird places. Users look for copy buttons immediately after reading a response—not in a dropdown menu, not in a toolbar somewhere else.

This React component uses ghost buttons by default because bordered buttons look busy in chat interfaces. If you disagree, use the variant prop. The buttons are 44px touch targets because mobile users need bigger tap areas (trust me on this one).

## Usage with Vercel AI SDK

Real example with copy and regenerate using the Vercel AI SDK useChat hook in React applications:

```tsx
"use client";

import { Actions, Action } from "@/components/ai/actions";
import { Message, MessageContent } from "@/components/ai/message";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai/conversation";
import { RefreshCcwIcon, CopyIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, regenerate } = useChat();

  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, index) => (
          <Message from={message.role} key={message.id}>
            <MessageContent>
              {message.content}
              {message.role === "assistant" &&
                index === messages.length - 1 && (
                  <Actions className="mt-2">
                    <Action onClick={() => regenerate()} label="Retry">
                      <RefreshCcwIcon className="size-4" />
                    </Action>
                    <Action
                      onClick={() =>
                        navigator.clipboard.writeText(message.content)
                      }
                      label="Copy"
                    >
                      <CopyIcon className="size-4" />
                    </Action>
                  </Actions>
                )}
            </MessageContent>
          </Message>
        ))}
      </ConversationContent>
    </Conversation>
  );
}
```

## Examples

### Multi-select actions toolbar

Advanced toolbar with grouped actions and keyboard shortcuts:

<Preview path="ai/actions-toolbar" />

### Contextual actions with loading states

Show different actions based on message state with loading indicators:

<Preview path="ai/actions-contextual" />

## Features

* Action buttons that don't look like an afterthought in React applications
* Tooltips that actually help (not just label repetition)
* Proper keyboard navigation that doesn't break in Next.js projects
* Clipboard API integration (falls back to execCommand for older browsers)
* Works with any Vercel AI SDK setup in JavaScript applications
* Complete TypeScript definitions that make sense
* Free open source component designed for conversational AI interfaces
* Built for modern React frameworks and code generation tools

## API Reference

### Actions

Container for grouping action buttons.

| Prop       | Type                             | Description                               |
| ---------- | -------------------------------- | ----------------------------------------- |
| `...props` | `HTMLAttributes<HTMLDivElement>` | HTML attributes to spread to the root div |

### Action

Individual action button with optional tooltip.

| Prop       | Type                     | Default   | Description                            |
| ---------- | ------------------------ | --------- | -------------------------------------- |
| `tooltip`  | `string`                 | -         | Optional tooltip text shown on hover   |
| `label`    | `string`                 | -         | Accessible label for screen readers    |
| `variant`  | `ButtonVariant`          | `"ghost"` | Button variant from shadcn/ui          |
| `size`     | `ButtonSize`             | `"sm"`    | Button size preset                     |
| `...props` | `ComponentProps<Button>` | -         | Spreads to underlying Button component |

## Keyboard interactions

Actions support full keyboard navigation for accessibility:

| Key               | Description                          |
| ----------------- | ------------------------------------ |
| `Tab`             | Move focus to next action button     |
| `Shift + Tab`     | Move focus to previous action button |
| `Enter` / `Space` | Activate focused action              |
| `Escape`          | Close tooltip if open                |

## Common gotchas

**Tooltip z-index issues**: Our tooltips use Radix Portal so they don't get buried under modals in React applications. Most implementations mess this up.

**Users spam click async actions**: Always disable the button during API calls in Next.js projects. Otherwise users will click "Regenerate" five times and wonder why their app is broken.

**Forgetting disabled state explanations**: If an action is disabled, the tooltip should explain why in JavaScript applications. "Copy (generating...)" is better than just a grayed-out button.

**Touch targets too small**: 44px minimum for mobile. This React component handles this with padding, but if you override styles, remember this.

**Missing screen reader support**: Even if you have visible tooltips, add aria-label for TypeScript accessibility. Screen reader users shouldn't have to guess what buttons do.

## Integration with other components

Drop these into [Message](/ai/message) components for instant chat interfaces in React applications. Pairs well with [Branch](/ai/branch) if you're building version control for AI responses in Next.js projects. This free open source component family is designed to work together without style conflicts in modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="custom-icons" title="Can I use custom icons instead of Lucide?">
    Sure. Any React element works as children in this TypeScript component. Stick to 16px icons or they'll look weird in Next.js applications.
  </Accordion>

  <Accordion id="keyboard-shortcuts" title="How do I add keyboard shortcuts?">
    Listen for keydown events and trigger the onClick in React applications. Show the shortcut in tooltips like "Copy (⌘C)". Don't mess with standard browser shortcuts in JavaScript implementations.
  </Accordion>

  <Accordion id="loading-states" title="How do I handle async actions?">
    Track loading state in your parent React component. Disable the button and swap the icon for a spinner. The disabled prop stops users from spam-clicking in Next.js applications.
  </Accordion>

  <Accordion id="conditional-actions" title="Should I hide unavailable actions?">
    Never hide, always disable in React applications. Users hate when buttons disappear. Show a tooltip explaining why it's disabled instead in TypeScript components.
  </Accordion>

  <Accordion id="custom-styling" title="How do I override the default styles?">
    Pass className with Tailwind utilities or use the variant prop in this React component. All shadcn/ui Button props get forwarded in Next.js projects.
  </Accordion>
</Accordions>