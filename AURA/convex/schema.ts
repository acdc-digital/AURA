import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example table for testing
  messages: defineTable({
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
  
  // Chat messages for AI assistant
  chatMessages: defineTable({
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system"), v.literal("terminal"), v.literal("thinking")),
    content: v.string(),
    sessionId: v.optional(v.string()),
    userId: v.optional(v.union(v.string(), v.id("users"))), // Associate messages with users
    createdAt: v.number(),
    // Token tracking for API usage and costs
    tokenCount: v.optional(v.number()), // Number of tokens in this message
    inputTokens: v.optional(v.number()), // Input tokens used for this API call (for assistant messages)
    outputTokens: v.optional(v.number()), // Output tokens generated for this API call (for assistant messages)
    estimatedCost: v.optional(v.number()), // Estimated cost in USD for this API call
    // Operation tracking for terminal messages
    operation: v.optional(v.object({
      type: v.union(
        v.literal("file_created"), 
        v.literal("project_created"), 
        v.literal("tool_executed"), 
        v.literal("error"),
        v.literal("campaign_created")
      ),
      details: v.optional(v.any()),
    })),
    // Process indicator for visual continuity in multi-step agent interactions
    processIndicator: v.optional(v.object({
      type: v.union(v.literal("continuing"), v.literal("waiting")),
      processType: v.string(),
      color: v.union(v.literal("blue"), v.literal("green")),
    })),
    // Interactive component for user input collection (updated for file type and name input) - schema refresh v4
    interactiveComponent: v.optional(v.object({
      type: v.union(v.literal("project_selector"), v.literal("file_name_input"), v.literal("file_type_selector"), v.literal("file_selector"), v.literal("edit_instructions_input"), v.literal("multi_file_selector"), v.literal("url_input")),
      data: v.optional(v.any()),
      status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
      result: v.optional(v.any()), // Result data from component interaction
    })),
    // Temporary flag for progress messages that can be cleaned up
    isTemporary: v.optional(v.boolean()),
  }).index("by_created_at", ["createdAt"])
    .index("by_session", ["sessionId", "createdAt"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_user_session", ["userId", "sessionId", "createdAt"]),
  
  // Agent progress tracking for pinned progress indicators
  agentProgress: defineTable({
    sessionId: v.string(),
    agentType: v.string(), // "instructions", "file-creator", "project-creator", etc.
    percentage: v.number(),
    status: v.string(),
    isComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"])
    .index("by_session_agent", ["sessionId", "agentType"])
    .index("by_created_at", ["createdAt"]),

  // Chat sessions for token tracking and limits
  chatSessions: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.union(v.string(), v.id("users"))),
    totalTokens: v.number(), // Total tokens used in this session
    totalInputTokens: v.number(), // Total input tokens for this session
    totalOutputTokens: v.number(), // Total output tokens for this session
    totalCost: v.number(), // Total estimated cost in USD for this session
    messageCount: v.number(), // Number of messages in this session
    isActive: v.boolean(), // Whether this session is still active
    isDeleted: v.optional(v.boolean()), // Soft delete flag - hidden from UI when true
    maxTokensAllowed: v.number(), // Maximum tokens allowed for this session (default: 180000)
    createdAt: v.number(),
    lastActivity: v.number(),
    // Session metadata
    title: v.optional(v.string()), // Auto-generated title for the session
    preview: v.optional(v.string()), // Preview of the first user message
  }).index("by_session_id", ["sessionId"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_user_active", ["userId", "isActive", "lastActivity"])
    .index("by_active", ["isActive", "lastActivity"])
    .index("by_user_not_deleted", ["userId", "isDeleted", "lastActivity"]),
  
  // Add more tables as needed for your EAC dashboard
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold")),
    budget: v.optional(v.number()),
    projectNo: v.optional(v.string()), // Added to match existing data
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_project_no", ["projectNo"]),

  // Files table to track all files created within projects
  files: defineTable({
    name: v.string(), // File name (e.g., "post-1.md", "campaign-brief.txt")
    type: v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"), 
      v.literal("image"), 
      v.literal("video"),
      v.literal("other")
    ),
    extension: v.optional(v.string()), // File extension (e.g., "md", "txt", "jpg")
    content: v.optional(v.string()), // File content for text files
    size: v.optional(v.number()), // File size in bytes
    projectId: v.id("projects"), // Reference to the parent project
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    path: v.optional(v.string()), // Relative path within project (e.g., "/posts/social/")
    mimeType: v.optional(v.string()), // MIME type for proper handling
    isDeleted: v.optional(v.boolean()), // Soft delete flag
    lastModified: v.number(), // Last modification timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
    // Social media specific fields
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube")
    )),
    postStatus: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    )),
    scheduledAt: v.optional(v.number()), // For scheduled posts
  })
    .index("by_project", ["projectId", "createdAt"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_type", ["type", "createdAt"])
    .index("by_platform", ["platform", "createdAt"])
    .index("by_project_type", ["projectId", "type"])
    .index("by_name", ["name"])
    .index("by_last_modified", ["lastModified"])
    .index("by_not_deleted", ["isDeleted", "createdAt"]),

  // Updated users table with Clerk authentication support
  users: defineTable({
    // Clerk authentication fields
    clerkId: v.optional(v.string()), // Clerk user ID
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Core user fields
    name: v.optional(v.string()), // Computed from firstName + lastName
    role: v.optional(v.string()),
    
    // Legacy fields (for backward compatibility - can be removed later)
    isAnonymous: v.optional(v.boolean()),
    image: v.optional(v.string()), // Use imageUrl instead
    emailVerificationTime: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"]),

  // Social media connections for API credentials
  socialConnections: defineTable({
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    platform: v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("reddit")
    ),
    username: v.string(),
    
    // Reddit-specific fields
    clientId: v.optional(v.string()),
    clientSecret: v.optional(v.string()), // Encrypted
    accessToken: v.optional(v.string()), // Encrypted
    refreshToken: v.optional(v.string()), // Encrypted
    userAgent: v.optional(v.string()),
    
    // X (Twitter)-specific fields
    // OAuth 2.0 fields
    twitterClientId: v.optional(v.string()),
    twitterClientSecret: v.optional(v.string()), // Encrypted
    twitterAccessToken: v.optional(v.string()), // Encrypted
    twitterRefreshToken: v.optional(v.string()), // Encrypted
    // OAuth 1.0a fields (alternative)
    twitterConsumerKey: v.optional(v.string()),
    twitterConsumerSecret: v.optional(v.string()), // Encrypted
    twitterAccessTokenSecret: v.optional(v.string()), // Encrypted
    // User info
    twitterUserId: v.optional(v.string()), // X user ID
    twitterScreenName: v.optional(v.string()), // @username
    // API tier info
    apiTier: v.optional(v.union(v.literal("free"), v.literal("basic"), v.literal("pro"))),
    monthlyTweetLimit: v.optional(v.number()),
    tweetsThisMonth: v.optional(v.number()),
    
    // Generic OAuth fields for other platforms
    apiKey: v.optional(v.string()), // Encrypted
    apiSecret: v.optional(v.string()), // Encrypted
    
    isActive: v.boolean(),
    lastSync: v.optional(v.number()),
    tokenExpiry: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "platform"])
    .index("by_platform", ["platform", "isActive"])
    .index("by_active", ["isActive", "userId"]),

  // Reddit posts with all necessary fields for API posting
  redditPosts: defineTable({
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    connectionId: v.id("socialConnections"),
    fileId: v.optional(v.id("files")), // Link to file if created from editor
    
    // Required Reddit API fields
    subreddit: v.string(),
    title: v.string(),
    kind: v.union(v.literal("self"), v.literal("link"), v.literal("image"), v.literal("video")),
    
    // Content fields (conditional based on kind)
    text: v.optional(v.string()), // For self posts
    url: v.optional(v.string()), // For link posts
    
    // Optional Reddit API fields
    nsfw: v.boolean(),
    spoiler: v.boolean(),
    flairId: v.optional(v.string()),
    flairText: v.optional(v.string()),
    sendReplies: v.boolean(),
    
    // Scheduling and status
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    ),
    publishAt: v.optional(v.number()), // Unix timestamp for scheduling
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")), // ID of scheduled function for cancellation
    publishedAt: v.optional(v.number()),
    publishedUrl: v.optional(v.string()), // Reddit URL after successful post
    redditId: v.optional(v.string()), // Reddit post ID (t3_xxx)
    
    // Error handling
    error: v.optional(v.string()), // Error message if failed
    retryCount: v.optional(v.number()),
    lastRetryAt: v.optional(v.number()),
    
    // Analytics data from Reddit API
    score: v.optional(v.number()), // Net upvotes (upvotes - downvotes)
    upvotes: v.optional(v.number()), // Total upvotes
    downvotes: v.optional(v.number()), // Total downvotes
    upvoteRatio: v.optional(v.number()), // Ratio of upvotes to total votes (0.0-1.0)
    totalAwardsReceived: v.optional(v.number()), // Number of awards
    numComments: v.optional(v.number()), // Number of comments
    numCrossposts: v.optional(v.number()), // Number of crossposts
    viewCount: v.optional(v.number()), // Views (if available)
    lastAnalyticsUpdate: v.optional(v.number()), // When analytics were last fetched
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_status", ["status", "publishAt"])
    .index("by_subreddit", ["subreddit", "createdAt"])
    .index("by_file", ["fileId"]),

  // Deleted projects - soft delete with 30-day retention
  deletedProjects: defineTable({
    // Original project data
    originalId: v.id("projects"), // Reference to original project ID before deletion
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("on-hold")),
    budget: v.optional(v.number()),
    projectNo: v.optional(v.string()),
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    originalCreatedAt: v.number(), // Original creation date
    originalUpdatedAt: v.number(), // Original update date
    
    // Deletion metadata
    deletedAt: v.number(), // When it was moved to trash
    deletedBy: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    
    // Associated files data (snapshot at deletion time)
    associatedFiles: v.optional(v.array(v.object({
      fileId: v.id("files"),
      name: v.string(),
      type: v.string(),
      size: v.optional(v.number()),
    }))),
  })
    .index("by_deleted_at", ["deletedAt"])
    .index("by_user", ["userId", "deletedAt"])
    .index("by_original_id", ["originalId"]),

  // Deleted files - soft delete with 30-day retention
  deletedFiles: defineTable({
    // Original file data
    originalId: v.id("files"), // Reference to original file ID before deletion
    name: v.string(),
    type: v.union(
      v.literal("post"), 
      v.literal("campaign"), 
      v.literal("note"), 
      v.literal("document"), 
      v.literal("image"), 
      v.literal("video"),
      v.literal("other")
    ),
    extension: v.optional(v.string()),
    content: v.optional(v.string()),
    size: v.optional(v.number()),
    projectId: v.id("projects"), // Original project reference
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    path: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    originalCreatedAt: v.number(),
    originalUpdatedAt: v.number(),
    originalLastModified: v.number(),
    
    // Social media fields
    platform: v.optional(v.union(
      v.literal("facebook"),
      v.literal("instagram"), 
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("youtube")
    )),
    postStatus: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    )),
    scheduledAt: v.optional(v.number()),
    
    // Deletion metadata
    deletedAt: v.number(), // When it was moved to trash
    deletedBy: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    parentProjectName: v.optional(v.string()), // Name of parent project for reference
  })
    .index("by_deleted_at", ["deletedAt"])
    .index("by_user", ["userId", "deletedAt"])
    .index("by_project", ["projectId", "deletedAt"])
    .index("by_original_id", ["originalId"]),

  // Agent posts with unified status tracking
  agentPosts: defineTable({
    // File identification
    fileName: v.string(),
    fileType: v.union(v.literal('reddit'), v.literal('twitter'), v.literal('linkedin'), v.literal('facebook'), v.literal('instagram')),
    
    // Post content
    content: v.string(),
    title: v.optional(v.string()), // For Reddit
    
    // Platform-specific data
    platformData: v.optional(v.string()), // JSON string for complex data
    
    // Campaign organization
    campaignId: v.optional(v.string()),
    batchId: v.optional(v.string()),
    
    // Status tracking
    status: v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('posting'),
      v.literal('posted'),
      v.literal('failed')
    ),
    
    // Post metadata
    metadata: v.optional(v.string()), // JSON string for campaign metadata
    
    // Submission details
    postId: v.optional(v.string()), // Platform post ID after submission
    postUrl: v.optional(v.string()), // URL to the live post
    scheduledFor: v.optional(v.number()), // Timestamp for scheduled posts
    postedAt: v.optional(v.number()), // Actual post timestamp
    errorMessage: v.optional(v.string()), // Error details if failed
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
  })
    .index("by_fileName", ["fileName"])
    .index("by_status", ["status"])
    .index("by_fileType", ["fileType"])
    .index("by_campaign", ["campaignId"])
    .index("by_batch", ["batchId"]),

  // Activity logs for history tracking
  activityLogs: defineTable({
    userId: v.optional(v.union(v.string(), v.id("users"))), // Allow both string and ID for migration
    type: v.union(v.literal('success'), v.literal('error'), v.literal('warning'), v.literal('info')),
    category: v.union(
      v.literal('social'),
      v.literal('file'),
      v.literal('project'),
      v.literal('connection'),
      v.literal('debug'),
      v.literal('system')
    ),
    action: v.string(),
    message: v.string(),
    details: v.optional(v.string()), // JSON string for complex data
    timestamp: v.number(),
  })
    .index('by_user', ['userId', 'timestamp'])
    .index('by_timestamp', ['timestamp'])
    .index('by_category', ['category', 'timestamp'])
    .index('by_type', ['type', 'timestamp']),

  // Campaigns for organizing large-scale marketing campaigns
  campaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    status: v.union(v.literal("planning"), v.literal("processing"), v.literal("active"), v.literal("completed"), v.literal("paused")),
    totalPosts: v.number(),
    processedPosts: v.number(),
    platforms: v.array(v.string()),
    template: v.optional(v.string()), // Instructions content
    userId: v.optional(v.union(v.string(), v.id("users"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_date", ["startDate"])
    .index("by_user", ["userId", "createdAt"]),

  // Extension requests from users
  extensionRequests: defineTable({
    userId: v.optional(v.union(v.string(), v.id("users"))),
    title: v.string(), // Short title/name for the extension
    description: v.string(), // Detailed description of what the user wants
    requestType: v.union(
      v.literal("new_extension"),
      v.literal("feature_enhancement"),
      v.literal("platform_integration"),
      v.literal("agent_improvement"),
      v.literal("other")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("in_development"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    category: v.optional(v.string()), // e.g., "social media", "analytics", "content creation"
    estimatedCost: v.optional(v.number()), // If pay-per-use, estimated cost
    upvotes: v.number(), // Community voting
    downvotes: v.number(),
    
    // Development tracking
    assignedTo: v.optional(v.string()), // Developer/team assigned
    estimatedCompletion: v.optional(v.number()), // Estimated completion date
    actualCompletion: v.optional(v.number()), // Actual completion date
    
    // Admin notes
    adminNotes: v.optional(v.string()), // Internal notes for development team
    publicNotes: v.optional(v.string()), // Public updates for users
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status", "createdAt"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_priority", ["priority", "createdAt"])
    .index("by_upvotes", ["upvotes"])
    .index("by_category", ["category", "createdAt"]),

  // Logo generations table
  logoGenerations: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    logoSvg: v.string(), // Base64 encoded image data
    prompt: v.string(),
    promptUsed: v.optional(v.string()), // The actual prompt used for generation
    brief: v.object({
      companyName: v.string(),
      business: v.string(),
      stylePreference: v.string(),
      colorPreferences: v.array(v.string()),
      logoType: v.string(),
      targetAudience: v.string(),
      specialInstructions: v.optional(v.string()),
    }),
    stylePreferences: v.optional(v.array(v.string())), // Additional style preferences array
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
    startedAt: v.optional(v.number()), // When generation started
    updatedAt: v.optional(v.number()), // When last updated
  })
    .index("by_user_status", ["userId", "status", "createdAt"])
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId", "createdAt"]),
});
