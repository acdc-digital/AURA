// Calendar Store Types
// /Users/matthewsimon/Projects/eac/eac/store/calendar/types.ts

export interface ScheduledPost {
  _id: string;
  userId: string;
  platform: "facebook" | "instagram" | "twitter" | "reddit";
  title: string;
  content?: string;
  scheduledAt: number; // Unix timestamp
  status: "scheduled" | "published" | "failed" | "cancelled";
  postId?: string; // ID from the respective platform store
  fileId?: string; // Associated editor file ID
  fileName?: string; // Original file name
  fileType?: string; // File type (twitter, reddit, etc.)
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalendarStoreState {
  // Scheduled posts data
  scheduledPosts: ScheduledPost[];
  isLoading: boolean;
  error: string | null;
  
  // UI State
  selectedDate: Date | null;
  currentMonth: Date;
  
  // Actions
  loadScheduledPosts: (userId: string, startDate?: Date, endDate?: Date) => Promise<void>;
  setScheduledPosts: (posts: ScheduledPost[]) => void;
  addScheduledPost: (post: Omit<ScheduledPost, '_id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateScheduledPost: (postId: string, updates: Partial<ScheduledPost>) => Promise<void>;
  deleteScheduledPost: (postId: string) => Promise<void>;
  
  // UI Actions
  setSelectedDate: (date: Date | null) => void;
  setCurrentMonth: (date: Date) => void;
  
  // Utility actions
  getPostsByDate: (date: Date) => ScheduledPost[];
  getPostsByDateRange: (startDate: Date, endDate: Date) => ScheduledPost[];
  getPostsByStatus: (status: ScheduledPost['status']) => ScheduledPost[];
  getPostsByPlatform: (platform: ScheduledPost['platform']) => ScheduledPost[];
  
  // Clear actions
  clearError: () => void;
}
