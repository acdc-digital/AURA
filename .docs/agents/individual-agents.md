# Individual Agent Documentation

_AURA Platform - Detailed Agent Specifications_

## Instructions Agent

### Overview

The Instructions Agent generates and manages structured instruction documentation with AI context awareness. It automatically creates an "Instructions" project for every user and maintains a library of contextual documentation that enhances AI interactions.

### Specification

| Property        | Value                                    |
| --------------- | ---------------------------------------- |
| **Agent ID**    | `instructions`                           |
| **Command**     | `/instructions`                          |
| **Name**        | Instructions Agent                       |
| **Description** | Generate structured instruction docs     |
| **Icon**        | 📚                                       |
| **Premium**     | No                                       |
| **Status**      | ✅ Production Ready                      |

### Features

#### Core Functionality
- **Auto-Project Creation**: Automatically creates "Instructions" system project on first use
- **Context-Aware Generation**: Analyzes user intent and generates relevant documentation
- **Audience Targeting**: Supports audience-specific instructions (developers, users, admins)
- **AI Context Injection**: Instructions are automatically included in AI chat context
- **Markdown Formatting**: Full markdown support with proper structure and formatting

#### Advanced Features
- **Template System**: Uses intelligent templates based on instruction type
- **Version Control**: Maintains history of instruction updates
- **Search Integration**: Instructions are indexed for quick retrieval
- **Cross-Reference**: Links related instructions automatically

### Usage Examples

```bash
# Basic instruction creation
/instructions always use TypeScript strict mode

# Audience-targeted instructions
/instructions component development guidelines audience:developers
/instructions user onboarding flow audience:users
/instructions API documentation standards audience:admins

# Topic-specific instructions
/instructions error handling best practices
/instructions deployment checklist
/instructions code review process
```

### Command Parameters

| Parameter   | Type   | Required | Description                           | Example              |
| ----------- | ------ | -------- | ------------------------------------- | -------------------- |
| `topic`     | string | Yes      | Main topic or content for instruction| "React components"   |
| `audience`  | string | No       | Target audience for the instruction   | "developers", "users"|
| `format`    | string | No       | Output format preference              | "checklist", "guide" |
| `priority`  | string | No       | Instruction priority level            | "high", "medium"     |

### Technical Implementation

#### File Creation Process

1. **Input Parsing**: Analyzes command and extracts topic, audience, and parameters
2. **Project Resolution**: Ensures "Instructions" project exists, creates if needed
3. **Content Generation**: Uses AI to generate structured instruction content
4. **File Naming**: Generates SEO-friendly filename from topic
5. **Template Application**: Applies appropriate template based on content type
6. **Database Storage**: Saves file to Convex with proper metadata
7. **Context Registration**: Registers instruction for AI context inclusion

#### Generated File Structure

```markdown
# [Topic Title]

_Generated: [Date] | Audience: [Audience] | Priority: [Priority]_

## Overview

[AI-generated overview of the topic]

## Key Points

- [Point 1]
- [Point 2] 
- [Point 3]

## Implementation Guidelines

[Detailed implementation instructions]

## Examples

[Relevant examples and code snippets]

## References

[Related documentation and links]
```

#### Database Schema

```typescript
// Files table entry for instruction
{
  id: Id<"files">,
  name: string,                    // e.g., "react-components-guide.md"
  type: "document",
  content: string,                 // Full markdown content
  projectId: Id<"projects">,       // Instructions project ID
  userId: Id<"users">,
  extension: "md",
  metadata: {
    instructionType: "guide" | "checklist" | "reference",
    audience: string[],
    priority: "high" | "medium" | "low",
    topics: string[],
    lastUpdated: number,
    aiContext: boolean             // Include in AI context
  },
  createdAt: number,
  lastModified: number
}
```

### Error Handling

#### Common Error Scenarios

1. **Empty Topic**: Returns guidance on providing meaningful instruction topics
2. **Project Creation Failure**: Handles Convex database connection issues gracefully
3. **Content Generation Error**: Provides fallback templates when AI generation fails
4. **File Naming Conflicts**: Automatically appends version numbers for duplicates

#### Error Response Examples

