// FILE EXPLORER TAB - Table view of files when File Explorer tab is opened
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/fileExplorer/FileExplorerTab.tsx

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useFiles, useProjects, FileData } from "@/lib/hooks";
import { useEditorStore } from "@/lib/store";
import { 
  AtSign,
  Camera,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  FileText,
  MessageSquare,
  File,
} from "lucide-react";
import { useMemo, useState } from "react";

export function FileExplorerTab() {
  const { projects, isLoading: projectsLoading } = useProjects();
  const { files, isLoading: filesLoading, updateFile } = useFiles();
  const { openTab } = useEditorStore();
  
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const isLoading = projectsLoading || filesLoading;

  // Filter to show only editable files (social media posts + markdown)
  const filteredFiles = useMemo(() => {
    if (!files) return [];
    return files.filter(file => 
      file.platform || file.type === 'document' || file.type === 'note'
    );
  }, [files]);

  // Group files by project
  const filesByProject = useMemo(() => {
    if (!projects || !filteredFiles) return [];
    
    return projects.map(project => ({
      project,
      files: filteredFiles.filter(file => file.projectId === project._id)
    })).filter(group => group.files.length > 0);
  }, [projects, filteredFiles]);

  // Toggle project expansion
  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Expand/collapse all
  const expandAll = () => {
    if (!projects) return;
    setExpandedProjects(new Set(projects.map(p => p._id)));
  };

  const collapseAll = () => {
    setExpandedProjects(new Set());
  };

  // Get file icon
  const getFileIcon = (file: FileData) => {
    if (file.platform) {
      switch (file.platform) {
        case 'facebook':
          return MessageSquare;
        case 'instagram':
          return Camera;
        case 'twitter':
        case 'reddit':
          return AtSign;
        case 'linkedin':
        case 'youtube':
          return MessageSquare;
      }
    }
    return FileText;
  };

  // Get file type label
  const getFileTypeLabel = (file: FileData): string => {
    if (file.platform) {
      switch (file.platform) {
        case 'facebook':
          return 'Facebook Post';
        case 'instagram':
          return 'Instagram Post';
        case 'twitter':
          return 'X/Twitter Post';
        case 'linkedin':
          return 'LinkedIn Post';
        case 'reddit':
          return 'Reddit Post';
        case 'youtube':
          return 'YouTube Post';
      }
    }
    
    switch (file.type) {
      case 'document':
        return 'Markdown Document';
      case 'note':
        return 'Note';
      default:
        return 'File';
    }
  };

  // Handle status change for social media posts
  const handleStatusChange = async (file: FileData) => {
    if (!file.platform || !file.postStatus) return;
    
    const statusCycle = {
      'draft': 'scheduled' as const,
      'scheduled': 'published' as const,
      'published': 'archived' as const,
      'archived': 'draft' as const,
    };
    
    const newStatus = statusCycle[file.postStatus];
    
    try {
      await updateFile(file._id, { postStatus: newStatus });
    } catch (error) {
      console.error('Error updating file status:', error);
    }
  };

  // Get status badge
  const getStatusBadge = (file: FileData) => {
    if (!file.platform || !file.postStatus) {
      return <div className="w-20"></div>; // Empty space for non-social files
    }
    
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-[#4a4a4a] text-[#cccccc]' },
      scheduled: { label: 'Scheduled', color: 'bg-[#3b82f6] text-white' },
      published: { label: 'Posted', color: 'bg-[#10b981] text-white' },
      archived: { label: 'Archived', color: 'bg-[#6b7280] text-[#cccccc]' },
    };

    const config = statusConfig[file.postStatus] || statusConfig.draft;
    
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStatusChange(file);
        }}
        className={`px-2 py-0.5 text-xs rounded-full transition-opacity hover:opacity-80 cursor-pointer ${config.color}`}
        title={`Click to change status`}
      >
        {config.label}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#858585]">
        <div className="animate-pulse">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d]">
        <h2 className="text-sm font-medium text-[#cccccc]">File Explorer</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            title="Expand All"
            className="p-1 hover:bg-[#2d2d2d] rounded text-[#858585] hover:text-[#cccccc]"
          >
            <ChevronsDown className="w-4 h-4" />
          </button>
          <button
            onClick={collapseAll}
            title="Collapse All"
            className="p-1 hover:bg-[#2d2d2d] rounded text-[#858585] hover:text-[#cccccc]"
          >
            <ChevronsUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-2">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 py-2 px-2 text-xs text-[#858585] uppercase border-b border-[#2d2d2d]">
            <div className="col-span-6">File Name</div>
            <div className="col-span-3">Type</div>
            <div className="col-span-3">Status</div>
          </div>

          {/* File groups by project */}
          <div className="space-y-1 mt-2">
            {filesByProject.map(({ project, files: projectFiles }) => {
              const isExpanded = expandedProjects.has(project._id);
              
              return (
                <div key={project._id}>
                  {/* Project header */}
                  <div 
                    className="flex items-center gap-2 px-2 py-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
                    onClick={() => toggleProject(project._id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-[#858585]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-[#858585]" />
                    )}
                    <span className="text-sm text-[#cccccc] font-medium">
                      {project.name} ({projectFiles.length})
                    </span>
                  </div>

                  {/* Project files */}
                  {isExpanded && (
                    <div className="ml-5 space-y-1">
                      {projectFiles.map((file) => {
                        const Icon = getFileIcon(file);
                        
                        return (
                          <div
                            key={file._id}
                            className="grid grid-cols-12 gap-4 py-2 px-2 hover:bg-[#2d2d2d] rounded cursor-pointer text-[#cccccc]"
                            onClick={() => {
                              openTab({
                                id: `file-${file._id}`,
                                title: file.name,
                                type: 'file',
                                filePath: file.path || `/${file.name}`,
                              });
                            }}
                          >
                            <div className="col-span-6 flex items-center gap-2">
                              <Icon className="w-4 h-4 text-[#858585] flex-shrink-0" />
                              <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <div className="col-span-3 text-sm text-[#858585] truncate">
                              {getFileTypeLabel(file)}
                            </div>
                            <div className="col-span-3 flex items-center">
                              {getStatusBadge(file)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filesByProject.length === 0 && (
            <div className="py-12 text-center text-[#858585]">
              <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No editable files found</p>
              <p className="text-sm">
                Create some social media posts or markdown documents to see them here.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
