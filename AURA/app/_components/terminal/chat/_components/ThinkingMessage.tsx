// THINKING MESSAGE COMPONENT - Display AI thinking process with tasks and tools
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/_components/ThinkingMessage.tsx

"use client";

import { FC } from "react";
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from "@/components/ai/task";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai/tool";
import { Loader2, Cloud } from "lucide-react";

interface ThinkingTask {
  id: string;
  title: string;
  items: Array<{
    type: "text" | "file";
    text: string;
    file?: {
      name: string;
      icon?: string;
    };
  }>;
  status: "pending" | "in_progress" | "completed";
}

interface ThinkingTool {
  id: string;
  type: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: Record<string, unknown>;
  output?: string;
  errorText?: string;
}

interface ThinkingData {
  tasks?: ThinkingTask[];
  tools?: ThinkingTool[];
  status?: "thinking" | "processing" | "completed";
}

interface ThinkingMessageProps {
  data: ThinkingData;
  className?: string;
}

export const ThinkingMessage: FC<ThinkingMessageProps> = ({ 
  data,
  className = ""
}) => {
  return (
    <div data-thinking="true" className={`thinking-message space-y-2 ${className}`}>
      {/* Thinking header */}
      <div className="flex items-center gap-2 text-[#cccccc] text-sm mb-3">
        {data.status !== "completed" && (
          <Loader2 className="h-3 w-3 animate-spin text-[#007acc]" />
        )}
        <div className="flex items-center gap-1">
          <Cloud className="h-4.5 w-4.5 text-[#858585] fill-none stroke-2" />
          <span className="text-[#858585]">Thinking...</span>
        </div>
        <span className="text-xs bg-[#2d2d2d] px-2 py-0.5 rounded text-[#666666]">
          {data.status || "thinking"}
        </span>
      </div>

      {/* Tasks */}
      {data.tasks && data.tasks.length > 0 && (
        <div className="space-y-2">
          {data.tasks.map((task) => (
            <Task key={task.id} defaultOpen={false}>
              <TaskTrigger title={task.title} />
              <TaskContent>
                {task.items.map((item, index) => (
                  <TaskItem key={index}>
                    {item.type === "file" && item.file ? (
                      <span>
                        {item.text} <TaskItemFile>{item.file.name}</TaskItemFile>
                      </span>
                    ) : (
                      item.text
                    )}
                  </TaskItem>
                ))}
              </TaskContent>
            </Task>
          ))}
        </div>
      )}

      {/* Tools */}
      {data.tools && data.tools.length > 0 && (
        <div className="space-y-2">
          {data.tools.map((tool) => (
            <Tool key={tool.id} defaultOpen={false}>
              <ToolHeader type={tool.type} state={tool.state} />
              <ToolContent>
                {tool.input && <ToolInput input={tool.input} />}
                {(tool.output || tool.errorText) && (
                  <ToolOutput output={tool.output} errorText={tool.errorText} />
                )}
              </ToolContent>
            </Tool>
          ))}
        </div>
      )}
    </div>
  );
};
