// Project Name Input Component for Agent Project Creation - Terminal Style
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/projectNameInput.tsx

"use client";

import { Folder } from "lucide-react";
import { useState } from "react";

interface ProjectNameInputProps {
  onProjectNameSubmitted: (projectName: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
}

export function ProjectNameInput({ 
  onProjectNameSubmitted, 
  onCancel,
  className = "",
  placeholder = "Enter project name...",
  defaultValue = ""
}: ProjectNameInputProps) {
  const [projectName, setProjectName] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (projectName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        onProjectNameSubmitted(projectName.trim());
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setProjectName("");
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
        <Folder className="w-3.5 h-3.5 text-[#4ec9b0]" />
        <span>Project Creation</span>
      </div>

      {/* Terminal Input */}
      <div className="flex items-center gap-2 text-xs text-[#cccccc]">
        <label htmlFor="project-name-input">Input:</label>
        <input
          id="project-name-input"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-0 text-[#cccccc] text-xs p-0 m-0 h-auto outline-0 shadow-none rounded-none"
          disabled={isSubmitting}
          autoFocus
          aria-label="Enter project name"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-1">
        <div className="text-xs text-[#858585]">Create project</div>
        <div>
          <button
            onClick={handleSubmit}
            disabled={!projectName.trim() || isSubmitting}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              projectName.trim() && !isSubmitting
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
