# AURA Platform - Content Creation System

_Intelligent Content Management with Real-time Collaboration_

_Last Updated: August 21, 2025_

## Overview

The AURA Platform includes a sophisticated **Content Creation System** that provides users with intelligent content management capabilities, automated workflows, and seamless integration with marketing campaigns and social media platforms. Built on Convex's real-time database with AURA's component architecture, the system enables collaborative content creation with AI assistance.

## Features

### 🎨 Content Management

- **System Folder Integration** - Permanent Content Creation folder alongside Instructions
- **Multi-Platform Support** - Optimized for Twitter, Instagram, Facebook, LinkedIn, Reddit, YouTube
- **Content Type Organization** - Posts, campaigns, notes, documents, and custom types
- **Real-time Collaboration** - Team-based content editing with live updates
- **Version History** - Complete revision tracking with rollback capabilities

### 📱 Platform-Specific Tools

- **Twitter/X**: Character counting, thread planning, hashtag optimization
- **Instagram**: Visual content planning, Story scheduling, Reels management
- **Facebook**: Long-form content, community engagement, event promotion
- **LinkedIn**: Professional content, thought leadership, B2B focused
- **Reddit**: Community-specific content, discussion threads, AMA planning
- **YouTube**: Video content planning, description optimization, thumbnail management

### 🤖 AI-Powered Features

- **Content Suggestions** - AI-powered content ideas based on campaign objectives
- **Tone Optimization** - Platform-specific voice and messaging adjustments
- **Performance Prediction** - AI analysis of content performance potential
- **Automated Scheduling** - Optimal posting times based on audience insights
- **Content Templates** - Pre-built templates for common content types

## Architecture

### File Structure

```
AURA/
├── lib/hooks/
│   ├── useContentCreation.ts               # Content management hook
│   ├── useContentTemplates.ts              # Template management
│   └── useContentAnalytics.ts              # Performance tracking
├── app/_components/dashboard/
│   ├── contentCreator.tsx                  # Main creation interface
│   ├── contentEditor.tsx                   # Rich text editor
│   ├── platformSelector.tsx                # Platform-specific tools
│   └── contentCalendar.tsx                 # Scheduling interface
├── app/_components/content/
│   ├── templateSelector.tsx                # Content template picker
│   ├── performancePreview.tsx              # AI performance insights
│   ├── collaborationPanel.tsx              # Team collaboration tools
│   └── revisionHistory.tsx                 # Version control
├── convex/
│   ├── contentCreation.ts                  # Content CRUD operations
│   ├── contentTemplates.ts                 # Template management
│   ├── contentAnalytics.ts                 # Performance tracking
│   └── contentCollaboration.ts             # Team features
└── types/
    ├── content.ts                          # Content type definitions
    ├── platforms.ts                        # Platform-specific types
    └── templates.ts                        # Template type definitions
```

### AURA State Management Implementation

Following AURA's strict state separation:

```typescript
// SERVER STATE (Convex) - All persistent content data
interface ContentItem {
  _id: Id<"contentItems">;
  name: string;
  content: string;
  platform: SocialPlatform;
  type: ContentType;
  status: "draft" | "review" | "approved" | "published" | "archived";
  
  // Metadata
  tags: string[];
  hashtags?: string[];
  scheduledAt?: number;
  publishedAt?: number;
  
  // Performance data
  analytics?: ContentAnalytics;
  
  // Collaboration
  collaborators: Id<"users">[];
  lastEditedBy: Id<"users">;
  
  // Project association
  projectId: Id<"projects">;
  userId: Id<"users">;
  
  // Versioning
  version: number;
  parentVersion?: Id<"contentItems">;
  
  createdAt: number;
  updatedAt: number;
}

// CLIENT STATE (Zustand) - UI-only concerns
interface ContentCreationUIStore {
  activeContentId: string | null;
  selectedPlatforms: SocialPlatform[];
  editorMode: "write" | "preview" | "schedule";
  showTemplates: boolean;
  showAnalytics: boolean;
  collaborationPanelOpen: boolean;
  
  // UI actions
  setActiveContent: (id: string | null) => void;
  togglePlatform: (platform: SocialPlatform) => void;
  setEditorMode: (mode: string) => void;
  toggleTemplates: () => void;
  toggleAnalytics: () => void;
  toggleCollaboration: () => void;
}

// COMPONENT STATE (useState) - Ephemeral editing state  
const [currentDraft, setCurrentDraft] = useState('');
const [isAutoSaving, setIsAutoSaving] = useState(false);
const [unsavedChanges, setUnsavedChanges] = useState(false);
const [editorFocus, setEditorFocus] = useState(false);
```

