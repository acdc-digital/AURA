# CMO Agent Specification

_EAC Financial Dashboard - Agent System_

## Agent Overview

The **CMO Agent** is designed to guide users through comprehensive marketing campaign planning and strategy development within the EAC Financial Dashboard. This agent helps create multi-platform marketing campaigns with strategic recommendations based on industry best practices.

## Purpose

The CMO Agent serves to:

- Guide users through structured campaign planning conversations
- Generate comprehensive marketing campaign strategies
- Provide platform-specific content and scheduling recommendations
- Create detailed implementation roadmaps and measurement frameworks
- Support multi-platform social media strategy development
- Generate campaign possibility reports for future reference

## Agent Configuration

```typescript
{
  id: 'cmo',
  name: 'CMO',
  description: 'Marketing campaign strategy and planning with multi-platform recommendations',
  isActive: false,
  icon: '📈',
  tools: [
    {
      id: 'define-campaign',
      name: 'Define Marketing Campaign',
      command: '/cmo',
      description: 'Interactive campaign planning with strategic recommendations'
    }
  ]
}
```

## Tool: Define Marketing Campaign (`/cmo`)

### Purpose
Initiates an interactive, multi-phase conversation to gather campaign requirements and generate a comprehensive marketing strategy report.

### Usage
```bash
/cmo [campaign description or goal]
```

### Examples
```bash
/cmo I want to launch a new SaaS product targeting small business owners
/cmo Create a brand awareness campaign for our consulting services
/cmo Help me plan a multi-platform social media strategy for product launch
/cmo Design a lead generation campaign for B2B software
```

### Conversation Flow

The CMO agent guides users through a structured 5-phase conversation:

#### Phase 1: Campaign Objectives & Target Audience
- **Primary Objective**: Brand awareness, lead generation, sales conversion, customer retention, product launch
- **Target Audience**: Demographics, psychographics, pain points, online behavior
- **Success Metrics**: KPIs, specific goals, measurement preferences

#### Phase 2: Platform Selection & Content Strategy
- **Platform Selection**: Facebook, Instagram, LinkedIn, Twitter/X, TikTok, Reddit
- **Content Preferences**: Video, images, text, mixed content
- **Content Resources**: Existing assets, brand voice, content capabilities

#### Phase 3: Timeline & Posting Strategy
- **Campaign Duration**: Start date, end date, key milestones
- **Posting Frequency**: Platform-specific cadence recommendations
- **Budget Considerations**: Paid advertising, content creation costs

#### Phase 4: Measurement & Brand Guidelines
- **KPI Selection**: Engagement, reach, conversions, traffic, leads
- **Brand Guidelines**: Voice, messaging, visual consistency
- **Competitive Context**: Competitor analysis, differentiation strategies

#### Phase 5: Final Review & Report Generation
- **Campaign Summary**: Review all collected information
- **Report Generation**: Create comprehensive strategy document
- **Instructions Integration**: Save to Instructions folder for AI context

### Interactive Features

- **Session State Management**: Maintains conversation context across interactions
- **Intelligent Information Extraction**: Automatically parses campaign details from natural language
- **Timeout Handling**: 30-minute session timeout with graceful recovery
- **Error Recovery**: Robust error handling with helpful guidance
- **Correction Support**: Allows users to modify information before final report generation

## Generated Content Structure

### Marketing Campaign Possibilities Report

The agent generates a comprehensive report including:

```markdown
# Marketing Campaign Possibilities Report

## Executive Summary
- Campaign overview and strategic approach

## Campaign Objectives
- Primary and secondary objectives
- Success definition and KPIs

## Target Audience
- Demographics and characteristics
- Pain points and needs analysis

## Multi-Platform Strategy
- Platform-specific strategies for each selected channel
- Content type recommendations per platform
- Posting cadence and timing strategies

## Content Strategy & Messaging
- Brand voice and key messages
- Content themes and formats
- Cross-platform consistency guidelines

## Campaign Timeline
- Implementation phases and milestones
- Content calendar framework
- Resource allocation timeline

## Budget Considerations
- Recommended budget allocation
- Cost estimation for content and advertising
- ROI optimization strategies

## Key Performance Indicators (KPIs)
- Primary and secondary metrics
- Reporting frequency and methodology
- Performance benchmarks

## Implementation Next Steps
- Immediate action items
- Team responsibilities
- Tool and resource requirements

## Risk Mitigation
- Potential challenges and solutions
- Contingency planning
- Quality assurance measures
```

## Integration with EAC Project

### File Storage

