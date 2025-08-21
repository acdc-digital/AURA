// File Selector Component - Interactive file selection for editing
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/fileSelector.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";
import { useQuery } from "convex/react";
import { FolderOpen } from "lucide-react";
import { useState } from "react";

interface FileSelectorProps {
  onFileSelected: (file: any) => void; // Changed to any to support serialized files
  onCancel: () => void;
  disabled?: boolean;
  selectedFile?: ProjectFile;
  className?: string;
}

export function FileSelector({
  onFileSelected,
  onCancel,
  disabled = false,
  selectedFile,
  className = ""
}: FileSelectorProps) {
  const [isOpen, setIsOpen] = useState(!selectedFile);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all files from editor store
  const { projectFiles, financialFiles, projectFolders, financialFolders } = useEditorStore();
  
  // Get all files from Convex (instruction files, etc.)
  const allConvexFiles = useQuery(api.files.getAllUserFiles) || [];
  
  // Combine all files with proper type conversion
  const allFiles: ProjectFile[] = [
    ...projectFiles,
    ...financialFiles,
    // Convert Convex files to ProjectFile format
    ...allConvexFiles.map(file => ({
      id: file._id,
      name: file.name,
      type: 'markdown' as const, // Default type for Convex files
      content: file.content || '',
      filePath: `/convex/${file.name}`,
      category: 'project' as const,
      createdAt: new Date(file._creationTime),
      modifiedAt: new Date(file.lastModified || file._creationTime),
      icon: '📄',
      folderId: undefined // Convex files are not in folders by default
    }))
  ].filter(file => 
    // Filter out empty files and search by name
    file.name && 
    (searchTerm === "" || file.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group files by folder
  const filesWithoutFolder = allFiles.filter(file => !file.folderId);
  const filesInFolders = [...projectFolders, ...financialFolders].map(folder => ({
    folder,
    files: allFiles.filter(file => file.folderId === folder.id)
  })).filter(group => group.files.length > 0);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'markdown': return '📝';
      case 'reddit': return '🔴';
      case 'twitter': case 'x': return '🐦';
      case 'instagram': return '📷';
      case 'facebook': return '📘';
      case 'document': return '📄';
      default: return '📄';
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'markdown': return 'Markdown';
      case 'reddit': return 'Reddit Post';
      case 'twitter': case 'x': return 'X/Twitter Post';
      case 'instagram': return 'Instagram Post';
      case 'facebook': return 'Facebook Post';
      case 'document': return 'Document';
      default: return 'File';
    }
  };

  if (selectedFile && !isOpen) {
    return (
      <div className={`bg-[#1a1a1a] border border-[#454545] rounded p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFileIcon(selectedFile.type)}</span>
            <div>
              <div className="text-[#cccccc] text-sm font-medium">{selectedFile.name}</div>
              <div className="text-[#858585] text-xs">{getFileTypeLabel(selectedFile.type)}</div>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-[#007acc] hover:text-[#4ec9b0] text-xs"
            >
              Change File
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
          <h3 className="text-[#cccccc] text-sm font-medium">Select a file to edit</h3>
          <button
            onClick={onCancel}
            className="text-[#858585] hover:text-[#cccccc] text-xs"
          >
            Cancel
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded px-2 py-1 text-xs text-[#cccccc] placeholder:text-[#858585]"
          />
        </div>
      </div>

      {/* File List */}
      <div className="max-h-64 overflow-y-auto">
        {allFiles.length === 0 ? (
          <div className="p-4 text-center text-[#858585] text-xs">
            {searchTerm ? 'No files match your search' : 'No files available for editing'}
          </div>
        ) : (
          <>
            {/* Files without folders */}
            {filesWithoutFolder.map(file => (
              <div
                key={file.id}
                onClick={() => {
                  // Serialize the file object to ensure it's Convex-compatible
                  const serializedFile = {
                    ...file,
                    createdAt: file.createdAt instanceof Date ? file.createdAt.getTime() : file.createdAt,
                    modifiedAt: file.modifiedAt instanceof Date ? file.modifiedAt.getTime() : file.modifiedAt,
                  };
                  onFileSelected(serializedFile);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-[#2d2d2d] cursor-pointer border-b border-[#2d2d2d]/30"
              >
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[#cccccc] text-sm truncate">{file.name}</div>
                  <div className="text-[#858585] text-xs">{getFileTypeLabel(file.type)}</div>
                </div>
                <div className="text-[#858585] text-xs">
                  {file.content ? `${Math.round(file.content.length / 100) * 100} chars` : 'Empty'}
                </div>
              </div>
            ))}

            {/* Files in folders */}
            {filesInFolders.map(({ folder, files }) => (
              <div key={folder.id} className="border-b border-[#2d2d2d]/30">
                <div className="flex items-center gap-2 p-3 bg-[#252526] text-[#cccccc] text-xs font-medium">
                  <FolderOpen className="w-4 h-4" />
                  <span>{folder.name}</span>
                  <span className="text-[#858585]">({files.length} files)</span>
                </div>
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => {
                      // Serialize the file object to ensure it's Convex-compatible
                      const serializedFile = {
                        ...file,
                        createdAt: file.createdAt instanceof Date ? file.createdAt.getTime() : file.createdAt,
                        modifiedAt: file.modifiedAt instanceof Date ? file.modifiedAt.getTime() : file.modifiedAt,
                      };
                      onFileSelected(serializedFile);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 pl-8 hover:bg-[#2d2d2d] cursor-pointer border-b border-[#2d2d2d]/20"
                  >
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#cccccc] text-sm truncate">{file.name}</div>
                      <div className="text-[#858585] text-xs">{getFileTypeLabel(file.type)}</div>
                    </div>
                    <div className="text-[#858585] text-xs">
                      {file.content ? `${Math.round(file.content.length / 100) * 100} chars` : 'Empty'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