## Core Implementation

### Content Creation Hook

```typescript
// CONTENT CREATION HOOK - Central content management
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useContentCreation.ts

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ContentItem, ContentType, SocialPlatform } from '@/types/content';
import { useUser } from './useUser';
import { useEffect } from 'react';

interface CreateContentArgs {
  name: string;
  content: string;
  platform: SocialPlatform;
  type: ContentType;
  tags?: string[];
  scheduledAt?: number;
  projectId?: Id<"projects">;
}

interface UpdateContentArgs {
  contentId: Id<"contentItems">;
  name?: string;
  content?: string;
  platform?: SocialPlatform;
  type?: ContentType;
  status?: string;
  tags?: string[];
  scheduledAt?: number;
}

export function useContentCreation() {
  const { user } = useUser();
  
  // Content Creation project management
  const contentCreationProject = useQuery(
    api.contentCreation.getContentCreationProject,
    user ? { userId: user._id } : "skip"
  );
  
  // Content items
  const contentCreationItems = useQuery(
    api.contentCreation.getContentCreationItems,
    user ? { userId: user._id } : "skip"
  );
  
  // Content templates
  const contentTemplates = useQuery(
    api.contentTemplates.getTemplates,
    user ? { userId: user._id } : "skip"
  );
  
  // Mutations
  const createContentItem = useMutation(api.contentCreation.createContentItem);
  const updateContentItem = useMutation(api.contentCreation.updateContentItem);
  const deleteContentItem = useMutation(api.contentCreation.deleteContentItem);
  const duplicateContentItem = useMutation(api.contentCreation.duplicateContentItem);
  const scheduleContent = useMutation(api.contentCreation.scheduleContent);
  
  // Auto-create Content Creation project on user authentication
  const ensureContentCreationProject = useMutation(
    api.contentCreation.ensureContentCreationProject
  );
  
  useEffect(() => {
    if (user && !contentCreationProject) {
      ensureContentCreationProject({ userId: user._id });
    }
  }, [user, contentCreationProject, ensureContentCreationProject]);
  
  const createContent = async (args: CreateContentArgs) => {
    if (!user) throw new Error('User must be authenticated');
    
    return await createContentItem({
      name: args.name,
      content: args.content,
      platform: args.platform,
      type: args.type,
      status: 'draft',
      tags: args.tags || [],
      scheduledAt: args.scheduledAt,
      projectId: args.projectId || contentCreationProject?._id,
      userId: user._id,
      collaborators: [user._id],
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  };
  
  const updateContent = async (args: UpdateContentArgs) => {
    return await updateContentItem(args);
  };
  
  const deleteContent = async (contentId: Id<"contentItems">) => {
    return await deleteContentItem({ contentId });
  };
  
  const duplicateContent = async (contentId: Id<"contentItems">) => {
    return await duplicateContentItem({ contentId });
  };
  
  const scheduleContentPublication = async (
    contentId: Id<"contentItems">,
    scheduledAt: number
  ) => {
    return await scheduleContent({ contentId, scheduledAt });
  };
  
  return {
    // Data
    contentCreationProject: contentCreationProject || null,
    contentCreationItems: contentCreationItems || [],
    contentTemplates: contentTemplates || [],
    
    // Loading states
    isLoading: contentCreationProject === undefined,
    itemsLoading: contentCreationItems === undefined,
    templatesLoading: contentTemplates === undefined,
    
    // Actions
    createContent,
    updateContent,
    deleteContent,
    duplicateContent,
    scheduleContentPublication
  };
}

// Platform-specific content optimization
export function useContentOptimization(platform: SocialPlatform) {
  const getOptimalLength = () => {
    switch (platform) {
      case 'twitter': return { min: 71, max: 280, optimal: 120 };
      case 'linkedin': return { min: 150, max: 3000, optimal: 1500 };
      case 'instagram': return { min: 125, max: 2200, optimal: 300 };
      case 'facebook': return { min: 100, max: 63206, optimal: 500 };
      case 'reddit': return { min: 20, max: 40000, optimal: 200 };
      case 'youtube': return { min: 125, max: 1000, optimal: 200 };
      default: return { min: 0, max: 1000, optimal: 200 };
    }
  };
  
  const getOptimalHashtags = () => {
    switch (platform) {
      case 'twitter': return { min: 1, max: 3, optimal: 2 };
      case 'instagram': return { min: 5, max: 30, optimal: 15 };
      case 'linkedin': return { min: 1, max: 5, optimal: 3 };
      case 'facebook': return { min: 0, max: 5, optimal: 2 };
      case 'reddit': return { min: 0, max: 0, optimal: 0 }; // No hashtags
      case 'youtube': return { min: 3, max: 15, optimal: 8 };
      default: return { min: 1, max: 5, optimal: 3 };
    }
  };
  
  const getBestPostingTimes = () => {
    // Platform-specific optimal posting times
    switch (platform) {
      case 'twitter': return ['9:00 AM', '12:00 PM', '6:00 PM'];
      case 'instagram': return ['11:00 AM', '1:00 PM', '5:00 PM'];
      case 'linkedin': return ['8:00 AM', '12:00 PM', '5:00 PM'];
      case 'facebook': return ['1:00 PM', '3:00 PM', '8:00 PM'];
      case 'reddit': return ['6:00 AM', '8:00 AM', '9:00 PM'];
      case 'youtube': return ['2:00 PM', '8:00 PM', '9:00 PM'];
      default: return ['12:00 PM', '6:00 PM', '8:00 PM'];
    }
  };
  
  return {
    getOptimalLength,
    getOptimalHashtags, 
    getBestPostingTimes
  };
}
```

