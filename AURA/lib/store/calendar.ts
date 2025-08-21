// CALENDAR STORE - Zustand store for calendar UI state following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/calendar.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Calendar view types
export type CalendarView = 'week' | 'month' | 'day' | 'agenda';

// Calendar filter types
export interface CalendarFilters {
  platform?: 'reddit' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'all';
  status?: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Calendar UI state interface
export interface CalendarState {
  // Current view state
  currentView: CalendarView;
  view: CalendarView; // Alias for currentView to match component usage
  currentDate: Date;
  selectedDate: Date | null;
  
  // Sidebar states
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  
  // Modal/Dialog states
  createPostModalOpen: boolean;
  editPostModalOpen: boolean;
  selectedPostId: string | null;
  
  // Filters and search
  filters: CalendarFilters;
  searchQuery: string;
  
  // UI preferences
  showWeekends: boolean;
  startWeek: 'monday' | 'sunday';
  timeFormat: '12h' | '24h';
  
  // Loading states (UI only - server state handled by Convex)
  isCreatingPost: boolean;
  isDeletingPost: boolean;
}

// Calendar store actions
export interface CalendarActions {
  // View actions
  setCurrentView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  navigateToToday: () => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
  
  // Modal actions
  openCreatePostModal: (date?: Date) => void;
  closeCreatePostModal: () => void;
  openEditPostModal: (postId: string) => void;
  closeEditPostModal: () => void;
  
  // Filter actions
  setFilters: (filters: Partial<CalendarFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  
  // Preference actions
  setShowWeekends: (show: boolean) => void;
  setStartWeek: (start: 'monday' | 'sunday') => void;
  setTimeFormat: (format: '12h' | '24h') => void;
  
  // Loading actions (UI only)
  setIsCreatingPost: (loading: boolean) => void;
  setIsDeletingPost: (loading: boolean) => void;
}

// Combined calendar store type
export type CalendarStore = CalendarState & CalendarActions;

// Default state values
const defaultState: CalendarState = {
  // Current view state
  currentView: 'week',
  view: 'week', // Alias for currentView
  currentDate: new Date(),
  selectedDate: null,
  
  // Sidebar states
  sidebarCollapsed: false,
  rightPanelOpen: false,
  
  // Modal/Dialog states
  createPostModalOpen: false,
  editPostModalOpen: false,
  selectedPostId: null,
  
  // Filters and search
  filters: {
    platform: 'all',
    status: 'all',
  },
  searchQuery: '',
  
  // UI preferences
  showWeekends: true,
  startWeek: 'sunday',
  timeFormat: '12h',
  
  // Loading states
  isCreatingPost: false,
  isDeletingPost: false,
};

// Utility functions for date navigation
const getNextDate = (date: Date, view: CalendarView): Date => {
  const next = new Date(date);
  switch (view) {
    case 'day':
      next.setDate(next.getDate() + 1);
      break;
    case 'week':
      next.setDate(next.getDate() + 7);
      break;
    case 'month':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'agenda':
      next.setDate(next.getDate() + 7); // Week forward for agenda
      break;
  }
  return next;
};

const getPrevDate = (date: Date, view: CalendarView): Date => {
  const prev = new Date(date);
  switch (view) {
    case 'day':
      prev.setDate(prev.getDate() - 1);
      break;
    case 'week':
      prev.setDate(prev.getDate() - 7);
      break;
    case 'month':
      prev.setMonth(prev.getMonth() - 1);
      break;
    case 'agenda':
      prev.setDate(prev.getDate() - 7); // Week back for agenda
      break;
  }
  return prev;
};

// Create calendar store with Zustand
export const useCalendarStore = create<CalendarStore>()(
  devtools(
    (set) => ({
      // Initial state
      ...defaultState,
      
      // View actions
      setCurrentView: (view) => set({ currentView: view, view: view }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      navigateToToday: () => set({ currentDate: new Date() }),
      navigateNext: () => set((state) => ({ 
        currentDate: getNextDate(state.currentDate, state.currentView)
      })),
      navigatePrev: () => set((state) => ({ 
        currentDate: getPrevDate(state.currentDate, state.currentView)
      })),
      
      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
      
      // Modal actions
      openCreatePostModal: (date) => set({ 
        createPostModalOpen: true, 
        selectedDate: date || null 
      }),
      closeCreatePostModal: () => set({ 
        createPostModalOpen: false, 
        selectedDate: null 
      }),
      openEditPostModal: (postId) => set({ 
        editPostModalOpen: true, 
        selectedPostId: postId 
      }),
      closeEditPostModal: () => set({ 
        editPostModalOpen: false, 
        selectedPostId: null 
      }),
      
      // Filter actions
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters }
      })),
      clearFilters: () => set({ 
        filters: { platform: 'all', status: 'all' }
      }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Preference actions
      setShowWeekends: (show) => set({ showWeekends: show }),
      setStartWeek: (start) => set({ startWeek: start }),
      setTimeFormat: (format) => set({ timeFormat: format }),
      
      // Loading actions
      setIsCreatingPost: (loading) => set({ isCreatingPost: loading }),
      setIsDeletingPost: (loading) => set({ isDeletingPost: loading }),
    }),
    {
      name: 'calendar-store',
      partialize: (state: CalendarStore) => ({
        // Persist user preferences only
        currentView: state.currentView,
        showWeekends: state.showWeekends,
        startWeek: state.startWeek,
        timeFormat: state.timeFormat,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Export utility functions for external use
export { getNextDate, getPrevDate };
