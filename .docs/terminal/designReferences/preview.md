# React AI Web Preview
URL: /ai/web-preview
Live iframe preview with navigation controls. Build interactive AI-generated UIs with React, Next.js, and TypeScript, featuring URL navigation and console logging for shadcn/ui applications.

***

title: React AI Web Preview
description: Live iframe preview with navigation controls. Build interactive AI-generated UIs with React, Next.js, and TypeScript, featuring URL navigation and console logging for shadcn/ui applications.
icon: Globe
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

Live iframe preview with navigation controls for AI-generated UIs using React, Next.js, and TypeScript. UI generation without preview is useless. Users need to see what the AI actually built, not just trust a description. This free open source shadcn/ui component provides safe iframe embedding for your conversational AI applications using Vercel AI SDK in JavaScript frameworks.

### Interactive web preview

Live iframe with navigation controls:

<Preview path="ai/web-preview" />

The React component provides URL navigation bar, iframe sandbox for safe preview, and optional console logging. Built with TypeScript for type safety and designed for seamless integration in your JavaScript projects.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai/web-preview";

<WebPreview defaultUrl="https://example.com">
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody />
</WebPreview>;
```

## Why iframe instead of opening new tabs?

New tabs kill the workflow in React applications. Users lose context switching back and forth. Plus generated URLs are often temporary—bookmark a v0 link and it's dead in 24 hours in Next.js projects.

Embedded preview keeps everything in one place in TypeScript components. Users can test the generated interface, navigate around, and provide feedback without losing their conversation context in AI chat applications using JavaScript frameworks.

## Usage with AI SDK

Generate and preview UI in real-time in React applications:

```tsx
"use client";

import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai/web-preview";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { Loader } from "@/components/ai/loader";
import { useState } from "react";

