// Twitter Project Manager
// Handles intelligent project selection and organization

export interface ProjectSelection {
  projectName: string;
  isNewProject: boolean;
  matchConfidence: number;
  reason: string;
}

export interface ProjectOptions {
  suggestedProject?: string;
  contentTopic?: string;
  contentStyle?: string;
  userPreferences?: {
    autoCreateProjects: boolean;
    defaultProject?: string;
  };
}

export class TwitterProjectManager {
  private static instance: TwitterProjectManager;
  private editorStore: any; // Injected from main agent
  
  private constructor() {}
  
  static getInstance(): TwitterProjectManager {
    if (!TwitterProjectManager.instance) {
      TwitterProjectManager.instance = new TwitterProjectManager();
    }
    return TwitterProjectManager.instance;
  }

  // Set editor store externally (injected dependency)
  setEditorStore(editorStore: any) {
    this.editorStore = editorStore;
  }

  async selectProject(options: ProjectOptions): Promise<ProjectSelection> {
    try {
      // If no editor store is available, use fallback
      if (!this.editorStore) {
        return this.fallbackProjectSelection(options);
      }

      const projectFolders = this.editorStore.getState().folders.filter(
        (folder: any) => folder.type === 'project'
      );

    // Strategy 1: Use explicitly suggested project
    if (options.suggestedProject) {
      const explicitMatch = this.findExplicitProject(projectFolders, options.suggestedProject);
      if (explicitMatch) {
        return {
          projectName: explicitMatch.name,
          isNewProject: false,
          matchConfidence: 1.0,
          reason: `User specified project: ${options.suggestedProject}`
        };
      }
    }

    // Strategy 2: Smart project matching based on content
    if (options.contentTopic && options.contentTopic !== 'general') {
      const smartMatch = this.findSmartMatch(projectFolders, options.contentTopic, options.contentStyle);
      if (smartMatch) {
        return {
          projectName: smartMatch.name,
          isNewProject: false,
          matchConfidence: smartMatch.confidence,
          reason: `Auto-matched based on content topic: ${options.contentTopic}`
        };
      }
    }

    // Strategy 3: Use user's default project preference
    if (options.userPreferences?.defaultProject) {
      const defaultMatch = this.findExplicitProject(projectFolders, options.userPreferences.defaultProject);
      if (defaultMatch) {
        return {
          projectName: defaultMatch.name,
          isNewProject: false,
          matchConfidence: 0.8,
          reason: `Using user's default project: ${options.userPreferences.defaultProject}`
        };
      }
    }

    // Strategy 4: Use most recently used regular project
    const recentProject = this.findMostRecentProject(projectFolders);
    if (recentProject) {
      return {
        projectName: recentProject.name,
        isNewProject: false,
        matchConfidence: 0.6,
        reason: `Using most recently used project: ${recentProject.name}`
      };
    }

    // Strategy 5: Create topic-based project if auto-create is enabled
    if (options.userPreferences?.autoCreateProjects && options.contentTopic && options.contentTopic !== 'general') {
      const newProjectName = this.generateTopicProjectName(options.contentTopic);
      // Note: Actual folder creation will be handled by the main agent
      
      return {
        projectName: newProjectName,
        isNewProject: true,
        matchConfidence: 0.9,
        reason: `Will create new project for topic: ${options.contentTopic}`
      };
    }

    // Strategy 6: Fallback to "Social Media" project
    const socialMediaProject = this.findSocialMediaProject(projectFolders);
    if (socialMediaProject) {
      return {
        projectName: socialMediaProject.name,
        isNewProject: false,
        matchConfidence: 0.5,
        reason: `Using existing Social Media project`
      };
    }

    // Final fallback: Create "Social Media" project
    // Note: Actual folder creation will be handled by the main agent
    return {
      projectName: "Social Media",
      isNewProject: true,
      matchConfidence: 0.4,
      reason: `Will create default Social Media project`
    };
  } catch (error) {
    // Error fallback
    return this.fallbackProjectSelection(options);
  }
  }

