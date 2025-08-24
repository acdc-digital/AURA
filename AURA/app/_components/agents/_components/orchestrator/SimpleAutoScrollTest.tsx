// SIMPLE AUTO-SCROLL TEST - Test implementation for debugging auto-scroll with streaming support
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/orchestrator/SimpleAutoScrollTest.tsx

"use client";

import { FC, useEffect, useRef, useState, useCallback } from "react";

interface SimpleAutoScrollTestProps {
  messages: Array<{ _id: string; content: string; role: string; createdAt: number }>;
  children: React.ReactNode;
  className?: string;
}

export const SimpleAutoScrollTest: FC<SimpleAutoScrollTestProps> = ({
  messages,
  children,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth scroll to bottom function
  const scrollToBottomSmooth = useCallback(() => {
    if (scrollRef.current && !isScrolling) {
      const element = scrollRef.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isScrolling]);

  // Instant scroll to bottom (for streaming updates)
  const scrollToBottomInstant = useCallback(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      const oldScrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      
      console.log('Before scroll:', {
        scrollTop: oldScrollTop,
        scrollHeight,
        clientHeight,
        maxScroll: scrollHeight - clientHeight
      });
      
      // Force scroll to bottom
      element.scrollTop = scrollHeight;
      
      // Verify the scroll actually happened
      setTimeout(() => {
        const newScrollTop = element.scrollTop;
        console.log('After scroll:', {
          scrollTop: newScrollTop,
          scrollHeight: element.scrollHeight,
          actuallyMoved: newScrollTop !== oldScrollTop
        });
      }, 0);
    }
  }, []);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      const isCurrentlyAtBottom = 
        Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 10;
      
      // Debug scroll position
      console.log('Scroll event:', {
        scrollTop: element.scrollTop,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        isAtBottom: isCurrentlyAtBottom,
        distanceFromBottom: element.scrollHeight - element.clientHeight - element.scrollTop
      });
      
      setIsAtBottom(isCurrentlyAtBottom);
      
      // Debounce scroll events
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    }
  }, []);

  // Auto-scroll when messages array changes (new messages)
  useEffect(() => {
    if (isAtBottom && !isScrolling) {
      console.log('Auto-scrolling for new message, messages length:', messages.length);
      scrollToBottomSmooth();
    }
  }, [messages.length, isAtBottom, isScrolling, scrollToBottomSmooth]);

  // Additional observer for thinking message changes (task expansions/updates)
  useEffect(() => {
    if (!scrollRef.current || !isAtBottom) return;

    const element = scrollRef.current;
    
    // Find all thinking message containers
    const thinkingMessages = element.querySelectorAll('[data-thinking="true"], .thinking-message, [class*="thinking"]');
    
    if (thinkingMessages.length === 0) return;

    const observers: MutationObserver[] = [];

    thinkingMessages.forEach((thinkingElement) => {
      const observer = new MutationObserver(() => {
        if (isAtBottom && !isScrolling) {
          console.log('Thinking message change detected, forcing scroll');
          requestAnimationFrame(() => {
            if (!scrollRef.current) return;
            
            const element = scrollRef.current;
            
            // Use multiple scroll methods to ensure it works
            element.scrollTop = element.scrollHeight;
            element.scrollTo({ top: element.scrollHeight, behavior: 'auto' });
            
            const lastChild = element.lastElementChild;
            if (lastChild) {
              lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
          });
        }
      });

      observer.observe(thinkingElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeOldValue: true,
      });

      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [messages.length, isAtBottom, isScrolling, scrollToBottomInstant]); // Re-run when message count changes

  // Auto-scroll for content changes (streaming updates) using MutationObserver
  useEffect(() => {
    if (!scrollRef.current || !isAtBottom) return;

    const element = scrollRef.current;
    
    // Use MutationObserver to detect DOM changes (streaming content updates)
    const observer = new MutationObserver((mutations) => {
      if (isAtBottom && !isScrolling) {
        let shouldScroll = false;
        
        // Check for relevant mutations
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldScroll = true;
            console.log('DOM childList change detected, scrolling');
          }
          if (mutation.type === 'characterData') {
            shouldScroll = true;
            console.log('Text content change detected, scrolling');
          }
          if (mutation.type === 'attributes') {
            // Detect changes in thinking components (tasks expanding/collapsing)
            if (mutation.attributeName === 'data-state' || 
                mutation.attributeName === 'aria-expanded' ||
                mutation.attributeName === 'class') {
              shouldScroll = true;
              console.log('Thinking component state change detected, scrolling');
            }
          }
        });
        
        if (shouldScroll) {
          // Use multiple approaches to ensure scroll happens
          requestAnimationFrame(() => {
            if (!scrollRef.current) return;
            
            const element = scrollRef.current;
            
            console.log('Attempting scroll with multiple methods');
            
            // Method 1: Direct scrollTop assignment
            element.scrollTop = element.scrollHeight;
            
            // Method 2: scrollTo as backup
            element.scrollTo({ top: element.scrollHeight, behavior: 'auto' });
            
            // Method 3: scrollIntoView on last element as final backup
            const lastChild = element.lastElementChild;
            if (lastChild) {
              lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
            
            console.log('All scroll methods attempted');
          });
        }
      }
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true, // Watch for attribute changes (thinking components)
      attributeFilter: ['data-state', 'aria-expanded', 'class'], // Specific attributes for thinking components
    });

    return () => {
      observer.disconnect();
    };
  }, [isAtBottom, isScrolling, scrollToBottomInstant]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      console.log('Manual scroll to bottom triggered');
      scrollToBottomSmooth();
      setIsAtBottom(true);
    }
  }, [scrollToBottomSmooth]);

  return (
    <div className={`relative flex flex-col flex-1 ${className}`}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto border-2 border-red-500 bg-gray-900"
      >
        {children}
        {/* Debug element to show scroll container is working */}
        <div className="h-4 bg-blue-500 opacity-20 flex items-center justify-center text-xs text-white">
          Scroll Container End
        </div>
      </div>
      
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}
    </div>
  );
};
