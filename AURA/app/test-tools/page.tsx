// TEST TOOLS AND TASKS PAGE - Demonstration of AI thinking components
// /Users/matthewsimon/Projects/AURA/AURA/app/test-tools/page.tsx

"use client";

import { useState } from "react";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai/tool";
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from "@/components/ai/task";
import { ThinkingMessage } from "@/app/_components/terminal/chat/_components/ThinkingMessage";
import { Button } from "@/components/ui/button";

export default function TestToolsPage() {
  const [toolState, setToolState] = useState<"input-streaming" | "input-available" | "output-available" | "output-error">("input-streaming");

  // Sample thinking data
  const sampleThinkingData = {
    status: "processing" as const,
    tasks: [
      {
        id: "task-1",
        title: "Analyzing project structure",
        items: [
          { type: "text" as const, text: "Scanning workspace for configuration files" },
          { type: "file" as const, text: "Found", file: { name: "package.json" } },
          { type: "file" as const, text: "Reading", file: { name: "tsconfig.json" } },
          { type: "text" as const, text: "Identifying project type: Next.js with TypeScript" },
        ],
        status: "completed" as const,
      },
      {
        id: "task-2",
        title: "Preparing development environment",
        items: [
          { type: "text" as const, text: "Checking dependencies" },
          { type: "text" as const, text: "Validating configuration" },
        ],
        status: "in_progress" as const,
      },
    ],
    tools: [
      {
        id: "tool-1",
        type: "file_search",
        state: "output-available" as const,
        input: { query: "*.json", directory: "/workspace" },
        output: "Found 3 configuration files: package.json, tsconfig.json, next.config.js",
      },
      {
        id: "tool-2",
        type: "web_search",
        state: "input-streaming" as const,
        input: { query: "Next.js best practices 2024" },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-[#cccccc]">
          <h1 className="text-2xl font-bold mb-2">Tools & Tasks Test Page</h1>
          <p className="text-[#858585]">Testing the AI thinking visualization components</p>
        </div>

        {/* Thinking Message Demo */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Thinking Message Component</h2>
          <ThinkingMessage data={sampleThinkingData} />
        </div>

        {/* Individual Tool Demo */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Individual Tool Component</h2>
          
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setToolState("input-streaming")}
              className={toolState === "input-streaming" ? "bg-[#007acc] text-white" : ""}
            >
              Streaming
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setToolState("input-available")}
              className={toolState === "input-available" ? "bg-[#007acc] text-white" : ""}
            >
              Ready
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setToolState("output-available")}
              className={toolState === "output-available" ? "bg-[#007acc] text-white" : ""}
            >
              Completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setToolState("output-error")}
              className={toolState === "output-error" ? "bg-[#007acc] text-white" : ""}
            >
              Error
            </Button>
          </div>

          <Tool defaultOpen={toolState === "output-available" || toolState === "output-error"}>
            <ToolHeader type="web_search" state={toolState} />
            <ToolContent>
              <ToolInput input={{ query: "Next.js development best practices", limit: 10 }} />
              {toolState === "output-available" && (
                <ToolOutput output="Found 10 results about Next.js best practices for 2024..." />
              )}
              {toolState === "output-error" && (
                <ToolOutput errorText="Rate limit exceeded. Please try again in 60 seconds." />
              )}
            </ToolContent>
          </Tool>
        </div>

        {/* Individual Task Demo */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Individual Task Component</h2>
          
          <Task defaultOpen>
            <TaskTrigger title="Setting up development environment" />
            <TaskContent>
              <TaskItem>Checking Node.js version compatibility</TaskItem>
              <TaskItem>
                Installing dependencies from <TaskItemFile>package.json</TaskItemFile>
              </TaskItem>
              <TaskItem>
                Configuring TypeScript from <TaskItemFile>tsconfig.json</TaskItemFile>
              </TaskItem>
              <TaskItem>Setting up development server</TaskItem>
              <TaskItem>Ready to start development!</TaskItem>
            </TaskContent>
          </Task>
        </div>

        {/* Usage Instructions */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Implementation Notes</h2>
          <div className="text-sm text-[#858585] space-y-2">
            <p>• <strong>Tasks</strong> show what the AI is working on step-by-step</p>
            <p>• <strong>Tools</strong> display API calls and external operations</p>
            <p>• <strong>ThinkingMessage</strong> combines both for complete visibility</p>
            <p>• All components are terminal-themed and collapsible</p>
            <p>• Perfect for showing AI agent progress before responses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
