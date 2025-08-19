// SIDEBAR COMPONENT - Main sidebar that displays different panels
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/sidebar/Sidebar.tsx

"use client";

import { useSidebarStore } from "@/lib/store";
import { FileExplorerPanel } from "../activity/_components/fileExplorer/FileExplorerPanel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface SidebarProps {
  children: React.ReactNode; // Main content area
}

export function Sidebar({ children }: SidebarProps) {
  const { activePanel, isCollapsed, sidebarWidth, setSidebarWidth } = useSidebarStore();

  const renderPanel = () => {
    switch (activePanel) {
      case 'explorer':
        return <FileExplorerPanel />;
      case 'search-replace':
        return (
          <div className="p-4 text-[#858585]">
            <p>Search & Replace</p>
            <p className="text-xs mt-2">This panel will be implemented later.</p>
          </div>
        );
      case 'source-control':
        return (
          <div className="p-4 text-[#858585]">
            <p>Source Control</p>
            <p className="text-xs mt-2">Git integration panel will be implemented later.</p>
          </div>
        );
      case 'extensions':
        return (
          <div className="p-4 text-[#858585]">
            <p>Extensions</p>
            <p className="text-xs mt-2">Extensions management panel will be implemented later.</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-4 text-[#858585]">
            <p>Calendar</p>
            <p className="text-xs mt-2">Content calendar panel will be implemented later.</p>
          </div>
        );
      case 'database':
        return (
          <div className="p-4 text-[#858585]">
            <p>Database</p>
            <p className="text-xs mt-2">Database management panel will be implemented later.</p>
          </div>
        );
      case 'agents':
        return (
          <div className="p-4 text-[#858585]">
            <p>Agents</p>
            <p className="text-xs mt-2">AI agents panel will be implemented later.</p>
          </div>
        );
      case 'terminal':
        return (
          <div className="p-4 text-[#858585]">
            <p>Terminal</p>
            <p className="text-xs mt-2">Terminal panel will be implemented later.</p>
          </div>
        );
      case 'trash':
        return (
          <div className="p-4 text-[#858585]">
            <p>Trash</p>
            <p className="text-xs mt-2">Deleted items panel will be implemented later.</p>
          </div>
        );
      case 'debug':
        return (
          <div className="p-4 text-[#858585]">
            <p>Debug</p>
            <p className="text-xs mt-2">Debug tools panel will be implemented later.</p>
          </div>
        );
      case 'account':
        return (
          <div className="p-4 text-[#858585]">
            <p>Account</p>
            <p className="text-xs mt-2">User account panel will be implemented later.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 text-[#858585]">
            <p>Settings</p>
            <p className="text-xs mt-2">Settings panel will be implemented later.</p>
          </div>
        );
      default:
        return <FileExplorerPanel />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex h-screen bg-[#1e1e1e]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={50}
          className="bg-[#252526] border-r border-[#2d2d2d]"
          onResize={(size) => {
            const width = (size / 100) * window.innerWidth;
            setSidebarWidth(width);
          }}
        >
          {renderPanel()}
        </ResizablePanel>
        
        <ResizableHandle className="w-1 bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />
        
        <ResizablePanel defaultSize={75} minSize={50}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
