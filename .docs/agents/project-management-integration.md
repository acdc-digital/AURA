# AURA Platform - Project Management Integration

_Convex-Powered Project Management with Real-time Collaboration_

_Last Updated: August 21, 2025_

## Overview

The AURA Platform includes a comprehensive **Project Management System** built on Convex's real-time database that provides intelligent project creation, management, and collaboration features. This system integrates seamlessly with the dashboard sidebar, agent workflows, and content creation tools to deliver a unified project management experience.

## Features

### 🚀 Core Project Management

- **Real-time Project Creation** - Intelligent project setup with automatic numbering
- **Convex Database Integration** - Full CRUD operations with real-time synchronization
- **Dashboard Integration** - Seamless sidebar integration with folder creation
- **Project Templates** - Pre-configured templates for common project types
- **Collaborative Features** - Team-based project management with shared access

### 📊 Project Analytics & Tracking

- **Project Statistics** - Real-time tracking of active, completed, and on-hold projects
- **Budget Management** - Project budget allocation and expense tracking
- **Timeline Tracking** - Milestone management and deadline monitoring
- **Performance Metrics** - Project completion rates and team productivity insights
- **Resource Allocation** - Team member assignment and workload distribution

### 🔗 System Integration

- **Agent Integration** - Projects automatically created through agent workflows
- **Content Creation** - Project-based content organization and management
- **File Management** - Project-scoped file storage and organization
- **Sidebar Synchronization** - Real-time sidebar updates with project changes
- **Search & Filtering** - Advanced project discovery and organization

## Architecture

### File Structure

```
AURA/
├── lib/hooks/
│   ├── useProjects.ts                      # Main project management hook
│   ├── useProjectSync.ts                   # Sidebar synchronization
│   ├── useProjectTemplates.ts              # Template management
│   └── useProjectAnalytics.ts              # Performance tracking
├── app/_components/dashboard/
│   ├── projectCreator.tsx                  # Project creation dialog
│   ├── projectCreatorExamples.tsx          # Usage examples
│   ├── projectManager.tsx                  # Project management interface
│   ├── projectSelector.tsx                 # Project selection component
│   └── projectAnalytics.tsx                # Analytics dashboard
├── app/_components/projects/
│   ├── projectCard.tsx                     # Individual project cards
│   ├── projectList.tsx                     # Project list view
│   ├── projectDetails.tsx                  # Detailed project view
│   ├── projectSettings.tsx                 # Project configuration
│   └── projectCollaboration.tsx            # Team features
├── store/projects/
│   ├── projectStore.ts                     # Zustand project store
│   ├── types.ts                           # Project type definitions
│   └── utils.ts                           # Project utility functions
├── convex/
│   ├── projects.ts                         # Project CRUD operations
│   ├── projectTemplates.ts                 # Template management
│   ├── projectAnalytics.ts                 # Performance tracking
│   └── projectCollaboration.ts             # Team features
└── types/
    ├── projects.ts                         # Project type definitions
    └── templates.ts                        # Template type definitions
```

### AURA State Management Architecture

Following AURA's strict state separation principles:

```typescript
// SERVER STATE (Convex) - All persistent project data
interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  status: "active" | "completed" | "on-hold" | "archived";
  
  // Project metadata
  projectNo: string;
  budget?: number;
  priority: "low" | "medium" | "high" | "urgent";
  
  // Relationships
  userId: Id<"users">;
  teamMembers: Id<"users">[];
  templateId?: Id<"projectTemplates">;
  
  // Timeline
  startDate?: number;
  dueDate?: number;
  completedAt?: number;
  
  // Organization
  tags: string[];
  category?: string;
  
  // System projects (Instructions, Content Creation)
  isSystemProject: boolean;
  systemType?: "instructions" | "content_creation";
  
  createdAt: number;
  updatedAt: number;
}

// CLIENT STATE (Zustand) - UI-only concerns
interface ProjectUIStore {
  selectedProjectId: string | null;
  projectCreatorOpen: boolean;
  projectManagerOpen: boolean;
  currentView: "list" | "grid" | "timeline" | "analytics";
  filterStatus: ProjectStatus | "all";
  searchQuery: string;
  sortBy: "name" | "created" | "updated" | "priority";
  
  // UI actions
  setSelectedProject: (id: string | null) => void;
  openProjectCreator: () => void;
  closeProjectCreator: () => void;
  setCurrentView: (view: string) => void;
  setFilterStatus: (status: ProjectStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string) => void;
}

// COMPONENT STATE (useState) - Ephemeral form state
const [projectName, setProjectName] = useState('');
const [projectDescription, setProjectDescription] = useState('');
const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
const [isCreating, setIsCreating] = useState(false);
```

