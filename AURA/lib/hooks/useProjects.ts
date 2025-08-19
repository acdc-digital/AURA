// PROJECTS HOOK - Custom hook for project management following AURA state architecture
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useProjects.ts

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";

export interface ProjectData {
  _id: Id<"projects">;
  name: string;
  description?: string;
  status: "active" | "completed" | "on-hold";
  budget?: number;
  projectNo?: string;
  userId?: string | Id<"users">;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: ProjectData["status"];
  budget?: number;
  projectNo?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectData["status"];
  budget?: number;
  projectNo?: string;
}

export interface UseProjectsReturn {
  // Projects data from Convex (source of truth)
  projects: ProjectData[] | undefined;
  isLoading: boolean;
  
  // Single project
  getProject: (projectId: Id<"projects">) => ProjectData | undefined;
  
  // Filtered projects
  getProjectsByStatus: (status: ProjectData["status"]) => ProjectData[];
  
  // Actions
  createProject: (data: CreateProjectData) => Promise<Id<"projects">>;
  updateProject: (projectId: Id<"projects">, data: UpdateProjectData) => Promise<void>;
  deleteProject: (projectId: Id<"projects">) => Promise<void>;
  duplicateProject: (projectId: Id<"projects">) => Promise<Id<"projects">>;
}

/**
 * Custom hook for project management following AURA state architecture:
 * - Convex handles persistent project data (source of truth)
 * - Real-time updates via Convex queries
 * - Optimistic updates handled by Convex mutations
 */
export function useProjects(): UseProjectsReturn {
  // Convex queries - source of truth for project data
  const projects = useQuery(api.projects.list);
  
  // Convex mutations
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(api.projects.update);
  const deleteProjectMutation = useMutation(api.projects.remove);
  const duplicateProjectMutation = useMutation(api.projects.duplicate);

  const isLoading = projects === undefined;

  // Get single project
  const getProject = useCallback((projectId: Id<"projects">) => {
    if (!projects) return undefined;
    return projects.find(project => project._id === projectId);
  }, [projects]);

  // Filter functions
  const getProjectsByStatus = useCallback((status: ProjectData["status"]) => {
    if (!projects) return [];
    return projects.filter(project => project.status === status);
  }, [projects]);

  // Actions
  const createProject = useCallback(async (data: CreateProjectData): Promise<Id<"projects">> => {
    return await createProjectMutation({
      ...data,
      status: data.status || "active",
    });
  }, [createProjectMutation]);

  const updateProject = useCallback(async (projectId: Id<"projects">, data: UpdateProjectData): Promise<void> => {
    await updateProjectMutation({
      id: projectId,
      ...data,
    });
  }, [updateProjectMutation]);

  const deleteProject = useCallback(async (projectId: Id<"projects">): Promise<void> => {
    await deleteProjectMutation({ id: projectId });
  }, [deleteProjectMutation]);

  const duplicateProject = useCallback(async (projectId: Id<"projects">): Promise<Id<"projects">> => {
    return await duplicateProjectMutation({ id: projectId });
  }, [duplicateProjectMutation]);

  return {
    projects,
    isLoading,
    getProject,
    getProjectsByStatus,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
  };
}
