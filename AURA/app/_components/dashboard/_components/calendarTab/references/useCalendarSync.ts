// Calendar integration hook
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useCalendarSync.ts

import { useAddScheduledPost, useDeleteScheduledPost, useUpdateScheduledPost } from '@/store';
import { useCallback } from 'react';

export interface PostScheduleData {
  platform: 'facebook' | 'instagram' | 'twitter' | 'reddit';
  title: string;
  content?: string;
  scheduledAt: number; // Unix timestamp
  postId: string;
  fileId?: string;
  userId: string;
}

export const useCalendarSync = () => {
  const addScheduledPost = useAddScheduledPost();
  const updateScheduledPost = useUpdateScheduledPost();
  const deleteScheduledPost = useDeleteScheduledPost();

  const syncPostToCalendar = useCallback(async (postData: PostScheduleData) => {
    try {
      const scheduledPost = {
        userId: postData.userId,
        platform: postData.platform,
        title: postData.title,
        content: postData.content,
        scheduledAt: postData.scheduledAt,
        status: 'scheduled' as const,
        postId: postData.postId,
        fileId: postData.fileId,
      };
      
      await addScheduledPost(scheduledPost);
    } catch (error) {
      console.error('Failed to sync post to calendar:', error);
      throw error;
    }
  }, [addScheduledPost]);

  const updatePostStatusInCalendar = useCallback(async (
    postId: string, 
    status: 'scheduled' | 'published' | 'failed' | 'cancelled',
    error?: string
  ) => {
    try {
      const updates = {
        status,
        ...(error && { error }),
        ...(status === 'published' && { publishedAt: Date.now() })
      };
      
      await updateScheduledPost(postId, updates);
    } catch (error) {
      console.error('Failed to update post status in calendar:', error);
      throw error;
    }
  }, [updateScheduledPost]);

  const removePostFromCalendar = useCallback(async (postId: string) => {
    try {
      await deleteScheduledPost(postId);
    } catch (error) {
      console.error('Failed to remove post from calendar:', error);
      throw error;
    }
  }, [deleteScheduledPost]);

  return {
    syncPostToCalendar,
    updatePostStatusInCalendar,
    removePostFromCalendar,
  };
};