## Core Implementation

### Main Project Management Hook

```typescript
// PROJECT MANAGEMENT HOOK - Central project operations
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useProjects.ts

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Project, ProjectStatus, CreateProjectArgs, UpdateProjectArgs } from '@/types/projects';
import { useUser } from './useUser';
import { useProjectStore } from '@/store/projects/projectStore';
import { useEffect } from 'react';

interface UseProjectsReturn {
  // Data
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats;
  nextProjectNumber: string;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Actions
  createProject: (args: CreateProjectArgs) => Promise<Id<"projects">>;
  updateProject: (args: UpdateProjectArgs) => Promise<void>;
  deleteProject: (projectId: Id<"projects">) => Promise<void>;
  archiveProject: (projectId: Id<"projects">) => Promise<void>;
  duplicateProject: (projectId: Id<"projects">) => Promise<Id<"projects">>;
  refreshProjects: () => void;
  
  // System project helpers
  ensureInstructionsProject: () => Promise<Id<"projects">>;
  ensureContentCreationProject: () => Promise<Id<"projects">>;
}

export function useProjects(): UseProjectsReturn {
  const { user } = useUser();
  const { 
    setProjects, 
    setCurrentProject, 
    setProjectStats, 
    setIsLoading,
    selectedProjectId 
  } = useProjectStore();
  
  // Queries
  const projects = useQuery(
    api.projects.list,
    user ? { userId: user._id } : "skip"
  );
  
  const projectStats = useQuery(
    api.projects.getStats,
    user ? { userId: user._id } : "skip"
  );
  
  const nextProjectNumber = useQuery(
    api.projects.getNextProjectNumber,
    user ? { userId: user._id } : "skip"
  );
  
  const currentProject = useQuery(
    api.projects.get,
    selectedProjectId ? { projectId: selectedProjectId as Id<"projects"> } : "skip"
  );
  
  // Mutations
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(api.projects.update);
  const deleteProjectMutation = useMutation(api.projects.softDelete);
  const archiveProjectMutation = useMutation(api.projects.archive);
  const duplicateProjectMutation = useMutation(api.projects.duplicate);
  
  // System project mutations
  const ensureInstructionsProjectMutation = useMutation(api.projects.ensureInstructionsProject);
  const ensureContentCreationProjectMutation = useMutation(api.projects.ensureContentCreationProject);
  
  // Update store when data changes
  useEffect(() => {
    if (projects) setProjects(projects);
  }, [projects, setProjects]);
  
  useEffect(() => {
    if (projectStats) setProjectStats(projectStats);
  }, [projectStats, setProjectStats]);
  
  useEffect(() => {
    if (currentProject) setCurrentProject(currentProject);
  }, [currentProject, setCurrentProject]);
  
  useEffect(() => {
    setIsLoading(projects === undefined);
  }, [projects, setIsLoading]);
  
  const createProject = async (args: CreateProjectArgs): Promise<Id<"projects">> => {
    if (!user) throw new Error('User must be authenticated');
    
    const projectId = await createProjectMutation({
      name: args.name,
      description: args.description,
      status: args.status || "active",
      budget: args.budget,
      priority: args.priority || "medium",
      projectNo: nextProjectNumber || "001",
      userId: user._id,
      teamMembers: args.teamMembers || [user._id],
      templateId: args.templateId,
      startDate: args.startDate,
      dueDate: args.dueDate,
      tags: args.tags || [],
      category: args.category,
      isSystemProject: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return projectId;
  };
  
  const updateProject = async (args: UpdateProjectArgs): Promise<void> => {
    await updateProjectMutation({
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      status: args.status,
      budget: args.budget,
      priority: args.priority,
      startDate: args.startDate,
      dueDate: args.dueDate,
      completedAt: args.status === "completed" ? Date.now() : undefined,
      tags: args.tags,
      category: args.category,
      updatedAt: Date.now()
    });
  };
  
  const deleteProject = async (projectId: Id<"projects">): Promise<void> => {
    await deleteProjectMutation({ projectId });
  };
  
  const archiveProject = async (projectId: Id<"projects">): Promise<void> => {
    await archiveProjectMutation({ projectId });
  };
  
  const duplicateProject = async (projectId: Id<"projects">): Promise<Id<"projects">> => {
    return await duplicateProjectMutation({ projectId });
  };
  
  const refreshProjects = () => {
    // Convex automatically refreshes, but we can trigger re-fetch if needed
  };
  
  const ensureInstructionsProject = async (): Promise<Id<"projects">> => {
    if (!user) throw new Error('User must be authenticated');
    return await ensureInstructionsProjectMutation({ userId: user._id });
  };
  
  const ensureContentCreationProject = async (): Promise<Id<"projects">> => {
    if (!user) throw new Error('User must be authenticated');
    return await ensureContentCreationProjectMutation({ userId: user._id });
  };
  
  return {
    // Data
    projects: projects || [],
    currentProject: currentProject || null,
    projectStats: projectStats || { total: 0, active: 0, completed: 0, onHold: 0, archived: 0 },
    nextProjectNumber: nextProjectNumber || "001",
    
    // Loading states
    isLoading: projects === undefined,
    isCreating: false, // Track via component state
    isUpdating: false, // Track via component state
    isDeleting: false, // Track via component state
    
    // Actions
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    duplicateProject,
    refreshProjects,
    
    // System project helpers
    ensureInstructionsProject,
    ensureContentCreationProject
  };
}

// Project statistics tracking
interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  archived: number;
  completionRate: number;
  averageCompletionTime: number;
}

// Project synchronization with sidebar
export function useProjectSync() {
  const { projects } = useProjects();
  const { refreshFolders } = useFolders(); // Sidebar folder system
  
  useEffect(() => {
    // Sync projects with sidebar folders
    projects.forEach(project => {
      if (!project.isSystemProject) {
        // Create folder for non-system projects
        refreshFolders();
      }
    });
  }, [projects, refreshFolders]);
  
  return {
    syncProjectToFolder: (project: Project) => {
      // Create corresponding folder in sidebar
    },
    syncFolderToProject: (folderName: string) => {
      // Create corresponding project for folder
    }
  };
}
```

