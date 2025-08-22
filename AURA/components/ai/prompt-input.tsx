// AI PROMPT INPUT COMPONENT - Auto-resizing textarea with toolbar for chat interfaces
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/prompt-input.tsx

"use client";

import { FC, ReactNode, useState, useRef, useEffect, KeyboardEvent, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

interface PromptInputContextType {
  value: string;
  setValue: (value: string) => void;
  handleSubmit: () => void;
  disabled: boolean;
}

const PromptInputContext = createContext<PromptInputContextType | null>(null);

const usePromptInput = () => {
  const context = useContext(PromptInputContext);
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput");
  }
  return context;
};

interface PromptInputProps {
  onSubmit?: (value: string) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

interface PromptInputTextareaProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface PromptInputToolbarProps {
  children: ReactNode;
  className?: string;
}

interface PromptInputSubmitProps {
  disabled?: boolean;
  className?: string;
}

export const PromptInput: FC<PromptInputProps> = ({ 
  onSubmit,
  children, 
  className,
  disabled = false
}) => {
  const [value, setValue] = useState("");
  
  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    
    onSubmit?.(value.trim());
    setValue("");
  };

  const contextValue = {
    value,
    setValue,
    handleSubmit,
    disabled,
  };

  return (
    <PromptInputContext.Provider value={contextValue}>
      <div 
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-background-tertiary bg-background-secondary p-3",
          disabled && "opacity-50",
          className
        )}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  );
};

export const PromptInputTextarea: FC<PromptInputTextareaProps> = ({ 
  placeholder = "Type your message...",
  className,
  disabled: propDisabled = false
}) => {
  const { value, setValue, handleSubmit, disabled: contextDisabled } = usePromptInput();
  const disabled = propDisabled || contextDisabled;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className={cn(
        "flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-background-tertiary",
        className
      )}
    />
  );
};

export const PromptInputToolbar: FC<PromptInputToolbarProps> = ({ 
  children,
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-end gap-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const PromptInputSubmit: FC<PromptInputSubmitProps> = ({ 
  disabled: propDisabled = false,
  className
}) => {
  const { value, handleSubmit, disabled: contextDisabled } = usePromptInput();
  const disabled = propDisabled || contextDisabled || !value.trim();

  return (
    <Button
      onClick={handleSubmit}
      disabled={disabled}
      size="sm"
      className={cn(
        "h-8 w-8 p-0",
        className
      )}
    >
      <SendIcon className="h-4 w-4" />
      <span className="sr-only">Send message</span>
    </Button>
  );
};