```typescript
// Empty input
{
  success: false,
  message: "Please provide a topic for your instructions. Example: /instructions component development guidelines"
}

// Database error
{
  success: false,
  message: "Failed to save instructions. Please check your connection and try again."
}

// AI generation error
{
  success: false,
  message: "Content generation failed. A basic template has been created for you to customize."
}
```

### AI Context Integration

#### Context Injection Process

1. **Instruction Indexing**: All instructions are indexed by topic and keywords
2. **Context Matching**: When AI chat starts, relevant instructions are identified
3. **Content Inclusion**: Matched instructions are included in system prompt
4. **Dynamic Updates**: Context updates as new instructions are created

#### Context Template

```typescript
const contextTemplate = `
Available Instructions for ${topic}:

${relevantInstructions.map(inst => `
## ${inst.title}
${inst.content}
`).join('\n')}

Please follow these guidelines when responding to the user.
`;
```

---

## CMO Agent (Twitter)

### Overview

The CMO Agent is a premium social media content creation and strategy agent specializing in Twitter/X content. It provides intelligent content generation, scheduling optimization, and brand voice consistency.

### Specification

| Property        | Value                                    |
| --------------- | ---------------------------------------- |
| **Agent ID**    | `cmo`                                    |
| **Command**     | `/twitter`                               |
| **Name**        | CMO Agent (Twitter)                      |
| **Description** | Premium social media content creation   |
| **Icon**        | 🐦                                       |
| **Premium**     | Yes                                      |
| **Status**      | ✅ Production Ready                      |

### Premium Features

#### Advanced Content Generation
- **Brand Voice Analysis**: Maintains consistent brand voice across posts
- **Engagement Optimization**: Uses analytics to optimize for engagement
- **Hashtag Intelligence**: Recommends optimal hashtags based on trends
- **Threading Support**: Creates engaging Twitter thread content
- **A/B Testing**: Suggests multiple variants for testing

#### Smart Scheduling
- **Optimal Timing**: AI-powered optimal posting time recommendations
- **Audience Analysis**: Considers follower activity patterns
- **Content Spacing**: Prevents content cannibalization
- **Campaign Integration**: Coordinates with broader marketing campaigns

### Usage Examples

```bash
# Basic tweet creation
/twitter Check out our new platform features! 

# Scheduled tweet with project
/twitter New feature launch announcement --project Marketing --schedule "tomorrow 2pm"

# Brand voice customization
/twitter Product update --voice professional --audience business

# Thread creation
/twitter --thread "10 tips for better productivity" --parts 5

# Campaign coordination
/twitter --campaign "Q4 Launch" --stage "announcement" --schedule "Dec 15 9am"
```

### Command Parameters

| Parameter    | Type   | Required | Description                      | Example                    |
| ------------ | ------ | -------- | -------------------------------- | -------------------------- |
| `content`    | string | Yes      | Tweet content or topic           | "New feature announcement" |
| `project`    | string | No       | Target project for organization  | "Marketing", "Product"     |
| `schedule`   | string | No       | Scheduling time                  | "tomorrow 2pm", "Dec 15"   |
| `voice`      | string | No       | Brand voice tone                 | "professional", "casual"   |
| `audience`   | string | No       | Target audience                  | "business", "developers"   |
| `campaign`   | string | No       | Campaign association             | "Q4 Launch"                |
| `thread`     | flag   | No       | Create as Twitter thread         | --thread                   |
| `media`      | string | No       | Media type to include            | "image", "video", "gif"    |

### Technical Implementation

#### Content Creation Pipeline

1. **Input Analysis**: Parses content, extracts key themes and intent
2. **Brand Voice Application**: Applies consistent brand voice settings
3. **Content Optimization**: Optimizes for Twitter's algorithm and engagement
4. **Hashtag Generation**: Suggests relevant, trending hashtags
5. **Media Recommendation**: Suggests appropriate media types
6. **Scheduling Intelligence**: Recommends optimal posting times
7. **File Creation**: Creates `.x` file with full metadata

#### Premium Validation

