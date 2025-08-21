// VS Code-Inspired AURA Dashboard - Homepage
// /Users/matthewsimon/Projects/AURA/AURA/app/page.tsx

"use client";

import { Copyright, AlertCircle } from "lucide-react";
import { DashActivityBar } from "./_components/activity/dashActivityBar";
import { Navigator } from "./_components/editor/Navigator";
import { DashSidebar } from "./_components/sidebar/dashSidebar";
import { Terminal } from "./_components/terminal";
import { AuthWrapper } from "@/app/_components/auth/AuthWrapper";
import { ResizablePanelGroup, ResizablePanel /*, ResizableHandle */ } from "@/components/ui/resizable";
import { useSidebarStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { activePanel, setActivePanel } = useSidebarStore();

  return (
    <AuthWrapper>
      <div className="h-screen w-screen flex flex-col bg-[#0e0e0e] text-[#cccccc] font-mono text-sm overflow-hidden relative">
        {/* Title Bar - 32px */}
        <header className="h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-0 select-none">
          {/* Title */}
          <div className="flex-1 flex justify-start ml-2">
            <span className="text-xs text-[#858585] font-sf">
              AURA - Automate Your Aura
            </span>
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
          
          {/* Main work area with fixed sidebar and resizable terminal */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Fixed width */}
            <DashSidebar activePanel={activePanel} />

            {/* Editor and Terminal - Resizable vertical split */}
            <ResizablePanelGroup direction="vertical" className="flex-1">
              {/* Editor Panel */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <Navigator />
              </ResizablePanel>
              
              {/* <ResizableHandle withHandle /> */}
              
              {/* Terminal Panel */}
              <Terminal />
            </ResizablePanelGroup>
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
            <span>Anthropic Claude 3.5 Sonnet</span>
            <span className="text-[#858585]">
              MCP Server: 0
            </span>
          </div>
        </footer>
      </div>
    </AuthWrapper>
  );
}