### Content Creator Component

```typescript
// CONTENT CREATOR - Main content creation interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/contentCreator.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Save, 
  Eye, 
  Calendar, 
  Hash, 
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { ContentType, SocialPlatform } from '@/types/content';
import { useContentCreation, useContentOptimization } from '@/lib/hooks/useContentCreation';
import { PlatformSelector } from './platformSelector';
import { ContentTemplates } from '../content/templateSelector';
import { PerformancePreview } from '../content/performancePreview';

interface ContentCreatorProps {
  trigger?: React.ReactNode;
  initialPlatform?: SocialPlatform;
  initialType?: ContentType;
  onContentCreated?: (contentId: string) => void;
}

export function ContentCreator({ 
  trigger, 
  initialPlatform = 'twitter',
  initialType = 'post',
  onContentCreated 
}: ContentCreatorProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  // Content form state (Component State - ephemeral)
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>(initialPlatform);
  const [type, setType] = useState<ContentType>(initialType);
  const [tags, setTags] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<number | undefined>();
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Hooks
  const { createContent } = useContentCreation();
  const { getOptimalLength, getOptimalHashtags, getBestPostingTimes } = 
    useContentOptimization(platform);
  
  // Auto-save functionality
  useEffect(() => {
    if (name || content) {
      setUnsavedChanges(true);
      const autoSaveTimer = setTimeout(() => {
        // Auto-save as draft
        handleAutoSave();
      }, 5000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [name, content]);
  
  const handleAutoSave = useCallback(async () => {
    if (!unsavedChanges || (!name && !content)) return;
    
    setIsSaving(true);
    try {
      // Save as draft
      await createContent({
        name: name || `${platform} ${type} - ${new Date().toLocaleDateString()}`,
        content,
        platform,
        type,
        tags,
      });
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [name, content, platform, type, tags, unsavedChanges, createContent]);
  
  const handleCreate = useCallback(async () => {
    if (!name || !content) return;
    
    setIsCreating(true);
    try {
      const contentId = await createContent({
        name,
        content,
        platform,
        type,
        tags,
        scheduledAt,
      });
      
      // Reset form
      setName('');
      setContent('');
      setTags([]);
      setHashtags([]);
      setScheduledAt(undefined);
      setUnsavedChanges(false);
      
      // Callback
      onContentCreated?.(contentId);
      
      // Close dialog
      setIsOpen(false);
      
    } catch (error) {
      console.error('Content creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  }, [name, content, platform, type, tags, scheduledAt, createContent, onContentCreated]);
  
  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const handleHashtagAdd = (hashtag: string) => {
    const cleanTag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
    if (cleanTag && !hashtags.includes(cleanTag)) {
      const maxHashtags = getOptimalHashtags().max;
      if (hashtags.length < maxHashtags) {
        setHashtags([...hashtags, cleanTag]);
      }
    }
  };
  
  // Content optimization insights
  const lengthData = getOptimalLength();
  const currentLength = content.length;
  const isOptimalLength = currentLength >= lengthData.min && currentLength <= lengthData.optimal;
  const lengthStatus = currentLength === 0 ? 'empty' : 
                     currentLength < lengthData.min ? 'short' :
                     currentLength <= lengthData.optimal ? 'optimal' :
                     currentLength <= lengthData.max ? 'long' : 'too_long';
  
  const hashtagData = getOptimalHashtags();
  const currentHashtagCount = hashtags.length;
  const isOptimalHashtags = currentHashtagCount >= hashtagData.min && 
                           currentHashtagCount <= hashtagData.optimal;

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
        Create Content
      </Button>
    );
  }
  
  return (
    <Card className="bg-[#1e1e1e] border-[#2d2d2d] max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#cccccc] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#007acc]" />
            Create Content
            {isSaving && (
              <Badge variant="secondary" className="ml-2">
                Auto-saving...
              </Badge>
            )}
            {unsavedChanges && (
              <Badge variant="outline" className="ml-2 text-orange-400 border-orange-400">
                Unsaved changes
              </Badge>
            )}
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
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            {/* Platform & Type Selection */}
            <div className="space-y-4">
              <PlatformSelector
                selectedPlatform={platform}
                onPlatformChange={setPlatform}
              />
              
              <div className="flex gap-2">
                {(['post', 'campaign', 'note', 'document'] as ContentType[]).map(contentType => (
                  <Button
                    key={contentType}
                    variant={type === contentType ? "default" : "outline"}
                    size="sm"
                    onClick={() => setType(contentType)}
                    className={type === contentType ? 
                      "bg-[#007acc] text-white" : 
                      "text-[#858585] border-[#2d2d2d] hover:text-[#cccccc]"
                    }
                  >
                    {contentType}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Content Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#858585] mb-2 block">
                  Content Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter content name..."
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#858585]">
                    Content
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`${
                      lengthStatus === 'optimal' ? 'text-green-400' :
                      lengthStatus === 'short' || lengthStatus === 'long' ? 'text-yellow-400' :
                      lengthStatus === 'too_long' ? 'text-red-400' :
                      'text-[#858585]'
                    }`}>
                      {currentLength}/{lengthData.optimal}
                    </span>
                    {lengthStatus === 'optimal' && 
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    }
                  </div>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Create ${type} content for ${platform}...`}
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc] min-h-[120px]"
                />
                
                {/* Length guidance */}
                <div className="flex items-center gap-4 text-xs text-[#858585]">
                  <span>Min: {lengthData.min}</span>
                  <span>Optimal: {lengthData.optimal}</span>
                  <span>Max: {lengthData.max}</span>
                </div>
              </div>
              
              {/* Hashtags (if platform supports them) */}
              {platform !== 'reddit' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-[#858585] flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Hashtags
                    </label>
                    <span className={`text-xs ${
                      isOptimalHashtags ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {currentHashtagCount}/{hashtagData.optimal}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map(hashtag => (
                      <Badge
                        key={hashtag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setHashtags(hashtags.filter(h => h !== hashtag))}
                      >
                        #{hashtag} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <Input
                    placeholder="Add hashtag (press Enter)"
                    className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleHashtagAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              )}
              
              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm text-[#858585] flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Tags
                </label>
                
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer text-[#cccccc] border-[#2d2d2d]"
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
            
            {/* Optimization Insights */}
            <Card className="bg-[#2d2d2d]/50 border-[#007acc]/20">
              <CardHeader>
                <CardTitle className="text-sm text-[#007acc] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Optimization Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#858585]">Length:</span>
                    <span className={`ml-2 ${
                      lengthStatus === 'optimal' ? 'text-green-400' :
                      lengthStatus === 'short' || lengthStatus === 'long' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {lengthStatus === 'optimal' ? 'Optimal' :
                       lengthStatus === 'short' ? 'Too short' :
                       lengthStatus === 'long' ? 'Getting long' :
                       lengthStatus === 'too_long' ? 'Too long' : 'Empty'}
                    </span>
                  </div>
                  
                  {platform !== 'reddit' && (
                    <div>
                      <span className="text-[#858585]">Hashtags:</span>
                      <span className={`ml-2 ${
                        isOptimalHashtags ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {isOptimalHashtags ? 'Good' : 'Could improve'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-[#858585]">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Best times: {getBestPostingTimes().join(', ')}
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4">
              <Button
                onClick={handleCreate}
                disabled={!name || !content || isCreating}
                className="bg-[#007acc] hover:bg-[#005a9a] text-white flex-1"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Create Content
                  </div>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setActiveTab('preview')}
                disabled={!content}
                className="text-[#858585] border-[#2d2d2d]"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setActiveTab('schedule')}
                disabled={!name || !content}
                className="text-[#858585] border-[#2d2d2d]"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <ContentTemplates
              platform={platform}
              type={type}
              onTemplateSelect={(template) => {
                setName(template.name);
                setContent(template.content);
                setTags(template.tags || []);
                setActiveTab('create');
              }}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <PerformancePreview
              content={content}
              platform={platform}
              hashtags={hashtags}
              tags={tags}
            />
          </TabsContent>
          
          <TabsContent value="schedule">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#858585] mb-2 block">
                  Schedule Publication
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setScheduledAt(new Date(e.target.value).getTime())}
                  className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-[#858585]">Recommended Times</label>
                <div className="grid grid-cols-3 gap-2">
                  {getBestPostingTimes().map(time => (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const [hour, meridiem] = time.split(' ');
                        const [hourNum, minute] = hour.split(':').map(Number);
                        const adjustedHour = meridiem === 'PM' && hourNum !== 12 ? 
                          hourNum + 12 : 
                          meridiem === 'AM' && hourNum === 12 ? 0 : hourNum;
                        
                        today.setHours(adjustedHour, minute, 0, 0);
                        setScheduledAt(today.getTime());
                      }}
                      className="text-xs text-[#858585] border-[#2d2d2d]"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

## Database Schema

### Enhanced Content Creation Schema

```typescript
// CONVEX SCHEMA - Content creation and management
// /Users/matthewsimon/Projects/AURA/AURA/convex/schema.ts

export default defineSchema({
  // Content items
  contentItems: defineTable({
    name: v.string(),
    content: v.string(),
    
    // Platform and type
    platform: v.union(
      v.literal("twitter"),
      v.literal("instagram"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube"),
      v.literal("other")
    ),
    type: v.union(
      v.literal("post"),
      v.literal("campaign"),
      v.literal("note"),
      v.literal("document"),
      v.literal("template"),
      v.literal("other")
    ),
    
    // Content status
    status: v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    ),
    
    // Metadata
    tags: v.array(v.string()),
    hashtags: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    
    // Scheduling
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    
    // Analytics
    analytics: v.optional(
      v.object({
        views: v.number(),
        likes: v.number(),
        shares: v.number(),
        comments: v.number(),
        clickThroughRate: v.number(),
        engagementRate: v.number(),
        reach: v.number()
      })
    ),
    
    // Collaboration
    collaborators: v.array(v.id("users")),
    lastEditedBy: v.id("users"),
    comments: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          content: v.string(),
          createdAt: v.number()
        })
      )
    ),
    
    // Project association
    projectId: v.id("projects"),
    userId: v.id("users"),
    
    // Versioning
    version: v.number(),
    parentVersion: v.optional(v.id("contentItems")),
    revisionHistory: v.optional(
      v.array(
        v.object({
          version: v.number(),
          content: v.string(),
          editedBy: v.id("users"),
          editedAt: v.number(),
          changesSummary: v.string()
        })
      )
    ),
    
    // Media attachments
    attachments: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
          url: v.string(),
          name: v.string(),
          size: v.number()
        })
      )
    ),
    
    // AI insights
    aiInsights: v.optional(
      v.object({
        sentimentScore: v.number(),
        readabilityScore: v.number(),
        engagementPrediction: v.number(),
        suggestedImprovements: v.array(v.string()),
        generatedAt: v.number()
      })
    ),
    
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_platform", ["platform"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_scheduled", ["scheduledAt"])
    .index("by_created", ["createdAt"]),

  // Content templates
  contentTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    content: v.string(),
    
    // Template metadata
    platform: v.union(
      v.literal("twitter"),
      v.literal("instagram"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube"),
      v.literal("universal")
    ),
    type: v.union(
      v.literal("post"),
      v.literal("campaign"),
      v.literal("announcement"),
      v.literal("promotional"),
      v.literal("educational"),
      v.literal("engagement"),
      v.literal("other")
    ),
    category: v.string(),
    
    // Template configuration
    variables: v.optional(
      v.array(
        v.object({
          name: v.string(),
          placeholder: v.string(),
          required: v.boolean()
        })
      )
    ),
    
    // Usage and ratings
    usageCount: v.number(),
    rating: v.number(),
    tags: v.array(v.string()),
    
    // Sharing
    isPublic: v.boolean(),
    isOfficial: v.boolean(),
    createdBy: v.id("users"),
    
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_platform", ["platform"])
    .index("by_type", ["type"])
    .index("by_public", ["isPublic"])
    .index("by_creator", ["createdBy"])
    .index("by_rating", ["rating"]),
});
```

## Testing

### Content Creation Tests

```typescript
// CONTENT CREATION TESTING SUITE
// /Users/matthewsimon/Projects/AURA/AURA/tests/hooks/useContentCreation.test.ts

import { renderHook, act } from '@testing-library/react';
import { useContentCreation } from '@/lib/hooks/useContentCreation';
import { mockConvexQueries, mockConvexMutations } from '../mocks/convex';

describe('useContentCreation', () => {
  let mockQueries: ReturnType<typeof mockConvexQueries>;
  let mockMutations: ReturnType<typeof mockConvexMutations>;

  beforeEach(() => {
    mockQueries = mockConvexQueries();
    mockMutations = mockConvexMutations();
  });

  it('creates content creation project automatically', async () => {
    const { result } = renderHook(() => useContentCreation());
    
    expect(mockMutations.ensureContentCreationProject).toHaveBeenCalled();
  });

  it('creates content item correctly', async () => {
    const { result } = renderHook(() => useContentCreation());
    
    await act(async () => {
      await result.current.createContent({
        name: 'Test Post',
        content: 'This is a test post',
        platform: 'twitter',
        type: 'post',
        tags: ['test']
      });
    });

    expect(mockMutations.createContentItem).toHaveBeenCalledWith({
      name: 'Test Post',
      content: 'This is a test post',
      platform: 'twitter',
      type: 'post',
      status: 'draft',
      tags: ['test'],
      userId: expect.any(String),
      collaborators: expect.any(Array),
      version: 1,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number)
    });
  });

  it('optimizes content for platform', () => {
    const { result } = renderHook(() => 
      useContentOptimization('twitter')
    );
    
    const lengthData = result.current.getOptimalLength();
    expect(lengthData).toEqual({
      min: 71,
      max: 280,
      optimal: 120
    });
    
    const hashtagData = result.current.getOptimalHashtags();
    expect(hashtagData).toEqual({
      min: 1,
      max: 3,
      optimal: 2
    });
  });

  it('schedules content correctly', async () => {
    const { result } = renderHook(() => useContentCreation());
    const scheduledTime = Date.now() + 86400000; // Tomorrow
    
    await act(async () => {
      await result.current.scheduleContentPublication('content-id', scheduledTime);
    });

    expect(mockMutations.scheduleContent).toHaveBeenCalledWith({
      contentId: 'content-id',
      scheduledAt: scheduledTime
    });
  });
});
```

## Integration with Sidebar

### Enhanced Sidebar Integration

```typescript
// SIDEBAR INTEGRATION - Content Creation system folder
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/dashSidebar.tsx

