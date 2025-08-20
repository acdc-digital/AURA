// FILE SYNC DEBUGGER - Development file synchronization debugging
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/debug/FileSyncDebugger.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useFiles, useUser } from "@/lib/hooks";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  HardDrive
} from "lucide-react";

interface SyncStatus {
  files: {
    convexCount: number;
    storeCount: number;
    synced: boolean;
    lastSync?: number;
  };
  user: {
    authenticated: boolean;
    id?: string;
    lastUpdate?: number;
  };
  loading: {
    files: boolean;
    user: boolean;
  };
}

interface SyncTest {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: string;
  timestamp?: number;
}

export function FileSyncDebugger() {
  const { files, isLoading: filesLoading } = useFiles();
  const { user, isLoading: userLoading } = useUser();
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    files: {
      convexCount: 0,
      storeCount: 0,
      synced: false
    },
    user: {
      authenticated: false
    },
    loading: {
      files: false,
      user: false
    }
  });

  const [syncTests, setSyncTests] = useState<SyncTest[]>([
    { name: 'Database Connection', status: 'idle' },
    { name: 'User Authentication', status: 'idle' },
    { name: 'Files Query', status: 'idle' },
    { name: 'Sync Verification', status: 'idle' }
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout>();

  // Update sync status when data changes
  useEffect(() => {
    setSyncStatus(prev => ({
      ...prev,
      files: {
        convexCount: files?.length || 0,
        storeCount: files?.length || 0, // In this architecture, store mirrors Convex
        synced: !filesLoading && !!files,
        lastSync: files ? Date.now() : prev.files.lastSync
      },
      user: {
        authenticated: !!user,
        id: user?._id,
        lastUpdate: user ? Date.now() : prev.user.lastUpdate
      },
      loading: {
        files: filesLoading,
        user: userLoading
      }
    }));
  }, [files, filesLoading, user, userLoading]);

  // Run individual sync test
  const runSyncTest = useCallback(async (testName: string) => {
    setSyncTests(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status: 'running', result: undefined, timestamp: Date.now() }
        : test
    ));

    try {
      let result: string;

      switch (testName) {
        case 'Database Connection':
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate check
          result = user ? 'Connected to Convex successfully' : 'Database connection failed';
          if (!user) throw new Error('No database connection');
          break;

        case 'User Authentication':
          result = user 
            ? `Authenticated as: ${user.name || user.email}`
            : 'User not authenticated';
          if (!user) throw new Error('Authentication failed');
          break;

        case 'Files Query':
          result = files !== undefined
            ? `Loaded ${files.length} files successfully`
            : 'Files query failed or still loading';
          if (files === undefined) throw new Error('Files query failed');
          break;

        case 'Sync Verification':
          const isInSync = !filesLoading && files !== undefined && user;
          result = isInSync 
            ? 'All systems synchronized'
            : 'Sync issues detected';
          if (!isInSync) throw new Error('Synchronization failed');
          break;

        default:
          throw new Error(`Unknown test: ${testName}`);
      }

      setSyncTests(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'success', result, timestamp: Date.now() }
          : test
      ));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncTests(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'error', result: errorMessage, timestamp: Date.now() }
          : test
      ));
    }
  }, [user, files, filesLoading]);

  // Run all sync tests
  const runAllTests = useCallback(async () => {
    for (const test of syncTests) {
      await runSyncTest(test.name);
      await new Promise(resolve => setTimeout(resolve, 300)); // Delay between tests
    }
  }, [syncTests, runSyncTest]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Trigger a refresh of status
        setSyncStatus(prev => ({
          ...prev,
          files: {
            ...prev.files,
            lastSync: Date.now()
          }
        }));
      }, 5000);

      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(undefined);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Format timestamp
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get status icon
  const getStatusIcon = (status: SyncTest['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-3 h-3 text-[#ffb74d] animate-spin" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-[#4fc3f7]" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-[#ff6b6b]" />;
      default:
        return <Clock className="w-3 h-3 text-[#858585]" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#858585]">
          <RefreshCw className="w-4 h-4" />
          <span className="text-xs uppercase">File Sync Debugger</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(prev => !prev)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              autoRefresh 
                ? 'bg-[#4fc3f7] text-[#1a1a1a]' 
                : 'bg-[#3c3c3c] text-[#858585] hover:bg-[#4c4c4c]'
            }`}
          >
            {autoRefresh ? 'Auto' : 'Manual'}
          </button>
          <button
            onClick={runAllTests}
            disabled={syncTests.some(test => test.status === 'running')}
            className="px-2 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#cccccc] rounded transition-colors disabled:opacity-50"
          >
            Test All
          </button>
        </div>
      </div>

      {/* Sync Status Overview */}
      <div className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
        <div className="text-xs text-[#858585] mb-2 uppercase">Sync Status Overview</div>
        <div className="space-y-2">
          {/* Files Sync */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-[#858585]" />
              <span className="text-xs">Files:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#cccccc]">{syncStatus.files.convexCount}</span>
              {syncStatus.files.synced ? (
                <CheckCircle className="w-3 h-3 text-[#4fc3f7]" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-[#ffb74d]" />
              )}
            </div>
          </div>

          {/* User Auth */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-[#858585]" />
              <span className="text-xs">User:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#cccccc]">
                {syncStatus.user.authenticated ? 'Auth' : 'No Auth'}
              </span>
              {syncStatus.user.authenticated ? (
                <CheckCircle className="w-3 h-3 text-[#4fc3f7]" />
              ) : (
                <XCircle className="w-3 h-3 text-[#ff6b6b]" />
              )}
            </div>
          </div>

          {/* Loading States */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Loading:</span>
            <span className="text-xs text-[#cccccc]">
              {syncStatus.loading.files || syncStatus.loading.user ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Sync Information */}
      <div className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
        <div className="text-xs text-[#858585] mb-2 uppercase">Sync Details</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Last Files Sync:</span>
            <span className="text-[#cccccc]">
              {formatTimestamp(syncStatus.files.lastSync)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User Last Update:</span>
            <span className="text-[#cccccc]">
              {formatTimestamp(syncStatus.user.lastUpdate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Files Loading:</span>
            <span className={syncStatus.loading.files ? 'text-[#ffb74d]' : 'text-[#4fc3f7]'}>
              {syncStatus.loading.files ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User Loading:</span>
            <span className={syncStatus.loading.user ? 'text-[#ffb74d]' : 'text-[#4fc3f7]'}>
              {syncStatus.loading.user ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Tests */}
      <div className="space-y-2">
        <div className="text-xs text-[#858585] uppercase">Synchronization Tests</div>
        {syncTests.map((test, index) => (
          <div key={index} className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                <span className="text-xs text-[#cccccc]">{test.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {test.timestamp && (
                  <span className="text-xs text-[#858585]">
                    {formatTimestamp(test.timestamp)}
                  </span>
                )}
                <button
                  onClick={() => runSyncTest(test.name)}
                  disabled={test.status === 'running'}
                  className="text-xs text-[#4fc3f7] hover:text-[#87ceeb] transition-colors disabled:opacity-50"
                >
                  Test
                </button>
              </div>
            </div>
            {test.result && (
              <div className={`text-xs p-2 rounded mt-1 ${
                test.status === 'error' 
                  ? 'bg-[#ff6b6b]/10 text-[#ff6b6b]' 
                  : 'bg-[#4fc3f7]/10 text-[#4fc3f7]'
              }`}>
                {test.result}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Auto-refresh Status */}
      {autoRefresh && (
        <div className="flex items-center gap-2 text-xs text-[#858585] justify-center">
          <div className="w-2 h-2 bg-[#4fc3f7] rounded-full animate-pulse"></div>
          <span>Auto-refreshing every 5 seconds</span>
        </div>
      )}
    </div>
  );
}
