# React AI Branch
URL: /ai/branch
Navigate between multiple AI response variations. Build interactive chat experiences with React, Next.js, and TypeScript, featuring branch navigation and version control for shadcn/ui applications.

***

title: React AI Branch
description: Navigate between multiple AI response variations. Build interactive chat experiences with React, Next.js, and TypeScript, featuring branch navigation and version control for shadcn/ui applications.
icon: GitBranch
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

Users want to compare different AI responses without losing the good ones. This builds branching into your chat UI so they can navigate between variations instead of refreshing and hoping for better luck.

### Response branching

Navigate between different AI response variations:

<Preview path="ai/branch" />

Handles branch state without Redux ceremony in React applications, uses CSS transitions so switching doesn't feel janky, and aligns navigation controls properly. Complete TypeScript definitions that actually make sense.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import {
  Branch,
  BranchMessages,
  BranchNext,
  BranchPage,
  BranchPrevious,
  BranchSelector,
} from "@/components/ai/branch";

<Branch defaultBranch={0}>
  <BranchMessages>
    <Message from="user">
      <MessageContent>Hello</MessageContent>
    </Message>
    <Message from="user">
      <MessageContent>Hi!</MessageContent>
    </Message>
  </BranchMessages>
  <BranchSelector from="user">
    <BranchPrevious />
    <BranchPage />
    <BranchNext />
  </BranchSelector>
</Branch>;
```

## Why not just use a state library?

Most developers reach for Zustand or Redux for branch management in React applications. That's overkill. This React component handles the state you actually need—current branch index and navigation—without the ceremony.

Users don't get perfect responses on the first try in Next.js applications. They want to see alternatives without losing what's already good. Before this free open source component, they'd copy-paste responses into notes apps like animals.

## Usage with Vercel AI SDK

Vercel AI SDK focuses on streaming and generation—it doesn't handle response variations in JavaScript applications. That's where this TypeScript component fits in. You manage the array of responses, we handle the UI for React applications:

```tsx
"use client";

import {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchPage,
  BranchNext,
} from "@/components/ai/branch";
import { Message, MessageContent } from "@/components/ai/message";
import { useState } from "react";

export default function Chat() {
  const [responses, setResponses] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState(0);

  const generateVariation = async () => {
    // Your AI generation logic
    const newResponse = await generateResponse();
    setResponses([...responses, newResponse]);
  };

  return (
    <Branch defaultBranch={currentBranch} onBranchChange={setCurrentBranch}>
      <BranchMessages>
        {responses.map((response, index) => (
          <Message from="assistant" key={index}>
            <MessageContent>{response}</MessageContent>
          </Message>
        ))}
      </BranchMessages>
      {responses.length > 1 && (
        <BranchSelector from="assistant">
          <BranchPrevious />
          <BranchPage />
          <BranchNext />
        </BranchSelector>
      )}
    </Branch>
  );
}
```

## Features

* Branch state management that doesn't require a PhD in React applications
* Navigation controls that work on mobile (not tiny buttons) in Next.js projects
* CSS transitions instead of re-rendering everything for JavaScript performance
* Shows "2 of 5" so users know where they are in TypeScript applications
* Keyboard navigation that doesn't break accessibility
* Works with any Vercel AI SDK setup in React frameworks
* Free open source component designed for conversational AI interfaces

## API Reference

### Branch

Container managing branch state and navigation.

| Prop             | Type                             | Default | Description                            |
| ---------------- | -------------------------------- | ------- | -------------------------------------- |
| `defaultBranch`  | `number`                         | `0`     | Index of the branch to show by default |
| `onBranchChange` | `(index: number) => void`        | -       | Callback when branch changes           |
| `...props`       | `HTMLAttributes<HTMLDivElement>` | -       | HTML attributes for root div           |

### BranchMessages

Container for branch message variations.

| Prop       | Type                             | Description                  |
| ---------- | -------------------------------- | ---------------------------- |
| `...props` | `HTMLAttributes<HTMLDivElement>` | HTML attributes for root div |

### BranchSelector

Navigation control container with alignment.

| Prop       | Type                             | Description                               |
| ---------- | -------------------------------- | ----------------------------------------- |
| `from`     | `UIMessage["role"]`              | Aligns selector for user/assistant/system |
| `...props` | `HTMLAttributes<HTMLDivElement>` | HTML attributes for container             |

### BranchPrevious / BranchNext

Navigation buttons for branch control.

| Prop       | Type                     | Description                            |
| ---------- | ------------------------ | -------------------------------------- |
| `...props` | `ComponentProps<Button>` | Spreads to underlying Button component |

### BranchPage

Branch position indicator.

| Prop       | Type                              | Description                      |
| ---------- | --------------------------------- | -------------------------------- |
| `...props` | `HTMLAttributes<HTMLSpanElement>` | HTML attributes for span element |

## Keyboard interactions

| Key               | Description                        |
| ----------------- | ---------------------------------- |
| `Tab`             | Move focus to navigation controls  |
| `Enter` / `Space` | Activate focused navigation button |
| `ArrowLeft`       | Previous branch (when focused)     |
| `ArrowRight`      | Next branch (when focused)         |

## Things that will bite you

**Branch state gets lost on refresh**: Store in localStorage if users care about persistence in React applications. Most don't for casual conversations.

**Users click through branches too fast**: Add a small transition delay or they'll think switching is broken in Next.js projects.

**Memory leaks with too many branches**: Limit to 5-7 branches and auto-prune old ones in JavaScript applications. Nobody needs 20 variations.

**Showing navigation with only one branch**: Hide the controls when there's nothing to navigate in TypeScript components. It just confuses people.

**Auto-generating variations**: Never do this automatically in React applications. Users want control over when you spend their tokens.

## Integration with other components

Works great with [Message](/ai/message) components for displaying the actual content in React applications. Add [Actions](/ai/actions) to each branch for copy/regenerate buttons in Next.js projects. This free open source component family is designed to work together in modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="branch-persistence" title="How do I persist branches across sessions?">
    Store the array in localStorage with message IDs and timestamps in React applications. Most users don't care about persistence for casual chats, but power users do in Next.js projects.
  </Accordion>

  <Accordion id="branch-limits" title="Should I limit the number of branches?">
    Absolutely. 5-7 max in React applications. More than that overwhelms users and wastes memory in JavaScript implementations. Auto-prune old ones or let users delete them.
  </Accordion>

  <Accordion id="branch-generation" title="When should I auto-generate variations?">
    Never automatically in React applications. Users want control over when you burn their API tokens in TypeScript components. Let them explicitly request variations.
  </Accordion>

  <Accordion id="branch-comparison" title="How can users compare branches side-by-side?">
    Build a comparison mode with 2-3 branches in columns for React applications. On mobile, stack them vertically with clear "Option 1" labels in Next.js projects.
  </Accordion>

  <Accordion id="branch-selection" title="How do I track which branch users prefer?">
    Log branch selection events—time spent, final choice, whether they generated more in React applications. This data helps improve your prompts in JavaScript implementations.
  </Accordion>
</Accordions>