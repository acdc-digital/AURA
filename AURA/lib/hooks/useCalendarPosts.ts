// CALENDAR HOOKS - Custom hooks for calendar/social posts management following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useCalendarPosts.ts

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Type definitions for social posts based on schema
export interface AgentPost {
  _id: Id<"agentPosts">;
  _creationTime: number;
  userId: Id<"users"> | string;
  fileName: string;
  fileType: 'reddit' | 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  title?: string;
  scheduledFor?: number;
  status: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';
  campaignId?: string;
  platformData?: string;
  postId?: string;
  postUrl?: string;
  postedAt?: number;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePostInput {
  fileName: string;
  fileType: 'reddit' | 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  title?: string;
  scheduledFor?: number;
  status?: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';
  campaignId?: string;
  platformData?: string;
}

export interface UpdatePostStatusInput {
  id: Id<"agentPosts">;
  status: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';
  postId?: string;
  postUrl?: string;
  postedAt?: number;
  errorMessage?: string;
}

// Custom hook for calendar posts management
export function useCalendarPosts() {
  // Query hooks - Follow AURA pattern using Convex useQuery
  const allPosts = useQuery(api.socialPosts.getAllAgentPosts);
  const todayPosts = useQuery(api.socialPosts.getTodayPosts);
  const overduePosts = useQuery(api.socialPosts.getOverduePosts);

  // Mutation hooks - Follow AURA pattern using Convex useMutation
  const createPostMutation = useMutation(api.socialPosts.createPost);
  const updatePostStatusMutation = useMutation(api.socialPosts.updatePostStatus);
  const updatePostScheduleMutation = useMutation(api.socialPosts.updatePostSchedule);
  const deletePostMutation = useMutation(api.socialPosts.deletePost);

  // Action functions - Follow AURA pattern with error handling
  const createPost = async (input: CreatePostInput) => {
    try {
      const postId = await createPostMutation(input);
      return { success: true, data: postId };
    } catch (error) {
      console.error("Failed to create post:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const updatePostStatus = async (input: UpdatePostStatusInput) => {
    try {
      await updatePostStatusMutation(input);
      return { success: true };
    } catch (error) {
      console.error("Failed to update post status:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const updatePostSchedule = async (id: Id<"agentPosts">, scheduledFor: number) => {
    try {
      await updatePostScheduleMutation({ id, scheduledFor });
      return { success: true };
    } catch (error) {
      console.error("Failed to update post schedule:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const deletePost = async (id: Id<"agentPosts">) => {
    try {
      await deletePostMutation({ id });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete post:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  // Utility functions
  const getPostCountsByStatus = () => {
    if (!allPosts) return null;

    return allPosts.reduce((counts: Record<string, number>, post) => {
      counts[post.status] = (counts[post.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  const getPostCountsByPlatform = () => {
    if (!allPosts) return null;

    return allPosts.reduce((counts: Record<string, number>, post) => {
      counts[post.fileType] = (counts[post.fileType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  // Calendar-specific utility functions
  const getPostsForWeek = (weekStart: Date) => {
    if (!allPosts) return null;

    const weekStartTime = weekStart.getTime();
    const weekEndTime = weekStartTime + 7 * 24 * 60 * 60 * 1000;

    return allPosts.filter(post => 
      post.scheduledFor && 
      post.scheduledFor >= weekStartTime && 
      post.scheduledFor < weekEndTime
    );
  };

  const getPostsForDate = (date: Date) => {
    if (!allPosts) return null;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return allPosts.filter(post => 
      post.scheduledFor && 
      post.scheduledFor >= dayStart.getTime() && 
      post.scheduledFor <= dayEnd.getTime()
    );
  };

  return {
    // Data
    allPosts,
    todayPosts,
    overduePosts,

    // Actions
    createPost,
    updatePostStatus,
    updatePostSchedule,
    deletePost,

    // Utilities
    getPostCountsByStatus,
    getPostCountsByPlatform,
    getPostsForWeek,
    getPostsForDate,

    // Loading states
    isLoading: allPosts === undefined,
    hasError: false, // Convex handles errors internally
  };
}
