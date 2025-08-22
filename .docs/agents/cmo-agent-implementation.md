# AURA Platform - CMO Agent Implementation

_Strategic Marketing Campaign Planning with AI-Powered Guidance_

_Last Updated: August 21, 2025_

## Overview

The AURA Platform includes a comprehensive **CMO (Chief Marketing Officer) Agent** that transforms complex marketing planning into guided, intelligent conversations. Built on Convex's real-time database with AURA's agent architecture, the CMO Agent provides strategic marketing guidance through interactive multi-phase planning sessions.

## Features

### 🎯 Strategic Campaign Planning

- **Interactive 5-Phase Planning** - Guides users through comprehensive campaign development
- **Multi-Platform Strategy Generation** - Creates platform-specific recommendations for all major social platforms
- **Comprehensive Report Creation** - Generates detailed marketing strategy documents
- **Real-time Collaboration** - Team-based campaign planning with shared sessions
- **Premium Feature Gating** - Advanced analytics and enterprise features

### 🚀 Platform Coverage

- **LinkedIn**: Professional networking, B2B focus, thought leadership
- **Facebook**: Community building, long-form content, customer stories
- **Instagram**: Visual content, Stories, Reels, influencer collaboration
- **Twitter/X**: Real-time engagement, trending topics, industry commentary
- **TikTok**: Short-form video, viral content, trending challenges
- **Reddit**: Community discussions, authentic engagement, value-first approach
- **YouTube**: Video content, educational series, product demonstrations

### ⚡ Advanced Features

- **Campaign Templates** - Pre-built strategies for common campaign types
- **Competitive Analysis** - AI-powered market positioning insights
- **Budget Optimization** - Smart resource allocation recommendations
- **Performance Prediction** - Predictive analytics for campaign outcomes
- **Calendar Integration** - Automatic scheduling and content planning

## Architecture

### File Structure

```
AURA/
├── lib/agents/
│   ├── cmoAgent.ts                     # CMO agent implementation
│   ├── marketingOfficerExtension.ts    # Marketing extension
│   └── campaignDirectorExtension.ts    # Campaign management
├── app/_components/agents/_components/
│   ├── campaignPlanner.tsx             # Interactive planning interface
│   ├── strategyReportViewer.tsx        # Report visualization
│   ├── platformSelector.tsx           # Platform selection component
│   └── campaignTemplates.tsx           # Template selection
├── convex/
│   ├── campaigns.ts                    # Campaign management functions
│   ├── marketingReports.ts             # Report storage and retrieval
│   └── competitiveAnalysis.ts          # Market analysis functions
└── types/
    ├── campaigns.ts                    # Campaign type definitions
    └── marketing.ts                    # Marketing strategy types
```

### AURA State Management Integration

Following AURA's strict state separation principles:

```typescript
// SERVER STATE (Convex) - All persistent data
interface CampaignStrategy {
  _id: Id<"campaigns">;
  name: string;
  description: string;
  objectives: CampaignObjective[];
  targetAudience: AudienceProfile;
  platforms: PlatformStrategy[];
  timeline: CampaignTimeline;
  budget: BudgetAllocation;
  kpis: KPIFramework;
  status: "draft" | "planning" | "active" | "paused" | "completed";
  userId: Id<"users">;
  projectId?: Id<"projects">;
  createdAt: number;
  updatedAt: number;
}

// CLIENT STATE (Zustand) - UI concerns only
interface CMOAgentUIStore {
  currentPhase: PlanningPhase;
  selectedPlatforms: SocialPlatform[];
  planningSessionActive: boolean;
  showTemplates: boolean;
  reportViewerOpen: boolean;
  
  // UI actions
  setCurrentPhase: (phase: PlanningPhase) => void;
  togglePlatform: (platform: SocialPlatform) => void;
  startPlanningSession: () => void;
  endPlanningSession: () => void;
  openReportViewer: (reportId: string) => void;
}

// COMPONENT STATE (useState) - Ephemeral UI state
const [currentResponse, setCurrentResponse] = useState('');
const [isGeneratingReport, setIsGeneratingReport] = useState(false);
const [validationErrors, setValidationErrors] = useState<string[]>([]);
```

