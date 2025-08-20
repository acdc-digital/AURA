// FILE TREE ITEM - Individual file item in the file explorer tree
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/fileExplorer/FileTreeItem.tsx

"use client";

import { FileData } from "@/lib/hooks";
import { 
  AtSign,
  Camera,
  FileCode,
  FileText,
  FileType,
  MessageSquare,
  File,
  X
} from "lucide-react";
import { useState } from "react";

interface FileTreeItemProps {
  file: FileData;
  onOpen: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
}

export function FileTreeItem({ file, onOpen, onDelete, onRename }: FileTreeItemProps) {
  // Ephemeral UI state for inline renaming - not business data
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempRenameValue, setTempRenameValue] = useState('');

  // Get file icon based on type and platform
  const getFileIcon = () => {
    if (file.platform) {
      switch (file.platform) {
        case 'facebook':
          return MessageSquare;
        case 'instagram':
          return Camera;
        case 'twitter':
          return AtSign;
        case 'linkedin':
          return MessageSquare;
        case 'reddit':
          return AtSign;
        case 'youtube':
          return MessageSquare;
      }
    }

    switch (file.type) {
      case 'post':
        return MessageSquare;
      case 'document':
        return FileText;
      case 'note':
        return FileText;
      case 'image':
        return FileType;
      case 'video':
        return FileType;
      case 'campaign':
        return FileCode;
      default:
        return File;
    }
  };

  // Get status badge for social media posts
  const getStatusBadge = () => {
    if (!file.platform || !file.postStatus) return null;

    const statusColors = {
      draft: 'bg-[#4a4a4a] text-[#cccccc]',
      scheduled: 'bg-[#3b82f6] text-white',
      published: 'bg-[#10b981] text-white',
      archived: 'bg-[#6b7280] text-[#cccccc]',
    };

    return (
      <span
        className={`ml-auto px-1.5 py-0.5 text-xs rounded-full ${
          statusColors[file.postStatus] || statusColors.draft
        }`}
      >
        {file.postStatus}
      </span>
    );
  };

  const handleRename = () => {
    if (!tempRenameValue.trim() || tempRenameValue === file.name) {
      setIsRenaming(false);
      setTempRenameValue(file.name);
      return;
    }
    
    onRename?.(tempRenameValue.trim());
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsRenaming(false);
      setTempRenameValue(file.name);
    }
  };

  const handleDoubleClick = () => {
    if (onRename) {
      setTempRenameValue(file.name); // Initialize with current name when renaming starts
      setIsRenaming(true);
    }
  };

  const Icon = getFileIcon();

  if (isRenaming) {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <Icon className="w-4 h-4 flex-shrink-0 text-[#858585]" />
        <input
          type="text"
          value={tempRenameValue}
          onChange={(e) => setTempRenameValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleRename}
          placeholder="File name"
          className="flex-1 px-1 py-0.5 bg-[#3c3c3c] border border-[#4a4a4a] rounded text-xs text-[#cccccc] focus:outline-none focus:border-[#007acc]"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 px-2 py-1 hover:bg-[#2d2d2d] rounded cursor-pointer text-[#cccccc] group"
      onClick={onOpen}
      onDoubleClick={handleDoubleClick}
    >
      <Icon className="w-4 h-4 flex-shrink-0 text-[#858585]" />
      <span className="text-sm truncate flex-1">{file.name}</span>
      {getStatusBadge()}
      
      {/* Delete button - shows on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-[#3c3c3c] rounded transition-colors"
            title="Delete file"
          >
            <X className="w-3 h-3 text-[#858585] hover:text-[#ff6b6b] transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