### Project Creator Component

```typescript
// PROJECT CREATOR - Advanced project creation interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/projectCreator.tsx

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Briefcase, 
  Calendar,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Archive
} from 'lucide-react';
import { Project, ProjectStatus, ProjectPriority } from '@/types/projects';
import { useProjects } from '@/lib/hooks/useProjects';
import { useProjectTemplates } from '@/lib/hooks/useProjectTemplates';
import { useUser } from '@/lib/hooks/useUser';

interface ProjectCreatorProps {
  trigger?: React.ReactNode;
  onProjectCreated?: (project: Project) => void;
  initialTemplate?: string;
}

export function ProjectCreator({ 
  trigger, 
  onProjectCreated,
  initialTemplate 
}: ProjectCreatorProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state (Component State - ephemeral)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [budget, setBudget] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplate || null);
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  
  // Hooks
  const { createProject, nextProjectNumber } = useProjects();
  const { templates, applyTemplate } = useProjectTemplates();
  const { user } = useUser();
  
  const handleCreate = useCallback(async () => {
    if (!name) return;
    
    setIsCreating(true);
    try {
      const projectId = await createProject({
        name,
        description,
        status,
        priority,
        budget,
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        tags,
        category,
        templateId: selectedTemplateId as any,
        teamMembers: [user?._id as any]
      });
      
      // Get created project for callback
      const createdProject = { 
        _id: projectId, 
        name, 
        description, 
        status, 
        priority,
        projectNo: nextProjectNumber,
        userId: user?._id as any,
        teamMembers: [user?._id as any],
        tags,
        category,
        isSystemProject: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      } as Project;
      
      // Reset form
      setName('');
      setDescription('');
      setStatus('active');
      setPriority('medium');
      setBudget(undefined);
      setStartDate('');
      setDueDate('');
      setTags([]);
      setCategory('');
      setSelectedTemplateId(null);
      
      // Callback
      onProjectCreated?.(createdProject);
      
      // Close dialog
      setIsOpen(false);
      
    } catch (error) {
      console.error('Project creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  }, [
    name, description, status, priority, budget, startDate, dueDate, 
    tags, category, selectedTemplateId, createProject, nextProjectNumber, 
    user, onProjectCreated
  ]);
  
  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      const applied = applyTemplate(template);
      setName(applied.name);
      setDescription(applied.description);
      setStatus(applied.status);
      setPriority(applied.priority);
      setBudget(applied.budget);
      setTags(applied.tags);
      setCategory(applied.category);
      setSelectedTemplateId(templateId);
      setActiveTab('basic');
    }
  }, [templates, applyTemplate]);
  
  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'active': return <Target className="w-4 h-4 text-green-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'on-hold': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
    }
  };

  if (!isOpen && trigger) {
    return (
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>
    );
  }
  
  if (!isOpen && !trigger) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#007acc] hover:bg-[#005a9a] text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Project
      </Button>
    );
  }
  
  return (
    <Card className="bg-[#1e1e1e] border-[#2d2d2d] max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#cccccc] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#007acc]" />
            Create New Project
            <Badge variant="secondary" className="ml-2">
              #{nextProjectNumber}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-[#858585] hover:text-[#cccccc]"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {templates.map(template => (
                <Card
                  key={template._id}
                  className={`cursor-pointer transition-colors ${
                    selectedTemplateId === template._id 
                      ? 'bg-[#007acc]/20 border-[#007acc]' 
                      : 'bg-[#2d2d2d] border-[#2d2d2d] hover:border-[#007acc]/50'
                  }`}
                  onClick={() => handleTemplateSelect(template._id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#007acc]/20 rounded flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-[#007acc]" />
                      </div>
                      <div>
                        <h4 className="text-[#cccccc] font-medium">{template.name}</h4>
                        <p className="text-[#858585] text-xs">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setActiveTab('basic')}
                disabled={!selectedTemplateId}
                className="bg-[#007acc] hover:bg-[#005a9a] text-white"
              >
                Use Template
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#858585] mb-2 block">
                  Project Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name..."
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                />
              </div>
              
              <div>
                <label className="text-sm text-[#858585] mb-2 block">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project..."
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc] min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#858585] mb-2 block">
                    Status
                  </label>
                  <Select value={status} onValueChange={(value: ProjectStatus) => setStatus(value)}>
                    <SelectTrigger className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          {getStatusIcon('active')}
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          {getStatusIcon('completed')}
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="on-hold">
                        <div className="flex items-center gap-2">
                          {getStatusIcon('on-hold')}
                          On Hold
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-[#858585] mb-2 block">
                    Priority
                  </label>
                  <Select value={priority} onValueChange={(value: ProjectPriority) => setPriority(value)}>
                    <SelectTrigger className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">
                        <span className={getPriorityColor('urgent')}>Urgent</span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className={getPriorityColor('high')}>High</span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className={getPriorityColor('medium')}>Medium</span>
                      </SelectItem>
                      <SelectItem value="low">
                        <span className={getPriorityColor('low')}>Low</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#858585] mb-2 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Budget
                </label>
                <Input
                  type="number"
                  value={budget || ''}
                  onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Enter project budget..."
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#858585] mb-2 block flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[#858585] mb-2 block flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-[#858585] mb-2 block">
                  Category
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Marketing, Development, Research..."
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-[#858585]">Tags</label>
                
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                
                <Input
                  placeholder="Add tag (press Enter)"
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTagAdd((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-[#858585] mx-auto mb-4" />
              <h3 className="text-[#cccccc] mb-2">Team Collaboration</h3>
              <p className="text-[#858585] text-sm">
                Team management features coming soon. Projects will be created with you as the owner.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-6 border-t border-[#2d2d2d]">
          <Button
            onClick={handleCreate}
            disabled={!name || isCreating}
            className="bg-[#007acc] hover:bg-[#005a9a] text-white flex-1"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Project
              </div>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="text-[#858585] border-[#2d2d2d] hover:text-[#cccccc]"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Database Schema

### Enhanced Project Schema

```typescript
// CONVEX SCHEMA - Project management system
// /Users/matthewsimon/Projects/AURA/AURA/convex/schema.ts

