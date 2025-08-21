// File Type Selector Component for Agent File Creation - Terminal Style
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/fileTypeSelector.tsx

"use client";

import {
    AtSign,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    Link,
    MessageCircle,
    Music,
    Square
} from "lucide-react";
import { useState } from "react";

interface FileTypeOption {
  type: string;
  extension: string;
  description: string;
  platform: string;
  icon: React.ComponentType<any>;
  available: boolean;
}

interface FileTypeSelectorProps {
  onFileTypeSelected: (fileType: FileTypeOption) => void;
  onCancel: () => void;
  className?: string;
  disabled?: boolean;
  selectedFileType?: FileTypeOption;
}

export function FileTypeSelector({ 
  onFileTypeSelected, 
  onCancel,
  className = "",
  disabled = false,
  selectedFileType: initialSelectedFileType
}: FileTypeSelectorProps) {
  const [selectedFileType, setSelectedFileType] = useState<FileTypeOption | null>(initialSelectedFileType || null);
  const [isFileTypesExpanded, setIsFileTypesExpanded] = useState(disabled ? false : false); // Don't auto-expand when disabled

  // Define available file types with all social media platforms
  const fileTypeOptions: FileTypeOption[] = [
    {
      type: 'x',
      extension: '.x',
      description: 'X (Twitter) Post',
      platform: 'X / Twitter',
      icon: AtSign,
      available: true
    },
    {
      type: 'facebook',
      extension: '.fb',
      description: 'Facebook Post',
      platform: 'Facebook',
      icon: MessageCircle,
      available: false
    },
    {
      type: 'instagram',
      extension: '.ig',
      description: 'Instagram Post',
      platform: 'Instagram',
      icon: Square,
      available: false
    },
    {
      type: 'reddit',
      extension: '.reddit',
      description: 'Reddit Post',
      platform: 'Reddit',
      icon: MessageCircle,
  available: true
    },
    {
      type: 'linkedin',
      extension: '.linkedin',
      description: 'LinkedIn Post',
      platform: 'LinkedIn',
      icon: Link,
      available: false
    },
    {
      type: 'tiktok',
      extension: '.tiktok',
      description: 'TikTok Video',
      platform: 'TikTok',
      icon: Music,
      available: false
    }
  ];

  const handleFileTypeSelect = (fileType: FileTypeOption) => {
    if (!disabled && fileType.available) {
      setSelectedFileType(fileType);
    }
  };

  const handleConfirm = () => {
    if (selectedFileType && !disabled) {
      onFileTypeSelected(selectedFileType);
    }
  };

  const handleCancel = () => {
    if (!disabled) {
      setSelectedFileType(null);
      onCancel();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-[#858585]">
        <FileText className="w-3.5 h-3.5 text-[#4ec9b0]" />
        <span>File Type Selection</span>
      </div>

      {/* File Type Options List Drawer */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded">
        <button
          onClick={() => !disabled && setIsFileTypesExpanded(!isFileTypesExpanded)}
          disabled={disabled}
          className={`w-full flex items-center gap-2 p-2 transition-colors ${
            disabled ? 'cursor-default opacity-70' : 'hover:bg-[#2d2d2d]/30'
          }`}
        >
          {isFileTypesExpanded ? 
            <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
            <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
          }
          <span className="text-xs text-[#007acc] flex-1 text-left">
            Available File Types ({fileTypeOptions.length})
          </span>
        </button>
        
        {isFileTypesExpanded && (
          <div className="px-2 pb-2">
            <div className="space-y-0">
              {fileTypeOptions.map((fileType) => {
                const IconComponent = fileType.icon;
                const isSelected = selectedFileType?.type === fileType.type;
                
                return (
                  <button
                    key={fileType.type}
                    onClick={() => handleFileTypeSelect(fileType)}
                    disabled={disabled || !fileType.available}
                    className={`w-full flex items-center justify-between px-1 py-1 text-left transition-colors ${
                      disabled || !fileType.available
                        ? 'cursor-not-allowed opacity-50' 
                        : 'hover:bg-[#2d2d2d]/30'
                    } ${
                      isSelected
                        ? 'bg-[#007acc]/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <IconComponent className="w-3 h-3 text-[#858585]" />
                      <span className={`text-xs truncate ${
                        isSelected
                          ? 'text-[#007acc]'
                          : fileType.available
                            ? 'text-[#cccccc]'
                            : 'text-[#858585]'
                      }`}>
                        {fileType.description}
                      </span>
                      <span className="text-[10px] text-[#858585] ml-1">
                        ({fileType.platform})
                      </span>
                    </div>
                    <div className="text-[10px] text-[#858585] ml-2">
                      {fileType.available ? (isSelected ? 'selected' : 'select') : 'coming soon'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected File Type Preview */}
      {selectedFileType && (
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <CheckCircle className="w-3 h-3 text-[#007acc]" />
          <span>Selected:</span>
          <span className="text-[#cccccc] font-mono">{selectedFileType.description}</span>
          <span className="text-[10px] text-[#858585]">
            ({selectedFileType.extension})
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-1">
        <div className="text-xs text-[#858585]">
          {disabled ? "✅ Selected file type:" : "Confirm file type"}
        </div>
        <div>
          <button
            onClick={handleConfirm}
            disabled={!selectedFileType || disabled}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              selectedFileType && !disabled
                ? 'bg-[#007acc] text-white border-[#007acc] hover:bg-[#1e90ff] hover:border-[#1e90ff]' 
                : disabled && selectedFileType
                ? 'bg-[#1e4a5a] text-[#007acc] border-[#007acc] cursor-default'
                : 'bg-transparent text-[#454545] border-[#454545] cursor-not-allowed'
            }`}
          >
            {disabled ? "Confirmed" : "Confirm"}
          </button>
        </div>
        
        <div className="text-xs text-[#858585]">Cancel operation</div>
        <div>
          <button
            onClick={handleCancel}
            disabled={disabled}
            className="text-xs text-[#858585] hover:text-[#cccccc] underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
