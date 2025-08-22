# AURA Platform - Calendar Integration with Scheduled Posts

_Real-time Social Media Scheduling and Content Management_

_Last Updated: August 21, 2025_

## Overview

The AURA Platform includes an integrated calendar system that connects social media post scheduling with visual content management. Built on Convex's real-time database with AURA's state management principles, the calendar provides a centralized view for planning, scheduling, and tracking all social media content across multiple platforms.

## Features

### 📅 Calendar Integration

- **Real-time synchronization** with Convex backend for immediate updates
- **Multi-platform support** for Twitter/X, Facebook, Instagram, LinkedIn, TikTok
- **Visual scheduling interface** with drag-and-drop capabilities
- **Content planning tools** for long-term social media strategy
- **Team collaboration** for shared content calendars

### 🎯 Scheduled Posts Management

- **Platform-specific color coding** for easy identification
- **Status tracking** (draft, scheduled, published, failed)
- **Bulk operations** for efficient content management
- **Content preview** directly within calendar interface
- **Automated publishing** with status notifications

### ⚡ Advanced Features

- **Agent integration** for AI-powered content suggestions
- **Campaign tracking** across multiple posts and platforms
- **Analytics integration** for performance monitoring
- **Premium features** for advanced scheduling and analytics
- **Export capabilities** for reporting and planning

## Architecture

### File Structure

```
AURA/
├── app/_components/calendar/
│   ├── Calendar.tsx                    # Main calendar interface
│   ├── CalendarDay.tsx                 # Individual day component
│   ├── PostIndicator.tsx               # Scheduled post indicators
│   └── _components/
│       ├── schedulePostModal.tsx       # Post scheduling interface
│       ├── postDetails.tsx             # Post detail view
│       ├── bulkOperations.tsx          # Bulk management tools
│       └── platformFilters.tsx         # Platform filtering
├── lib/hooks/
│   ├── useCalendarPosts.ts             # Calendar posts hook
│   ├── useCalendarSync.ts              # Real-time sync management
│   └── useScheduledPosts.ts            # Scheduled post operations
├── lib/store/
│   └── calendar.ts                     # Calendar UI state management
├── convex/
│   ├── calendar.ts                     # Calendar Convex functions
│   ├── scheduledPosts.ts               # Scheduled post operations
│   └── socialPosts.ts                  # Social media post management
└── types/
    └── calendar.ts                     # Calendar type definitions
```

### AURA State Management Integration

Following AURA's strict state separation principles:

```typescript
// SERVER STATE (Convex) - All persistent data
interface ScheduledPost {
  _id: Id<"scheduledPosts">;
  platform: SocialPlatform;
  title: string;
  content: string;
  scheduledAt: number;
  publishedAt?: number;
  status: "draft" | "scheduled" | "published" | "failed" | "cancelled";
  userId: Id<"users">;
  projectId?: Id<"projects">;
  campaignId?: Id<"campaigns">;
  metadata: {
    images?: string[];
    hashtags?: string[];
    mentions?: string[];
    location?: string;
  };
  analytics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
  createdAt: number;
  updatedAt: number;
}

// CLIENT STATE (Zustand) - UI concerns only
interface CalendarUIStore {
  selectedDate: Date | null;
  viewMode: "month" | "week" | "day";
  selectedPlatforms: SocialPlatform[];
  showFilters: boolean;
  isModalOpen: boolean;
  draggedPost: ScheduledPost | null;
  
  // UI actions
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: "month" | "week" | "day") => void;
  togglePlatformFilter: (platform: SocialPlatform) => void;
  setShowFilters: (show: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  setDraggedPost: (post: ScheduledPost | null) => void;
}

// COMPONENT STATE (useState) - Ephemeral UI state
const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
const [isDragging, setIsDragging] = useState(false);
const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
```

### Data Flow Architecture

```
Calendar Component → useCalendarPosts Hook → Convex Query → Real-time Updates
        ↓                    ↓                    ↓              ↓
Social Media Agents → Schedule Post → Convex Mutation → Calendar Sync
        ↓                    ↓                    ↓              ↓
Post Publishing → Status Update → Real-time Notification → UI Update
```

## Component Implementation

### Main Calendar Component

