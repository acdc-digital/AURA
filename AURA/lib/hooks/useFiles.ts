// FILES HOOK - Custom hook for file management following AURA state architecture
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useFiles.ts

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";

export interface FileData {
  _id: Id<"files">;
  name: string;
  type: "post" | "campaign" | "note" | "document" | "image" | "video" | "other";
  extension?: string;
  content?: string;
  size?: number;
  projectId: Id<"projects">;
  userId?: string | Id<"users">;
  path?: string;
  mimeType?: string;
  isDeleted?: boolean;
  lastModified: number;
  createdAt: number;
  updatedAt: number;
  platform?: "facebook" | "instagram" | "twitter" | "linkedin" | "reddit" | "youtube";
  postStatus?: "draft" | "scheduled" | "published" | "archived";
  scheduledAt?: number;
}

export interface CreateFileData {
  name: string;
  type: FileData["type"];
  content?: string;
  projectId: Id<"projects">;
  extension?: string;
  path?: string;
  mimeType?: string;
  platform?: FileData["platform"];
  postStatus?: FileData["postStatus"];
}

export interface UpdateFileData {
  name?: string;
  content?: string;
  type?: FileData["type"];
  extension?: string;
  path?: string;
  mimeType?: string;
  platform?: FileData["platform"];
  postStatus?: FileData["postStatus"];
  scheduledAt?: number;
}

export interface UseFilesReturn {
  // Files data from Convex (source of truth)
  files: FileData[] | undefined;
  isLoading: boolean;
  
  // Filtered files
  getFilesByProject: (projectId: Id<"projects">) => FileData[];
  getFilesByType: (type: FileData["type"]) => FileData[];
  getFilesByPlatform: (platform: FileData["platform"]) => FileData[];
  
  // Actions
  createFile: (data: CreateFileData) => Promise<Id<"files">>;
  updateFile: (fileId: Id<"files">, data: UpdateFileData) => Promise<void>;
  deleteFile: (fileId: Id<"files">) => Promise<void>;
  moveToTrash: (fileId: Id<"files">) => Promise<void>;
  restoreFile: (fileId: Id<"files">) => Promise<void>;
  duplicateFile: (fileId: Id<"files">) => Promise<Id<"files">>;
}

/**
 * Custom hook for file management following AURA state architecture:
 * - Convex handles persistent file data (source of truth)
 * - Real-time updates via Convex queries
 * - Optimistic updates handled by Convex mutations
 */
export function useFiles(projectId?: Id<"projects">): UseFilesReturn {
  // Convex queries - source of truth for file data
  const allFiles = useQuery(api.files.list);
  const projectFiles = useQuery(
    api.files.getByProject, 
    projectId ? { projectId } : "skip"
  );
  
  // Use project-specific files if projectId provided, otherwise all files
  const files = projectId ? projectFiles : allFiles;
  
  // Convex mutations
  const createFileMutation = useMutation(api.files.create);
  const updateFileMutation = useMutation(api.files.update);
  const deleteFileMutation = useMutation(api.files.remove);
  const softDeleteMutation = useMutation(api.files.softDelete);
  const restoreFileMutation = useMutation(api.files.restore);
  const duplicateFileMutation = useMutation(api.files.duplicate);

  const isLoading = files === undefined;

  // Filter functions
  const getFilesByProject = useCallback((projectId: Id<"projects">) => {
    if (!files) return [];
    return files.filter(file => file.projectId === projectId && !file.isDeleted);
  }, [files]);

  const getFilesByType = useCallback((type: FileData["type"]) => {
    if (!files) return [];
    return files.filter(file => file.type === type && !file.isDeleted);
  }, [files]);

  const getFilesByPlatform = useCallback((platform: FileData["platform"]) => {
    if (!files || !platform) return [];
    return files.filter(file => file.platform === platform && !file.isDeleted);
  }, [files]);

  // Actions
  const createFile = useCallback(async (data: CreateFileData): Promise<Id<"files">> => {
    return await createFileMutation({
      ...data,
      lastModified: Date.now(),
    });
  }, [createFileMutation]);

  const updateFile = useCallback(async (fileId: Id<"files">, data: UpdateFileData): Promise<void> => {
    await updateFileMutation({
      id: fileId,
      ...data,
    });
  }, [updateFileMutation]);

  const deleteFile = useCallback(async (fileId: Id<"files">): Promise<void> => {
    await deleteFileMutation({ id: fileId });
  }, [deleteFileMutation]);

  const moveToTrash = useCallback(async (fileId: Id<"files">): Promise<void> => {
    await softDeleteMutation({ id: fileId });
  }, [softDeleteMutation]);

  const restoreFile = useCallback(async (fileId: Id<"files">): Promise<void> => {
    await restoreFileMutation({ id: fileId });
  }, [restoreFileMutation]);

  const duplicateFile = useCallback(async (fileId: Id<"files">): Promise<Id<"files">> => {
    return await duplicateFileMutation({ id: fileId });
  }, [duplicateFileMutation]);

  return {
    files: files?.filter(f => !f.isDeleted),
    isLoading,
    getFilesByProject,
    getFilesByType,
    getFilesByPlatform,
    createFile,
    updateFile,
    deleteFile,
    moveToTrash,
    restoreFile,
    duplicateFile,
  };
}
