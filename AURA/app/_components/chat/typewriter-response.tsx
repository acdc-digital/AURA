// TYPEWRITER RESPONSE COMPONENT - Response component with typewriter effect for streaming
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/chat/typewriter-response.tsx

"use client";

import { memo, useMemo } from "react";
import { TypewriterText } from "./typewriter-text";
import { Response, ResponseProps } from "./response";

interface TypewriterResponseProps extends ResponseProps {
  isStreaming?: boolean;
  typewriterSpeed?: number;
}

/**
 * Enhanced Response component with typewriter effect for streaming AI responses.
 * Uses TypewriterText for streaming content and falls back to regular Response for completed messages.
 */
const TypewriterResponseComponent = memo<TypewriterResponseProps>(({
  children,
  isStreaming = false,
  typewriterSpeed = 35, // Slightly slower for better visual effect
  parseIncompleteMarkdown = false,
  className = "",
  ...props
}) => {
  const content = useMemo(() => {
    return typeof children === 'string' ? children : '';
  }, [children]);

  // For streaming messages, use typewriter effect with plain text
  if (isStreaming && content) {
    return (
      <div className={className} {...props}>
        <TypewriterText
          text={content}
          isStreaming={isStreaming}
          speed={typewriterSpeed}
          className="text-[#cccccc] leading-relaxed whitespace-pre-wrap"
        />
      </div>
    );
  }

  // For completed messages, use the full Response component with markdown
  return (
    <Response
      parseIncompleteMarkdown={parseIncompleteMarkdown}
      className={className}
      {...props}
    >
      {children}
    </Response>
  );
});

TypewriterResponseComponent.displayName = 'TypewriterResponse';

export const TypewriterResponse = TypewriterResponseComponent;
