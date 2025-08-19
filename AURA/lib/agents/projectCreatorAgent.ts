// PROJECT CREATOR AGENT - Natural language multi-file project bootstrap
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/projectCreatorAgent.ts

import { BaseAgent, AgentTool, ConvexMutations, AgentExecutionContext, AgentExecutionResult } from "./base";

export class ProjectCreatorAgent extends BaseAgent {
  readonly id = "project-creator";
  readonly name = "Project Creator Agent";
  readonly description = "Create new projects with natural language descriptions and optional scaffolding";
  readonly icon = "📁";
  readonly isPremium = false;

  readonly tools: AgentTool[] = [
    {
      command: "/create-project",
      name: "Create Project",
      description: "Create a new project with scaffolding and initial files",
      usage: "/create-project <project-name> [description] [template:template]",
      examples: [
        "/create-project Marketing Campaign Q4 2024",
        "/create-project Blog Content template:content",
        "/create-project Social Media Strategy description:Complete social media strategy for product launch"
      ]
    }
  ];

  // Project templates with initial file structures
  private readonly projectTemplates = new Map<string, ProjectTemplate>([
    ["default", {
      name: "Default Project",
      description: "Basic project structure",
      files: [
        { name: "README.md", type: "document", content: this.getReadmeTemplate() },
        { name: "notes.md", type: "note", content: this.getNotesTemplate() }
      ]
    }],
    ["content", {
      name: "Content Creation Project",
      description: "Project for content creation and management",
      files: [
        { name: "README.md", type: "document", content: this.getContentReadmeTemplate() },
        { name: "content-calendar.md", type: "document", content: this.getContentCalendarTemplate() },
        { name: "style-guide.md", type: "document", content: this.getStyleGuideTemplate() },
        { name: "notes.md", type: "note", content: this.getNotesTemplate() }
      ]
    }],
    ["marketing", {
      name: "Marketing Campaign Project",
      description: "Complete marketing campaign structure",
      files: [
        { name: "README.md", type: "document", content: this.getMarketingReadmeTemplate() },
        { name: "campaign-brief.md", type: "campaign", content: this.getCampaignBriefTemplate() },
        { name: "target-audience.md", type: "document", content: this.getAudienceTemplate() },
        { name: "content-plan.md", type: "document", content: this.getContentPlanTemplate() },
        { name: "metrics.md", type: "document", content: this.getMetricsTemplate() }
      ]
    }],
    ["social", {
      name: "Social Media Project",
      description: "Social media content and strategy project",
      files: [
        { name: "README.md", type: "document", content: this.getSocialReadmeTemplate() },
        { name: "content-strategy.md", type: "document", content: this.getContentStrategyTemplate() },
        { name: "posting-schedule.md", type: "document", content: this.getPostingScheduleTemplate() },
        { name: "hashtag-research.md", type: "document", content: this.getHashtagTemplate() }
      ]
    }]
  ]);

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      switch (tool.command) {
        case "/create-project":
          return await this.createProject(input, mutations, context);
        default:
          return {
            success: false,
            message: `Unknown tool: ${tool.command}`
          };
      }
    } catch (error) {
      console.error("Project Creator Agent execution error:", error);
      return {
        success: false,
        message: `Failed to execute project creator agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async createProject(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Parse the input to extract project details
      const { projectName, description, template } = this.parseProjectInput(input);

      if (!projectName) {
        return {
          success: false,
          message: "Project name is required. Usage: /create-project <project-name> [description] [template:template]"
        };
      }

      // Add thinking message
      await mutations.addChatMessage({
        role: "thinking",
        content: `🤔 Creating project "${projectName}"...`,
        sessionId: context?.sessionId,
        userId: context?.userId
      });

      // Create the project
      const projectId = await mutations.createProject({
        name: projectName,
        description: description || `Project: ${projectName}`,
        status: "active",
        userId: context?.userId
      });

      // Get project template
      const projectTemplate = this.projectTemplates.get(template) || this.projectTemplates.get("default")!;
      
      // Create initial files
      const createdFiles: string[] = [];
      for (const fileTemplate of projectTemplate.files) {
        try {
          await mutations.createFile({
            name: fileTemplate.name,
            type: fileTemplate.type as "post" | "campaign" | "note" | "document" | "image" | "video" | "other",
            content: fileTemplate.content,
            projectId: projectId,
            userId: context?.userId,
            extension: this.getExtensionFromFilename(fileTemplate.name)
          });
          createdFiles.push(fileTemplate.name);
        } catch (error) {
          console.warn(`Failed to create file ${fileTemplate.name}:`, error);
        }
      }

      // Add success message
      const filesText = createdFiles.length > 0 
        ? `\n\n**Initial Files Created:**\n${createdFiles.map(f => `• ${f}`).join('\n')}`
        : '';

      await mutations.addChatMessage({
        role: "assistant",
        content: `📁 **Project Created Successfully**\n\n✅ **${projectName}**\n📋 Template: ${projectTemplate.name}\n📝 Description: ${description || 'No description provided'}${filesText}\n\nYour project is ready! You can now add more files and start working.`,
        sessionId: context?.sessionId,
        userId: context?.userId,
        operation: {
          type: "project_created",
          details: {
            projectId: projectId,
            projectName: projectName,
            template: template,
            filesCreated: createdFiles.length,
            files: createdFiles
          }
        }
      });

      return {
        success: true,
        message: `Project created: ${projectName}`,
        data: {
          projectId,
          projectName,
          description,
          template,
          filesCreated: createdFiles
        }
      };

    } catch (error) {
      console.error("Failed to create project:", error);
      return {
        success: false,
        message: `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseProjectInput(input: string): { projectName: string; description?: string; template: string } {
    // Extract template specification
    const templateMatch = input.match(/template:(\w+)/);
    const template = templateMatch ? templateMatch[1] : "default";

    // Extract description specification
    const descMatch = input.match(/description:([^]+?)(?=\s+\w+:|$)/);
    const description = descMatch ? descMatch[1].trim() : undefined;

    // Remove directives from input to get project name
    const cleanInput = input.replace(/template:\w+/g, '').replace(/description:[^]+?(?=\s+\w+:|$)/g, '').trim();

    // If no explicit description was provided, treat everything as project name
    const projectName = cleanInput;

    return { projectName, description, template };
  }

  private getExtensionFromFilename(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'md';
  }

  // Template content generators
  private getReadmeTemplate(): string {
    return `# Project Overview

*Created on ${new Date().toISOString().split('T')[0]}*

## Description

Brief description of this project and its goals.

## Files

- **README.md** - This overview document
- **notes.md** - General project notes and observations

## Getting Started

1. Review the project description and goals
2. Update this README with specific project details
3. Add additional files as needed
4. Document progress in notes.md

## Status

- **Status:** Active
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
`;
  }

  private getNotesTemplate(): string {
    return `# Project Notes

*Created on ${new Date().toLocaleString()}*

## Quick Notes

Add your thoughts, observations, and quick notes here.

## Ideas

- Brainstorm ideas
- Future enhancements
- Creative thoughts

## Tasks

- [ ] Review project goals
- [ ] Set up project structure  
- [ ] Define next steps

## Resources

- Links to relevant resources
- Reference materials
- External tools

## Meeting Notes

Date: [Date]
Attendees: [Names]
Discussion: [Summary]
Action Items: [List]
`;
  }

  private getContentReadmeTemplate(): string {
    return `# Content Creation Project

*Created on ${new Date().toISOString().split('T')[0]}*

## Project Overview

This project is designed for content creation and management.

## Project Structure

- **content-calendar.md** - Editorial calendar and scheduling
- **style-guide.md** - Brand voice and style guidelines  
- **notes.md** - General project notes

## Content Strategy

Define your content strategy, target audience, and key messaging here.

## Guidelines

- Maintain consistent brand voice
- Follow style guide requirements
- Update calendar regularly
- Track performance metrics
`;
  }

  private getContentCalendarTemplate(): string {
    return `# Content Calendar

## Editorial Calendar

| Date | Platform | Content Type | Topic | Status |
|------|----------|--------------|-------|---------|
| [Date] | [Platform] | [Type] | [Topic] | [Status] |

## Content Themes

### This Month
- Week 1: [Theme]
- Week 2: [Theme]  
- Week 3: [Theme]
- Week 4: [Theme]

## Upcoming Content

- [ ] [Content idea 1]
- [ ] [Content idea 2]
- [ ] [Content idea 3]

## Publishing Schedule

- **Monday:** [Content type]
- **Wednesday:** [Content type]
- **Friday:** [Content type]
`;
  }

  private getStyleGuideTemplate(): string {
    return `# Style Guide

## Brand Voice

- **Tone:** [Describe tone]
- **Style:** [Describe style]
- **Audience:** [Target audience]

## Writing Guidelines

- Use active voice
- Keep sentences concise
- Write for your audience level
- Maintain consistent terminology

## Content Standards

- Headline format: [Format]
- Image requirements: [Specs]
- CTA guidelines: [Guidelines]

## Do's and Don'ts

### Do's
- [Guideline 1]
- [Guideline 2]

### Don'ts  
- [Guideline 1]
- [Guideline 2]
`;
  }

  private getMarketingReadmeTemplate(): string {
    return `# Marketing Campaign

*Created on ${new Date().toISOString().split('T')[0]}*

## Campaign Overview

Comprehensive marketing campaign project structure.

## Project Files

- **campaign-brief.md** - Campaign objectives and strategy
- **target-audience.md** - Audience research and personas
- **content-plan.md** - Content strategy and calendar
- **metrics.md** - KPIs and performance tracking

## Campaign Goals

1. [Primary goal]
2. [Secondary goal]
3. [Tertiary goal]

## Timeline

- **Planning Phase:** [Dates]
- **Execution Phase:** [Dates]
- **Analysis Phase:** [Dates]
`;
  }

  private getCampaignBriefTemplate(): string {
    return `# Campaign Brief

## Campaign Name
[Campaign Name]

## Objectives
- Primary: [Objective]
- Secondary: [Objective]

## Target Audience
- Demographics: [Details]
- Psychographics: [Details]
- Behavior: [Details]

## Key Messages
1. [Message 1]
2. [Message 2]
3. [Message 3]

## Channels
- [Channel 1]: [Strategy]
- [Channel 2]: [Strategy]

## Budget
- Total Budget: [Amount]
- Allocation: [Breakdown]

## Success Metrics
- [Metric 1]: [Target]
- [Metric 2]: [Target]
- [Metric 3]: [Target]
`;
  }

  private getAudienceTemplate(): string {
    return `# Target Audience

## Primary Persona

**Name:** [Persona Name]
**Age:** [Age Range]
**Occupation:** [Job Title/Industry]
**Income:** [Range]
**Location:** [Geographic]

### Demographics
- [Demographic detail 1]
- [Demographic detail 2]

### Psychographics  
- [Interest 1]
- [Interest 2]
- [Value 1]
- [Value 2]

### Behavior
- [Behavior pattern 1]
- [Behavior pattern 2]

## Secondary Personas

### Persona 2
[Similar structure as above]

## Audience Insights
- Pain points: [List]
- Motivations: [List]
- Preferred channels: [List]
`;
  }

  private getContentPlanTemplate(): string {
    return `# Content Plan

## Content Strategy

### Content Pillars
1. **[Pillar 1]** - [Description]
2. **[Pillar 2]** - [Description]  
3. **[Pillar 3]** - [Description]

## Content Calendar

| Week | Content Type | Platform | Topic | Status |
|------|-------------|----------|-------|---------|
| 1 | [Type] | [Platform] | [Topic] | [Status] |
| 2 | [Type] | [Platform] | [Topic] | [Status] |

## Content Types
- Blog posts: [Frequency]
- Social media: [Frequency]
- Videos: [Frequency]
- Email: [Frequency]

## Production Schedule
- Content creation: [Timeline]
- Review and approval: [Timeline]
- Publishing: [Timeline]
`;
  }

  private getMetricsTemplate(): string {
    return `# Metrics & KPIs

## Key Performance Indicators

### Primary KPIs
- **[KPI 1]:** [Current] → [Target]
- **[KPI 2]:** [Current] → [Target]
- **[KPI 3]:** [Current] → [Target]

### Secondary KPIs
- [KPI]: [Target]
- [KPI]: [Target]

## Measurement Plan

| Metric | Tool | Frequency | Owner |
|---------|------|-----------|--------|
| [Metric] | [Tool] | [Frequency] | [Person] |

## Reporting Schedule
- Daily: [Metrics]
- Weekly: [Metrics]
- Monthly: [Metrics]

## Success Benchmarks
- Week 1: [Benchmark]
- Week 2: [Benchmark]
- Week 4: [Benchmark]
- Campaign End: [Benchmark]
`;
  }

  private getSocialReadmeTemplate(): string {
    return `# Social Media Project

*Created on ${new Date().toISOString().split('T')[0]}*

## Project Overview

Complete social media content and strategy management.

## Project Files

- **content-strategy.md** - Overall social media strategy
- **posting-schedule.md** - Content calendar and timing
- **hashtag-research.md** - Hashtag research and strategy

## Platforms
- [Platform 1]: [Strategy]
- [Platform 2]: [Strategy]
- [Platform 3]: [Strategy]

## Goals
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]
`;
  }

  private getContentStrategyTemplate(): string {
    return `# Content Strategy

## Strategy Overview
[Brief description of social media content strategy]

## Content Themes
1. **[Theme 1]** - [Description and frequency]
2. **[Theme 2]** - [Description and frequency]
3. **[Theme 3]** - [Description and frequency]

## Platform-Specific Strategy

### [Platform 1]
- **Audience:** [Description]
- **Content Types:** [Types]
- **Posting Frequency:** [Frequency]
- **Best Times:** [Times]

### [Platform 2]
- **Audience:** [Description]
- **Content Types:** [Types]
- **Posting Frequency:** [Frequency]  
- **Best Times:** [Times]

## Engagement Strategy
- Response time goals: [Time]
- Community management: [Approach]
- User-generated content: [Strategy]
`;
  }

  private getPostingScheduleTemplate(): string {
    return `# Posting Schedule

## Weekly Schedule

| Day | Time | Platform | Content Type | Theme |
|-----|------|----------|--------------|-------|
| Monday | [Time] | [Platform] | [Type] | [Theme] |
| Tuesday | [Time] | [Platform] | [Type] | [Theme] |
| Wednesday | [Time] | [Platform] | [Type] | [Theme] |

## Monthly Content Calendar

### Week 1 Focus: [Theme]
### Week 2 Focus: [Theme]  
### Week 3 Focus: [Theme]
### Week 4 Focus: [Theme]

## Special Dates & Events
- [Date]: [Event/Holiday] - [Content plan]
- [Date]: [Event/Holiday] - [Content plan]

## Content Batching Schedule
- **Content Creation:** [Days]
- **Review & Approval:** [Days] 
- **Scheduling:** [Days]
- **Publishing:** [Days]
`;
  }

  private getHashtagTemplate(): string {
    return `# Hashtag Research

## Primary Hashtags
- #[hashtag1] - [Reach/Engagement data]
- #[hashtag2] - [Reach/Engagement data]
- #[hashtag3] - [Reach/Engagement data]

## Content-Specific Hashtags

### [Content Theme 1]
- #[hashtag] - [Popularity: High/Medium/Low]
- #[hashtag] - [Popularity: High/Medium/Low]

### [Content Theme 2]  
- #[hashtag] - [Popularity: High/Medium/Low]
- #[hashtag] - [Popularity: High/Medium/Low]

## Hashtag Strategy
- **Total per post:** [Number]
- **Brand hashtags:** [List]
- **Community hashtags:** [List]
- **Trending hashtags:** [Research process]

## Performance Tracking
| Hashtag | Posts Used | Avg Reach | Avg Engagement |
|---------|------------|-----------|----------------|
| #[tag] | [Count] | [Reach] | [Engagement] |
`;
  }
}

interface ProjectTemplate {
  name: string;
  description: string;
  files: {
    name: string;
    type: string;
    content: string;
  }[];
}
