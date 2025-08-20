// CONVEX DEBUG COMPONENT - Database connection testing and query debugging
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/debug/ConvexDebug.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
import { useUser, useFiles, useProjects } from "@/lib/hooks";
import { 
  Database, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw
} from "lucide-react";

interface ConnectionTest {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: string;
  duration?: number;
}

export function ConvexDebug() {
  const { user } = useUser();
  const { files, isLoading: filesLoading } = useFiles();
  const { projects, isLoading: projectsLoading, createProject, deleteProject } = useProjects();
  
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Database Connection', status: 'idle' },
    { name: 'User Query', status: 'idle' },
    { name: 'Projects Query', status: 'idle' },
    { name: 'Files Query', status: 'idle' },
    { name: 'Test Project Creation', status: 'idle' }
  ]);

  // Memoized data for performance
  const systemStats = useMemo(() => ({
    projectsCount: projects?.length || 0,
    filesCount: files?.length || 0,
    userConnected: !!user,
    allLoaded: !filesLoading && !projectsLoading && !!user
  }), [projects, files, user, filesLoading, projectsLoading]);

  // Run individual test
  const runTest = useCallback(async (testName: string) => {
    const startTime = performance.now();
    
    setTests(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status: 'running', result: undefined, duration: undefined }
        : test
    ));

    try {
      let result: string;

      switch (testName) {
        case 'Database Connection':
          // Simple connection test
          result = user ? 'Connected to Convex successfully' : 'Not authenticated';
          break;

        case 'User Query':
          result = user 
            ? `User found: ${user.name || 'Unnamed'} (${user.email})`
            : 'No user data available';
          break;

        case 'Projects Query':
          result = projects !== undefined
            ? `Found ${systemStats.projectsCount} projects`
            : 'Projects query pending or failed';
          break;

        case 'Files Query':
          result = files !== undefined 
            ? `Found ${systemStats.filesCount} files`
            : 'Files query pending or failed';
          break;

        case 'Test Project Creation':
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          const testProject = await createProject({
            name: `Debug Test ${Date.now()}`,
            description: 'Auto-generated test project for debugging'
          });
          
          // Clean up immediately - deleteProject expects just the ID
          await deleteProject(testProject);
          
          result = 'Test project created and deleted successfully';
          break;

        default:
          throw new Error(`Unknown test: ${testName}`);
      }

      const duration = performance.now() - startTime;

      setTests(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'success', result, duration }
          : test
      ));

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setTests(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'error', result: errorMessage, duration }
          : test
      ));
    }
  }, [user, projects, files, createProject, deleteProject, systemStats]);

  // Run all tests
  const runAllTests = useCallback(async () => {
    for (const test of tests) {
      await runTest(test.name);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }, [tests, runTest]);

  // Get status icon
  const getStatusIcon = (status: ConnectionTest['status']) => {
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
          <Database className="w-4 h-4" />
          <span className="text-xs uppercase">Convex Database Tests</span>
        </div>
        <button
          onClick={runAllTests}
          disabled={tests.some(test => test.status === 'running')}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#cccccc] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-3 h-3" />
          Run All
        </button>
      </div>

      {/* Connection Status */}
      <div className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
        <div className="text-xs text-[#858585] mb-2">Connection Status</div>
        <div className="flex items-center justify-between text-xs">
          <span>Database:</span>
          <span className={user ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
            {user ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {user && (
          <>
            <div className="flex items-center justify-between text-xs mt-1">
              <span>User ID:</span>
              <span className="text-[#858585] font-mono">
                {user._id.substring(0, 8)}...
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span>Email:</span>
              <span className="text-[#858585]">
                {user.email}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Test Results */}
      <div className="space-y-2">
        <div className="text-xs text-[#858585] uppercase">Test Results</div>
        {tests.map((test, index) => (
          <div key={index} className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                <span className="text-xs text-[#cccccc]">{test.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {test.duration && (
                  <span className="text-xs text-[#858585]">
                    {Math.round(test.duration)}ms
                  </span>
                )}
                <button
                  onClick={() => runTest(test.name)}
                  disabled={test.status === 'running'}
                  className="text-xs text-[#4fc3f7] hover:text-[#87ceeb] transition-colors disabled:opacity-50"
                >
                  Test
                </button>
              </div>
            </div>
            {test.result && (
              <div className={`text-xs p-2 rounded ${
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

      {/* Query Performance */}
      <div className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
        <div className="text-xs text-[#858585] mb-2 uppercase">Query Performance</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Projects Query:</span>
            <span className={systemStats.projectsCount > 0 ? 'text-[#4fc3f7]' : 'text-[#ffb74d]'}>
              {!projectsLoading ? `${systemStats.projectsCount} loaded` : 'Loading...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Files Query:</span>
            <span className={systemStats.filesCount > 0 ? 'text-[#4fc3f7]' : 'text-[#ffb74d]'}>
              {!filesLoading ? `${systemStats.filesCount} loaded` : 'Loading...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User Query:</span>
            <span className={systemStats.userConnected ? 'text-[#4fc3f7]' : 'text-[#ffb74d]'}>
              {systemStats.userConnected ? 'Loaded' : 'Not loaded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