```typescript
async execute(tool: AgentTool, input: string, mutations: ConvexMutations): Promise<AgentExecutionResult> {
  // Premium access validation
  if (!await this.validatePremiumAccess(context?.userId)) {
    return {
      success: false,
      message: "CMO Agent requires premium access. Upgrade to unlock advanced social media features.",
      requiresUpgrade: true,
      upgradeUrl: "/upgrade?feature=cmo-agent"
    };
  }

  return await this.createTwitterContent(input, mutations, context);
}
```

#### Generated File Structure

```json
{
  "platform": "twitter",
  "content": "[Generated tweet content]",
  "scheduledAt": "[ISO timestamp]",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "mentions": ["@username"],
  "media": {
    "type": "image",
    "url": "[media_url]",
    "alt": "[alt_text]"
  },
  "campaign": "[campaign_id]",
  "analytics": {
    "expectedImpressions": 1500,
    "engagementScore": 8.5,
    "brandVoiceScore": 9.2
  },
  "thread": {
    "isThread": false,
    "position": 1,
    "total": 1
  }
}
```

---

## File Creator Agent

### Overview

The File Creator Agent provides guided file creation with interactive selectors and intelligent templates. It offers a multi-step workflow that helps users create properly structured files in the correct projects.

### Specification

| Property        | Value                                    |
| --------------- | ---------------------------------------- |
| **Agent ID**    | `file-creator`                           |
| **Command**     | `/create-file`                           |
| **Name**        | File Creator Agent                       |
| **Description** | Guided file creation with templates      |
| **Icon**        | 📄                                       |
| **Premium**     | No                                       |
| **Status**      | ✅ Production Ready                      |

### Interactive Workflow

#### Step 1: Intent Recognition
- Analyzes natural language input to understand file creation intent
- Identifies potential file type, name, and content requirements
- Provides thinking messages to show AI reasoning process

#### Step 2: File Type Selection
- Interactive selector for file type (document, post, note, etc.)
- Shows available templates and their descriptions
- Guides user toward appropriate file type for their needs

#### Step 3: File Naming
- Intelligent file name suggestions based on content
- Validation for file naming conventions
- Extension assignment based on file type

#### Step 4: Project Selection
- Interactive project selector with search/filter capabilities
- Shows project descriptions and recent activity
- Option to create new project if needed

#### Step 5: Template Application
- Applies appropriate template based on file type
- Populates template with user-provided content
- Provides structure and formatting guidelines

### Usage Examples

```bash
# Natural language file creation
/create-file marketing launch tweet draft
/create-file meeting notes for client onboarding
/create-file technical documentation for API

# Specific file creation
/create-file README.md type:document project:MyProject
/create-file blog-post.md type:post project:Content

# Help and guidance
/create-file help                 # Lists supported file types
/create-file templates            # Shows available templates
```

### Supported File Types

| Type       | Extension | Template               | Use Case                    |
| ---------- | --------- | ---------------------- | --------------------------- |
| document   | .md       | Structured markdown    | Documentation, guides       |
| post       | .x        | Social media post      | Twitter, social content     |
| note       | .md       | Simple note template   | Quick notes, reminders      |
| campaign   | .json     | Campaign structure     | Marketing campaigns         |
| other      | .txt      | Plain text             | General purpose files       |

### Interactive Components

#### Project Selector Component

```typescript
interface ProjectSelector {
  type: "project_selector";
  data: {
    projects: {
      id: string;
      name: string;
      description?: string;
      fileCount: number;
      lastActivity: string;
    }[];
    allowCreateNew: boolean;
  };
  status: "pending" | "completed" | "cancelled";
  result?: {
    selectedProjectId: string;
    projectName: string;
  };
}
```

#### File Name Input Component

```typescript
interface FileNameInput {
  type: "file_name_input";
  data: {
    suggestedName: string;
    fileType: string;
    extension: string;
    validationRules: {
      maxLength: number;
      allowedChars: string;
      reservedNames: string[];
    };
  };
  status: "pending" | "completed" | "cancelled";
  result?: {
    fileName: string;
    finalPath: string;
  };
}
```

### Template System

#### Document Template

```markdown
# [Document Title]

_Created: [Date] | Project: [Project Name]_

## Overview

[Brief description of the document purpose]

## Contents

### Section 1

[Main content section]

### Section 2

[Additional content section]

## References

[Links and references]

---

_Last updated: [Date]_
```

