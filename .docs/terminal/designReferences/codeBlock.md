# React AI Code Block
URL: /ai/code-block
Syntax-highlighted code display with copy functionality. Build beautiful code presentations with React, Next.js, and TypeScript, featuring theme-aware highlighting for shadcn/ui applications.

***

title: React AI Code Block
description: Syntax-highlighted code display with copy functionality. Build beautiful code presentations with React, Next.js, and TypeScript, featuring theme-aware highlighting for shadcn/ui applications.
icon: Code
component: true
---------------

<PoweredBy
  packages={[
  { name: "AI Elements", url: "https://ai-sdk.dev/elements/overview" },
  {
    name: "React Syntax Highlighter",
    url: "https://github.com/react-syntax-highlighter/react-syntax-highlighter",
  },
  { name: "Prism", url: "https://prismjs.com/" },
]}
/>

<Callout title="Trying to implement AI Elements?">
  [Join our Discord community](https://discord.com/invite/Z9NVtNE7bj) for help
  from other developers.
</Callout>

<br />

AI code output looks terrible without syntax highlighting. Users can't tell what's a function vs a string vs a comment. This component fixes that with proper code presentation and copy buttons that actually work.

### Syntax highlighted code

Display code with automatic syntax highlighting and copy button:

<Preview path="ai/code-block" />

Uses Prism for syntax highlighting in React applications, follows your dark mode settings, and includes a copy button that doesn't break. Language detection works for common languages in TypeScript projects, falls back to plain text when it's confused.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai/code-block";

<CodeBlock code="const greeting = 'Hello, World!';" language="javascript">
  <CodeBlockCopyButton />
</CodeBlock>;
```

## Why Prism instead of Monaco

Monaco is overkill for read-only code display in React applications. It's 2MB compressed and designed for full editors with autocomplete, debugging, and all that. Prism does syntax highlighting without the bloat in JavaScript frameworks.

The copy button isn't optional in this free open source component. Users will try to select code blocks and inevitably miss characters or grab line numbers. Give them a button or watch them get frustrated in Next.js projects.

## Usage with Vercel AI SDK

Works great with Vercel AI SDK's experimental\_useObject for structured code generation in React applications. The schema validation ensures clean output that renders properly in TypeScript components:

```tsx
"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai/code-block";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { useState } from "react";
import { z } from "zod";

const codeBlockSchema = z.object({
  language: z.string(),
  filename: z.string(),
  code: z.string(),
});

export default function CodeGen() {
  const [input, setInput] = useState("");
  const { object, submit, isLoading } = useObject({
    api: "/api/codegen",
    schema: codeBlockSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      submit(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto mb-4">
        {object?.code && object?.language && (
          <CodeBlock
            code={object.code}
            language={object.language}
            showLineNumbers
          >
            <CodeBlockCopyButton />
          </CodeBlock>
        )}
      </div>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          placeholder="Generate a React component..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <PromptInputSubmit
          status={isLoading ? "streaming" : "ready"}
          disabled={!input.trim()}
        />
      </PromptInput>
    </div>
  );
}
```

Backend route for code generation:

```tsx
// app/api/codegen/route.ts
import { streamObject } from "ai";
import { z } from "zod";

const codeBlockSchema = z.object({
  language: z.string(),
  filename: z.string(),
  code: z.string(),
});

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: "openai/gpt-4o",
    schema: codeBlockSchema,
    prompt: `Generate code only, no markdown: ${context}`,
  });

  return result.toTextStreamResponse();
}
```

## Features

* Syntax highlighting for common languages (JavaScript, TypeScript, Python, etc.) in React applications
* Follows system dark mode without asking in Next.js projects
* Copy button that shows success feedback for JavaScript implementations
* Optional line numbers for longer code blocks in TypeScript components
* Horizontal scroll instead of word wrapping (preserves formatting)
* Works with any Vercel AI SDK setup in modern React frameworks
* Free open source component designed for AI code generation tools

## API Reference

### CodeBlock

Container for syntax-highlighted code display.

| Prop              | Type                             | Default      | Description                                  |
| ----------------- | -------------------------------- | ------------ | -------------------------------------------- |
| `code`            | `string`                         | **required** | Code content to display                      |
| `language`        | `string`                         | **required** | Programming language for syntax highlighting |
| `showLineNumbers` | `boolean`                        | `false`      | Display line numbers                         |
| `children`        | `ReactNode`                      | -            | Optional elements (like copy button)         |
| `...props`        | `HTMLAttributes<HTMLDivElement>` | -            | HTML attributes for container                |

### CodeBlockCopyButton

Copy button with automatic clipboard integration.

| Prop       | Type                     | Default | Description                            |
| ---------- | ------------------------ | ------- | -------------------------------------- |
| `onCopy`   | `() => void`             | -       | Callback after successful copy         |
| `onError`  | `(error: Error) => void` | -       | Error handler for copy failure         |
| `timeout`  | `number`                 | `2000`  | Duration to show success state (ms)    |
| `...props` | `ComponentProps<Button>` | -       | Spreads to underlying Button component |

## Keyboard interactions

| Key               | Description                   |
| ----------------- | ----------------------------- |
| `Tab`             | Focus copy button             |
| `Enter` / `Space` | Copy code when button focused |
| `Cmd/Ctrl + A`    | Select all code               |
| `Cmd/Ctrl + C`    | Copy selected code            |

## Things that will break

**Large files crash browsers**: Prism chokes on files over 1000 lines in React applications. Either chunk them or switch to plain text for big files.

**Language detection is unreliable**: Don't trust auto-detection for edge cases in TypeScript projects. Default to 'text' and let users override if needed.

**Copy button state management**: If you don't handle the success state properly in JavaScript implementations, users will click multiple times thinking it didn't work.

**Mobile horizontal scroll sucks**: Code blocks are terrible on mobile in Next.js applications. Consider a fullscreen view option for complex code.

**Font size inconsistency**: Stick to 14px in React components. Smaller is unreadable, larger breaks your layout when code is long.

## Integration with other components

Works great inside [Response](/ai/response) components for markdown rendering in React applications. Add [Actions](/ai/actions) for code-specific operations like copy, run, or edit in Next.js projects. Drop into [Message](/ai/message) components for chat interfaces. This free open source component family plays nice together in JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="custom-themes" title="Can I use custom syntax themes?">
    Sure. Pass custom Prism themes via the style prop in React applications. We include oneLight and oneDark by default—they work well with most designs in TypeScript projects.
  </Accordion>

  <Accordion id="language-detection" title="How do I auto-detect language?">
    Use a library like lang-detector or parse file extensions in React applications. When in doubt, default to 'text' in JavaScript implementations. Auto-detection fails more than you'd expect.
  </Accordion>

  <Accordion id="copy-formatting" title="Does copy preserve formatting?">
    Nope. Copy grabs raw text without highlighting in this React component. Whether it stays formatted depends on where users paste it in Next.js applications.
  </Accordion>

  <Accordion id="performance" title="What about performance with large files?">
    Syntax highlighting is expensive in React applications. Files over 1000 lines will slow things down in TypeScript components. Consider virtualization or just show plain text for huge files.
  </Accordion>

  <Accordion id="mobile-experience" title="How's the mobile experience?">
    Horizontal scroll works but feels clunky in React applications. For complex code, add a fullscreen view option that mobile users can trigger in Next.js projects.
  </Accordion>
</Accordions>