// TRASH HOOK - Custom hook for trash management following AURA state architecture
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useTrash.ts

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";

// Types for deleted items
export interface DeletedFileData {
  _id: Id<"deletedFiles">;
  originalId: Id<"files">;
  name: string;
  type: "post" | "campaign" | "note" | "document" | "image" | "video" | "other";
  extension?: string;
  content?: string;
  size?: number;
  projectId: Id<"projects">;
  userId?: string | Id<"users">;
  path?: string;
  mimeType?: string;
  platform?: "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube";
  postStatus?: "draft" | "scheduled" | "published" | "archived";
  scheduledAt?: number;
  originalCreatedAt: number;
  originalUpdatedAt: number;
  originalLastModified: number;
  deletedAt: number;
  deletedBy?: string | Id<"users">;
  parentProjectName?: string;
}

export interface DeletedProjectData {
  _id: Id<"deletedProjects">;
  originalId: Id<"projects">;
  name: string;
  description?: string;
  status: "active" | "completed" | "on-hold";
  budget?: number;
  projectNo?: string;
  userId?: string | Id<"users">;
  originalCreatedAt: number;
  originalUpdatedAt: number;
  deletedAt: number;
  deletedBy?: string | Id<"users">;
  associatedFiles?: Array<{
    fileId: Id<"files">;
    name: string;
    type: string;
    size?: number;
  }>;
}

export interface TrashStats {
  totalFiles: number;
  totalProjects: number;
  totalItems: number;
  oldestDeletion: number;
  latestDeletion: number;
}

// Combined trash item for unified display
export interface TrashItem {
  id: string; // Unified ID for display purposes
  convexId: Id<"deletedFiles"> | Id<"deletedProjects">;
  name: string;
  type: 'file' | 'project';
  itemType?: DeletedFileData["type"]; // For files
  platform?: DeletedFileData["platform"]; // For files
  projectName?: string; // Parent project for files
  fileCount?: number; // Associated files for projects
  deletedAt: number;
  deletedBy?: string | Id<"users">;
  size?: number;
  isConvexItem: boolean; // Always true for this hook
}

export interface UseTrashReturn {
  // Trash data from Convex (source of truth)
  deletedFiles: DeletedFileData[] | undefined;
  deletedProjects: DeletedProjectData[] | undefined;
  trashItems: TrashItem[] | undefined; // Combined view
  stats: TrashStats | undefined;
  
  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  
  // Actions
  moveFileToTrash: (fileId: Id<"files">, deletedBy?: string) => Promise<Id<"deletedFiles">>;
  moveProjectToTrash: (projectId: Id<"projects">, deletedBy?: string) => Promise<Id<"deletedProjects">>;
  restoreFile: (deletedFileId: Id<"deletedFiles">) => Promise<Id<"files">>;
  restoreProject: (deletedProjectId: Id<"deletedProjects">) => Promise<Id<"projects">>;
  permanentlyDeleteFile: (deletedFileId: Id<"deletedFiles">) => Promise<Id<"deletedFiles">>;
  permanentlyDeleteProject: (deletedProjectId: Id<"deletedProjects">) => Promise<Id<"deletedProjects">>;
  emptyTrash: () => Promise<{ deletedFiles: number; deletedProjects: number; timestamp: number }>;
  
  // Utility functions
  getItemsByType: (type: 'file' | 'project') => TrashItem[];
  getRecentlyDeleted: (days?: number) => TrashItem[];
  getOldItems: (days?: number) => TrashItem[];
}

/**
 * Custom hook for trash management following AURA state architecture:
 * - Convex handles persistent trash data (source of truth)
 * - Real-time updates via Convex queries
 * - Sophisticated two-table trash system (deletedFiles + deletedProjects)
 * - Cross-device trash synchronization
 * - 30-day retention with automatic cleanup
 */
