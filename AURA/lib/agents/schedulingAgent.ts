// SCHEDULING AGENT - Batch schedule unscheduled social content
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/schedulingAgent.ts

import { BaseAgent, AgentTool, ConvexMutations, AgentExecutionContext, AgentExecutionResult } from "./base";

export class SchedulingAgent extends BaseAgent {
  readonly id = "scheduling";
  readonly name = "Scheduling Agent";
  readonly description = "Batch assign timestamps to unscheduled social posts with optimization";
  readonly icon = "📅";
  readonly isPremium = false;

  readonly tools: AgentTool[] = [
    {
      command: "/schedule",
      name: "Batch Schedule Posts",
      description: "Automatically schedule unscheduled social media posts",
      usage: "/schedule [project:project] [platform:platform] [timeframe:days]",
      examples: [
        "/schedule",
        "/schedule project:Marketing platform:twitter",
        "/schedule timeframe:7 platform:instagram"
      ]
    }
  ];

  // Optimal posting times by platform (in hours, 24-hour format)
  private readonly optimalTimes = new Map<string, number[]>([
    ["twitter", [9, 12, 15, 18, 21]], // 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
    ["instagram", [8, 11, 14, 17, 20]], // 8 AM, 11 AM, 2 PM, 5 PM, 8 PM
    ["facebook", [9, 13, 16, 19]], // 9 AM, 1 PM, 4 PM, 7 PM
    ["linkedin", [8, 12, 17]], // 8 AM, 12 PM, 5 PM (business hours)
    ["reddit", [10, 14, 20]], // 10 AM, 2 PM, 8 PM
    ["youtube", [14, 17, 20]] // 2 PM, 5 PM, 8 PM
  ]);

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      switch (tool.command) {
        case "/schedule":
          return await this.batchSchedulePosts(input, mutations, context);
        default:
          return {
            success: false,
            message: `Unknown tool: ${tool.command}`
          };
      }
    } catch (error) {
      console.error("Scheduling Agent execution error:", error);
      return {
        success: false,
        message: `Failed to execute scheduling agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async batchSchedulePosts(
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Parse input parameters
      const { projectName, platform, timeframeDays } = this.parseSchedulingInput(input);

      // Add thinking message
      await mutations.addChatMessage({
        role: "thinking",
        content: "🤔 Analyzing unscheduled posts and optimizing schedule...",
        sessionId: context?.sessionId,
        userId: context?.userId
      });

      // In a real implementation, we would:
      // 1. Query for unscheduled posts matching criteria
      // 2. Analyze optimal posting times
      // 3. Distribute posts across the timeframe
      // 4. Update posts with scheduled times

      // Simulate finding posts to schedule
      const mockUnscheduledPosts = this.getMockUnscheduledPosts(projectName, platform);
      
      if (mockUnscheduledPosts.length === 0) {
        return {
          success: true,
          message: "No unscheduled posts found matching criteria",
          data: { postsScheduled: 0 }
        };
      }

      // Generate optimal schedule
      const schedule = this.generateOptimalSchedule(
        mockUnscheduledPosts,
        platform,
        timeframeDays
      );

      // In real implementation, update posts with scheduled times
      // For demo, we'll just show what would be scheduled

      const scheduleText = schedule.map((item, index) => 
        `${index + 1}. **${item.filename}** → ${new Date(item.scheduledTime).toLocaleString()}`
      ).join('\n');

      await mutations.addChatMessage({
        role: "assistant",
        content: `📅 **Scheduling Complete**\n\n✅ **Posts Scheduled:** ${schedule.length}\n📱 **Platform:** ${platform || 'All platforms'}\n🗓️ **Timeframe:** ${timeframeDays} days\n${projectName ? `📁 **Project:** ${projectName}` : ''}\n\n**Scheduled Posts:**\n${scheduleText}\n\n*Posts have been optimized for engagement based on platform best practices.*`,
        sessionId: context?.sessionId,
        userId: context?.userId,
        operation: {
          type: "tool_executed",
          details: {
            tool: "batch_schedule",
            postsScheduled: schedule.length,
            platform: platform,
            timeframeDays: timeframeDays,
            projectName: projectName
          }
        }
      });

      return {
        success: true,
        message: `Scheduled ${schedule.length} posts`,
        data: {
          postsScheduled: schedule.length,
          schedule: schedule,
          platform: platform,
          timeframeDays: timeframeDays
        }
      };

    } catch (error) {
      console.error("Failed to batch schedule posts:", error);
      return {
        success: false,
        message: `Failed to schedule posts: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private parseSchedulingInput(input: string): { 
    projectName?: string; 
    platform?: string; 
    timeframeDays: number;
  } {
    // Extract project name
    const projectMatch = input.match(/project:([^\s]+)/);
    const projectName = projectMatch ? projectMatch[1] : undefined;

    // Extract platform
    const platformMatch = input.match(/platform:([^\s]+)/);
    const platform = platformMatch ? platformMatch[1].toLowerCase() : undefined;

    // Extract timeframe
    const timeframeMatch = input.match(/timeframe:(\d+)/);
    const timeframeDays = timeframeMatch ? parseInt(timeframeMatch[1]) : 7; // Default 7 days

    return { projectName, platform, timeframeDays };
  }

  private getMockUnscheduledPosts(projectName?: string, platform?: string): MockPost[] {
    // Mock data - in real implementation, query from Convex
    const mockPosts: MockPost[] = [
      {
        id: "post1",
        filename: "product-launch-announcement.x",
        platform: "twitter",
        content: "🚀 Exciting news! Our new product is launching soon...",
        projectName: "Marketing"
      },
      {
        id: "post2", 
        filename: "behind-the-scenes.md",
        platform: "instagram",
        content: "Behind the scenes at our office today 📸",
        projectName: "Content"
      },
      {
        id: "post3",
        filename: "industry-insights.x",
        platform: "twitter", 
        content: "5 trends that will shape the industry in 2024 🧵",
        projectName: "Marketing"
      },
      {
        id: "post4",
        filename: "team-spotlight.md",
        platform: "linkedin",
        content: "Meet our amazing team member Sarah! 👋",
        projectName: "HR"
      }
    ];

    // Filter by criteria
    return mockPosts.filter(post => {
      if (projectName && !post.projectName.toLowerCase().includes(projectName.toLowerCase())) {
        return false;
      }
      if (platform && post.platform !== platform) {
        return false;
      }
      return true;
    });
  }

  private generateOptimalSchedule(
    posts: MockPost[],
    targetPlatform?: string,
    timeframeDays: number = 7
  ): ScheduledPost[] {
    const schedule: ScheduledPost[] = [];
    const startTime = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    // Group posts by platform for better distribution
    const postsByPlatform = new Map<string, MockPost[]>();
    posts.forEach(post => {
      const platform = post.platform;
      if (!postsByPlatform.has(platform)) {
        postsByPlatform.set(platform, []);
      }
      postsByPlatform.get(platform)!.push(post);
    });

    // Schedule posts for each platform
    postsByPlatform.forEach((platformPosts, platform) => {
      const optimalHours = this.optimalTimes.get(platform) || [9, 12, 15, 18];
      let dayIndex = 0;
      let timeSlotIndex = 0;

      platformPosts.forEach((post) => {
        // Calculate scheduled time
        const dayOffset = Math.floor(dayIndex % timeframeDays);
        const hourOffset = optimalHours[timeSlotIndex % optimalHours.length];
        
        const scheduledDate = new Date(startTime + (dayOffset * msPerDay));
        scheduledDate.setHours(hourOffset, 0, 0, 0);

        // Ensure we don't schedule in the past
        if (scheduledDate.getTime() <= Date.now()) {
          scheduledDate.setTime(Date.now() + (60 * 60 * 1000)); // 1 hour from now
        }

        schedule.push({
          ...post,
          scheduledTime: scheduledDate.getTime()
        });

        // Advance to next time slot
        timeSlotIndex++;
        if (timeSlotIndex % optimalHours.length === 0) {
          dayIndex++;
        }
      });
    });

    // Sort by scheduled time
    return schedule.sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  private getEngagementScore(platform: string, hour: number): number {
    // Simple engagement scoring based on optimal times
    const optimalHours = this.optimalTimes.get(platform) || [12];
    const closestOptimal = optimalHours.reduce((prev, curr) => 
      Math.abs(curr - hour) < Math.abs(prev - hour) ? curr : prev
    );
    const distance = Math.abs(hour - closestOptimal);
    
    // Score from 0-100, with 100 being optimal time
    return Math.max(0, 100 - (distance * 20));
  }

  private avoidOverlap(scheduledTimes: number[], newTime: number, minGapHours: number = 2): number {
    const minGapMs = minGapHours * 60 * 60 * 1000;
    
    // Check if new time conflicts with existing times
    for (const existingTime of scheduledTimes) {
      if (Math.abs(newTime - existingTime) < minGapMs) {
        // Adjust time to avoid overlap
        newTime = existingTime + minGapMs;
      }
    }
    
    return newTime;
  }
}

interface MockPost {
  id: string;
  filename: string;
  platform: string;
  content: string;
  projectName: string;
}

interface ScheduledPost extends MockPost {
  scheduledTime: number;
}
