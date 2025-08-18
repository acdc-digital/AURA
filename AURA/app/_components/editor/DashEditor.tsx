// EDITOR COMPONENT - Main editor panel with tabs and navigation for AURA
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/editor/DashEditor.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { useConvexAuth } from "convex/react";
import { ChevronLeft, ChevronRight, Plus, X, FileCode, FileText } from "lucide-react";

export function DashEditor() {
  const { 
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
    markTabDirty
  } = useEditorStore();

  const { isAuthenticated } = useConvexAuth();
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Calculate the visible area width (container width minus button widths)
  const TAB_WIDTH = 200;
  const visibleTabsCount = Math.floor(containerWidth / TAB_WIDTH) || 1;
  const maxScrollPosition = Math.max(0, tabs.length - visibleTabsCount);

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

  // Adjust scroll position if tabs are removed
  useEffect(() => {
    if (scrollPosition > maxScrollPosition) {
      setScrollPosition(maxScrollPosition);
    }
  }, [maxScrollPosition, scrollPosition]);

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const scrollRight = () => {
    setScrollPosition(Math.min(maxScrollPosition, scrollPosition + 1));
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScrollPosition && tabs.length > 0;

  const handleNewFile = () => {
    if (isAuthenticated) {
      const newTab = {
        id: `new-file-${Date.now()}`,
        title: 'Untitled',
        type: 'file' as const,
        filePath: undefined
      };
      openTab(newTab);
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'file':
        return FileCode;
      case 'welcome':
        return FileText;
      default:
        return FileCode;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] h-full">
      {/* Tab Bar */}
      <div className="h-[35px] bg-[#181818] border-b border-l border-r border-[#2d2d2d] relative flex-shrink-0">
        {/* Tab Container - Full width with space for buttons */}
        <div ref={containerRef} className="absolute left-8 right-16 top-0 bottom-0 overflow-hidden bg-[#1e1e1e]">
          <div 
            className="flex transition-transform duration-200 h-full"
            style={{ 
              transform: `translateX(-${scrollPosition * 200}px)` 
            }}
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`
                  flex items-center gap-2 px-3 h-[35px] text-xs border-r border-[#2d2d2d] ${isAuthenticated ? 'cursor-pointer' : 'cursor-default'} flex-shrink-0 transition-colors duration-150
                  ${activeTabId === tab.id
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
                  const IconComponent = getTabIcon(tab.type);
                  return <IconComponent className="w-3 h-3 flex-shrink-0" />;
                })()}
                <span className={`truncate flex-1 ${tab.isDirty ? 'text-[#cccccc]' : ''}`}>
                  {tab.title}
                </span>
                {tab.isDirty && <div className="w-2 h-2 bg-[#cccccc] rounded-full flex-shrink-0" />}

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
            
          {/* Add New Tab Button */}
          <button
            disabled={!isAuthenticated}
            className={`flex items-center justify-center w-8 h-[35px] text-xs border-l border-[#2d2d2d] transition-colors ${
              isAuthenticated
                ? 'text-[#858585] hover:bg-[#2d2d2d]'
                : 'text-[#3d3d3d] opacity-50'
            }`}
            onClick={handleNewFile}
          >
            <span className="sr-only">Create new file</span>
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
          {currentTab ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-[#cccccc]">
                {currentTab.title}
              </h2>
              <p className="text-[#858585]">
                {currentTab.type === 'welcome' ? 'Welcome to AURA!' : 'Edit your file here'}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-[#cccccc]">
                {isAuthenticated ? 'Welcome to AURA!' : 'Please sign in'}
              </h1>
              <p className="text-[#858585]">
                {isAuthenticated ? 'Create a new file to get started.' : 'Sign in to access the editor.'}
              </p>
              {isAuthenticated && (
                <button
                  onClick={handleNewFile}
                  className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors"
                >
                  Create New File
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}