// TWITTER/CMO AGENT - Premium social media content creation agent
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/twitterAgent.ts

import { BaseAgent, AgentTool, ConvexMutations, AgentExecutionContext, AgentExecutionResult } from "./base";
import type { Id } from "@/convex/_generated/dataModel";

export class TwitterAgent extends BaseAgent {
  readonly id = "cmo";
  readonly name = "CMO Agent (Twitter)";
  readonly description = "Premium social media content creation and strategy agent";
  readonly icon = "🐦";
  readonly isPremium = true;

  readonly tools: AgentTool[] = [
    {
      command: "/twitter",
      name: "Create Twitter Content",
      description: "Generate Twitter/X posts with scheduling and optimization",
      usage: "/twitter <content> [--schedule <time>] [--project <name>]",
      examples: [
        "/twitter Excited to announce our new product launch!",
        "/twitter Product update thread --schedule tomorrow 2pm",
        "/twitter Marketing insights for Q4 --project Marketing"
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
        case "/twitter":
          return await this.createTwitterContent(input, mutations, context);
        default:
          return {
            success: false,
            message: `Unknown tool: ${tool.command}`
          };
      }
    } catch (error) {
      console.error("Twitter Agent execution error:", error);
      return {
        success: false,
        message: `Failed to execute Twitter agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async createTwitterContent(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Parse input for content, schedule, and project
      const { content, scheduleTime, projectName } = this.parseTwitterInput(input);
      
      if (!content) {
        return {
          success: false,
          message: "Content is required for Twitter posts"
        };
      }

      // Ensure Content Creation project or custom project exists
      const projectId = await this.ensureContentProject(projectName || "Content Creation", mutations, context?.userId);
      
      // Generate enhanced content with hashtags and optimization
      const enhancedContent = await this.enhanceTwitterContent(content);
      
      // Generate filename
      const filename = this.generateTwitterFilename(content);
      
      // Create the Twitter post file
      const fileId = await mutations.createFile({
        name: `${filename}.x`,
        type: "post",
        content: enhancedContent,
        projectId: projectId,
        userId: context?.userId,
        extension: "x",
        platform: "twitter"
      });

      // Create success message
      const scheduleText = scheduleTime ? `\n📅 **Scheduled:** ${scheduleTime}` : "\n📝 **Status:** Draft";
      const projectText = projectName ? `\n📁 **Project:** ${projectName}` : "";

      await mutations.addChatMessage({
        role: "assistant",
        content: `🐦 **Twitter Content Created**\n\n✅ **File:** \`${filename}.x\`${scheduleText}${projectText}\n\n**Content Preview:**\n${enhancedContent.substring(0, 200)}${enhancedContent.length > 200 ? '...' : ''}\n\nYour Twitter content is ready! You can edit it further or publish when ready.`,
        sessionId: context?.sessionId,
        userId: context?.userId,
        operation: {
          type: "file_created",
          details: {
            fileId: fileId,
            filename: `${filename}.x`,
            projectId: projectId,
            platform: "twitter",
            scheduled: !!scheduleTime,
            scheduleTime: scheduleTime
          }
        }
      });

      return {
        success: true,
        message: `Twitter content created: ${filename}.x`,
        data: {
          fileId,
          filename: `${filename}.x`,
          content: enhancedContent,
          projectId,
          scheduled: !!scheduleTime,
          scheduleTime
        }
      };

    } catch (error) {
      console.error("Failed to create Twitter content:", error);
      return {
        success: false,
        message: `Failed to create Twitter content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseTwitterInput(input: string): { content: string; scheduleTime?: string; projectName?: string } {
    // Extract schedule time
    const scheduleMatch = input.match(/--schedule\s+([^-]+?)(?:\s+--|$)/);
    const scheduleTime = scheduleMatch ? scheduleMatch[1].trim() : undefined;

    // Extract project name
    const projectMatch = input.match(/--project\s+([^-]+?)(?:\s+--|$)/);
    const projectName = projectMatch ? projectMatch[1].trim() : undefined;

    // Remove directives to get content
    const content = input
      .replace(/--schedule\s+[^-]+?(?=\s+--|$)/g, '')
      .replace(/--project\s+[^-]+?(?=\s+--|$)/g, '')
      .trim();

    return { content, scheduleTime, projectName };
  }

  private async ensureContentProject(
    projectName: string,
    mutations: ConvexMutations,
    userId?: string | Id<"users">
  ): Promise<Id<"projects">> {
    try {
      // Create or get the project (in real implementation, check if exists first)
      const projectId = await mutations.createProject({
        name: projectName,
        description: `Social media content project`,
        status: "active",
        userId: userId
      });

      return projectId;
    } catch (error) {
      console.error("Failed to ensure content project:", error);
      throw error;
    }
  }

  private async enhanceTwitterContent(content: string): Promise<string> {
    // Enhanced content generation with optimization
    let enhancedContent = content;

    // Add thread numbering if content suggests a thread
    if (content.toLowerCase().includes('thread') || content.length > 200) {
      enhancedContent = `🧵 THREAD 1/n\n\n${content}`;
    }

    // Add relevant hashtags based on content analysis
    const hashtags = this.generateRelevantHashtags(content);
    if (hashtags.length > 0) {
      enhancedContent += `\n\n${hashtags.join(' ')}`;
    }

    // Add engagement elements
    enhancedContent += this.addEngagementElements(content);

    // Add metadata
    enhancedContent += `\n\n---\n**Created:** ${new Date().toLocaleString()}\n**Platform:** Twitter/X\n**Character Count:** ${this.getCharacterCount(enhancedContent)}`;

    return enhancedContent;
  }

  private generateRelevantHashtags(content: string): string[] {
    // Simple hashtag generation based on content analysis
    const hashtags: string[] = [];
    const lowerContent = content.toLowerCase();

    // Technology hashtags
    if (lowerContent.includes('ai') || lowerContent.includes('artificial intelligence')) {
      hashtags.push('#AI', '#ArtificialIntelligence');
    }
    if (lowerContent.includes('tech') || lowerContent.includes('technology')) {
      hashtags.push('#Tech', '#Technology');
    }
    if (lowerContent.includes('startup')) {
      hashtags.push('#Startup', '#Entrepreneur');
    }

    // Marketing hashtags
    if (lowerContent.includes('marketing') || lowerContent.includes('brand')) {
      hashtags.push('#Marketing', '#Branding');
    }
    if (lowerContent.includes('social media')) {
      hashtags.push('#SocialMedia', '#DigitalMarketing');
    }

    // General engagement hashtags
    if (lowerContent.includes('tip') || lowerContent.includes('advice')) {
      hashtags.push('#Tips', '#Advice');
    }
    if (lowerContent.includes('learn') || lowerContent.includes('education')) {
      hashtags.push('#Learning', '#Education');
    }

    return hashtags.slice(0, 3); // Limit to 3 hashtags
  }

  private addEngagementElements(content: string): string {
    // Add engagement elements based on content type
    if (content.toLowerCase().includes('what do you think') || content.includes('?')) {
      return '\n\n💬 Share your thoughts below!';
    }
    if (content.toLowerCase().includes('tip') || content.toLowerCase().includes('advice')) {
      return '\n\n🔄 RT if this was helpful!';
    }
    if (content.toLowerCase().includes('thread')) {
      return '\n\n👇 More in the replies...';
    }
    return '';
  }

  private generateTwitterFilename(content: string): string {
    // Generate filename from content
    const words = content
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3);
    
    if (words.length > 0) {
      return words.join('-').toLowerCase();
    }

    return `twitter-post-${Date.now()}`;
  }

  private parseScheduleTime(scheduleTime: string): number {
    // Simple schedule parsing (in real implementation, use proper date parsing)
    if (scheduleTime.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Extract time if provided
      const timeMatch = scheduleTime.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2].substring(1)) : 0;
        const ampm = timeMatch[3]?.toLowerCase();
        
        if (ampm === 'pm' && hours !== 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;
        
        tomorrow.setHours(hours, minutes, 0, 0);
      }
      
      return tomorrow.getTime();
    }
    
    // Default to 1 hour from now
    return Date.now() + (60 * 60 * 1000);
  }

  private getCharacterCount(content: string): number {
    // Calculate character count excluding metadata
    const contentLines = content.split('\n---')[0];
    return contentLines.length;
  }

  /**
   * Override canExecute to check premium status
   */
  canExecute(): boolean {
    // In a real implementation, check user's premium status
    // For now, allow execution (premium check would be handled elsewhere)
    return true;
  }
}
