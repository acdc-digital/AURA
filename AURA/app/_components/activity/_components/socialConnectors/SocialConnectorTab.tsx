// SOCIAL CONNECTOR TAB - Full social media connection management interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/socialConnectors/SocialConnectorTab.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConvexAuth } from "convex/react";
import {
  AlertCircle,
  Contact,
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare,
  Music,
  Twitter,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface SocialConnectorTabProps {
  className?: string;
}

type SocialFormData = {
  facebook: { username: string; apiKey: string; accessToken: string };
  instagram: { username: string; apiKey: string; accessToken: string };
  twitter: { username: string; clientId: string; clientSecret: string; apiTier: string };
  reddit: { username: string; clientId: string; clientSecret: string; userAgent: string };
  linkedin: { username: string; clientId: string; clientSecret: string; accessToken: string };
  tiktok: { username: string; clientKey: string; clientSecret: string; accessToken: string };
};

export default function SocialConnectorTab({ className = "" }: SocialConnectorTabProps) {
  const { isAuthenticated } = useConvexAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SocialFormData>({
    facebook: { username: '', apiKey: '', accessToken: '' },
    instagram: { username: '', apiKey: '', accessToken: '' },
    twitter: { username: '', clientId: '', clientSecret: '', apiTier: 'free' },
    reddit: { username: '', clientId: '', clientSecret: '', userAgent: '' },
    linkedin: { username: '', clientId: '', clientSecret: '', accessToken: '' },
    tiktok: { username: '', clientKey: '', clientSecret: '', accessToken: '' },
  });

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

  const updateFormData = (platform: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleConnect = async (platform: keyof typeof formData) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Placeholder for connection logic
      console.log(`Connecting to ${platform}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log(`${platform} connected successfully`);
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      setError(`Failed to connect to ${platformNames[platform]}`);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`h-full bg-[#252526] flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4">
          <Contact className="w-12 h-12 text-[#666] mx-auto" />
          <div className="text-[#cccccc]">Authentication Required</div>
          <p className="text-[#858585] max-w-md">
            Please sign in to manage your social media connections and configure integrations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-[#252526] text-[#cccccc] overflow-auto ${className}`}>
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Social Media Connectors</h1>
          <p className="text-[#858585]">
            Connect your social media accounts to manage posts and analytics from one dashboard.
          </p>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-400 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData).map(([platform, data]) => {
            const typedPlatform = platform as keyof typeof formData;
            const Icon = platformIcons[typedPlatform];
            
            return (
              <div key={platform} className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-[#4a9eff]" />
                  <h3 className="text-lg font-semibold">{platformNames[typedPlatform]}</h3>
                  <XCircle className="w-5 h-5 text-[#858585] ml-auto" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor={`${platform}-username`} className="block text-sm text-[#cccccc] mb-1">
                      Username
                    </label>
                    <Input
                      id={`${platform}-username`}
                      value={data.username}
                      onChange={(e) => updateFormData(typedPlatform, 'username', e.target.value)}
                      placeholder={`Your ${platformNames[typedPlatform]} username`}
                      className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                    />
                  </div>

                  {platform === 'reddit' ? (
                    <>
                      <div>
                        <label htmlFor={`${platform}-client-id`} className="block text-sm text-[#cccccc] mb-1">
                          Client ID
                        </label>
                        <Input
                          id={`${platform}-client-id`}
                          value={(data as { clientId: string }).clientId}
                          onChange={(e) => updateFormData(typedPlatform, 'clientId', e.target.value)}
                          placeholder="Reddit App Client ID"
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${platform}-client-secret`} className="block text-sm text-[#cccccc] mb-1">
                          Client Secret
                        </label>
                        <Input
                          id={`${platform}-client-secret`}
                          type="password"
                          value={(data as { clientSecret: string }).clientSecret}
                          onChange={(e) => updateFormData(typedPlatform, 'clientSecret', e.target.value)}
                          placeholder="Reddit App Client Secret"
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${platform}-user-agent`} className="block text-sm text-[#cccccc] mb-1">
                          User Agent (Optional)
                        </label>
                        <Input
                          id={`${platform}-user-agent`}
                          value={(data as { userAgent: string }).userAgent}
                          onChange={(e) => updateFormData(typedPlatform, 'userAgent', e.target.value)}
                          placeholder="AURA/1.0 by your_username"
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                    </>
                  ) : platform === 'twitter' ? (
                    <>
                      <div>
                        <label htmlFor={`${platform}-client-id`} className="block text-sm text-[#cccccc] mb-1">
                          Client ID
                        </label>
                        <Input
                          id={`${platform}-client-id`}
                          value={(data as { clientId: string }).clientId}
                          onChange={(e) => updateFormData(typedPlatform, 'clientId', e.target.value)}
                          placeholder="X (Twitter) Client ID from Developer Portal"
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${platform}-client-secret`} className="block text-sm text-[#cccccc] mb-1">
                          Client Secret
                        </label>
                        <Input
                          id={`${platform}-client-secret`}
                          type="password"
                          value={(data as { clientSecret: string }).clientSecret}
                          onChange={(e) => updateFormData(typedPlatform, 'clientSecret', e.target.value)}
                          placeholder="X (Twitter) Client Secret from Developer Portal"
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${platform}-api-tier`} className="block text-sm text-[#cccccc] mb-1">
                          API Tier
                        </label>
                        <select
                          id={`${platform}-api-tier`}
                          value={(data as { apiTier: string }).apiTier}
                          onChange={(e) => updateFormData(typedPlatform, 'apiTier', e.target.value)}
                          className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#454545] text-[#cccccc] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          aria-label="X API Tier Selection"
                        >
                          <option value="free">Free</option>
                          <option value="basic">Basic ($100/month)</option>
                          <option value="pro">Pro ($5,000/month)</option>
                        </select>
                        <p className="text-xs text-[#888] mt-1">
                          Select your X API subscription tier for rate limiting
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label htmlFor={`${platform}-api-key`} className="block text-sm text-[#cccccc] mb-1">
                          API Key
                        </label>
                        <Input
                          id={`${platform}-api-key`}
                          type="password"
                          value={(data as { apiKey: string }).apiKey}
                          onChange={(e) => updateFormData(typedPlatform, 'apiKey', e.target.value)}
                          placeholder={`${platformNames[typedPlatform]} API Key`}
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${platform}-access-token`} className="block text-sm text-[#cccccc] mb-1">
                          Access Token
                        </label>
                        <Input
                          id={`${platform}-access-token`}
                          type="password"
                          value={(data as { accessToken: string }).accessToken}
                          onChange={(e) => updateFormData(typedPlatform, 'accessToken', e.target.value)}
                          placeholder={`${platformNames[typedPlatform]} Access Token`}
                          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    onClick={() => handleConnect(typedPlatform)}
                    className="w-full bg-[#4a9eff] hover:bg-[#357abd] text-white"
                    disabled={isConnecting || !data.username}
                  >
                    {isConnecting ? 'Connecting...' : `Connect ${platformNames[typedPlatform]}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-[#2d2d2d] border border-[#454545] rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-[#cccccc]">Getting Started</h3>
          <div className="space-y-2 text-sm text-[#858585]">
            <p>• Create developer applications on each platform to get API credentials</p>
            <p>• For Facebook/Instagram: Visit Facebook Developers Console</p>
            <p>• For X (Twitter): Visit Twitter Developer Portal</p>
            <p>• For Reddit: Visit Reddit App Preferences</p>
            <p>• Keep your credentials secure and never share them publicly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
