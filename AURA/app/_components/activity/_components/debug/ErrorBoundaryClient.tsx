// ERROR BOUNDARY CLIENT - Global client-side error capture system
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/debug/ErrorBoundaryClient.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ErrorEvent {
  id: string;
  timestamp: number;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  type: 'javascript' | 'promise' | 'resource' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorStats {
  total: number;
  javascript: number;
  promise: number;
  resource: number;
  network: number;
  lastHour: number;
}

export function ErrorBoundaryClient() {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [isCapturing, setIsCapturing] = useState(true);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    javascript: 0,
    promise: 0,
    resource: 0,
    network: 0,
    lastHour: 0
  });

  // Generate unique error ID
  const generateErrorId = () => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Determine error severity
  const determineErrorSeverity = (error: string): ErrorEvent['severity'] => {
    const lowerError = error.toLowerCase();
    if (lowerError.includes('network') || lowerError.includes('fetch')) return 'critical';
    if (lowerError.includes('reference') || lowerError.includes('undefined')) return 'high';
    if (lowerError.includes('warning') || lowerError.includes('deprecated')) return 'low';
    return 'medium';
  };

  // Add error to store
  const addError = useCallback((errorData: Partial<ErrorEvent>) => {
    if (!isCapturing) return;

    const error: ErrorEvent = {
      id: generateErrorId(),
      timestamp: Date.now(),
      message: errorData.message || 'Unknown error',
      filename: errorData.filename,
      lineno: errorData.lineno,
      colno: errorData.colno,
      stack: errorData.stack,
      type: errorData.type || 'javascript',
      severity: determineErrorSeverity(errorData.message || '')
    };

    setErrors(prev => [...prev.slice(-49), error]); // Keep last 50 errors
  }, [isCapturing]);

  // Update statistics
  useEffect(() => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const newStats: ErrorStats = {
      total: errors.length,
      javascript: errors.filter(e => e.type === 'javascript').length,
      promise: errors.filter(e => e.type === 'promise').length,
      resource: errors.filter(e => e.type === 'resource').length,
      network: errors.filter(e => e.type === 'network').length,
      lastHour: errors.filter(e => e.timestamp > oneHourAgo).length
    };

    setStats(newStats);
  }, [errors]);

  // Set up global error listeners
  useEffect(() => {
    // JavaScript errors
    const handleError = (event: globalThis.ErrorEvent) => {
      addError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        type: 'javascript'
      });
    };

    // Unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = typeof event.reason === 'string' 
        ? event.reason 
        : event.reason?.message || 'Unhandled promise rejection';

      addError({
        message,
        stack: event.reason?.stack,
        type: 'promise'
      });
    };

    // Resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLImageElement | HTMLLinkElement | HTMLScriptElement;
      const tagName = target?.tagName?.toLowerCase();
      const src = (target as HTMLImageElement)?.src || (target as HTMLLinkElement)?.href;

      addError({
        message: `Failed to load ${tagName}: ${src}`,
        type: 'resource'
      });
    };

    if (isCapturing) {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleResourceError, true); // Capture phase for resource errors
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, [isCapturing, addError]);

  // Clear all errors
  const clearErrors = () => {
    setErrors([]);
  };

  // Toggle error capturing
  const toggleCapturing = () => {
    setIsCapturing(prev => !prev);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get severity color
  const getSeverityColor = (severity: ErrorEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-[#ff4444]';
      case 'high':
        return 'text-[#ff6b6b]';
      case 'medium':
        return 'text-[#ffb74d]';
      case 'low':
        return 'text-[#4fc3f7]';
      default:
        return 'text-[#858585]';
    }
  };

  // Get type icon
  const getTypeIcon = (type: ErrorEvent['type']) => {
    switch (type) {
      case 'javascript':
        return '🔧';
      case 'promise':
        return '⚡';
      case 'resource':
        return '📁';
      case 'network':
        return '🌐';
      default:
        return '❓';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#858585]">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs uppercase">Error Boundary</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCapturing}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              isCapturing 
                ? 'bg-[#4fc3f7] text-[#1a1a1a]' 
                : 'bg-[#3c3c3c] text-[#858585] hover:bg-[#4c4c4c]'
            }`}
          >
            {isCapturing ? 'Capturing' : 'Paused'}
          </button>
          <button
            onClick={clearErrors}
            disabled={errors.length === 0}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#cccccc] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
        <div className="text-xs text-[#858585] mb-2 uppercase">Error Statistics</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Total Errors:</span>
            <span className={stats.total > 0 ? 'text-[#ff6b6b]' : 'text-[#4fc3f7]'}>
              {stats.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last Hour:</span>
            <span className={stats.lastHour > 0 ? 'text-[#ffb74d]' : 'text-[#4fc3f7]'}>
              {stats.lastHour}
            </span>
          </div>
          <div className="flex justify-between">
            <span>JavaScript:</span>
            <span className="text-[#cccccc]">{stats.javascript}</span>
          </div>
          <div className="flex justify-between">
            <span>Promises:</span>
            <span className="text-[#cccccc]">{stats.promise}</span>
          </div>
          <div className="flex justify-between">
            <span>Resources:</span>
            <span className="text-[#cccccc]">{stats.resource}</span>
          </div>
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="text-[#cccccc]">{stats.network}</span>
          </div>
        </div>
      </div>

      {/* Error Log */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#858585] uppercase">Recent Errors</span>
          <span className="text-xs text-[#858585]">
            {isCapturing ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#4fc3f7] rounded-full animate-pulse"></div>
                Monitoring
              </span>
            ) : (
              'Monitoring Paused'
            )}
          </span>
        </div>

        {errors.length === 0 ? (
          <div className="p-4 text-center text-[#4fc3f7] text-xs bg-[#2d2d2d] rounded border border-[#3c3c3c]">
            {isCapturing ? 'No errors captured yet' : 'Error capturing is paused'}
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {errors.slice(-10).reverse().map((error) => (
              <div key={error.id} className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getTypeIcon(error.type)}</span>
                    <span className={`text-xs uppercase font-medium ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                    <span className="text-xs text-[#858585]">
                      {error.type}
                    </span>
                  </div>
                  <span className="text-xs text-[#858585]">
                    {formatTimestamp(error.timestamp)}
                  </span>
                </div>
                
                <div className="text-xs text-[#cccccc] mb-2 break-words">
                  {error.message}
                </div>
                
                {error.filename && (
                  <div className="text-xs text-[#858585]">
                    {error.filename}
                    {error.lineno && `:${error.lineno}`}
                    {error.colno && `:${error.colno}`}
                  </div>
                )}
                
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-[#4fc3f7] cursor-pointer hover:text-[#87ceeb]">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-[#858585] mt-1 p-2 bg-[#1a1a1a] rounded overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Capture Status */}
      <div className="p-2 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
        <div className="text-xs text-[#858585] mb-1 uppercase">Monitoring Status</div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            isCapturing ? 'bg-[#4fc3f7] animate-pulse' : 'bg-[#858585]'
          }`}></div>
          <span className="text-[#cccccc]">
            Global error listeners: {isCapturing ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}
