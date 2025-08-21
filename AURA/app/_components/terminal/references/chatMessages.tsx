// Simplified Chat Messages Component - No Slash Commands
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/chatMessages.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { useChat } from "@/lib/hooks/useChat";
import { useInstructionContext, useInstructions } from "@/lib/hooks/useInstructions";
import { useMCP } from "@/lib/hooks/useMCP";
import { useNewUserDetection } from "@/lib/hooks/useNewUserDetection";
import { useAgentStore, useEditorStore } from "@/store";
import { useOnboardingStore } from "@/store/onboarding";
import { useChatStore } from "@/store/terminal/chat";
import { useSessionStore } from "@/store/terminal/session";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import { EditInstructionsInput } from "./editInstructionsInput";
import { FileNameInput } from "./fileNameInput";
import { FileSelector } from "./fileSelector";
import { FileTypeSelector } from "./fileTypeSelector";
import { MarkdownRenderer } from "./markdownRenderer";
import { MultiFileSelector } from "./multiFileSelector";
import { ProjectNameInput } from "./projectNameInput";
import { ProjectSelector } from "./projectSelector";
import { UrlInput } from "./urlInput";

// Development imports
const TestOnboarding = process.env.NODE_ENV === 'development' 
  ? require('./testOnboarding').TestOnboarding 
  : null;