```typescript
// CALENDAR COMPONENT - Main interface with real-time sync
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/calendar/Calendar.tsx

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useCalendarStore } from '@/lib/store/calendar';
import { useCalendarPosts } from '@/lib/hooks/useCalendarPosts';
import { CalendarDay } from './CalendarDay';
import { PostDetails } from './_components/postDetails';
import { SchedulePostModal } from './_components/schedulePostModal';
import { PlatformFilters } from './_components/platformFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';

interface CalendarProps {
  className?: string;
}

export function Calendar({ className }: CalendarProps) {
  const { user } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Calendar UI state (Client State)
  const {
    selectedDate,
    viewMode,
    selectedPlatforms,
    showFilters,
    isModalOpen,
    setSelectedDate,
    setShowFilters,
    openModal,
    closeModal
  } = useCalendarStore();
  
  // Scheduled posts data (Server State)
  const { 
    posts, 
    isLoading, 
    createPost, 
    updatePost, 
    deletePost 
  } = useCalendarPosts({
    userId: user?.id,
    startDate: startOfMonth(startOfWeek(currentMonth)),
    endDate: endOfMonth(endOfWeek(currentMonth)),
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined
  });
  
  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  }, [currentMonth]);
  
  // Get posts for specific date
  const getPostsForDate = useCallback((date: Date) => {
    return posts.filter(post => 
      isSameDay(new Date(post.scheduledAt), date)
    );
  }, [posts]);
  
  // Navigation handlers
  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date());
  
  // Post scheduling handler
  const handleSchedulePost = async (postData: Partial<ScheduledPost>) => {
    try {
      await createPost({
        ...postData,
        userId: user?.id,
        scheduledAt: selectedDate?.getTime() || Date.now(),
        status: 'scheduled' as const,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      closeModal();
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border border-[#858585] border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col h-full bg-[#1e1e1e]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[#cccccc]">
            Social Media Calendar
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="text-[#858585] hover:text-[#cccccc]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="text-[#007acc] hover:text-[#4ec9b0] min-w-[120px]"
            >
              {format(currentMonth, 'MMMM yyyy')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="text-[#858585] hover:text-[#cccccc]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-[#858585] hover:text-[#cccccc]"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={openModal}
            size="sm"
            className="bg-[#007acc] hover:bg-[#005a9a] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>
      </div>
      
      {/* Platform Filters */}
      {showFilters && (
        <div className="p-4 border-b border-[#2d2d2d]">
          <PlatformFilters />
        </div>
      )}
      
      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-[#858585]">
                {day}
              </span>
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              posts={getPostsForDate(day)}
              isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
              isCurrentMonth={day.getMonth() === currentMonth.getMonth()}
              onSelect={setSelectedDate}
              onSchedulePost={(date) => {
                setSelectedDate(date);
                openModal();
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Post Details Sidebar */}
      {selectedDate && (
        <PostDetails
          date={selectedDate}
          posts={getPostsForDate(selectedDate)}
          onUpdatePost={updatePost}
          onDeletePost={deletePost}
        />
      )}
      
      {/* Schedule Post Modal */}
      <SchedulePostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSchedule={handleSchedulePost}
        selectedDate={selectedDate}
      />
    </div>
  );
}
```

### Calendar Day Component

```typescript
// CALENDAR DAY COMPONENT - Individual day with post indicators
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/calendar/CalendarDay.tsx

'use client';

import { memo, useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { PostIndicator } from './PostIndicator';
import { ScheduledPost, SocialPlatform } from '@/types/calendar';

interface CalendarDayProps {
  date: Date;
  posts: ScheduledPost[];
  isSelected: boolean;
  isCurrentMonth: boolean;
  onSelect: (date: Date) => void;
  onSchedulePost: (date: Date) => void;
}

// Platform color mapping
const platformColors: Record<SocialPlatform, string> = {
  'twitter': '#1DA1F2',
  'facebook': '#1877F2', 
  'instagram': '#E4405F',
  'linkedin': '#0A66C2',
  'tiktok': '#000000',
  'youtube': '#FF0000',
  'reddit': '#FF4500'
};

export const CalendarDay = memo(({ 
  date, 
  posts, 
  isSelected, 
  isCurrentMonth, 
  onSelect,
  onSchedulePost 
}: CalendarDayProps) => {
  
  // Group posts by platform for better visual organization
  const postsByPlatform = useMemo(() => {
    return posts.reduce((acc, post) => {
      if (!acc[post.platform]) {
        acc[post.platform] = [];
      }
      acc[post.platform].push(post);
      return acc;
    }, {} as Record<SocialPlatform, ScheduledPost[]>);
  }, [posts]);
  
  // Get platform indicators (max 3, then show count)
  const platformIndicators = useMemo(() => {
    const platforms = Object.keys(postsByPlatform) as SocialPlatform[];
    const visiblePlatforms = platforms.slice(0, 3);
    const remainingCount = Math.max(0, platforms.length - 3);
    
    return {
      visible: visiblePlatforms,
      remaining: remainingCount
    };
  }, [postsByPlatform]);
  
  const dayNumber = format(date, 'd');
  const hasScheduledPosts = posts.length > 0;
  const isCurrentDay = isToday(date);
  
  return (
    <div
      className={cn(
        "relative h-24 border border-[#2d2d2d] rounded-lg p-1 cursor-pointer transition-all duration-200",
        "hover:border-[#007acc]/50 hover:bg-[#2d2d2d]/30",
        isSelected && "border-[#007acc] bg-[#007acc]/10",
        !isCurrentMonth && "opacity-40",
        isCurrentDay && "bg-[#4ec9b0]/10 border-[#4ec9b0]/30"
      )}
      onClick={() => onSelect(date)}
      onDoubleClick={() => onSchedulePost(date)}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium",
            isCurrentDay ? "text-[#4ec9b0]" : "text-[#cccccc]",
            !isCurrentMonth && "text-[#858585]"
          )}
        >
          {dayNumber}
        </span>
        
        {/* Total Posts Count */}
        {hasScheduledPosts && (
          <span className="text-xs text-[#858585] bg-[#2d2d2d] px-1 rounded">
            {posts.length}
          </span>
        )}
      </div>
      
      {/* Platform Indicators */}
      {hasScheduledPosts && (
        <div className="mt-1 space-y-1">
          {platformIndicators.visible.map(platform => (
            <PostIndicator
              key={platform}
              platform={platform}
              posts={postsByPlatform[platform]}
              color={platformColors[platform]}
            />
          ))}
          
          {/* Remaining Platforms Count */}
          {platformIndicators.remaining > 0 && (
            <div className="text-xs text-[#858585] bg-[#2d2d2d] px-1 py-0.5 rounded text-center">
              +{platformIndicators.remaining} more
            </div>
          )}
        </div>
      )}
      
      {/* Empty State Hint */}
      {!hasScheduledPosts && isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-[#858585] text-center">
            Double-click to<br />schedule post
          </span>
        </div>
      )}
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';
```

