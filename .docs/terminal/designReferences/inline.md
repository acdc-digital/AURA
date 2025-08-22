# React AI Inline Citation
URL: /ai/inline-citation
Academic-style inline citations with hover details. Build credible AI content with React, Next.js, and TypeScript, featuring source carousels and contextual information for shadcn/ui applications.

***

title: React AI Inline Citation
description: Academic-style inline citations with hover details. Build credible AI content with React, Next.js, and TypeScript, featuring source carousels and contextual information for shadcn/ui applications.
icon: Quote
component: true
---------------

<PoweredBy
  packages={[
  { name: "AI Elements", url: "https://ai-sdk.dev/elements/overview" },
  { name: "Radix UI", url: "https://radix-ui.com/" },
  { name: "Embla Carousel", url: "https://emblacarousel.com/" },
]}
/>

<Callout title="Trying to implement AI Elements?">
  [Join our Discord community](https://discord.com/invite/Z9NVtNE7bj) for help
  from other developers.
</Callout>

<br />

Academic-style citations for AI content that needs to show sources and build trust. Hover to see source details, navigate between multiple sources, and give users a way to verify claims in React applications.

### Inline citation with sources

Citation badges with hover details and source carousel:

<Preview path="ai/inline-citation" />

Shows source hostnames with counts, reveals detailed info on hover, and provides carousel navigation for multiple sources in TypeScript components. Works with any citation format—just pass URLs and metadata.

## Installation

<Installer packageName="ai" />

## Usage

```tsx
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
  InlineCitationText,
} from "@/components/ai/inline-citation";

<InlineCitation>
  <InlineCitationText>This text has a citation</InlineCitationText>
  <InlineCitationCard>
    <InlineCitationCardTrigger sources={["https://example.com"]} />
    <InlineCitationCardBody>
      <InlineCitationCarousel>
        <InlineCitationCarouselContent>
          <InlineCitationCarouselItem>
            <InlineCitationSource
              title="Example Source"
              url="https://example.com"
              description="A reliable source"
            />
          </InlineCitationCarouselItem>
        </InlineCitationCarouselContent>
      </InlineCitationCarousel>
    </InlineCitationCardBody>
  </InlineCitationCard>
</InlineCitation>;
```

## Why not just show links at the bottom?

Most AI apps dump source links at the end like an afterthought in React applications. Users can't tell which claim comes from which source. Inline citations connect claims to sources immediately.

Academic papers figured this out decades ago. The \[1] format lets readers verify specific claims without losing their place in the content in Next.js projects.

## Usage with Vercel AI SDK

Generate cited content using Vercel AI SDK's experimental\_useObject for structured citation data in React applications:

```tsx
"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationSource,
  InlineCitationQuote,
} from "@/components/ai/inline-citation";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const citationSchema = z.object({
  content: z.string(),
  citations: z.array(
    z.object({
      number: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      quote: z.string().optional(),
    })
  ),
});

export default function CitationDemo() {
  const { object, submit, isLoading } = useObject({
    api: "/api/citation",
    schema: citationSchema,
  });

  return (
    <div className="space-y-4">
      <Button
        onClick={() => submit({ prompt: "artificial intelligence" })}
        disabled={isLoading}
      >
        Generate AI Content
      </Button>

      {object?.content && (
        <div className="prose max-w-none">
          <p>
            {object.content.split(/(\[\d+\])/).map((part, index) => {
              const citationMatch = part.match(/\[(\d+)\]/);
              if (citationMatch) {
                const citationNumber = citationMatch[1];
                const citation = object.citations?.find(
                  (c) => c.number === citationNumber
                );

                if (citation) {
                  return (
                    <InlineCitation key={index}>
                      <InlineCitationCard>
                        <InlineCitationCardTrigger sources={[citation.url]} />
                        <InlineCitationCardBody>
                          <InlineCitationCarousel>
                            <InlineCitationCarouselHeader>
                              <InlineCitationCarouselIndex />
                            </InlineCitationCarouselHeader>
                            <InlineCitationCarouselContent>
                              <InlineCitationCarouselItem>
                                <InlineCitationSource
                                  title={citation.title}
                                  url={citation.url}
                                  description={citation.description}
                                />
                                {citation.quote && (
                                  <InlineCitationQuote>
                                    {citation.quote}
                                  </InlineCitationQuote>
                                )}
                              </InlineCitationCarouselItem>
                            </InlineCitationCarouselContent>
                          </InlineCitationCarousel>
                        </InlineCitationCardBody>
                      </InlineCitationCard>
                    </InlineCitation>
                  );
                }
              }
              return part;
            })}
          </p>
        </div>
      )}
    </div>
  );
}
```

Backend schema for citation generation:

```tsx
// app/api/citation/route.ts
import { streamObject } from "ai";
import { z } from "zod";

const citationSchema = z.object({
  content: z.string(),
  citations: z.array(
    z.object({
      number: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      quote: z.string().optional(),
    })
  ),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: "openai/gpt-4o",
    schema: citationSchema,
    prompt: `Generate content about ${prompt} with proper citations marked as [1], [2], etc.`,
  });

  return result.toTextStreamResponse();
}
```

## Features

* Hover cards that don't break on mobile (click also works) in React applications
* Carousel navigation for multiple sources per citation in Next.js projects
* Shows hostname and source count in badges with TypeScript support
* Optional quote blocks for relevant excerpts
* Keyboard navigation between sources in JavaScript implementations
* Works with any Vercel AI SDK setup in modern React frameworks
* Free open source component designed for research AI, fact-checking, and credible content generation

## API Reference

### InlineCitation

Container for citation text and card.

| Prop       | Type                     | Description                  |
| ---------- | ------------------------ | ---------------------------- |
| `...props` | `ComponentProps<'span'>` | Spreads to root span element |

### InlineCitationText

Styled text that shows hover effects.

| Prop       | Type                     | Description             |
| ---------- | ------------------------ | ----------------------- |
| `...props` | `ComponentProps<'span'>` | Spreads to span element |

### InlineCitationCard

Hover card container for citation details.

| Prop       | Type                               | Description                    |
| ---------- | ---------------------------------- | ------------------------------ |
| `...props` | `ComponentProps<typeof HoverCard>` | Spreads to HoverCard component |

### InlineCitationCardTrigger

Badge trigger showing source hostname and count.

| Prop       | Type                           | Description                         |
| ---------- | ------------------------------ | ----------------------------------- |
| `sources`  | `string[]`                     | **Required** - Array of source URLs |
| `...props` | `ComponentProps<typeof Badge>` | Spreads to Badge component          |

### InlineCitationCardBody

Content container for citation details.

| Prop       | Type                    | Description            |
| ---------- | ----------------------- | ---------------------- |
| `...props` | `ComponentProps<'div'>` | Spreads to div element |

### InlineCitationCarousel

Carousel for navigating multiple citations.

| Prop       | Type                              | Description                   |
| ---------- | --------------------------------- | ----------------------------- |
| `...props` | `ComponentProps<typeof Carousel>` | Spreads to Carousel component |

### InlineCitationCarouselContent

Content wrapper for carousel items.

| Prop       | Type                    | Description                |
| ---------- | ----------------------- | -------------------------- |
| `...props` | `ComponentProps<'div'>` | Spreads to CarouselContent |

### InlineCitationCarouselItem

Individual citation item in carousel.

| Prop       | Type                    | Description             |
| ---------- | ----------------------- | ----------------------- |
| `...props` | `ComponentProps<'div'>` | Spreads to CarouselItem |

### InlineCitationSource

Source information display.

| Prop          | Type                    | Description            |
| ------------- | ----------------------- | ---------------------- |
| `title`       | `string`                | Source title           |
| `url`         | `string`                | Source URL             |
| `description` | `string`                | Source description     |
| `...props`    | `ComponentProps<'div'>` | Spreads to div element |

### InlineCitationQuote

Styled blockquote for excerpts.

| Prop       | Type                           | Description                   |
| ---------- | ------------------------------ | ----------------------------- |
| `...props` | `ComponentProps<'blockquote'>` | Spreads to blockquote element |

## Keyboard interactions

| Key                        | Description            |
| -------------------------- | ---------------------- |
| `Tab`                      | Focus citation trigger |
| `Enter` / `Space`          | Open citation card     |
| `Escape`                   | Close citation card    |
| `ArrowLeft` / `ArrowRight` | Navigate carousel      |

## Citation gotchas that will bite you

**Invalid URLs break hostname extraction**: The badge shows the hostname from the URL in React applications. Bad URLs will show 'unknown' or crash the component.

**Too many sources overwhelm users**: Keep it to 3-5 sources per citation max in Next.js projects. More than that and nobody reads them.

**Mobile hover doesn't work**: Hover cards fail on touch devices in JavaScript implementations. This component supports click, but test on mobile thoroughly.

**AI hallucinated citations**: Validate that cited sources actually contain the claimed information in TypeScript applications. LLMs make up citations constantly.

**Badge sizing breaks with long hostnames**: Very long domain names can break the layout in React components. Consider truncating hostnames.

## Integration with other components

Works great in [Response](/ai/response) components for markdown content in React applications. Drop into [Message](/ai/message) for cited chat responses in Next.js projects. Combine with [Actions](/ai/actions) for citation management like copy or verification. This free open source component integrates seamlessly with modern JavaScript frameworks.

## Questions developers actually ask

<Accordions type="single">
  <Accordion id="citation-formatting" title="How do I format citation numbers in text?">
    Use square brackets like \[1], \[2] in React applications. This component splits on this pattern to insert citation badges.
  </Accordion>

  <Accordion id="multiple-sources" title="Can one citation have multiple sources?">
    Yeah. Pass multiple URLs to the sources array in TypeScript components. The carousel lets users navigate between them in React applications.
  </Accordion>

  <Accordion id="invalid-urls" title="What happens with invalid URLs?">
    Hostname extraction fails and shows 'unknown' in JavaScript implementations. Validate URLs on your backend before sending them to this React component.
  </Accordion>

  <Accordion id="mobile-hover" title="How do citations work on mobile?">
    Hover doesn't work on touch devices in React applications. This component supports click interaction, but test it thoroughly on mobile in Next.js projects.
  </Accordion>

  <Accordion id="citation-styling" title="Can I customize the badge appearance?">
    Pass className to InlineCitationCardTrigger in TypeScript components. Uses shadcn/ui Badge styling by default in React applications.
  </Accordion>
</Accordions>