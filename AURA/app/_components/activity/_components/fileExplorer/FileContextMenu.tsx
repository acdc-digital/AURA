// FILE CONTEXT MENU - Context menu for file operations
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/fileExplorer/FileContextMenu.tsx

"use client";

import { FileData } from "@/lib/hooks";

interface FileContextMenuProps {
  file: FileData;
  onRename?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onClose?: () => void;
}

export function FileContextMenu({ 
  file, 
  onRename, 
  onDelete, 
  onDuplicate, 
  onClose 
}: FileContextMenuProps) {
  // This is a placeholder component for the context menu
  // In a full implementation, this would be a dropdown/popover
  // with options like rename, delete, duplicate, etc.
  
  return (
    <div className="hidden">
      {/* Context menu implementation would go here */}
      {/* For now, this is just a placeholder to satisfy the export */}
    </div>
  );
}