### Post Indicator Component

```typescript
// POST INDICATOR COMPONENT - Visual post status indicators
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/calendar/PostIndicator.tsx

'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { ScheduledPost, SocialPlatform } from '@/types/calendar';

interface PostIndicatorProps {
  platform: SocialPlatform;
  posts: ScheduledPost[];
  color: string;
}

export const PostIndicator = memo(({ platform, posts, color }: PostIndicatorProps) => {
  // Calculate status distribution
  const statusCounts = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get primary status (most common)
  const primaryStatus = Object.entries(statusCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'scheduled';
  
  const getStatusIcon = (status: string) => {
    const iconClass = "w-2.5 h-2.5";
    
    switch (status) {
      case 'published':
        return <CheckCircle className={cn(iconClass, "text-[#4ec9b0]")} />;
      case 'scheduled':
        return <Clock className={cn(iconClass, "text-[#ffcc02]")} />;
      case 'failed':
        return <XCircle className={cn(iconClass, "text-[#f44747]")} />;
      case 'draft':
        return <AlertCircle className={cn(iconClass, "text-[#858585]")} />;
      default:
        return <Clock className={cn(iconClass, "text-[#858585]")} />;
    }
  };
  
  const getPlatformEmoji = (platform: SocialPlatform) => {
    switch (platform) {
      case 'twitter': return '🐦';
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      case 'reddit': return '🔶';
      default: return '📱';
    }
  };
  
  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 rounded text-xs"
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `2px solid ${color}`
      }}
    >
      <span>{getPlatformEmoji(platform)}</span>
      <span className="text-[#cccccc] font-mono flex-1 truncate">
        {posts.length > 1 ? `${posts.length} posts` : posts[0]?.title || 'Untitled'}
      </span>
      {getStatusIcon(primaryStatus)}
    </div>
  );
});

PostIndicator.displayName = 'PostIndicator';
```

## Custom Hooks

### Calendar Posts Hook

