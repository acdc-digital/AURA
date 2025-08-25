// AI CONVERSATION COMPONENT - Auto-scrolling chat container with stick-to-bottom behavior
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/conversation.tsx

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export interface ConversationProps extends ComponentProps<typeof StickToBottom> {
  className?: string;
}

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex flex-col flex-1 h-full", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export interface ConversationContentProps extends ComponentProps<typeof StickToBottom.Content> {
  className?: string;
}

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn("flex-1 overflow-y-auto p-4 space-y-4", className)}
    {...props}
  />
);

export interface ConversationScrollButtonProps extends ComponentProps<typeof Button> {
  className?: string;
}

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full shadow-lg",
          "bg-[#569cd6] hover:bg-[#4a8cc7] text-white border border-[#2d2d2d]",
          "transition-all duration-200 ease-in-out",
          "h-10 w-10 p-0",
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="default"
        aria-label="Scroll to bottom"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
