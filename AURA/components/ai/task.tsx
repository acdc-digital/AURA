// AI TASK COMPONENT - Collapsible task lists with file references and progress tracking
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/task.tsx

"use client";

import { FC, ReactNode, ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, FileText, Folder } from "lucide-react";

interface TaskProps extends ComponentProps<typeof Collapsible> {
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

interface TaskTriggerProps {
  title: string;
  className?: string;
}

interface TaskContentProps extends ComponentProps<typeof CollapsibleContent> {
  className?: string;
  children: ReactNode;
}

interface TaskItemProps extends ComponentProps<'div'> {
  className?: string;
  children: ReactNode;
}

interface TaskItemFileProps extends ComponentProps<'div'> {
  className?: string;
  children: ReactNode;
}

export const Task: FC<TaskProps> = ({ 
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

export const TaskTrigger: FC<TaskTriggerProps> = ({ 
  title,
  className,
  ...props 
}) => {
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
        <Folder className="h-2.5 w-2.5 text-[#007acc]" />
        <span className="font-medium text-[#cccccc]">{title}</span>
      </div>
      <ChevronDown className="h-2.5 w-2.5 text-[#858585] transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
};

export const TaskContent: FC<TaskContentProps> = ({ 
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
      <div className="space-y-0.5 pt-1">
        {children}
      </div>
    </CollapsibleContent>
  );
};

export const TaskItem: FC<TaskItemProps> = ({ 
  className,
  children,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs text-[#cccccc] px-1.5 py-0.5",
        "border-l-2 border-[#333333] ml-1.5",
        className
      )}
      {...props}
    >
      <div className="w-0.5 h-0.5 bg-[#666666] rounded-full flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export const TaskItemFile: FC<TaskItemFileProps> = ({ 
  className,
  children,
  ...props 
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1 py-0.5 rounded",
        "bg-[#2d2d2d] text-[#cccccc] text-xs font-mono",
        className
      )}
      {...props}
    >
      <FileText className="h-2 w-2" />
      {children}
    </span>
  );
};