export default defineSchema({
  // Projects table
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Project status and priority
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("on-hold"),
      v.literal("archived")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    
    // Project metadata
    projectNo: v.string(), // Sequential project number
    budget: v.optional(v.number()),
    category: v.optional(v.string()),
    
    // Relationships
    userId: v.id("users"), // Project owner
    teamMembers: v.array(v.id("users")), // Team access
    templateId: v.optional(v.id("projectTemplates")),
    
    // Timeline
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    
    // Organization
    tags: v.array(v.string()),
    
    // System projects (Instructions, Content Creation)
    isSystemProject: v.boolean(),
    systemType: v.optional(
      v.union(
        v.literal("instructions"),
        v.literal("content_creation")
      )
    ),
    
    // Analytics
    analytics: v.optional(
      v.object({
        totalFiles: v.number(),
        totalSize: v.number(),
        lastAccessed: v.number(),
        collaborationScore: v.number(),
        completionPercentage: v.number()
      })
    ),
    
    // Archive metadata
    archivedAt: v.optional(v.number()),
    archivedBy: v.optional(v.id("users")),
    archiveReason: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_system", ["isSystemProject"])
    .index("by_created", ["createdAt"])
    .index("by_project_no", ["projectNo"]),

  // Project templates
  projectTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    
    // Template configuration
    template: v.object({
      name: v.string(),
      description: v.string(),
      status: v.string(),
      priority: v.string(),
      budget: v.optional(v.number()),
      tags: v.array(v.string()),
      category: v.string(),
      
      // Pre-configured files/folders
      initialStructure: v.optional(
        v.array(
          v.object({
            name: v.string(),
            type: v.union(v.literal("folder"), v.literal("file")),
            content: v.optional(v.string())
          })
        )
      )
    }),
    
    // Template metadata
    category: v.string(),
    isPublic: v.boolean(),
    isOfficial: v.boolean(),
    
    // Usage statistics
    usageCount: v.number(),
    rating: v.number(),
    
    // Creator
    createdBy: v.id("users"),
    
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"])
    .index("by_creator", ["createdBy"])
    .index("by_rating", ["rating"]),

  // Soft-deleted projects (retention policy)
  deletedProjects: defineTable({
    // Original project data
    originalProject: v.any(), // Full project object
    
    // Deletion metadata
    deletedBy: v.id("users"),
    deletedAt: v.number(),
    deleteReason: v.optional(v.string()),
    
    // Retention policy (30 days default)
    permanentDeleteAt: v.number(),
    
    // Recovery
    recoveredAt: v.optional(v.number()),
    recoveredBy: v.optional(v.id("users"))
  })
    .index("by_deleted_user", ["deletedBy"])
    .index("by_deleted_at", ["deletedAt"])
    .index("by_permanent_delete", ["permanentDeleteAt"]),
});
```

## Convex Functions

### Project CRUD Operations

```typescript
// PROJECT CRUD FUNCTIONS - Database operations
// /Users/matthewsimon/Projects/AURA/AURA/convex/projects.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId, getCurrentUserIdOptional } from "./auth";