```typescript
// CALENDAR POSTS HOOK - Server state management for scheduled posts
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useCalendarPosts.ts

'use client';

import { useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ScheduledPost, SocialPlatform } from '@/types/calendar';

interface UseCalendarPostsOptions {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  platforms?: SocialPlatform[];
  status?: ScheduledPost['status'][];
}

interface UseCalendarPostsReturn {
  posts: ScheduledPost[];
  isLoading: boolean;
  error: string | null;
  createPost: (post: Partial<ScheduledPost>) => Promise<Id<"scheduledPosts">>;
  updatePost: (id: Id<"scheduledPosts">, updates: Partial<ScheduledPost>) => Promise<void>;
  deletePost: (id: Id<"scheduledPosts">) => Promise<void>;
  reschedulePost: (id: Id<"scheduledPosts">, newDate: Date) => Promise<void>;
}

export function useCalendarPosts(options: UseCalendarPostsOptions = {}): UseCalendarPostsReturn {
  const { userId, startDate, endDate, platforms, status } = options;
  
  // Query scheduled posts with filters
  const posts = useQuery(api.scheduledPosts.list, {
    userId,
    startDate: startDate?.getTime(),
    endDate: endDate?.getTime(),
    platforms,
    status
  });
  
  // Mutations for post management
  const createPostMutation = useMutation(api.scheduledPosts.create);
  const updatePostMutation = useMutation(api.scheduledPosts.update);
  const deletePostMutation = useMutation(api.scheduledPosts.delete);
  
  // Memoize filtered and sorted posts
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    
    return posts
      .filter(post => {
        // Apply client-side filters if needed
        if (platforms && platforms.length > 0) {
          return platforms.includes(post.platform);
        }
        return true;
      })
      .sort((a, b) => a.scheduledAt - b.scheduledAt);
  }, [posts, platforms]);
  
  // Create post handler
  const createPost = async (postData: Partial<ScheduledPost>): Promise<Id<"scheduledPosts">> => {
    try {
      const postId = await createPostMutation({
        platform: postData.platform!,
        title: postData.title || '',
        content: postData.content || '',
        scheduledAt: postData.scheduledAt || Date.now(),
        status: postData.status || 'draft',
        userId: postData.userId as Id<"users">,
        projectId: postData.projectId,
        campaignId: postData.campaignId,
        metadata: postData.metadata || {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      return postId;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw new Error('Failed to create scheduled post');
    }
  };
  
  // Update post handler
  const updatePost = async (id: Id<"scheduledPosts">, updates: Partial<ScheduledPost>): Promise<void> => {
    try {
      await updatePostMutation({
        id,
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to update post:', error);
      throw new Error('Failed to update scheduled post');
    }
  };
  
  // Delete post handler
  const deletePost = async (id: Id<"scheduledPosts">): Promise<void> => {
    try {
      await deletePostMutation({ id });
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw new Error('Failed to delete scheduled post');
    }
  };
  
  // Reschedule post handler
  const reschedulePost = async (id: Id<"scheduledPosts">, newDate: Date): Promise<void> => {
    try {
      await updatePostMutation({
        id,
        scheduledAt: newDate.getTime(),
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to reschedule post:', error);
      throw new Error('Failed to reschedule post');
    }
  };
  
  return {
    posts: filteredPosts,
    isLoading: posts === undefined,
    error: null, // Convex handles errors automatically
    createPost,
    updatePost,
    deletePost,
    reschedulePost
  };
}
```

### Calendar Sync Hook

```typescript
// CALENDAR SYNC HOOK - Real-time synchronization with agent workflows
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useCalendarSync.ts

'use client';

import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { SocialPlatform } from '@/types/calendar';

interface SyncPostToCalendarParams {
  platform: SocialPlatform;
  title: string;
  content: string;
  scheduledAt: number;
  postId?: string;
  fileId?: Id<"files">;
  projectId?: Id<"projects">;
  userId: string;
  campaignId?: Id<"campaigns">;
}

interface UseCalendarSyncReturn {
  syncPostToCalendar: (params: SyncPostToCalendarParams) => Promise<Id<"scheduledPosts">>;
  updatePostStatusInCalendar: (postId: string, status: string, publishedAt?: number) => Promise<void>;
  removePostFromCalendar: (postId: string) => Promise<void>;
  syncCampaignToCalendar: (campaignId: Id<"campaigns">) => Promise<void>;
}

export function useCalendarSync(): UseCalendarSyncReturn {
  const createScheduledPost = useMutation(api.scheduledPosts.create);
  const updateScheduledPost = useMutation(api.scheduledPosts.updateByPostId);
  const deleteScheduledPost = useMutation(api.scheduledPosts.deleteByPostId);
  const syncCampaign = useMutation(api.campaigns.syncToCalendar);
  
  // Sync individual post to calendar
  const syncPostToCalendar = useCallback(async (params: SyncPostToCalendarParams) => {
    try {
      const scheduledPostId = await createScheduledPost({
        platform: params.platform,
        title: params.title,
        content: params.content,
        scheduledAt: params.scheduledAt,
        status: 'scheduled',
        userId: params.userId as Id<"users">,
        projectId: params.projectId,
        campaignId: params.campaignId,
        metadata: {
          originalPostId: params.postId,
          fileId: params.fileId,
          syncedAt: Date.now()
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      console.log(`Post synced to calendar: ${params.title}`);
      return scheduledPostId;
    } catch (error) {
      console.error('Failed to sync post to calendar:', error);
      throw new Error('Calendar sync failed');
    }
  }, [createScheduledPost]);
  
  // Update post status in calendar (when published, failed, etc.)
  const updatePostStatusInCalendar = useCallback(async (
    postId: string, 
    status: string, 
    publishedAt?: number
  ) => {
    try {
      await updateScheduledPost({
        postId,
        status: status as any,
        publishedAt,
        updatedAt: Date.now()
      });
      
      console.log(`Calendar post status updated: ${postId} -> ${status}`);
    } catch (error) {
      console.error('Failed to update calendar post status:', error);
      // Don't throw - this shouldn't block the publishing workflow
    }
  }, [updateScheduledPost]);
  
  // Remove post from calendar
  const removePostFromCalendar = useCallback(async (postId: string) => {
    try {
      await deleteScheduledPost({ postId });
      console.log(`Post removed from calendar: ${postId}`);
    } catch (error) {
      console.error('Failed to remove post from calendar:', error);
      throw new Error('Failed to remove post from calendar');
    }
  }, [deleteScheduledPost]);
  
  // Sync entire campaign to calendar
  const syncCampaignToCalendar = useCallback(async (campaignId: Id<"campaigns">) => {
    try {
      await syncCampaign({ campaignId });
      console.log(`Campaign synced to calendar: ${campaignId}`);
    } catch (error) {
      console.error('Failed to sync campaign to calendar:', error);
      throw new Error('Campaign calendar sync failed');
    }
  }, [syncCampaign]);
  
  return {
    syncPostToCalendar,
    updatePostStatusInCalendar,
    removePostFromCalendar,
    syncCampaignToCalendar
  };
}
```

