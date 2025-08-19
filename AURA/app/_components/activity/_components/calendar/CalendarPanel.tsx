// CALENDAR PANEL COMPONENT - Sidebar panel for calendar following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/calendar/CalendarPanel.tsx

"use client";

import { useState } from 'react';
import { Calendar, Plus, Filter, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCalendarStore } from '@/lib/store/calendar';
import { useCalendarPosts } from '@/lib/hooks/useCalendarPosts';

interface CalendarPanelProps {
  className?: string;
}

export default function CalendarPanel({ className = "" }: CalendarPanelProps) {
  // Calendar store for UI state
  const {
    filters,
    setFilters,
    clearFilters,
    openCreatePostModal,
    currentView,
    setCurrentView,
  } = useCalendarStore();

  // Calendar posts hook for data
  const {
    todayPosts,
    overduePosts,
    getPostCountsByStatus,
    getPostCountsByPlatform,
    isLoading,
  } = useCalendarPosts();

  // Local state for filters UI
  const [showFilters, setShowFilters] = useState(false);

  // Get counts for status badges
  const statusCounts = getPostCountsByStatus();
  const platformCounts = getPostCountsByPlatform();

  const handlePlatformFilter = (platform: string) => {
    const validPlatforms = ['reddit', 'twitter', 'linkedin', 'facebook', 'instagram', 'all'];
    if (validPlatforms.includes(platform)) {
      setFilters({ platform: platform === 'all' ? 'all' : platform as 'reddit' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' });
    }
  };

  const handleStatusFilter = (status: string) => {
    const validStatuses = ['draft', 'scheduled', 'posting', 'posted', 'failed', 'all'];
    if (validStatuses.includes(status)) {
      setFilters({ status: status === 'all' ? 'all' : status as 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed' });
    }
  };

  const handleViewChange = (view: 'week' | 'month' | 'day' | 'agenda') => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className={`h-full bg-[#1e1e1e] border-r border-[#333] ${className}`}>
        <div className="p-4 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#cccccc]" />
            <span className="text-[#cccccc] text-sm font-medium">Calendar</span>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#333] rounded"></div>
            <div className="h-4 bg-[#333] rounded"></div>
            <div className="h-4 bg-[#333] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-[#1e1e1e] border-r border-[#333] flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#cccccc]" />
            <span className="text-[#cccccc] text-sm font-medium">Calendar</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openCreatePostModal()}
            className="h-6 w-6 p-0 hover:bg-[#2d2d30]"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-1 mb-3">
          <Button
            size="sm"
            variant={currentView === 'week' ? 'default' : 'ghost'}
            onClick={() => handleViewChange('week')}
            className="h-7 px-2 text-xs"
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={currentView === 'month' ? 'default' : 'ghost'}
            onClick={() => handleViewChange('month')}
            className="h-7 px-2 text-xs"
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={currentView === 'day' ? 'default' : 'ghost'}
            onClick={() => handleViewChange('day')}
            className="h-7 px-2 text-xs"
          >
            Day
          </Button>
        </div>

        {/* Filter Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="h-7 px-2 text-xs w-full justify-start hover:bg-[#2d2d30]"
        >
          <Filter className="w-3 h-3 mr-2" />
          Filters
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Today's Posts Summary */}
          {todayPosts && todayPosts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-[#cccccc] flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Today ({todayPosts.length})
              </h4>
              <div className="space-y-1">
                {todayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post._id}
                    className="p-2 bg-[#2d2d30] rounded text-xs hover:bg-[#383838] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {post.fileType}
                      </Badge>
                      <Badge 
                        variant={
                          post.status === 'posted' ? 'default' :
                          post.status === 'failed' ? 'destructive' :
                          'secondary'
                        }
                        className="text-xs px-1 py-0"
                      >
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-[#cccccc] truncate">{post.title || 'Untitled Post'}</p>
                  </div>
                ))}
                {todayPosts.length > 3 && (
                  <div className="text-xs text-[#969696] pl-2">
                    +{todayPosts.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overdue Posts */}
          {overduePosts && overduePosts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Overdue ({overduePosts.length})
              </h4>
              <div className="space-y-1">
                {overduePosts.slice(0, 3).map((post) => (
                  <div
                    key={post._id}
                    className="p-2 bg-red-900/20 border border-red-800/50 rounded text-xs hover:bg-red-900/30 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {post.fileType}
                      </Badge>
                      <span className="text-xs text-red-400">
                        {post.scheduledFor && new Date(post.scheduledFor).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#cccccc] truncate">{post.title || 'Untitled Post'}</p>
                  </div>
                ))}
                {overduePosts.length > 3 && (
                  <div className="text-xs text-red-400 pl-2">
                    +{overduePosts.length - 3} more overdue...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Summary */}
          {statusCounts && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-[#cccccc] flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Status Summary
              </h4>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`p-2 rounded text-xs text-left hover:bg-[#2d2d30] ${
                      filters.status === status ? 'bg-[#2d2d30] ring-1 ring-blue-500' : ''
                    }`}
                  >
                    <div className="text-[#cccccc] capitalize">{status}</div>
                    <div className="text-[#969696] text-xs">{count}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Platform Summary */}
          {platformCounts && showFilters && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-[#cccccc]">Platforms</h4>
              <div className="space-y-1">
                {Object.entries(platformCounts).map(([platform, count]) => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformFilter(platform)}
                    className={`flex items-center justify-between w-full p-2 rounded text-xs hover:bg-[#2d2d30] ${
                      filters.platform === platform ? 'bg-[#2d2d30] ring-1 ring-blue-500' : ''
                    }`}
                  >
                    <span className="text-[#cccccc] capitalize">{platform}</span>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(filters.platform !== 'all' || filters.status !== 'all') && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="h-7 px-2 text-xs w-full justify-center hover:bg-[#2d2d30] text-[#969696]"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
