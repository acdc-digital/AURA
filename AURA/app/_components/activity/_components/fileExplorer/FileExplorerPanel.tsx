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
  X,
  GripVertical,
  Camera
} from "lucide-react";
import { useState } from "react";
import { FileTreeItem } from "@/app/_components/activity/_components/fileExplorer/FileTreeItem";

// System folder configuration
const SYSTEM_FOLDERS = [
  {
    id: 'brand-identity',
    name: 'Brand Identity',
    type: 'system',
    icon: FileText,
    description: 'Brand guidelines and identity assets'
  },
  {
    id: 'media',
    name: 'Media',
    type: 'system',
    icon: Camera,
    description: 'Media assets and creative content'
  }
] as const;

export function FileExplorerPanel() {
  const { projects, isLoading: projectsLoading, createProject } = useProjects();
  const { files, isLoading: filesLoading, createFile } = useFiles();
  const { moveFileToTrash, moveProjectToTrash } = useTrash();
  const { openTab } = useEditorStore();

  // Debug logging for files
  console.log('FileExplorerPanel render:', {
    files: files?.length,
    filesLoading,
    allFiles: files?.map(f => ({ id: f._id, name: f.name, projectId: f.projectId }))
  });
  
  // UI state for creating new items
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedSystemFolders, setExpandedSystemFolders] = useState<Set<string>>(new Set());
  const [creatingFileInProject, setCreatingFileInProject] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Toggle system folder expansion
  const toggleSystemFolder = (folderId: string) => {
    const newExpanded = new Set(expandedSystemFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedSystemFolders(newExpanded);
  };

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
    setExpandedSystemFolders(new Set());
  };

  // Close all editor tabs
  const closeAllTabs = () => {
    // This would need to be implemented in editor store
    console.log('Close all tabs requested');
  };

  // Get files for a specific project
  const getProjectFiles = (projectId: string) => {
    if (!files) return [];
    console.log('getProjectFiles:', { projectId, files: files?.length, filtered: files.filter(file => file.projectId === projectId).length });
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

  // Handle file creation in folder
  const handleCreateFileInProject = (projectId: string) => {
    setCreatingFileInProject(projectId);
    setNewFileName('');
  };

  // Handle file creation submission
  const handleCreateFileSubmit = async (projectId: string) => {
    if (!newFileName.trim()) return;
    
    try {
      const fileName = newFileName.trim();
      const fullFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
      
      console.log('Creating file:', { fileName: fullFileName, projectId });
      
      // Create the file in the database
      const newFileId = await createFile({
        name: fullFileName,
        type: 'document', // Default type for .md files
        content: `# ${fileName.replace(/\.md$/, '')}\n\nYour markdown content here...`,
        projectId: projectId as Id<'projects'>,
        extension: 'md',
        path: `/${fullFileName}`,
        mimeType: 'text/markdown',
      });
      
      console.log('File created with ID:', newFileId);
      
      // Ensure the project is expanded so the file is visible
      setExpandedProjects(prev => new Set([...prev, projectId]));
      
      // Open the new file in a tab
      openTab({
        id: `file-${newFileId}`,
        title: fullFileName,
        type: 'file',
        filePath: `/${fullFileName}`,
      });
      
      // Reset state
      setCreatingFileInProject(null);
      setNewFileName('');
      
      console.log(`Created new markdown file: ${fullFileName} in project ${projectId}`);
    } catch (error) {
      console.error('Error creating file:', error);
      // Reset state on error too
      setCreatingFileInProject(null);
      setNewFileName('');
    }
  };

  // Handle file creation keydown
  const handleFileNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, projectId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateFileSubmit(projectId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCreatingFileInProject(null);
      setNewFileName('');
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
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header - Match dashboard background and add spacing */}
      <div className="flex items-center justify-between text-sm uppercase text-[#858585] px-3 py-3 mb-2">
        <span className="font-sf">File Explorer</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCreatingProject(true)}
            title="New Project"
            className="p-1 hover:bg-[#2d2d2d] rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={collapseAllSections}
            title="Collapse All"
            className="p-1 hover:bg-[#2d2d2d] rounded transition-colors border border-[#454545]"
          >
            <ChevronsDown className="w-3 h-3" />
          </button>
          <button 
            onClick={closeAllTabs}
            title="Close All Tabs"
            className="p-1 hover:bg-[#2d2d2d] rounded transition-colors border border-[#454545]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* File tree content */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {/* System Section Header */}
          <div className="px-3 py-1">
            <div className="text-[10px] uppercase text-[#858585] font-medium tracking-wide mb-2">
              System
            </div>
            
            {/* System Folders */}
            {SYSTEM_FOLDERS.map((folder) => {
              const isExpanded = expandedSystemFolders.has(folder.id);
              const IconComponent = folder.icon;
              
              return (
                <div key={folder.id} className="mb-1">
                  <div
                    className="flex items-center gap-1 px-2 py-1 hover:bg-[#2d2d2d] rounded cursor-pointer text-[#cccccc] group"
                    onClick={() => toggleSystemFolder(folder.id)}
                  >
                    <div className="flex items-center gap-1 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      )}
                      <IconComponent className="w-4 h-4 flex-shrink-0 text-[#deb068]" />
                      <span className="text-sm truncate">{folder.name}</span>
                    </div>
                  </div>
                  
                  {/* System folder files would go here */}
                  {isExpanded && (
                    <div className="ml-4 px-2 py-1 text-xs text-[#858585]">
                      No {folder.name.toLowerCase()} files
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Projects Section Header */}
          <div className="px-3 py-1">
            <div className="text-[10px] uppercase text-[#858585] font-medium tracking-wide mb-2">
              Projects
            </div>
            
            {/* New project input */}
            {isCreatingProject && (
              <div className="mb-2 px-2">
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

            {/* Projects List */}
            {projects?.map((project) => {
              const projectFiles = getProjectFiles(project._id);
              const isExpanded = expandedProjects.has(project._id);
              
              return (
                <div key={project._id} className="mb-1">
                  {/* Project folder with drag, add, and delete functionality */}
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
                    
                    {/* Project action buttons - drag, add, delete */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        className="p-0.5 hover:bg-[#3d3d3d] rounded transition-colors"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateFileInProject(project._id);
                        }}
                        className="p-0.5 hover:bg-[#3d3d3d] rounded transition-colors"
                        title="Add file to project"
                      >
                        <Plus className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectDelete(project._id, project.name);
                        }}
                        className="p-0.5 hover:bg-[#3d3d3d] rounded transition-colors"
                        title="Delete project"
                      >
                        <X className="w-3 h-3 text-[#858585] hover:text-[#ff6b6b] transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Project files */}
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {/* File creation input */}
                      {creatingFileInProject === project._id && (
                        <div className="flex items-center gap-2 px-2 py-1">
                          <FileText className="w-4 h-4 flex-shrink-0 text-[#858585]" />
                          <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => handleFileNameKeyDown(e, project._id)}
                            onBlur={() => {
                              if (!newFileName.trim()) {
                                setCreatingFileInProject(null);
                              }
                            }}
                            placeholder="File name (will be .md)"
                            className="flex-1 px-1 py-0.5 bg-[#3c3c3c] border border-[#4a4a4a] rounded text-xs text-[#cccccc] focus:outline-none focus:border-[#007acc]"
                            autoFocus
                          />
                        </div>
                      )}
                      
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
        </div>
      </ScrollArea>
    </div>
  );
}