export function ChatMessages() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedOperations = useRef<Set<string>>(new Set());
  const lastSubmitTime = useRef(0); // For rate limiting
  const [message, setMessage] = useState("");
  const [activeAgentProcess, setActiveAgentProcess] = useState<{
    agentId: string;
    processType: string;
    timestamp: number;
  } | null>(null);

  // Debug logging to check if component is mounting
  useEffect(() => {
    console.log('🎯 ChatMessages component mounted');
  }, []);

  // Debug logging for activeAgentProcess changes
  useEffect(() => {
    console.log('activeAgentProcess changed:', activeAgentProcess);
  }, [activeAgentProcess]);

  
  const { user, isLoaded } = useUser();
  const { isNewUser, forceNewUserState } = useNewUserDetection();
  const { initializeUserSession, addTerminalFeedback, setSessionId } = useChatStore();
  const { activeSessionId } = useSessionStore();
  const { 
    messages, 
    isLoading: chatLoading, 
    sendMessage, 
    sendMessageWithStreaming,
    sessionId, 
    storeChatMessage, 
    addTerminalFeedback: useTerminalFeedback,
    streamingThinking,
    isStreamingThinking,
    messageCount,
    isNearSessionLimit,
    isAtSessionLimit,
    canAddMessages,
    getSessionStatus,
    startNewSession
  } = useChat();
  
  // Query for agent progress
  const agentProgress = useQuery(api.chat.getAgentProgress, { sessionId });
  const {
    isConnected: mcpConnected,
    isLoading: mcpLoading,
    error: mcpError,
    availableTools,
    processNaturalLanguage,
  } = useMCP();
  
  // Agent execution and mutations
  const { agents, activeAgentId, setActiveAgent, executeAgentTool, refreshAgents, getPostOnboardingGuidance, showPostOnboardingGuidance } = useAgentStore();
  
  // Onboarding state
  const {
    isOnboardingComplete,
    hasShownWelcome,
    isOnboardingActive,
    currentStep,
    responses,
    setOnboardingActive,
    setCurrentStep,
    setHasShownWelcome,
    setResponse,
    completeOnboarding,
    resetOnboarding,
    setCurrentUser,
  } = useOnboardingStore();
  
  const createInstruction = useMutation(api.files.createInstructionFile);
  const ensureInstructionsProject = useMutation(api.projects.ensureInstructionsProject);
  const upsertPost = useMutation(api.socialPosts.upsertPost);
  const schedulePost = useMutation(api.socialPosts.schedulePost);
  const createContentCreationFile = useMutation(api.files.createContentCreationFile);
  const createProject = useMutation(api.projects.createProject);
  const createFile = useMutation(api.files.createFile);
  const getAllUserFiles = useQuery(api.files.getAllUserFiles, {});
  const updateInteractiveComponent = useMutation(api.chat.updateInteractiveComponent);
  const editFileWithAI = useAction(api.editorActions.editFileWithAI);
  const generateInstructions = useAction(api.instructionsActions.generateInstructionsWithWebSearch);
  const sendChatMessage = useAction(api.chatActions.sendChatMessage);
  const updateFileContent = useMutation(api.files.updateFileContent);
  const allPosts = useQuery(api.socialPosts.getAllPosts, {});
  const allProjects = useQuery(api.projects.getProjects, {});
  const instructionContext = useInstructionContext();
  const { isLoading: instructionsLoading } = useInstructions();
  const { createNewFile, openTab } = useEditorStore();

  const isLoading = chatLoading || mcpLoading || instructionsLoading;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize user session when component mounts and user is loaded
  useEffect(() => {
    if (isLoaded && user && !sessionId) {
      console.log("🔄 Initializing user session...", { userId: user.id });
      initializeUserSession(user.id);
    }
  }, [user, isLoaded, sessionId, initializeUserSession]);

  // Sync chat store sessionId with active session from session store
  useEffect(() => {
    console.log("🔄 ChatMessages session sync check:", {
      activeSessionId,
      currentSessionId: sessionId,
      messagesCount: messages?.length || 0,
      needsSync: activeSessionId && activeSessionId !== sessionId
    });
    
    if (activeSessionId && activeSessionId !== sessionId) {
      console.log("🔄 Syncing chat sessionId with active session:", { 
        activeSessionId, 
        currentSessionId: sessionId 
      });
      setSessionId(activeSessionId);
    }
  }, [activeSessionId, sessionId, setSessionId, messages?.length]);

  // Update onboarding store with current user (resets state for new users)
  useEffect(() => {
    if (isLoaded && user) {
      console.log("👤 Setting current user in onboarding store:", user.id);
      setCurrentUser(user.id);
    }
  }, [user, isLoaded, setCurrentUser]);

  // Initialize onboarding for new users
  useEffect(() => {
    console.log("🔍 Onboarding useEffect triggered with:", {
      isLoaded,
      user: !!user,
      sessionId,
      isNewUser,
      isOnboardingComplete,
      hasShownWelcome,
      messagesLength: messages?.length
    });
    
    // Check for post-onboarding guidance
    if (isOnboardingComplete && isLoaded && user && sessionId) {
      const guidance = getPostOnboardingGuidance();
      if (guidance.shouldShow && guidance.message) {
        console.log("🎉 Showing post-onboarding guidance...");
        
        // Add the guidance message to chat
        storeChatMessage({
          role: 'assistant',
          content: guidance.message,
          sessionId,
          operation: {
            type: 'tool_executed',
            details: {
              tool: 'parent-orchestrator',
              command: '/guide',
              result: 'Post-onboarding guidance provided'
            }
          }
        });
        
        // Mark as shown
        guidance.dismiss();
        return;
      }
    }
    
    // Skip if onboarding is already complete (but no guidance needed)
    if (isOnboardingComplete) {
      console.log("✅ Onboarding already complete, skipping...");
      
      // If onboarding is complete but no agent is selected, default to auto mode
      if (!activeAgentId) {
        console.log("🎯 Setting auto mode as default for onboarded user");
        setActiveAgent('auto');
      }
      
      return;
    }
    
    // Skip if not loaded or no user
    if (!isLoaded || !user || !sessionId) {
      console.log("⏸️ Not ready - waiting for auth...");
      return;
    }
    
    // Skip if this is not a new user
    if (isNewUser !== true) {
      console.log("👤 Existing user, skipping onboarding...");
      return;
    }
    
    // Skip if welcome has already been shown (prevents infinite loop)
    if (hasShownWelcome) {
      console.log("🔄 Welcome already shown, skipping onboarding initialization...");
      return;
    }
    
    // For new users, start onboarding only if messages are empty
    console.log("🎯 Starting onboarding for new user...", { 
      userId: user.id, 
      isNewUser,
      sessionId,
      hasShownWelcome,
      isOnboardingComplete,
      messagesLength: messages?.length || 0
    });
    
    // Check if user has any previous messages (indicating they're not truly new)
    if (messages && messages.length === 0) {
      console.log("🚀 Proceeding with onboarding setup...");
      
      // Reset onboarding state for truly new users
      resetOnboarding(); // Clear any previous onboarding state
      setHasShownWelcome(true);
      setOnboardingActive(true);
      setCurrentStep('welcome');
      setActiveAgent('onboarding'); // Select the onboarding agent
      
      console.log("🔄 Onboarding state reset and configured");
        
      // Add welcome message with y/N prompt
      setTimeout(async () => {
        console.log("⏰ Sending welcome message...");
        
        await storeChatMessage({
          role: "assistant",
          content: `🎉 **Welcome to EAC Social Media Management!**

I'm your AI assistant and I'm excited to help you build an authentic social media presence.

Ready to get started? **y/N**`,
          sessionId: sessionId,
          processIndicator: {
            type: 'waiting',
            processType: 'onboarding',
            color: 'green'
          }
        });
        
        console.log('✅ Onboarding y/N prompt sent to terminal');
      }, 500);
    } else {
      console.log("❌ Skipping onboarding - user has existing messages:", messages?.length);
    }
  }, [isLoaded, user, sessionId, isNewUser, messages]);

  // Sync session ID if active session changes
  useEffect(() => {
    if (activeSessionId && activeSessionId !== sessionId) {
      console.log("🔄 Syncing to active session:", activeSessionId);
      setSessionId(activeSessionId);
    }
  }, [activeSessionId, sessionId, setSessionId]);

  // Clear active agent process after timeout
  useEffect(() => {
    if (activeAgentProcess) {
      const timeout = setTimeout(() => {
        const age = Date.now() - activeAgentProcess.timestamp;
        if (age > 5 * 60 * 1000) { // 5 minutes timeout
          setActiveAgentProcess(null);
        }
      }, 5 * 60 * 1000);

      return () => clearTimeout(timeout);
    }
  }, [activeAgentProcess]);

  // Handle URL submission for onboarding
  const handleUrlSubmit = async (url: string) => {
    if (!sessionId) return;
    
    try {
      setCurrentStep('analyzing');
      
      // Store user's URL submission
      await storeChatMessage({
        role: "user",
        content: url,
        sessionId: sessionId,
      });

      // Ensure instructions project exists first
      await ensureInstructionsProject();
      
      // Call the instructions generation action  
      console.log('🔍 Starting instruction generation...');
      const generatedContent = await generateInstructions({
        topic: `Brand Analysis for ${url}`,
        sessionId,
      });
      
      console.log('✅ Instruction generation completed successfully');
      
      // Create the instruction file using client-side mutations
      const brandName = url.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
      const filename = `${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_brand_guidelines.md`;
      
      const createdFile = await createInstruction({
        name: filename,
        content: generatedContent,
        topic: `Brand Guidelines for ${brandName}`,
        audience: "Content creators and marketers"
      });
      
      console.log('✅ Instruction file created:', createdFile);
      
      // Show success message
      await storeChatMessage({
        role: "assistant",
        content: `✅ **Brand Analysis Complete!**

🎯 **Brand Analysis Successful**
- Analyzed: ${url}
- Custom instructions generated and saved to your instructions folder
- Your workspace is now personalized with your brand guidelines

🚀 **Next Steps:**
1. Explore your custom instructions in the sidebar
2. Try creating content with \`/twitter\` or \`/create-project\`
3. Use \`/schedule\` to plan your content calendar

Welcome to EAC! Your personalized workspace is ready.`,
        sessionId: sessionId,
      });
      
      // Open the created instructions file
      if (createdFile) {
        console.log('📂 Opening created instructions file:', createdFile);
        
        // Create a ProjectFile object for the editor
        const instructionFile = {
          id: createdFile._id,
          name: createdFile.name,
          icon: 'FileText', // Default markdown icon
          type: 'markdown' as const,
          category: 'project' as const,
          content: createdFile.content || '',
          filePath: createdFile.path + createdFile.name,
          createdAt: new Date(createdFile.createdAt),
          modifiedAt: new Date(createdFile.lastModified),
          convexId: createdFile._id,
        };
        
        // Open the file in the editor
        openTab(instructionFile);
        
        console.log('✅ Instructions file opened in editor with type:', instructionFile.type);
      } else {
        console.log('⚠️ No file information returned from brand analysis');
      }
      
      // Complete onboarding
      completeOnboarding();
      
      // Switch to auto mode after onboarding completion
      if (activeAgentId === 'onboarding') {
        setActiveAgent('auto');
        console.log('🎯 Onboarding complete - switching to auto mode');
      }
      
      // Refresh agents to update disabled states
      refreshAgents();
      
    } catch (error) {
      console.error('🔥 Onboarding URL submission failed:', error);
      
      // Check if this is an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAuthError = errorMessage.includes('Authentication required') || errorMessage.includes('Please sign in');
      
      if (isAuthError) {
        await storeChatMessage({
          role: "system",
          content: `❌ **Authentication Required**

Please make sure you're signed in to use the brand analysis feature.

You can:
- Refresh the page and sign in again
- Continue using EAC and set up brand instructions later with \`/onboard [your-url]\`

Would you like to try again after signing in?`,
          sessionId: sessionId,
        });
      } else {
        // Check if this is an API overload error
        const isOverloadError = errorMessage.includes('Overloaded') || errorMessage.includes('overloaded_error');
        
        if (isOverloadError) {
          await storeChatMessage({
            role: "system",
            content: `✅ **Onboarding Complete!**

🎯 **Brand Guidelines Created**
- Analyzed: ${url}
- Starter brand guidelines generated and saved to your instructions folder
- ⚠️ AI was temporarily busy, so we created comprehensive starter guidelines for you

🚀 **Next Steps:**
1. Review your starter brand guidelines in the sidebar
2. Customize them based on your specific brand identity
3. Try AI-powered analysis again later for enhanced insights
4. Start creating content with \`/twitter\` or \`/create-project\`

Welcome to EAC! Your workspace is ready with baseline brand guidelines.`,
            sessionId: sessionId,
          });
          
          completeOnboarding();
          
          // Switch to auto mode after onboarding completion
          if (activeAgentId === 'onboarding') {
            setActiveAgent('auto');
            console.log('🎯 Onboarding complete - switching to auto mode');
          }
          
          // Refresh agents to update disabled states
          refreshAgents();
          
          return;
        }
        
        // Generic error handling
        await storeChatMessage({
          role: "system",
          content: `❌ **Error analyzing brand URL**

There was an issue analyzing your website. This might be due to:
- API rate limits (please try again in a moment)
- Website accessibility issues
- Network connectivity problems

You can:
- Try again with the same URL
- Try a different URL
- Continue using EAC and set up brand instructions later with \`/onboard [your-url]\`

Would you like to try again?`,
          sessionId: sessionId,
        });
      }
      
      // Keep the URL input active for retry unless it's an overload error
      setCurrentStep('url-input');
    }
  };

  // DISABLED: Process messages with operations to create UI files
  // This is now handled by useFileLoad hook which syncs from Convex to local store
  /*
  useEffect(() => {
    if (!messages) return;
    
    console.log('🔍 Processing messages for operations:', {
      totalMessages: messages.length,
      recentMessagesCount: messages.slice(-10).length,
      processedCount: processedOperations.current.size
    });
    
    // Look for messages with operations that need UI processing
    const recentMessages = messages.slice(-10); // Check last 10 messages
    
    recentMessages.forEach((message: any, index) => {
      console.log(`🔍 Message ${index}:`, {
        id: message._id,
        role: message.role,
        hasOperation: !!message.operation,
        operationType: message.operation?.type,
        operationDetails: message.operation?.details,
        contentPreview: message.content?.substring(0, 100),
        alreadyProcessed: processedOperations.current.has(message._id)
      });
      
      if (message.operation?.type === 'file_created' && message._id) {
        // Skip if already processed
        if (processedOperations.current.has(message._id)) {
          console.log(`⏭️ Skipping already processed message: ${message._id}`);
          return;
        }
        
        const { fileName, fileType, content, platformData, agentType } = message.operation.details;
        
        console.log('🔍 File creation operation found:', {
          fileName,
          fileType,
          agentType,
          hasContent: !!content,
          contentLength: content?.length || 0,
          willProcess: agentType === 'twitter' && content
        });
        
        // Only process Twitter agent files for UI creation that have content
        if (agentType === 'twitter' && content) {
          console.log('🔄 Processing social file operation:', {
            fileName,
            fileType,
            content: content,
            contentLength: content?.length || 0,
            contentType: typeof content,
            messageId: message._id,
            platformData: platformData,
            allDetails: message.operation.details
          });
          
          // Mark as processed FIRST to prevent race conditions
          processedOperations.current.add(message._id);
          
          // Parse the platform data with error handling
          let platformDataObj;
          try {
            platformDataObj = platformData ? JSON.parse(platformData) : {};
          } catch (error) {
            console.warn('⚠️ Failed to parse platform data, using defaults:', error);
            platformDataObj = {
              replySettings: 'following',
              scheduledDate: '',
              scheduledTime: '',
              isThread: false
            };
          }
          
          // Create the content for the Twitter post file in the expected format
          const postContent = `# ${fileName.replace(/\.[^/.]+$/, "")} - X (Twitter) Post
Platform: X (Twitter)
Created: ${new Date().toLocaleDateString()}

## Post Content
${content}

## Settings
- Reply Settings: ${platformDataObj.replySettings || 'following'}
- Schedule: ${platformDataObj.scheduledDate && platformDataObj.scheduledTime ? `${platformDataObj.scheduledDate} ${platformDataObj.scheduledTime}` : 'Now'}
- Thread: ${platformDataObj.isThread ? 'Multi-tweet Thread' : 'Single Tweet'}

## Media
- Images: []
- Videos: []

## Analytics
- Impressions: 0
- Engagements: 0
- Likes: 0
- Shares: 0`;

          // Get the createNewFile function from the store at execution time
          const { createNewFile, projectFolders } = useEditorStore.getState();
          
          // Find the Content Creation folder ID
          const contentCreationFolder = projectFolders.find(folder => 
            folder.name === 'Content Creation'
          );
          
          if (contentCreationFolder) {
            // Create the file in the Content Creation folder
            createNewFile(
              fileName,
              'x', // Use 'x' type for Twitter files
              'project',
              contentCreationFolder.id,
              postContent
            );
            
            console.log('✅ Created social file in UI:', fileName);
          } else {
            console.warn('⚠️ Content Creation folder not found');
            
            // Create without folder ID if folder not found
            createNewFile(
              fileName,
              'x',
              'project',
              undefined,
              postContent
            );
          }
        }
      }
    });
  }, [messages]); // Removed createNewFile from dependencies to prevent re-runs on panel switches
  */

  // Helper function to strip markdown formatting
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
      .replace(/`([^`]+)`/g, '$1') // Remove `code`
      .replace(/^\s*[-*+]\s+/gm, '• ') // Convert markdown lists to bullet points
      .replace(/^\s*\d+\.\s+/gm, '• ') // Convert numbered lists to bullet points
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple blank lines to double
      .split('\n') // Split into lines for processing
      .map(line => {
        // Add spacing after section headers (lines that don't start with bullet points)
        if (line.trim() && !line.startsWith('•') && !line.startsWith(' ') && line.length > 0) {
          return line + '\n'; // Add extra newline after headers
        }
        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
      .trim();
  };

  // Helper function to detect MCP-related queries (excluding direct tool commands)
  const isMCPQuery = (text: string): boolean => {
    // Don't treat direct tool commands as NLP queries
    if (text.startsWith('/')) return false;
    
    // Look for keywords that suggest MCP analysis would be helpful
    const mcpKeywords = [
      'analyze', 'examine', 'review', 'explain', 'understand', 'architecture',
      'structure', 'code', 'component', 'function', 'implementation', 'pattern',
      'best practice', 'issue', 'bug', 'error', 'performance', 'optimization',
      'refactor', 'improvement', 'documentation', 'overview', 'summary',
      'how does', 'what is', 'why is', 'where is', 'when is', 'which'
    ];
    
    const lowerText = text.toLowerCase();
    return mcpKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleToolSelectorClose = () => {
    setMessage("");
    inputRef.current?.focus();
  };

  // Helper function to create convexMutations object for agents
  const createConvexMutations = () => {
    return {
      ensureInstructionsProject,
      createInstructionFile: createInstruction,
      upsertPost,
      schedulePost,
      createContentCreationFile,
      createProject: async (params: any) => {
        return await createProject({
          name: params.name,
          description: params.description,
          status: params.status || 'active',
          budget: params.budget,
        });
      },
      getProjects: async () => {
        return allProjects || [];
      },
      getAllFiles: async () => {
        return getAllUserFiles || [];
      },
      storeChatMessage: async (params: any) => {
        return await storeChatMessage({
          role: params.role,
          content: params.content,
          sessionId: params.sessionId || sessionId,
          operation: params.operation,
          processIndicator: params.processIndicator,
          interactiveComponent: params.interactiveComponent,
        });
      },
      updateInteractiveComponent: async (params: any) => {
        return await updateInteractiveComponent({
          messageId: params.messageId,
          status: params.status,
          result: params.result,
        });
      },
      createFile: async (params: any) => {
        return await createFile({
          name: params.name,
          type: params.type,
          projectId: params.projectId, // This should be an Id<"projects"> from the actual project creation
          content: params.content,
          extension: params.extension,
          platform: params.platform,
          size: params.size,
        });
      },
      getAllPosts: async () => {
        return allPosts || [];
      },
      editFileWithAI: async (params: any) => {
        return await editFileWithAI({
          fileName: params.fileName,
          originalContent: params.originalContent,
          editInstructions: params.editInstructions,
          fileType: params.fileType,
        });
      },
      updateFileContent: async (params: any) => {
        return await updateFileContent({
          fileId: params.fileId,
          content: params.content,
        });
      },
      // Campaign-related functions (simplified for now)
      createCampaign: async (params: any) => {
        // For now, just return a simple campaign ID since the API isn't ready
        console.log('Campaign creation requested:', params);
        return { _id: `campaign_${Date.now()}` };
      },
      createPostsBatch: async (params: any) => {
        // For now, just log the batch creation
        console.log('Batch posts creation requested:', params);
        return params.posts.map((_: any, index: number) => `post_${Date.now()}_${index}`);
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent rapid submissions (rate limiting)
    const now = Date.now();
    if (now - lastSubmitTime.current < 1000) { // 1 second minimum between submissions
      console.warn("Rate limited: Too fast submission");
      return;
    }
    lastSubmitTime.current = now;
    
    // Check session limit before processing
    if (!canAddMessages()) {
      console.warn("Cannot send message: Session limit reached");
      // Add a terminal feedback message about the limit
      await storeChatMessage({
        role: "terminal",
        content: `[${new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })}] 🚨 Message not sent: Session limit reached (500 messages)