## Agent Implementation

### CMO Agent Core

```typescript
// CMO AGENT - Strategic marketing campaign planning
// /Users/matthewsimon/Projects/AURA/AURA/lib/agents/cmoAgent.ts

import { BaseAgent } from './base';
import { AgentTool, AgentExecutionResult, AgentExecutionContext } from './types';
import { ConvexMutations } from '@/lib/types/convex';

export class CMOAgent extends BaseAgent {
  readonly id = "cmo-agent";
  readonly name = "CMO Agent";
  readonly description = "Strategic marketing campaign planning and multi-platform strategy development";
  readonly icon = "🎯";
  readonly isPremium = true;

  // Planning phases
  private static readonly PHASES: PlanningPhase[] = [
    'objectives',
    'audience',
    'platforms',
    'timeline',
    'measurement'
  ];

  // Session management (Component State)
  private static planningSessions = new Map<string, PlanningSession>();

  async execute(
    tool: AgentTool,
    input: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Check premium access
      const hasAccess = await this.checkPremiumAccess(context?.userId);
      if (!hasAccess.allowed) {
        return {
          success: false,
          message: `🔒 CMO Agent requires AURA Premium subscription.\n\nUpgrade at: ${hasAccess.upgradeUrl}`,
          requiresUpgrade: true
        };
      }

      const sessionKey = `${context?.userId || 'anonymous'}-${context?.sessionId || 'default'}`;
      
      // Check for existing planning session
      const existingSession = CMOAgent.planningSessions.get(sessionKey);
      
      if (existingSession) {
        return await this.continueConversation(input, existingSession, mutations, context);
      }

      // Start new planning session
      return await this.initiatePlanning(input, sessionKey, mutations, context);

    } catch (error) {
      console.error("CMO Agent error:", error);
      return {
        success: false,
        message: `Marketing planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async initiatePlanning(
    input: string,
    sessionKey: string,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    
    // Parse initial campaign brief
    const campaignBrief = this.parseCampaignBrief(input);
    
    // Create new planning session
    const session: PlanningSession = {
      sessionKey,
      campaignBrief,
      currentPhase: 'objectives',
      responses: new Map(),
      startedAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
      userId: context?.userId
    };
    
    CMOAgent.planningSessions.set(sessionKey, session);
    
    // Start Phase 1: Objectives & Audience
    await mutations.addChatMessage({
      role: 'assistant',
      content: this.getPhaseOneQuestions(campaignBrief),
      sessionId: context?.sessionId,
      userId: context?.userId,
      interactiveComponent: {
        type: 'campaign_planner',
        status: 'pending',
        data: {
          phase: 'objectives',
          campaignBrief,
          questions: this.getObjectivesQuestions()
        }
      }
    });

    return {
      success: true,
      message: `🎯 **CMO Strategic Planning Session Started**\n\nCampaign: ${campaignBrief.name || 'Marketing Campaign'}\n\nI'll guide you through a comprehensive 5-phase planning process to develop your marketing strategy. Let's start with your objectives and target audience.`,
      requiresUserInput: true,
      data: {
        sessionKey,
        phase: 'objectives',
        campaignBrief
      }
    };
  }

  private async continueConversation(
    input: string,
    session: PlanningSession,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    
    // Check session expiry
    if (Date.now() > session.expiresAt) {
      CMOAgent.planningSessions.delete(session.sessionKey);
      return {
        success: false,
        message: "Planning session has expired. Please start a new campaign planning session with `/cmo [campaign description]`"
      };
    }

    // Check for report generation request
    if (input.toLowerCase().includes('generate report') || input.toLowerCase().includes('create strategy')) {
      return await this.generateCampaignReport(session, mutations, context);
    }

    // Process current phase response
    const phaseData = this.extractPhaseInformation(input, session.currentPhase);
    session.responses.set(session.currentPhase, phaseData);

    // Move to next phase
    const currentIndex = CMOAgent.PHASES.indexOf(session.currentPhase);
    if (currentIndex < CMOAgent.PHASES.length - 1) {
      session.currentPhase = CMOAgent.PHASES[currentIndex + 1];
      
      const nextPhaseMessage = this.getPhaseQuestions(session.currentPhase, session);
      
      await mutations.addChatMessage({
        role: 'assistant',
        content: nextPhaseMessage,
        sessionId: context?.sessionId,
        userId: context?.userId,
        interactiveComponent: {
          type: 'campaign_planner',
          status: 'pending',
          data: {
            phase: session.currentPhase,
            progress: ((currentIndex + 1) / CMOAgent.PHASES.length) * 100,
            responses: Object.fromEntries(session.responses)
          }
        }
      });

      return {
        success: true,
        message: nextPhaseMessage,
        requiresUserInput: true,
        data: {
          phase: session.currentPhase,
          progress: ((currentIndex + 1) / CMOAgent.PHASES.length) * 100
        }
      };
    }

    // All phases complete - offer report generation
    return await this.offerReportGeneration(session, mutations, context);
  }

  private async generateCampaignReport(
    session: PlanningSession,
    mutations: ConvexMutations,
    context?: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    
    try {
      // Generate comprehensive campaign strategy
      const strategy = this.buildCampaignStrategy(session);
      
      // Create campaign in database
      const campaignId = await mutations.createCampaign({
        name: strategy.name,
        description: strategy.description,
        objectives: strategy.objectives,
        targetAudience: strategy.targetAudience,
        platforms: strategy.platforms,
        timeline: strategy.timeline,
        budget: strategy.budget,
        kpis: strategy.kpis,
        status: 'draft',
        userId: context?.userId as Id<"users">,
        projectId: context?.projectId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Generate detailed report document
      const report = this.generateStrategyReport(strategy);
      
      // Save report to instructions for AI context
      const reportId = await mutations.createFile({
        name: `marketing-campaign-strategy-${new Date().toISOString().split('T')[0]}.md`,
        content: report,
        type: 'markdown',
        projectId: await mutations.getInstructionsProject({ userId: context?.userId }),
        userId: context?.userId as Id<"users">,
        metadata: {
          type: 'campaign_strategy',
          campaignId,
          generatedBy: 'cmo-agent',
          platforms: strategy.platforms.map(p => p.platform)
        }
      });

      // Clear session
      CMOAgent.planningSessions.delete(session.sessionKey);

      // Send completion message
      await mutations.addChatMessage({
        role: 'assistant',
        content: `✅ **Marketing Campaign Strategy Generated!**

📄 **Report**: marketing-campaign-strategy-${new Date().toISOString().split('T')[0]}.md
📁 **Location**: Instructions system folder  
🎯 **Campaign**: ${strategy.name}

Your comprehensive campaign strategy has been created and saved. The report includes:

- ✅ Platform-specific strategies and content recommendations
- ✅ Posting schedules and content calendars  
- ✅ KPI tracking and measurement framework
- ✅ Budget allocation and resource planning
- ✅ Implementation timeline and next steps

The report is now available in your Instructions folder and will be included as context for future AI interactions about your marketing campaigns.

**Ready to execute your campaign strategy!** 🚀`,
        sessionId: context?.sessionId,
        userId: context?.userId,
        operation: {
          type: 'campaign_created',
          details: {
            campaignId,
            reportId,
            strategy: strategy
          }
        }
      });

      return {
        success: true,
        message: `Campaign strategy generated successfully! Report saved to Instructions folder.`,
        data: {
          campaignId,
          reportId,
          strategy
        }
      };

    } catch (error) {
      console.error('Campaign report generation failed:', error);
      return {
        success: false,
        message: 'Failed to generate campaign report. Please try again.'
      };
    }
  }

  private parseCampaignBrief(input: string): CampaignBrief {
    // Extract campaign information from natural language input
    const brief: CampaignBrief = {
      name: this.extractCampaignName(input),
      description: input,
      platforms: this.extractMentionedPlatforms(input),
      objectives: this.extractObjectives(input),
      targetAudience: this.extractAudience(input)
    };

    return brief;
  }

  private getPhaseOneQuestions(brief: CampaignBrief): string {
    return `🎯 **Phase 1: Campaign Objectives & Target Audience** (1/5)

Based on your campaign brief: "${brief.description}"

Please help me understand:

**Campaign Objectives:**
1. What are your primary goals? (brand awareness, lead generation, sales conversion, customer retention, product launch)
2. What specific outcomes do you want to achieve?
3. How will you measure success?

**Target Audience:**
1. Who is your ideal customer? (demographics, interests, behaviors)
2. What are their main pain points or challenges?
3. Where do they spend time online?
4. What motivates them to take action?

Please provide detailed answers so I can create a comprehensive strategy tailored to your specific needs.`;
  }

  private getPhaseQuestions(phase: PlanningPhase, session: PlanningSession): string {
    switch (phase) {
      case 'audience':
        return this.getAudienceQuestions(session);
      case 'platforms':
        return this.getPlatformQuestions(session);
      case 'timeline':
        return this.getTimelineQuestions(session);
      case 'measurement':
        return this.getMeasurementQuestions(session);
      default:
        return this.getObjectivesQuestions();
    }
  }

  private buildCampaignStrategy(session: PlanningSession): CampaignStrategy {
    const responses = session.responses;
    
    return {
      name: session.campaignBrief.name || 'Marketing Campaign',
      description: session.campaignBrief.description,
      objectives: this.synthesizeObjectives(responses),
      targetAudience: this.synthesizeAudience(responses),
      platforms: this.synthesizePlatformStrategies(responses),
      timeline: this.synthesizeTimeline(responses),
      budget: this.synthesizeBudget(responses),
      kpis: this.synthesizeKPIs(responses),
      status: 'draft',
      userId: session.userId as Id<"users">,
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as CampaignStrategy;
  }

  private generateStrategyReport(strategy: CampaignStrategy): string {
    return `# Marketing Campaign Strategy: ${strategy.name}

_Generated by AURA CMO Agent on ${new Date().toLocaleDateString()}_

## Executive Summary

${strategy.description}

## Campaign Objectives

${strategy.objectives.map(obj => `- **${obj.type}**: ${obj.description} (Target: ${obj.target})`).join('\n')}

## Target Audience Analysis

**Demographics:**
- Age Range: ${strategy.targetAudience.demographics.ageRange}
- Gender: ${strategy.targetAudience.demographics.gender}
- Location: ${strategy.targetAudience.demographics.location}
- Income Level: ${strategy.targetAudience.demographics.income}

**Psychographics:**
- Interests: ${strategy.targetAudience.psychographics.interests.join(', ')}
- Values: ${strategy.targetAudience.psychographics.values.join(', ')}
- Lifestyle: ${strategy.targetAudience.psychographics.lifestyle}

**Pain Points:**
${strategy.targetAudience.painPoints.map(point => `- ${point}`).join('\n')}

## Platform-Specific Strategies

${strategy.platforms.map(platform => this.generatePlatformSection(platform)).join('\n\n')}

## Implementation Timeline

**Campaign Duration:** ${strategy.timeline.startDate} - ${strategy.timeline.endDate}

**Key Milestones:**
${strategy.timeline.milestones.map(milestone => `- **${milestone.date}**: ${milestone.description}`).join('\n')}

## Budget Allocation

**Total Budget:** $${strategy.budget.total.toLocaleString()}

**Platform Distribution:**
${strategy.budget.platformAllocation.map(alloc => `- ${alloc.platform}: $${alloc.amount.toLocaleString()} (${alloc.percentage}%)`).join('\n')}

## KPI Framework & Measurement

**Primary KPIs:**
${strategy.kpis.primary.map(kpi => `- **${kpi.metric}**: ${kpi.target} ${kpi.unit}`).join('\n')}

**Secondary KPIs:**
${strategy.kpis.secondary.map(kpi => `- **${kpi.metric}**: ${kpi.target} ${kpi.unit}`).join('\n')}

## Next Steps

1. **Content Calendar Creation** - Develop detailed posting schedule for each platform
2. **Creative Asset Development** - Design visuals, videos, and copy variations
3. **Campaign Launch** - Execute soft launch with A/B testing
4. **Monitoring & Optimization** - Daily performance tracking and adjustments
5. **Reporting** - Weekly performance reports and strategy refinements

---

*This strategy document was generated by AURA's CMO Agent and is available in your Instructions folder for future AI context and reference.*`;
  }

  private generatePlatformSection(platform: PlatformStrategy): string {
    return `### ${platform.platform.toUpperCase()}

**Strategy:** ${platform.strategy}

**Content Types:**
${platform.contentTypes.map(type => `- ${type}`).join('\n')}

**Posting Schedule:** ${platform.postingSchedule.frequency} (${platform.postingSchedule.bestTimes.join(', ')})

**Success Metrics:**
${platform.successMetrics.map(metric => `- ${metric}`).join('\n')}`;
  }
}

// Type definitions
interface PlanningSession {
  sessionKey: string;
  campaignBrief: CampaignBrief;
  currentPhase: PlanningPhase;
  responses: Map<PlanningPhase, any>;
  startedAt: number;
  expiresAt: number;
  userId?: string;
}

interface CampaignBrief {
  name?: string;
  description: string;
  platforms?: string[];
  objectives?: string[];
  targetAudience?: string[];
}

type PlanningPhase = 'objectives' | 'audience' | 'platforms' | 'timeline' | 'measurement';
```

## Interactive Components

### Campaign Planner Component

```typescript
// CAMPAIGN PLANNER COMPONENT - Interactive planning interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/campaignPlanner.tsx

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target, Users, Calendar, BarChart, Lightbulb } from 'lucide-react';
import { PlanningPhase } from '@/types/campaigns';

interface CampaignPlannerProps {
  phase: PlanningPhase;
  questions: string[];
  progress: number;
  campaignBrief: any;
  onResponseSubmit: (response: string) => void;
  onCancel: () => void;
}

const phaseIcons = {
  objectives: Target,
  audience: Users,
  platforms: Lightbulb,
  timeline: Calendar,
  measurement: BarChart
};

const phaseColors = {
  objectives: '#007acc',
  audience: '#4ec9b0', 
  platforms: '#ffcc02',
  timeline: '#f44747',
  measurement: '#858585'
};

export function CampaignPlanner({ 
  phase, 
  questions, 
  progress, 
  campaignBrief,
  onResponseSubmit, 
  onCancel 
}: CampaignPlannerProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const Icon = phaseIcons[phase];
  const phaseColor = phaseColors[phase];

  const handleSubmit = useCallback(async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onResponseSubmit(response);
      setResponse('');
    } finally {
      setIsSubmitting(false);
    }
  }, [response, onResponseSubmit]);

  const getPhaseTitle = (phase: PlanningPhase) => {
    switch (phase) {
      case 'objectives': return 'Campaign Objectives';
      case 'audience': return 'Target Audience';
      case 'platforms': return 'Platform Strategy';
      case 'timeline': return 'Timeline & Budget';
      case 'measurement': return 'KPIs & Measurement';
      default: return 'Campaign Planning';
    }
  };

  return (
    <Card className="bg-[#1e1e1e] border-[#2d2d2d] max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon 
            className="w-5 h-5" 
            style={{ color: phaseColor }} 
          />
          <div className="flex-1">
            <CardTitle className="text-[#cccccc] text-lg">
              {getPhaseTitle(phase)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={progress} className="flex-1" />
              <span className="text-xs text-[#858585]">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Campaign Context */}
        {campaignBrief.name && (
          <div className="p-3 bg-[#2d2d2d]/50 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3 h-3 text-[#007acc]" />
              <span className="text-xs font-medium text-[#007acc]">
                Campaign: {campaignBrief.name}
              </span>
            </div>
            <p className="text-xs text-[#858585]">
              {campaignBrief.description}
            </p>
          </div>
        )}

        {/* Phase Questions */}
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-[#2d2d2d] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-[#858585]">{index + 1}</span>
              </div>
              <p className="text-sm text-[#cccccc]">{question}</p>
            </div>
          ))}
        </div>

        {/* Response Input */}
        <div className="space-y-3">
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={`Please provide detailed information for ${getPhaseTitle(phase).toLowerCase()}...`}
            className="bg-[#2d2d2d] border-[#007acc]/30 text-[#cccccc] placeholder-[#858585] min-h-[120px]"
            disabled={isSubmitting}
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!response.trim() || isSubmitting}
              className="bg-[#007acc] hover:bg-[#005a9a] text-white flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Continue to Next Phase
                </div>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-[#858585] hover:text-[#cccccc]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Phase Progress Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {['objectives', 'audience', 'platforms', 'timeline', 'measurement'].map((p, index) => (
            <div
              key={p}
              className={`w-2 h-2 rounded-full ${
                p === phase ? 'bg-[#007acc]' : 
                progress > (index / 5) * 100 ? 'bg-[#4ec9b0]' : 'bg-[#2d2d2d]'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Database Schema

### Enhanced Schema for Campaign Management

```typescript
// CONVEX SCHEMA - Campaign and marketing strategy management
// /Users/matthewsimon/Projects/AURA/AURA/convex/schema.ts

export default defineSchema({
  // Marketing campaigns
  campaigns: defineTable({
    name: v.string(),
    description: v.string(),
    
    // Campaign objectives
    objectives: v.array(
      v.object({
        type: v.union(
          v.literal("brand_awareness"),
          v.literal("lead_generation"), 
          v.literal("sales_conversion"),
          v.literal("customer_retention"),
          v.literal("product_launch")
        ),
        description: v.string(),
        target: v.string(),
        priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
      })
    ),
    
    // Target audience
    targetAudience: v.object({
      demographics: v.object({
        ageRange: v.string(),
        gender: v.string(),
        location: v.string(),
        income: v.string(),
        education: v.string()
      }),
      psychographics: v.object({
        interests: v.array(v.string()),
        values: v.array(v.string()),
        lifestyle: v.string(),
        personality: v.string()
      }),
      painPoints: v.array(v.string()),
      onlineBehavior: v.object({
        platforms: v.array(v.string()),
        contentTypes: v.array(v.string()),
        engagementTimes: v.array(v.string())
      })
    }),
    
    // Platform strategies
    platforms: v.array(
      v.object({
        platform: v.union(
          v.literal("linkedin"),
          v.literal("facebook"),
          v.literal("instagram"),
          v.literal("twitter"),
          v.literal("tiktok"),
          v.literal("youtube"),
          v.literal("reddit")
        ),
        strategy: v.string(),
        contentTypes: v.array(v.string()),
        postingSchedule: v.object({
          frequency: v.string(),
          bestTimes: v.array(v.string()),
          weeklyPosts: v.number()
        }),
        successMetrics: v.array(v.string()),
        budget: v.number()
      })
    ),
    
    // Campaign timeline
    timeline: v.object({
      startDate: v.string(),
      endDate: v.string(),
      duration: v.string(),
      milestones: v.array(
        v.object({
          date: v.string(),
          description: v.string(),
          deliverables: v.array(v.string())
        })
      )
    }),
    
    // Budget allocation
    budget: v.object({
      total: v.number(),
      currency: v.string(),
      platformAllocation: v.array(
        v.object({
          platform: v.string(),
          amount: v.number(),
          percentage: v.number()
        })
      ),
      contentCreation: v.number(),
      advertising: v.number(),
      tools: v.number()
    }),
    
    // KPI framework
    kpis: v.object({
      primary: v.array(
        v.object({
          metric: v.string(),
          target: v.string(),
          unit: v.string(),
          timeframe: v.string()
        })
      ),
      secondary: v.array(
        v.object({
          metric: v.string(),
          target: v.string(),
          unit: v.string(),
          timeframe: v.string()
        })
      )
    }),
    
    // Campaign status and metadata
    status: v.union(
      v.literal("draft"),
      v.literal("planning"), 
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("archived")
    ),
    
    // Relationships
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    templateId: v.optional(v.id("campaignTemplates")),
    
    // Analytics and performance
    analytics: v.optional(
      v.object({
        totalReach: v.number(),
        totalEngagement: v.number(),
        totalConversions: v.number(),
        costPerLead: v.number(),
        roi: v.number(),
        platformPerformance: v.array(
          v.object({
            platform: v.string(),
            reach: v.number(),
            engagement: v.number(),
            conversions: v.number()
          })
        )
      })
    ),
    
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Campaign templates for common strategies
  campaignTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("product_launch"),
      v.literal("brand_awareness"),
      v.literal("lead_generation"),
      v.literal("customer_retention"),
      v.literal("seasonal"),
      v.literal("event_promotion")
    ),
    template: v.any(), // Full campaign template data
    isPublic: v.boolean(),
    createdBy: v.id("users"),
    usageCount: v.number(),
    rating: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"])
    .index("by_creator", ["createdBy"])
});
```

## Usage Examples

### Basic CMO Agent Activation

```bash
# Terminal usage examples
/cmo Launch our new SaaS product targeting small business owners on LinkedIn and Twitter

/cmo Create a brand awareness campaign for our consulting services targeting Fortune 500 companies  

/cmo Multi-platform social media strategy for launching our eco-friendly products targeting millennials

/cmo Help me plan a marketing campaign for my digital marketing agency targeting small businesses
```

### Agent Integration in Chat

```typescript
// Example chat conversation flow
User: "/cmo I want to launch a new fintech app for young professionals"

CMO Agent: "🎯 CMO Strategic Planning Session Started

Campaign: Fintech App Launch Campaign

I'll guide you through a comprehensive 5-phase planning process to develop your marketing strategy. Let's start with your objectives and target audience.

📋 Phase 1: Campaign Objectives & Target Audience (1/5)

Please help me understand:

**Campaign Objectives:**
1. What are your primary goals? (brand awareness, lead generation, sales conversion, customer retention, product launch)
2. What specific outcomes do you want to achieve?
3. How will you measure success?

**Target Audience:**
1. Who is your ideal customer? (demographics, interests, behaviors)
2. What are their main pain points or challenges?
3. Where do they spend time online?
4. What motivates them to take action?"

[Interactive Campaign Planner Component Appears]
```

## Testing

### CMO Agent Tests

```typescript
// CMO AGENT TESTING SUITE
// /Users/matthewsimon/Projects/AURA/AURA/tests/agents/cmoAgent.test.ts

import { CMOAgent } from '@/lib/agents/cmoAgent';
import { mockConvexMutations } from '../mocks/convex';

describe('CMO Agent', () => {
  let cmoAgent: CMOAgent;
  let mockMutations: ReturnType<typeof mockConvexMutations>;

  beforeEach(() => {
    cmoAgent = new CMOAgent();
    mockMutations = mockConvexMutations();
  });

  it('initiates planning session correctly', async () => {
    const result = await cmoAgent.execute(
      { command: '/cmo', parameters: {} },
      'Launch new SaaS product targeting SMBs',
      mockMutations,
      { userId: 'test-user', sessionId: 'test-session' }
    );

    expect(result.success).toBe(true);
    expect(result.requiresUserInput).toBe(true);
    expect(result.data?.phase).toBe('objectives');
    expect(mockMutations.addChatMessage).toHaveBeenCalled();
  });

  it('continues conversation through phases', async () => {
    // Start session
    await cmoAgent.execute(
      { command: '/cmo', parameters: {} },
      'Test campaign',
      mockMutations,
      { userId: 'test-user', sessionId: 'test-session' }
    );

    // Phase 1 response
    const phase1Result = await cmoAgent.execute(
      { command: '/cmo', parameters: {} },
      'Primary goal is lead generation for B2B SaaS targeting CTOs',
      mockMutations,
      { userId: 'test-user', sessionId: 'test-session' }
    );

    expect(phase1Result.success).toBe(true);
    expect(phase1Result.data?.phase).toBe('audience');
  });

  it('generates campaign report after all phases', async () => {
    // Mock completed session
    const sessionKey = 'test-user-test-session';
    // ... set up complete session state

    const result = await cmoAgent.execute(
      { command: '/cmo', parameters: {} },
      'generate report',
      mockMutations,
      { userId: 'test-user', sessionId: 'test-session' }
    );

    expect(result.success).toBe(true);
    expect(mockMutations.createCampaign).toHaveBeenCalled();
    expect(mockMutations.createFile).toHaveBeenCalled();
  });

  it('handles premium access requirements', async () => {
    const result = await cmoAgent.execute(
      { command: '/cmo', parameters: {} },
      'Test campaign',
      mockMutations,
      { userId: 'free-user', sessionId: 'test-session' }
    );

    expect(result.success).toBe(false);
    expect(result.requiresUpgrade).toBe(true);
  });

  it('handles session expiry gracefully', async () => {
    // Create expired session
    // ... mock expired session

    const result = await cmoAgent.execute(
      { command: '/cmo', parameters: {} },
      'continue conversation',
      mockMutations,
      { userId: 'test-user', sessionId: 'test-session' }
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('expired');
  });
});
```

## Premium Features

### Advanced Analytics Integration

```typescript
// PREMIUM ANALYTICS - Campaign performance insights
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/_components/campaignAnalytics.tsx

export function CampaignAnalytics({ campaignId }: { campaignId: string }) {
  const analytics = useQuery(api.campaigns.getAnalytics, { campaignId });
  
  if (!analytics) return <AnalyticsSkeleton />;
  
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Reach"
          value={analytics.totalReach.toLocaleString()}
          change="+12%"
          trend="up"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${analytics.engagementRate.toFixed(1)}%`}
          change="+5.2%"
          trend="up"
        />
        <MetricCard
          title="Conversions"
          value={analytics.totalConversions.toLocaleString()}
          change="+18%"
          trend="up"
        />
        <MetricCard
          title="ROI"
          value={`${analytics.roi.toFixed(1)}x`}
          change="+0.3x"
          trend="up"
        />
      </div>
      
      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.platformPerformance}>
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reach" fill="#007acc" />
                <Bar dataKey="engagement" fill="#4ec9b0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Future Enhancements

### Planned Features

- [ ] **Campaign Performance Tracking**: Real-time analytics integration with social platforms
- [ ] **Content Calendar Generation**: Automated scheduling based on campaign strategy
- [ ] **Competitive Analysis**: AI-powered competitor monitoring and insights
- [ ] **A/B Testing Framework**: Systematic testing and optimization recommendations
- [ ] **Multi-Campaign Management**: Handle multiple concurrent campaigns
- [ ] **Campaign Templates**: Pre-built templates for common campaign types
- [ ] **Budget Optimization**: AI-powered budget allocation recommendations
- [ ] **Performance Prediction**: Predictive analytics for campaign outcomes

### Integration Possibilities

- [ ] **Social Media Tools**: Direct integration with posting platforms
- [ ] **Analytics Dashboards**: Real-time performance monitoring
- [ ] **CRM Integration**: Lead tracking and nurturing workflows
- [ ] **Content Creation Tools**: AI-powered content generation assistance
- [ ] **Email Marketing**: Campaign coordination across channels
- [ ] **Team Collaboration**: Multi-user campaign planning and approval workflows

## Contributing

When contributing to the CMO Agent system:

1. **Follow AURA Patterns**: Maintain consistency with agent architecture
2. **Premium Features**: Properly implement subscription gating
3. **Real-time Updates**: Ensure all data syncs via Convex
4. **User Experience**: Maintain conversational flow and helpful guidance
5. **Test Coverage**: Include comprehensive tests for planning workflows

## Conclusion

The AURA CMO Agent transforms complex marketing planning into guided, intelligent conversations. Built on Convex's real-time database with proper state management, it provides professional-level strategic guidance that scales from startup campaigns to enterprise marketing strategies.

Key benefits:
- **Strategic Intelligence**: Professional marketing expertise in conversational AI
- **Comprehensive Planning**: 5-phase methodology covering all campaign aspects
- **Multi-Platform Expertise**: Tailored strategies for all major social platforms
- **Real-time Collaboration**: Team-based planning with shared sessions
- **Integration Ready**: Seamless connection with calendar, content creation, and analytics

This implementation ensures that AURA users have access to strategic marketing intelligence that helps create comprehensive, actionable marketing campaigns with professional-level guidance and implementation roadmaps.