#### Social Media Post Template

```json
{
  "platform": "[platform]",
  "content": "[post content]",
  "scheduledAt": null,
  "status": "draft",
  "hashtags": [],
  "mentions": [],
  "media": null,
  "audience": "general",
  "campaign": null,
  "notes": "[creation notes]"
}
```

---

## Project Creator Agent

### Overview

The Project Creator Agent enables natural language project creation with intelligent scaffolding and template-based initialization. It can bootstrap complete project structures with appropriate files and organization.

### Specification

| Property        | Value                                    |
| --------------- | ---------------------------------------- |
| **Agent ID**    | `project-creator`                        |
| **Command**     | `/create-project`                        |
| **Name**        | Project Creator Agent                    |
| **Description** | Bootstrap projects with scaffolding      |
| **Icon**        | 📁                                       |
| **Premium**     | No                                       |
| **Status**      | ✅ Production Ready                      |

### Project Templates

#### Marketing Campaign Template
- Campaign brief document
- Content calendar
- Asset tracking
- Performance metrics template
- Budget planning sheet

#### Content Creation Template
- Content strategy document
- Editorial calendar
- Style guide
- Asset library organization
- Publishing checklist

#### Product Launch Template
- Launch plan document
- Feature specifications
- Marketing materials
- Timeline and milestones
- Success metrics

### Usage Examples

```bash
# Natural language project creation
/create-project Marketing Campaign Q4 2024
/create-project Personal Blog for tech content
/create-project Client Presentation for Acme Corp

# Template-based creation
/create-project Social Media Hub template:marketing
/create-project Product Docs template:documentation
/create-project Team Onboarding template:internal

# Detailed project creation
/create-project "Mobile App Launch" description:"iOS app launch campaign" template:product-launch
```

---

## Scheduling Agent

### Overview

The Scheduling Agent automatically schedules unscheduled social media posts using intelligent timing algorithms and optimization strategies. It prevents content conflicts and maximizes engagement potential.

### Specification

| Property        | Value                                    |
| --------------- | ---------------------------------------- |
| **Agent ID**    | `scheduling`                             |
| **Command**     | `/schedule`                              |
| **Name**        | Scheduling Agent                         |
| **Description** | Batch schedule social media posts       |
| **Icon**        | 📅                                       |
| **Premium**     | No                                       |
| **Status**      | ✅ Production Ready                      |

### Scheduling Strategies

#### Optimal Strategy
- Analyzes historical engagement data
- Considers audience activity patterns  
- Avoids peak competition times
- Maximizes potential reach and engagement

#### Spread Strategy
- Evenly distributes posts across time period
- Maintains consistent posting frequency
- Prevents content clustering
- Ensures regular audience engagement

#### Custom Strategy
- User-defined posting times
- Flexible scheduling patterns
- Accommodates specific requirements
- Supports campaign coordination

### Usage Examples

```bash
# Schedule all unscheduled posts
/schedule

# Platform-specific scheduling
/schedule platform:twitter strategy:optimal
/schedule platform:all strategy:spread

# Timeframe-specific scheduling
/schedule timeframe:"next 7 days" strategy:optimal
/schedule timeframe:"this week" posts:5

# Custom timing patterns
/schedule custom:"9am,2pm,5pm" platform:twitter
/schedule workdays-only times:"10am,3pm"
```

### Algorithm Implementation

#### Engagement Analysis
1. **Historical Data Review**: Analyzes past post performance
2. **Audience Activity Mapping**: Identifies peak engagement times
3. **Competition Analysis**: Avoids oversaturated time slots
4. **Platform Optimization**: Considers platform-specific best practices

#### Conflict Resolution
1. **Time Slot Validation**: Ensures no scheduling conflicts
2. **Content Spacing**: Maintains appropriate gaps between posts
3. **Priority Handling**: Respects high-priority content scheduling
4. **Campaign Coordination**: Aligns with broader campaign timing

---

This comprehensive agent documentation provides detailed specifications for each agent in the AURA system, enabling developers and users to fully understand and utilize the agent capabilities.
