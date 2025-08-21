// Sidebar Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashSidebar.tsx

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useContentCreation } from "@/lib/hooks/useContentCreation";
import { useFileLoad } from "@/lib/hooks/useFileLoad";
import { useFiles } from "@/lib/hooks/useFiles";
import { useFileSync } from "@/lib/hooks/useFileSync";
import { useInstructions } from "@/lib/hooks/useInstructions";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectSync } from "@/lib/hooks/useProjectSync";
import { useTrash } from "@/lib/hooks/useTrash";
import { useEditorStore, useSidebarStore } from "@/store";
import { useConvexAuth, useMutation } from "convex/react";
import {
  AtSign,
  Braces,
  Camera,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileType,
  Folder,
  GripVertical,
  MessageSquare,
  Pin,
  Plus,
  X
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { DashAgents } from "./dashAgents";
import { DashCalendarConsole } from "./dashCalendarConsole";
import { DashDebug } from "./dashDebug";
import { DashExtensions } from "./dashExtensions";
import { DashHelp } from "./dashHelp";
import { DashLogoGeneratorConsole } from "./dashLogoGeneratorConsole";
import { DashSocialConnections } from "./dashSocialConnections";
import { DashTrash } from "./dashTrash";
import { DashUserConsole } from "./dashUserConsole";

import { FileCreationDropdown } from "./_components/fileCreationDropdown";

interface SidebarProps {
  activePanel: string;
}

export function DashSidebar({ activePanel }: SidebarProps) {
  const { openSections, toggleSection, collapseAllSections } = useSidebarStore();
  const { projectFiles, financialFiles, projectFolders, showProjectsCategory, showFinancialCategory, openTab, openSpecialTab, renameFile, renameFolder, createFolder, deleteProjectsCategory, deleteFinancialCategory, reorderProjectFolders, reorderFilesInFolder, closeAllTabs, moveToTrash } = useEditorStore();
  const { createProject, deleteProject } = useProjects();
  const { deleteFile } = useFiles(null); // We'll get file-specific functions as needed
  const { isAuthenticated } = useConvexAuth();
  const { moveToTrash: moveFileToConvexTrash } = useTrash(); // Add Convex trash functionality

  // Convex mutations
  const softDeleteFileFromDB = useMutation(api.files.softDeleteFile);

  // Initialize Instructions project for authenticated users
  const { instructionsProject, instructionFiles } = useInstructions();

  // Initialize Content Creation project for authenticated users  
  const { contentCreationProject, contentCreationFiles } = useContentCreation();

  // Initialize project synchronization between Convex and Zustand
  useProjectSync();

  // Initialize file sync system for database integration
  useFileSync();

  // Initialize file load system to sync files from Convex to local store
  useFileLoad();

  // TODO: Re-enable once files have Convex IDs
  // const deleteFile = useMutation(api.files.deleteFile);

  const [renamingFile, setRenamingFile] = useState<{ fileId: string; currentName: string } | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<{ folderId: string; currentName: string } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderRename, setNewFolderRename] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [dragOverFile, setDragOverFile] = useState<string | null>(null);
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false);
  const [preselectedFolder, setPreselectedFolder] = useState<{id: string, name: string, category: 'project' | 'financial'} | null>(null);
  const createButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const handleDeleteClick = async (fileId: string, fileName: string) => {
    // No confirmation modal - directly move to trash per UX design
    // First check if it's an instruction file
    const instructionFile = instructionFiles?.find(f => f._id === fileId);
    const contentCreationFile = contentCreationFiles?.find(f => f._id === fileId);
    
    if (instructionFile) {
      // Handle instruction file deletion - use soft delete
      try {
        await softDeleteFileFromDB({
          id: instructionFile._id as Id<"files">,
          deletedBy: 'user', // Mark as deleted by user
        });
        console.log(`✅ Instruction file "${instructionFile.name}" moved to trash`);
      } catch (error) {
        console.error(`❌ Error deleting instruction file "${instructionFile.name}":`, error);
      }
    } else if (contentCreationFile) {
      // Handle content creation file deletion - use soft delete
      try {
        await softDeleteFileFromDB({
          id: contentCreationFile._id as Id<"files">,
          deletedBy: 'user', // Mark as deleted by user
        });
        console.log(`✅ Content creation file "${contentCreationFile.name}" moved to trash`);
      } catch (error) {
        console.error(`❌ Error deleting content creation file "${contentCreationFile.name}":`, error);
      }
    } else {
      // Handle regular project/financial file deletion
      const file = [...projectFiles, ...financialFiles].find(f => f.id === fileId);
      if (file) {
        // First move to local trash
        moveToTrash(file, 'file');
        console.log(`📁 File "${file.name}" moved to local trash`);

        // If file has a convex ID, also move to database trash using soft delete
        if (file.convexId) {
          try {
            await softDeleteFileFromDB({
              id: file.convexId as Id<"files">,
              deletedBy: 'user',
            });
            console.log(`✅ File "${file.name}" moved to database trash`);
          } catch (error) {
            console.error(`❌ Error moving file "${file.name}" to database trash:`, error);
          }
        } else {
          console.log(`📁 File "${file.name}" moved to local trash only (no Convex ID)`);
        }
      } else {
        console.error(`❌ File with ID "${fileId}" not found`);
      }
    }
  };

  const handleRenameSubmit = () => {
    if (renamingFile && newFileName.trim()) {
      renameFile(renamingFile.fileId, newFileName.trim());
      setRenamingFile(null);
      setNewFileName('');
    }
  };

  const handleRenameCancel = () => {
    setRenamingFile(null);
    setNewFileName('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  const handleFolderRenameSubmit = () => {
    if (renamingFolder && newFolderRename.trim()) {
      renameFolder(renamingFolder.folderId, newFolderRename.trim());
      setRenamingFolder(null);
      setNewFolderRename('');
    }
  };

  const handleFolderRenameCancel = () => {
    setRenamingFolder(null);
    setNewFolderRename('');
  };

  const handleFolderRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFolderRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleFolderRenameCancel();
    }
  };



  const handleFolderNameSubmit = async () => {
    if (newFolderName.trim()) {
      setIsCreatingProject(true);

      try {
        // First create the project in the Convex database
        const newProject = await createProject({
          name: newFolderName.trim(),
          status: 'active',
          // You can add userId here if you have user context
          // userId: currentUser?.id,
        });

        console.log('Project created in database:', newProject);

        // Then create folder in the local editor store with the Convex ID
        createFolder(newFolderName.trim(), 'project', newProject?._id);

      } catch (error) {
        console.error('Failed to create project in database:', error);
        // Create folder locally even if database creation fails
        createFolder(newFolderName.trim(), 'project');
      } finally {
        setIsCreatingProject(false);
      }
    }
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const handleFolderNameCancel = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFolderNameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleFolderNameCancel();
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, folderId: string) => {
    setDraggedItem(folderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', folderId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Only update drag over item if it's different from the current one
    if (draggedItem && draggedItem !== folderId && dragOverItem !== folderId) {
      setDragOverItem(folderId);
    }
  }, [draggedItem, dragOverItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();

    // Perform the actual reordering on drop
    if (draggedItem && draggedItem !== folderId) {
      const draggedIndex = projectFolders.findIndex(folder => folder.id === draggedItem);
      const dropIndex = projectFolders.findIndex(folder => folder.id === folderId);

      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        reorderProjectFolders(draggedIndex, dropIndex);
      }
    }

    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, projectFolders, reorderProjectFolders]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  // File drag handlers
  const handleFileDragStart = useCallback((e: React.DragEvent, fileId: string, folderId: string) => {
    setDraggedFile(fileId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', fileId);
    e.dataTransfer.setData('folderId', folderId);
  }, []);

  const handleFileDragOver = useCallback((e: React.DragEvent, fileId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedFile && draggedFile !== fileId && dragOverFile !== fileId) {
      setDragOverFile(fileId);
    }
  }, [draggedFile, dragOverFile]);

  const handleFileDragLeave = useCallback(() => {
    setDragOverFile(null);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent, dropFileId: string, folderId: string) => {
    e.preventDefault();

    if (draggedFile && draggedFile !== dropFileId) {
      // Get files in the same folder
      const folderFiles = projectFiles.filter(file => file.folderId === folderId);
      const draggedIndex = folderFiles.findIndex(file => file.id === draggedFile);
      const dropIndex = folderFiles.findIndex(file => file.id === dropFileId);

      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        reorderFilesInFolder(folderId, draggedIndex, dropIndex, 'project');
      }
    }

    setDraggedFile(null);
    setDragOverFile(null);
  }, [draggedFile, projectFiles, reorderFilesInFolder]);

  const handleFileDragEnd = useCallback(() => {
    setDraggedFile(null);
    setDragOverFile(null);
  }, []);

  const handleCreateFileInFolder = (folderId: string, folderName: string, category: 'project' | 'financial') => {
    setPreselectedFolder({ id: folderId, name: folderName, category });
    setIsFileDropdownOpen(true);
  };

  const handleCloseDropdown = () => {
    setIsFileDropdownOpen(false);
    setPreselectedFolder(null);
  };

  // Create dynamic file structure using store data
  const fileStructure = useMemo(() => {
    // Separate pinned and regular folders
    const pinnedFolders = projectFolders.filter(folder => 
      folder.pinned && 
      folder.name.toLowerCase() !== 'instructions' &&
      !folder.id.toLowerCase().includes('instructions') &&
      folder.name.toLowerCase() !== 'content creation' &&
      !folder.id.toLowerCase().includes('content-creation')
    );
    // Filter out Instructions and Content Creation projects from regular folders - they only appear in System section
    const regularFolders = projectFolders.filter(folder => 
      !folder.pinned && 
      folder.name.toLowerCase() !== 'instructions' &&
      !folder.id.toLowerCase().includes('instructions') &&
      folder.name.toLowerCase() !== 'content creation' &&
      !folder.id.toLowerCase().includes('content-creation')
    );    const sections = [];

    // Always add System section header when projects category is visible
    if (showProjectsCategory) {
      sections.push({
        id: 'system-header',
        name: 'System',
        type: 'header' as const,
        isHeader: true,
      });

      // Add Instructions project under System section
      if (instructionsProject) {
        sections.push({
          id: `instructions-${instructionsProject._id}`,
          name: 'Instructions',
          icon: Folder,
          type: 'folder' as const,
          isFolder: true,
          isPinned: false,
          isSystemFolder: true, // Mark as system folder (non-deletable)
          children: [
            // Show instruction files that belong to this project
            ...(instructionFiles || []).map(file => {
              const displayName = file.name.endsWith('.md') ? file.name.replace(/\.md$/i, '') : file.name;
              return {
                id: file._id,
                name: displayName,
                icon: FileText, // Use FileText icon for instruction files
                type: 'markdown' as const, // Instructions are markdown files
                file: {
                  id: file._id,
                  name: displayName,
                  icon: FileText,
                  type: 'markdown' as const,
                  category: 'project' as const,
                  content: file.content || '',
                  filePath: file.path || `/instructions/${file.name}`,
                  createdAt: new Date(file._creationTime),
                  modifiedAt: new Date(file._creationTime),
                  folderId: `instructions-${instructionsProject._id}`,
                  convexId: file._id,
                },
              };
            })
          ]
        });
      }

      // Add Content Creation project under System section
      if (contentCreationProject) {
        sections.push({
          id: `content-creation-${contentCreationProject._id}`,
          name: 'Content Creation',
          icon: Folder,
          type: 'folder' as const,
          isFolder: true,
          isPinned: false,
          isSystemFolder: true, // Mark as system folder (non-deletable)
          children: [
            // Show content creation files that belong to this project
            ...(contentCreationFiles || []).map(file => {
              // Determine file type based on extension or platform
              const extension = (file as any).extension || 'md';
              const fileType = extension === 'x' ? 'x' as const : 'markdown' as const;
              
              // Choose appropriate icon based on extension and platform
              let icon = FileText; // Default
              if (extension === 'x' || (file as any).platform === 'twitter') {
                icon = AtSign; // Twitter/X icon
              } else if (extension === 'md') {
                icon = FileText; // Markdown icon
              }
              
              // Construct proper filename with extension
              const displayName = file.name.includes('.') ? file.name : `${file.name}.${extension}`;
              
              return {
                id: file._id,
                name: displayName,
                icon: icon,
                type: fileType,
                file: {
                  id: file._id,
                  name: displayName,
                  icon: icon,
                  type: fileType,
                  category: 'project' as const,
                  content: file.content || '',
                  filePath: file.path || `/content-creation/${displayName}`,
                  createdAt: new Date(file._creationTime),
                  modifiedAt: new Date(file._creationTime),
                  folderId: `content-creation-${contentCreationProject._id}`,
                  convexId: file._id,
                  // Include extra metadata for debugging
                  platform: (file as any).platform,
                  extension: extension,
                },
              };
            })
          ]
        });
      }

      // Add pinned folders if they exist
      if (pinnedFolders.length > 0) {
        sections.push(...pinnedFolders.map(folder => ({
          id: folder.id,
          name: folder.name,
          icon: Folder,
          type: 'folder' as const,
          isFolder: true,
          isPinned: true,
          children: [
            // Show files that belong to this folder
            ...projectFiles.filter(file => file.folderId === folder.id).map(file => ({
              id: file.id,
              name: file.name,
              icon: file.icon,
              type: file.type,
              file: file,
            }))
          ]
        })));
      }
    }

    // Always add Projects section header when projects category is visible
    if (showProjectsCategory) {
      sections.push({
        id: 'projects-header',
        name: 'Projects',
        type: 'header' as const,
        isHeader: true,
      });

      // Add regular folders if they exist
      if (regularFolders.length > 0) {
        sections.push(...regularFolders.map(folder => ({
          id: folder.id,
          name: folder.name,
          icon: Folder,
          type: 'folder' as const,
          isFolder: true,
          isPinned: false,
          children: [
            // Show files that belong to this folder
            ...projectFiles.filter(file => file.folderId === folder.id).map(file => ({
              id: file.id,
              name: file.name,
              icon: file.icon,
              type: file.type,
              file: file,
            }))
          ]
        })));
      }
    }

    // Add loose project files
    if (showProjectsCategory) {
      const looseFiles = projectFiles.filter(file => !file.folderId);
      if (looseFiles.length > 0) {
        sections.push(...looseFiles.map(file => ({
          id: file.id,
          name: file.name,
          icon: file.icon,
          type: file.type,
          file: file, // Store the full file object for opening
        })));
      }
    }

    // Add Financial section if it exists
    if (showFinancialCategory) {
      sections.push({
        id: 'financial',
        name: 'Financial Data',
        icon: Folder,
        children: financialFiles.map(file => ({
          id: file.id,
          name: file.name,
          icon: file.icon,
          type: file.type,
          file: file, // Store the full file object for opening
        }))
      });
    }

    return sections;
  }, [showProjectsCategory, showFinancialCategory, projectFolders, projectFiles, financialFiles, instructionsProject, instructionFiles]);

  const getFileIconComponent = (type: string) => {
    switch (type) {
      case 'typescript':
      case 'javascript':
        return FileCode;
      case 'json':
        return Braces;
      case 'excel':
        return FileSpreadsheet;
      case 'markdown':
        return FileText;
      case 'pdf':
        return FileType;
      case 'generals':
        return FileCode;
      case 'percent-complete':
        return FileSpreadsheet;
      case 'schedule':
        return FileSpreadsheet;
      case 'materials':
        return FileSpreadsheet;
      case 'reddit':
        // Return a custom component for Reddit r/ display
        const RedditIcon = () => (
          <span className="w-4 h-4 flex-shrink-0 text-[#858585] text-xs font-medium flex items-center justify-center">
            r/
          </span>
        );
        RedditIcon.displayName = 'RedditIcon';
        return RedditIcon;
      case 'facebook':
        return MessageSquare;
      case 'instagram':
        return Camera;
      case 'x':
        return AtSign;
      default:
        return FileCode;
    }
  };

  const renderContent = () => {
    switch (activePanel) {
      case 'financial':
        return (
          <div className="p-2">
            <div className="text-xs uppercase text-[#858585] px-2 py-1 mb-2">
              Financial Overview
            </div>
            <div className="space-y-2">
              <div className="bg-[#2d2d2d] rounded p-2">
                <div className="text-xs text-[#cccccc] font-medium">Monthly Revenue</div>
                <div className="text-lg text-[#4ec9b0] font-mono">$47,382.50</div>
                <div className="text-xs text-[#858585]">+12.3% from last month</div>
              </div>
              <div className="bg-[#2d2d2d] rounded p-2">
                <div className="text-xs text-[#cccccc] font-medium">Expenses</div>
                <div className="text-lg text-[#ce9178] font-mono">$23,451.20</div>
                <div className="text-xs text-[#858585]">-5.2% from last month</div>
              </div>
              <div className="bg-[#2d2d2d] rounded p-2">
                <div className="text-xs text-[#cccccc] font-medium">Net Profit</div>
                <div className="text-lg text-[#dcdcaa] font-mono">$23,931.30</div>
                <div className="text-xs text-[#858585]">+18.7% from last month</div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-2">
            <div className="text-xs uppercase text-[#858585] px-2 py-1 mb-2">
              Analytics Dashboard
            </div>
            <div className="space-y-1">
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                📊 Revenue Trends
              </div>
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                📈 Growth Metrics
              </div>
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                💰 Cost Analysis
              </div>
              <div className="hover:bg-[#2d2d2d] px-2 py-1 rounded text-xs cursor-pointer">
                🎯 KPI Dashboard
              </div>
            </div>
          </div>
        );
      case 'social-connect':
        return (
          <div className="p-4">
            <button
              onClick={() => openSpecialTab('social-connectors', 'Social Media Connectors', 'social-connect')}
              className="w-full text-left bg-[#2d2d2d] hover:bg-[#3d3d3d] p-3 rounded mb-2 text-sm"
            >
              🔗 Open Social Media Connectors
            </button>
            <p className="text-xs text-[#858585]">Connect your social media accounts</p>
          </div>
        );
      case 'post-creator':
        return (
          <div className="p-4">
            <button
              onClick={() => openSpecialTab('post-creator', 'Social Media Post Creator', 'post-creator')}
              className="w-full text-left bg-[#2d2d2d] hover:bg-[#3d3d3d] p-3 rounded mb-2 text-sm"
            >
              ✏️ Open Post Creator
            </button>
            <p className="text-xs text-[#858585]">Create posts for your connected platforms</p>
          </div>
        );
      case 'trash':
        return <DashTrash />;
      case 'debug':
        return <DashDebug />;
      case 'help':
        return <DashHelp />;
      case 'agents':
        return <DashAgents />;
      case 'extensions':
        return <DashExtensions />;
      case 'logo-generator':
        return <DashLogoGeneratorConsole />;
      case 'profile':
        return <DashUserConsole />;
      case 'social-connectors':
        return <DashSocialConnections />;
      case 'calendar':
        return <DashCalendarConsole />;
      default:
        return (
          <div className="p-2">
            <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
              <span>EAC Explorer</span>
              <div className="flex items-center gap-1">
                <button
                  ref={createButtonRef}
                  onClick={() => {
                    if (isAuthenticated) {
                      setIsCreatingFolder(true);
                    }
                  }}
                  disabled={!isAuthenticated}
                  className={`p-0.5 rounded transition-colors ${
                    isAuthenticated
                      ? 'hover:bg-[#2d2d2d] cursor-pointer'
                      : 'opacity-30 cursor-default'
                  }`}
                  aria-label="Create new project"
                  title={isAuthenticated ? "Create new project" : "Authentication required"}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      collapseAllSections();
                    }
                  }}
                  disabled={!isAuthenticated}
                  className={`p-0.5 rounded transition-colors border border-[#454545] ${
                    isAuthenticated
                      ? 'hover:bg-[#2d2d2d] cursor-pointer'
                      : 'opacity-30 cursor-default'
                  }`}
                  aria-label="Collapse all folders"
                  title={isAuthenticated ? "Collapse all folders" : "Authentication required"}
                >
                  <ChevronsDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      closeAllTabs();
                    }
                  }}
                  disabled={!isAuthenticated}
                  className={`p-0.5 rounded transition-colors border border-[#454545] ${
                    isAuthenticated
                      ? 'hover:bg-[#2d2d2d] cursor-pointer'
                      : 'opacity-30 cursor-default'
                  }`}
                  aria-label="Close all tabs"
                  title={isAuthenticated ? "Close all tabs" : "Authentication required"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              {fileStructure.map((section, sectionIndex) => {
              // Check if this is a header section
              const isHeader = 'isHeader' in section && section.isHeader;

              // Create unique key that combines section ID with index to prevent duplicates
              const uniqueKey = `${section.id}-${sectionIndex}`;

              // Render header sections differently
              if (isHeader) {
                return (
                  <div key={uniqueKey} className="mb-2 mt-4 first:mt-0">
                    <div className="text-[10px] uppercase text-[#858585] px-2 py-1 font-medium tracking-wide">
                      {section.name}
                    </div>
                    {/* Show new folder input right after Projects header */}
                    {section.name === 'Projects' && isCreatingFolder && (
                      <div className="flex items-center w-full hover:bg-[#2d2d2d] px-1 py-0.5 rounded mt-1">
                        <ChevronRight className="w-3 h-3 mr-1 text-[#858585]" />
                        <Folder className="w-4 h-4 mr-1 text-[#c09553]" />
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={() => {
                            // Only cancel if we're not in the middle of submitting
                            setTimeout(() => {
                              if (isCreatingFolder && !isCreatingProject) {
                                handleFolderNameCancel();
                              }
                            }, 100);
                          }}
                          disabled={isCreatingProject}
                          className={`flex-1 bg-transparent border-none outline-none text-xs text-[#cccccc] placeholder-[#858585] ${
                            isCreatingProject ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          placeholder={isCreatingProject ? "Creating project..." : "Project name..."}
                          title="Enter project name"
                          aria-label="Enter project name"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                );
              }

              const isOpen = openSections.has(section.id);
              const isFolder = 'isFolder' in section && section.isFolder;
              const isDraggedOver = dragOverItem === section.id;
              const isBeingDragged = draggedItem === section.id;
              const isCurrentlyRenamingFolder = renamingFolder?.folderId === section.id;

              // Check if this is a user-created folder (not main categories)
              const isUserFolder = isFolder && section.id !== 'projects' && section.id !== 'financial';
              const isPinnedFolder = 'isPinned' in section && section.isPinned;
              const isDraggableFolder = isUserFolder && !isPinnedFolder;

              const sectionContent = (
                <div
                  className={`flex items-center w-full hover:bg-[#2d2d2d] px-1 py-0.5 rounded group transition-all duration-150 overflow-hidden ${
                    isDraggedOver ? 'bg-[#3a3a3a] border-l-2 border-[#007acc] shadow-lg transform scale-105' : ''
                  } ${isBeingDragged ? 'opacity-30 scale-95' : ''} ${isDraggableFolder ? 'cursor-move' : ''}`}
                  draggable={isDraggableFolder}
                  onDragStart={isDraggableFolder ? (e) => handleDragStart(e, section.id) : undefined}
                  onDragOver={isDraggableFolder ? (e) => handleDragOver(e, section.id) : undefined}
                  onDragLeave={isDraggableFolder ? handleDragLeave : undefined}
                  onDrop={isDraggableFolder ? (e) => handleDrop(e, section.id) : undefined}
                  onDragEnd={isDraggableFolder ? handleDragEnd : undefined}
                >
                  <div
                    onClick={() => !isCurrentlyRenamingFolder && toggleSection(section.id)}
                    className={`flex items-center flex-1 min-w-0 text-left cursor-pointer`}
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 mr-1 text-[#858585] cursor-pointer" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-1 text-[#858585] cursor-pointer" />
                    )}
                    {section.icon && typeof section.icon === 'function' ? (
                      <section.icon className="w-5 h-5 mr-1 text-[#c09553]" />
                    ) : (
                      <Folder className="w-5 h-5 mr-1 text-[#c09553]" />
                    )}
                    {isCurrentlyRenamingFolder ? (
                      <input
                        type="text"
                        value={newFolderRename}
                        onChange={(e) => setNewFolderRename(e.target.value)}
                        onKeyDown={handleFolderRenameKeyDown}
                        onBlur={() => {
                          setTimeout(() => {
                            if (renamingFolder) {
                              handleFolderRenameCancel();
                            }
                          }, 100);
                        }}
                        className="flex-1 bg-transparent border border-[#454545] outline-none text-xs text-[#cccccc] placeholder-[#858585] px-1 py-0.5 rounded"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Folder name..."
                        title="Enter folder name"
                        aria-label="Enter folder name"
                      />
                    ) : (
                      <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                        <span className="text-xs text-[#cccccc] truncate" title={section.name}>{section.name}</span>
                        {isPinnedFolder && (
                          <div title="Pinned folder" className="flex-shrink-0 ml-1">
                            <Pin className="w-3 h-3 text-[#007acc]" />
                          </div>
                        )}
                        {(section as any).isSystemFolder && (
                          <div title="System folder" className="flex-shrink-0 ml-1">
                            <Pin className="w-3 h-3 text-blue-400" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {((section.id === 'projects' || section.id === 'financial' || (section.id === 'system-header' && !instructionsProject && !contentCreationProject) || 'isFolder' in section) && !isCurrentlyRenamingFolder && !(section as any).isSystemFolder) && (
                    <div className="opacity-0 group-hover:opacity-100 ml-auto flex items-center">
                      {isUserFolder && (
                        <div
                          className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity cursor-grab active:cursor-grabbing mr-1"
                          aria-label={`Drag to reorder ${section.name}`}
                        >
                          <GripVertical className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Special handling for Instructions folder
                          if (section.id && section.id.startsWith('instructions-')) {
                            // Use instructions-specific creation (handled by chat terminal)
                            console.log('Instructions folder - files should be created via chat terminal');
                            return;
                          }
                          
                          // Prevent creation in System section when Instructions or Content Creation already exists
                          if (section.id === 'system-header' && (instructionsProject || contentCreationProject)) {
                            console.log('System section already has system projects - no additional projects allowed');
                            return;
                          }

                          const folderId = section.id === 'projects' ? '' : section.id === 'financial' ? '' : section.id === 'system-header' ? '' : section.id;
                          const category = section.id === 'financial' ? 'financial' : 'project';
                          handleCreateFileInFolder(folderId, section.name, category);
                        }}
                        className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity"
                        aria-label={`Create file in ${section.name}`}
                        title={
                          section.id && section.id.startsWith('instructions-') 
                            ? 'Use chat terminal to create instruction files' 
                            : section.id === 'system-header' && (instructionsProject || contentCreationProject)
                            ? 'System section is limited to Instructions and Content Creation projects only'
                            : `Create file in ${section.name}`
                        }
                      >
                        <Plus className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                      </button>
                      {!isPinnedFolder && !(section as any).isSystemFolder && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (section.id === 'projects') {
                              // Delete the entire projects category
                              deleteProjectsCategory();
                            } else if (section.id === 'financial') {
                              // Delete the entire financial category
                              deleteFinancialCategory();
                            } else {
                              // Move user folder to trash (only if not pinned and not system folder)
                              const folder = [...projectFolders].find(f => f.id === section.id);
                              if (folder && !folder.pinned) {
                                // First move to local trash
                                moveToTrash(folder, 'folder');

                                // If folder has a convex ID, also move to database trash
                                if (folder.convexId) {
                                  try {
                                    await deleteProject(folder.convexId as Id<"projects">, 'user');
                                    console.log(`✅ Project "${folder.name}" moved to database trash`);
                                  } catch (error) {
                                    console.error(`❌ Error moving project "${folder.name}" to database trash:`, error);
                                  }
                                } else {
                                  console.log(`📁 Project "${folder.name}" moved to local trash only (no Convex ID)`);
                                }
                              }
                            }
                          }}
                          className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity"
                          aria-label={`Delete ${section.name}`}
                        >
                          <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );

              return (
                <div key={uniqueKey} className="mb-1">
                  {isUserFolder ? (
                    <div>
                      {sectionContent}
                    </div>
                  ) : (
                    sectionContent
                  )}

                  {isOpen && 'children' in section && section.children && (
                    <div className="ml-4 space-y-0.5 mt-1">
                      {section.children.map((file, index) => {
                        const FileIconComponent = getFileIconComponent(file.type);
                        const isProjectFile = 'file' in file && file.file;
                        const isCurrentlyRenaming = renamingFile?.fileId === ('id' in file ? file.id : '');
                        const fileId = 'id' in file ? file.id : '';
                        const isDraggedFile = draggedFile === fileId;
                        const isDraggedOverFile = dragOverFile === fileId;

                        return (
                          <div key={'id' in file ? file.id : `${section.id}-${index}`}>
                              <div
                                className={`group flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded cursor-pointer transition-all duration-150 overflow-hidden ${
                                  isDraggedOverFile ? 'bg-[#3a3a3a] border-l-2 border-[#007acc] shadow-lg transform scale-105' : ''
                                } ${isDraggedFile ? 'opacity-30 scale-95' : ''} ${isProjectFile && !isCurrentlyRenaming ? 'cursor-move' : ''}`}
                                draggable={isProjectFile && !isCurrentlyRenaming}
                                onDragStart={isProjectFile && !isCurrentlyRenaming ? (e) => handleFileDragStart(e, fileId, section.id) : undefined}
                                onDragOver={isProjectFile && !isCurrentlyRenaming ? (e) => handleFileDragOver(e, fileId) : undefined}
                                onDragLeave={isProjectFile && !isCurrentlyRenaming ? handleFileDragLeave : undefined}
                                onDrop={isProjectFile && !isCurrentlyRenaming ? (e) => handleFileDrop(e, fileId, section.id) : undefined}
                                onDragEnd={isProjectFile && !isCurrentlyRenaming ? handleFileDragEnd : undefined}
                              >
                                <div
                                  className="flex items-center flex-1 min-w-0"
                                  onClick={() => {
                                    if (isProjectFile && file.file && !isCurrentlyRenaming) {
                                      openTab(file.file);
                                    }
                                  }}
                                >
                                  <FileIconComponent className="w-5 h-5 mr-2 text-[#c09553]" />
                                  {isCurrentlyRenaming ? (
                                    <input
                                      type="text"
                                      value={newFileName}
                                      onChange={(e) => setNewFileName(e.target.value)}
                                      onKeyDown={handleRenameKeyDown}
                                      onBlur={() => {
                                        setTimeout(() => {
                                          if (renamingFile) {
                                            handleRenameCancel();
                                          }
                                        }, 100);
                                      }}
                                      className="flex-1 bg-transparent border border-[#454545] outline-none text-xs text-[#cccccc] placeholder-[#858585] px-1 py-0.5 rounded"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                      placeholder="File name..."
                                      title="Enter file name"
                                      aria-label="Enter file name"
                                    />
                                  ) : (
                                    <span className="text-xs text-[#cccccc] block w-full truncate" title={file.name}>{file.name}</span>
                                  )}
                                </div>
                                {isProjectFile && file.file && !isCurrentlyRenaming && (
                                  <div className="opacity-0 group-hover:opacity-100 ml-auto flex items-center">
                                    <div
                                      className="p-0.5 hover:bg-[#3d3d3d] rounded transition-opacity cursor-grab active:cursor-grabbing mr-1"
                                      aria-label={`Drag to reorder ${file.name}`}
                                    >
                                      <GripVertical className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(file.file.id, file.name);
                                      }}
                                      className="px-1 hover:bg-[#3d3d3d] rounded transition-opacity"
                                      aria-label={`Delete ${file.name}`}
                                    >
                                      <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                                    </button>
                                  </div>
                                )}
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Handle top-level files (files without folders) */}
                  {'file' in section && (
                    <div>
                        <div
                          className={`group flex items-center hover:bg-[#2d2d2d] px-1 py-0.5 rounded ml-4 transition-all duration-150 overflow-hidden ${
                            draggedFile === section.file.id ? 'opacity-30 scale-95' : ''
                          } ${dragOverFile === section.file.id ? 'bg-[#3a3a3a] border-l-2 border-[#007acc] shadow-lg transform scale-105' : ''} ${
                            renamingFile?.fileId !== section.file.id ? 'cursor-move' : ''
                          }`}
                          draggable={renamingFile?.fileId !== section.file.id}
                          onDragStart={renamingFile?.fileId !== section.file.id ? (e) => handleFileDragStart(e, section.file.id, '') : undefined}
                          onDragOver={renamingFile?.fileId !== section.file.id ? (e) => handleFileDragOver(e, section.file.id) : undefined}
                          onDragLeave={renamingFile?.fileId !== section.file.id ? handleFileDragLeave : undefined}
                          onDrop={renamingFile?.fileId !== section.file.id ? (e) => handleFileDrop(e, section.file.id, '') : undefined}
                          onDragEnd={renamingFile?.fileId !== section.file.id ? handleFileDragEnd : undefined}
                        >
                          <div
                            className="flex items-center flex-1 min-w-0"
                            onClick={() => {
                              const isCurrentlyRenaming = renamingFile?.fileId === section.file.id;
                              if (section.file && !isCurrentlyRenaming) {
                                openTab(section.file);
                              }
                            }}
                          >
                            {(() => {
                              const IconComponent = getFileIconComponent(section.type);
                              return <IconComponent className="w-5 h-5 mr-2 text-[#c09553]" />;
                            })()}
                            {renamingFile?.fileId === section.file.id ? (
                              <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onKeyDown={handleRenameKeyDown}
                                onBlur={() => {
                                  setTimeout(() => {
                                    if (renamingFile) {
                                      handleRenameCancel();
                                    }
                                  }, 100);
                                }}
                                className="flex-1 bg-transparent border border-[#454545] outline-none text-xs text-[#cccccc] placeholder-[#858585] px-1 py-0.5 rounded"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                placeholder="File name..."
                                title="Enter file name"
                                aria-label="Enter file name"
                              />
                            ) : (
                              <span className="text-xs text-[#cccccc] block w-full truncate" title={section.name}>{section.name}</span>
                            )}
                          </div>
                          {renamingFile?.fileId !== section.file.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(section.file.id, section.name);
                              }}
                              className="opacity-0 group-hover:opacity-100 ml-auto px-1 hover:bg-[#3d3d3d] rounded transition-opacity"
                              aria-label={`Delete ${section.name}`}
                            >
                              <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                            </button>
                          )}
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <aside className="w-60 min-w-60 max-w-60 bg-[#181818] border-r border-[#2d2d2d] flex flex-col flex-shrink-0">
        <ScrollArea className="flex-1 h-full">
          {renderContent()}
        </ScrollArea>
      </aside>

      {/* File Creation Dropdown */}
      <FileCreationDropdown
        isOpen={isFileDropdownOpen}
        onClose={handleCloseDropdown}
        preselectedFolder={preselectedFolder}
        buttonRef={createButtonRef}
      />
    </>
  );
}