export default function UIGenerator() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setPreviewUrl(data.url);
      setPrompt("");
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-6">
      <div className="flex-1 mb-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader size={32} />
            <p className="mt-4 text-muted-foreground">Generating your UI...</p>
          </div>
        ) : previewUrl ? (
          <WebPreview defaultUrl={previewUrl} className="h-full">
            <WebPreviewNavigation>
              <WebPreviewUrl />
            </WebPreviewNavigation>
            <WebPreviewBody />
          </WebPreview>
        ) : (
          <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Your generated UI will appear here
            </p>
          </div>
        )}
      </div>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          placeholder="Describe the UI you want to create..."
          disabled={isGenerating}
        />
        <PromptInputSubmit
          status={isGenerating ? "streaming" : "ready"}
          disabled={!prompt.trim() || isGenerating}
        />
      </PromptInput>
    </div>
  );
}
```

Backend route for UI generation:

```tsx
// app/api/generate-ui/route.ts
export async function POST(req: Request) {
  const { prompt } = await req.json();

  // Your UI generation logic here
  // This could use v0, CodeSandbox API, or custom generation

  // For demo, return a static URL
  const generatedUrl = `https://your-preview-service.com/preview/${Date.now()}`;

  return Response.json({
    url: generatedUrl,
    prompt,
  });
}
```

## Examples

### Preview with console logging

Debug generated UIs with console output:

<Preview path="ai/web-preview-console" />

## Features

* Iframe-based preview with sandbox security in React applications
* URL navigation bar with keyboard support for TypeScript components
* Optional console logging for debugging in JavaScript frameworks
* Responsive container adapting to content in Next.js projects
* Context-based state management for sub-components
* Loading states for async content
* Keyboard navigation (Enter to navigate)
* Safe iframe sandboxing with controlled permissions
* Perfect for AI-generated UIs, conversational AI interfaces, and AI chat applications
* Free open source component built for Next.js with shadcn/ui design system and AI Elements
* Optimized for Vercel AI SDK streaming and AI-generated interfaces

## API Reference

### WebPreview

Container component managing preview state.

| Prop          | Type                             | Default | Description               |
| ------------- | -------------------------------- | ------- | ------------------------- |
| `defaultUrl`  | `string`                         | `""`    | Initial URL to load       |
| `onUrlChange` | `(url: string) => void`          | -       | Callback when URL changes |
| `className`   | `string`                         | -       | Additional CSS classes    |
| `...props`    | `HTMLAttributes<HTMLDivElement>` | -       | Standard div attributes   |

### WebPreviewNavigation

Navigation bar container.

| Prop        | Type                             | Description             |
| ----------- | -------------------------------- | ----------------------- |
| `className` | `string`                         | Additional CSS classes  |
| `...props`  | `HTMLAttributes<HTMLDivElement>` | Standard div attributes |

### WebPreviewNavigationButton

Navigation control button with tooltip.

| Prop        | Type                            | Description            |
| ----------- | ------------------------------- | ---------------------- |
| `tooltip`   | `string`                        | Tooltip text on hover  |
| `className` | `string`                        | Additional CSS classes |
| `...props`  | `ComponentProps<typeof Button>` | Button component props |

### WebPreviewUrl

URL input field with Enter key navigation.

| Prop        | Type                           | Description                   |
| ----------- | ------------------------------ | ----------------------------- |
| `value`     | `string`                       | URL value (overrides context) |
| `onChange`  | `ChangeEventHandler`           | Input change handler          |
| `onKeyDown` | `KeyboardEventHandler`         | Keyboard event handler        |
| `...props`  | `ComponentProps<typeof Input>` | Input component props         |

### WebPreviewBody

Iframe container for preview content.

| Prop        | Type                                      | Description                     |
| ----------- | ----------------------------------------- | ------------------------------- |
| `src`       | `string`                                  | URL to load (overrides context) |
| `loading`   | `ReactNode`                               | Loading indicator overlay       |
| `className` | `string`                                  | Additional CSS classes          |
| `...props`  | `IframeHTMLAttributes<HTMLIFrameElement>` | Iframe attributes               |

### WebPreviewConsole

Collapsible console for log output.

| Prop        | Type                                 | Description             |
| ----------- | ------------------------------------ | ----------------------- |
| `logs`      | `Array<{level, message, timestamp}>` | Console log entries     |
| `className` | `string`                             | Additional CSS classes  |
| `...props`  | `HTMLAttributes<HTMLDivElement>`     | Standard div attributes |

## Keyboard interactions

| Key     | Description                            |
| ------- | -------------------------------------- |
| `Enter` | Navigate to URL in input field         |
| `Tab`   | Move focus between navigation elements |

## Web preview gotchas that will frustrate you

**CORS headers break everything**: Generated URLs often block iframe embedding in React applications. X-Frame-Options: DENY kills your preview instantly. Check headers before embedding or users see blank frames in TypeScript components.

**Sandbox restrictions are strict**: Want to test localStorage in JavaScript implementations? Add allow-same-origin. Need forms? Add allow-forms. Too restrictive and features break, too loose and security suffers in Next.js projects.

**Generated content timeouts**: v0 URLs expire, CodeSandbox links die, temp hosting vanishes in React applications. Cache the actual HTML content, not just URLs, or previews become 404 graveyards.

**Mobile viewport chaos**: Desktop-generated UIs look broken on mobile in TypeScript frameworks. iPhone users see horizontal scrollbars everywhere. Test responsive behavior or add viewport controls.

**HTTPS/HTTP mixed content**: Secure sites can't load HTTP iframes in JavaScript applications. Generated content on HTTP breaks on HTTPS sites. Force HTTPS or provide fallback messaging in React projects.

**Memory leaks with dynamic content**: Switching between many generated previews without cleanup crashes browsers in Next.js implementations. Dispose of previous iframe content properly.

## Integration with other components

WebPreview works seamlessly with [PromptInput](/ai/prompt-input) for generation requests in React applications. Use alongside [Loader](/ai/loader) for generation states in Next.js projects. Combine with [Tool](/ai/tool) to show generation steps. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="iframe-security" title="Is the iframe sandbox secure?">
    Yes, with proper sandbox attributes in React applications. The TypeScript component uses restricted permissions by default. Add only necessary permissions for your use case in JavaScript implementations.
  </Accordion>

  {" "}

  <Accordion id="cors-issues" title="How do I handle CORS errors?">
    Ensure your preview URLs allow iframe embedding in React applications. Use same-origin content or configure proper CORS headers on the preview server in Next.js projects.
  </Accordion>

  {" "}

  <Accordion id="local-preview" title="Can I preview local HTML content?">
    Yes, use data URLs or blob URLs for local content in TypeScript components. Convert HTML to a data URL: `data:text/html;base64,${btoa(html)}` in JavaScript frameworks.
  </Accordion>

  {" "}

  <Accordion id="console-capture" title="How do I capture console output from the iframe?">
    Inject a script that overrides console methods and posts messages to the parent window in React applications. Listen for these messages to display logs in Next.js implementations.
  </Accordion>

  <Accordion id="responsive-testing" title="How do I test different screen sizes?">
    Wrap the WebPreview in a resizable container or add viewport controls to adjust the iframe dimensions dynamically in TypeScript components.
  </Accordion>
</Accordions>