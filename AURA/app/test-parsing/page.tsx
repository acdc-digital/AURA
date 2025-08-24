// TEST THINKING PARSING - Verify the thinking parsing logic works
// /Users/matthewsimon/Projects/AURA/AURA/app/test-parsing/page.tsx

"use client";

import { useState } from "react";
import { ThinkingMessage } from "@/app/_components/terminal/chat/_components/ThinkingMessage";

export default function TestParsingPage() {
  const [sampleThinking] = useState(`
1. **Understanding the request**: The user wants help creating a new React component. I need to understand what type of component, what functionality, and what framework specifics.

2. **Breaking down the task**: 
   - Analyze their project structure by checking package.json
   - Understand their existing component patterns
   - Create a template that fits their setup
   - Provide TypeScript interfaces if needed

3. **Required tools/resources**: 
   - Need to search their component directory
   - Check for existing patterns and styling approaches
   - Look at tsconfig.json for TypeScript settings

4. **Planning the approach**: I'll provide a flexible component template and ask clarifying questions about their specific needs.
  `);

  // Simple parsing function (mimicking the Convex function)
  const parseThinkingContent = (thinkingText: string) => {
    const tasks: Array<{
      id: string;
      title: string;
      items: Array<{ type: "text" | "file"; text: string; file?: { name: string } }>;
      status: "completed";
    }> = [];
    
    const tools: Array<{
      id: string;
      type: string;
      state: "output-available";
      input: { operation: string };
      output: string;
    }> = [];

    // Extract numbered steps and create tasks
    const stepMatches = thinkingText.match(/\d+\.\s*\*\*(.*?)\*\*:?\s*(.*?)(?=\d+\.\s*\*\*|$)/g);
    
    if (stepMatches) {
      stepMatches.forEach((step, index) => {
        const stepMatch = step.match(/\d+\.\s*\*\*(.*?)\*\*:?\s*(.*)/);
        if (stepMatch) {
          const [, title, description] = stepMatch;
          
          // Create task items from the description
          const items: Array<{ type: "text" | "file"; text: string; file?: { name: string } }> = [];
          const lines = description.trim().split('\n').filter(line => line.trim());
          
          lines.forEach(line => {
            const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
            if (cleanLine) {
              // Check if line mentions files
              if (cleanLine.includes('.json') || cleanLine.includes('.tsx') || cleanLine.includes('.ts') || cleanLine.includes('.js')) {
                const fileMatch = cleanLine.match(/([\w.-]+\.(json|tsx?|jsx?|md|yml|yaml))/);
                if (fileMatch) {
                  items.push({
                    type: "file" as const,
                    text: cleanLine.replace(fileMatch[0], '').trim() || "Working with",
                    file: { name: fileMatch[0] }
                  });
                } else {
                  items.push({ type: "text" as const, text: cleanLine });
                }
              } else {
                items.push({ type: "text" as const, text: cleanLine });
              }
            }
          });

          tasks.push({
            id: `task-${index + 1}`,
            title: title.trim(),
            items: items.length > 0 ? items : [{ type: "text" as const, text: description.trim() }],
            status: "completed" as const,
          });
        }
      });
    }

    // Look for tool-like operations mentioned in thinking
    const toolKeywords = ['search', 'analyze', 'scan', 'check', 'read', 'generate', 'create'];
    toolKeywords.forEach((keyword, index) => {
      if (thinkingText.toLowerCase().includes(keyword)) {
        const contextMatch = thinkingText.match(new RegExp(`.*${keyword}.*`, 'i'));
        if (contextMatch) {
          tools.push({
            id: `tool-${index + 1}`,
            type: keyword === 'search' ? 'project_search' : keyword === 'analyze' ? 'code_analysis' : `${keyword}_tool`,
            state: "output-available" as const,
            input: { operation: contextMatch[0].trim().substring(0, 100) },
            output: `Completed ${keyword} operation successfully`,
          });
        }
      }
    });

    return {
      status: "completed" as const,
      tasks: tasks.length > 0 ? tasks : undefined,
      tools: tools.length > 0 ? tools : undefined,
    };
  };

  const parsedData = parseThinkingContent(sampleThinking);

  return (
    <div className="min-h-screen bg-[#0e0e0e] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-[#cccccc]">
          <h1 className="text-2xl font-bold mb-2">Thinking Parsing Test</h1>
          <p className="text-[#858585]">Testing how thinking content gets converted to visual tasks and tools</p>
        </div>

        {/* Raw thinking text */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Raw Thinking Text</h2>
          <pre className="text-sm text-[#858585] whitespace-pre-wrap">{sampleThinking}</pre>
        </div>

        {/* Parsed result */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Parsed Visual Result</h2>
          <ThinkingMessage data={parsedData} />
        </div>

        {/* Expected behavior */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">How It Works</h2>
          <div className="text-sm text-[#858585] space-y-2">
            <p>1. <strong>User asks:</strong> &quot;Can you help me set up a new React component?&quot;</p>
            <p>2. <strong>AI thinks:</strong> Uses structured thinking with numbered steps</p>
            <p>3. <strong>Parsing:</strong> Converts thinking into visual tasks and tools</p>
            <p>4. <strong>Display:</strong> Shows thinking process before final answer</p>
            <p>5. <strong>Final Answer:</strong> Shows the actual helpful response</p>
          </div>
        </div>
      </div>
    </div>
  );
}
