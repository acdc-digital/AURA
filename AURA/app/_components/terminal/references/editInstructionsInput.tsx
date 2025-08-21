// Edit Instructions Input Component for Agent File Editing - Terminal Style
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/editInstructionsInput.tsx

"use client";

import { Edit3 } from "lucide-react";
import { useState } from "react";

interface EditInstructionsInputProps {
  onInstructionsSubmitted: (instructions: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  fileName?: string;
  examples?: string[];
}

export function EditInstructionsInput({ 
  onInstructionsSubmitted, 
  onCancel,
  className = "",
  placeholder = "Describe what you want to change...",
  defaultValue = "",
  fileName = "",
  examples = []
}: EditInstructionsInputProps) {
  const [instructions, setInstructions] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (instructions.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        onInstructionsSubmitted(instructions.trim());
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setInstructions("");
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleExampleClick = (example: string) => {
    setInstructions(example);
  };

  return (
    <div className={`bg-[#1e1e1e] border border-[#454545] rounded-md p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Edit3 className="w-4 h-4 text-[#569cd6]" />
        <span className="text-sm font-medium text-[#cccccc]">
          Edit Instructions
          {fileName && <span className="text-[#9cdcfe] ml-1">for {fileName}</span>}
        </span>
      </div>
      
      {examples.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-[#888888] mb-2">Quick examples:</div>
          <div className="flex flex-wrap gap-1">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-2 py-1 bg-[#2d2d30] hover:bg-[#383838] text-[#cccccc] rounded border border-[#454545] transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-[#2d2d30] border border-[#454545] rounded px-3 py-2 text-sm text-[#cccccc] placeholder-[#888888] focus:outline-none focus:border-[#007acc] resize-none"
          rows={3}
          autoFocus
        />
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#888888]">
            💡 Tip: Press Ctrl+Enter to submit, Esc to cancel
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs bg-[#3c3c3c] hover:bg-[#484848] text-[#cccccc] rounded border border-[#454545] transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!instructions.trim() || isSubmitting}
              className="px-3 py-1 text-xs bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#2d2d30] disabled:text-[#888888] text-white rounded border border-[#007acc] disabled:border-[#454545] transition-colors flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3" />
                  Edit File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
