// Multi-File Selector Component - Interactive multi-select for instruction files
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/multiFileSelector.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";
import { useQuery } from "convex/react";
import { Check, FolderOpen, X } from "lucide-react";
import { useState } from "react";

interface MultiFileSelectorProps {
  onFilesSelected: (files: any[]) => void; // Array of selected files
  onCancel: () => void;
  disabled?: boolean;
  selectedFiles?: ProjectFile[];
  className?: string;
  title?: string;
  placeholder?: string;
  maxSelections?: number; // Optional limit on number of selections
  fileTypeFilter?: string[]; // Optional filter for specific file types
}

export function MultiFileSelector({
  onFilesSelected,
  onCancel,
  disabled = false,
  selectedFiles = [],
  className = "",
  title = "Select instruction files from instructions folder",
  placeholder = "Search instruction files...",
  maxSelections,
  fileTypeFilter = ['markdown', 'document'] // Default to instruction-type files
}: MultiFileSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<ProjectFile[]>(selectedFiles);
  
  // Get all files from editor store
  const { projectFiles, financialFiles, projectFolders, financialFolders } = useEditorStore();
  
  // Get all files from Convex (instruction files, etc.)
  const allConvexFiles = useQuery(api.files.getAllUserFiles) || [];
  
  // Find the system 'instructions' folder
  const instructionsFolder = [...projectFolders, ...financialFolders].find(
    folder => folder.name.toLowerCase() === 'instructions' && folder.category === 'project'
  );
  
  // Only get files from the instructions folder
  const instructionFiles: ProjectFile[] = instructionsFolder 
    ? [...projectFiles, ...financialFiles].filter(file => 
        file.folderId === instructionsFolder.id && 
        fileTypeFilter.includes(file.type)
      )
    : [];
  
  // Also include Convex files that are instruction-related (optional)
  const convexInstructionFiles = allConvexFiles
    .filter(file => file.name.toLowerCase().includes('instruction') || file.name.toLowerCase().includes('guide'))
    .map(file => ({
      id: file._id,
      name: file.name,
      type: 'markdown' as const,
      content: file.content || '',
      filePath: `/convex/${file.name}`,
      category: 'project' as const,
      createdAt: new Date(file._creationTime),
      modifiedAt: new Date(file.lastModified || file._creationTime),
      icon: '📄',
      folderId: undefined
    }));
  
  // Combine instruction files and filter by search term
  const allFiles: ProjectFile[] = [
    ...instructionFiles,
    ...convexInstructionFiles
  ].filter(file => 
    file.name && 
    (searchTerm === "" || file.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group files by folder - only show instructions folder
  const filesWithoutFolder = allFiles.filter(file => !file.folderId);
  const instructionsFolderGroup = instructionsFolder ? {
    folder: instructionsFolder,
    files: allFiles.filter(file => file.folderId === instructionsFolder.id)
  } : null;
  
  const filesInFolders = instructionsFolderGroup ? [instructionsFolderGroup] : [];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'markdown': return '📝';
      case 'document': return '📄';
      case 'instruction': return '📋';
      default: return '📄';
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'markdown': return 'Markdown';
      case 'document': return 'Document';
      case 'instruction': return 'Instruction';
      default: return 'File';
    }
  };

  const handleFileToggle = (file: ProjectFile) => {
    if (disabled) return;

    const isSelected = internalSelectedFiles.some(f => f.id === file.id);
    
    if (isSelected) {
      // Remove from selection
      setInternalSelectedFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      // Add to selection (if under max limit)
      if (!maxSelections || internalSelectedFiles.length < maxSelections) {
        setInternalSelectedFiles(prev => [...prev, file]);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (internalSelectedFiles.length === 0) return;
    
    // Convert to serializable format for transmission
    const serializableFiles = internalSelectedFiles.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      content: file.content,
      filePath: file.filePath,
      category: file.category
    }));
    
    onFilesSelected(serializableFiles);
  };

  const isFileSelected = (file: ProjectFile) => {
    return internalSelectedFiles.some(f => f.id === file.id);
  };

  const canSelectMore = !maxSelections || internalSelectedFiles.length < maxSelections;

  if (!isOpen) {
    return (
      <div className={`bg-[#1a1a1a] border border-[#454545] rounded p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <div>
              <div className="text-[#cccccc] text-sm font-medium">
                {internalSelectedFiles.length} files selected
              </div>
              <div className="text-[#858585] text-xs">
                {internalSelectedFiles.map(f => f.name).join(', ')}
              </div>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-[#007acc] hover:text-[#4ec9b0] text-xs"
            >
              Change Selection
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a1a1a] border border-[#454545] rounded ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-[#454545]">
        <div className="flex items-center justify-between">
          <h3 className="text-[#cccccc] text-sm font-medium">{title}</h3>
          <button
            onClick={onCancel}
            className="text-[#858585] hover:text-[#cccccc] text-xs"
          >
            Cancel
          </button>
        </div>
        
        {/* Selection Info */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[#858585] text-xs">
            {internalSelectedFiles.length} selected
            {maxSelections && ` (max ${maxSelections})`}
          </div>
          {internalSelectedFiles.length > 0 && (
            <button
              onClick={() => setInternalSelectedFiles([])}
              className="text-[#f48771] hover:text-[#ff6b6b] text-xs"
            >
              Clear All
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="mt-2">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] placeholder:text-[#858585]"
          />
        </div>
      </div>

      {/* Selected Files Preview */}
      {internalSelectedFiles.length > 0 && (
        <div className="p-2 border-b border-[#454545] bg-[#0d1117]">
          <div className="text-[#858585] text-xs mb-1">Selected Files:</div>
          <div className="flex flex-wrap gap-1">
            {internalSelectedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center gap-1 bg-[#1a1a1a] border border-[#007acc] rounded px-2 py-1"
              >
                <span className="text-xs">{getFileIcon(file.type)}</span>
                <span className="text-[#cccccc] text-xs">{file.name}</span>
                <button
                  onClick={() => handleFileToggle(file)}
                  className="text-[#858585] hover:text-[#f48771] ml-1"
                  aria-label={`Remove ${file.name} from selection`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File List */}
      <div className="max-h-64 overflow-y-auto">
        {allFiles.length === 0 ? (
          <div className="p-4 text-center text-[#858585] text-xs">
            {searchTerm ? 'No files match your search' : 'No instruction files available'}
          </div>
        ) : (
          <>
            {/* Files without folders */}
            {filesWithoutFolder.map(file => {
              const isSelected = isFileSelected(file);
              const canSelect = canSelectMore || isSelected;
              
              return (
                <div
                  key={file.id}
                  onClick={() => canSelect && handleFileToggle(file)}
                  className={`
                    flex items-center gap-3 p-3 border-b border-[#2d2d2d] cursor-pointer transition-colors
                    ${canSelect ? 'hover:bg-[#2d2d2d]' : 'opacity-50 cursor-not-allowed'}
                    ${isSelected ? 'bg-[#0d1117] border-l-4 border-l-[#007acc]' : ''}
                  `}
                >
                  {/* Selection Checkbox */}
                  <div className={`
                    w-4 h-4 border rounded flex items-center justify-center
                    ${isSelected ? 'bg-[#007acc] border-[#007acc]' : 'border-[#454545]'}
                  `}>
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  
                  {/* File Icon */}
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[#cccccc] text-sm font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-[#858585] text-xs">
                      {getFileTypeLabel(file.type)} • Modified {file.modifiedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Files in folders */}
            {filesInFolders.map(({ folder, files }) => (
              <div key={folder.id}>
                {/* Folder Header */}
                <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] border-b border-[#454545]">
                  <FolderOpen size={14} className="text-[#858585]" />
                  <span className="text-[#858585] text-xs font-medium">{folder.name}</span>
                </div>
                
                {/* Files in folder */}
                {files.map(file => {
                  const isSelected = isFileSelected(file);
                  const canSelect = canSelectMore || isSelected;
                  
                  return (
                    <div
                      key={file.id}
                      onClick={() => canSelect && handleFileToggle(file)}
                      className={`
                        flex items-center gap-3 p-3 pl-6 border-b border-[#2d2d2d] cursor-pointer transition-colors
                        ${canSelect ? 'hover:bg-[#2d2d2d]' : 'opacity-50 cursor-not-allowed'}
                        ${isSelected ? 'bg-[#0d1117] border-l-4 border-l-[#007acc]' : ''}
                      `}
                    >
                      {/* Selection Checkbox */}
                      <div className={`
                        w-4 h-4 border rounded flex items-center justify-center
                        ${isSelected ? 'bg-[#007acc] border-[#007acc]' : 'border-[#454545]'}
                      `}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      
                      {/* File Icon */}
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[#cccccc] text-sm font-medium truncate">
                          {file.name}
                        </div>
                        <div className="text-[#858585] text-xs">
                          {getFileTypeLabel(file.type)} • Modified {file.modifiedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#454545] flex items-center justify-between">
        <div className="text-[#858585] text-xs">
          {internalSelectedFiles.length === 0 
            ? 'Select files to continue'
            : `${internalSelectedFiles.length} file${internalSelectedFiles.length === 1 ? '' : 's'} selected`
          }
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs text-[#858585] hover:text-[#cccccc] border border-[#454545] rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={internalSelectedFiles.length === 0}
            className={`
              px-3 py-1 text-xs rounded border
              ${internalSelectedFiles.length > 0
                ? 'bg-[#007acc] text-white border-[#007acc] hover:bg-[#0066aa]'
                : 'bg-[#454545] text-[#858585] border-[#454545] cursor-not-allowed'
              }
            `}
          >
            Select {internalSelectedFiles.length} File{internalSelectedFiles.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}
