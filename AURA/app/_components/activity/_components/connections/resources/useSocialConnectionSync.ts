// SOCIAL CONNECTION SYNC HOOK - Placeholder for social connections sync
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/connections/resources/useSocialConnectionSync.ts

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'reddit' | 'tiktok';

interface SocialConnection {
  _id: Id<"socialConnections">;
  platform: SocialPlatform;
  username: string;
  isConnected: boolean;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  // Additional properties from Convex schema
  isActive?: boolean;
  userId?: string | Id<"users">;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  userAgent?: string;
  apiKey?: string;
  apiSecret?: string;
  apiTier?: 'free' | 'basic' | 'pro';
}

interface CreateConnectionParams {
  platform: SocialPlatform;
  username: string;
  clientId?: string;
  clientSecret?: string;
  userAgent?: string;
  apiKey?: string;
  apiSecret?: string;
  apiTier?: 'free' | 'basic' | 'pro';
}

interface DeleteConnectionParams {
  connectionId: Id<"socialConnections">;
}

interface SocialCredentials {
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

interface UseSocialConnectionSyncReturn {
  connections: SocialConnection[];
  isLoading: boolean;
  error: string | null;
  connectPlatform: (platform: SocialPlatform, credentials: SocialCredentials) => Promise<void>;
  disconnectPlatform: (platform: SocialPlatform) => Promise<void>;
  syncConnections: () => Promise<void>;
  getConnectionStatus: (platform: SocialPlatform) => 'connected' | 'disconnected' | 'error' | 'authenticated';
  createConnection: (params: CreateConnectionParams) => Promise<void>;
  deleteConnection: (params: DeleteConnectionParams) => Promise<void>;
}

export function useSocialConnectionSync(): UseSocialConnectionSyncReturn {
  // Use Convex for persistent data (business state)
  const rawConnections = useQuery(api.socialConnections.getSocialConnections, {});
  const createConnectionMutation = useMutation(api.socialConnections.createSocialConnection);
  const deleteConnectionMutation = useMutation(api.socialConnections.deleteSocialConnection);
  
  // UI-only state for error handling
  const [error, setError] = useState<string | null>(null);
  
  // Loading state based on Convex query loading
  const isLoading = rawConnections === undefined;

  // Map Convex data to expected interface
  const connections: SocialConnection[] = rawConnections?.map(conn => ({
    _id: conn._id,
    platform: conn.platform as SocialPlatform,
    username: conn.username,
    isConnected: conn.isActive || false,
    status: conn.isActive ? 'active' : 'inactive' as 'active' | 'inactive' | 'error',
    lastSync: conn.lastSync ? new Date(conn.lastSync).toISOString() : undefined,
    isActive: conn.isActive,
    userId: conn.userId,
    clientId: conn.clientId,
    clientSecret: conn.clientSecret,
    accessToken: conn.accessToken,
    refreshToken: conn.refreshToken,
    userAgent: conn.userAgent,
    apiKey: conn.apiKey,
    apiSecret: conn.apiSecret,
    apiTier: conn.apiTier
  })) || [];

  const connectPlatform = async (platform: SocialPlatform, credentials: SocialCredentials) => {
    try {
      setError(null);
      // Placeholder implementation
      console.log('Connect platform not implemented yet', platform, credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect platform');
    }
  };

  const disconnectPlatform = async (platform: SocialPlatform) => {
    try {
      setError(null);
      // Placeholder implementation
      console.log('Disconnect platform not implemented yet', platform);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect platform');
    }
  };

  const syncConnections = async () => {
    try {
      setError(null);
      // Placeholder implementation
      console.log('Sync connections not implemented yet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync connections');
    }
  };

  const getConnectionStatus = (platform: SocialPlatform): 'connected' | 'disconnected' | 'error' | 'authenticated' => {
    const connection = connections.find(c => c.platform === platform);
    if (!connection) return 'disconnected';
    if (connection.isActive) return 'authenticated';
    return 'connected';
  };

  const createConnection = async (params: CreateConnectionParams): Promise<void> => {
    try {
      setError(null);
      // Convex expects userId, so we'll use a placeholder for now
      await createConnectionMutation({
        userId: "placeholder-user-id", // TODO: Get from auth context
        ...params
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection');
      console.error(`Failed to create connection for ${params.platform}:`, err);
    }
  };

  const deleteConnection = async (params: DeleteConnectionParams): Promise<void> => {
    try {
      setError(null);
      await deleteConnectionMutation({ connectionId: params.connectionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete connection');
      console.error(`Failed to delete connection with ID: ${params.connectionId}`, err);
    }
  };

  return {
    connections,
    isLoading,
    error,
    connectPlatform,
    disconnectPlatform,
    syncConnections,
    getConnectionStatus,
    createConnection,
    deleteConnection,
  };
}