## Database Schema

### Enhanced Schema for Calendar Integration

```typescript
// CONVEX SCHEMA - Calendar and scheduled posts
// /Users/matthewsimon/Projects/AURA/AURA/convex/schema.ts

export default defineSchema({
  // Scheduled posts for calendar integration
  scheduledPosts: defineTable({
    platform: v.union(
      v.literal("twitter"),
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("linkedin"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("reddit")
    ),
    title: v.string(),
    content: v.string(),
    scheduledAt: v.number(),
    publishedAt: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    
    // Relationships
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    campaignId: v.optional(v.id("campaigns")),
    fileId: v.optional(v.id("files")),
    
    // Content metadata
    metadata: v.object({
      images: v.optional(v.array(v.string())),
      hashtags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      originalPostId: v.optional(v.string()),
      syncedAt: v.optional(v.number())
    }),
    
    // Publishing analytics
    analytics: v.optional(v.object({
      views: v.optional(v.number()),
      likes: v.optional(v.number()),
      shares: v.optional(v.number()),
      comments: v.optional(v.number()),
      clickThroughRate: v.optional(v.number()),
      engagementRate: v.optional(v.number())
    })),
    
    // Error tracking
    error: v.optional(v.object({
      message: v.string(),
      code: v.optional(v.string()),
      timestamp: v.number(),
      retryCount: v.optional(v.number())
    })),
    
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_scheduled_at", ["scheduledAt"])
    .index("by_status", ["status"])
    .index("by_platform", ["platform"])
    .index("by_project", ["projectId"])
    .index("by_campaign", ["campaignId"])
    .index("by_user_date", ["userId", "scheduledAt"]),
    
  // Campaigns for organized content planning
  campaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    
    // Campaign dates
    startDate: v.number(),
    endDate: v.number(),
    
    // Campaign settings
    settings: v.object({
      platforms: v.array(v.string()),
      autoPublish: v.boolean(),
      timezone: v.optional(v.string()),
      tags: v.optional(v.array(v.string()))
    }),
    
    // Campaign status
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("archived")
    ),
    
    // Analytics
    analytics: v.optional(v.object({
      totalPosts: v.number(),
      publishedPosts: v.number(),
      totalReach: v.optional(v.number()),
      totalEngagement: v.optional(v.number())
    })),
    
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_dates", ["startDate", "endDate"])
});
```

## Agent Integration

### Social Media Agent Calendar Sync

