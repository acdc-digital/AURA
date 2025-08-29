// VS Code-Inspired AURA Dashboard - Homepage
// /Users/matthewsimon/Projects/AURA/AURA/app/page.tsx

"use client";

import { Copyright, AlertCircle, Fingerprint } from "lucide-react";
import { DashActivityBar } from "./_components/activity/dashActivityBar";
import { Navigator } from "./_components/editor/Navigator";
import { DashSidebar } from "./_components/sidebar/dashSidebar";
import { Terminal } from "./_components/terminal";
import { AuthWrapper } from "@/app/_components/auth/AuthWrapper";
import { useSidebarStore } from "@/lib/store";
import { useTerminalStore } from "@/lib/store/terminal";
import { useOnboarding } from "@/lib/hooks";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useState, useCallback, useEffect } from "react";

export default function HomePage() {
  const { activePanel, setActivePanel } = useSidebarStore();
  const { isCollapsed, setCollapsed } = useTerminalStore();
  const { needsOnboarding } = useOnboarding();
  const [terminalHeight, setTerminalHeight] = useState(40); // Height as percentage of viewport
  const [isResizing, setIsResizing] = useState(false);

  // Auto-expand terminal for onboarding (only once, don't force it to stay open)
  useEffect(() => {
    if (needsOnboarding && isCollapsed) {
      // Only auto-expand on first load, not when user manually collapses
      const hasAutoExpanded = sessionStorage.getItem('terminal-auto-expanded-for-onboarding');
      if (!hasAutoExpanded) {
        setCollapsed(false);
        sessionStorage.setItem('terminal-auto-expanded-for-onboarding', 'true');
      }
    }
  }, [needsOnboarding, isCollapsed, setCollapsed]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return;
    
    e.preventDefault();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startHeight = terminalHeight;
    const viewportHeight = window.innerHeight;
    const terminalElement = e.currentTarget.parentElement;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaY = startY - moveEvent.clientY; // Inverted because we're dragging from top
      const deltaPercentage = (deltaY / viewportHeight) * 100;
      const newHeight = Math.min(80, Math.max(15, startHeight + deltaPercentage)); // Min 15%, Max 80%
      
      // Update DOM directly for smooth resizing
      if (terminalElement) {
        terminalElement.style.height = `${newHeight}vh`;
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Update React state only once at the end
      if (terminalElement) {
        const currentHeight = parseFloat(terminalElement.style.height);
        if (!isNaN(currentHeight)) {
          setTerminalHeight(currentHeight);
        }
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [isCollapsed, terminalHeight]);

  return (
    <AuthWrapper>
      <div className="h-screen w-screen flex flex-col bg-[#0e0e0e] text-[#cccccc] font-mono text-sm overflow-hidden relative">
        {/* Title Bar - 32px */}
        <header className="h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-0 select-none">
          {/* Title */}
          <div className="flex-1 flex justify-start items-center ml-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-[#858585] border border-[#858585] rounded-xs p-0.5" />
              <span className="text-xs text-[#858585] font-sf">
                AURA - Automate Your Aura
              </span>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center pr-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area with Resizable Panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Activity Bar */}
          <DashActivityBar
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />
          
          {/* Main work area with dashboard and overlaid terminal */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar - Fixed width */}
            <DashSidebar activePanel={activePanel} />

            {/* Dashboard/Editor - Full height, no space reserved for terminal */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navigator />
            </div>

            {/* Terminal - Completely overlaid at bottom, doesn't affect layout flow */}
            <div
              className={`absolute bottom-0 left-[240px] right-0 z-10 ${
                isCollapsed ? 'h-[35px]' : ''
              }`}
              // eslint-disable-next-line react/forbid-dom-props
              style={!isCollapsed ? { height: `${terminalHeight}vh`, transition: isResizing ? 'none' : 'height 200ms' } : undefined}
            >
              {/* Resize handle - only show when expanded */}
              {!isCollapsed && (
                <div
                  className="absolute top-0 left-0 right-0 h-2 cursor-grab active:cursor-grabbing z-40 bg-transparent"
                  onMouseDown={handleMouseDown}
                  title="Drag to resize terminal"
                />
              )}
              <Terminal />
            </div>
          </div>
        </div>

        {/* Status Bar - 22px */}
        <footer className="h-[22px] bg-[#2d2d2d] text-[#cccccc] text-xs flex items-center px-2 justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Copyright className="w-3 h-3" />
              <span>ACDC.digital</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>0</span>
            </div>
            <span>AURA Dashboard v1.0.0</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[#cccccc]">▲ Next.js ^15 | Convex</span>
            <span>Anthropic Claude 3.7 Sonnet</span>
            <span className="text-[#858585]">
              MCP Server: 0
            </span>
          </div>
        </footer>
      </div>
    </AuthWrapper>
  );
}