// Add Content Creation system section alongside Instructions
const systemSectionItems = useMemo(() => {
  const items: SidebarItem[] = [];
  
  // Instructions system folder
  if (instructionsProject) {
    items.push({
      id: instructionsProject._id,
      name: "Instructions",
      type: "project",
      isSystemProject: true,
      children: instructionsFiles.map(file => ({
        id: file._id,
        name: file.name,
        type: "file",
        path: file.path || file.name,
        fileType: file.fileType,
        isSystemFile: true
      }))
    });
  }
  
  // Content Creation system folder
  if (contentCreationProject) {
    items.push({
      id: contentCreationProject._id,
      name: "Content Creation",
      type: "project", 
      isSystemProject: true,
      children: contentCreationItems.map(item => ({
        id: item._id,
        name: item.name,
        type: "file",
        path: item.name,
        platform: item.platform,
        contentType: item.type,
        isSystemFile: true
      }))
    });
  }
  
  return items;
}, [instructionsProject, instructionsFiles, contentCreationProject, contentCreationItems]);

// Render system section
<div className="space-y-1">
  <div className="flex items-center justify-between px-2 py-1">
    <span className="text-xs font-semibold text-[#858585] uppercase tracking-wide">
      System
    </span>
    <ContentCreator
      trigger={
        <button
          className="hover:bg-[#2d2d2d] p-0.5 rounded transition-colors"
          aria-label="Create new content"
        >
          <Plus className="w-3 h-3" />
        </button>
      }
      onContentCreated={(contentId) => {
        console.log("New content created:", contentId);
      }}
    />
  </div>
  
  {systemSectionItems.map(item => (
    <SidebarProjectItem
      key={item.id}
      item={item}
      level={0}
      isExpanded={expandedItems.has(item.id)}
      onToggleExpand={() => toggleExpanded(item.id)}
      onItemClick={handleItemClick}
      onDeleteClick={item.isSystemProject ? undefined : handleDeleteClick}
    />
  ))}
