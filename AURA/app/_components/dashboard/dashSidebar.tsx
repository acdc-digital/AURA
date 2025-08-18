// Sidebar Component - Context-sensitive side panel for AURA dashboard
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/dashSidebar.tsx

"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { PanelType } from "@/lib/store";

interface DashSidebarProps {
  activePanel: PanelType;
}

export function DashSidebar({ activePanel }: DashSidebarProps) {
  const { isSignedIn, user } = useUser();

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'explorer':
        return (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">EXPLORER</h3>
            {isSignedIn ? (
              <div className="text-[#858585] text-sm">
                <div className="mb-2">📁 Welcome Project</div>
                <div className="ml-4 text-xs">
                  <div>📄 README.md</div>
                  <div>📄 index.js</div>
                </div>
              </div>
            ) : (
              <div className="text-[#858585] text-sm">
                <p className="mb-4">Sign in to access your projects and files.</p>
                <SignInButton mode="modal">
                  <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}
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
        return (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">RUN & DEBUG</h3>
            <div className="text-[#858585] text-sm">
              {isSignedIn ? (
                <p>No configurations available.</p>
              ) : (
                <p>Sign in to access debugging tools.</p>
              )}
            </div>
          </div>
        );
      
      case 'extensions':
        return (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">AI EXTENSIONS</h3>
            <div className="text-[#858585] text-sm space-y-2">
              <div className="p-2 bg-[#2d2d2d] rounded">
                <div className="text-[#cccccc] text-xs font-medium">Code Assistant</div>
                <div className="text-xs">AI-powered coding help</div>
              </div>
              <div className="p-2 bg-[#2d2d2d] rounded">
                <div className="text-[#cccccc] text-xs font-medium">Smart Debug</div>
                <div className="text-xs">Intelligent error detection</div>
              </div>
            </div>
          </div>
        );
      
      case 'account':
        return (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">ACCOUNT</h3>
            {isSignedIn ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-[#2d2d2d] rounded">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      },
                      variables: {
                        colorPrimary: "#007acc",
                      }
                    }}
                  />
                  <div>
                    <div className="text-[#cccccc] text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-[#858585] text-xs">
                      {user?.emailAddresses[0]?.emailAddress}
                    </div>
                    <div className="text-[#007acc] text-xs mt-1">
                      Authenticated
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <div className="text-[#cccccc] text-xs font-medium mb-2">Quick Actions</div>
                  <button className="w-full text-left px-3 py-2 text-xs bg-[#2d2d2d] text-[#cccccc] rounded hover:bg-[#3e3e3e] transition-colors">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-xs bg-[#2d2d2d] text-[#cccccc] rounded hover:bg-[#3e3e3e] transition-colors">
                    Preferences
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[#858585] text-sm">
                <p className="mb-4">Sign in to access your AURA account and manage your profile.</p>
                <SignInButton mode="modal">
                  <button className="w-full bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-2 rounded text-xs transition-colors">
                    Sign In to AURA
                  </button>
                </SignInButton>
                <p className="text-xs mt-3 text-[#6a6a6a]">
                  New to AURA? Signing in will create your account automatically.
                </p>
              </div>
            )}
          </div>
        );
      
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
    <div className="w-60 min-w-60 max-w-60 bg-[#252526] border-r border-[#454545] flex flex-col">
      {renderPanelContent()}
    </div>
  );
}
