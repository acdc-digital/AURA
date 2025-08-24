// AI ACTIONS COMPONENT - Compact terminal-style action buttons for AI chat interfaces
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/actions.tsx

"use client";

import { FC, ReactNode, ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface ActionProps extends ComponentProps<typeof Button> {
  label: string;
  children: ReactNode;
}

export const Actions: FC<ActionsProps> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Action: FC<ActionProps> = ({ 
  label,
  children,
  variant = "ghost",
  size = "sm",
  className,
  ...props 
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-2 w-2 p-0 text-[#666666] hover:text-[#888888]",
        "border-0 bg-transparent hover:bg-transparent",
        "focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      aria-label={label}
      {...props}
    >
      {children}
    </Button>
  );
};
