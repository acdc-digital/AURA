// DEMO THINKING SIMULATION - Shows how tools and tasks work in practice
// /Users/matthewsimon/Projects/AURA/AURA/app/demo-thinking/page.tsx

"use client";

import { useState } from "react";
import { ThinkingMessage } from "@/app/_components/terminal/chat/_components/ThinkingMessage";
import { Button } from "@/components/ui/button";

export default function DemoThinkingPage() {
  const [step, setStep] = useState(0);

  // Simulate the AI thinking process step by step
  const steps = [
    // Step 1: User asks a question
    {
      title: "User Question",
      content: "User asks: 'Can you help me set up a new React component?'",
      thinkingData: null,
    },
    
    // Step 2: AI starts thinking - shows what it's planning to do
    {
      title: "AI Starts Thinking",
      content: "💭 AI is thinking about how to help...",
      thinkingData: {
        status: "thinking" as const,
        tasks: [
          {
            id: "task-1",
            title: "Analyzing request",
            items: [
              { type: "text" as const, text: "Understanding user needs" },
              { type: "text" as const, text: "Planning component structure" },
            ],
            status: "in_progress" as const,
          }
        ]
      }
    },

    // Step 3: AI uses tools to gather information
    {
      title: "AI Uses Tools",
      content: "🔧 AI is using tools to help...",
      thinkingData: {
        status: "processing" as const,
        tasks: [
          {
            id: "task-1", 
            title: "Analyzing request",
            items: [
              { type: "text" as const, text: "Understanding user needs ✓" },
              { type: "text" as const, text: "Planning component structure ✓" },
            ],
            status: "completed" as const,
          },
          {
            id: "task-2",
            title: "Gathering information", 
            items: [
              { type: "text" as const, text: "Checking project structure" },
              { type: "file" as const, text: "Reading", file: { name: "package.json" } },
              { type: "file" as const, text: "Scanning", file: { name: "components/" } },
            ],
            status: "in_progress" as const,
          }
        ],
        tools: [
          {
            id: "tool-1",
            type: "file_search",
            state: "input-streaming" as const,
            input: { query: "*.tsx", directory: "./components" },
          }
        ]
      }
    },

    // Step 4: Tools complete, more tasks added
    {
      title: "AI Processes Information",
      content: "📊 AI found information and is processing...",
      thinkingData: {
        status: "processing" as const,
        tasks: [
          {
            id: "task-1",
            title: "Analyzing request",
            items: [
              { type: "text" as const, text: "Understanding user needs ✓" },
              { type: "text" as const, text: "Planning component structure ✓" },
            ],
            status: "completed" as const,
          },
          {
            id: "task-2",
            title: "Gathering information",
            items: [
              { type: "text" as const, text: "Checking project structure ✓" },
              { type: "file" as const, text: "Reading", file: { name: "package.json" } },
              { type: "file" as const, text: "Scanning", file: { name: "components/" } },
              { type: "text" as const, text: "Found existing components" },
            ],
            status: "completed" as const,
          },
          {
            id: "task-3",
            title: "Creating component template",
            items: [
              { type: "text" as const, text: "Designing component structure" },
              { type: "text" as const, text: "Adding TypeScript interfaces" },
              { type: "text" as const, text: "Including best practices" },
            ],
            status: "in_progress" as const,
          }
        ],
        tools: [
          {
            id: "tool-1", 
            type: "file_search",
            state: "output-available" as const,
            input: { query: "*.tsx", directory: "./components" },
            output: "Found 12 component files: Button.tsx, Input.tsx, Modal.tsx..."
          },
          {
            id: "tool-2",
            type: "template_generator",
            state: "input-streaming" as const,
            input: { type: "react-component", framework: "nextjs" },
          }
        ]
      }
    },

    // Step 5: All tasks complete, ready to respond
    {
      title: "AI Ready to Respond",
      content: "✅ AI has finished thinking and is ready to respond!",
      thinkingData: {
        status: "completed" as const,
        tasks: [
          {
            id: "task-1",
            title: "Analyzing request",
            items: [
              { type: "text" as const, text: "Understanding user needs ✓" },
              { type: "text" as const, text: "Planning component structure ✓" },
            ],
            status: "completed" as const,
          },
          {
            id: "task-2",
            title: "Gathering information",
            items: [
              { type: "text" as const, text: "Checking project structure ✓" },
              { type: "file" as const, text: "Reading", file: { name: "package.json" } },
              { type: "file" as const, text: "Scanning", file: { name: "components/" } },
              { type: "text" as const, text: "Found existing components ✓" },
            ],
            status: "completed" as const,
          },
          {
            id: "task-3",
            title: "Creating component template", 
            items: [
              { type: "text" as const, text: "Designing component structure ✓" },
              { type: "text" as const, text: "Adding TypeScript interfaces ✓" },
              { type: "text" as const, text: "Including best practices ✓" },
              { type: "text" as const, text: "Component ready!" },
            ],
            status: "completed" as const,
          }
        ],
        tools: [
          {
            id: "tool-1",
            type: "file_search", 
            state: "output-available" as const,
            input: { query: "*.tsx", directory: "./components" },
            output: "Found 12 component files: Button.tsx, Input.tsx, Modal.tsx..."
          },
          {
            id: "tool-2",
            type: "template_generator",
            state: "output-available" as const,
            input: { type: "react-component", framework: "nextjs" },
            output: "Generated TypeScript React component with props interface, styling, and documentation"
          }
        ]
      }
    },

    // Step 6: Final AI response (normal message)
    {
      title: "AI Response",
      content: `🤖 Orchestrator: I'll help you create a new React component! Based on your project structure, here's a template:

\`\`\`tsx
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onClick 
}) => {
  return (
    <div className="p-4 border rounded">
      <h2>{title}</h2>
      {onClick && <button onClick={onClick}>Click me</button>}
    </div>
  );
};
\`\`\`

This follows your project's TypeScript patterns and includes proper props typing!`,
      thinkingData: null,
    }
  ];

  return (
    <div className="min-h-screen bg-[#0e0e0e] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-[#cccccc]">
          <h1 className="text-2xl font-bold mb-2">How AI Thinking Works</h1>
          <p className="text-[#858585]">Step-by-step demonstration of the thinking process</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            variant="outline"
          >
            Previous Step
          </Button>
          <Button 
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
            variant="outline"
          >
            Next Step
          </Button>
          <div className="flex-1" />
          <span className="text-[#858585] text-sm py-2">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        {/* Current Step Display */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-[#cccccc] mb-4">
            {steps[step].title}
          </h2>

          {steps[step].thinkingData ? (
            <ThinkingMessage data={steps[step].thinkingData!} />
          ) : (
            <div className="text-[#cccccc] whitespace-pre-wrap">
              {steps[step].content}
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h3 className="text-md font-semibold text-[#cccccc] mb-3">What&apos;s Happening</h3>
          <div className="text-sm text-[#858585]">
            {step === 0 && "User asks a question. This is where it all starts."}
            {step === 1 && "AI receives the question and starts thinking. Shows initial tasks it plans to do."}
            {step === 2 && "AI starts using tools (like searching files) while working through tasks."}
            {step === 3 && "Tools complete and provide results. AI processes this information and adds more tasks."}
            {step === 4 && "All tasks and tools finish. AI has gathered all needed information."}
            {step === 5 && "AI provides the final response with the helpful information."}
          </div>
        </div>

        {/* Key Points */}
        <div className="border border-[#2d2d2d] rounded-lg p-6 bg-[#1a1a1a]">
          <h3 className="text-md font-semibold text-[#cccccc] mb-3">Key Points</h3>
          <div className="text-sm text-[#858585] space-y-2">
            <p>• <strong>Tasks</strong> = What the AI is planning/doing (like &quot;analyze request&quot;, &quot;create template&quot;)</p>
            <p>• <strong>Tools</strong> = External operations (like file search, web search, code generation)</p>
            <p>• <strong>Status</strong> = Shows if AI is thinking, processing, or completed</p>
            <p>• <strong>Real-time</strong> = Updates as AI works, so users see progress instead of loading spinner</p>
            <p>• <strong>Transparency</strong> = Users understand what AI is doing and why it takes time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
