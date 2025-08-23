// SESSION TAB - Individual session tab component
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/sessions/SessionTab.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/lib/store/terminal-sessions";
import { X } from "lucide-react";
import { useState } from "react";

interface SessionTabProps {
  session: ChatSession;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  canDelete: boolean;
}

export function SessionTab({ 
  session, 
  isActive, 
  onSwitch, 
  onDelete, 
  onRename, 
  canDelete 
}: SessionTabProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);

  const handleRename = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== session.title) {
      onRename(trimmedTitle);
    } else {
      setEditTitle(session.title);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setEditTitle(session.title);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-t border-t-2 cursor-pointer group min-w-0 max-w-48 relative",
        isActive 
          ? "bg-[#1e1e1e] border-[#007acc] text-[#cccccc]" 
          : "bg-[#2d2d2d] border-transparent text-[#858585] hover:text-[#cccccc] hover:bg-[#3d3d3d]"
      )}
      onClick={onSwitch}
    >
      {/* Session Title */}
      {isRenaming ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleRename}
          className="bg-transparent border-none outline-none text-xs w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span 
          className="text-xs truncate flex-1 select-none"
          onDoubleClick={handleDoubleClick}
          title={session.title}
        >
          {session.title}
        </span>
      )}

      {/* Close Button */}
      {canDelete && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 p-0 h-4 w-4 rounded hover:bg-[#454545] transition-opacity"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