Please start a new session to continue chatting.`,
        sessionId,
      });
      return;
    }
    
    if (message.trim() && !isLoading) {
      const messageContent = message.trim();
      console.log('💬 User submitting message:', messageContent);
      setMessage("");
      
      // FIRST: Check if user is responding to onboarding prompt (y/N or onboarding questions)
      console.log('🔍 Checking onboarding state:', { 
        hasShownWelcome, 
        isOnboardingComplete, 
        isOnboardingActive,
        currentStep,
        messageContent
      });
      
      if (hasShownWelcome && !isOnboardingComplete) {
        console.log('🎯 User is in onboarding flow - routing to sendChatMessage');
        try {
          // Use sendChatMessage which handles onboarding responses
          await sendChatMessage({
            content: messageContent,
            originalContent: messageContent,
            sessionId,
          });
          return;
        } catch (error) {
          console.error('Onboarding message error:', error);
          // Fall through to regular processing if onboarding fails
        }
      }
      
      // Check for intelligent routing to parent orchestrator
      if (isOnboardingComplete && (
        messageContent.includes('/guide') || 
        messageContent.includes('/workflow') || 
        messageContent.includes('/status') || 
        messageContent.includes('/help') ||
        messageContent.includes('what should i do') ||
        messageContent.includes('what next') ||
        messageContent.includes('help me')
      )) {
        console.log('🎯 Routing to parent orchestrator for:', messageContent);
        try {
          // Create convex mutations for the orchestrator
          const convexMutations = createConvexMutations();
          
          // Store user message first
          await storeChatMessage({
            role: "user",
            content: messageContent,
            sessionId,
          });
          
          // Execute intelligent routing via parent orchestrator
          const result = await executeAgentTool(
            'parent-orchestrator',
            'routing', // Special routing identifier - registry handles this case
            messageContent,
            convexMutations,
            sessionId
          );
          
          // Store the orchestrator response
          await storeChatMessage({
            role: "assistant",
            content: result,
            sessionId,
            operation: {
              type: 'tool_executed',
              details: {
                tool: 'parent-orchestrator',
                command: messageContent.startsWith('/') ? messageContent.split(' ')[0] : '/guide',
                result: 'Orchestration guidance provided'
              }
            }
          });
          
          return;
        } catch (error) {
          console.error('❌ Parent orchestrator execution failed:', error);
          
          // Check if this is an overloaded error
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isOverloadError = errorMessage.includes('Overloaded') || errorMessage.includes('overloaded_error');
          
          if (isOverloadError) {
            // Handle overloaded error gracefully for orchestrator
            await storeChatMessage({
              role: "assistant",
              content: `⏳ **EAC Assistant Temporarily Busy**

I'm experiencing high demand right now, but I can still help you with simpler tasks.

