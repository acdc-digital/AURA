// TRASH PANEL - Advanced trash management interface following EAC delete system
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/trash/DashTrash.tsx

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useTrash, TrashItem } from "@/lib/hooks";
import { 
  ChevronDown, 
  ChevronRight, 
  File, 
  FileText, 
  Folder, 
  MessageSquare,
  Camera,
  AtSign,
  FileType,
  FileCode,
  RotateCcw,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useState, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface DeleteConfirmation {
  isOpen: boolean;
  itemId: string;
  itemName: string;
  itemType: 'file' | 'project';
  convexId: Id<"deletedFiles"> | Id<"deletedProjects">;
  isConvexItem: boolean;
}

export function DashTrash() {
  const { 
    trashItems, 
    stats, 
    isLoading,
    restoreFile,
    restoreProject,
    permanentlyDeleteFile,
    permanentlyDeleteProject,
    emptyTrash
  } = useTrash();

  // UI state for confirmations and expansions
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    itemId: '',
    itemName: '',
    itemType: 'file',
    convexId: '' as Id<"deletedFiles">,
    isConvexItem: false,
  });
  const [emptyTrashConfirmation, setEmptyTrashConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle item expansion for details view
  const toggleItem = useCallback((itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  }, [expandedItems]);

  // Handle restore operations
  const handleRestoreClick = useCallback(async (item: TrashItem) => {
    try {
      setIsProcessing(true);
      
      if (item.type === 'file') {
        await restoreFile(item.convexId as Id<"deletedFiles">);
      } else {
        await restoreProject(item.convexId as Id<"deletedProjects">);
      }
      
      console.log(`Restored ${item.type}: ${item.name}`);
    } catch (error) {
      console.error(`Failed to restore ${item.type}:`, error);
    } finally {
      setIsProcessing(false);
    }
  }, [restoreFile, restoreProject]);

  // Handle permanent delete setup
  const handlePermanentDeleteClick = useCallback((item: TrashItem) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      convexId: item.convexId,
      isConvexItem: item.isConvexItem,
    });
  }, []);

  // Handle confirmed permanent deletion
  const handleConfirmPermanentDelete = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      if (deleteConfirmation.itemType === 'file') {
        await permanentlyDeleteFile(deleteConfirmation.convexId as Id<"deletedFiles">);
      } else {
        await permanentlyDeleteProject(deleteConfirmation.convexId as Id<"deletedProjects">);
      }
      
      console.log(`Permanently deleted ${deleteConfirmation.itemType}: ${deleteConfirmation.itemName}`);
      setDeleteConfirmation({ ...deleteConfirmation, isOpen: false });
    } catch (error) {
      console.error(`Failed to permanently delete ${deleteConfirmation.itemType}:`, error);
    } finally {
      setIsProcessing(false);
    }
  }, [deleteConfirmation, permanentlyDeleteFile, permanentlyDeleteProject]);

  // Handle empty trash
  const handleEmptyTrash = useCallback(async () => {
    try {
      setIsProcessing(true);
      const result = await emptyTrash();
      console.log(`Trash emptied: ${result.deletedFiles} files, ${result.deletedProjects} projects`);
      setEmptyTrashConfirmation(false);
    } catch (error) {
      console.error("Failed to empty trash:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [emptyTrash]);

  // Get appropriate icon for trash items
  const getItemIcon = useCallback((item: TrashItem) => {
    if (item.type === 'project') {
      return Folder;
    }

    // File icons based on platform or type
    if (item.platform) {
      switch (item.platform) {
        case 'facebook':
        case 'linkedin':
          return MessageSquare;
        case 'instagram':
          return Camera;
        case 'twitter':
        case 'reddit':
          return AtSign;
        case 'youtube':
          return MessageSquare;
      }
    }

    switch (item.itemType) {
      case 'document':
      case 'note':
        return FileText;
      case 'image':
      case 'video':
        return FileType;
      case 'campaign':
        return FileCode;
      case 'post':
        return MessageSquare;
      default:
        return File;
    }
  }, []);

  // Format relative time
  const formatRelativeTime = useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }, []);
  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-[#858585]">
        <div className="animate-pulse text-sm">Loading trash...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-3 py-2 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <span>Trash</span>
          {stats && stats.totalItems > 0 && (
            <span className="text-[#cccccc]">({stats.totalItems})</span>
          )}
        </div>
        {stats && stats.totalItems > 0 && (
          <button
            onClick={() => setEmptyTrashConfirmation(true)}
            disabled={isProcessing}
            className="text-[#858585] hover:text-[#ff6b6b] transition-colors disabled:opacity-50"
            title="Empty trash"
          >
            Empty
          </button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {(!trashItems || trashItems.length === 0) ? (
            <div className="py-8 text-center text-[#858585]">
              <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-2">Trash is empty</p>
              <p className="text-xs opacity-75">
                Deleted items will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {trashItems.map((item) => {
                const Icon = getItemIcon(item);
                const isExpanded = expandedItems.has(item.id);
                
                return (
                  <div key={item.id} className="space-y-1">
                    {/* Main item row */}
                    <div className="group flex items-center gap-1 px-2 py-1 hover:bg-[#2d2d2d] rounded text-[#cccccc] text-sm">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        item.type === 'project' ? 'text-[#c09553]' : 'text-[#858585]'
                      }`} />
                      
                      <span className="flex-1 truncate">{item.name}</span>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreClick(item);
                          }}
                          disabled={isProcessing}
                          className="p-1 hover:bg-[#3c3c3c] rounded transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          <RotateCcw className="w-3 h-3 text-[#4fc3f7]" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDeleteClick(item);
                          }}
                          disabled={isProcessing}
                          className="p-1 hover:bg-[#3c3c3c] rounded transition-colors disabled:opacity-50 group"
                          title="Delete forever"
                        >
                          <Trash2 className="w-3 h-3 text-[#858585] group-hover:text-[#ff6b6b] transition-colors" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="ml-8 px-2 py-1 text-xs text-[#858585] bg-[#202020] rounded border border-[#2d2d2d]">
                        <div className="space-y-1">
                          <div>
                            <span className="text-[#cccccc]">Deleted:</span>{' '}
                            {formatRelativeTime(item.deletedAt)}
                          </div>
                          
                          {item.type === 'file' && (
                            <>
                              {item.projectName && (
                                <div>
                                  <span className="text-[#cccccc]">Project:</span>{' '}
                                  {item.projectName}
                                </div>
                              )}
                              {item.platform && (
                                <div>
                                  <span className="text-[#cccccc]">Platform:</span>{' '}
                                  {item.platform}
                                </div>
                              )}
                              {item.size && (
                                <div>
                                  <span className="text-[#cccccc]">Size:</span>{' '}
                                  {formatFileSize(item.size)}
                                </div>
                              )}
                            </>
                          )}
                          
                          {item.type === 'project' && item.fileCount !== undefined && (
                            <div>
                              <span className="text-[#cccccc]">Files:</span>{' '}
                              {item.fileCount} associated {item.fileCount === 1 ? 'file' : 'files'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Permanent Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252526] border border-[#454545] rounded p-4 min-w-80 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#ff6b6b]" />
              <h3 className="text-[#cccccc] font-medium">Delete Forever</h3>
            </div>
            
            <div className="text-[#cccccc] text-sm mb-4">
              <p className="mb-2">
                Are you sure you want to permanently delete &quot;{deleteConfirmation.itemName}&quot;?
              </p>
              <p className="text-[#858585] text-xs">
                This action cannot be undone. The {deleteConfirmation.itemType} will be 
                permanently removed from your account.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm text-[#cccccc] border border-[#454545] rounded hover:bg-[#2d2d2d] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm bg-[#ff6b6b] text-white rounded hover:bg-[#ff5252] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      {emptyTrashConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252526] border border-[#454545] rounded p-4 min-w-80 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#ff6b6b]" />
              <h3 className="text-[#cccccc] font-medium">Empty Trash</h3>
            </div>
            
            <div className="text-[#cccccc] text-sm mb-4">
              <p className="mb-2">
                Are you sure you want to empty the entire trash?
              </p>
              {stats && (
                <p className="text-[#858585] text-xs mb-2">
                  This will permanently delete {stats.totalFiles} {stats.totalFiles === 1 ? 'file' : 'files'} and {' '}
                  {stats.totalProjects} {stats.totalProjects === 1 ? 'project' : 'projects'}.
                </p>
              )}
              <p className="text-[#858585] text-xs">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEmptyTrashConfirmation(false)}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm text-[#cccccc] border border-[#454545] rounded hover:bg-[#2d2d2d] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm bg-[#ff6b6b] text-white rounded hover:bg-[#ff5252] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Emptying...' : 'Empty Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
