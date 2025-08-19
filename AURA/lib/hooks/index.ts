// HOOKS INDEX - Central exports for custom hooks following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/index.ts

export { useUser } from './useUser';
export { useFiles } from './useFiles';
export { useProjects } from './useProjects';
export { useCalendarPosts } from './useCalendarPosts';

// Export types
export type { UseUserReturn, UserProfileUpdateData } from './useUser';
export type { UseFilesReturn, FileData, CreateFileData, UpdateFileData } from './useFiles';
export type { UseProjectsReturn, ProjectData, CreateProjectData, UpdateProjectData } from './useProjects';
