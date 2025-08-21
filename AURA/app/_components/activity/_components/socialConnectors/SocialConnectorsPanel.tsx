// SOCIAL CONNECTORS PANEL - Sidebar panel for social media connections
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/socialConnectors/SocialConnectorsPanel.tsx

"use client";

import { Separator } from "@/components/ui/separator";
import { useConvexAuth } from "convex/react";
import { useEditorStore } from "@/lib/store";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Contact,
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare,
  Music,
  Settings,
  Twitter,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface SocialConnection {
  _id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'reddit' | 'linkedin' | 'tiktok';
  username: string;
  userId: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  isActive: boolean;
}

interface SocialConnectorsProps {
  className?: string;
}

export default function SocialConnectorsPanel({ className = "" }: SocialConnectorsProps) {
  const { isAuthenticated } = useConvexAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const { openSpecialTab } = useEditorStore();

  // Mock data for now - replace with actual Convex queries later
  const connections: SocialConnection[] = [];
  const isLoading = false;

  const platforms = [
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-blue-400', connected: false },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-400', connected: false },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500', connected: false },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', connected: false },
    { id: 'reddit', name: 'Reddit', icon: MessageSquare, color: 'text-orange-500', connected: false },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-purple-400', connected: false },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleOpenConnector = (platform: string) => {
    // Open the social connector tab for configuration
    openSpecialTab(`social-connector-${platform}`, `${platform.charAt(0).toUpperCase() + platform.slice(1)} Setup`, 'social-connector');
  };

  const getConnectionStatus = (platformId: string) => {
    const connection = connections.find(c => c.platform === platformId);
    if (!connection) return { status: 'disconnected', message: 'Not connected' };
    if (connection.accessToken) return { status: 'connected', message: 'Connected & authorized' };
    return { status: 'partial', message: 'Connected, needs authorization' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'partial':
        return <AlertCircle className="w-3 h-3 text-orange-400" />;
      default:
        return <XCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>Social Connectors</span>
          </div>
          <div className="mt-4 p-4 text-center">
            <Contact className="w-8 h-8 text-[#858585] mx-auto mb-2" />
            <p className="text-sm text-[#858585] mb-1">Authentication Required</p>
            <p className="text-xs text-[#858585]">
              Sign in to manage your social media connections
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-[#181818] text-[#cccccc] flex flex-col ${className}`}>
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Social Connectors</span>
        </div>

        {/* Social Connectors Sections */}
        <div className="space-y-1 mt-2">

          {/* Overview Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('overview') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Contact className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Overview</span>
              <div className="flex items-center gap-1">
                {isLoading && <Settings className="w-3 h-3 text-yellow-400 animate-spin" />}
                {!isLoading && <CheckCircle className="w-3 h-3 text-green-400" />}
              </div>
            </button>
            
            {expandedSections.has('overview') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                {/* Connection Statistics */}
                <div className="text-[10px] text-[#858585] space-y-1">
                  <div className="flex justify-between">
                    <span>Total Platforms:</span>
                    <span className="text-[#cccccc]">{platforms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected:</span>
                    <span className="text-[#cccccc]">
                      {connections.filter(c => c.accessToken).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Configured:</span>
                    <span className="text-[#cccccc]">
                      {connections.filter(c => c.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-[#cccccc]">
                      {connections.filter(c => !c.accessToken && c.isActive).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Platform Connections */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('platforms')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('platforms') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Settings className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Platforms</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#cccccc]">{platforms.length}</span>
              </div>
            </button>
            
            {expandedSections.has('platforms') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                <div className="space-y-1">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const status = getConnectionStatus(platform.id);
                    
                    return (
                      <div key={platform.id} className="flex items-center justify-between px-1 py-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Icon className={`w-3 h-3 ${platform.color}`} />
                          <span className="text-xs text-[#cccccc] truncate">
                            {platform.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <button
                            onClick={() => handleOpenConnector(platform.id)}
                            className="text-xs text-[#858585] hover:text-[#cccccc] underline-offset-2 hover:underline"
                          >
                            Setup
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Connected Accounts */}
          {connections.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('connected')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('connected') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium flex-1 text-left">Connected</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">
                    {connections.filter(c => c.accessToken).length}
                  </span>
                </div>
              </button>
              
              {expandedSections.has('connected') && (
                <div className="px-2 pb-2 space-y-2">
                  <Separator className="bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {connections
                      .filter(c => c.accessToken)
                      .slice(0, 5)
                      .map((connection) => {
                        const platform = platforms.find(p => p.id === connection.platform);
                        const Icon = platform?.icon || Contact;
                        
                        return (
                          <div key={connection._id} className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Icon className={`w-3 h-3 ${platform?.color || 'text-[#858585]'}`} />
                              <span className="text-xs text-[#cccccc] truncate">
                                @{connection.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <button
                                onClick={() => handleOpenConnector(connection.platform)}
                                className="text-xs text-[#858585] hover:text-[#cccccc] underline-offset-2 hover:underline"
                              >
                                Manage
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    
                    {connections.filter(c => c.accessToken).length > 5 && (
                      <div className="text-xs text-[#858585] text-center pt-1">
                        +{connections.filter(c => c.accessToken).length - 5} more accounts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('actions')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('actions') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Settings className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Quick Actions</span>
            </button>
            
            {expandedSections.has('actions') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                <div className="space-y-1">
                  <button
                    onClick={() => openSpecialTab('social-connectors-overview', 'Social Connectors', 'social-connector')}
                    className="w-full flex items-center gap-2 px-1 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]/30 rounded transition-colors"
                  >
                    <Contact className="w-3 h-3" />
                    <span>Open Full Manager</span>
                  </button>
                  <button
                    onClick={() => handleOpenConnector('twitter')}
                    className="w-full flex items-center gap-2 px-1 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]/30 rounded transition-colors"
                  >
                    <Twitter className="w-3 h-3" />
                    <span>Connect X (Twitter)</span>
                  </button>
                  <button
                    onClick={() => handleOpenConnector('instagram')}
                    className="w-full flex items-center gap-2 px-1 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]/30 rounded transition-colors"
                  >
                    <Instagram className="w-3 h-3" />
                    <span>Connect Instagram</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {connections.length === 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d] p-4">
              <div className="text-center">
                <Contact className="w-8 h-8 text-[#858585] mx-auto mb-2" />
                <p className="text-sm text-[#858585] mb-1">No connections yet</p>
                <p className="text-xs text-[#858585] mb-3">
                  Connect your social media accounts to get started
                </p>
                <button
                  onClick={() => openSpecialTab('social-connectors-overview', 'Social Connectors', 'social-connector')}
                  className="text-xs text-[#007acc] hover:text-[#4a9eff] underline-offset-2 hover:underline"
                >
                  Open Social Connectors
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