export function useTrash(): UseTrashReturn {
  // Convex queries - source of truth for trash data
  const deletedFiles = useQuery(api.trash.getDeletedFiles);
  const deletedProjects = useQuery(api.trash.getDeletedProjects);
  const stats = useQuery(api.trash.getTrashStats);
  
  // Convex mutations
  const moveFileToTrashMutation = useMutation(api.trash.moveFileToTrash);
  const moveProjectToTrashMutation = useMutation(api.trash.moveProjectToTrash);
  const restoreFileFromTrashMutation = useMutation(api.trash.restoreFileFromTrash);
  const restoreProjectFromTrashMutation = useMutation(api.trash.restoreProjectFromTrash);
  const permanentlyDeleteFileMutation = useMutation(api.trash.permanentlyDeleteFile);
  const permanentlyDeleteProjectMutation = useMutation(api.trash.permanentlyDeleteProject);
  const emptyTrashMutation = useMutation(api.trash.emptyTrash);

  // Loading states
  const isLoading = deletedFiles === undefined || deletedProjects === undefined;
  const isStatsLoading = stats === undefined;

  // Create unified trash items view
  const trashItems: TrashItem[] | undefined = useCallback(() => {
    if (!deletedFiles || !deletedProjects) return undefined;

    const items: TrashItem[] = [];

    // Add deleted files
    deletedFiles.forEach(file => {
      items.push({
        id: `file-${file._id}`,
        convexId: file._id,
        name: file.name,
        type: 'file',
        itemType: file.type,
        platform: file.platform,
        projectName: file.parentProjectName,
        deletedAt: file.deletedAt,
        deletedBy: file.deletedBy,
        size: file.size,
        isConvexItem: true,
      });
    });

    // Add deleted projects
    deletedProjects.forEach(project => {
      items.push({
        id: `project-${project._id}`,
        convexId: project._id,
        name: project.name,
        type: 'project',
        fileCount: project.associatedFiles?.length || 0,
        deletedAt: project.deletedAt,
        deletedBy: project.deletedBy,
        isConvexItem: true,
      });
    });

    // Sort by deletion date (most recent first)
    return items.sort((a, b) => b.deletedAt - a.deletedAt);
  }, [deletedFiles, deletedProjects])();

  // Actions with proper error handling
  const moveFileToTrash = useCallback(async (fileId: Id<"files">, deletedBy?: string): Promise<Id<"deletedFiles">> => {
    try {
      return await moveFileToTrashMutation({ id: fileId, deletedBy });
    } catch (error) {
      console.error('Failed to move file to trash:', error);
      throw new Error(`Unable to move file to trash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [moveFileToTrashMutation]);

  const moveProjectToTrash = useCallback(async (projectId: Id<"projects">, deletedBy?: string): Promise<Id<"deletedProjects">> => {
    try {
      return await moveProjectToTrashMutation({ id: projectId, deletedBy });
    } catch (error) {
      console.error('Failed to move project to trash:', error);
      throw new Error(`Unable to move project to trash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [moveProjectToTrashMutation]);

  const restoreFile = useCallback(async (deletedFileId: Id<"deletedFiles">): Promise<Id<"files">> => {
    try {
      return await restoreFileFromTrashMutation({ id: deletedFileId });
    } catch (error) {
      console.error('Failed to restore file from trash:', error);
      throw new Error(`Unable to restore file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [restoreFileFromTrashMutation]);

  const restoreProject = useCallback(async (deletedProjectId: Id<"deletedProjects">): Promise<Id<"projects">> => {
    try {
      return await restoreProjectFromTrashMutation({ id: deletedProjectId });
    } catch (error) {
      console.error('Failed to restore project from trash:', error);
      throw new Error(`Unable to restore project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [restoreProjectFromTrashMutation]);

  const permanentlyDeleteFile = useCallback(async (deletedFileId: Id<"deletedFiles">): Promise<Id<"deletedFiles">> => {
    try {
      return await permanentlyDeleteFileMutation({ id: deletedFileId });
    } catch (error) {
      console.error('Failed to permanently delete file:', error);
      throw new Error(`Unable to permanently delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [permanentlyDeleteFileMutation]);

  const permanentlyDeleteProject = useCallback(async (deletedProjectId: Id<"deletedProjects">): Promise<Id<"deletedProjects">> => {
    try {
      return await permanentlyDeleteProjectMutation({ id: deletedProjectId });
    } catch (error) {
      console.error('Failed to permanently delete project:', error);
      throw new Error(`Unable to permanently delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [permanentlyDeleteProjectMutation]);

  const emptyTrash = useCallback(async (): Promise<{ deletedFiles: number; deletedProjects: number; timestamp: number }> => {
    try {
      return await emptyTrashMutation({ confirmation: "EMPTY_TRASH" });
    } catch (error) {
      console.error('Failed to empty trash:', error);
      throw new Error(`Unable to empty trash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [emptyTrashMutation]);

  // Utility functions
  const getItemsByType = useCallback((type: 'file' | 'project'): TrashItem[] => {
    if (!trashItems) return [];
    return trashItems.filter(item => item.type === type);
  }, [trashItems]);

  const getRecentlyDeleted = useCallback((days: number = 7): TrashItem[] => {
    if (!trashItems) return [];
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return trashItems.filter(item => item.deletedAt >= cutoff);
  }, [trashItems]);

  const getOldItems = useCallback((days: number = 30): TrashItem[] => {
    if (!trashItems) return [];
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return trashItems.filter(item => item.deletedAt < cutoff);
  }, [trashItems]);

  return {
    deletedFiles,
    deletedProjects,
    trashItems,
    stats,
    isLoading,
    isStatsLoading,
    moveFileToTrash,
    moveProjectToTrash,
    restoreFile,
    restoreProject,
    permanentlyDeleteFile,
    permanentlyDeleteProject,
    emptyTrash,
    getItemsByType,
    getRecentlyDeleted,
    getOldItems,
  };
}
