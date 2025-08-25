// AI RESPONSE COMPONENT - Streaming-optimized text renderer for AI responses
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/response.tsx

"use client";

import { FC, ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";

interface ResponseProps {
  children: string | ReactNode;
  className?: string;
  streaming?: boolean;
}

export const Response: FC<ResponseProps> = ({ 
  children, 
  className,
  streaming = false 
}) => {
  // Handle streaming content - clean up incomplete formatting
  const processedContent = useMemo(() => {
    if (typeof children !== "string") {
      return children;
    }

    let content = children;

    if (streaming) {
      // Fix incomplete bold formatting
      if (content.includes("**") && (content.split("**").length - 1) % 2 !== 0) {
        content = content + "**";
      }
      
      // Fix incomplete italic formatting
      if (content.includes("*") && (content.split("*").length - 1) % 2 !== 0) {
        content = content + "*";
      }
      
      // Fix incomplete code formatting
      if (content.includes("`") && (content.split("`").length - 1) % 2 !== 0) {
        content = content + "`";
      }
    }

    return content;
  }, [children, streaming]);

  if (typeof processedContent !== "string") {
    return <div className={className}>{processedContent}</div>;
  }

  // Simple text formatting for now (can be enhanced with markdown later)
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <div key={index} className={index > 0 ? "mt-2" : ""}>
        {line}
      </div>
    ));
  };

  return (
    <div 
      className={cn(
        "text-sm leading-relaxed text-text-secondary whitespace-pre-wrap",
        className
      )}
    >
      {formatText(processedContent)}
    </div>
  );
};