- Campaign reports are stored in the **Instructions** folder (system folder)
- Files are created with timestamp naming: `marketing-campaign-strategy-YYYY-MM-DD.md`
- Automatically saved to Convex database for persistence
- Available across sessions and devices

### Project Context Awareness

The agent understands the EAC project context and includes relevant:

- Technology stack considerations for content creation
- Integration with existing EAC agent tools
- Cross-platform automation capabilities
- Analytics and reporting integration possibilities

### AI Context Integration

- Campaign reports are automatically included in Instructions folder
- All future AI conversations have access to campaign strategy context
- Enables strategic consistency across all marketing-related interactions
- Supports iterative campaign optimization and refinement

## Platform-Specific Strategies

### LinkedIn
- **Content Focus**: Professional insights, thought leadership, industry analysis
- **Cadence**: 3-4 posts per week
- **Recommendations**: Engage in groups, use native video, share expertise

### Facebook
- **Content Focus**: Long-form content, community building, customer stories
- **Cadence**: 4-5 posts per week
- **Recommendations**: Build communities, use Facebook Live, share behind-the-scenes

### Instagram
- **Content Focus**: Visual content, Stories, Reels, user-generated content
- **Cadence**: Daily Stories, 4-5 feed posts per week
- **Recommendations**: Use hashtags, collaborate with influencers, leverage Shopping

### Twitter/X
- **Content Focus**: Real-time updates, industry commentary, engagement
- **Cadence**: Multiple posts per day
- **Recommendations**: Participate in trending topics, use relevant hashtags

### TikTok
- **Content Focus**: Short-form video, trending challenges, educational content
- **Cadence**: Daily posts
- **Recommendations**: Follow trends, use popular sounds, collaborate with creators

### Reddit
- **Content Focus**: Community discussions, valuable resources, authentic engagement
- **Cadence**: 2-3 posts per week
- **Recommendations**: Understand subreddit rules, provide genuine value, avoid over-promotion

## Activation and Usage

### Prerequisites
1. Ensure agent is activated in the Agents panel
2. Access terminal chat interface
3. Type `/cmo` followed by campaign description

### Best Practices
- Provide detailed initial campaign descriptions for better AI extraction
- Be specific about target audience and objectives
- Consider resource constraints when setting timelines
- Review generated strategies before implementation
- Use generated reports as living documents for campaign optimization

## Example Output

When a user completes the CMO agent conversation, they receive:

```
✅ Marketing Campaign Report Generated!

📄 File: marketing-campaign-strategy-2025-08-08.md
📁 Location: Instructions system folder
🎯 Campaign: Product Launch Strategy

Your comprehensive campaign strategy has been created and saved. The report includes:

- ✅ Platform-specific strategies and content recommendations
- ✅ Posting schedules and content calendars
- ✅ KPI tracking and measurement framework
- ✅ Budget allocation and resource planning
- ✅ Implementation timeline and next steps

The report is now available in your Instructions folder and will be included as context for future AI interactions about your marketing campaigns.

Ready to execute your campaign strategy! 🚀
```

## Benefits

### Strategic Planning
- **Comprehensive Approach**: Covers all aspects of campaign planning
- **Best Practice Integration**: Incorporates industry-standard methodologies
- **Multi-Platform Optimization**: Tailored strategies for each platform
- **Scalable Framework**: Adaptable to different campaign sizes and objectives

### User Experience
- **Guided Process**: Step-by-step conversation flow
- **Intelligent Extraction**: Automatic parsing of campaign details
- **Flexible Interaction**: Natural language input with structured output
- **Session Management**: Maintains context across interactions

### Integration Benefits
- **Persistent Storage**: Campaign strategies saved to database
- **AI Context Enhancement**: Future conversations informed by campaign strategy
- **Cross-Agent Compatibility**: Works with other EAC agents
- **Workflow Integration**: Supports end-to-end campaign execution

## Future Enhancements

### Advanced Features
1. **Campaign Performance Tracking**: Integration with analytics platforms
2. **Content Calendar Generation**: Automated scheduling recommendations
3. **Competitive Analysis**: Real-time competitor monitoring
4. **A/B Testing Framework**: Systematic testing recommendations
5. **ROI Optimization**: Automated budget allocation suggestions

### Integration Possibilities
1. **Social Media Tools**: Direct integration with posting platforms
2. **Analytics Dashboards**: Real-time performance monitoring
3. **Content Creation Tools**: AI-powered content generation
4. **CRM Integration**: Lead tracking and nurturing workflows
5. **Calendar Automation**: Automated scheduling and reminders

The CMO Agent transforms marketing campaign planning from a complex, time-consuming process into a guided, strategic conversation that produces actionable, comprehensive campaign strategies ready for implementation.
