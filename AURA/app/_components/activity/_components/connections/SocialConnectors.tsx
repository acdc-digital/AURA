// Social Connectors - Full-page social connection interface (optional tab)
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/connections/SocialConnectors.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useSocialConnectionSync, SocialPlatform } from "./useSocialConnectionSync";
import {
  Facebook,
  Instagram,
  Twitter,
  MessageSquare,
  Linkedin,
  Music,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

// Platform configuration
const platforms: SocialPlatform[] = ['reddit', 'twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'];

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

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  reddit: '#FF4500',
  linkedin: '#0A66C2',
  tiktok: '#000000',
};

const platformGuideLinks = {
  reddit: 'https://github.com/reddit-archive/reddit/wiki/API',
  twitter: 'https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api',
  facebook: 'https://developers.facebook.com/docs/development',
  instagram: 'https://developers.facebook.com/docs/instagram-api',
  linkedin: 'https://docs.microsoft.com/en-us/linkedin/shared/authentication/',
  tiktok: 'https://developers.tiktok.com/doc/login-kit-web',
};

export function SocialConnectors() {
  const { userId: authUserId } = useAuth();
  
  // Use the custom hook for social connections
  const { 
    connections, 
    isLoading, 
    getConnectionStatus, 
    createConnection,
    deleteConnection 
  } = useSocialConnectionSync();

  // UI-only state
  const [isCurrentlyConnecting, setIsCurrentlyConnecting] = useState<SocialPlatform | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form refs for temporary input values - not stored in state
  const formRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  // Handle OAuth success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setError(null);
      console.log('✅ OAuth authentication successful!');
    }
  }, []);

  // Get form values from refs
  const getFormValue = (platform: SocialPlatform, field: string) => {
    return formRefs.current[`${platform}-${field}`]?.value || '';
  };

  // Clear form values
  const clearFormValues = (platform: SocialPlatform) => {
    Object.keys(formRefs.current).forEach(key => {
      if (key.startsWith(`${platform}-`) && formRefs.current[key]) {
        formRefs.current[key]!.value = '';
      }
    });
  };

  // Connection handlers
  const handleConnect = async (platform: SocialPlatform) => {
    if (!authUserId) return;
    
    setIsCurrentlyConnecting(platform);
    setError(null);

    try {
      const username = getFormValue(platform, 'username');
      
      if (platform === 'reddit') {
        await createConnection({
          userId: authUserId,
          platform: 'reddit',
          username,
          clientId: getFormValue(platform, 'clientId'),
          clientSecret: getFormValue(platform, 'clientSecret'),
          userAgent: getFormValue(platform, 'userAgent') || `AURA:${username}:v1.0`,
        });
      } else if (platform === 'twitter') {
        await createConnection({
          userId: authUserId,
          platform: 'twitter',
          username,
          apiKey: getFormValue(platform, 'clientId'),
          apiSecret: getFormValue(platform, 'clientSecret'),
          apiTier: (getFormValue(platform, 'apiTier') || 'free') as 'free' | 'basic' | 'pro',
        });
      } else {
        // Generic platform connection
        await createConnection({
          userId: authUserId,
          platform,
          username,
          clientId: getFormValue(platform, 'clientId') || getFormValue(platform, 'clientKey'),
          clientSecret: getFormValue(platform, 'clientSecret'),
        });
      }

      // Clear form data after successful connection
      clearFormValues(platform);
      
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create connection');
    } finally {
      setIsCurrentlyConnecting(null);
    }
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    const connection = connections?.find(c => c.platform === platform);
    if (!connection) return;

    try {
      await deleteConnection({ connectionId: connection._id });
    } catch (err) {
      console.error('Disconnect error:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  // OAuth handlers
  const handleStartRedditOAuth = async (connectionId: string) => {
    window.location.href = `/api/reddit/auth/start?connectionId=${connectionId}`;
  };

  const handleStartXOAuth = async (connectionId: string) => {
    window.location.href = `/api/x/auth/start?connectionId=${connectionId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#007acc]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#cccccc] mb-2">Social Media Connectors</h1>
        <p className="text-[#858585]">
          Connect your social media accounts to enable automated posting and content management.
        </p>
      </div>

      {/* Getting Started Section */}
      <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-400 mb-2">Getting Started</h2>
        <p className="text-[#858585]">
          To connect your social media accounts, you&apos;ll need to create API applications on each platform:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-orange-400">●</span>
              <span className="text-[#cccccc]">Reddit:</span>
              <a href={platformGuideLinks.reddit} target="_blank" rel="noopener noreferrer" 
                className="text-blue-400 hover:underline flex items-center gap-1">
                API Guide <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">●</span>
              <span className="text-[#cccccc]">Twitter/X:</span>
              <a href={platformGuideLinks.twitter} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1">
                Developer Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">●</span>
              <span className="text-[#858585]">Facebook: Coming Soon</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">●</span>
              <span className="text-[#858585]">Instagram: Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const Icon = platformIcons[platform];
          const connectionStatus = getConnectionStatus(platform);
          const connection = connections?.find(c => c.platform === platform);
          const isConnecting = isCurrentlyConnecting === platform;
          const isImplemented = platform === 'reddit' || platform === 'twitter';

          return (
            <div key={platform} className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-6">
              {/* Platform Header */}
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-20"
                  style={{ backgroundColor: platformColors[platform] + '20' }}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={{ color: platformColors[platform] }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#cccccc]">{platformNames[platform]}</h3>
                  <div className="flex items-center gap-2">
                    {connectionStatus === 'authenticated' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Connected & Authorized</span>
                      </>
                    ) : connectionStatus === 'connected' ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 text-sm">Authorization Required</span>
                      </>
                    ) : (
                      <span className="text-[#858585] text-sm">Not connected</span>
                    )}
                  </div>
                </div>
              </div>

              {connectionStatus === 'disconnected' ? (
                // Connection Form
                <div className="space-y-4">
                  {!isImplemented ? (
                    <div className="text-center py-4">
                      <p className="text-[#858585] text-sm">Coming Soon</p>
                      <p className="text-[#858585] text-xs mt-1">
                        {platformNames[platform]} integration is in development
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <input
                          ref={(el) => { formRefs.current[`${platform}-username`] = el; }}
                          placeholder={`${platformNames[platform]} Username`}
                          className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-sm h-10 rounded px-3"
                        />
                        
                        {platform === 'reddit' && (
                          <>
                            <input
                              ref={(el) => { formRefs.current[`${platform}-clientId`] = el; }}
                              placeholder="Client ID"
                              className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-sm h-10 rounded px-3"
                            />
                            <input
                              ref={(el) => { formRefs.current[`${platform}-clientSecret`] = el; }}
                              placeholder="Client Secret"
                              className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-sm h-10 rounded px-3"
                              type="password"
                            />
                            <input
                              ref={(el) => { formRefs.current[`${platform}-userAgent`] = el; }}
                              placeholder="User Agent (optional)"
                              className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-sm h-10 rounded px-3"
                            />
                          </>
                        )}
                        
                        {platform === 'twitter' && (
                          <>
                            <input
                              ref={(el) => { formRefs.current[`${platform}-clientId`] = el; }}
                              placeholder="API Key (Client ID)"
                              className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-sm h-10 rounded px-3"
                            />
                            <input
                              ref={(el) => { formRefs.current[`${platform}-clientSecret`] = el; }}
                              placeholder="API Secret (Client Secret)"
                              className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-sm h-10 rounded px-3"
                              type="password"
                            />
                            <select
                              ref={(el) => { formRefs.current[`${platform}-apiTier`] = el; }}
                              title="API Tier"
                              defaultValue="free"
                              className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-sm h-10 rounded px-3"
                            >
                              <option value="free">Free Tier</option>
                              <option value="basic">Basic Tier ($100/month)</option>
                              <option value="pro">Pro Tier ($5000/month)</option>
                            </select>
                          </>
                        )}
                      </div>

                      <Button
                        onClick={() => handleConnect(platform)}
                        disabled={isConnecting}
                        className="w-full bg-[#007acc] hover:bg-[#005a9e] text-white"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Connecting...
                          </>
                        ) : (
                          `Connect ${platformNames[platform]}`
                        )}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                // Connected State
                <div className="space-y-4">
                  {/* Connection info */}
                  <div className="text-sm text-[#858585] space-y-2">
                    <div className="flex justify-between">
                      <span>Username:</span>
                      <span className="text-[#cccccc] font-mono">{connection?.username}</span>
                    </div>
                    {connection?.updatedAt && (
                      <div className="flex justify-between">
                        <span>Connected:</span>
                        <span className="text-[#cccccc]">
                          {new Date(connection.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {platform === 'twitter' && connection?.apiTier && (
                      <div className="flex justify-between">
                        <span>API Tier:</span>
                        <span className="text-[#cccccc] capitalize">{connection.apiTier}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    {/* OAuth button if needed */}
                    {connectionStatus === 'connected' && (
                      <>
                        {platform === 'reddit' && (
                          <Button
                            onClick={() => handleStartRedditOAuth(connection!._id)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Authorize Reddit Access
                          </Button>
                        )}
                        {platform === 'twitter' && (
                          <Button
                            onClick={() => handleStartXOAuth(connection!._id)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Authorize X (Twitter) Access
                          </Button>
                        )}
                      </>
                    )}

                    {/* Disconnect button */}
                    <Button
                      onClick={() => handleDisconnect(platform)}
                      variant="destructive"
                      className="w-full"
                    >
                      Disconnect {platformNames[platform]}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
