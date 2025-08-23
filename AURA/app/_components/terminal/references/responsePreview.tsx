// RESPONSE COMPONENT PREVIEW - Test enhanced markdown capabilities
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/references/responsePreview.tsx

"use client";

import { Response } from "@/components/ai/response";
import { useState } from "react";

export function ResponsePreview() {
  const [streamingText, setStreamingText] = useState("");
  
  // Demo markdown content with various features
  const demoContent = `# Enhanced AI Response Demo

## Features Overview

The new **Response** component includes:

### 1. Streaming Optimization
- Auto-completes **incomplete bold**
- Handles *incomplete italic* 
- Fixes \`incomplete code\`
- Manages ~~incomplete strikethrough~~

### 2. Code Highlighting

Here's some JavaScript:
\`\`\`javascript
const greeting = "Hello, world!";
console.log(greeting);

// Function with streaming support
function parseMarkdown(text) {
  return text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
}
\`\`\`

### 3. Advanced Features

- [External links](https://example.com) with security
- Tables with proper styling:

| Feature | Status | Notes |
|---------|---------|-------|
| Streaming | ✅ | Auto-completion |
| Code blocks | ✅ | Syntax highlighting |
| Math | ✅ | $E = mc^2$ |
| Security | ✅ | XSS protection |

### 4. Lists and Quotes

- List item 1
- List item 2
  - Nested item
  - Another nested item

> This is a blockquote demonstrating
> the enhanced markdown support.

### 5. Math Support

Inline math: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

---

**Note**: All formatting is optimized for streaming AI responses! 🚀`;

  const simulateStreaming = () => {
    setStreamingText("");
    let index = 0;
    const interval = setInterval(() => {
      if (index < demoContent.length) {
        setStreamingText(demoContent.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-[#0d1117] text-[#cccccc] min-h-screen">
      <h1 className="text-2xl font-bold text-[#569cd6] mb-4">
        Enhanced Response Component Demo
      </h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={simulateStreaming}
          className="px-4 py-2 bg-[#569cd6] text-white rounded hover:bg-[#4a8cc7] transition-colors"
        >
          Simulate Streaming
        </button>
        <button
          onClick={() => setStreamingText(demoContent)}
          className="px-4 py-2 bg-[#4ec9b0] text-white rounded hover:bg-[#42b09e] transition-colors"
        >
          Show Full Content
        </button>
        <button
          onClick={() => setStreamingText("")}
          className="px-4 py-2 bg-[#666] text-white rounded hover:bg-[#777] transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#4ec9b0] mb-4">
          Streaming Response Output:
        </h2>
        <div className="border border-[#2d2d2d] rounded p-4 bg-[#0d1117]">
          <Response
            className="text-sm leading-relaxed [&>*]:text-[#cccccc] [&_strong]:text-[#569cd6] [&_strong]:font-bold [&_em]:text-[#4ec9b0] [&_em]:italic [&_code]:bg-[#1e1e1e] [&_code]:text-[#ce9178] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-[#007acc] [&_a]:underline [&_h1]:text-[#569cd6] [&_h1]:font-bold [&_h1]:text-xl [&_h2]:text-[#569cd6] [&_h2]:font-bold [&_h2]:text-lg [&_h3]:text-[#4ec9b0] [&_h3]:font-medium [&_h3]:text-base"
            parseIncompleteMarkdown={true}
          >
            {streamingText}
          </Response>
        </div>
      </div>

      <div className="text-sm text-[#8b949e]">
        <p>
          <strong>Instructions:</strong> Click "Simulate Streaming" to see how the component
          handles incomplete markdown during streaming. Notice how formatting is auto-completed
          and broken elements are hidden until ready.
        </p>
      </div>
    </div>
  );
}
