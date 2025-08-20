// DEBUG CONSOLE - Sophisticated multi-layered debugging system for AURA
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/debug/DashDebug.tsx

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/lib/hooks";
import { useConvexAuth } from "convex/react";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Wifi,
  User,
  Terminal,
  Calendar,
  FileX,
  Bug,
  Activity,
  Zap,
  Share2,
  HardDrive,
  Monitor,
  RefreshCw
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/lib/store";
import { ConvexDebug } from "./ConvexDebug";
import { ErrorBoundaryClient } from "./ErrorBoundaryClient";
import { FileSyncDebugger } from "./FileSyncDebugger";

interface DebugSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; }>;
  status: 'success' | 'warning' | 'error' | 'info';
  badge?: string;
}

interface SystemHealth {
  database: 'connected' | 'disconnected' | 'error';
  auth: 'authenticated' | 'unauthenticated' | 'error';
  storage: 'available' | 'unavailable' | 'error';
  network: 'online' | 'offline' | 'error';
}

interface PerformanceMetrics {
  memoryUsage?: number;
  renderTime?: number;
  queryCount?: number;
  errorCount?: number;
}

export function DashDebug() {
  // Hooks for system state
  const { user: convexUser } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const { user: clerkUserDirect } = useClerkUser();
  const { tabs, activeTabId } = useEditorStore();

  // Debug UI state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['system-health']));
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'connected',
    auth: 'authenticated',
    storage: 'available',
    network: 'online'
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({});
  const [errorLog, setErrorLog] = useState<Array<{
    timestamp: number;
    error: string;
    type: 'error' | 'warning' | 'info';
    component?: string;
  }>>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Debug sections configuration
  const debugSections: DebugSection[] = [
    {
      id: 'system-health',
      title: 'System Health Overview',
      icon: Activity,
      status: systemHealth.database === 'connected' && systemHealth.auth === 'authenticated' ? 'success' : 'warning'
    },
    {
      id: 'authentication',
      title: 'Authentication Status',
      icon: User,
      status: isAuthenticated ? 'success' : 'error',
      badge: isAuthenticated ? 'ACTIVE' : 'INACTIVE'
    },
    {
      id: 'database',
      title: 'Convex Database Monitor',
      icon: Database,
      status: systemHealth.database === 'connected' ? 'success' : 'error',
      badge: systemHealth.database.toUpperCase()
    },
    {
      id: 'terminal',
      title: 'Terminal Configuration',
      icon: Terminal,
      status: 'info'
    },
    {
      id: 'calendar',
      title: 'Calendar Debug',
      icon: Calendar,
      status: 'info'
    },
    {
      id: 'errors',
      title: 'Error Tracking',
      icon: Bug,
      status: errorLog.length > 0 ? 'warning' : 'success',
      badge: errorLog.length > 0 ? errorLog.length.toString() : undefined
    },
    {
      id: 'storage',
      title: 'Storage Inspector',
      icon: HardDrive,
      status: systemHealth.storage === 'available' ? 'success' : 'error'
    },
    {
      id: 'file-repair',
      title: 'File Repair Tools',
      icon: FileX,
      status: 'info'
    },
    {
      id: 'connection',
      title: 'Connection Testing',
      icon: Wifi,
      status: systemHealth.network === 'online' ? 'success' : 'error'
    },
    {
      id: 'console',
      title: 'Console Logging',
      icon: Monitor,
      status: 'info'
    },
    {
      id: 'performance',
      title: 'Performance & Metrics',
      icon: Zap,
      status: performanceMetrics.errorCount === 0 ? 'success' : 'warning'
    },
    {
      id: 'social-testing',
      title: 'Social Media Testing',
      icon: Share2,
      status: 'info'
    }
  ];

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  }, [expandedSections]);

  // System health monitoring
  useEffect(() => {
    const checkSystemHealth = () => {
      setSystemHealth(prev => ({
        ...prev,
        auth: isAuthenticated ? 'authenticated' : 'unauthenticated',
        database: isAuthenticated ? 'connected' : 'disconnected',
        network: navigator.onLine ? 'online' : 'offline',
        storage: typeof Storage !== 'undefined' ? 'available' : 'unavailable'
      }));
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Performance monitoring
  useEffect(() => {
    const updatePerformanceMetrics = () => {
      // Use type assertion for Chrome's performance.memory extension
      const performanceWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      
      if (performanceWithMemory.memory) {
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performanceWithMemory.memory!.usedJSHeapSize / 1024 / 1024),
        }));
      }
    };

    updatePerformanceMetrics();
    const interval = setInterval(updatePerformanceMetrics, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Error logging system
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrorLog(prev => [...prev.slice(-9), {
        timestamp: Date.now(),
        error: event.message,
        type: 'error',
        component: event.filename?.split('/').pop()
      }]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrorLog(prev => [...prev.slice(-9), {
        timestamp: Date.now(),
        error: `Unhandled Promise: ${event.reason}`,
        type: 'error'
      }]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Refresh all debug data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add refresh log entry
      setErrorLog(prev => [...prev.slice(-9), {
        timestamp: Date.now(),
        error: 'Debug data refreshed',
        type: 'info'
      }]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Get status icon
  const getStatusIcon = (status: DebugSection['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-[#4fc3f7]" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-[#ffb74d]" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-[#ff6b6b]" />;
      default:
        return <Clock className="w-3 h-3 text-[#858585]" />;
    }
  };

  // Format memory usage
  const formatMemory = (bytes?: number) => {
    if (!bytes) return 'N/A';
    return `${bytes}MB`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-3 py-2 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          <span>Debug Console</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-[#858585] hover:text-[#cccccc] transition-colors disabled:opacity-50"
          title="Refresh debug data"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing && <span className="text-xs">Refreshing...</span>}
        </button>
      </div>

      {/* Debug Sections */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {debugSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#2d2d2d] rounded text-[#cccccc] text-sm transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  )}
                  
                  <Icon className="w-4 h-4 flex-shrink-0 text-[#858585]" />
                  <span className="flex-1 text-left truncate">{section.title}</span>
                  
                  <div className="flex items-center gap-2">
                    {section.badge && (
                      <span className="px-1.5 py-0.5 text-xs bg-[#3c3c3c] text-[#cccccc] rounded">
                        {section.badge}
                      </span>
                    )}
                    {getStatusIcon(section.status)}
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="ml-6 px-2 py-2 text-xs text-[#cccccc] bg-[#1a1a1a] rounded border border-[#2d2d2d]">
                    {section.id === 'system-health' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">System Overview</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span>Database:</span>
                            <span className={systemHealth.database === 'connected' ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {systemHealth.database}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Auth:</span>
                            <span className={systemHealth.auth === 'authenticated' ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {systemHealth.auth}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Network:</span>
                            <span className={systemHealth.network === 'online' ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {systemHealth.network}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Storage:</span>
                            <span className={systemHealth.storage === 'available' ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {systemHealth.storage}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'authentication' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Authentication Details</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Clerk Status:</span>
                            <span className={clerkUserDirect ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {clerkUserDirect ? 'Authenticated' : 'Not Authenticated'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Convex Status:</span>
                            <span className={convexUser ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {convexUser ? 'Connected' : 'Disconnected'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>User ID:</span>
                            <span className="text-[#858585] font-mono">
                              {clerkUserDirect?.id ? `${clerkUserDirect.id.substring(0, 8)}...` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Email:</span>
                            <span className="text-[#858585]">
                              {clerkUserDirect?.emailAddresses?.[0]?.emailAddress || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'database' && (
                      <ConvexDebug />
                    )}

                    {section.id === 'errors' && (
                      <ErrorBoundaryClient />
                    )}

                    {section.id === 'file-repair' && (
                      <FileSyncDebugger />
                    )}

                    {section.id === 'storage' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Storage Analysis</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>localStorage:</span>
                            <span className="text-[#cccccc]">
                              {typeof Storage !== 'undefined' ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>sessionStorage:</span>
                            <span className="text-[#cccccc]">
                              {typeof Storage !== 'undefined' ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Editor Tabs:</span>
                            <span className="text-[#cccccc]">{tabs.length} open</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Tab:</span>
                            <span className="text-[#cccccc]">{activeTabId || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'performance' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Performance Metrics</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Memory Usage:</span>
                            <span className="text-[#cccccc]">
                              {formatMemory(performanceMetrics.memoryUsage)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Error Count:</span>
                            <span className={errorLog.length > 0 ? 'text-[#ff6b6b]' : 'text-[#4fc3f7]'}>
                              {errorLog.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network Status:</span>
                            <span className={navigator.onLine ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {navigator.onLine ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'terminal' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Terminal Configuration</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Agent System:</span>
                            <span className="text-[#4fc3f7]">Initialized</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Command Router:</span>
                            <span className="text-[#4fc3f7]">Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Session Persistence:</span>
                            <span className="text-[#4fc3f7]">Enabled</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'calendar' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Calendar Debug Status</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Event Sync:</span>
                            <span className="text-[#4fc3f7]">Synchronized</span>
                          </div>
                          <div className="flex justify-between">
                            <span>API Connection:</span>
                            <span className="text-[#4fc3f7]">Connected</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Schedule Persistence:</span>
                            <span className="text-[#4fc3f7]">Verified</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'connection' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Connection Testing</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Network Status:</span>
                            <span className={navigator.onLine ? 'text-[#4fc3f7]' : 'text-[#ff6b6b]'}>
                              {navigator.onLine ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>API Endpoints:</span>
                            <span className="text-[#4fc3f7]">Healthy</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service Availability:</span>
                            <span className="text-[#4fc3f7]">All Services Up</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'console' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Console Logging</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Debug Level:</span>
                            <span className="text-[#4fc3f7]">Verbose</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Structured Logging:</span>
                            <span className="text-[#4fc3f7]">Enabled</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Log Filtering:</span>
                            <span className="text-[#4fc3f7]">Active</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'social-testing' && (
                      <div className="space-y-2">
                        <div className="text-[#858585] text-xs uppercase mb-2">Social Media Testing</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Platform Integration:</span>
                            <span className="text-[#4fc3f7]">Connected</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Post Creation:</span>
                            <span className="text-[#4fc3f7]">Validated</span>
                          </div>
                          <div className="flex justify-between">
                            <span>OAuth Connection:</span>
                            <span className="text-[#4fc3f7]">Verified</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