// List projects for authenticated user
export const list = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  }
});

// Get single project
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) return null;
    
    const project = await ctx.db.get(projectId);
    
    // Check access (owner or team member)
    if (project && (project.userId === userId || project.teamMembers.includes(userId))) {
      return project;
    }
    
    return null;
  }
});

// Get project statistics
export const getStats = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) return null;
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === "active").length,
      completed: projects.filter(p => p.status === "completed").length,
      onHold: projects.filter(p => p.status === "on-hold").length,
      archived: projects.filter(p => p.status === "archived").length,
      completionRate: 0,
      averageCompletionTime: 0
    };
    
    // Calculate completion rate
    if (stats.total > 0) {
      stats.completionRate = (stats.completed / stats.total) * 100;
    }
    
    // Calculate average completion time
    const completedProjects = projects.filter(p => p.status === "completed" && p.completedAt && p.createdAt);
    if (completedProjects.length > 0) {
      const totalTime = completedProjects.reduce((sum, p) => {
        return sum + (p.completedAt! - p.createdAt);
      }, 0);
      stats.averageCompletionTime = totalTime / completedProjects.length;
    }
    
    return stats;
  }
});

// Get next project number
export const getNextProjectNumber = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserIdOptional(ctx);
    if (!userId) return "001";
    
    const projectCount = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
      .then(projects => projects.length);
    
    return String(projectCount + 1).padStart(3, '0');
  }
});

