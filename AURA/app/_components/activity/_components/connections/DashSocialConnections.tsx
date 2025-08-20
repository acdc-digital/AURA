// SOCIAL CONNECTIONS SIDEBAR - Sidebar social media connection manager (240px)
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/connections/DashSocialConnections.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConvexAuth } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageSquare, 
  Linkedin, 
  Music, 
  Contact,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useSocialConnectionSync, type SocialPlatform } from "./useSocialConnectionSync";

// Platform configurations
const platforms: SocialPlatform[] = ['facebook', 'instagram', 'twitter', 'reddit', 'linkedin', 'tiktok'];

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram, 
  twitter: Twitter,
  reddit: MessageSquare,
  linkedin: Linkedin,
  tiktok: Music,
};

const platformNames = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  reddit: 'Reddit',
  linkedin: 'LinkedIn', 
  tiktok: 'TikTok',
};

export function DashSocialConnections() {
  const { isAuthenticated } = useConvexAuth();
  const { userId: authUserId } = useAuth();
  
  // Use the custom hook for social connections
  const { 
    connections, 
    isLoading, 
    getConnectionStatus, 
    createConnection,
    deleteConnection
  } = useSocialConnectionSync();

  // UI-only state for expansion and form handling - NOT business data
  const [expandedSections, setExpandedSections] = useState<Record<SocialPlatform, boolean>>({
    facebook: false,
    instagram: false,
    twitter: false,
    reddit: false,
    linkedin: false,
    tiktok: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

  // Form refs for temporary input values - not stored in state
  const formRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  // Toggle section expansion
  const toggleSection = (platform: SocialPlatform) => {
    setExpandedSections(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // Get form values from refs
  const getFormValues = (platform: SocialPlatform) => {
    const username = formRefs.current[`${platform}-username`]?.value || '';
    const clientId = formRefs.current[`${platform}-clientId`]?.value || '';
    const clientSecret = formRefs.current[`${platform}-clientSecret`]?.value || '';
    const userAgent = formRefs.current[`${platform}-userAgent`]?.value || '';
    const apiTier = formRefs.current[`${platform}-apiTier`]?.value || 'free';

    return {
      username,
      clientId: platform === 'tiktok' ? clientId : clientId,
      clientKey: platform === 'tiktok' ? clientId : undefined,
      clientSecret,
      userAgent: platform === 'reddit' ? userAgent : undefined,
      apiTier: platform === 'twitter' ? apiTier as 'free' | 'basic' | 'pro' : undefined,
    };
  };

  // Clear form values
  const clearFormValues = (platform: SocialPlatform) => {
    if (formRefs.current[`${platform}-username`]) formRefs.current[`${platform}-username`]!.value = '';
    if (formRefs.current[`${platform}-clientId`]) formRefs.current[`${platform}-clientId`]!.value = '';
    if (formRefs.current[`${platform}-clientSecret`]) formRefs.current[`${platform}-clientSecret`]!.value = '';
    if (formRefs.current[`${platform}-userAgent`]) formRefs.current[`${platform}-userAgent`]!.value = '';
    if (formRefs.current[`${platform}-apiTier`]) formRefs.current[`${platform}-apiTier`]!.value = 'free';
  };

  // Handle connection creation
  const handleConnect = async (platform: SocialPlatform) => {
    if (!authUserId) return;
    
    setConnectingPlatform(platform);
    setError(null);
    
    try {
      const formData = getFormValues(platform);
      
      await createConnection({
        userId: authUserId,
        platform,
        username: formData.username,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        userAgent: formData.userAgent,
        apiKey: platform === 'twitter' ? formData.clientId : undefined,
        apiSecret: platform === 'twitter' ? formData.clientSecret : undefined,
        apiTier: formData.apiTier,
      });
      
      // Clear form after successful connection
      clearFormValues(platform);
      
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      setError(`Failed to connect ${platform}. Please try again.`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  // Handle disconnection
  const handleDisconnect = async (platform: SocialPlatform) => {
    const connection = connections.find(c => c.platform === platform);
    if (!connection) return;

    try {
      await deleteConnection({ connectionId: connection._id });
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
      setError(`Failed to disconnect ${platform}. Please try again.`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <div className="w-12 h-12 bg-[#007acc]/10 rounded-full flex items-center justify-center mb-3 mx-auto">
          <Contact className="w-6 h-6 text-[#007acc]" />
        </div>
        <h3 className="text-[#cccccc] font-medium text-sm mb-2">Sign in required</h3>
        <p className="text-[#858585] text-xs leading-relaxed">
          Sign in to manage your social media connections.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border border-[#007acc] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[#858585] text-xs">Loading connections...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#454545]">
        <h3 className="text-[#cccccc] font-medium text-sm mb-2">SOCIAL CONNECTORS</h3>
        <p className="text-[#858585] text-xs leading-relaxed">
          Connect your social media accounts for content publishing.
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform];
            const connectionStatus = getConnectionStatus(platform);
            const isConnected = connectionStatus !== 'disconnected';
            const isExpanded = expandedSections[platform];
            const isCurrentlyConnecting = connectingPlatform === platform;

            return (
              <div key={platform} className="mb-2">
                <button
                  onClick={() => toggleSection(platform)}
                  className="w-full flex items-center justify-between p-2 hover:bg-[#2d2d2d] rounded text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-[#858585]" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-[#858585]" />
                      )}
                      <Icon className="w-4 h-4 text-[#4a9eff]" />
                    </div>
                    <span className="text-[#cccccc] text-xs font-medium">
                      {platformNames[platform]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isCurrentlyConnecting ? (
                      <div className="w-3 h-3 border border-[#007acc] border-t-transparent rounded-full animate-spin" />
                    ) : connectionStatus === 'authenticated' ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : connectionStatus === 'connected' ? (
                      <AlertCircle className="w-3 h-3 text-orange-400" />
                    ) : (
                      <div className="w-3 h-3 border border-[#858585] rounded-full" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-6 pl-2 border-l border-[#454545]">
                    {!isConnected ? (
                      <div className="py-2 space-y-2">
                        <div className="space-y-1">
                          <Input
                            ref={(el) => { formRefs.current[`${platform}-username`] = el; }}
                            placeholder="Username"
                            className="h-7 text-xs bg-[#3c3c3c] border-[#454545] text-[#cccccc]"
                          />
                          <Input
                            ref={(el) => { formRefs.current[`${platform}-clientId`] = el; }}
                            placeholder={platform === 'tiktok' ? "Client Key" : "Client ID"}
                            className="h-7 text-xs bg-[#3c3c3c] border-[#454545] text-[#cccccc]"
                          />
                          <Input
                            ref={(el) => { formRefs.current[`${platform}-clientSecret`] = el; }}
                            placeholder="Client Secret"
                            type="password"
                            className="h-7 text-xs bg-[#3c3c3c] border-[#454545] text-[#cccccc]"
                          />
                          {platform === 'reddit' && (
                            <Input
                              ref={(el) => { formRefs.current[`${platform}-userAgent`] = el; }}
                              placeholder="User Agent (optional)"
                              className="h-7 text-xs bg-[#3c3c3c] border-[#454545] text-[#cccccc]"
                            />
                          )}
                          {platform === 'twitter' && (
                            <select
                              ref={(el) => { formRefs.current[`${platform}-apiTier`] = el; }}
                              defaultValue="free"
                              title="Select API Tier"
                              className="w-full h-7 text-xs bg-[#3c3c3c] border border-[#454545] text-[#cccccc] rounded px-2"
                            >
                              <option value="free">Free Tier</option>
                              <option value="basic">Basic Tier</option>
                              <option value="pro">Pro Tier</option>
                            </select>
                          )}
                        </div>
                        <Button
                          onClick={() => handleConnect(platform)}
                          disabled={isCurrentlyConnecting}
                          className="w-full h-6 text-xs bg-[#007acc] hover:bg-[#005a9e]"
                        >
                          {isCurrentlyConnecting ? 'Connecting...' : 'Connect'}
                        </Button>
                      </div>
                    ) : (
                      <div className="py-2 space-y-2">
                        <div className="text-[10px] text-[#858585] space-y-1">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={connectionStatus === 'authenticated' ? "text-green-400" : "text-orange-400"}>
                              {connectionStatus === 'authenticated' ? "✅ Connected & Authorized" : "🟡 Connected (Auth Required)"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {connectionStatus === 'connected' && (
                            <Button
                              onClick={() => {/* Handle OAuth */}}
                              className="flex-1 h-6 text-xs bg-orange-500 hover:bg-orange-600"
                            >
                              Authorize
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDisconnect(platform)}
                            variant="outline"
                            className="flex-1 h-6 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
