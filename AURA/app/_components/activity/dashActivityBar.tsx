// Activity Bar Component - Left navigation sidebar for AURA platform
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/dashActivityBar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import { PanelType } from "@/lib/store";
import { useEditorStore } from "@/lib/store";
import { LucideIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
    Bot,
    Bug,
    Calendar,
    Contact,
    FileText,
    Puzzle,
    Settings,
    Trash2,
    User
} from "lucide-react";

interface ActivityBarProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

export function DashActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const { openSpecialTab } = useEditorStore();

  const activityItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [
    { id: "explorer", icon: FileText, label: "Explorer" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "social-connectors", icon: Contact, label: "Social Media Connectors" },
    { id: "agents", icon: Bot, label: "Agents" },
    { id: "extensions", icon: Puzzle, label: "Extensions" },
    { id: "trash", icon: Trash2, label: "Trash" },
    { id: "debug", icon: Bug, label: "Debug Tools" },
    { id: "account", icon: User, label: "User Account" },
  ];

  const bottomItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleActivityClick = (id: PanelType) => {
    // Handle explorer special case - open both sidebar and tab
    if (id === 'explorer') {
      openSpecialTab('file-explorer', 'File Explorer', 'file');
    }
    
    // Handle calendar special case - open both sidebar and tab
    if (id === 'calendar') {
      openSpecialTab('calendar', 'Calendar', 'calendar');
    }

    // Handle agents special case - open both sidebar and tab
    if (id === 'agents') {
      openSpecialTab('agents', 'AI Agents', 'agent');
    }

    // Handle extensions special case - open both sidebar and tab
    if (id === 'extensions') {
      openSpecialTab('extensions', 'Extensions', 'extension');
    }
    
    // Handle social-connectors - sidebar only, no tab
    if (id === 'social-connectors') {
      onPanelChange('social-connectors');
      return;
    }
    
    // Always set the active panel for sidebar
    onPanelChange(id);
  };

  const getUserInitial = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Activity Icons */}
      <div className="flex flex-col items-center py-2 space-y-1">
        {activityItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          // Special handling for account icon
          if (item.id === 'account') {
            return (
              <button
                key={item.id}
                className={`w-9 h-9 rounded-none hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]'
                    : 'border-l-2 border-transparent'
                }`}
                onClick={() => handleActivityClick(item.id)}
                title={item.label}
              >
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'border-[#cccccc] text-[#cccccc]'
                      : 'border-[#858585] text-[#858585]'
                  }`}
                >
                  {getUserInitial()}
                </div>
              </button>
            );
          }
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => handleActivityClick(item.id)}
              disabled={!isAuthenticated}
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

      {/* Bottom Section */}
      <div className="mt-auto mb-2 flex flex-col items-center space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => handleActivityClick(item.id)}
              disabled={!isAuthenticated}
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
    </aside>
  );
}