// Create new project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold"), v.literal("archived")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    projectNo: v.string(),
    budget: v.optional(v.number()),
    category: v.optional(v.string()),
    userId: v.id("users"),
    teamMembers: v.array(v.id("users")),
    templateId: v.optional(v.id("projectTemplates")),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    tags: v.array(v.string()),
    isSystemProject: v.boolean(),
    systemType: v.optional(v.union(v.literal("instructions"), v.literal("content_creation"))),
    createdAt: v.number(),
    updatedAt: v.number()
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Ensure user can only create projects for themselves
    if (args.userId !== userId) {
      throw new Error("Cannot create project for another user");
    }
    
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      status: args.status,
      priority: args.priority,
      projectNo: args.projectNo,
      budget: args.budget,
      category: args.category,
      userId: args.userId,
      teamMembers: args.teamMembers,
      templateId: args.templateId,
      startDate: args.startDate,
      dueDate: args.dueDate,
      tags: args.tags,
      isSystemProject: args.isSystemProject,
      systemType: args.systemType,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt
    });
    
    return projectId;
  }
});

// Update project
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold"), v.literal("archived"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    budget: v.optional(v.number()),
    category: v.optional(v.string()),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    updatedAt: v.number()
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check access
    if (project.userId !== userId && !project.teamMembers.includes(userId)) {
      throw new Error("Access denied");
    }
    
    const updateData = Object.fromEntries(
      Object.entries(args).filter(([key, value]) => key !== "projectId" && value !== undefined)
    );
    
    await ctx.db.patch(args.projectId, updateData);
  }
});

// Soft delete project
export const softDelete = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getCurrentUserId(ctx);
    
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check access (only owner can delete)
    if (project.userId !== userId) {
      throw new Error("Only project owner can delete project");
    }
    
    // Don't allow deletion of system projects
    if (project.isSystemProject) {
      throw new Error("System projects cannot be deleted");
    }
    
    // Move to deleted projects table
    await ctx.db.insert("deletedProjects", {
      originalProject: project,
      deletedBy: userId,
      deletedAt: Date.now(),
      permanentDeleteAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    });
    
    // Delete from projects table
    await ctx.db.delete(projectId);
  }
});

// Archive project
export const archive = mutation({
  args: { 
    projectId: v.id("projects"),
    reason: v.optional(v.string())
  },
  handler: async (ctx, { projectId, reason }) => {
    const userId = await getCurrentUserId(ctx);
    
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check access
    if (project.userId !== userId && !project.teamMembers.includes(userId)) {
      throw new Error("Access denied");
    }
    
    await ctx.db.patch(projectId, {
      status: "archived",
      archivedAt: Date.now(),
      archivedBy: userId,
      archiveReason: reason,
      updatedAt: Date.now()
    });
  }
});

// Duplicate project
export const duplicate = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getCurrentUserId(ctx);
    
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check access
    if (project.userId !== userId && !project.teamMembers.includes(userId)) {
      throw new Error("Access denied");
    }
    
    // Get next project number
    const projectCount = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
      .then(projects => projects.length);
    
    const newProjectNo = String(projectCount + 1).padStart(3, '0');
    
    // Create duplicate
    const duplicateId = await ctx.db.insert("projects", {
      ...project,
      _id: undefined as any,
      name: `${project.name} (Copy)`,
      projectNo: newProjectNo,
      status: "active",
      completedAt: undefined,
      archivedAt: undefined,
      archivedBy: undefined,
      archiveReason: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return duplicateId;
  }
});

