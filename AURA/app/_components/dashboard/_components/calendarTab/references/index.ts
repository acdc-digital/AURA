// Calendar Store (Zustand)
// /Users/matthewsimon/Projects/eac/eac/store/calendar/index.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CalendarStoreState, ScheduledPost } from './types';

export const useCalendarStore = create<CalendarStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        scheduledPosts: [],
        isLoading: false,
        error: null,
        selectedDate: null,
        currentMonth: new Date(),

        // Actions
        loadScheduledPosts: async (userId: string, startDate?: Date, endDate?: Date) => {
          set({ isLoading: true, error: null });
          
          try {
            // This will be handled by the useScheduledPostsFromConvex hook
            // For now, just mark as loaded
            set({ isLoading: false });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to load scheduled posts'
            });
          }
        },

        // Set scheduled posts from Convex
        setScheduledPosts: (posts: ScheduledPost[]) => {
          set({ scheduledPosts: posts });
        },

        addScheduledPost: async (post: Omit<ScheduledPost, '_id' | 'createdAt' | 'updatedAt'>) => {
          try {
            const now = Date.now();
            const newPost: ScheduledPost = {
              ...post,
              _id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: now,
              updatedAt: now,
            };
            
            set(state => ({
              scheduledPosts: [...state.scheduledPosts, newPost]
            }));
            
            return newPost._id;
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to add scheduled post' });
            throw error;
          }
        },

        updateScheduledPost: async (postId: string, updates: Partial<ScheduledPost>) => {
          try {
            set(state => ({
              scheduledPosts: state.scheduledPosts.map(post =>
                post._id === postId
                  ? { ...post, ...updates, updatedAt: Date.now() }
                  : post
              )
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update scheduled post' });
          }
        },

        deleteScheduledPost: async (postId: string) => {
          try {
            set(state => ({
              scheduledPosts: state.scheduledPosts.filter(post => post._id !== postId)
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete scheduled post' });
          }
        },

        // UI Actions
        setSelectedDate: (date: Date | null) => {
          set({ selectedDate: date });
        },

        setCurrentMonth: (date: Date) => {
          set({ currentMonth: new Date(date) });
        },

        // Utility actions
        getPostsByDate: (date: Date) => {
          const posts = get().scheduledPosts;
          const targetDate = new Date(date);
          targetDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          return posts.filter(post => {
            const postDate = new Date(post.scheduledAt);
            return postDate >= targetDate && postDate < nextDay;
          });
        },

        getPostsByDateRange: (startDate: Date, endDate: Date) => {
          const posts = get().scheduledPosts;
          const startTime = startDate.getTime();
          const endTime = endDate.getTime();
          
          return posts.filter(post => 
            post.scheduledAt >= startTime && post.scheduledAt <= endTime
          );
        },

        getPostsByStatus: (status: ScheduledPost['status']) => {
          return get().scheduledPosts.filter(post => post.status === status);
        },

        getPostsByPlatform: (platform: ScheduledPost['platform']) => {
          return get().scheduledPosts.filter(post => post.platform === platform);
        },

        // Clear actions
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'calendar-store',
        partialize: (state) => ({
          selectedDate: state.selectedDate,
          currentMonth: state.currentMonth,
        }),
      }
    ),
    { name: 'calendar-store' }
  )
);

// Selector hooks for better performance
export const useScheduledPosts = () => useCalendarStore(state => state.scheduledPosts);
export const useCalendarIsLoading = () => useCalendarStore(state => state.isLoading);
export const useCalendarError = () => useCalendarStore(state => state.error);
export const useSelectedDate = () => useCalendarStore(state => state.selectedDate);
export const useCurrentMonth = () => useCalendarStore(state => state.currentMonth);

// Individual action hooks for stable references
export const useLoadScheduledPosts = () => useCalendarStore(state => state.loadScheduledPosts);
export const useSetScheduledPosts = () => useCalendarStore(state => state.setScheduledPosts);
export const useAddScheduledPost = () => useCalendarStore(state => state.addScheduledPost);
export const useUpdateScheduledPost = () => useCalendarStore(state => state.updateScheduledPost);
export const useDeleteScheduledPost = () => useCalendarStore(state => state.deleteScheduledPost);
export const useSetSelectedDate = () => useCalendarStore(state => state.setSelectedDate);
export const useSetCurrentMonth = () => useCalendarStore(state => state.setCurrentMonth);
export const useGetPostsByDate = () => useCalendarStore(state => state.getPostsByDate);
export const useGetPostsByDateRange = () => useCalendarStore(state => state.getPostsByDateRange);
export const useGetPostsByStatus = () => useCalendarStore(state => state.getPostsByStatus);
export const useGetPostsByPlatform = () => useCalendarStore(state => state.getPostsByPlatform);
export const useClearCalendarError = () => useCalendarStore(state => state.clearError);

// Custom hook to integrate with Convex scheduled posts
// Note: This should be used in client components with "use client" directive
export const useScheduledPostsFromConvex = (userId?: string, startDate?: Date, endDate?: Date) => {
  // This is a placeholder - actual implementation should be in client components
  // that can use useQuery and useEffect from React/Convex
  return {
    posts: [],
    isLoading: false,
  };
};

// Legacy combined hook - deprecated, use individual hooks instead
export const useCalendarActions = () => useCalendarStore(state => ({
  loadScheduledPosts: state.loadScheduledPosts,
  addScheduledPost: state.addScheduledPost,
  updateScheduledPost: state.updateScheduledPost,
  deleteScheduledPost: state.deleteScheduledPost,
  setSelectedDate: state.setSelectedDate,
  setCurrentMonth: state.setCurrentMonth,
  getPostsByDate: state.getPostsByDate,
  getPostsByDateRange: state.getPostsByDateRange,
  getPostsByStatus: state.getPostsByStatus,
  getPostsByPlatform: state.getPostsByPlatform,
  clearError: state.clearError,
}));
