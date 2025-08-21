// Calendar Console Panel Component
// Displays scheduled content in chronological order in the sidebar panel

"use client";

import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useScheduledPostsFromConvex } from "@/store";
import { useConvexAuth, useQuery } from "convex/react";
import {
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Eye,
    Instagram,
    Linkedin,
    MessageSquare,
    Twitter,
    XCircle,
    Youtube
} from "lucide-react";
import { useState } from "react";

interface CalendarPost {
  _id: string;
  _creationTime?: number;
  platform: string;
  content: string;
  scheduledAt: number;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'posting' | 'posted';
  userId?: string;
  tags?: string[];
  imageUrls?: string[];
  title?: string;
  fileName?: string;
  fileType?: string;
  createdAt?: number;
  updatedAt?: number;
}

export function DashCalendarConsole() {
  const { isAuthenticated } = useConvexAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'twitter' | 'instagram' | 'linkedin' | 'youtube'>('all');

  // Get scheduled posts from Convex
  const allCalendarPosts = useQuery(
    api.socialPosts.getAllAgentPosts,
    isAuthenticated ? {} : "skip"
  ) as CalendarPost[] | undefined;

  const { posts: calendarPostsData, isLoading: calendarLoading } = useScheduledPostsFromConvex();

  // Normalize and combine posts from different sources
  const normalizePost = (post: any): CalendarPost => ({
    _id: post._id,
    _creationTime: post._creationTime || post.createdAt || Date.now(),
    platform: post.platform,
    content: post.content,
    scheduledAt: post.scheduledAt,
    status: post.status === 'posting' || post.status === 'posted' ? 'published' : post.status,
    userId: post.userId,
    tags: post.tags || [],
    imageUrls: post.imageUrls || [],
    title: post.title,
    fileName: post.fileName,
    fileType: post.fileType,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  });

  const allPosts = [
    ...(calendarPostsData || []).map(normalizePost),
    ...(allCalendarPosts || []).map(normalizePost)
  ];

  const uniquePosts = allPosts.filter((post, index, self) => 
    index === self.findIndex(p => p._id === post._id)
  );

  // Filter posts by platform
  const filteredPosts = selectedFilter === 'all' 
    ? uniquePosts 
    : uniquePosts.filter(post => post.platform.toLowerCase() === selectedFilter);

  // Sort posts chronologically by scheduled time
  const sortedPosts = [...filteredPosts].sort((a, b) => a.scheduledAt - b.scheduledAt);

  // Group posts by time periods
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const tomorrowTime = todayTime + 24 * 60 * 60 * 1000;
  const weekTime = todayTime + 7 * 24 * 60 * 60 * 1000;

  const overduePosts = sortedPosts.filter(post => post.scheduledAt < now && post.status === 'scheduled');
  const todayPosts = sortedPosts.filter(post => post.scheduledAt >= todayTime && post.scheduledAt < tomorrowTime);
  const tomorrowPosts = sortedPosts.filter(post => post.scheduledAt >= tomorrowTime && post.scheduledAt < (tomorrowTime + 24 * 60 * 60 * 1000));
  const thisWeekPosts = sortedPosts.filter(post => post.scheduledAt >= tomorrowTime + 24 * 60 * 60 * 1000 && post.scheduledAt < weekTime);
  const laterPosts = sortedPosts.filter(post => post.scheduledAt >= weekTime);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return <Twitter className="w-3 h-3 text-[#858585]" />;
      case 'instagram':
        return <Instagram className="w-3 h-3 text-[#858585]" />;
      case 'linkedin':
        return <Linkedin className="w-3 h-3 text-[#858585]" />;
      case 'youtube':
        return <Youtube className="w-3 h-3 text-[#858585]" />;
      default:
        return <MessageSquare className="w-3 h-3 text-[#858585]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>Calendar</span>
          </div>
          <div className="mt-4 p-4 text-center">
            <Calendar className="w-8 h-8 text-[#858585] mx-auto mb-2" />
            <p className="text-sm text-[#858585] mb-1">Authentication Required</p>
            <p className="text-xs text-[#858585]">
              Sign in to view your scheduled content timeline
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Calendar</span>
        </div>

        {/* Calendar Sections */}
        <div className="space-y-1 mt-2">

          {/* Calendar Overview */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('overview') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Calendar className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Overview</span>
              <div className="flex items-center gap-1">
                {calendarLoading && <Clock className="w-3 h-3 text-yellow-400" />}
                {!calendarLoading && <CheckCircle className="w-3 h-3 text-green-400" />}
              </div>
            </button>
            
            {expandedSections.has('overview') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                {/* Overview Statistics */}
                <div className="text-[10px] text-[#858585] space-y-1">
                  <div className="flex justify-between">
                    <span>Total Posts:</span>
                    <span className="text-[#cccccc]">{filteredPosts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today:</span>
                    <span className="text-[#cccccc]">{todayPosts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Week:</span>
                    <span className="text-[#cccccc]">{thisWeekPosts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled:</span>
                    <span className="text-[#cccccc]">
                      {filteredPosts.filter(p => p.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Published:</span>
                    <span className="text-[#cccccc]">
                      {filteredPosts.filter(p => p.status === 'published').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Platform Filter */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('filters')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('filters') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Eye className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Filters</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#858585] capitalize">{selectedFilter}</span>
              </div>
            </button>
            
            {expandedSections.has('filters') && (
              <div className="px-2 pb-2 space-y-2">
                <Separator className="bg-[#2d2d2d]" />
                
                {/* Filter Actions */}
                <div className="space-y-1">
                  <div className="text-xs text-[#858585] mb-1 px-1">Platform Selection</div>
                  
                  {[
                    { id: 'all', label: 'All Platforms', icon: Calendar },
                    { id: 'twitter', label: 'Twitter', icon: Twitter },
                    { id: 'instagram', label: 'Instagram', icon: Instagram },
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                    { id: 'youtube', label: 'YouTube', icon: Youtube },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = selectedFilter === filter.id;
                    const count = filter.id === 'all' 
                      ? uniquePosts.length 
                      : uniquePosts.filter(p => p.platform.toLowerCase() === filter.id).length;
                    
                    return (
                      <div key={filter.id} className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3 text-[#858585]" />
                          <span className="text-xs text-[#858585]">{filter.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#cccccc]">{count}</span>
                          <button
                            onClick={() => setSelectedFilter(filter.id as any)}
                            className={`text-xs underline-offset-2 hover:underline ${
                              isActive 
                                ? 'text-[#007acc] font-medium' 
                                : 'text-[#858585] hover:text-[#cccccc]'
                            }`}
                          >
                            {isActive ? 'Active' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Today's Posts */}
          {todayPosts.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('today')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('today') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium flex-1 text-left">Today</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{todayPosts.length}</span>
                </div>
              </button>
              
              {expandedSections.has('today') && (
                <div className="px-2 pb-2 space-y-2">
                  <Separator className="bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {todayPosts.slice(0, 3).map((post) => (
                      <div key={post._id} className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getPlatformIcon(post.platform)}
                          <span className="text-xs text-[#cccccc] truncate capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585]">
                            {formatDateTime(post.scheduledAt).split(' ')[1]}
                          </span>
                          <span className={`text-xs px-1 py-0.5 rounded ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {todayPosts.length > 3 && (
                      <div className="text-xs text-[#858585] text-center pt-1">
                        +{todayPosts.length - 3} more posts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* This Week */}
          {thisWeekPosts.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('thisWeek')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('thisWeek') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <Calendar className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium flex-1 text-left">This Week</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{thisWeekPosts.length}</span>
                </div>
              </button>
              
              {expandedSections.has('thisWeek') && (
                <div className="px-2 pb-2 space-y-2">
                  <Separator className="bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {thisWeekPosts.slice(0, 5).map((post) => (
                      <div key={post._id} className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getPlatformIcon(post.platform)}
                          <span className="text-xs text-[#cccccc] truncate capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585]">
                            {formatDateTime(post.scheduledAt).split(' ')[0]}
                          </span>
                          <span className={`text-xs px-1 py-0.5 rounded ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {thisWeekPosts.length > 5 && (
                      <div className="text-xs text-[#858585] text-center pt-1">
                        +{thisWeekPosts.length - 5} more posts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overdue Posts */}
          {overduePosts.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('overdue')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('overdue') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium flex-1 text-left">Overdue</span>
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-[#cccccc]">{overduePosts.length}</span>
                </div>
              </button>
              
              {expandedSections.has('overdue') && (
                <div className="px-2 pb-2 space-y-2">
                  <Separator className="bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {overduePosts.map((post) => (
                      <div key={post._id} className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getPlatformIcon(post.platform)}
                          <span className="text-xs text-[#cccccc] truncate capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585]">
                            {formatDateTime(post.scheduledAt)}
                          </span>
                          <span className={`text-xs px-1 py-0.5 rounded ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Later Posts */}
          {laterPosts.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('later')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('later') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <Calendar className="w-3.5 h-3.5 text-[#858585]" />
                <span className="text-xs font-medium flex-1 text-left">Later</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{laterPosts.length}</span>
                </div>
              </button>
              
              {expandedSections.has('later') && (
                <div className="px-2 pb-2 space-y-2">
                  <Separator className="bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {laterPosts.slice(0, 5).map((post) => (
                      <div key={post._id} className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getPlatformIcon(post.platform)}
                          <span className="text-xs text-[#cccccc] truncate capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585]">
                            {formatDateTime(post.scheduledAt)}
                          </span>
                          <span className={`text-xs px-1 py-0.5 rounded ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {laterPosts.length > 5 && (
                      <div className="text-xs text-[#858585] text-center pt-1">
                        +{laterPosts.length - 5} more posts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d] p-4">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-[#858585] mx-auto mb-2" />
                <p className="text-sm text-[#858585] mb-1">No scheduled content</p>
                <p className="text-xs text-[#858585]">
                  {selectedFilter === 'all' 
                    ? 'Create your first scheduled post in the Content Calendar'
                    : `No posts scheduled for ${selectedFilter}`
                  }
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