```typescript
// SOCIAL MEDIA AGENT - Calendar integration example
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/twitterAgent.ts

export class TwitterAgent extends BaseAgent {
  readonly id = "twitter-agent";
  readonly name = "Twitter/X Agent";
  readonly description = "Create and schedule Twitter/X posts with calendar integration";
  readonly icon = "🐦";
  readonly isPremium = true;

  async execute(
    tool: AgentTool, 
    input: string, 
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    
    try {
      // Parse tweet content and scheduling request
      const tweetData = await this.parseTweetRequest(input);
      
      if (tweetData.shouldSchedule && tweetData.scheduledAt) {
        return await this.scheduleTwitterPost(tweetData, mutations, context);
      }
      
      // Immediate posting
      return await this.publishTwitterPost(tweetData, mutations, context);
      
    } catch (error) {
      console.error("Twitter Agent error:", error);
      return {
        success: false,
        message: `Twitter post failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async scheduleTwitterPost(
    tweetData: ParsedTweetData,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    
    // Create scheduled post in calendar
    const scheduledPostId = await mutations.createScheduledPost({
      platform: 'twitter',
      title: tweetData.content.slice(0, 50) + '...',
      content: tweetData.content,
      scheduledAt: tweetData.scheduledAt!,
      status: 'scheduled',
      userId: context?.userId as Id<"users">,
      projectId: tweetData.projectId,
      campaignId: tweetData.campaignId,
      metadata: {
        hashtags: tweetData.hashtags,
        mentions: tweetData.mentions,
        images: tweetData.images,
        syncedAt: Date.now()
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    // Store in social posts for actual publishing
    const socialPostId = await mutations.createSocialPost({
      platform: 'twitter',
      content: tweetData.content,
      scheduledAt: tweetData.scheduledAt!,
      userId: context?.userId as Id<"users">,
      calendarPostId: scheduledPostId
    });
    
    // Send confirmation to chat
    await mutations.addChatMessage({
      role: 'assistant',
      content: `🐦 Twitter post scheduled for ${new Date(tweetData.scheduledAt!).toLocaleString()}

Post preview:
${tweetData.content}

The post has been added to your calendar and will be automatically published at the scheduled time.`,
      sessionId: context?.sessionId,
      userId: context?.userId,
      operation: {
        type: 'post_scheduled',
        details: {
          platform: 'twitter',
          scheduledAt: tweetData.scheduledAt,
          postId: socialPostId,
          calendarPostId: scheduledPostId
        }
      }
    });
    
    return {
      success: true,
      message: `Twitter post scheduled for ${new Date(tweetData.scheduledAt!).toLocaleString()}`,
      data: {
        postId: socialPostId,
        calendarPostId: scheduledPostId,
        scheduledAt: tweetData.scheduledAt
      }
    };
  }
}
```

## Integration Points

### Social Media Editors with Calendar Sync

```typescript
// SOCIAL MEDIA EDITOR - Reddit example with calendar sync
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/socialPlatforms/redditPostEditor.tsx

'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCalendarSync } from '@/lib/hooks/useCalendarSync';
import { useUser } from '@clerk/nextjs';

export function RedditPostEditor() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    subreddit: '',
    publishAt: null as Date | null,
    isScheduled: false
  });
  
  const createRedditPost = useMutation(api.socialPosts.createRedditPost);
  const { syncPostToCalendar, updatePostStatusInCalendar } = useCalendarSync();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create the social media post
      const postId = await createRedditPost({
        title: formData.title,
        content: formData.text,
        subreddit: formData.subreddit,
        scheduledAt: formData.publishAt?.getTime(),
        userId: user?.id,
        status: formData.isScheduled ? 'scheduled' : 'draft'
      });
      
      // Sync to calendar if scheduled
      if (formData.isScheduled && formData.publishAt) {
        await syncPostToCalendar({
          platform: 'reddit',
          title: formData.title,
          content: formData.text,
          scheduledAt: formData.publishAt.getTime(),
          postId: postId,
          userId: user?.id!
        });
        
        console.log('Reddit post synced to calendar');
      }
      
      // Handle immediate publishing
      if (!formData.isScheduled) {
        // Publish immediately
        const publishResult = await publishToReddit(postId);
        
        if (publishResult.success) {
          await updatePostStatusInCalendar(postId, 'published', Date.now());
        } else {
          await updatePostStatusInCalendar(postId, 'failed');
        }
      }
      
      // Reset form
      setFormData({
        title: '',
        text: '',
        subreddit: '',
        publishAt: null,
        isScheduled: false
      });
      
    } catch (error) {
      console.error('Reddit post creation failed:', error);
    }
  };
  
  // Component JSX...
}
```

## Testing

### Calendar Component Tests

```typescript
// CALENDAR TESTING SUITE
// /Users/matthewsimon/Projects/AURA/AURA/tests/components/calendar/Calendar.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calendar } from '@/app/_components/calendar/Calendar';
import { useCalendarPosts } from '@/lib/hooks/useCalendarPosts';
import { useUser } from '@clerk/nextjs';

// Mock dependencies
jest.mock('@/lib/hooks/useCalendarPosts');
jest.mock('@clerk/nextjs');