**Quick alternatives while I recover:**
- Check available agents in the 🤖 panel 
- Use direct agent commands (they may work faster):
  - \`/twitter [content]\` - Create social posts
  - \`/create-project [name]\` - Start new projects
  - \`/instructions [topic]\` - Generate guidelines

**Your request:** "${messageContent}"

I'll be back to full capacity shortly! 🚀`,
              sessionId,
              operation: {
                type: 'error',
                details: { 
                  error: 'Orchestrator overloaded - try direct agent commands',
                  originalMessage: messageContent,
                  retryable: true,
                  suggestions: ['Use agent panel', 'Try direct commands', 'Wait and retry']
                }
              }
            });
          } else {
            // Fall through to regular chat if orchestrator fails with other errors
            await storeChatMessage({
              role: "assistant",
              content: `❌ **EAC Assistant Unavailable**

I encountered an issue while processing your request. Let me try a different approach.

**Alternative options:**
- Use the 🤖 agents panel to activate specific tools
- Try direct commands like \`/twitter\`, \`/create-project\`, or \`/instructions\`
- Ask me simpler questions that don't require complex routing

**Error:** ${errorMessage}

Would you like me to help you find the right tool for your task?`,
              sessionId,
              operation: {
                type: 'error',
                details: { 
                  error: errorMessage,
                  fallbackSuggested: true,
                  originalMessage: messageContent
                }
              }
            });
          }
          
          return;
        }
      }
      
      // Check if this is an agent command when an agent is active
      // Handle auto mode vs specific agent selection
      if (activeAgentId && !messageContent.startsWith('/')) {
        console.log('🤖 Checking active agent mode:', activeAgentId);
        
        // Auto mode - use intelligent routing via parent orchestrator
        if (activeAgentId === 'auto') {
          console.log('🎯 Auto mode active - routing to parent orchestrator for intelligent routing');
          
          // Execute intelligent routing via parent orchestrator
          const result = await executeAgentTool(
            'parent-orchestrator',
            'routing', // Special routing identifier - registry handles this case
            messageContent
          );
          
          // Store the message pair
          const convexMutations = createConvexMutations();
          if (convexMutations.storeChatMessage) {
            await convexMutations.storeChatMessage({
              role: 'user',
              content: messageContent,
              metadata: {
                tool: 'parent-orchestrator',
                timestamp: Date.now(),
                sessionId: sessionId,
              },
            });
            
            await convexMutations.storeChatMessage({
              role: 'assistant', 
              content: result,
              metadata: {
                tool: 'parent-orchestrator',
                timestamp: Date.now(),
                sessionId: sessionId,
              },
            });
          }
          
          setMessage("");
          return;
        }
        
        // Specific agent mode - route directly to selected agent
        console.log('🤖 Specific agent mode - routing to:', activeAgentId);
        
        let shouldRouteToAgent = true;
        
        // Special handling for editor agent - only route if file is selected and waiting for edit instructions
        if (activeAgentId === 'editor') {
          const { EditorAgent } = await import('@/agents/implementations/editor/editorAgent');
          const hasSelectedFile = EditorAgent.selectedFile !== null;
          const isWaitingForEditInstructions = EditorAgent.currentStep === 'edit-request';
          
          console.log('🔍 Editor agent state check:', {
            hasSelectedFile,
            isWaitingForEditInstructions,
            selectedFile: EditorAgent.selectedFile,
            currentStep: EditorAgent.currentStep
          });
          
          // If no file selected, agent should show file selector
          // If file selected and waiting for instructions, agent should process the edit
          // Always route to editor agent when it's active
          shouldRouteToAgent = true;
        }
        
        if (shouldRouteToAgent) {
          console.log('🤖 Routing to active agent:', activeAgentId);
          try {
            console.log(`🤖 Executing agent ${activeAgentId} with message: ${messageContent}`);
            
            // Create convex mutations for the agent
            const convexMutations = createConvexMutations();
          
          // Check if the last message was an agent waiting for input
          const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
          const isFollowUpToWaitingAgent = lastMessage && 
            lastMessage.role === 'assistant' && 
            lastMessage.processIndicator?.type === 'waiting';
          
          console.log('Pre-execution state:', {
            lastMessage: lastMessage ? {
              role: lastMessage.role,
              processIndicator: lastMessage.processIndicator,
              contentPreview: lastMessage.content.substring(0, 50)
            } : null,
            isFollowUpToWaitingAgent
          });
          
          // Find the active agent and its default tool
          const activeAgent = agents.find(agent => agent.id === activeAgentId);
          if (activeAgent && activeAgent.tools.length > 0) {
            const defaultTool = activeAgent.tools[0]; // Use the first tool as default
            
            // ✅ FIX #1: Always store the user message first, regardless of agent result
            await storeChatMessage({
              role: "user",
              content: messageContent,
              sessionId,
              processIndicator: isFollowUpToWaitingAgent ? {
                type: 'continuing',
                processType: 'file-creation',
                color: 'blue'
              } : undefined,
            });
            
            // Execute the agent tool
            const result = await executeAgentTool(
              activeAgentId,
              defaultTool.id,
              messageContent,
              convexMutations,
              sessionId
            );
            
            // Handle empty results from interactive components
            if (!result || result.trim() === "") {
              console.log('Agent returned empty result - this is expected for interactive components');
              // User message was already stored above - interactive component handles the UI
              return;
            }
            
            // Check if result indicates waiting for user input (project selection)
            const isWaitingForInput = result.includes("🎯 Select a project:") || 
                                    result.includes("💡 **Next message:** Just type your selection!") ||
                                    result.includes("Which Project?") ||
                                    result.includes("Available Projects:");
            
            // Check if result indicates successful completion
            const isCompletionResponse = result.includes("✅ **File Created Successfully!**") ||
                                       result.includes("File Created Successfully!") ||
                                       result.includes("**Next Steps:**") ||
                                       result.includes("Next Steps:");
            
            console.log('Agent Execution Debug:', {
              activeAgentId,
              result: result.substring(0, 200) + '...',
              isWaitingForInput,
              isCompletionResponse,
              isFollowUpToWaitingAgent,
              hasSelectProject: result.includes("🎯 Select a project:"),
              hasNextMessage: result.includes("💡 **Next message:** Just type your selection!"),
              hasWhichProject: result.includes("Which Project?"),
              hasAvailableProjects: result.includes("Available Projects:"),
              hasFileCreated: result.includes("✅ **File Created Successfully!**"),
              hasNextSteps: result.includes("**Next Steps:**")
            });
            
            if (isWaitingForInput) {
              console.log('Setting active agent process for file creation');
              setActiveAgentProcess({
                agentId: activeAgentId,
                processType: 'file-creation',
                timestamp: Date.now()
              });
            } else {
              console.log('Clearing active agent process - agent completed');
              // Clear active process when agent completes
              setActiveAgentProcess(null);
              
              // For editor agent, keep it active during the file selection workflow
              // Only clear it when the editing is actually complete
              if (activeAgentId === 'editor') {
                // Check if editor agent is waiting for edit instructions after file selection
                const { EditorAgent } = await import('@/agents/implementations/editor/editorAgent');
                if (EditorAgent.currentStep === 'edit-request' && EditorAgent.selectedFile) {
                  console.log('Keeping editor agent active - waiting for edit instructions');
                  // Keep the agent active to receive editing instructions
                } else if (EditorAgent.currentStep === 'file-selection') {
                  console.log('Keeping editor agent active - waiting for file selection');
                  // Keep the agent active during file selection
                } else {
                  console.log('Clearing editor agent - editing complete');
                  setActiveAgent(null);
                }
              } else {
                // Clear active agent ID if the result indicates interactive components are shown
                // This prevents subsequent text input from being routed back to the agent
                if (result.includes("Select a file to edit") || 
                    result.includes("file_selector") ||
                    result.includes("Choose a file from the selector")) {
                  console.log('Clearing active agent ID - interactive component shown');
                  setActiveAgent(null);
                }
              }
            }
            
            // Store agent result with process indicators (user message already stored above)
            await storeChatMessage({
              role: "assistant",
              content: `🤖 **${activeAgent.name} Agent Result:**\n\n${result}`,
              sessionId,
              processIndicator: (isWaitingForInput || isCompletionResponse || isFollowUpToWaitingAgent) ? {
                type: 'waiting',
                processType: 'file-creation',
                color: 'green'
              } : undefined,
            });
            
            // Debug log for what processIndicator was set
            console.log('StoreChatMessage Debug:', {
              messageType: 'assistant',
              willHaveProcessIndicator: !!(isWaitingForInput || isCompletionResponse || isFollowUpToWaitingAgent),
              isWaitingForInput,
              isCompletionResponse,
              isFollowUpToWaitingAgent,
              resultSnippet: result.substring(0, 100)
            });
            
            return;
          }
        } catch (error) {
          console.error('Agent execution error:', error);
          
          // Store the user message and error
          await storeChatMessage({
            role: "user",
            content: messageContent,
            sessionId,
          });
          
          await storeChatMessage({
            role: "assistant",
            content: `❌ Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            sessionId,
          });
          
          return;
        }
        } // Close the if (shouldRouteToAgent) block
      }
      
      // Check if this looks like a natural language MCP query
      if (mcpConnected && isMCPQuery(messageContent)) {
        try {
          const mcpResponse = await processNaturalLanguage(messageContent);
          
          if (mcpResponse.success && mcpResponse.content && mcpResponse.content.length > 0) {
            // Extract the actual text content from the MCP response
            const textContent = mcpResponse.content[0].text;
            
            // Strip markdown formatting and convert to plain text
            const plainText = stripMarkdown(textContent);
            
            // Send the MCP response with clean text content
            await sendMessage(`🤖 MCP Analysis:\n\n${plainText}`);
          } else {
            await sendMessage(messageContent);
          }
        } catch (error) {
          console.error('MCP Error:', error);
          // Fall back to regular chat
          await sendMessage(messageContent);
        }
      } else {
        // Regular chat message - add instruction context if available
        let contextualMessage = messageContent;
        if (instructionContext) {
          contextualMessage = `${instructionContext}\n\n---\n\n${messageContent}`;
        }
        
        // Always use streaming thinking for all messages (thinking enabled by default)
        try {
          await sendMessageWithStreaming(contextualMessage, messageContent);
        } catch (error) {
          console.error('❌ Chat message failed:', error);
          
          // Check if this is an overloaded error
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isOverloadError = errorMessage.includes('Overloaded') || errorMessage.includes('overloaded_error');
          
          if (isOverloadError) {
            // Handle overloaded error gracefully
            await storeChatMessage({
              role: "assistant",
              content: `⏳ **System Temporarily Busy**

The AI system is experiencing high demand right now. Your message was received, but processing may be delayed.

**What you can do:**
- Wait a moment and try again
- Use simpler commands for faster processing
- Try using agent commands directly (e.g., \`/guide\`, \`/status\`)

**Your message:** "${messageContent}"

The system will be back to normal capacity shortly. Thank you for your patience! 🙏`,
              sessionId,
              operation: {
                type: 'error',
                details: { 
                  error: 'System overloaded - temporary delay',
                  originalMessage: messageContent,
                  retryable: true
                }
              }
            });
          } else {
            // Handle other errors
            await storeChatMessage({
              role: "assistant", 
              content: `❌ **Message Failed**

Sorry, there was an issue processing your message: "${messageContent}"

**Error:** ${errorMessage}

Please try again or use a different approach.`,
              sessionId,
              operation: {
                type: 'error',
                details: { error: errorMessage, originalMessage: messageContent }
              }
            });
          }
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto bg-[#0e0e0e] p-2 pb-8 min-h-0 scrollbar-hidden"
      >
        <div className="font-mono text-xs space-y-2 min-h-full">
          {/* Terminal Welcome Text */}
          <div className="text-[#cccccc] space-y-1 mb-4">
            <div>EAC Financial Dashboard - AI Assistant</div>
            {mcpError && (
              <div className="text-[#f48771] text-xs">MCP Error: {mcpError}</div>
            )}
            <div className="text-[#858585] mt-2">AI Assistant ready for EAC project questions.</div>
            <div className="text-[#858585] text-xs">Session: {sessionId.slice(-8)}</div>
            
            {/* Development Testing */}
            {process.env.NODE_ENV === 'development' && TestOnboarding && (
              <TestOnboarding forceNewUserState={forceNewUserState} />
            )}
            
            {/* Session Status and Limits */}
            <div className="text-[#858585] text-xs">
              Messages: {messageCount}/500
              {isNearSessionLimit && (
                <span className="text-[#f48771] ml-2">⚠️ Approaching limit</span>
              )}
              {isAtSessionLimit && (
                <span className="text-[#f48771] ml-2">🚨 Session full</span>
              )}
            </div>
            

          </div>

          {/* Messages */}
          {messages?.map((msg, index) => {
            // Use the stored processIndicator for visual continuity
            const hasProcessIndicator = msg.processIndicator;
            const isUserProcessMessage = hasProcessIndicator && msg.role === 'user' && hasProcessIndicator.type === 'continuing';
            const isAgentProcessMessage = hasProcessIndicator && msg.role === 'assistant' && hasProcessIndicator.type === 'waiting';
            
            return (
              <div key={msg._id || `msg-${index}`} className="space-y-1">
                {msg.role === 'user' && (
                  <div className={`text-[#007acc] ${isUserProcessMessage ? 'border-l-4 border-[#0078d4] pl-3' : ''}`}>
                    <span className="text-[#007acc]">$ user:</span>
                    <span className="ml-1 text-[#cccccc]">{msg.content}</span>
                    {isUserProcessMessage && (
                      <div className="text-[10px] text-[#0078d4] mt-1 opacity-80">
                        ↳ Continuing {msg.processIndicator?.processType?.replace('-', ' ')}...
                      </div>
                    )}
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <div className={`text-[#4ec9b0] ${isAgentProcessMessage ? 'border-l-4 border-[#4ec9b0] pl-3' : ''}`}>
                    <span className="text-[#4ec9b0]">$ assistant:</span>
                    <div className="ml-1">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                    
                    {/* Interactive Component */}
                    {msg.interactiveComponent && (msg.interactiveComponent.status === 'pending' || msg.interactiveComponent.status === 'completed') && (
                      <div className="mt-3 ml-1">
                        {msg.interactiveComponent.type === 'project_selector' && !msg.interactiveComponent.data?.projectNameInput && (
                          <ProjectSelector
                            fileDetails={msg.interactiveComponent.data?.fileDetails}
                            disabled={msg.interactiveComponent.status === 'completed'}
                            selectedProject={msg.interactiveComponent.status === 'completed' ? msg.interactiveComponent.result?.selectedProject : undefined}
                            onProjectSelected={async (project) => {
                              try {
                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { selectedProject: project },
                                });

                                // Continue the file creation process
                                const convexMutations = createConvexMutations();
                                const fileCreatorAgent = agents.find(a => a.id === 'file-creator');
                                if (fileCreatorAgent) {
                                  // Simulate user input for project selection
                                  const projectSelectionInput = `Add it to ${project.name}`;
                                  
                                  // Send user message showing the selection
                                  await storeChatMessage({
                                    role: 'user',
                                    content: `Selected project: ${project.name}`,
                                    sessionId: sessionId,
                                    processIndicator: {
                                      type: 'continuing',
                                      processType: 'project_selection',
                                      color: 'blue',
                                    },
                                  });

                                  // Execute the agent with the selection
                                  console.log('🚀 Executing agent with project selection:', projectSelectionInput);
                                  console.log('🔧 Agent details:', {
                                    agentId: fileCreatorAgent.id,
                                    toolId: fileCreatorAgent.tools[0].id,
                                    toolName: fileCreatorAgent.tools[0].name,
                                    convexMutationsAvailable: {
                                      createFile: !!convexMutations.createFile,
                                      getProjects: !!convexMutations.getProjects,
                                      storeChatMessage: !!convexMutations.storeChatMessage,
                                    }
                                  });
                                  
                                  const result = await executeAgentTool(
                                    fileCreatorAgent.id,
                                    fileCreatorAgent.tools[0].id,
                                    projectSelectionInput,
                                    convexMutations,
                                    sessionId
                                  );
                                  
                                  console.log('📥 Agent execution result:', result);
                                  console.log('📏 Result length:', result?.length || 0);
                                  console.log('📋 Result content preview:', result?.substring(0, 100));
                                  console.log('🔍 Result type:', typeof result);
                                  console.log('🎯 Is result truthy:', !!result);
                                  console.log('🎯 Is result empty string:', result === "");
                                  console.log('🎯 Result trimmed length:', result?.trim()?.length || 0);

                                  // Only store non-empty results
                                  if (result && result.trim() !== "") {
                                    console.log('✅ Storing success message to chat...');
                                    console.log('📋 Current session ID:', sessionId);
                                    console.log('📋 Message content length:', result.length);
                                    
                                    // Store the agent's response
                                    const storedMessage = await storeChatMessage({
                                      role: 'assistant',
                                      content: result,
                                      sessionId: sessionId,
                                      processIndicator: {
                                        type: 'waiting',
                                        processType: 'file_creation_complete',
                                        color: 'green',
                                      },
                                    });
                                    
                                    console.log('✅ Success message stored to chat!');
                                    console.log('📋 Stored message result:', storedMessage);
                                    
                                    // Wait a moment and check if the message appears in the messages array
                                    setTimeout(() => {
                                      console.log('🔍 Messages after success storage:', {
                                        totalMessages: messages?.length || 0,
                                        lastMessage: messages?.[messages.length - 1]?.content?.substring(0, 50) + '...',
                                        lastMessageRole: messages?.[messages.length - 1]?.role,
                                        sessionId: sessionId
                                      });
                                    }, 1000);
                                  } else {
                                    console.log('⚠️ Agent returned empty result after project selection');
                                  }
                                }
                              } catch (error) {
                                console.error('Error handling project selection:', error);
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Error processing project selection. Please try again.',
                                });
                              }
                            }}
                            onCancel={async () => {
                              try {
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'cancelled',
                                });
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ File creation cancelled. You can start a new file creation request anytime.',
                                });
                              } catch (error) {
                                console.error('Error cancelling project selection:', error);
                              }
                            }}
                            className="mb-2"
                          />
                        )}

                        {msg.interactiveComponent.type === 'file_selector' && (
                          <FileSelector
                            disabled={msg.interactiveComponent.status === 'completed'}
                            selectedFile={msg.interactiveComponent.status === 'completed' ? msg.interactiveComponent.result?.selectedFile : undefined}
                            onFileSelected={async (file) => {
                              try {
                                console.log('🔥 [FileSelector] File selected callback triggered:', file);
                                
                                // Use the file name for database storage but pass complete object to agent
                                const filePath = file.name || file.path || file.id;
                                
                                console.log('🔥 [FileSelector] Updating interactive component status');
                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { selectedFile: filePath },
                                });

                                console.log('🔥 [FileSelector] Continuing the file selection process');
                                // Continue the file selection process based on the active agent
                                const convexMutations = createConvexMutations();
                                const activeAgent = agents.find(a => a.id === activeAgentId);
                                
                                if (activeAgent && activeAgentId === 'director') {
                                  console.log('🔥 [FileSelector] Found director agent, processing campaign instructions');
                                  // Send user message showing the selection
                                  await storeChatMessage({
                                    role: 'user',
                                    content: `Selected file: ${file.name}`,
                                    sessionId: sessionId,
                                    processIndicator: {
                                      type: 'continuing',
                                      processType: 'file_selection',
                                      color: 'blue',
                                    },
                                  });

                                  console.log('🔥 [FileSelector] Executing director agent with file selection');
                                  try {
                                    const result = await executeAgentTool(
                                      activeAgentId,
                                      activeAgent.tools[0].id, // Use the tool ID instead of command
                                      `Selected file: ${file.name}`,
                                      convexMutations,
                                      sessionId
                                    );
                                    
                                    console.log('🔥 [FileSelector] Director agent execution result:', result);
                                    
                                    // Store the director agent's response
                                    await storeChatMessage({
                                      role: 'assistant',
                                      content: result,
                                      sessionId,
                                      operation: {
                                        type: 'tool_executed',
                                        details: {
                                          selectedFile: file.name,
                                          agentType: 'director'
                                        }
                                      }
                                    });
                                  } catch (error) {
                                    console.error('❌ [FileSelector] Error executing director agent:', error);
                                  }
                                } else if (activeAgent && activeAgentId === 'editor') {
                                  console.log('🔥 [FileSelector] Found editor agent, processing file edit');
                                  // Send user message showing the selection
                                  await storeChatMessage({
                                    role: 'user',
                                    content: `Selected file: ${file.name}`,
                                    sessionId: sessionId,
                                    processIndicator: {
                                      type: 'continuing',
                                      processType: 'file_selection',
                                      color: 'blue',
                                    },
                                  });

                                  console.log('🔥 [FileSelector] Calling handleFileSelected method');
                                  // Call the editor agent's handleFileSelected method with complete file object
                                  try {
                                    const { editorAgent: actualEditorAgent } = await import('@/agents/implementations/editor/editorAgent');
                                    console.log('🔥 [FileSelector] Imported actual editor agent instance');
                                    console.log('🔥 [FileSelector] Agent has handleFileSelected:', 'handleFileSelected' in actualEditorAgent);
                                    
                                    if ('handleFileSelected' in actualEditorAgent) {
                                      await actualEditorAgent.handleFileSelected(sessionId, file);
                                      console.log('🔥 [FileSelector] handleFileSelected completed successfully');
                                    } else {
                                      console.error('❌ [FileSelector] handleFileSelected method not found on editor agent');
                                    }
                                  } catch (error) {
                                    console.error('❌ [FileSelector] Error calling handleFileSelected:', error);
                                  }
                                    
                                  console.log('🔥 [FileSelector] Storing message with edit instructions input');
                                  // Show edit instructions input component
                                  await storeChatMessage({
                                    role: 'assistant',
                                    content: `✅ **File Selected: ${file.name}**

📄 **The file has been opened in the editor tab.**`,
                                    sessionId,
                                    interactiveComponent: {
                                      type: 'edit_instructions_input',
                                      status: 'pending',
                                      data: {
                                        fileName: file.name,
                                        placeholder: 'Describe what changes you want to make to this file...',
                                        examples: [
                                          'Add a section about best practices',
                                          'Update the pricing information',
                                          'Make the tone more professional',
                                          'Fix any grammar or spelling errors',
                                          'Add examples and code snippets'
                                        ]
                                      }
                                    }
                                  });
                                }
                              } catch (error) {
                                console.error('Error handling file selection:', error);
                              }
                            }}
                            onCancel={async () => {
                              try {
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'cancelled',
                                });
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ File editing cancelled. You can start a new edit request anytime.',
                                  sessionId,
                                });
                              } catch (error) {
                                console.error('Error cancelling file selection:', error);
                              }
                            }}
                            className="mb-2"
                          />
                        )}

                        {msg.interactiveComponent.type === 'edit_instructions_input' && (
                          <EditInstructionsInput
                            placeholder={msg.interactiveComponent.data?.placeholder}
                            fileName={msg.interactiveComponent.data?.fileName}
                            examples={msg.interactiveComponent.data?.examples}
                            onInstructionsSubmitted={async (instructions) => {
                              try {
                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { instructions },
                                });

                                // Send user message showing the edit instructions
                                await storeChatMessage({
                                  role: 'user',
                                  content: instructions,
                                  sessionId: sessionId,
                                  processIndicator: {
                                    type: 'continuing',
                                    processType: 'edit_instructions',
                                    color: 'blue',
                                  },
                                });

                                // Continue the editing process using agent registry
                                const convexMutations = createConvexMutations();
                                const result = await executeAgentTool(
                                  'editor',
                                  'edit-file',
                                  instructions,
                                  convexMutations,
                                  sessionId
                                );

                                await storeChatMessage({
                                  role: 'assistant',
                                  content: result,
                                  sessionId: sessionId,
                                });
                              } catch (error) {
                                console.error('Error processing edit instructions:', error);
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: `❌ **Error processing edit instructions**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`,
                                  sessionId: sessionId,
                                });
                              }
                            }}
                            onCancel={async () => {
                              try {
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'cancelled',
                                });
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Edit instructions cancelled. You can start a new edit request anytime.',
                                  sessionId,
                                });
                              } catch (error) {
                                console.error('Error cancelling edit instructions:', error);
                              }
                            }}
                            className="mb-2"
                          />
                        )}

                        {(msg.interactiveComponent.type as any) === 'multi_file_selector' && (
                          <MultiFileSelector
                            disabled={msg.interactiveComponent.status === 'completed'}
                            selectedFiles={msg.interactiveComponent.status === 'completed' ? msg.interactiveComponent.result?.selectedFiles : undefined}
                            title={msg.interactiveComponent.data?.title || "Select instruction files"}
                            placeholder={msg.interactiveComponent.data?.placeholder || "Search instruction files..."}
                            maxSelections={msg.interactiveComponent.data?.maxSelections || 5}
                            fileTypeFilter={msg.interactiveComponent.data?.fileTypeFilter || ['markdown', 'document']}
                            onFilesSelected={async (files) => {
                              try {
                                console.log('🔥 [MultiFileSelector] Files selected:', files);
                                
                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { selectedFiles: files },
                                });

                                // Send user message showing the selection
                                const fileNames = files.map((f: any) => f.name).join(', ');
                                await storeChatMessage({
                                  role: 'user',
                                  content: `Selected instruction files: ${fileNames}`,
                                  sessionId: sessionId,
                                  processIndicator: {
                                    type: 'continuing',
                                    processType: 'multi_file_selection',
                                    color: 'blue',
                                  },
                                });

                                // Continue the process based on the active agent
                                const convexMutations = createConvexMutations();
                                const activeAgent = agents.find(a => a.id === activeAgentId);
                                
                                if (activeAgent && activeAgentId === 'director') {
                                  console.log('🔥 [MultiFileSelector] Found director agent, processing campaign instructions');
                                  
                                  try {
                                    // Pass the selected files to the director agent directly (not as a tool call)
                                    const selectionMessage = `Selected files: ${fileNames}`;
                                    const result = await executeAgentTool(
                                      activeAgentId, 
                                      'orchestrate-campaign', // Use the tool ID instead of command
                                      selectionMessage, 
                                      convexMutations, 
                                      sessionId
                                    );
                                    
                                    console.log('🔥 [MultiFileSelector] Director agent execution result:', result);
                                    
                                    // Store the director agent's response
                                    await storeChatMessage({
                                      role: 'assistant',
                                      content: result,
                                      sessionId,
                                      operation: {
                                        type: 'tool_executed',
                                        details: {
                                          selectedFiles: files,
                                          agentType: 'director',
                                        },
                                      },
                                    });
                                  } catch (error) {
                                    console.error('❌ [MultiFileSelector] Error executing director agent:', error);
                                    await storeChatMessage({
                                      role: 'assistant',
                                      content: '❌ Error processing instruction files. Please try again.',
                                      sessionId,
                                    });
                                  }
                                }
                              } catch (error) {
                                console.error('Error handling multi-file selection:', error);
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Error processing file selection. Please try again.',
                                  sessionId,
                                });
                              }
                            }}
                            onCancel={async () => {
                              try {
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'cancelled',
                                });
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ File selection cancelled. You can start a new campaign request anytime.',
                                  sessionId,
                                });
                              } catch (error) {
                                console.error('Error cancelling multi-file selection:', error);
                              }
                            }}
                            className="mb-2"
                          />
                        )}

                        {msg.interactiveComponent.type === 'project_selector' && msg.interactiveComponent.data?.projectNameInput && (
                          <ProjectNameInput
                            placeholder={msg.interactiveComponent.data?.placeholder}
                            defaultValue={msg.interactiveComponent.data?.defaultValue}
                            onProjectNameSubmitted={async (projectName) => {
                              try {
                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { projectName },
                                });

                                // Continue the project creation process
                                const convexMutations = createConvexMutations();
                                const projectCreatorAgent = agents.find(a => a.id === 'project-creator');
                                if (projectCreatorAgent) {
                                  // Send user message showing the project name
                                  await storeChatMessage({
                                    role: 'user',
                                    content: `Project name: ${projectName}`,
                                    processIndicator: {
                                      type: 'continuing',
                                      processType: 'project_name_input',
                                      color: 'blue',
                                    },
                                  });

                                  // Execute the agent with the project name
                                  console.log('🚀 Executing agent with project name:', projectName);
                                  
                                  const result = await executeAgentTool(
                                    projectCreatorAgent.id,
                                    projectCreatorAgent.tools[0].id,
                                    projectName,
                                    convexMutations
                                  );
                                  
                                  console.log('📥 Agent execution result:', result);

                                  // Only store non-empty results
                                  if (result && result.trim() !== "") {
                                    console.log('✅ Storing project creation success message...');
                                    
                                    // Store the agent's response
                                    await storeChatMessage({
                                      role: 'assistant',
                                      content: result,
                                      sessionId: sessionId,
                                      processIndicator: {
                                        type: 'waiting',
                                        processType: 'project_creation_complete',
                                        color: 'green',
                                      },
                                    });
                                    
                                    console.log('✅ Project creation success message stored!');
                                  } else {
                                    console.log('⚠️ Agent returned empty result after project name input');
                                  }
                                }
                              } catch (error) {
                                console.error('Error handling project name input:', error);
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Error processing project name. Please try again.',
                                });
                              }
                            }}
                            onCancel={async () => {
                              try {
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'cancelled',
                                });
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Project creation cancelled. You can start a new project creation request anytime.',
                                });
                              } catch (error) {
                                console.error('Error cancelling project name input:', error);
                              }
                            }}
                            className="mb-2"
                          />
                        )}
                        {(msg.interactiveComponent.type as string) === 'file_type_selector' && (
                          <FileTypeSelector
                            onFileTypeSelected={async (fileType) => {
                              try {
                                // Create a serializable version of the fileType without React components
                                const serializableFileType = {
                                  type: fileType.type,
                                  extension: fileType.extension,
                                  description: fileType.description,
                                  platform: fileType.platform,
                                  available: fileType.available
                                };

                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { fileType: serializableFileType },
                                });

                                // Continue the file creation process
                                const convexMutations = createConvexMutations();
                                const fileCreatorAgent = agents.find(a => a.id === 'file-creator');
                                if (fileCreatorAgent) {
                                  // Send user message showing the file type selection
                                  await storeChatMessage({
                                    role: 'user',
                                    content: `Selected file type: ${fileType.description}`,
                                    sessionId: sessionId,
                                    processIndicator: {
                                      type: 'continuing',
                                      processType: 'file_type_selection',
                                      color: 'blue',
                                    },
                                  });

                                  // Execute the agent with the file type selection
                                  console.log('🚀 Executing file creator agent with file type:', fileType);
                                  
                                  const result = await executeAgentTool(
                                    fileCreatorAgent.id,
                                    fileCreatorAgent.tools[0].id,
                                    `File type: ${fileType.type}`,
                                    convexMutations
                                  );
                                  
                                  console.log('📥 File creator agent result:', result);

                                  // Only store non-empty results
                                  if (result && result.trim() !== "") {
                                    console.log('✅ Storing file type continuation message...');
                                    
                                    // Store the agent's response
                                    await storeChatMessage({
                                      role: 'assistant',
                                      content: result,
                                      sessionId: sessionId,
                                      processIndicator: {
                                        type: 'waiting',
                                        processType: 'file_type_continue',
                                        color: 'green',
                                      },
                                    });
                                    
                                    console.log('✅ File type continuation message stored!');
                                  } else {
                                    console.log('⚠️ Agent returned empty result after file type selection');
                                  }
                                }
                              } catch (error) {
                                console.error('Error handling file type selection:', error);
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Error processing file type selection. Please try again.',
                                  sessionId: sessionId,
                                });
                              }
                            }}
                            onCancel={async () => {
                              try {
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'cancelled',
                                });
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ File creation cancelled. You can start a new file creation request anytime.',
                                  sessionId,
                                });
                              } catch (error) {
                                console.error('Error cancelling file type selection:', error);
                              }
                            }}
                            disabled={msg.interactiveComponent.status === 'completed'}
                            selectedFileType={msg.interactiveComponent.status === 'completed' ? msg.interactiveComponent.result?.fileType : undefined}
                            className="mb-2"
                          />
                        )}
                        {(msg.interactiveComponent.type as string) === 'file_name_input' && (
                          <FileNameInput
                            placeholder={msg.interactiveComponent.data?.placeholder}
                            defaultValue={msg.interactiveComponent.data?.defaultValue}
                            fileType={msg.interactiveComponent.data?.fileType}
                            onFileNameSubmitted={async (fileName) => {
                              try {
                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { fileName },
                                });

                                // Continue the file creation process
                                const convexMutations = createConvexMutations();
                                const fileCreatorAgent = agents.find(a => a.id === 'file-creator');
                                if (fileCreatorAgent) {
                                  // Execute the agent with the file name FIRST
                                  console.log('🚀 Executing file creator agent with file name:', fileName);
                                  
                                  const result = await executeAgentTool(
                                    fileCreatorAgent.id,
                                    fileCreatorAgent.tools[0].id,
                                    fileName,
                                    convexMutations
                                  );

                                  // THEN send user message showing the file name (after agent processes it)
                                  await storeChatMessage({
                                    role: 'user',
                                    content: fileName,
                                    sessionId: sessionId,
                                    processIndicator: {
                                      type: 'continuing',
                                      processType: 'file_name_input',
                                      color: 'blue',
                                    },
                                  });
                                  
                                  console.log('📥 File creator agent result:', result);

                                  // Only store non-empty results
                                  if (result && result.trim() !== "") {
                                    console.log('✅ Storing file creation continuation message...');
                                    
                                    // Store the agent's response
                                    await storeChatMessage({
                                      role: 'assistant',
                                      content: result,
                                      sessionId: sessionId,
                                      processIndicator: {
                                        type: 'waiting',
                                        processType: 'file_creation_continue',
                                        color: 'green',
                                      },
                                    });
                                    
                                    console.log('✅ File creation continuation message stored!');
                                  } else {
                                    console.log('⚠️ Agent returned empty result after file name input');
                                  }
                                }
                              } catch (error) {
                                console.error('Error handling file name input:', error);
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Error processing file name. Please try again.',
                                  sessionId: sessionId,
                                });
                              }
                            }}
                            onCancel={async () => {
                              try {
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'cancelled',
                                });
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ File creation cancelled. You can start a new file creation request anytime.',
                                  sessionId,
                                });
                              } catch (error) {
                                console.error('Error cancelling file name input:', error);
                              }
                            }}
                            className="mb-2"
                          />
                        )}
                        {msg.interactiveComponent.type === 'url_input' && (
                          <UrlInput
                            onSubmit={async (url) => {
                              try {
                                // Update the component status to completed
                                await updateInteractiveComponent({
                                  messageId: msg._id,
                                  status: 'completed',
                                  result: { url },
                                });

                                // Send user message showing the URL
                                await storeChatMessage({
                                  role: 'user',
                                  content: url,
                                  sessionId: sessionId,
                                });

                                // Trigger onboarding agent with the URL
                                await sendMessage(`/onboard ${url}`);
                                
                              } catch (error) {
                                console.error('Error handling URL submission:', error);
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: '❌ Error processing URL. Please try again.',
                                  sessionId: sessionId,
                                });
                              }
                            }}
                            isLoading={chatLoading}
                          />
                        )}
                      </div>
                    )}
                    
                    {isAgentProcessMessage && (
                      <div className="text-[10px] mt-1 opacity-80">
                        {(() => {
                          // Check for successful file creation with specific file info
                          if (msg.content.includes("The comprehensive instruction document has been created and saved to your files.")) {
                            // Extract filename from the message
                            const fileMatch = msg.content.match(/📄 \*\*File:\*\* `([^`]+)`/);
                            const fileName = fileMatch ? fileMatch[1] : null;
                            
                            if (fileName) {
                              return (
                                <button
                                  onClick={() => {
                                    const { projectFiles } = useEditorStore.getState();
                                    const file = projectFiles.find(f => f.name === fileName);
                                    if (file) {
                                      useEditorStore.getState().openTab(file);
                                    }
                                  }}
                                  className="text-[#007acc] hover:text-[#4ec9b0] hover:underline cursor-pointer transition-colors"
                                >
                                  ↳ Click here to view your file...
                                </button>
                              );
                            }
                          }

                          // Check for CMO report generation success
                          if (msg.content.includes("CMO_REPORT_GENERATED_SUCCESS:")) {
                            const fileMatch = msg.content.match(/CMO_REPORT_GENERATED_SUCCESS:\s*(.+)$/);
                            const fileName = fileMatch ? fileMatch[1].trim() : null;
                            
                            if (fileName) {
                              return (
                                <button
                                  onClick={() => {
                                    const { projectFiles } = useEditorStore.getState();
                                    const file = projectFiles.find(f => f.name === fileName);
                                    if (file) {
                                      useEditorStore.getState().openTab(file);
                                    }
                                  }}
                                  className="flex items-center gap-1 text-[#007acc] hover:text-[#4ec9b0] hover:underline cursor-pointer transition-colors text-xs"
                                >
                                  <span className="transform rotate-90">↳</span>
                                  Open Instructions File Tab
                                </button>
                              );
                            }
                          }

                          // Check for CMO report that needs manual save
                          if (msg.content.includes("CMO_REPORT_MANUAL_SAVE_NEEDED:")) {
                            const fileMatch = msg.content.match(/CMO_REPORT_MANUAL_SAVE_NEEDED:\s*(.+)$/);
                            const fileName = fileMatch ? fileMatch[1].trim() : null;
                            
                            if (fileName) {
                              return (
                                <button
                                  onClick={async () => {
                                    try {
                                      const convexMutations = createConvexMutations();
                                      // Use the same report content from the message to create instruction file
                                      const reportMatch = msg.content.match(/📋 \*\*Marketing Campaign Report Generated\*\*([\s\S]*?)⚠️ \*\*Note:/);
                                      const reportContent = reportMatch ? reportMatch[1].trim() : 'Marketing Campaign Report';
                                      
                                      // Execute the instructions agent to create the file
                                      await executeAgentTool(
                                        'instructions',
                                        'natural-language-instructions',
                                        `Create marketing campaign instruction file named "${fileName}" with the campaign strategy report that was just generated`,
                                        convexMutations
                                      );
                                    } catch (error) {
                                      console.error('Error creating instruction file:', error);
                                    }
                                  }}
                                  className="flex items-center gap-1 text-[#007acc] hover:text-[#4ec9b0] hover:underline cursor-pointer transition-colors text-xs"
                                >
                                  <span className="transform rotate-90">↳</span>
                                  Create an Instruction File Here
                                </button>
                              );
                            }
                          }
                          
                          // Check for other success indicators
                          if (msg.content.includes("✅ **File Created Successfully!**") || 
                              msg.content.includes("✅ **Project Created Successfully!**") ||
                              msg.content.includes("✅ **Template Applied Successfully!**")) {
                            return <span className="text-[#4ec9b0]">↳ Process completed successfully!</span>;
                          }
                          
                          // Default waiting message
                          return <span className="text-[#4ec9b0]">↳ Agent waiting for your input...</span>;
                        })()}
                      </div>
                    )}

                    {/* CMO Agent Create Instruction File Button - only appears when CMO agent is active */}
                    {(() => {
                      const shouldShow = activeAgentId === 'cmo' && msg.role === 'assistant';
                      console.log('🔍 Button condition check:', {
                        activeAgentId,
                        msgRole: msg.role,
                        shouldShow,
                        msgContent: msg.content.substring(0, 50)
                      });
                      return shouldShow;
                    })() && (
                      <div className="mt-2 ml-1">
                        <button
                          onClick={async () => {
                            try {
                              // Extract key information from the Campaign Director's response
                              const content = msg.content;
                              
                              // Generate a descriptive filename based on content
                              let fileName = "campaign-strategy";
                              
                              // Try to extract campaign name or type from content
                              const titleMatch = content.match(/(?:^|\n)#\s*(.+)$/m);
                              if (titleMatch) {
                                const title = titleMatch[1].trim().toLowerCase()
                                  .replace(/[^a-z0-9\s]/g, '')
                                  .replace(/\s+/g, '-')
                                  .substring(0, 50);
                                fileName = title || fileName;
                              }
                              
                              // Add timestamp to ensure uniqueness
                              const timestamp = new Date().toISOString().split('T')[0];
                              const finalFileName = `${fileName}-${timestamp}`;
                              
                              // Format the content as a nice instruction document
                              const instructionContent = `# Campaign Strategy Instructions

This instruction document was generated from a Campaign Strategy response.

---

${content}

---

**Generated:** ${new Date().toLocaleString()}
**Source:** Campaign Strategy Agent`;

                              // Create the instruction file directly
                              await createInstruction({
                                name: finalFileName,
                                content: instructionContent,
                                topic: "Campaign Strategy",
                                audience: "Marketing Team"
                              });
                              
                              console.log('✅ Instruction file created successfully:', finalFileName);
                              
                              // Show success feedback
                              const successMessage = `✅ **Instruction File Created!**\n\n📄 **File:** \`${finalFileName}.md\`\n🎯 **Topic:** Campaign Strategy\n📁 **Location:** Instructions Project\n\nThe campaign strategy has been saved as an instruction file for future reference.`;
                              
                              // Add success message to chat
                              if (storeChatMessage && sessionId) {
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: successMessage,
                                  sessionId: sessionId,
                                });
                              }
                              
                            } catch (error) {
                              console.error('Error creating instruction file:', error);
                              
                              // Show error feedback
                              const errorMessage = `❌ **Failed to Create Instruction File**\n\nThere was an error saving the campaign strategy as an instruction file. Please try again or contact support if the issue persists.`;
                              
                              if (storeChatMessage && sessionId) {
                                await storeChatMessage({
                                  role: 'assistant',
                                  content: errorMessage,
                                  sessionId: sessionId,
                                });
                              }
                            }
                          }}
                          className="flex items-center gap-1 text-[#007acc] hover:text-[#4ec9b0] hover:underline cursor-pointer transition-colors text-xs opacity-60 hover:opacity-100"
                        >
                          <span className="transform rotate-90">↳</span>
                          Create an Instruction File Here
                        </button>
                      </div>
                    )}

                    {/* CMO Agent Create Instruction File Button - only appears for CMO agent responses */}
                    {(msg.content.includes('CMO_REPORT_GENERATED_SUCCESS') || msg.content.includes('CMO_REPORT_MANUAL_SAVE_NEEDED')) && (
                      <div className="mt-2 ml-1">
                        <button
                          onClick={async () => {
                            try {
                              const convexMutations = createConvexMutations();
                              
                              // Create a descriptive prompt from the assistant's response
                              const responseContent = msg.content.substring(0, 200).trim();
                              const prompt = `Create instruction file from this CMO agent response: "${responseContent}${msg.content.length > 200 ? '...' : ''}"`;
                              
                              // Execute the instructions agent to create the file
                              await executeAgentTool(
                                'instructions',
                                'generate-instructions',
                                prompt,
                                convexMutations
                              );
                            } catch (error) {
                              console.error('Error creating instruction file:', error);
                            }
                          }}
                          className="flex items-center gap-1 text-[#007acc] hover:text-[#4ec9b0] hover:underline cursor-pointer transition-colors text-xs opacity-60 hover:opacity-100"
                        >
                          <span className="transform rotate-90">↳</span>
                          Create an Instruction File Here
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {msg.role === 'thinking' && (
                  <div className="text-[#d4d4aa]">
                    <span className="text-[#d4d4aa]">🧠 thinking:</span>
                    <div className="ml-1 text-[#cccccc] whitespace-pre-wrap text-xs font-mono italic">
                      {msg.content}
                    </div>
                  </div>
                )}
                {msg.role === 'terminal' && (
                  <div className="text-[#858585]">
                    <div className="text-[#585858] whitespace-pre-wrap bg-[#1a1a1a] p-1 rounded text-[10px] border-l-2 border-[#333]">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Streaming Thinking Display */}
          {isStreamingThinking && streamingThinking && (
            <div className="space-y-1">
              <div className="text-[#d4d4aa]">
                <span className="text-[#d4d4aa]">🧠 thinking:</span>
                <div className="ml-1 text-[#cccccc] whitespace-pre-wrap text-xs font-mono italic">
                  {streamingThinking}
                </div>
              </div>
            </div>
          )}

          {/* Onboarding URL Input */}
          {isOnboardingActive && currentStep === 'url-input' && (
            <div className="mt-4">
              <UrlInput 
                onSubmit={handleUrlSubmit}
                isLoading={false}
              />
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-[#4ec9b0]">
              <span className="text-[#4ec9b0]">🤖 assistant:</span>
              <span className="ml-1 text-[#858585]">thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Agent Progress Bar */}
      {agentProgress && agentProgress.length > 0 && (
        <div className="bg-[#0e0e0e] p-2 font-mono text-xs flex-shrink-0">
          {agentProgress.map((progress) => (
            <div key={progress._id} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#007acc] text-xs">
                  🤖 {progress.agentType} Agent
                </span>
                <span className="text-[#858585] text-xs">
                  {progress.percentage}%
                </span>
              </div>
              <div className="w-64 bg-[#333] rounded-full h-1.5 relative overflow-hidden">
                <div 
                  className="bg-[#007acc] h-1.5 rounded-full transition-all duration-300 absolute left-0 top-0"
                  style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                />
              </div>
              {progress.status && (
                <div className="text-[#858585] text-xs mt-1">
                  {progress.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input area - Now outside the scrollable container */}
      <div className="bg-[#0e0e0e] p-2 font-mono text-xs flex-shrink-0">
        <div className="flex items-center">
          <span className="text-[#007acc]">$ user:</span>
          <form onSubmit={handleSubmit} className="flex-1 ml-1">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isAtSessionLimit 
                  ? "Session limit reached - Start new session to continue..." 
                  : isLoading 
                    ? "AI is thinking..." 
                    : "Ask about your EAC project..."
              }
              disabled={isLoading || isAtSessionLimit}
              className={`w-full bg-transparent border-none outline-none placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed caret-[#cccccc] ${
                isAtSessionLimit ? 'text-[#f48771]' : 'text-[#cccccc]'
              }`}
            />
          </form>
        </div>
      </div>
    </div>
  );
}