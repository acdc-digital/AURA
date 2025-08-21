// Chat Input Component with Tool Selection Panel
// /Users/matthewsimon/Projects/EAC/eac/app/_components/terminal/_components/chatInput.tsx

"use client";

import { useChat } from "@/lib/hooks/useChat";
import React, { useEffect, useRef, useState } from "react";
import { ToolSelector } from "./toolSelector";

interface ChatInputProps {
  placeholder?: string;
}

export function ChatInput({ placeholder = "Ask me about your EAC project..." }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading } = useChat();

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Handle tool selector display
  useEffect(() => {
    if (message === '/') {
      setShowToolSelector(true);
      setSelectedToolIndex(0);
    } else {
      setShowToolSelector(false);
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !showToolSelector) {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  const handleToolSelect = (command: string) => {
    setMessage(command + " ");
    setShowToolSelector(false);
    inputRef.current?.focus();
  };

  const handleToolSelectorClose = () => {
    setShowToolSelector(false);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If tool selector is open, let it handle keyboard events
    if (showToolSelector) {
      return; // ToolSelector component will handle its own keyboard events
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative border-t border-[#2d2d2d] bg-[#0e0e0e] p-2 flex-shrink-0">
      {/* Tool Selector */}
      {showToolSelector && (
        <ToolSelector
          onToolSelect={handleToolSelect}
          onClose={handleToolSelectorClose}
          selectedIndex={selectedToolIndex}
          onIndexChange={setSelectedToolIndex}
        />
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Terminal prompt */}
        <div className="text-[#007acc] font-mono text-xs flex-shrink-0">
          $
        </div>
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "AI is thinking..." : placeholder}
          disabled={isLoading}
          className={`
            flex-1 bg-transparent text-[#cccccc] font-mono text-xs border-none outline-none
            placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-[#858585] font-mono text-xs animate-pulse">
            ...
          </div>
        )}
        
        {/* Send button (hidden but functional) */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="sr-only"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
      
      {/* Help text */}
      <div className="text-[#454545] font-mono text-[10px] mt-1">
        {showToolSelector 
          ? "Select a tool to use"
          : "Press Enter to send • Type / to select tools • Shift+Enter for new line"
        }
      </div>
    </div>
  );
} 