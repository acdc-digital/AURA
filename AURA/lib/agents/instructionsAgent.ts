// INSTRUCTIONS AGENT - Generate and manage structured instruction documentation
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/instructionsAgent.ts

import { BaseAgent, AgentTool, ConvexMutations, AgentExecutionContext, AgentExecutionResult } from "./base";
import type { Id } from "@/convex/_generated/dataModel";

export class InstructionsAgent extends BaseAgent {
  readonly id = "instructions";
  readonly name = "Instructions Agent";
  readonly description = "Generate and persist structured instruction documentation with AI context awareness";
  readonly icon = "📚";
  readonly isPremium = false;

  readonly tools: AgentTool[] = [
    {
      command: "/instructions",
      name: "Generate Instructions",
      description: "Create structured instruction documentation",
      usage: "/instructions <topic> [audience:<audience>]",
      examples: [
        "/instructions component development guidelines audience:developers",
        "/instructions always use TypeScript strict mode",
        "/instructions user onboarding flow audience:users"
      ]
    }
  ];

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      switch (tool.command) {
        case "/instructions":
          return await this.generateInstructions(input, mutations, context);
        default:
          return {
            success: false,
            message: `Unknown tool: ${tool.command}`
          };
      }
    } catch (error) {
      console.error("Instructions Agent execution error:", error);
      return {
        success: false,
        message: `Failed to execute instructions agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async generateInstructions(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Parse input to extract topic and audience
      const { topic, audience } = this.parseInstructionInput(input);
      
      // Ensure Instructions project exists
      const instructionsProjectId = await this.ensureInstructionsProject(mutations, context?.userId);
      
      // Generate content using AI context
      const content = await this.generateInstructionContent(topic, audience);
      
      // Generate filename from content
      const filename = this.generateFilename(content);
      
      // Create the instruction file
      const fileId = await mutations.createFile({
        name: `${filename}.md`,
        type: "document",
        content: content,
        projectId: instructionsProjectId,
        userId: context?.userId,
        extension: "md"
      });

      // Add success message to chat
      await mutations.addChatMessage({
        role: "assistant",
        content: `📚 **Instructions Created**\n\n✅ Created instruction document: \`${filename}.md\`\n\nThe instruction has been saved to your Instructions project and is now available as AI context for future conversations.`,
        sessionId: context?.sessionId,
        userId: context?.userId,
        operation: {
          type: "file_created",
          details: {
            fileId: fileId,
            filename: `${filename}.md`,
            projectId: instructionsProjectId,
            type: "instruction"
          }
        }
      });

      return {
        success: true,
        message: `Instructions created: ${filename}.md`,
        data: {
          fileId,
          filename: `${filename}.md`,
          content,
          projectId: instructionsProjectId
        }
      };

    } catch (error) {
      console.error("Failed to generate instructions:", error);
      return {
        success: false,
        message: `Failed to generate instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseInstructionInput(input: string): { topic: string; audience: string } {
    // Extract audience if specified
    const audienceMatch = input.match(/audience:(\w+)/);
    const audience = audienceMatch ? audienceMatch[1] : 'developers';
    
    // Remove audience directive from topic
    const topic = input.replace(/audience:\w+/g, '').trim();
    
    return { topic, audience };
  }

  private async ensureInstructionsProject(
    mutations: ConvexMutations,
    userId?: string | Id<"users">
  ): Promise<Id<"projects">> {
    try {
      // In a real implementation, we would first check if the project exists
      // For now, we'll create it (Convex should handle duplicates gracefully)
      const projectId = await mutations.createProject({
        name: "Instructions",
        description: "Auto-generated instruction documents for AI context",
        status: "active",
        userId: userId
      });

      return projectId;
    } catch (error) {
      console.error("Failed to ensure Instructions project:", error);
      throw error;
    }
  }

  private async generateInstructionContent(topic: string, audience: string): Promise<string> {
    // This would typically call an AI service for content generation
    // For now, we'll create a structured template
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `# ${this.capitalizeFirst(topic)}

*Generated on ${currentDate} | Audience: ${audience}*

## Overview

This document provides structured instructions for: **${topic}**

## Key Principles

- Follow best practices and current standards
- Maintain consistency across implementations
- Document decisions and rationale
- Provide clear examples and usage patterns

## Implementation Guidelines

### Core Requirements

1. **Quality Standards**
   - Code should be readable and maintainable
   - Follow established patterns and conventions
   - Include proper error handling

2. **Documentation**
   - Document public APIs and interfaces
   - Provide usage examples
   - Explain complex logic and decisions

3. **Testing**
   - Write unit tests for new functionality
   - Ensure edge cases are covered
   - Maintain test coverage standards

## Examples

\`\`\`typescript
// Example implementation following these instructions
// Add specific examples based on the topic
\`\`\`

## Best Practices

- Always validate inputs and handle edge cases
- Use TypeScript for type safety
- Follow the project's coding standards
- Write self-documenting code with clear naming

## Related Resources

- [Project Documentation](../README.md)
- [Development Guidelines](./development-guidelines.md)
- [Best Practices](./best-practices.md)

---

*This instruction document was automatically generated and can be updated as needed.*`;
  }

  private generateFilename(content: string): string {
    // Extract key terms from the first few lines to create a filename
    const lines = content.split('\n').slice(0, 5);
    const title = lines.find(line => line.startsWith('# '));
    
    if (title) {
      return title
        .replace('# ', '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    }
    
    // Fallback to timestamp-based naming
    return `instructions-${Date.now()}`;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