// Ensure Instructions project exists
export const ensureInstructionsProject = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUserId = await getCurrentUserId(ctx);
    
    if (currentUserId !== userId) {
      throw new Error("Access denied");
    }
    
    // Check if Instructions project already exists
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.and(
        q.eq(q.field("isSystemProject"), true),
        q.eq(q.field("systemType"), "instructions")
      ))
      .first();
    
    if (existingProject) {
      return existingProject._id;
    }
    
    // Create Instructions project
    const projectId = await ctx.db.insert("projects", {
      name: "Instructions",
      description: "System folder for AI instructions and context files",
      status: "active",
      priority: "medium",
      projectNo: "SYS-001",
      userId: userId,
      teamMembers: [userId],
      tags: ["system", "instructions"],
      isSystemProject: true,
      systemType: "instructions",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return projectId;
  }
});

// Ensure Content Creation project exists
export const ensureContentCreationProject = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUserId = await getCurrentUserId(ctx);
    
    if (currentUserId !== userId) {
      throw new Error("Access denied");
    }
    
    // Check if Content Creation project already exists
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.and(
        q.eq(q.field("isSystemProject"), true),
        q.eq(q.field("systemType"), "content_creation")
      ))
      .first();
    
    if (existingProject) {
      return existingProject._id;
    }
    
    // Create Content Creation project
    const projectId = await ctx.db.insert("projects", {
      name: "Content Creation",
      description: "System folder for content creation, social media posts, and marketing materials",
      status: "active",
      priority: "medium",
      projectNo: "SYS-002",
      userId: userId,
      teamMembers: [userId],
      tags: ["system", "content", "marketing"],
      isSystemProject: true,
      systemType: "content_creation",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return projectId;
  }
});
```

## Usage Examples

### Basic Project Creation

```typescript
// Example: Creating project via sidebar button
export function SidebarProjectCreation() {
  const handleProjectCreated = (project: Project) => {
    // Create corresponding folder in sidebar
    console.log(`Project ${project.name} created!`);
    
    // Navigate to project or refresh sidebar
    window.location.href = `/project/${project._id}`;
  };
  
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#cccccc] font-medium">Projects</span>
        <ProjectCreator
          trigger={
            <button className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          }
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </div>
  );
}
```

### Agent Integration

```typescript
// Example: Agent creating projects automatically
export class FileCreatorAgent extends BaseAgent {
  async execute(tool, input, mutations, context) {
    // Create project for file organization
    const projectId = await mutations.createProject({
      name: `Generated Content - ${new Date().toLocaleDateString()}`,
      description: "Auto-generated project for agent-created files",
      status: "active",
      priority: "medium",
      tags: ["agent-generated", "auto-created"],
      userId: context.userId,
      teamMembers: [context.userId]
    });
    
    // Use project for file organization
    await mutations.createFile({
      name: "agent-generated-file.md",
      content: "Generated content...",
      projectId: projectId,
      userId: context.userId
    });
    
    return {
      success: true,
      message: `Project created and files organized: ${projectId}`
    };
  }
}
```

### Sidebar Integration

```typescript
// Enhanced sidebar with project system folders
const systemSectionItems = useMemo(() => {
  const items = [];
  
  // Instructions system project
  if (instructionsProject) {
    items.push({
      id: instructionsProject._id,
      name: "Instructions",
      type: "project",
      isSystemProject: true,
      children: instructionsFiles.map(file => ({
        id: file._id,
        name: file.name,
        type: "file"
      }))
    });
  }
  
  // Content Creation system project  
  if (contentCreationProject) {
    items.push({
      id: contentCreationProject._id,
      name: "Content Creation", 
      type: "project",
      isSystemProject: true,
      children: contentCreationItems.map(item => ({
        id: item._id,
        name: item.name,
        type: "file"
      }))
    });
  }
  
  return items;
}, [instructionsProject, instructionsFiles, contentCreationProject, contentCreationItems]);

// Filter user projects (exclude system projects)
const userProjects = projects.filter(project => !project.isSystemProject);
```

## Testing

### Project Management Tests

```typescript
// PROJECT MANAGEMENT TESTING SUITE
// /Users/matthewsimon/Projects/AURA/AURA/tests/hooks/useProjects.test.ts

