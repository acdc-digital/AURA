// Sidebar Component - Context-sensitive side panel for AURA dashboard
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/sidebar/dashSidebar.tsx

"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { PanelType } from "@/lib/store";
import { UserConsole, AgentsPanel, DashTrash } from "@/app/_components/activity/_components";
import { ExtensionsPanel } from "@/app/_components/activity/_components/extensions";
import { FileExplorerPanel } from "@/app/_components/activity/_components/fileExplorer";
import CalendarPanel from "@/app/_components/activity/_components/calendar/CalendarPanel";
import SocialConnectorsPanel from "@/app/_components/activity/_components/socialConnectors/SocialConnectorsPanel";
import { DashDebug } from "@/app/_components/activity/_components/debug/DashDebug";

interface DashSidebarProps {
  activePanel: PanelType;
}

export function DashSidebar({ activePanel }: DashSidebarProps) {
  const { isSignedIn } = useUser();

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'explorer':
        return isSignedIn ? (
          <FileExplorerPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">EXPLORER</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access your projects and files.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'calendar':
        return isSignedIn ? (
          <CalendarPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">CALENDAR</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to manage your social media posts.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'social-connectors':
        return isSignedIn ? (
          <SocialConnectorsPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">SOCIAL CONNECTORS</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to manage your social media connections.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'agents':
        return isSignedIn ? (
          <AgentsPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">AGENTS</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access AI agents and automation tools.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'search-replace':
        return (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">SEARCH</h3>
            {isSignedIn ? (
              <div>
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full bg-[#3c3c3c] text-[#cccccc] text-sm px-3 py-2 rounded border-none outline-none"
                />
              </div>
            ) : (
              <div className="text-[#858585] text-sm">
                <p>Sign in to search your projects.</p>
              </div>
            )}
          </div>
        );
      
      case 'source-control':
        return (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">SOURCE CONTROL</h3>
            <div className="text-[#858585] text-sm">
              {isSignedIn ? (
                <p>No changes detected.</p>
              ) : (
                <p>Sign in to access version control.</p>
              )}
            </div>
          </div>
        );
      
      case 'debug':
        return isSignedIn ? (
          <DashDebug />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">DEBUG CONSOLE</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access advanced debugging tools.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'extensions':
        return <ExtensionsPanel />;
      
      case 'trash':
        return isSignedIn ? (
          <DashTrash />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">TRASH</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access trash management.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'account':
        return <UserConsole />;
      
      default:
        return (
          <div className="p-4">
            <div className="text-[#858585] text-sm">
              Select an option from the activity bar.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-60 min-w-60 max-w-60 bg-[#252526] border-r border-[#2d2d2d] flex flex-col">
      {renderPanelContent()}
    </div>
  );
}
