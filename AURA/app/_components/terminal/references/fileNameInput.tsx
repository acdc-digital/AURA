// File Name Input Component for Agent File Creation - Terminal Style
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/fileNameInput.tsx

"use client";

import { FilePlus } from "lucide-react";
import { useState } from "react";

interface FileNameInputProps {
  onFileNameSubmitted: (fileName: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  fileType?: string;
}

export function FileNameInput({ 
  onFileNameSubmitted, 
  onCancel,
  className = "",
  placeholder = "Enter file name...",
  defaultValue = "",
  fileType = "file"
}: FileNameInputProps) {
  const [fileName, setFileName] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (fileName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        onFileNameSubmitted(fileName.trim());
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setFileName("");
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-[#858585]">
        <FilePlus className="w-3.5 h-3.5 text-[#4ec9b0]" />
        <span>File Creation</span>
        {fileType && fileType !== "file" && (
          <>
            <span>•</span>
            <span className="text-[#cccccc]">{fileType}</span>
          </>
        )}
      </div>

      {/* Terminal Input */}
      <div className="flex items-center gap-2 text-xs text-[#cccccc]">
        <span>Input:</span>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-0 outline-0 shadow-none rounded-none text-[#cccccc] text-xs p-0 m-0 h-auto focus:ring-0 focus:outline-none focus:border-transparent focus:shadow-none active:ring-0 active:outline-none active:border-transparent active:shadow-none"
          disabled={isSubmitting}
          autoFocus
          aria-label="Enter file name"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-1">
        <div className="text-xs text-[#858585]">Create file</div>
        <div>
          <button
            onClick={handleSubmit}
            disabled={!fileName.trim() || isSubmitting}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              fileName.trim() && !isSubmitting
                ? 'bg-[#007acc] text-white border-[#007acc] hover:bg-[#1e90ff] hover:border-[#1e90ff]' 
                : 'bg-transparent text-[#454545] border-[#454545] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? "Creating..." : "Confirm"}
          </button>
        </div>
        
        <div className="text-xs text-[#858585]">Cancel operation</div>
        <div>
          <button
            onClick={handleCancel}
            className="text-xs text-[#858585] hover:text-[#cccccc] underline-offset-2 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
