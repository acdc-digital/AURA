// Editor Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashEditor.tsx

"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Id } from "@/convex/_generated/dataModel";
import { useFiles } from "@/lib/hooks/useFiles";
import { useEditorStore } from "@/store";
import { ProjectFile } from "@/store/editor/types";
import { useTerminalStore } from "@/store/terminal";
import { useConvexAuth } from "convex/react";
import { AtSign, Braces, Camera, ChevronLeft, ChevronRight, DollarSign, Edit3, FileCode, FileSpreadsheet, FileText, FileType, HelpCircle, MessageSquare, Pin, Plus, User, Users, X } from "lucide-react";

// Dynamic import to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/app/_components/editor/_components/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading editor...</div>
});

// Dynamic import for social media form editor
const SocialMediaFormEditor = dynamic(() => import('@/app/_components/editor/_components/SocialMediaFormEditor'), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading social media editor...</div>
});

// Dynamic import for new Reddit post editor
const NewRedditPostEditor = dynamic(() => import('@/app/_components/editor/_components/NewRedditPostEditor').then(mod => ({ default: mod.NewRedditPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Reddit editor...</div>
});

// Dynamic import for markdown editor with preview
const MarkdownEditor = dynamic(() => import('../editor/_components/MarkdownEditor'), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading markdown editor...</div>
});

// Dynamic import for edit modules
const EditGenerals = dynamic(() => import('../editor/editGenerals').then(mod => ({ default: mod.EditGenerals })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

const EditPercentComplete = dynamic(() => import('../editor/editPercentComplete').then(mod => ({ default: mod.EditPercentComplete })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

const EditSchedule = dynamic(() => import('../editor/editSchedule').then(mod => ({ default: mod.EditSchedule })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

const EditMaterials = dynamic(() => import('../editor/editMaterials').then(mod => ({ default: mod.EditMaterials })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading module...</div>
});

// Dynamic import for Calendar component
const CalendarPage = dynamic(() => import('../calendar/page'), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading calendar...</div>
});

// Dynamic import for User Profile component
const UserProfile = dynamic(() => import('../user-profile/UserProfile').then(mod => ({ default: mod.UserProfile })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading profile...</div>
});

// Dynamic import for Welcome Sign In Card
const WelcomeSignInCard = dynamic(() => import('./WelcomeSignInCard').then(mod => ({ default: mod.WelcomeSignInCard })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading welcome...</div>
});

// Dynamic import for Welcome Tab
const WelcomeTab = dynamic(() => import('./WelcomeTab').then(mod => ({ default: mod.WelcomeTab })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading welcome...</div>
});

// Dynamic import for Terminal component
const Terminal = dynamic(() => import('../terminal/terminal').then(mod => ({ default: mod.Terminal })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading terminal...</div>
});

// Dynamic import for Social and File Editor components
const SocialConnectors = dynamic(() => import('./socialConnectors').then(mod => ({ default: mod.SocialConnectors })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading social connectors...</div>
});

const FileEditor = dynamic(() => import('./fileEditor').then(mod => ({ default: mod.FileEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading file editor...</div>
});

const PlatformInstructions = dynamic(() => import('./platformInstructions').then(mod => ({ default: mod.PlatformInstructions })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading instructions...</div>
});

// Dynamic import for Social Platform Editors
const FacebookPostEditor = dynamic(() => import('./socialPlatforms/facebookPostEditor').then(mod => ({ default: mod.FacebookPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Facebook editor...</div>
});

const XPostEditor = dynamic(() => import('./socialPlatforms/xPostEditor').then(mod => ({ default: mod.XPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading X editor...</div>
});

const InstagramPostEditor = dynamic(() => import('./socialPlatforms/instagramPostEditor').then(mod => ({ default: mod.InstagramPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Instagram editor...</div>
});

const RedditPostEditor = dynamic(() => import('./socialPlatforms/redditPostEditor').then(mod => ({ default: mod.RedditPostEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Reddit editor...</div>
});

// Dynamic import for Logo Generator Tab
const LogoGeneratorTab = dynamic(() => import('../logo-generator/LogoGeneratorTab'), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Logo Generator...</div>
});

// Dynamic import for Subscription Plans Tab
const SubscriptionPlans = dynamic(() => import('../subscription/SubscriptionPlans').then(mod => ({ default: mod.SubscriptionPlans })), {
  ssr: false,
  loading: () => <div className="p-4 text-[#858585]">Loading Subscription Plans...</div>
});

export function DashEditor() {
  const { 
    openTabs, 
    activeTab, 
    closeTab, 
    setActiveTab, 
    reorderTabs,
    pinTab,
    unpinTab,
    updateFileContent,
    createNewFile,
    projectFolders,
    projectFiles
  } = useEditorStore();

  const { isCollapsed: isTerminalCollapsed } = useTerminalStore();
  const { isAuthenticated } = useConvexAuth();
  
  // Add files hook for database operations
  const { updateFile } = useFiles(null);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<ProjectFile['type']>('markdown');
  const [newFileFolderId, setNewFileFolderId] = useState<string>('no-folder');
  
  // Drag and drop state for tabs
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Calculate the visible area width (container width minus button widths)
  const TAB_WIDTH = 200;
  const visibleTabsCount = Math.floor(containerWidth / TAB_WIDTH) || 1;
  const maxScrollPosition = Math.max(0, openTabs.length - visibleTabsCount);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // Close create menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    if (showCreateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateMenu]);

  // Adjust scroll position if tabs are removed
  useEffect(() => {
    if (scrollPosition > maxScrollPosition) {
      setScrollPosition(maxScrollPosition);
    }
  }, [maxScrollPosition, scrollPosition]);

  // Drag and drop handlers for tabs
  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Just prevent default to allow drop, no visual indicator needed
  };

  const handleTabDragLeave = () => {
    // No action needed since we're not showing drag-over indicators
  };

  const handleTabDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== targetTabId) {
      // Reorder the tabs in the store
      reorderTabs(draggedTab, targetTabId);
    }
    setDraggedTab(null);
  };

  const handleTabDragEnd = () => {
    setDraggedTab(null);
  };

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const scrollRight = () => {
    setScrollPosition(Math.min(maxScrollPosition, scrollPosition + 1));
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScrollPosition && openTabs.length > 0;

  const getFileContent = (tabId: string) => {
    const tab = openTabs.find((t) => t.id === tabId);
    const content = tab ? tab.content : '// File not found';
    
    console.log('🔍 getFileContent called:', {
      tabId,
      foundTab: !!tab,
      tabName: tab?.name,
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 100) || 'NO CONTENT',
      isDefaultContent: content?.includes('Start writing your content here') || content?.includes('// File not found')
    });
    
    return content;
  };

  const handleContentChange = useCallback(async (content: string) => {
    if (activeTab) {
      // Update the file content in the local store
      updateFileContent(activeTab, content);
      
      // Also update the file in the database if it has a convexId
      const file = projectFiles.find(f => f.id === activeTab);
      if (file?.convexId) {
        try {
          await updateFile({
            fileId: file.convexId as Id<"files">,
            content: content
          });
          console.log(`✅ Updated file content in database for ${file.name}`);
        } catch (error) {
          console.error(`❌ Failed to update file content in database:`, error);
        }
      }
    }
  }, [activeTab, updateFileContent, updateFile, projectFiles]);

  // Get current tab content - memoized to ensure editors get fresh content
  const currentTabContent = useMemo(() => {
    if (!activeTab) {
      console.log('📄 No active tab, returning empty content');
      return '';
    }
    
    const content = getFileContent(activeTab);
    console.log('📄 Current tab content updated:', {
      activeTab,
      contentLength: content.length,
      contentPreview: content.substring(0, 100),
      timestamp: new Date().toISOString()
    });
    return content;
  }, [activeTab, openTabs]); // Re-calculate when activeTab changes or tabs are updated

  // Save current tab content before switching tabs
  const saveCurrentTabContent = useCallback(() => {
    // This will be called when activeTab changes to save the previous content
    // The MarkdownEditor and TiptapEditor handle this via their onChange callbacks
    console.log('🔄 Tab switching - content should auto-save via onChange');
  }, []);

  const handleCreateFileWithDetails = () => {
    if (newFileName.trim()) {
      createNewFile(
        newFileName.trim(),
        newFileType,
        'project',
        newFileFolderId === 'no-folder' ? undefined : newFileFolderId
      );
      // Reset form
      setNewFileName('');
      setNewFileType('markdown');
      setNewFileFolderId('no-folder');
      setShowCreateMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateFileWithDetails();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowCreateMenu(false);
    }
  };

  // Get current tab to check if it's editable - memoized to prevent remounting
  const currentTab = useMemo(() => 
    openTabs.find((t) => t.id === activeTab), 
    [openTabs, activeTab]
  );

  // Get file status for the current tab
  const getCurrentFileStatus = () => {
    if (!currentTab) return undefined;
    const file = projectFiles.find(f => f.id === currentTab.id);
    console.log('📊 getCurrentFileStatus DEBUG:', {
      currentTabId: currentTab?.id,
      currentTabName: currentTab?.name,
      foundFile: !!file,
      fileStatus: file?.status,
      allProjectFiles: projectFiles.map(f => ({ id: f.id, name: f.name, status: f.status }))
    });
    return file?.status;
  };

  const currentFileStatus = getCurrentFileStatus();

  // Calculate line count based on active tab's content - dynamic based on content type
  const getLineCount = () => {
    if (!currentTab) return 1;
    
    // For special tabs (non-editable), use minimal line numbers
    if (['sign-in', 'user-profile', 'calendar', 'social-connect', 'post-creator', 'platform-instructions', 'logo-generator', 'subscription', 'markdown'].includes(currentTab.type)) {
      return 1; // Minimal line numbers for special tabs
    }
    
    // For editable files (including social media), calculate based on content
    if (currentTab.content) {
      const lines = currentTab.content.split('\n').length;
      return Math.max(lines, 10); // Minimum 10 lines, but grow with content
    }
    
    return 10; // Default for empty files
  };
  
  const lineCount = getLineCount();

  const isSocialMediaFile = currentTab ? ['x', 'facebook', 'instagram', 'reddit'].includes(currentTab.type) : false;
  const isEditable = currentTab ? 
    ['typescript', 'javascript', 'json', 'markdown', 'x', 'facebook', 'instagram', 'reddit'].includes(currentTab.type) &&
    // For social media files, disable editing if status is 'posted'
    !(isSocialMediaFile && currentFileStatus === 'posted')
    : false;
    
  // Debug isEditable calculation
  console.log('🔍 isEditable calculation:', {
    currentTabType: currentTab?.type,
    isSocialMediaFile,
    currentFileStatus,
    isTypeEditable: currentTab ? ['typescript', 'javascript', 'json', 'markdown', 'x', 'facebook', 'instagram', 'reddit'].includes(currentTab.type) : false,
    shouldDisableForPosted: isSocialMediaFile && currentFileStatus === 'posted',
    finalIsEditable: isEditable
  });
  const isMarkdownFile = currentTab?.type === 'markdown';
  const isGeneralsModule = currentTab?.type === 'generals';
  const isPercentCompleteModule = currentTab?.type === 'percent-complete';
  const isScheduleModule = currentTab?.type === 'schedule';
  const isMaterialsModule = currentTab?.type === 'materials';
  const isSocialConnectModule = currentTab?.type === 'social-connect';
  const isPostCreatorModule = currentTab?.type === 'post-creator';
  const isCalendarModule = currentTab?.type === 'calendar';
  const isUserProfileModule = currentTab?.type === 'user-profile';
  const isSignInModule = currentTab?.type === 'sign-in';
  const isPlatformInstructionsModule = currentTab?.type === 'platform-instructions';
  const isLogoGeneratorModule = currentTab?.type === 'logo-generator';
  const isSubscriptionModule = currentTab?.type === 'subscription';

  // Social media files handle their own state management internally
  // No need for change handlers as they can cause content conflicts

  return (
    <main className="flex-1 flex flex-col bg-[#1a1a1a]">
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel 
          id="editor-main" 
          defaultSize={isTerminalCollapsed ? 97 : 60} 
          minSize={30} 
          className="flex flex-col"
        >
          {/* Tab Bar */}
          <div className="h-[35px] bg-[#181818] border-b border-l border-r border-[#2d2d2d] relative flex-shrink-0">
            {/* Tab Container - Full width with space for buttons */}
            <div ref={containerRef} className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-[#0e0e0e]">
              <div 
                className="flex transition-transform duration-200 h-full"
                style={{ 
                  transform: `translateX(-${scrollPosition * 200}px)` 
                }}
              >
                {openTabs
                  // Filter out sign-in tab when user is authenticated
                  .filter((tab) => {
                    if (isAuthenticated && tab.type === 'sign-in') {
                      return false;
                    }
                    return true;
                  })
                  .sort((a, b) => {
                    // Sort pinned tabs first by pinnedOrder, then unpinned tabs
                    if (a.pinned && b.pinned) {
                      return (a.pinnedOrder || 0) - (b.pinnedOrder || 0);
                    }
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return 0; // Maintain original order for unpinned tabs
                  })
                  .map((tab) => (
                  <div
                    key={tab.id}
                    draggable
                    onDragStart={(e) => handleTabDragStart(e, tab.id)}
                    onDragOver={handleTabDragOver}
                    onDragLeave={handleTabDragLeave}
                    onDrop={(e) => handleTabDrop(e, tab.id)}
                    onDragEnd={handleTabDragEnd}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`
                      flex items-center gap-2 px-3 h-[35px] text-xs border-r border-[#2d2d2d] ${isAuthenticated ? 'cursor-pointer' : 'cursor-default'} flex-shrink-0 transition-colors duration-150
                      ${draggedTab === tab.id
                        ? 'bg-[#0e639c] text-white' // Blue color when being dragged (matches terminal header)
                        : activeTab === tab.id
                          ? 'bg-[#1a1a1a] text-[#cccccc]'
                          : 'bg-[#0e0e0e] text-[#858585] hover:bg-[#181818]'
                      }
                    `}
                    style={{ 
                      width: '200px'
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {(() => {
                      const getTabIcon = (type: string) => {
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
                            return FileText;
                          case 'percent-complete':
                            return FileSpreadsheet;
                          case 'schedule':
                            return FileSpreadsheet;
                          case 'materials':
                            return FileSpreadsheet;
                          case 'social-connect':
                            return Users;
                          case 'post-creator':
                            return Edit3;
                          case 'facebook':
                            return MessageSquare;
                          case 'reddit':
                            // Custom "r/" display for Reddit files
                            const RedditIcon = () => (
                              <span className="w-3 h-3 flex-shrink-0 text-[#858585] text-xs font-medium flex items-center justify-center">
                                r/
                              </span>
                            );
                            RedditIcon.displayName = 'RedditIcon';
                            return RedditIcon;
                          case 'instagram':
                            return Camera;
                          case 'x':
                            return AtSign;
                          case 'user-profile':
                            return User;
                          case 'sign-in':
                            return User;
                          case 'platform-instructions':
                            return HelpCircle;
                          case 'logo-generator':
                            return HelpCircle; // Using HelpCircle temporarily, can be updated to a more specific icon
                          case 'subscription':
                            return DollarSign;
                          default:
                            return FileCode;
                        }
                      };
                      const IconComponent = getTabIcon(tab.type);
                      return <IconComponent className="w-3 h-3 flex-shrink-0" />;
                    })()}
                    <span className={`truncate flex-1 ${tab.modified ? 'text-[#cccccc]' : ''}`}>
                      {tab.name}
                    </span>
                    {tab.modified && <div className="w-2 h-2 bg-[#cccccc] rounded-full flex-shrink-0" />}
                    
                    {/* Pin/Unpin Icon - Shows on hover or when pinned for all tabs when authenticated */}
                    {isAuthenticated && (hoveredTab === tab.id || tab.pinned) && (
                      <Pin
                        className={`w-3 h-3 hover:bg-[#2d2d2d] rounded flex-shrink-0 transition-colors cursor-pointer ${
                          tab.pinned ? 'text-[#007acc]' : 'text-[#858585] hover:text-[#cccccc]'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tab.pinned) {
                            unpinTab(tab.id);
                          } else {
                            pinTab(tab.id);
                          }
                        }}
                      />
                    )}

                    {/* Close Button - Shows on hover for all tabs when authenticated */}
                    {isAuthenticated && hoveredTab === tab.id && (
                      <X
                        className="w-3 h-3 hover:bg-[#2d2d2d] rounded flex-shrink-0 text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Left Scroll Button - Overlay */}
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`
                absolute left-0 z-10 w-8 h-[35px] flex items-center justify-center border-r border-b border-[#2d2d2d] bg-[#181818]
                ${canScrollLeft 
                  ? 'hover:bg-[#2d2d2d] text-[#858585]' 
                  : 'text-[#3d3d3d] opacity-30'
                }
              `}
            >
              <span className="sr-only">Scroll left</span>
              <ChevronLeft className="w-3 h-3" />
            </button>

            {/* Right side buttons container - Overlay */}
            <div className="absolute right-0 z-10 flex h-[35px] bg-[#181818] border-b border-[#2d2d2d]">
              {/* Right Scroll Button */}
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`
                  w-8 h-[35px] flex items-center justify-center border-l border-[#2d2d2d]
                  ${canScrollRight 
                    ? 'hover:bg-[#2d2d2d] text-[#858585]' 
                    : 'text-[#3d3d3d] opacity-30'
                  }
                `}
              >
                <span className="sr-only">Scroll right</span>
                <ChevronRight className="w-3 h-3" />
              </button>
                
              {/* Add New Tab Button - Now functional */}
              <div className="relative" ref={createMenuRef}>
                <button
                  disabled={!isAuthenticated}
                  className={`flex items-center justify-center w-8 h-[35px] text-xs border-l border-[#2d2d2d] transition-colors ${
                    isAuthenticated
                      ? 'text-[#858585] hover:bg-[#2d2d2d]'
                      : 'text-[#3d3d3d] opacity-50'
                  }`}
                  onClick={() => isAuthenticated && setShowCreateMenu(!showCreateMenu)}
                >
                  <span className="sr-only">Create new file</span>
                  <Plus className="w-3 h-3" />
                </button>

                {/* Create file modal-style dropdown */}
                {showCreateMenu && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-[#2d2d2d] border border-[#454545] rounded shadow-xl z-50 p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="text-sm font-medium text-[#cccccc] border-b border-[#454545] pb-2">
                        Create New File
                      </div>

                      {/* File Name Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#cccccc]">File Name</label>
                        <input
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="Enter file name"
                          className="w-full px-3 py-2 text-sm bg-[#1e1e1e] border border-[#454545] text-[#cccccc] placeholder-[#858585] rounded focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc]"
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </div>

                      {/* File Type Select */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#cccccc]">File Type</label>
                        <select
                          value={newFileType}
                          onChange={(e) => setNewFileType(e.target.value as ProjectFile['type'])}
                          className="w-full px-3 py-2 text-sm bg-[#1e1e1e] border border-[#454545] text-[#cccccc] rounded focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc]"
                          aria-label="Select file type"
                        >
                          <option value="markdown" className="bg-[#2d2d2d]">Markdown (.md)</option>
                          <option value="typescript" className="bg-[#2d2d2d]">TypeScript (.ts/.tsx)</option>
                          <option value="javascript" className="bg-[#2d2d2d]">JavaScript (.js/.jsx)</option>
                          <option value="json" className="bg-[#2d2d2d]">JSON (.json)</option>
                          <option value="facebook" className="bg-[#2d2d2d]">Facebook Post</option>
                          <option value="instagram" className="bg-[#2d2d2d]">Instagram Post</option>
                          <option value="x" className="bg-[#2d2d2d]">X/Twitter Post</option>
                          <option value="reddit" className="bg-[#2d2d2d]">Reddit Post</option>
                        </select>
                      </div>

                      {/* Folder Select */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#cccccc]">Project/Folder</label>
                        <select
                          value={newFileFolderId}
                          onChange={(e) => setNewFileFolderId(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#1e1e1e] border border-[#454545] text-[#cccccc] rounded focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc]"
                          aria-label="Select project folder"
                        >
                          <option value="no-folder" className="bg-[#2d2d2d]">No folder</option>
                          {projectFolders
                            .filter((folder, index, array) => array.findIndex(f => f.id === folder.id) === index) // Remove duplicates
                            .map((folder) => (
                              <option key={`editor-folder-${folder.id}`} value={folder.id} className="bg-[#2d2d2d]">
                                📁 {folder.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-[#454545]">
                        <button
                          onClick={() => setShowCreateMenu(false)}
                          className="px-3 py-1.5 text-xs bg-[#3d3d3d] text-[#cccccc] hover:bg-[#4d4d4d] border border-[#454545] rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateFileWithDetails}
                          disabled={!newFileName.trim()}
                          className="px-3 py-1.5 text-xs bg-[#007acc] text-[#cccccc] hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          Create File
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code content with Tiptap or Edit Modules */}
            <div 
              className={`flex-1 ${
                activeTab && ['sign-in', 'user-profile', 'calendar'].includes(activeTab) 
                  ? 'overflow-hidden h-full' 
                  : 'overflow-scroll editor-scrollbar'
              }`}
              style={
                activeTab && ['sign-in', 'user-profile', 'calendar', 'logo-generator'].includes(activeTab)
                  ? { 
                    overflow: 'hidden',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  } // Completely disable scrollbars for special tabs
                  : {
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#454545 #2d2d2d'
                  }
              }
            >
              <style jsx>{`
                .editor-scrollbar::-webkit-scrollbar {
                  width: 14px;
                  height: 14px;
                  background: #2d2d2d;
                }
                .editor-scrollbar::-webkit-scrollbar-track {
                  background: #2d2d2d;
                  border-radius: 0px;
                }
                .editor-scrollbar::-webkit-scrollbar-thumb {
                  background: #454545;
                  border-radius: 0px;
                  border: 1px solid #2d2d2d;
                  min-height: 20px;
                }
                .editor-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #555555;
                }
                .editor-scrollbar::-webkit-scrollbar-corner {
                  background: #2d2d2d;
                }
                .editor-scrollbar {
                  scrollbar-width: thin;
                  scrollbar-color: #454545 #2d2d2d;
                }
              `}</style>
              <div className="flex min-h-full">
                {/* Line numbers - synchronized with content - only show for code/text files */}
                {currentTab && !['sign-in', 'user-profile', 'calendar', 'social-connect', 'post-creator', 'platform-instructions', 'logo-generator', 'subscription', 'x', 'facebook', 'instagram', 'reddit', 'markdown'].includes(currentTab.type) && (
                  <div className="bg-[#1a1a1a] text-[#858585] text-center px-2 select-none w-[40px] border-r border-[#2d2d2d] flex-shrink-0">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i} className="leading-5 text-xs font-mono h-5">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                )}

                {/* Editor content */}
                <div ref={contentRef} className="flex-1">
                  {activeTab ? (
                    <>
                      {isGeneralsModule ? (
                        <EditGenerals />
                      ) : isPercentCompleteModule ? (
                        <EditPercentComplete />
                      ) : isScheduleModule ? (
                        <EditSchedule />
                      ) : isMaterialsModule ? (
                        <EditMaterials />
                      ) : isSocialConnectModule ? (
                        <SocialConnectors />
                      ) : isPostCreatorModule ? (
                        <FileEditor />
                      ) : isCalendarModule ? (
                        <CalendarPage />
                      ) : isUserProfileModule ? (
                        <UserProfile />
                      ) : isSignInModule ? (
                        <WelcomeSignInCard />
                      ) : isPlatformInstructionsModule ? (
                        <PlatformInstructions platform={currentTab?.id?.split('-')[0]} />
                      ) : isLogoGeneratorModule ? (
                        <LogoGeneratorTab />
                      ) : isSubscriptionModule ? (
                        <SubscriptionPlans />
                      ) : currentTab?.type === 'facebook' ? (
                        <SocialMediaFormEditor
                          content={currentTabContent}
                          onChange={handleContentChange}
                          editable={isEditable}
                          platform="facebook"
                          fileName={currentTab.name}
                        />
                      ) : currentTab?.type === 'x' ? (
                        <SocialMediaFormEditor
                          content={currentTabContent}
                          onChange={handleContentChange}
                          editable={isEditable}
                          platform="x"
                          fileName={currentTab.name}
                        />
                      ) : currentTab?.type === 'instagram' ? (
                        <SocialMediaFormEditor
                          content={currentTabContent}
                          onChange={handleContentChange}
                          editable={isEditable}
                          platform="instagram"
                          fileName={currentTab.name}
                        />
                      ) : currentTab?.type === 'reddit' ? (
                        <NewRedditPostEditor
                          isVisible={true}
                          onClose={() => {}}
                        />
                      ) : isMarkdownFile ? (
                        <MarkdownEditor
                          key={currentTab?.id}
                          content={currentTabContent}
                          onChange={handleContentChange}
                          editable={isEditable}
                          initialMode={currentTab?.filePath?.startsWith('/instructions/') ? 'preview' : 'edit'}
                        />
                      ) : (
                        <div className="p-4">
                          <TiptapEditor
                            content={currentTabContent}
                            onChange={handleContentChange}
                            editable={isEditable}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {isAuthenticated ? (
                        <WelcomeTab />
                      ) : (
                        <WelcomeSignInCard />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle
          className={`h-[3px] bg-[#2d2d2d] hover:bg-white transition-colors cursor-ns-resize ${
            isTerminalCollapsed ? 'opacity-0 pointer-events-none h-0' : ''
          }`}
        />

        <Terminal />
      </ResizablePanelGroup>
    </main>
  );
} 