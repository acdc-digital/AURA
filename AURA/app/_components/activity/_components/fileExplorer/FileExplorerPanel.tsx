// FILE EXPLORER PANEL - Sidebar panel for file explorer
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/fileExplorer/FileExplorerPanel.tsx

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useFiles, useProjects, useTrash } from "@/lib/hooks";
import { useEditorStore } from "@/lib/store";
import { Id } from "@/convex/_generated/dataModel";
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronsDown, 
  FileText, 
  Folder, 
  Plus, 
  X 
} from "lucide-react";
import { useState } from "react";
import { FileTreeItem } from "@/app/_components/activity/_components/fileExplorer/FileTreeItem";

export function FileExplorerPanel() {
  const { projects, isLoading: projectsLoading, createProject } = useProjects();
  const { files, isLoading: filesLoading } = useFiles();
  const { moveFileToTrash, moveProjectToTrash } = useTrash();
  const { openTab } = useEditorStore();
  
  // UI state for creating new items
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const isLoading = projectsLoading || filesLoading;

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

  // Handle creating new project
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      await createProject({
        name: newProjectName.trim(),
        description: `Project created from file explorer`,
        status: "active"
      });
      setNewProjectName('');
      setIsCreatingProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateProject();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCreatingProject(false);
      setNewProjectName('');
    }
  };

  // Collapse all sections
  const collapseAllSections = () => {
    setExpandedProjects(new Set());
  };

  // Close all editor tabs
  const closeAllTabs = () => {
    // This would need to be implemented in editor store
    console.log('Close all tabs requested');
  };

  // Get files for a specific project
  const getProjectFiles = (projectId: string) => {
    if (!files) return [];
    return files.filter(file => file.projectId === projectId);
  };

  // Handle file deletion - EAC Stage 1: Move to trash (no confirmation)
  const handleFileDelete = async (fileId: string, fileName: string) => {
    try {
      await moveFileToTrash(fileId as Id<"files">);
      console.log(`Moved file to trash: ${fileName}`);
    } catch (error) {
      console.error('Error moving file to trash:', error);
    }
  };

  // Handle project deletion - EAC Stage 1: Move to trash (no confirmation)
  const handleProjectDelete = async (projectId: string, projectName: string) => {
    try {
      await moveProjectToTrash(projectId as Id<"projects">);
      console.log(`Moved project to trash: ${projectName}`);
    } catch (error) {
      console.error('Error moving project to trash:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-[#858585]">
        <div className="animate-pulse">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-3 py-2 border-b border-[#2d2d2d]">
        <span>Explorer</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsCreatingProject(true)}
            title="New Project"
            className="w-4 h-4 hover:text-[#cccccc] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={collapseAllSections}
            title="Collapse All"
            className="w-4 h-4 hover:text-[#cccccc] transition-colors"
          >
            <ChevronsDown className="w-4 h-4" />
          </button>
          <button 
            onClick={closeAllTabs}
            title="Close All Tabs"
            className="w-4 h-4 hover:text-[#cccccc] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File tree content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* New project input */}
          {isCreatingProject && (
            <div className="pl-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newProjectName.trim()) {
                    setIsCreatingProject(false);
                  }
                }}
                placeholder="Project name"
                className="w-full px-2 py-1 bg-[#3c3c3c] border border-[#4a4a4a] rounded text-xs text-[#cccccc] focus:outline-none focus:border-[#007acc]"
                autoFocus
              />
            </div>
          )}

          {/* Projects */}
          {projects?.map((project) => {
            const projectFiles = getProjectFiles(project._id);
            const isExpanded = expandedProjects.has(project._id);
            
            return (
              <div key={project._id} className="space-y-1">
                {/* Project folder */}
                <div 
                  className="flex items-center gap-1 px-2 py-1 hover:bg-[#2d2d2d] rounded cursor-pointer text-[#cccccc] group"
                >
                  <button
                    onClick={() => toggleProject(project._id)}
                    className="flex items-center gap-1 flex-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    )}
                    <Folder className="w-4 h-4 flex-shrink-0 text-[#deb068]" />
                    <span className="text-sm truncate">{project.name}</span>
                  </button>
                  
                  <span className="text-xs text-[#858585] opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                    {projectFiles.length}
                  </span>
                  
                  {/* Project delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectDelete(project._id, project.name);
                    }}
                    className="p-1 hover:bg-[#3c3c3c] rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete project"
                  >
                    <X className="w-3 h-3 text-[#858585] hover:text-[#ff6b6b] transition-colors" />
                  </button>
                </div>

                {/* Project files */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {projectFiles.length === 0 ? (
                      <div className="pl-6 py-1 text-xs text-[#858585]">
                        No files
                      </div>
                    ) : (
                      projectFiles.map((file) => (
                        <FileTreeItem
                          key={file._id}
                          file={file}
                          onOpen={() => {
                            openTab({
                              id: `file-${file._id}`,
                              title: file.name,
                              type: 'file',
                              filePath: file.path || `/${file.name}`,
                            });
                          }}
                          onDelete={() => handleFileDelete(file._id, file.name)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {(!projects || projects.length === 0) && (
            <div className="px-2 py-8 text-center text-[#858585]">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-2">No projects yet</p>
              <button
                onClick={() => setIsCreatingProject(true)}
                className="text-xs text-[#007acc] hover:text-[#1890ff] underline"
              >
                Create your first project
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
