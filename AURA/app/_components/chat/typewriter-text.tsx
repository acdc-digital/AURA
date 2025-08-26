// TYPEWRITER TEXT COMPONENT - Typewriter effect for streaming AI responses
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/chat/typewriter-text.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
  speed?: number;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export function TypewriterText({
  text,
  isStreaming,
  className = "",
  speed = 30, // milliseconds per character
  onComplete,
  children
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs for managing the typewriter state
  const queueRef = useRef<string>("");
  const displayIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // Clear the typewriter interval
  const clearTypewriter = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Start the typewriter effect
  const startTypewriter = useCallback(() => {
    if (intervalRef.current) return; // Already running
    
    setIsTyping(true);
    
    intervalRef.current = setInterval(() => {
      const currentQueue = queueRef.current;
      const currentIndex = displayIndexRef.current;
      
      if (currentIndex < currentQueue.length) {
        // Type next character
        const nextIndex = currentIndex + 1;
        setDisplayedText(currentQueue.slice(0, nextIndex));
        displayIndexRef.current = nextIndex;
      } else if (!isStreaming) {
        // We've caught up and streaming is done
        clearTypewriter();
        setIsTyping(false);
        onComplete?.();
      }
      // If streaming is still active, keep the interval running
      // even if we've caught up, in case more content arrives
    }, speed);
  }, [speed, isStreaming, onComplete, clearTypewriter]);

  // Update the content queue when new text arrives
  useEffect(() => {
    if (!text) {
      // Reset everything if no text
      queueRef.current = "";
      displayIndexRef.current = 0;
      setDisplayedText("");
      setIsTyping(false);
      clearTypewriter();
      isInitializedRef.current = false;
      return;
    }

    // Update the queue with new content
    queueRef.current = text;
    
    // Initialize or restart typewriter if needed
    if (!isInitializedRef.current || !isStreaming) {
      if (!isStreaming) {
        // If not streaming, show everything immediately
        setDisplayedText(text);
        displayIndexRef.current = text.length;
        setIsTyping(false);
        clearTypewriter();
        onComplete?.();
      } else if (!intervalRef.current) {
        // Start typewriter for streaming content
        startTypewriter();
      }
      isInitializedRef.current = true;
    }
  }, [text, isStreaming, startTypewriter, onComplete, clearTypewriter]);

  // Handle streaming state changes
  useEffect(() => {
    if (!isStreaming && queueRef.current) {
      // Streaming just finished - let typewriter catch up, then stop
      if (displayIndexRef.current < queueRef.current.length) {
        // Still typing, let it finish naturally
        return;
      } else {
        // Already caught up
        clearTypewriter();
        setIsTyping(false);
        onComplete?.();
      }
    } else if (isStreaming && queueRef.current && !intervalRef.current) {
      // Streaming started - begin typewriter
      startTypewriter();
    }
  }, [isStreaming, startTypewriter, onComplete, clearTypewriter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTypewriter();
    };
  }, [clearTypewriter]);

  return (
    <div className={className}>
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {children}
      {/* Show cursor while typing */}
      {isTyping && (
        <span className="inline-block w-0.5 h-4 bg-[#4ec9b0] ml-0.5 animate-pulse" />
      )}
    </div>
  );
}
