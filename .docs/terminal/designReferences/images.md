# React AI Image
URL: /ai/image
Display AI-generated images with automatic data URL conversion. Build visual applications with React, Next.js, and TypeScript, featuring seamless AI SDK integration for shadcn/ui projects.

***

title: React AI Image
description: Display AI-generated images with automatic data URL conversion. Build visual applications with React, Next.js, and TypeScript, featuring seamless AI SDK integration for shadcn/ui projects.
icon: Image
component: true
---------------

<PoweredBy
  packages={[
  { name: "AI Elements", url: "https://ai-sdk.dev/elements/overview" },
  { name: "AI SDK", url: "https://sdk.vercel.ai/" },
  { name: "OpenAI", url: "https://openai.com/" },
]}
/>

<Callout title="Trying to implement AI Elements?">
  [Join our Discord community](https://discord.com/invite/Z9NVtNE7bj) for help
  from other developers.
</Callout>

<br />

Displaying base64 image data from AI generation without building data URLs manually. This React component takes the raw output from Vercel AI SDK's experimental\_generateImage and renders it properly in JavaScript applications.

### AI-generated image display

Automatically render images from AI SDK generation:

<Preview path="ai/image" />

Takes base64, mediaType, and uint8Array from Vercel AI SDK's experimental\_generateImage and converts them to proper img src data URLs in React applications. No manual data URL construction needed.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import { Image } from "@/components/ai/image";

<Image
  base64="valid base64 string"
  mediaType="image/jpeg"
  uint8Array={new Uint8Array([])}
  alt="Generated image"
  className="h-[150px] aspect-square border"
/>;
```

## Why not build data URLs manually?

You could manually construct `data:${mediaType};base64,${base64}` URLs, but that's error-prone and you'll forget edge cases in React applications. This free open source component handles the conversion and gives you a proper img element.

Most developers try to render base64 directly as src in Next.js projects and wonder why it doesn't work. The data URL format is specific and easy to mess up in JavaScript implementations.

## Usage with Vercel AI SDK

Real example using experimental\_generateImage with proper display in React applications:

```tsx
"use client";

import { Image } from "@/components/ai/image";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai/prompt-input";
import { Loader } from "@/components/ai/loader";
import { useState } from "react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setImageData(data);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
    setPrompt("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {imageData && (
          <div className="flex justify-center">
            <Image
              {...imageData}
              alt="Generated image"
              className="max-w-md rounded-lg border"
            />
          </div>
        )}
        {isLoading && <Loader />}
      </div>

      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputTextarea
          value={prompt}
          placeholder="Describe the image..."
          onChange={(e) => setPrompt(e.currentTarget.value)}
        />
        <PromptInputSubmit
          status={isLoading ? "submitted" : "ready"}
          disabled={!prompt.trim()}
        />
      </PromptInput>
    </div>
  );
}
```

Backend route for image generation:

```tsx
// app/api/image/route.ts
import { openai } from "@ai-sdk/openai";
import { experimental_generateImage } from "ai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { image } = await experimental_generateImage({
    model: openai.image("dall-e-3"),
    prompt,
    size: "1024x1024",
  });

  return Response.json({
    base64: image.base64,
    uint8Array: image.uint8Array,
    mediaType: image.mediaType,
  });
}
```

## Features

* Converts base64 + mediaType to proper data URLs automatically in React applications
* Accepts the exact output from Vercel AI SDK's experimental\_generateImage
* Standard img element with all HTML attributes supported in Next.js projects
* Complete TypeScript definitions that match AI SDK types
* No manual data URL construction required for JavaScript implementations
* Free open source component designed for DALL-E, Midjourney, and other AI image generation

## API Reference

### Image

Display component for AI-generated images.

| Prop         | Type                               | Description                                   |
| ------------ | ---------------------------------- | --------------------------------------------- |
| `base64`     | `string`                           | **Required** - Base64-encoded image data      |
| `mediaType`  | `string`                           | **Required** - MIME type (e.g., 'image/jpeg') |
| `uint8Array` | `Uint8Array`                       | **Required** - Binary image data array        |
| `alt`        | `string`                           | Alternative text for accessibility            |
| `className`  | `string`                           | Additional CSS classes                        |
| `...props`   | `HTMLAttributes<HTMLImageElement>` | Standard img attributes                       |

## Keyboard interactions

| Key               | Description                                   |
| ----------------- | --------------------------------------------- |
| `Tab`             | Focus the image element                       |
| `Enter` / `Space` | No default action (images aren't interactive) |

## Data URL gotchas

**Invalid base64 breaks everything**: Bad base64 data crashes the browser's image decoder in React applications. Validate on the backend before sending to this component.

**Data URLs are huge in memory**: Each image becomes part of your DOM in Next.js projects. For large images or many images, consider storing on a CDN instead.

**No caching benefits**: Data URLs bypass browser image caching in JavaScript implementations. Users download the same image data every time.

**Alt text is required**: AI-generated images need descriptions in TypeScript components. Use the generation prompt as alt text when available.

**DALL-E images are always 1024x1024**: Set max-width or they'll break mobile layouts in React applications.

## Integration with other components

Works with [Loader](/ai/loader) for generation states in React applications. Combine with [PromptInput](/ai/prompt-input) for complete generation UI in Next.js projects. Drop into [Message](/ai/message) components for chat-based image sharing. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="image-formats" title="What image formats are supported?">
    Whatever Vercel AI SDK returns via mediaType in React applications. Usually image/jpeg or image/png from DALL-E in TypeScript components.
  </Accordion>

  <Accordion id="image-sizing" title="How do I control image dimensions?">
    Use className with Tailwind utilities in React applications. DALL-E returns 1024x1024, so set max-width or it'll be huge on mobile in Next.js projects.
  </Accordion>

  <Accordion id="error-handling" title="What if the image data is invalid?">
    Invalid base64 shows a broken image icon in React applications. Validate the data on your backend before sending it to this TypeScript component.
  </Accordion>

  <Accordion id="caching" title="Are generated images cached?">
    Nope. Data URLs bypass browser caching in JavaScript applications. Store images on a CDN if you need persistence and caching in React projects.
  </Accordion>

  <Accordion id="download" title="Can users download generated images?">
    Create a blob URL from the base64 data and trigger download in React applications. Right-click save works too in Next.js projects.
  </Accordion>
</Accordions>