</div>
```

## Premium Features

### Advanced Content Analytics

```typescript
// PREMIUM ANALYTICS - Content performance insights
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/content/contentAnalytics.tsx

interface ContentAnalyticsProps {
  contentId: string;
  showDetailed?: boolean;
}

export function ContentAnalytics({ contentId, showDetailed = false }: ContentAnalyticsProps) {
  const analytics = useQuery(api.contentAnalytics.getContentAnalytics, { contentId });
  const { user } = useUser();
  
  // Premium feature gating
  if (!user?.subscription?.tier || user.subscription.tier === 'free') {
    return (
      <Card className="bg-[#1e1e1e] border-[#2d2d2d]">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-[#858585] mx-auto mb-3" />
          <h3 className="text-[#cccccc] mb-2">Content Analytics</h3>
          <p className="text-[#858585] text-sm mb-4">
            Get detailed performance insights for your content.
          </p>
          <Button className="bg-[#007acc] hover:bg-[#005a9a] text-white">
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!analytics) return <AnalyticsSkeleton />;
  
  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Views"
          value={analytics.views.toLocaleString()}
          change="+12%"
          trend="up"
        />
        <MetricCard
          title="Engagement"
          value={`${analytics.engagementRate.toFixed(1)}%`}
          change="+2.3%"
          trend="up"
        />
        <MetricCard
          title="Reach"
          value={analytics.reach.toLocaleString()}
          change="+8%"
          trend="up"
        />
        <MetricCard
          title="CTR"
          value={`${analytics.clickThroughRate.toFixed(2)}%`}
          change="+0.5%"
          trend="up"
        />
      </div>
      
      {showDetailed && (
        <>
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#cccccc]">Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.timeSeriesData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="views" stroke="#007acc" />
                    <Line dataKey="engagement" stroke="#4ec9b0" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#cccccc] flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#007acc]" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-[#858585] text-sm">Sentiment Score:</span>
                  <span className="ml-2 text-[#cccccc]">
                    {analytics.aiInsights.sentimentScore.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[#858585] text-sm">Engagement Prediction:</span>
                  <span className="ml-2 text-[#cccccc]">
                    {analytics.aiInsights.engagementPrediction.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[#858585] text-sm">Suggested Improvements:</span>
                  <ul className="mt-1 ml-2 space-y-1">
                    {analytics.aiInsights.suggestedImprovements.map((suggestion, index) => (
                      <li key={index} className="text-[#cccccc] text-sm">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
```

## Conclusion

The AURA Content Creation System provides a comprehensive, AI-powered content management solution that seamlessly integrates with the platform's real-time architecture. With features like intelligent optimization, collaborative editing, and advanced analytics, it empowers users to create high-quality, platform-optimized content efficiently.

Key advantages:
- **Intelligent Optimization**: Platform-specific content recommendations and insights
- **Real-time Collaboration**: Team-based content creation with live updates
- **System Integration**: Permanent folder structure with seamless project management
- **AI-Powered Features**: Content suggestions, performance prediction, and optimization
- **Premium Analytics**: Detailed performance tracking and AI insights

This implementation follows AURA's architectural principles with proper state management, premium feature gating, and comprehensive testing coverage, providing a professional content creation experience that scales with user needs.
