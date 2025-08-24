// AI TOOL COMPONENT - Collapsible tool execution display with status tracking
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/tool.tsx

"use client";

import { FC, ReactNode, ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";

interface ToolProps extends ComponentProps<typeof Collapsible> {
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

interface ToolHeaderProps {
  type: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  className?: string;
}

interface ToolContentProps extends ComponentProps<typeof CollapsibleContent> {
  className?: string;
  children: ReactNode;
}

interface ToolInputProps extends ComponentProps<'div'> {
  input: Record<string, unknown>;
  className?: string;
}

interface ToolOutputProps extends ComponentProps<'div'> {
  output?: ReactNode;
  errorText?: string;
  className?: string;
}

export const Tool: FC<ToolProps> = ({ 
  defaultOpen = false,
  className,
  children,
  ...props 
}) => {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn(
        "border border-[#2d2d2d] rounded-md bg-[#1a1a1a] max-w-xs",
        className
      )}
      {...props}
    >
      {children}
    </Collapsible>
  );
};

export const ToolHeader: FC<ToolHeaderProps> = ({ 
  type,
  state,
  className,
  ...props 
}) => {
  const getStatusIcon = () => {
    switch (state) {
      case "input-streaming":
        return <Loader2 className="h-2.5 w-2.5 animate-spin text-[#007acc]" />;
      case "input-available":
        return <Circle className="h-2.5 w-2.5 text-[#858585]" />;
      case "output-available":
        return <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />;
      case "output-error":
        return <XCircle className="h-2.5 w-2.5 text-red-500" />;
      default:
        return <Circle className="h-2.5 w-2.5 text-[#858585]" />;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case "input-streaming":
        return "streaming";
      case "input-available":
        return "ready";
      case "output-available":
        return "completed";
      case "output-error":
        return "error";
      default:
        return "pending";
    }
  };

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between px-2 py-1 text-left",
        "hover:bg-[#252525] transition-colors",
        "focus:outline-none",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-1.5 text-xs">
        {getStatusIcon()}
        <span className="font-medium text-[#cccccc]">{type}</span>
        <span className="text-xs text-[#858585] bg-[#2d2d2d] px-1.5 py-0.5 rounded">
          {getStatusText()}
        </span>
      </div>
      <ChevronDown className="h-2.5 w-2.5 text-[#858585] transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
};

export const ToolContent: FC<ToolContentProps> = ({ 
  className,
  children,
  ...props 
}) => {
  return (
    <CollapsibleContent
      className={cn(
        "border-t border-[#2d2d2d] px-2 pb-1",
        "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    >
      <div className="space-y-1 pt-1">
        {children}
      </div>
    </CollapsibleContent>
  );
};

export const ToolInput: FC<ToolInputProps> = ({ 
  input,
  className,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "text-xs",
        className
      )}
      {...props}
    >
      <div className="text-[#858585] mb-0.5">Parameters:</div>
      <pre className="bg-[#0e0e0e] p-1.5 rounded text-[#cccccc] overflow-x-auto text-xs">
        {JSON.stringify(input, null, 2)}
      </pre>
    </div>
  );
};

export const ToolOutput: FC<ToolOutputProps> = ({ 
  output,
  errorText,
  className,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "text-xs",
        className
      )}
      {...props}
    >
      {errorText ? (
        <>
          <div className="text-red-500 mb-0.5">Error:</div>
          <div className="bg-[#2d1a1a] border border-red-900/30 p-1.5 rounded text-red-400 text-xs">
            {errorText}
          </div>
        </>
      ) : output ? (
        <>
          <div className="text-[#858585] mb-0.5">Result:</div>
          <div className="bg-[#0e0e0e] p-1.5 rounded text-[#cccccc] text-xs">
            {output}
          </div>
        </>
      ) : null}
    </div>
  );
};
