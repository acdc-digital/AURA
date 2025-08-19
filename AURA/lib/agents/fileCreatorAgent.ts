// FILE CREATOR AGENT - Guided multi-step file creation with interactive selectors
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/fileCreatorAgent.ts

import { BaseAgent, AgentTool, ConvexMutations, AgentExecutionContext, AgentExecutionResult } from "./base";

export class FileCreatorAgent extends BaseAgent {
  readonly id = "file-creator";
  readonly name = "File Creator Agent";
  readonly description = "Guided multi-step file creation with interactive selectors and templates";
  readonly icon = "📄";
  readonly isPremium = false;

  readonly tools: AgentTool[] = [
    {
      command: "/create-file",
      name: "Create File",
      description: "Create a new file with guided workflow and templates",
      usage: "/create-file [filename] [type:type] [project:project]",
      examples: [
        "/create-file README.md type:document",
        "/create-file social-campaign type:campaign project:Marketing",
        "/create-file blog-post type:document"
      ]
    }
  ];

  // File templates based on type
  private readonly fileTemplates = new Map<string, string>([
    ["document", `# Document Title

*Created on ${new Date().toISOString().split('T')[0]}*

## Overview

Brief description of the document purpose.

## Content

Your content here...

## Notes

- Add any relevant notes
- Include references or links
- Document any assumptions
`],
    ["post", `# Social Media Post

**Platform:** [Platform Name]
**Date:** ${new Date().toISOString().split('T')[0]}

## Content

Your social media content here...

## Hashtags

#relevant #hashtags #here

## Notes

- Target audience:
- Best posting time:
- Engagement strategy:
`],
    ["campaign", `# Campaign: [Campaign Name]

**Status:** Planning
**Start Date:** [Date]
**End Date:** [Date]

## Objectives

- Primary goal:
- Success metrics:

## Target Audience

- Demographics:
- Platforms:
- Messaging:

## Content Plan

1. Phase 1: [Description]
2. Phase 2: [Description]
3. Phase 3: [Description]

## Resources

- Budget:
- Team:
- Tools:

## Timeline

| Date | Activity | Owner |
|------|----------|-------|
| [Date] | [Activity] | [Person] |

## Notes

Track progress and insights here...
`],
    ["note", `# Quick Note

*Created on ${new Date().toLocaleString()}*

## Content

Your notes here...

## Action Items

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## References

- Links and resources
`]
  ]);

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      switch (tool.command) {
        case "/create-file":
          return await this.createFile(input, mutations, context);
        default:
          return {
            success: false,
            message: `Unknown tool: ${tool.command}`
          };
      }
    } catch (error) {
      console.error("File Creator Agent execution error:", error);
      return {
        success: false,
        message: `Failed to execute file creator agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async createFile(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Parse the input to extract filename, type, and project preferences
      const { filename, fileType, projectName } = this.parseFileInput(input);

      // If we have all required information, create the file directly
      if (filename && fileType && projectName) {
        return await this.createFileWithDetails(filename, fileType, projectName, mutations, context);
      }

      // Otherwise, start the interactive flow
      return await this.startInteractiveFileCreation(input, mutations, context);

    } catch (error) {
      console.error("Failed to create file:", error);
      return {
        success: false,
        message: `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseFileInput(input: string): { filename?: string; fileType?: string; projectName?: string } {
    // Extract type specification
    const typeMatch = input.match(/type:(\w+)/);
    const fileType = typeMatch ? typeMatch[1] : undefined;

    // Extract project specification
    const projectMatch = input.match(/project:([^\s]+)/);
    const projectName = projectMatch ? projectMatch[1] : undefined;

    // Extract filename (first word that's not a directive)
    const cleanInput = input.replace(/type:\w+/g, '').replace(/project:[^\s]+/g, '').trim();
    const words = cleanInput.split(/\s+/);
    const filename = words.length > 0 && words[0] ? words[0] : undefined;

    return { filename, fileType, projectName };
  }

  private async startInteractiveFileCreation(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    // Add a thinking message
    await mutations.addChatMessage({
      role: "thinking",
      content: "🤔 Let me help you create a new file...",
      sessionId: context?.sessionId,
      userId: context?.userId
    });

    // Add file type selector
    await mutations.addChatMessage({
      role: "assistant",
      content: "📄 **File Creation Wizard**\n\nLet's create your new file step by step. First, what type of file would you like to create?",
      sessionId: context?.sessionId,
      userId: context?.userId,
      interactiveComponent: {
        type: "file_type_selector",
        data: {
          availableTypes: ["document", "post", "campaign", "note", "other"],
          userInput: input
        },
        status: "pending"
      }
    });

    return {
      success: true,
      message: "Interactive file creation started",
      requiresUserInput: true,
      interactiveComponent: {
        type: "file_type_selector",
        data: { userInput: input }
      }
    };
  }

  private async createFileWithDetails(
    filename: string,
    fileType: string,
    projectName: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // For now, we'll create a default project if it doesn't exist
      // In a real implementation, we'd query existing projects first
      const projectId = await mutations.createProject({
        name: projectName,
        description: `Project for ${fileType} files`,
        status: "active",
        userId: context?.userId
      });

      // Get file template based on type
      const template = this.getFileTemplate(fileType);
      const extension = this.getFileExtension(fileType, filename);

      // Create the file
      const fileId = await mutations.createFile({
        name: filename.includes('.') ? filename : `${filename}.${extension}`,
        type: this.mapFileType(fileType),
        content: template,
        projectId: projectId,
        userId: context?.userId,
        extension: extension
      });

      // Add success message
      await mutations.addChatMessage({
        role: "assistant",
        content: `📄 **File Created Successfully**\n\n✅ Created: \`${filename.includes('.') ? filename : `${filename}.${extension}`}\`\n📁 Project: ${projectName}\n📋 Type: ${fileType}\n\nThe file has been created with a template to get you started. You can now edit it in the editor.`,
        sessionId: context?.sessionId,
        userId: context?.userId,
        operation: {
          type: "file_created",
          details: {
            fileId: fileId,
            filename: filename.includes('.') ? filename : `${filename}.${extension}`,
            projectId: projectId,
            projectName: projectName,
            fileType: fileType
          }
        }
      });

      return {
        success: true,
        message: `File created: ${filename}`,
        data: {
          fileId,
          filename: filename.includes('.') ? filename : `${filename}.${extension}`,
          projectId,
          projectName,
          fileType
        }
      };

    } catch (error) {
      console.error("Failed to create file with details:", error);
      return {
        success: false,
        message: `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private getFileTemplate(fileType: string): string {
    return this.fileTemplates.get(fileType) || this.fileTemplates.get("document") || "";
  }

  private getFileExtension(fileType: string, filename: string): string {
    // If filename already has extension, extract it
    if (filename.includes('.')) {
      return filename.split('.').pop() || 'md';
    }

    // Default extensions by file type
    const extensionMap = new Map([
      ["document", "md"],
      ["post", "md"],
      ["campaign", "md"],
      ["note", "md"],
      ["image", "jpg"],
      ["video", "mp4"],
      ["other", "txt"]
    ]);

    return extensionMap.get(fileType) || "md";
  }

  private mapFileType(fileType: string): "post" | "campaign" | "note" | "document" | "image" | "video" | "other" {
    const validTypes: Array<"post" | "campaign" | "note" | "document" | "image" | "video" | "other"> = ["post", "campaign", "note", "document", "image", "video", "other"];
    
    // Type guard to check if fileType is one of the valid types
    if (validTypes.includes(fileType as "post" | "campaign" | "note" | "document" | "image" | "video" | "other")) {
      return fileType as "post" | "campaign" | "note" | "document" | "image" | "video" | "other";
    }
    
    return "other";
  }
}