  private fallbackProjectSelection(options: ProjectOptions): ProjectSelection {
    return {
      projectName: options.suggestedProject || "Social Media",
      isNewProject: false,
      matchConfidence: 0.3,
      reason: "Fallback selection due to store unavailability"
    };
  }

  private findExplicitProject(projectFolders: any[], projectName: string): any | null {
    return projectFolders.find(folder =>
      folder.name.toLowerCase().includes(projectName.toLowerCase()) &&
      folder.name.toLowerCase() !== "instructions" &&
      !folder.pinned
    ) || null;
  }

  private findSmartMatch(projectFolders: any[], topic: string, style?: string): { name: string; confidence: number } | null {
    const regularFolders = projectFolders.filter(folder =>
      !folder.pinned &&
      folder.name.toLowerCase() !== "instructions" &&
      folder.id !== "instructions-folder"
    );

    // Topic-based matching
    const topicMatches = this.getTopicMatches(topic, style);
    
    for (const match of topicMatches) {
      const folder = regularFolders.find(f => 
        f.name.toLowerCase().includes(match.keyword.toLowerCase())
      );
      if (folder) {
        return {
          name: folder.name,
          confidence: match.confidence
        };
      }
    }

    return null;
  }

  private getTopicMatches(topic: string, style?: string): { keyword: string; confidence: number }[] {
    const topicMatches: Record<string, { keyword: string; confidence: number }[]> = {
      japan: [
        { keyword: 'japan', confidence: 0.95 },
        { keyword: 'travel', confidence: 0.8 },
        { keyword: 'culture', confidence: 0.7 },
        { keyword: 'tourism', confidence: 0.8 }
      ],
      technology: [
        { keyword: 'tech', confidence: 0.95 },
        { keyword: 'development', confidence: 0.9 },
        { keyword: 'coding', confidence: 0.9 },
        { keyword: 'innovation', confidence: 0.8 },
        { keyword: 'digital', confidence: 0.7 }
      ],
      business: [
        { keyword: 'business', confidence: 0.95 },
        { keyword: 'marketing', confidence: 0.9 },
        { keyword: 'strategy', confidence: 0.8 },
        { keyword: 'growth', confidence: 0.8 },
        { keyword: 'startup', confidence: 0.9 }
      ],
      health: [
        { keyword: 'health', confidence: 0.95 },
        { keyword: 'fitness', confidence: 0.9 },
        { keyword: 'wellness', confidence: 0.9 },
        { keyword: 'lifestyle', confidence: 0.7 }
      ],
      motivation: [
        { keyword: 'motivation', confidence: 0.95 },
        { keyword: 'inspiration', confidence: 0.9 },
        { keyword: 'personal', confidence: 0.7 },
        { keyword: 'growth', confidence: 0.8 }
      ]
    };

    return topicMatches[topic] || [];
  }

  private findMostRecentProject(projectFolders: any[]): any | null {
    const regularFolders = projectFolders.filter(folder =>
      !folder.pinned &&
      folder.name.toLowerCase() !== "instructions" &&
      folder.id !== "instructions-folder"
    );

    // For now, return the first regular folder
    // TODO: Implement actual "most recently used" tracking
    return regularFolders[0] || null;
  }

  private findSocialMediaProject(projectFolders: any[]): any | null {
    return projectFolders.find(folder =>
      folder.name.toLowerCase().includes('social') &&
      !folder.pinned
    ) || null;
  }

  private generateTopicProjectName(topic: string): string {
    const topicToProjectName: Record<string, string> = {
      japan: 'Japan Content',
      technology: 'Tech Posts',
      business: 'Business Content',
      health: 'Health & Fitness',
      motivation: 'Motivational Posts',
      travel: 'Travel Content',
      food: 'Food & Cuisine',
      education: 'Educational Posts',
      productivity: 'Productivity Tips',
      creativity: 'Creative Content'
    };

    return topicToProjectName[topic] || `${topic.charAt(0).toUpperCase() + topic.slice(1)} Posts`;
  }
}

// Export singleton instance
export const projectManager = TwitterProjectManager.getInstance();
