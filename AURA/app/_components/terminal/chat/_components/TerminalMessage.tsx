// TERMINAL MESSAGE COMPONENT - Individual message with optional actions for terminal chat
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/_components/TerminalMessage.tsx

"use client";

import { FC, useState } from "react";
import { Action, Actions, Response } from "@/app/_components/chat";
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, User } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { ThinkingMessage } from "./ThinkingMessage";

interface TerminalMessageProps {
  message: {
    _id: Id<"chatMessages">;
    role: "user" | "assistant" | "system" | "terminal" | "thinking";
    content: string;
    _creationTime: number;
    sessionId?: string;
    userId?: string | Id<"users">;
    // Token tracking (present when message is complete)
    tokenCount?: number;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    // Additional data for thinking messages
    operation?: {
      type: string;
      details?: unknown;
    };
  };
  isLast?: boolean;
  onRegenerate?: () => void;
}

export const TerminalMessage: FC<TerminalMessageProps> = ({ 
  message, 
  isLast = false, 
  onRegenerate 
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  // Detect if message is still streaming
  // Assistant messages are considered streaming if they don't have final token counts
  const isStreaming = message.role === "assistant" && 
    (message.tokenCount === undefined || message.tokenCount === 0) &&
    (message.inputTokens === undefined || message.inputTokens === 0) &&
    (message.outputTokens === undefined || message.outputTokens === 0);

  // Format message for terminal display  
  const formatMessage = (msg: TerminalMessageProps['message']) => {
    switch (msg.role) {
      case 'user':
        return `User:\n${msg.content}`;
      case 'assistant':
        // For assistant messages, return just the content - we'll render it with markdown
        return msg.content;
      case 'system':
        return `📋 ${msg.content}`;
      case 'terminal':
        return `💻 ${msg.content}`;
      case 'thinking':
        return `💭 ${msg.content}`;
      default:
        return msg.content;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = () => {
    setFeedback(feedback === "like" ? null : "like");
  };

  const handleDislike = () => {
    setFeedback(feedback === "dislike" ? null : "dislike");
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };

  return (
    <div>
      {/* Special handling for thinking messages */}
      {message.role === "thinking" && message.operation?.details ? (
        <ThinkingMessage data={message.operation.details} />
      ) : (
        <>
          {/* Regular message content */}
          {message.role === "assistant" ? (
            <div className="mb-0.5 mt-3">
              <div className="text-[#cccccc] mb-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-[#858585] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-[#858585]">A</span>
                </div>
                <span>Aura:</span>
                {/* Streaming indicator */}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-[#4ec9b0] ml-1 animate-pulse" />
                )}
              </div>
              {/* Render assistant response with streaming-optimized markdown - indented */}
              <div data-role="assistant" className="pl-6">
                <Response
                  parseIncompleteMarkdown={isStreaming}
                  className="text-[#cccccc] leading-relaxed"
                >
                  {formatMessage(message)}
                </Response>
              </div>
            </div>
          ) : (
            <div className="text-[#cccccc] text-sm whitespace-pre-wrap mb-2 flex items-start gap-2">
              {message.role === 'user' && (
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-white/80" />
                  </div>
                </div>
              )}
              <span>
                {formatMessage(message)}
                {/* Streaming indicator for non-assistant messages */}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-[#4ec9b0] ml-1 animate-pulse" />
                )}
              </span>
            </div>
          )}
          
          {/* Actions - only show for completed assistant messages (not streaming) */}
          {message.role === "assistant" && !isStreaming && (
            <Actions className="mt-3 mb-4 pl-6">
              <Action
                label="Copy"
                onClick={handleCopy}
                disabled={copied}
              >
                <Copy className="h-2 w-2" />
              </Action>
              
              {isLast && onRegenerate && (
                <Action
                  label="Regenerate"
                  onClick={handleRegenerate}
                >
                  <RotateCcw className="h-2 w-2" />
                </Action>
              )}
              
              <Action
                label="Like"
                onClick={handleLike}
                className={feedback === "like" ? "text-green-500" : ""}
              >
                <ThumbsUp className="h-2 w-2" />
              </Action>
              
              <Action
                label="Dislike" 
                onClick={handleDislike}
                className={feedback === "dislike" ? "text-red-500" : ""}
              >
                <ThumbsDown className="h-2 w-2" />
              </Action>
            </Actions>
          )}
        </>
      )}
    </div>
  );
};