import { renderHook, act } from '@testing-library/react';
import { useProjects } from '@/lib/hooks/useProjects';
import { mockConvexMutations } from '../mocks/convex';

describe('useProjects', () => {
  let mockMutations: ReturnType<typeof mockConvexMutations>;

  beforeEach(() => {
    mockMutations = mockConvexMutations();
  });

  it('creates project correctly', async () => {
    const { result } = renderHook(() => useProjects());
    
    await act(async () => {
      await result.current.createProject({
        name: 'Test Project',
        description: 'A test project',
        status: 'active',
        priority: 'medium'
      });
    });

    expect(mockMutations.createProject).toHaveBeenCalledWith({
      name: 'Test Project',
      description: 'A test project',
      status: 'active',
      priority: 'medium',
      projectNo: expect.any(String),
      userId: expect.any(String),
      teamMembers: expect.any(Array),
      tags: [],
      isSystemProject: false,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number)
    });
  });

  it('ensures system projects exist', async () => {
    const { result } = renderHook(() => useProjects());
    
    await act(async () => {
      await result.current.ensureInstructionsProject();
      await result.current.ensureContentCreationProject();
    });

    expect(mockMutations.ensureInstructionsProject).toHaveBeenCalled();
    expect(mockMutations.ensureContentCreationProject).toHaveBeenCalled();
  });

  it('calculates project stats correctly', () => {
    const mockStats = {
      total: 10,
      active: 6,
      completed: 3,
      onHold: 1,
      archived: 0,
      completionRate: 30,
      averageCompletionTime: 7200000 // 2 hours
    };

    // Test stats calculation logic
    expect(mockStats.completionRate).toBe(30);
    expect(mockStats.averageCompletionTime).toBe(7200000);
  });

  it('handles soft delete correctly', async () => {
    const { result } = renderHook(() => useProjects());
    
    await act(async () => {
      await result.current.deleteProject('project-id' as any);
    });

    expect(mockMutations.softDelete).toHaveBeenCalledWith({
      projectId: 'project-id'
    });
  });
});
```

## Future Enhancements

### Planned Features

- [ ] **Advanced Analytics Dashboard** - Detailed project performance metrics and insights
- [ ] **Team Collaboration** - Multi-user project access with role-based permissions
- [ ] **Project Templates Marketplace** - Community-shared templates with ratings
- [ ] **Gantt Chart View** - Visual timeline and dependency management
- [ ] **Resource Management** - Team member workload and allocation tracking
- [ ] **Budget Tracking** - Expense tracking and budget alerts
- [ ] **Time Tracking** - Built-in time logging and productivity metrics
- [ ] **Integration Hub** - Connect with external project management tools

### Integration Possibilities

- [ ] **Calendar Integration** - Project deadlines and milestone synchronization
- [ ] **Git Integration** - Connect projects with code repositories
- [ ] **File Versioning** - Advanced version control for project files
- [ ] **Email Notifications** - Project updates and milestone alerts
- [ ] **Mobile App** - Project management on mobile devices
- [ ] **API Access** - RESTful API for third-party integrations

## Contributing

When contributing to the Project Management System:

1. **Follow AURA Patterns**: Maintain consistency with architectural principles
2. **State Management**: Properly separate Server/Client/Component state
3. **Real-time Updates**: Ensure all changes sync via Convex
4. **System Projects**: Maintain Instructions and Content Creation auto-creation
5. **Test Coverage**: Include comprehensive tests for all project operations

## Conclusion

The AURA Project Management Integration provides a comprehensive, real-time project management solution that seamlessly integrates with the platform's dashboard, agents, and content creation systems. Built on Convex's real-time database with proper state management, it delivers professional project management capabilities that scale from personal projects to enterprise team collaboration.

Key benefits:
- **Real-time Synchronization**: All project changes sync instantly across devices
- **Intelligent Organization**: Auto-creation of system projects and smart categorization
- **Agent Integration**: Seamless project creation through agent workflows
- **Sidebar Integration**: Natural project management within the dashboard interface
- **Comprehensive Tracking**: Statistics, analytics, and performance insights

This implementation ensures that AURA users have access to sophisticated project management capabilities that integrate naturally with their workflow while maintaining the platform's high performance and user experience standards.
