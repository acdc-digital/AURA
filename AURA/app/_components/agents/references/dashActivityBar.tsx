// Activity Bar Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashActivityBar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor";
import { useUser } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import {
    Bot,
    Bug,
    Calendar,
    Contact,
    FileText,
    Info,
    Puzzle,
    Trash2,
    User
} from "lucide-react";

interface ActivityBarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

export function DashActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const { openSpecialTab, activeTab, openTabs } = useEditorStore();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();

  // Get the first letter of user's name (fallback to 'U')
  const getUserInitial = () => {
    if (!user) return 'U';
    
    // Try to get first letter from firstName, fullName, or email
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Show the activity indicator based on what was last clicked by the user
  const effectiveActivePanel = activePanel;

  const activityItems = [
    { id: "explorer", icon: FileText, label: "Explorer" },
    { id: "calendar", icon: Calendar, label: "Content Calendar" },
    { id: "social-connectors", icon: Contact, label: "Social Media Connectors" },
    { id: "agents", icon: Bot, label: "Agents" },
    { id: "extensions", icon: Puzzle, label: "Extensions" },
    { id: "trash", icon: Trash2, label: "Trash" },
    { id: "debug", icon: Bug, label: "Debug Tools" },
    { id: "profile", icon: User, label: "User Profile" },
  ];

  const handleActivityClick = (id: string) => {
    // Handle profile authentication
    if (id === 'profile') {
      // This will be handled by the profile button render logic
      return;
    }
    
    // For explorer, open file-explorer tab and set eac explorer panel
    if (id === 'explorer') {
      openSpecialTab('file-explorer', 'File Explorer', 'post-creator');
      onPanelChange('explorer'); // Set indicator to explorer button and open eac explorer panel
      return;
    }
    
    // For social connectors, now open panel instead of tab
    if (id === 'social-connectors') {
      onPanelChange('social-connectors');
      return;
    }
    
    // For calendar, open tab and set panel indicator
    if (id === 'calendar') {
      openSpecialTab('calendar', 'Content Calendar', 'calendar');
      onPanelChange('calendar'); // Set indicator to calendar button
      return;
    }
    
    // For other panels, change sidebar panel
    onPanelChange(id);
  };

  return (
    <aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Activity Icons */}
      <div className="flex flex-col items-center py-2 space-y-1">
        {activityItems.map((item) => {
          const Icon = item.icon;
          const isActive = effectiveActivePanel === item.id;
          
          // Special handling for profile icon
          if (item.id === 'profile') {
            return (
              <div key={item.id}>
                <Unauthenticated>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-9 h-9 rounded-none hover:bg-[#2d2d2d] relative z-[60] ${
                      effectiveActivePanel === 'profile'
                        ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]'
                        : 'border-l-2 border-transparent'
                    }`}
                    title="User Console"
                    onClick={() => {
                      onPanelChange('profile'); // Just set to profile panel - no tab opening
                    }}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium transition-colors ${
                      effectiveActivePanel === 'profile'
                        ? 'border-white text-white bg-white/20'
                        : 'border-white text-white bg-white/10 hover:bg-white/20'
                    }`}>
                      U
                    </div>
                  </Button>
                </Unauthenticated>
                <Authenticated>
                  <button
                    className={`w-9 h-9 rounded-none hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer ${
                      effectiveActivePanel === 'profile'
                        ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]'
                        : 'border-l-2 border-transparent'
                    }`}
                    onClick={() => {
                      onPanelChange('profile'); // Just set to profile panel - no tab opening
                    }}
                    title="User Console"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                        effectiveActivePanel === 'profile'
                          ? 'border-[#cccccc] text-[#cccccc]'
                          : 'border-[#858585] text-[#858585]'
                      }`}
                    >
                      {getUserInitial()}
                    </div>
                  </button>
                </Authenticated>
              </div>
            );
          }
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => handleActivityClick(item.id)}
              disabled={!isAuthenticated} // Disable when not authenticated
              className={`
                w-9 h-9 rounded-none hover:bg-[#2d2d2d] relative
                ${isActive 
                  ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]' 
                  : 'border-l-2 border-transparent'
                }
                ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={isAuthenticated ? item.label : 'Sign in to access'}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-[#cccccc]' : 'text-[#858585]'
                }`}
              />
            </Button>
          );
        })}
      </div>

      {/* Bottom Section - Help */}
      <div className="mt-auto mb-2 flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleActivityClick('help')}
          disabled={!isAuthenticated}
          className={`
            w-9 h-9 rounded-none hover:bg-[#2d2d2d] relative
            ${effectiveActivePanel === 'help'
              ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]'
              : 'border-l-2 border-transparent'
            }
            ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={isAuthenticated ? 'Help' : 'Sign in to access'}
        >
          <Info
            style={{ width: '22px', height: '22px' }}
            className={effectiveActivePanel === 'help' ? 'text-[#cccccc]' : 'text-[#858585]'}
          />
        </Button>
      </div>
    </aside>
  );
}