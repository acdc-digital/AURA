// AI MESSAGE COMPONENT - Chat interface messages with avatars and role-based styling
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/message.tsx

"use client";

import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageProps {
  from: "user" | "assistant";
  children: ReactNode;
  className?: string;
}

interface MessageContentProps {
  children: ReactNode;
  className?: string;
}

interface MessageAvatarProps {
  children: ReactNode;
  className?: string;
}

export const Message: FC<MessageProps> = ({ 
  from, 
  children, 
  className 
}) => {
  const isUser = from === "user";
  
  return (
    <div 
      className={cn(
        "group flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MessageContent: FC<MessageContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex-1 space-y-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MessageAvatar: FC<MessageAvatarProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex-shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
};
