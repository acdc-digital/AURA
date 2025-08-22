// AI CONVERSATION COMPONENT - Auto-scrolling chat container with smooth animations
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/conversation.tsx

"use client";

import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ConversationProps {
  children: ReactNode;
  className?: string;
}

interface ConversationContentProps {
  children: ReactNode;
  className?: string;
}

export const Conversation: FC<ConversationProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex h-full flex-col overflow-hidden bg-background-primary",
        className
      )}
    >
      {children}
    </div>
  );
};

export const ConversationContent: FC<ConversationContentProps> = ({ 
  children, 
  className 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (shouldAutoScroll && contentRef.current && !isUserScrolling) {
      const scrollElement = contentRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [children, shouldAutoScroll, isUserScrolling]);

  // Handle scroll events to detect user scrolling
  const handleScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    setShouldAutoScroll(isAtBottom);
    
    // Detect if user is actively scrolling
    setIsUserScrolling(true);
    setTimeout(() => setIsUserScrolling(false), 150);
  };

  // Scroll to bottom button
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
      setShouldAutoScroll(true);
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className={cn(
          "h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-background-tertiary hover:scrollbar-thumb-text-quaternary",
          className
        )}
      >
        {children}
      </div>
      
      {/* Scroll to bottom button */}
      {!shouldAutoScroll && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 rounded-full bg-background-secondary p-2 shadow-lg transition-all hover:bg-background-tertiary"
          aria-label="Scroll to bottom"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-text-secondary"
          >
            <path d="M7 13l3 3 3-3" />
            <path d="M7 6l3 3 3-3" />
          </svg>
        </button>
      )}
    </div>
  );
};
