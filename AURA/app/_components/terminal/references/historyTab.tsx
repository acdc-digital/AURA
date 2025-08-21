'use client';

import { useHistoryStore } from '@/store/history';
import { formatDistanceToNow } from 'date-fns';
import {
    AlertTriangle,
    Bug,
    CheckCircle,
    File,
    FolderOpen,
    Info,
    Settings,
    Users,
    Wifi,
    XCircle
} from 'lucide-react';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-3 h-3 text-green-400" />;
    case 'error':
      return <XCircle className="w-3 h-3 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
    case 'info':
    default:
      return <Info className="w-3 h-3 text-blue-400" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'file':
      return <File className="w-3 h-3 text-gray-400" />;
    case 'social':
      return <Users className="w-3 h-3 text-purple-400" />;
    case 'project':
      return <FolderOpen className="w-3 h-3 text-orange-400" />;
    case 'connection':
      return <Wifi className="w-3 h-3 text-cyan-400" />;
    case 'debug':
      return <Bug className="w-3 h-3 text-red-300" />;
    case 'system':
    default:
      return <Settings className="w-3 h-3 text-gray-400" />;
  }
};

export function HistoryTab() {
  const { getFilteredEntries, getStats } = useHistoryStore();
  const filteredEntries = getFilteredEntries();
  const stats = getStats();

  // Safety check for stats
  const safeStats = {
    byType: {
      success: stats?.byType?.success ?? 0,
      error: stats?.byType?.error ?? 0,
      warning: stats?.byType?.warning ?? 0,
      info: stats?.byType?.info ?? 0,
    },
    recentActivity: stats?.recentActivity ?? 0,
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#3c3c3c] bg-[#252526]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-[#cccccc]">Activity History</div>
            <div className="text-xs text-[#858585]">({filteredEntries.length})</div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 text-green-400" />
              <span className="text-[#858585]">{safeStats.byType.success}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-2.5 h-2.5 text-red-400" />
              <span className="text-[#858585]">{safeStats.byType.error}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5 text-yellow-400" />
              <span className="text-[#858585]">{safeStats.byType.warning}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#6a6a6a]">24h:</span>
              <span className="text-[#cccccc]">{safeStats.recentActivity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="p-4 text-center text-[#858585] text-xs">
            No activity recorded yet
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 p-2 rounded text-xs hover:bg-[#2a2d2e] transition-colors"
              >
                {/* Icons */}
                <div className="flex items-center gap-1 mt-0.5">
                  {getTypeIcon(entry.type)}
                  {getCategoryIcon(entry.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#cccccc] font-medium truncate">
                      {entry.action}
                    </span>
                    <span className="text-[#858585] text-[10px] whitespace-nowrap">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-[#858585] leading-tight">
                    {entry.message}
                  </div>
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="mt-1 text-[10px] text-[#6a6a6a] truncate">
                      {Object.entries(entry.details).map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="text-[#888]">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      )).slice(0, 3)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryTab;