const mockUseCalendarPosts = useCalendarPosts as jest.MockedFunction<typeof useCalendarPosts>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('Calendar Component', () => {
  const mockPosts = [
    {
      _id: 'post-1',
      platform: 'twitter' as const,
      title: 'Test Tweet',
      content: 'This is a test tweet',
      scheduledAt: Date.now() + 86400000, // Tomorrow
      status: 'scheduled' as const,
      userId: 'user-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {}
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
      isSignedIn: true
    } as any);
    
    mockUseCalendarPosts.mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      error: null,
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
      reschedulePost: jest.fn()
    });
  });
  
  it('renders calendar interface correctly', () => {
    render(<Calendar />);
    
    expect(screen.getByText('Social Media Calendar')).toBeInTheDocument();
    expect(screen.getByText('Schedule Post')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });
  
  it('displays scheduled posts on correct dates', () => {
    render(<Calendar />);
    
    // Find tomorrow's date and check for post indicator
    const tomorrow = new Date(Date.now() + 86400000);
    const dayElement = screen.getByText(tomorrow.getDate().toString());
    
    expect(dayElement.closest('.relative')).toHaveClass('border-[#007acc]');
  });
  
  it('opens scheduling modal when clicking Schedule Post', () => {
    render(<Calendar />);
    
    fireEvent.click(screen.getByText('Schedule Post'));
    
    expect(screen.getByText('Schedule New Post')).toBeInTheDocument();
  });
  
  it('handles date selection correctly', async () => {
    render(<Calendar />);
    
    const tomorrow = new Date(Date.now() + 86400000);
    const dayElement = screen.getByText(tomorrow.getDate().toString());
    
    fireEvent.click(dayElement);
    
    await waitFor(() => {
      expect(screen.getByText('Test Tweet')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```typescript
// INTEGRATION TESTS - Calendar workflow
// /Users/matthewsimon/Projects/AURA/AURA/tests/integration/calendar-scheduling.test.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Scheduling Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="activity-bar"]');
  });
  
  test('schedules post via calendar interface', async ({ page }) => {
    // Open calendar
    await page.click('[data-testid="calendar-button"]');
    await page.waitForSelector('[data-testid="calendar-component"]');
    
    // Click Schedule Post button
    await page.click('[data-testid="schedule-post-button"]');
    
    // Fill out scheduling form
    await page.fill('[data-testid="post-title"]', 'Test scheduled post');
    await page.fill('[data-testid="post-content"]', 'This is a test post for calendar integration');
    await page.selectOption('[data-testid="platform-select"]', 'twitter');
    
    // Set future date
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="tomorrow-date"]');
    await page.fill('[data-testid="time-input"]', '14:30');
    
    // Submit
    await page.click('[data-testid="schedule-button"]');
    
    // Verify post appears in calendar
    await expect(page.locator('[data-testid="post-indicator"]')).toBeVisible();
    await expect(page.locator('text=Test scheduled post')).toBeVisible();
  });
  
  test('syncs agent-created post to calendar', async ({ page }) => {
    // Open terminal
    await page.click('[data-testid="terminal-toggle"]');
    
    // Execute Twitter agent with scheduling
    await page.fill('[data-testid="terminal-input"]', '/twitter "Hello world!" schedule tomorrow 2pm');
    await page.press('[data-testid="terminal-input"]', 'Enter');
    
    // Wait for agent response
    await expect(page.locator('text=Twitter post scheduled')).toBeVisible();
    
    // Check calendar shows the post
    await page.click('[data-testid="calendar-button"]');
    await expect(page.locator('[data-testid="twitter-post-indicator"]')).toBeVisible();
  });
  
  test('handles post status updates in real-time', async ({ page }) => {
    // Create a post scheduled for immediate publishing
    await page.click('[data-testid="calendar-button"]');
    await page.click('[data-testid="schedule-post-button"]');
    
    // Fill form for immediate publishing
    await page.fill('[data-testid="post-content"]', 'Immediate post test');
    await page.selectOption('[data-testid="platform-select"]', 'twitter');
    await page.click('[data-testid="publish-now-button"]');
    
    // Wait for status to change from "publishing" to "published"
    await expect(page.locator('[data-testid="post-status-publishing"]')).toBeVisible();
    await expect(page.locator('[data-testid="post-status-published"]')).toBeVisible({ timeout: 10000 });
  });
});
```

## Performance Optimization

### Calendar Virtualization

```typescript
// CALENDAR VIRTUALIZATION - Handle large datasets efficiently
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/calendar/_components/virtualizedCalendar.tsx

import { FixedSizeGrid as Grid } from 'react-window';
import { memo, useMemo } from 'react';

interface VirtualizedCalendarProps {
  posts: ScheduledPost[];
  startDate: Date;
  endDate: Date;
  onDateSelect: (date: Date) => void;
}

export const VirtualizedCalendar = memo(({
  posts,
  startDate,
  endDate,
  onDateSelect
}: VirtualizedCalendarProps) => {
  
  // Group posts by date for efficient lookup
  const postsByDate = useMemo(() => {
    return posts.reduce((acc, post) => {
      const dateKey = new Date(post.scheduledAt).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(post);
      return acc;
    }, {} as Record<string, ScheduledPost[]>);
  }, [posts]);
  
  // Calendar cell renderer
  const Cell = useMemo(() => ({ 
    columnIndex, 
    rowIndex, 
    style 
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const date = calculateDateFromIndices(columnIndex, rowIndex, startDate);
    const dayPosts = postsByDate[date.toDateString()] || [];
    
    return (
      <div style={style}>
        <CalendarDay
          date={date}
          posts={dayPosts}
          onSelect={onDateSelect}
        />
      </div>
    );
  }, [postsByDate, startDate, onDateSelect]);
  
  return (
    <Grid
      columnCount={7} // Days of week
      rowCount={6} // Max weeks in month
      columnWidth={140}
      rowHeight={120}
      height={720}
      width={980}
    >
      {Cell}
    </Grid>
  );
});

function calculateDateFromIndices(col: number, row: number, startDate: Date): Date {
  const dayOffset = row * 7 + col;
  const result = new Date(startDate);
  result.setDate(result.getDate() + dayOffset);
  return result;
}
```

## Premium Features

### Advanced Analytics Dashboard

```typescript
// PREMIUM ANALYTICS - Calendar performance insights
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/calendar/_components/analyticsPanel.tsx

'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsPanelProps {
  userId: string;
  dateRange: { start: Date; end: Date };
}

export function AnalyticsPanel({ userId, dateRange }: AnalyticsPanelProps) {
  const analytics = useQuery(api.analytics.getCalendarInsights, {
    userId,
    startDate: dateRange.start.getTime(),
    endDate: dateRange.end.getTime()
  });
  
  const chartData = useMemo(() => {
    if (!analytics) return [];
    
    return analytics.dailyMetrics.map(metric => ({
      date: new Date(metric.date).toLocaleDateString(),
      posts: metric.postsPublished,
      engagement: metric.totalEngagement,
      reach: metric.totalReach
    }));
  }, [analytics]);
  
  if (!analytics) {
    return <div className="animate-pulse h-64 bg-[#2d2d2d] rounded" />;
  }
  
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#1e1e1e] border-[#2d2d2d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#858585]">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#cccccc]">
              {analytics.summary.totalPosts}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1e1e1e] border-[#2d2d2d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#858585]">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4ec9b0]">
              {analytics.summary.publishedPosts}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1e1e1e] border-[#2d2d2d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#858585]">Total Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#007acc]">
              {analytics.summary.totalReach.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1e1e1e] border-[#2d2d2d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#858585]">Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#ffcc02]">
              {analytics.summary.avgEngagementRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Chart */}
      <Card className="bg-[#1e1e1e] border-[#2d2d2d]">
        <CardHeader>
          <CardTitle className="text-[#cccccc]">Publishing Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#858585" />
                <YAxis stroke="#858585" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #007acc',
                    color: '#cccccc'
                  }}
                />
                <Bar dataKey="posts" fill="#007acc" />
                <Bar dataKey="engagement" fill="#4ec9b0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Future Enhancements

### Planned Features

- [ ] **Drag & Drop Rescheduling**: Visual post rescheduling with drag and drop
- [ ] **Campaign Templates**: Pre-built content calendars for common campaigns
- [ ] **Team Collaboration**: Shared calendars with role-based permissions
- [ ] **AI Content Suggestions**: Intelligent post timing and content recommendations
- [ ] **Bulk Import/Export**: CSV/JSON import for large content calendars
- [ ] **Advanced Filtering**: Complex queries with multiple criteria
- [ ] **Mobile App Integration**: Native mobile calendar with push notifications
- [ ] **Third-party Integrations**: Google Calendar, Outlook, and other calendar services
- [ ] **A/B Testing**: Post performance comparison tools
- [ ] **Automated Reporting**: Scheduled analytics reports

### Technical Improvements

- [ ] **Offline Support**: Local caching for offline calendar access
- [ ] **Real-time Collaboration**: Live cursor tracking and concurrent editing
- [ ] **Performance Monitoring**: Calendar loading and interaction metrics
- [ ] **Advanced Caching**: Intelligent prefetching and cache invalidation
- [ ] **Webhook Integration**: Real-time status updates from social platforms

## Contributing

When contributing to the calendar system:

1. **Follow AURA Patterns**: Maintain consistency with existing architecture
2. **Real-time First**: Ensure all updates sync immediately via Convex
3. **Performance Conscious**: Consider impact on large datasets and long date ranges
4. **Accessibility**: Maintain keyboard navigation and screen reader support
5. **Mobile Responsive**: Ensure calendar works well on all screen sizes
6. **Test Coverage**: Include comprehensive tests for new features

## Conclusion

The AURA Calendar Integration provides a comprehensive solution for social media content planning and management. Built on Convex's real-time database with proper state management, it offers seamless synchronization between content creation, scheduling, and visual planning.

Key benefits:
- **Real-time Synchronization**: Instant updates across all connected interfaces
- **Multi-platform Support**: Unified view of content across all social media platforms  
- **Agent Integration**: Seamless workflow automation with calendar sync
- **Premium Analytics**: Advanced insights for content performance optimization
- **Team Collaboration**: Shared planning with role-based access control

This implementation ensures that AURA users have access to professional-grade content planning tools that scale with their social media strategy and integrate seamlessly with the broader AURA platform ecosystem.
