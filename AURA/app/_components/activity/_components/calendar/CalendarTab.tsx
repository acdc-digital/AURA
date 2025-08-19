// CALENDAR TAB COMPONENT - Main calendar view following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/calendar/CalendarTab.tsx

"use client";

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarStore } from '@/lib/store/calendar';
import { useCalendarPosts } from '@/lib/hooks/useCalendarPosts';

interface CalendarTabProps {
  className?: string;
}

interface Post {
  _id: string;
  fileType: string;
  status: string;
  title?: string;
  scheduledFor?: number;
}

interface WeekDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: Post[];
}

export default function CalendarTab({ className = "" }: CalendarTabProps) {
  // Calendar store for UI state
  const {
    currentView,
    currentDate,
    navigateNext,
    navigatePrev,
    navigateToToday,
    openCreatePostModal,
    filters,
  } = useCalendarStore();

  // Calendar posts hook for data
  const {
    allPosts,
    isLoading,
  } = useCalendarPosts();

  // Generate calendar data based on current view
  const calendarData = useMemo(() => {
    if (!allPosts) return [];

    if (currentView === 'week') {
      return generateWeekView(currentDate, allPosts, filters);
    } else if (currentView === 'month') {
      return generateMonthView(currentDate, allPosts, filters);
    }
    // Other views will be implemented later
    return [];
  }, [currentView, currentDate, allPosts, filters]);

  const formatDateHeader = () => {
    if (currentView === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${endOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    } else if (currentView === 'month') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (currentView === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    return '';
  };

  const handleDateClick = (date: Date) => {
    openCreatePostModal(date);
  };

  if (isLoading) {
    return (
      <div className={`h-full bg-[#252526] flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4">
          <CalendarIcon className="w-12 h-12 text-[#666] mx-auto" />
          <div className="text-[#cccccc]">Loading calendar...</div>
          <div className="animate-pulse space-y-2">
            <div className="h-2 bg-[#333] rounded w-32 mx-auto"></div>
            <div className="h-2 bg-[#333] rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-[#252526] flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#333] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[#cccccc] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar - {formatDateHeader()}
          </h2>
          
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={navigatePrev}
              className="h-8 w-8 p-0 hover:bg-[#2d2d30]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={navigateToToday}
              className="h-8 px-3 text-xs hover:bg-[#2d2d30]"
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={navigateNext}
              className="h-8 w-8 p-0 hover:bg-[#2d2d30]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Active filters indicator */}
          {(filters.platform !== 'all' || filters.status !== 'all') && (
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400">Filtered</span>
            </div>
          )}
          
          <Button
            size="sm"
            onClick={() => openCreatePostModal()}
            className="h-8 px-3 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Post
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 p-4">
        {currentView === 'week' && (
          <WeekView data={calendarData} onDateClick={handleDateClick} />
        )}
        {currentView === 'month' && (
          <MonthView data={calendarData} onDateClick={handleDateClick} />
        )}
        {currentView === 'day' && (
          <DayView data={calendarData} onDateClick={handleDateClick} />
        )}
        {currentView === 'agenda' && (
          <AgendaView data={calendarData} onDateClick={handleDateClick} />
        )}
      </div>
    </div>
  );
}

// Week view component
function WeekView({ data, onDateClick }: { data: WeekDay[], onDateClick: (date: Date) => void }) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="h-full">
      {/* Week header */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map((day, index) => (
          <div key={day} className="p-2 text-center">
            <div className="text-xs font-medium text-[#969696] mb-1">{day}</div>
            {data[index] && (
              <div className={`text-sm ${data[index].isToday ? 'text-blue-400 font-semibold' : 'text-[#cccccc]'}`}>
                {data[index].date.getDate()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Week content */}
      <div className="grid grid-cols-7 gap-px flex-1">
        {data.map((day, index) => (
          <div
            key={index}
            className={`min-h-[200px] p-2 bg-[#1e1e1e] border border-[#333] cursor-pointer hover:bg-[#2d2d30] ${
              day.isToday ? 'ring-1 ring-blue-500' : ''
            }`}
            onClick={() => onDateClick(day.date)}
          >
            <div className="space-y-1">
              {day.posts.slice(0, 3).map((post, postIndex) => (
                <div
                  key={postIndex}
                  className="p-1 bg-[#2d2d30] rounded text-xs hover:bg-[#383838]"
                >
                  <div className="flex items-center gap-1 mb-1">
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
                  <p className="text-[#cccccc] truncate">{post.title || 'Untitled'}</p>
                  {post.scheduledFor && (
                    <p className="text-[#969696] text-xs">
                      {new Date(post.scheduledFor).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              ))}
              {day.posts.length > 3 && (
                <div className="text-xs text-[#969696] text-center py-1">
                  +{day.posts.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Month view component
function MonthView({ data, onDateClick }: { data: WeekDay[], onDateClick: (date: Date) => void }) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="h-full flex flex-col">
      {/* Month header */}
      <div className="grid grid-cols-7 gap-px mb-2 border-b border-[#333] pb-2">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center">
            <div className="text-xs font-semibold text-[#cccccc] uppercase tracking-wide">
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="flex-1 grid grid-rows-6 gap-px">
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-px">
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const cellIndex = weekIndex * 7 + dayIndex;
              const dayData = data[cellIndex];
              
              if (!dayData) return <div key={dayIndex} className="bg-[#1a1a1a]" />;
              
              return (
                <div
                  key={dayIndex}
                  className={`
                    min-h-[120px] p-2 bg-[#1e1e1e] border border-[#333] cursor-pointer transition-colors
                    hover:bg-[#2d2d30] flex flex-col
                    ${dayData.isToday ? 'ring-2 ring-[#007acc] bg-[#094771]' : ''}
                    ${!dayData.isCurrentMonth ? 'opacity-40' : ''}
                  `}
                  onClick={() => onDateClick(dayData.date)}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      text-sm font-medium
                      ${dayData.isToday 
                        ? 'text-white bg-[#007acc] w-6 h-6 rounded-full flex items-center justify-center' 
                        : dayData.isCurrentMonth 
                          ? 'text-[#cccccc]' 
                          : 'text-[#666]'
                      }
                    `}>
                      {dayData.date.getDate()}
                    </span>
                    
                    {/* Post count indicator */}
                    {dayData.posts.length > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-1.5 py-0.5 bg-[#007acc] text-white"
                      >
                        {dayData.posts.length}
                      </Badge>
                    )}
                  </div>

                  {/* Posts preview */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayData.posts.slice(0, 2).map((post, postIndex) => (
                      <div
                        key={postIndex}
                        className="p-1 bg-[#2d2d30] rounded text-xs hover:bg-[#383838] transition-colors"
                      >
                        <div className="flex items-center gap-1 mb-1">
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
                        <p className="text-[#cccccc] truncate text-xs leading-relaxed">
                          {post.title || 'Untitled'}
                        </p>
                        {post.scheduledFor && (
                          <p className="text-[#969696] text-xs">
                            {new Date(post.scheduledFor).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {/* More posts indicator */}
                    {dayData.posts.length > 2 && (
                      <div className="text-xs text-[#969696] text-center py-1 bg-[#2a2a2a] rounded">
                        +{dayData.posts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({ }: { data?: WeekDay[], onDateClick?: (date: Date) => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-[#969696]">
        <Clock className="w-12 h-12 mx-auto mb-4" />
        <p>Day view coming soon...</p>
      </div>
    </div>
  );
}

function AgendaView({ }: { data?: WeekDay[], onDateClick?: (date: Date) => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-[#969696]">
        <CalendarIcon className="w-12 h-12 mx-auto mb-4" />
        <p>Agenda view coming soon...</p>
      </div>
    </div>
  );
}

// Utility function for generating week view calendar data
function generateWeekView(currentDate: Date, posts: Post[], filters: { platform?: string; status?: string }): WeekDay[] {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays: WeekDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    
    // Filter posts for this date
    const dayPosts = posts.filter(post => {
      if (!post.scheduledFor) return false;
      
      const postDate = new Date(post.scheduledFor);
      const isSameDay = postDate.toDateString() === date.toDateString();
      
      // Apply filters
      if (filters.platform !== 'all' && post.fileType !== filters.platform) return false;
      if (filters.status !== 'all' && post.status !== filters.status) return false;
      
      return isSameDay;
    });
    
    weekDays.push({
      date,
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      isToday: date.toDateString() === today.toDateString(),
      posts: dayPosts,
    });
  }
  
  return weekDays;
}

// Utility function for generating month view calendar data
function generateMonthView(currentDate: Date, posts: Post[], filters: { platform?: string; status?: string }): WeekDay[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of the month and first day of the calendar (start of week)
  const firstDayOfMonth = new Date(year, month, 1);
  const startOfCalendar = new Date(firstDayOfMonth);
  startOfCalendar.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
  
  const monthDays: WeekDay[] = [];
  const today = new Date();
  
  // Generate 42 days (6 weeks x 7 days) to fill the entire calendar grid
  for (let i = 0; i < 42; i++) {
    const date = new Date(startOfCalendar);
    date.setDate(startOfCalendar.getDate() + i);
    
    // Filter posts for this date
    const dayPosts = posts.filter(post => {
      if (!post.scheduledFor) return false;
      
      const postDate = new Date(post.scheduledFor);
      const isSameDay = postDate.toDateString() === date.toDateString();
      
      // Apply filters
      if (filters.platform !== 'all' && post.fileType !== filters.platform) return false;
      if (filters.status !== 'all' && post.status !== filters.status) return false;
      
      return isSameDay;
    });
    
    monthDays.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      posts: dayPosts,
    });
  }
  
  return monthDays;
}
