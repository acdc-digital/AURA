// ONBOARDING AGENT CONVEX FUNCTIONS - Comprehensive backend functions for user onboarding workflow
// /Users/matthewsimon/Projects/AURA/AURA/convex/onboarding.ts

import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { ONBOARDING_SYSTEM_PROMPT } from "./prompts";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Query to get current onboarding state
export const getOnboardingState = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;

    const onboarding = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return onboarding;
  },
});

// Query to get onboarding progress
export const getOnboardingProgress = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    if (!userId) return { currentStep: "welcome", completionPercentage: 0 };

    const onboarding = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!onboarding) {
      return { currentStep: "welcome", completionPercentage: 0 };
    }

    return {
      currentStep: onboarding.currentStep,
      completionPercentage: onboarding.completionPercentage,
      isCompleted: onboarding.isCompleted,
      isSkipped: onboarding.isSkipped,
      hasStartedEngaging: onboarding.hasStartedEngaging,
      responses: onboarding.responses,
    };
  },
});

// Query to get completed onboarding data for current authenticated user
export const getCompletedOnboarding = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Get completed onboarding for this user
    const onboarding = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isCompleted"), true))
      .order("desc")
      .first();

    return onboarding;
  },
});

// Mutation to initialize or update onboarding responses
export const updateOnboardingResponse = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    step: v.union(
      v.literal("welcome"),
      v.literal("brand_name"),
      v.literal("brand_description"),
      v.literal("brand_industry"),
      v.literal("target_audience"),
      v.literal("brand_personality"),
      v.literal("brand_values"),
      v.literal("brand_goals"),
      v.literal("color_preferences"),
      v.literal("style_preferences"),
      v.literal("completion_pending"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    responseData: v.any(), // The specific response data for this step
  },
  handler: async (ctx, { userId, sessionId, step, responseData }) => {
    try {
      if (!userId?.trim()) {
        throw new ConvexError("User ID is required");
      }
      if (!sessionId?.trim()) {
        throw new ConvexError("Session ID is required");
      }

      const now = Date.now();

    // Get existing onboarding record
    const onboarding = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    // Calculate completion percentage based on step
    const stepOrder = [
      "welcome",
      "brand_name",
      "brand_description",
      "brand_industry",
      "target_audience",
      "brand_personality",
      "brand_values",
      "brand_goals",
      "color_preferences",
      "style_preferences",
      "completion_pending",
      "completed"
    ];
    const currentStepIndex = stepOrder.indexOf(step);
    const completionPercentage = step === "completed" ? 100 :
      step === "completion_pending" ? 95 :
      Math.round((currentStepIndex / (stepOrder.length - 1)) * 100);

    if (!onboarding) {
      // Determine if this is the start of engagement (first actual response, not skip/welcome/completion_pending)
      const isStartingEngagement = step !== "welcome" && step !== "skipped" && step !== "completion_pending" && step !== "completed";
      
      // Create new onboarding record
      const onboardingId = await ctx.db.insert("onboardingResponses", {
        userId,
        sessionId,
        currentStep: step,
        responses: {
          ...(step === "brand_name" && { brandName: responseData }),
          ...(step === "brand_description" && { brandDescription: responseData }),
          ...(step === "brand_industry" && { brandIndustry: responseData }),
          ...(step === "target_audience" && { targetAudience: responseData }),
          ...(step === "brand_personality" && { brandPersonality: responseData }),
          ...(step === "brand_values" && { brandValues: responseData }),
          ...(step === "brand_goals" && { brandGoals: responseData }),
          ...(step === "color_preferences" && { colorPreferences: responseData }),
          ...(step === "style_preferences" && { stylePreferences: responseData }),
        },
        completionPercentage,
        isCompleted: step === "completed",
        isSkipped: step === "skipped",
        hasStartedEngaging: isStartingEngagement,
        createdAt: now,
        updatedAt: now,
        ...(step === "completed" && { completedAt: now }),
      });

      return onboardingId;
    } else {
      // Update existing onboarding record - ACCUMULATE instead of overwrite
      const updatedResponses = { ...onboarding.responses };
      
      // Update the specific response field based on step - merge with existing data
      switch (step) {
        case "brand_name":
          // Only update if we have a better/cleaner brand name
          if (!updatedResponses.brandName || (typeof responseData === 'string' && responseData.length < 50)) {
            updatedResponses.brandName = responseData;
          }
          break;
        case "brand_description":
          // Accumulate description, don't overwrite
          if (typeof responseData === 'string') {
            updatedResponses.brandDescription = updatedResponses.brandDescription
              ? `${updatedResponses.brandDescription}; ${responseData}`
              : responseData;
          }
          break;
        case "brand_industry":
          // Keep the more specific industry
          updatedResponses.brandIndustry = updatedResponses.brandIndustry || responseData;
          break;
        case "target_audience":
          // Merge target audience data
          if (!updatedResponses.targetAudience) {
            updatedResponses.targetAudience = {};
          }
          if (typeof responseData === 'object' && responseData !== null) {
            Object.assign(updatedResponses.targetAudience, responseData);
          } else if (typeof responseData === 'string') {
            updatedResponses.targetAudience.primaryAudience = responseData;
          }
          break;
        case "brand_personality":
          // Accumulate personality traits, avoid duplicates
          const existingPersonality = updatedResponses.brandPersonality || [];
          const newTraits = Array.isArray(responseData) ? responseData : [responseData];
          const mergedPersonality = [...existingPersonality];
          
          newTraits.forEach(trait => {
            if (typeof trait === 'string' && !mergedPersonality.includes(trait)) {
              mergedPersonality.push(trait);
            }
          });
          
          updatedResponses.brandPersonality = mergedPersonality;
          break;
        case "brand_values":
          // Accumulate brand values, avoid duplicates
          const existingValues = updatedResponses.brandValues || [];
          const newValues = Array.isArray(responseData) ? responseData : [responseData];
          const mergedValues = [...existingValues];
          
          newValues.forEach(value => {
            if (typeof value === 'string' && !mergedValues.includes(value)) {
              mergedValues.push(value);
            }
          });
          
          updatedResponses.brandValues = mergedValues;
          break;
        case "brand_goals":
          // Merge brand goals
          if (!updatedResponses.brandGoals) {
            updatedResponses.brandGoals = {};
          }
          if (typeof responseData === 'object' && responseData !== null) {
            Object.assign(updatedResponses.brandGoals, responseData);
          }
          break;
        case "color_preferences":
          // Merge color preferences
          if (!updatedResponses.colorPreferences) {
            updatedResponses.colorPreferences = {};
          }
          if (typeof responseData === 'object' && responseData !== null) {
            Object.assign(updatedResponses.colorPreferences, responseData);
          }
          break;
        case "style_preferences":
          // Merge style preferences
          if (!updatedResponses.stylePreferences) {
            updatedResponses.stylePreferences = {};
          }
          if (typeof responseData === 'object' && responseData !== null) {
            Object.assign(updatedResponses.stylePreferences, responseData);
          }
          break;
      }

      // Determine if this is the start of engagement (first actual response, not skip/welcome/completion_pending)
      const isStartingEngagement = step !== "welcome" && step !== "skipped" && step !== "completion_pending" && step !== "completed";
      const shouldSetEngagementFlag = isStartingEngagement && !onboarding.hasStartedEngaging;

      await ctx.db.patch(onboarding._id, {
        currentStep: step,
        responses: updatedResponses,
        completionPercentage,
        isCompleted: step === "completed",
        isSkipped: step === "skipped",
        ...(shouldSetEngagementFlag && { hasStartedEngaging: true }),
        updatedAt: now,
        ...(step === "completed" && { completedAt: now }),
      });

      return onboarding._id;
    }
    } catch (error) {
      console.error('Error updating onboarding response:', error);
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError(`Failed to update onboarding response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Enhanced action to handle intelligent onboarding conversation
export const handleOnboardingMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { message, sessionId }): Promise<{
    success: boolean;
    response?: string;
    currentStep?: string;
    progress?: number;
    error?: string;
  }> => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log('❌ No authenticated user found');
      return {
        success: false,
        error: "Authentication required",
      };
    }
    
    // Get current user from our database (this will also create if doesn't exist)
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) {
      console.log('❌ Failed to get current user');
      return {
        success: false,
        error: "Failed to get user data",
      };
    }
    
    const actualUserId = user._id;

    // Get current onboarding state
    const currentState: {
      currentStep: string;
      completionPercentage: number;
      isCompleted?: boolean;
      isSkipped?: boolean;
      hasStartedEngaging?: boolean;
      responses?: {
        brandName?: string;
        brandDescription?: string;
        brandIndustry?: string;
        targetAudience?: { primaryAudience?: string };
        brandPersonality?: string[];
        brandValues?: string[];
      };
    } = await ctx.runQuery(api.onboarding.getOnboardingProgress, {
      userId: actualUserId,
    }) || { currentStep: "welcome", completionPercentage: 0 };

    // Check if onboarding is already completed
    if (currentState.isCompleted || currentState.isSkipped) {
      console.log('ℹ️ Onboarding already completed, skipping onboarding logic');
      return {
        success: true,
        response: "Onboarding already completed",
        currentStep: currentState.currentStep,
        progress: currentState.completionPercentage,
      };
    }

    // Save user message
    await ctx.runMutation(api.chat.addMessage, {
      role: "user",
      content: message,
      sessionId,
      userId: actualUserId,
    });

    // Mark that the user has started engaging (submitted a message instead of skipping)
    // This will disable the skip button going forward
    if (!currentState.hasStartedEngaging) {
      console.log('🎯 User has started engaging with onboarding, marking engagement flag');
      try {
        // Use a step that represents engagement without changing the actual step
        const engagementStep = currentState.currentStep === "welcome" ? "brand_name" : currentState.currentStep;
        await ctx.runMutation(api.onboarding.updateOnboardingResponse, {
          userId: actualUserId,
          sessionId,
          step: engagementStep as "brand_name" | "brand_description" | "brand_industry" | "target_audience" | "brand_personality" | "brand_values" | "brand_goals" | "color_preferences" | "style_preferences" | "completion_pending" | "completed" | "skipped" | "welcome",
          responseData: null, // No specific data, just marking engagement
        });
      } catch (error) {
        console.error('Failed to mark engagement flag:', error);
      }
    }

    // Analyze user message to extract ALL relevant information (not just current step)
    const extractedInfo = await extractInformationFromMessage(message);

    // Update onboarding response if we extracted meaningful data
    if (extractedInfo.hasData) {
      // Update each extracted piece of information
      for (const extraction of extractedInfo.extractions) {
        try {
          await ctx.runMutation(api.onboarding.updateOnboardingResponse, {
            userId: actualUserId,
            sessionId,
            step: extraction.step,
            responseData: extraction.data,
          });
        } catch (error) {
          console.error(`Error updating step ${extraction.step}:`, error);
          // Continue with other extractions even if one fails
        }
      }

      // Note: Auto-advancement logic removed to prevent schema validation errors
      // The extracted data is already saved above, and the conversation flow
      // will naturally progress based on user responses
    }

    // Check if onboarding should be completed
    // Count messages in this session to determine if we've asked enough questions
    const sessionMessages = await ctx.runQuery(api.chat.getMessages, {
      sessionId,
      limit: 50,
    });
    
    const assistantMessages = sessionMessages.filter(msg => msg.role === "assistant").length;
    const MAX_ONBOARDING_QUESTIONS = 8; // Streamlined brand identity collection - reduced from 8 to 3
    
    // Check for completion signals - expanded list with more common phrases
    const completionPhrases = [
      "good to go", "nothing further", "that's it", "done", "finished",
      "complete", "nope", "all set", "ready", "no more", "enough",
      "stop", "skip", "continue", "next", "proceed", "go ahead",
      "that's enough", "i'm ready", "let's go", "sounds good", "great",
      "perfect", "awesome", "yes", "yep", "ok", "okay", "sure"
    ];

    const hasCompletionSignal = completionPhrases.some(phrase =>
      message.toLowerCase().includes(phrase)
    );
    
    // Early completion only for very clear completion signals, not short responses
    const hasMinimumQuestions = assistantMessages >= 2; // Require at least 2 questions before early completion - reduced from 5 to 2
    const shouldCompleteEarly = hasMinimumQuestions && hasCompletionSignal; // Remove short response logic
    
    console.log(`🔍 Onboarding check: ${assistantMessages} questions asked (max: ${MAX_ONBOARDING_QUESTIONS}), completion signal: ${hasCompletionSignal}, early completion: ${shouldCompleteEarly}, message: "${message}"`);
    
    // Check if we should complete
    const shouldComplete = assistantMessages >= MAX_ONBOARDING_QUESTIONS || hasCompletionSignal || shouldCompleteEarly;

    if (shouldComplete) {
      const completionReason = hasCompletionSignal ? "user_signal" :
                               shouldCompleteEarly ? "early_completion" :
                               "max_questions";
      console.log(`🎯 Completing onboarding: ${assistantMessages} questions asked (max: ${MAX_ONBOARDING_QUESTIONS}), reason: ${completionReason}`);
      
      try {
        // Mark onboarding as completion_pending (not fully completed yet)
        await ctx.runMutation(api.onboarding.updateOnboardingResponse, {
          userId: actualUserId,
          sessionId,
          step: "completion_pending",
          responseData: { completedAt: Date.now(), reason: completionReason },
        });

        // Update user status to completion_pending
        await ctx.runMutation(api.users.updateOnboardingStatus, {
          status: "completion_pending",
        });

        // Generate brand guidelines action
        try {
          await ctx.runAction(api.onboarding.generateBrandGuidelines, {
            userId: actualUserId,
          });
        } catch (error) {
          console.error("❌ Error in Step 3 (brand guidelines):", error);
          // Continue with completion even if guidelines generation fails
        }

        // Send completion message with continue button
        await ctx.runMutation(api.chat.addMessage, {
          role: "assistant",
          content: `Thanks! Your brand identity has been updated. 🎉

I've generated comprehensive brand guidelines based on our conversation, and they're ready for you to explore in your project files.

Ready to start building with AURA?`,
          sessionId,
          userId: actualUserId,
          tokenCount: 50, // Rough token count for completion message
          inputTokens: 0, // No input tokens for completion message
          outputTokens: 50, // Estimate output tokens
          interactiveComponent: {
            type: "onboarding_continue_button",
            data: { label: "Continue" },
            status: "pending"
          }
        });

        return {
          success: true,
          response: "Onboarding completion message sent with continue button",
          currentStep: "completion_pending",
          progress: 100, // Updated to 100% since brand guidelines are now generated
        };
      } catch (error) {
        console.error("❌ Error in completion flow:", error);
        return {
          success: false,
          error: `Completion failed: ${error}`,
        };
      }
    }

    // Get conversation history (exclude system messages for cleaner context)
    const history = await ctx.runQuery(api.chat.getMessages, {
      sessionId,
      limit: 20,
    });

    // Enhanced system prompt with current onboarding state
    const contextualPrompt = buildContextualPrompt(currentState);

    // Build messages for Anthropic (filter out system messages and debug messages)
    const messages: Anthropic.MessageParam[] = [];
    
    for (const msg of history) {
      if (msg.role === "user" || msg.role === "assistant") {
        // Skip debug messages that start with [DEBUG]
        if (msg.content.startsWith("[DEBUG]") || msg.content.startsWith("📋 [DEBUG]")) {
          continue;
        }
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    try {
      // Call Anthropic API with enhanced context
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 2048,
        system: contextualPrompt,
        messages,
      });

      // Extract response text
      const responseText = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

      // Save assistant response
      await ctx.runMutation(api.chat.addMessage, {
        role: "assistant",
        content: responseText,
        sessionId,
        userId: actualUserId,
        tokenCount: response.usage.input_tokens + response.usage.output_tokens,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      });

      return {
        success: true,
        response: responseText,
        currentStep: currentState.currentStep,
        progress: currentState.completionPercentage,
      };
    } catch (error) {
      console.error("Onboarding agent error:", error);
      console.error("Error details:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        systemPromptLength: contextualPrompt.length,
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]
      });
      
      // Save error message
      await ctx.runMutation(api.chat.addMessage, {
        role: "assistant",
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment, or feel free to skip the onboarding and explore AURA on your own.",
        sessionId,
        userId: actualUserId,
        tokenCount: 30, // Rough token count for error message
        inputTokens: 0,
        outputTokens: 30,
      });

      return {
        success: false,
        error: "Failed to process onboarding message",
      };
    }
  },
});

// Enhanced function to extract multiple pieces of information from user message
async function extractInformationFromMessage(message: string) {
  const extractions: Array<{
    step: "brand_name" | "brand_description" | "brand_industry" | "target_audience" | "brand_personality" | "brand_values" | "brand_goals" | "color_preferences" | "style_preferences";
    data: string | string[] | {
      primaryAudience?: string;
      demographics?: string;
      psychographics?: string;
      shortTerm?: string;
      longTerm?: string;
      keyObjectives?: string[];
      preferredColors?: string[];
      colorMood?: string;
      avoidColors?: string[];
      visualStyle?: string;
      typographyStyle?: string;
      imageStyle?: string;
    };
  }> = [];

  const lowerMessage = message.toLowerCase();

  // Skip extraction for generic/conversational responses that don't contain brand info
  const conversationalPhrases = [
    "so what now", "what now", "nothing further", "good to go", "nope",
    "that's it", "done", "finished", "complete", "ok", "okay", "yes", "no",
    "thanks", "thank you", "great", "perfect", "excellent", "sounds good"
  ];

  const isConversationalOnly = conversationalPhrases.some(phrase =>
    lowerMessage.includes(phrase) && message.length < 50
  );
  
  if (isConversationalOnly) {
    return {
      hasData: false,
      extractedData: [],
      extractions: [],
    };
  }

  // 1. BRAND NAME EXTRACTION - Look for simple brand names or "Product name is X" patterns
  const brandNameMatch = extractBrandName(message);
  if (brandNameMatch && !isConversationalOnly && message.length > 5) {
    extractions.push({
      step: "brand_name",
      data: brandNameMatch,
    });
  }

  // 2. BRAND DESCRIPTION EXTRACTION - Look for what the product/service does
  const descriptionMatch = extractBrandDescription(message);
  if (descriptionMatch) {
    extractions.push({
      step: "brand_description",
      data: descriptionMatch,
    });
  }

  // 3. INDUSTRY EXTRACTION - Determine market sector
  const industryMatch = extractIndustry(message);
  if (industryMatch) {
    extractions.push({
      step: "brand_industry",
      data: industryMatch,
    });
  }

  // 4. TARGET AUDIENCE EXTRACTION - Who uses this
  const audienceMatch = extractTargetAudience(message);
  if (audienceMatch) {
    extractions.push({
      step: "target_audience",
      data: audienceMatch,
    });
  }

  // 5. PERSONALITY TRAITS EXTRACTION - How the brand should feel
  const personalityTraits = extractPersonalityTraits(message);
  if (personalityTraits.length > 0) {
    extractions.push({
      step: "brand_personality",
      data: personalityTraits,
    });
  }

  // 6. BRAND VALUES EXTRACTION - Core principles and beliefs
  const valuesMatch = extractBrandValues(message);
  if (valuesMatch.length > 0) {
    extractions.push({
      step: "brand_values",
      data: valuesMatch,
    });
  }

  // 7. BRAND GOALS EXTRACTION - What they want to achieve
  const goalsMatch = extractBrandGoals(message);
  if (goalsMatch) {
    extractions.push({
      step: "brand_goals",
      data: goalsMatch,
    });
  }

  // 8. COLOR PREFERENCES EXTRACTION
  const colorMatch = extractColorPreferences(message);
  if (colorMatch) {
    extractions.push({
      step: "color_preferences",
      data: colorMatch,
    });
  }

  // 9. STYLE PREFERENCES EXTRACTION
  const styleMatch = extractStylePreferences(message);
  if (styleMatch) {
    extractions.push({
      step: "style_preferences",
      data: styleMatch,
    });
  }

  return {
    hasData: extractions.length > 0,
    extractions,
  };
}

// Enhanced helper function to extract brand description - what the product/service does
function extractBrandDescription(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Look for explicit product/service descriptions
  const descriptionPatterns = [
    /(?:aura is|product is|service is|we are|we're|it's|this is) (?:a |an |the )?([^.!?]+)/i,
    /(?:social media|platform|system|software|tool|app) (?:for |that |which )([^.!?]+)/i,
    /([^.!?]*(?:broadcasting|management|platform|system|service|tool)[^.!?]*)/i,
  ];

  for (const pattern of descriptionPatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].trim().length > 5) {
      return match[1].trim();
    }
  }

  // Check for industry-specific descriptions
  if (lowerMessage.includes('social media') && lowerMessage.includes('broadcast')) {
    return 'social media broadcasting platform';
  }
  if (lowerMessage.includes('ai') && (lowerMessage.includes('platform') || lowerMessage.includes('tool'))) {
    return 'AI-powered platform';
  }
  if (lowerMessage.includes('developer') && (lowerMessage.includes('tool') || lowerMessage.includes('platform'))) {
    return 'developer tools platform';
  }

  return null;
}

// Helper function to extract brand goals - what they want to achieve
function extractBrandGoals(message: string): { shortTerm?: string; longTerm?: string; keyObjectives?: string[] } | null {
  const lowerMessage = message.toLowerCase();
  const goals: { shortTerm?: string; longTerm?: string; keyObjectives?: string[] } = {};
  
  // Look for goal-related language
  if (lowerMessage.includes('democrati') && lowerMessage.includes('ai')) {
    goals.keyObjectives = ['democratize AI access', 'make AI affordable and accessible'];
  }
  
  if (lowerMessage.includes('pay per use') || lowerMessage.includes('affordable')) {
    if (!goals.keyObjectives) goals.keyObjectives = [];
    goals.keyObjectives.push('provide cost-effective solutions');
  }
  
  if (lowerMessage.includes('grow') || lowerMessage.includes('expand') || lowerMessage.includes('scale')) {
    goals.longTerm = 'scale and expand market reach';
  }
  
  if (lowerMessage.includes('empower') || lowerMessage.includes('enable')) {
    if (!goals.keyObjectives) goals.keyObjectives = [];
    goals.keyObjectives.push('empower users with advanced tools');
  }

  // Return goals if we found any
  return Object.keys(goals).length > 0 ? goals : null;
}

// Helper function to extract color preferences
function extractColorPreferences(message: string): { preferredColors?: string[]; colorMood?: string; avoidColors?: string[] } | null {
  const lowerMessage = message.toLowerCase();
  const colors: { preferredColors?: string[]; colorMood?: string; avoidColors?: string[] } = {};
  
  // Common colors
  const colorWords = ['blue', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'black', 'white', 'gray', 'grey'];
  const foundColors = colorWords.filter(color => lowerMessage.includes(color));
  
  if (foundColors.length > 0) {
    colors.preferredColors = foundColors;
  }
  
  // Color moods
  if (lowerMessage.includes('professional')) {
    colors.colorMood = 'professional and trustworthy';
  }
  if (lowerMessage.includes('modern') || lowerMessage.includes('clean')) {
    colors.colorMood = 'modern and clean';
  }
  if (lowerMessage.includes('warm')) {
    colors.colorMood = 'warm';
  }
  if (lowerMessage.includes('cool')) {
    colors.colorMood = 'cool';
  }
  
  return Object.keys(colors).length > 0 ? colors : null;
}

// Helper function to extract style preferences
function extractStylePreferences(message: string): { visualStyle?: string; typographyStyle?: string; imageStyle?: string } | null {
  const lowerMessage = message.toLowerCase();
  const styles: { visualStyle?: string; typographyStyle?: string; imageStyle?: string } = {};
  
  // Visual styles
  if (lowerMessage.includes('professional')) {
    styles.visualStyle = 'professional';
  }
  if (lowerMessage.includes('modern')) {
    styles.visualStyle = 'modern';
  }
  if (lowerMessage.includes('clean')) {
    styles.visualStyle = 'clean';
  }
  if (lowerMessage.includes('minimal')) {
    styles.visualStyle = 'minimal';
  }
  if (lowerMessage.includes('bold')) {
    styles.visualStyle = 'bold';
  }
  
  // Typography hints
  if (lowerMessage.includes('clean') || lowerMessage.includes('modern') || lowerMessage.includes('professional')) {
    styles.typographyStyle = 'sans-serif';
  }
  if (lowerMessage.includes('traditional') || lowerMessage.includes('classic')) {
    styles.typographyStyle = 'serif';
  }
  
  return Object.keys(styles).length > 0 ? styles : null;
}

// Helper function to extract industry
function extractIndustry(message: string): string | null {
  const industries = [
    'software', 'technology', 'tech', 'saas', 'content', 'media', 'broadcasting',
    'developer tools', 'development', 'management', 'automation', 'productivity'
  ];

  const lowerMessage = message.toLowerCase();
  for (const industry of industries) {
    if (lowerMessage.includes(industry)) {
      return industry;
    }
  }

  // Extract from context clues
  if (lowerMessage.includes('broadcast') && lowerMessage.includes('management')) {
    return 'content broadcasting';
  }
  if (lowerMessage.includes('developer') && (lowerMessage.includes('tool') || lowerMessage.includes('system'))) {
    return 'developer tools';
  }

  return null;
}

// Helper function to extract target audience
function extractTargetAudience(message: string): { primaryAudience?: string; demographics?: string; psychographics?: string } | null {
  const lowerMessage = message.toLowerCase();
  const audience: { primaryAudience?: string; demographics?: string; psychographics?: string } = {};
  
  // Look for explicit audience mentions
  const audiencePatterns = [
    /(?:target audience|users|customers|clients) (?:is |are |includes? )?([^.!?]+)/i,
    /(?:for |targeting |aimed at |serving |helping )([^.!?]+)/i,
    /(?:developers?|businesses?|creators?|users?|customers?|clients?)/i,
  ];

  for (const pattern of audiencePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      audience.primaryAudience = match[1].trim();
      break;
    }
  }

  // Direct audience identification
  if (lowerMessage.includes('developer') || lowerMessage.includes('coder') || lowerMessage.includes('programmer')) {
    audience.primaryAudience = 'developers and technical professionals';
    audience.demographics = 'software developers, engineers, technical teams';
    audience.psychographics = 'values efficiency, innovation, and powerful tools';
  }
  
  if (lowerMessage.includes('business') || lowerMessage.includes('company') || lowerMessage.includes('enterprise')) {
    audience.primaryAudience = 'businesses and organizations';
    audience.demographics = 'small to medium businesses, enterprises';
    audience.psychographics = 'seeks professional solutions, values reliability and ROI';
  }
  
  if (lowerMessage.includes('creator') || lowerMessage.includes('content') || lowerMessage.includes('social media')) {
    audience.primaryAudience = 'content creators and marketers';
    audience.demographics = 'social media managers, content creators, marketing professionals';
    audience.psychographics = 'creative, social-media focused, values engagement and reach';
  }
  
  // Infer audience from product description
  if (lowerMessage.includes('broadcasting') && lowerMessage.includes('social media')) {
    if (!audience.primaryAudience) {
      audience.primaryAudience = 'social media professionals and content creators';
      audience.demographics = 'marketers, content creators, social media managers';
      audience.psychographics = 'seeks efficiency in content distribution and social media management';
    }
  }

  return Object.keys(audience).length > 0 ? audience : null;
}

// Enhanced helper function to extract brand values
function extractBrandValues(message: string): string[] {
  const values: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Value mapping - convert user language to proper brand values
  const valueMap: Record<string, string> = {
    'easy': 'ease of use',
    'simple': 'simplicity',
    'affordable': 'affordability',
    'low cost': 'cost-effectiveness',
    'cheap': 'affordability',
    'inexpensive': 'affordability',
    'pay per use': 'flexible pricing',
    'accessible': 'accessibility',
    'reliable': 'reliability',
    'fast': 'performance',
    'quick': 'efficiency',
    'secure': 'security',
    'safe': 'security',
    'scalable': 'scalability',
    'flexible': 'flexibility',
    'user-friendly': 'user experience',
    'transparent': 'transparency',
    'honest': 'transparency',
    'open': 'transparency',
    'professional': 'professionalism',
    'quality': 'excellence',
    'excellent': 'excellence',
    'innovative': 'innovation',
    'cutting-edge': 'innovation',
    'modern': 'innovation',
    'empowering': 'empowerment',
    'democratizing': 'democratization',
    'inclusive': 'inclusivity',
    'fair': 'fairness',
    'ethical': 'ethics',
  };

  // Extract explicit values mentioned
  Object.entries(valueMap).forEach(([keyword, value]) => {
    if (lowerMessage.includes(keyword) && !values.includes(value)) {
      values.push(value);
    }
  });

  // Extract from specific context phrases
  if (lowerMessage.includes('democratizing ai') || lowerMessage.includes('democratize ai')) {
    if (!values.includes('democratization')) values.push('democratization');
    if (!values.includes('accessibility')) values.push('accessibility');
  }
  
  if (lowerMessage.includes('pay per use') || lowerMessage.includes('only what they need')) {
    if (!values.includes('fairness')) values.push('fairness');
    if (!values.includes('flexibility')) values.push('flexibility');
  }
  
  if (lowerMessage.includes('extremely affordable') || lowerMessage.includes('affordable prices')) {
    if (!values.includes('affordability')) values.push('affordability');
    if (!values.includes('accessibility')) values.push('accessibility');
  }

  // Extract values from quality descriptors
  if (message.match(/\b(most central|central|core|key|main|primary) (?:quality|value|principle)/i)) {
    const centralMatch = message.match(/(?:most central|central|core|key|main|primary) (?:quality|value|principle) is (\w+)/i);
    if (centralMatch) {
      const centralValue = centralMatch[1].toLowerCase();
      if (valueMap[centralValue]) {
        values.unshift(valueMap[centralValue]); // Add to beginning as it's central
      }
    }
  }

  return [...new Set(values)]; // Remove duplicates
}

// Enhanced helper function to extract brand name
function extractBrandName(message: string): string | null {
  const trimmedMessage = message.trim();
  
  // Skip extraction if message looks like it's answering about industry/category
  const industryIndicators = [
    'its', 'it\'s', 'that\'s', 'we are', 'we\'re', 'i would say', 'i think',
    'martech', 'fintech', 'edtech', 'adtech', 'healthtech', 'proptech',
    'marketing technology', 'financial technology', 'educational technology'
  ];
  
  const lowerMessage = trimmedMessage.toLowerCase();
  const hasIndustryContext = industryIndicators.some(indicator =>
    lowerMessage.includes(indicator)
  );
  
  // If this looks like an industry/classification response, don't extract brand name
  if (hasIndustryContext) {
    return null;
  }
  
  // Look for explicit brand name patterns first
  const brandNamePatterns = [
    /(?:product name is|brand name is|called|named|it's called)\s+([A-Za-z][A-Za-z0-9\s]{1,30})/i,
    /(?:brand|product|company|service)\s+(?:name\s+)?is\s+([A-Za-z][A-Za-z0-9\s]{1,20})/i,
    /^([A-Za-z][A-Za-z0-9]{1,15})\.?\s*$/,  // Simple single word or short name
  ];
  
  for (const pattern of brandNamePatterns) {
    const match = trimmedMessage.match(pattern);
    if (match && match[1]) {
      const extractedName = match[1].trim();
      // Validate it looks like a brand name (not a description or industry term)
      if (extractedName.length <= 30 &&
          !extractedName.toLowerCase().includes('social media') &&
          !extractedName.toLowerCase().includes('broadcasting') &&
          !extractedName.toLowerCase().includes('platform') &&
          !extractedName.toLowerCase().includes('tech') &&
          !extractedName.toLowerCase().includes('marketing')) {
        return extractedName;
      }
    }
  }
  
  // If the entire message is short and looks like a brand name
  if (trimmedMessage.length <= 20 &&
      trimmedMessage.length >= 2 &&
      /^[A-Za-z][A-Za-z0-9\s]*$/.test(trimmedMessage) &&
      !trimmedMessage.toLowerCase().includes('is') &&
      !trimmedMessage.toLowerCase().includes('the') &&
      !trimmedMessage.toLowerCase().includes('social') &&
      !trimmedMessage.toLowerCase().includes('platform') &&
      !trimmedMessage.toLowerCase().includes('broadcasting') &&
      !hasIndustryContext) {
    return trimmedMessage;
  }

  // Extract from longer descriptions - look for capitalized words that might be brand names
  // But be more conservative and skip if context suggests it's not a brand name
  const words = trimmedMessage.split(/\s+/);
  for (const word of words) {
    if (word.length >= 3 &&
        word.length <= 15 &&
        /^[A-Z][a-z]+$/.test(word) &&
        !['Product', 'Brand', 'Company', 'Service', 'Platform', 'System', 'Social', 'Media', 'MarTech', 'FinTech', 'EdTech', 'AdTech'].includes(word) &&
        !hasIndustryContext) {
      return word;
    }
  }

  return null;
}

// Enhanced helper function to extract personality traits
function extractPersonalityTraits(message: string): string[] {
  const foundTraits: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Core personality traits mapping
  const traitMap: Record<string, string> = {
    'professional': 'professional',
    'friendly': 'friendly',
    'innovative': 'innovative',
    'creative': 'creative',
    'trustworthy': 'trustworthy',
    'reliable': 'reliable',
    'modern': 'modern',
    'cutting-edge': 'cutting-edge',
    'approachable': 'approachable',
    'accessible': 'accessible',
    'sophisticated': 'sophisticated',
    'elegant': 'elegant',
    'bold': 'bold',
    'confident': 'confident',
    'inspiring': 'inspiring',
    'empowering': 'empowering',
    'clever': 'clever',
    'smart': 'intelligent',
    'intelligent': 'intelligent',
    'thoughtful': 'thoughtful',
    'caring': 'caring',
    'helpful': 'helpful',
    'supportive': 'supportive',
    'efficient': 'efficient',
    'effective': 'effective',
    'powerful': 'powerful',
    'simple': 'straightforward',
    'clean': 'clean',
    'minimalist': 'minimalist',
    'authoritative': 'authoritative',
    'expert': 'expert',
    'knowledgeable': 'knowledgeable',
    'transparent': 'transparent',
    'honest': 'honest',
    'authentic': 'authentic',
  };

  // Extract explicitly mentioned traits
  Object.entries(traitMap).forEach(([keyword, trait]) => {
    if (lowerMessage.includes(keyword) && !foundTraits.includes(trait)) {
      foundTraits.push(trait);
    }
  });

  // Extract traits from context and descriptions
  if (lowerMessage.includes('democratizing ai') || lowerMessage.includes('democratize')) {
    if (!foundTraits.includes('empowering')) foundTraits.push('empowering');
    if (!foundTraits.includes('inclusive')) foundTraits.push('inclusive');
  }

  if (lowerMessage.includes('pay per use') || lowerMessage.includes('affordable')) {
    if (!foundTraits.includes('fair')) foundTraits.push('fair');
    if (!foundTraits.includes('accessible')) foundTraits.push('accessible');
  }

  if (lowerMessage.includes('social media') && lowerMessage.includes('broadcasting')) {
    if (!foundTraits.includes('connected')) foundTraits.push('connected');
    if (!foundTraits.includes('communicative')) foundTraits.push('communicative');
  }

  // Look for trait lists in responses like "innovative, clever, professional, and inspiring"
  const traitListMatch = message.match(/(?:is |are |describe.*as |personality.*|traits.*|would be )([^.!?]*(?:,|and)[^.!?]*)/i);
  if (traitListMatch) {
    const traitList = traitListMatch[1];
    // Split on commas, 'and', or other separators
    const traits = traitList.split(/[,&]|\band\b/).map(t => t.trim().toLowerCase());
    
    traits.forEach(trait => {
      const cleanTrait = trait.replace(/^(and|or|also|more|very)\s+/, '');
      if (traitMap[cleanTrait] && !foundTraits.includes(traitMap[cleanTrait])) {
        foundTraits.push(traitMap[cleanTrait]);
      }
    });
  }

  // Handle specific patterns like "the most central quality is professional"
  const centralTraitMatch = message.match(/(?:most central|central|main|primary) (?:quality|trait|characteristic) is (\w+)/i);
  if (centralTraitMatch) {
    const centralTrait = centralTraitMatch[1].toLowerCase();
    if (traitMap[centralTrait]) {
      foundTraits.unshift(traitMap[centralTrait]); // Add to beginning as it's central
    }
  }

  return [...new Set(foundTraits)]; // Remove duplicates while preserving order
}

// Helper function to build contextual prompt based on onboarding state
function buildContextualPrompt(currentState: {
  currentStep: string;
  completionPercentage: number;
  responses?: {
    brandName?: string;
    brandDescription?: string;
    brandIndustry?: string;
    targetAudience?: { primaryAudience?: string };
    brandPersonality?: string[];
    brandValues?: string[];
  };
}): string {
  const basePrompt = ONBOARDING_SYSTEM_PROMPT;

  let contextualAddition = `\n\nCURRENT ONBOARDING STATE:
- Current Step: ${currentState.currentStep}
- Progress: ${currentState.completionPercentage}%
`;

  if (currentState.responses) {
    contextualAddition += `\nGATHERED INFORMATION:`;

    if (currentState.responses.brandName) {
      contextualAddition += `\n- Brand Name: ${currentState.responses.brandName}`;
    }
    if (currentState.responses.brandDescription) {
      contextualAddition += `\n- Brand Description: ${currentState.responses.brandDescription}`;
    }
    if (currentState.responses.brandIndustry) {
      contextualAddition += `\n- Industry: ${currentState.responses.brandIndustry}`;
    }
    if (currentState.responses.targetAudience?.primaryAudience) {
      contextualAddition += `\n- Target Audience: ${currentState.responses.targetAudience.primaryAudience}`;
    }
    if (currentState.responses.brandPersonality?.length) {
      contextualAddition += `\n- Brand Personality: ${currentState.responses.brandPersonality.join(', ')}`;
    }
    if (currentState.responses.brandValues?.length) {
      contextualAddition += `\n- Brand Values: ${currentState.responses.brandValues.join(', ')}`;
    }
  }

  contextualAddition += `\n\nBased on the current step and information gathered, guide the user naturally through the next part of the onboarding process. Be conversational and ask follow-up questions to gather complete information.`;

  return basePrompt + contextualAddition;
}

// Action to generate brand guidelines based on collected responses
export const generateBrandGuidelines = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }): Promise<{
    success: boolean;
    guidelinesId?: string;
    projectId?: string;
    error?: string;
  }> => {
    // Get completed onboarding responses
    const onboarding: {
      _id: string;
      isCompleted: boolean;
      responses: {
        brandName?: string;
        brandDescription?: string;
        brandIndustry?: string;
        targetAudience?: { primaryAudience?: string };
        brandPersonality?: string[];
        brandValues?: string[];
        brandGoals?: { keyObjectives?: string[]; longTerm?: string };
        colorPreferences?: { preferredColors?: string[]; colorMood?: string };
        stylePreferences?: { visualStyle?: string; typographyStyle?: string; imageStyle?: string };
      };
      sessionId: string;
    } | null = await ctx.runQuery(api.onboarding.getOnboardingState, {
      userId,
    });

    if (!onboarding || !onboarding.isCompleted) {
      return {
        success: false,
        error: "Onboarding not completed",
      };
    }

    const responses = onboarding.responses;

    try {
      // First ensure guidelines exist for the user
      const guidelinesId = await ctx.runMutation(api.identityGuidelines.ensureGuidelines, {});

      // Update the guidelines with collected brand information
      await ctx.runMutation(api.identityGuidelines.update, {
        id: guidelinesId,
        businessName: responses.brandName || "Your Brand",
        businessDescription: responses.brandDescription || "",
        missionStatement: responses.brandGoals?.keyObjectives?.join(", ") || "",
        visionStatement: responses.brandGoals?.longTerm || "",
        coreValues: responses.brandValues || [],
        targetAudience: {
          primaryDemographic: responses.targetAudience?.primaryAudience || "",
        },
        brandPersonality: {
          traits: responses.brandPersonality || [],
          toneOfVoice: responses.brandPersonality?.length
            ? `${responses.brandPersonality.slice(0, 3).join(', ')} tone`
            : undefined,
        },
        colorPalette: responses.colorPreferences?.preferredColors?.length ? {
          primaryColors: responses.colorPreferences.preferredColors,
        } : undefined,
        typography: responses.stylePreferences?.typographyStyle ? {
          primaryFont: responses.stylePreferences.typographyStyle === 'sans-serif'
            ? 'Inter, system-ui, sans-serif'
            : responses.stylePreferences.typographyStyle === 'serif'
            ? 'Georgia, Times, serif'
            : undefined,
        } : undefined,
        visualStyle: responses.stylePreferences ? {
          photographyStyle: responses.stylePreferences.imageStyle === 'photography'
            ? `${responses.stylePreferences.visualStyle || 'professional'} photography style`
            : undefined,
          illustrationStyle: responses.stylePreferences.imageStyle === 'illustration'
            ? `${responses.stylePreferences.visualStyle || 'modern'} illustration style`
            : undefined,
        } : undefined,
        industryContext: {
          industry: responses.brandIndustry || "",
        },
        status: "draft" as const,
      });

      // Create initial project
      const projectId = await ctx.runMutation(api.projects.create, {
        name: responses.brandName || "Your Brand Project",
        description: `Brand guidelines and content for ${responses.brandName || "your brand"}`,
        status: "active",
      });

      // Update onboarding record with generated assets
      await ctx.runMutation(api.onboarding.updateOnboardingResponse, {
        userId,
        sessionId: onboarding.sessionId,
        step: "completed",
        responseData: {
          generatedGuidelinesId: guidelinesId,
          generatedProjectId: projectId,
        },
      });

      return {
        success: true,
        guidelinesId: guidelinesId.toString(),
        projectId: projectId.toString(),
      };
    } catch (error) {
      console.error("Error generating brand guidelines:", error);
      return {
        success: false,
        error: "Failed to generate brand guidelines",
      };
    }
  },
});

// Action to apply onboarding data to identity guidelines
export const applyOnboardingToGuidelines = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    guidelinesId?: string;
    error?: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get user record
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get completed onboarding
    const onboarding = await ctx.runQuery(api.onboarding.getCompletedOnboarding);
    if (!onboarding) {
      return {
        success: false,
        error: "No completed onboarding found",
      };
    }

    const responses = onboarding.responses;

    try {
      // First ensure guidelines exist for the user
      const guidelinesId = await ctx.runMutation(api.identityGuidelines.ensureGuidelines, {});

      // Apply the same transformation as the generateBrandGuidelines function
      await ctx.runMutation(api.identityGuidelines.update, {
        id: guidelinesId,
        businessName: responses.brandName || "Your Brand",
        businessDescription: responses.brandDescription || "",
        missionStatement: responses.brandGoals?.keyObjectives?.join(", ") || "",
        visionStatement: responses.brandGoals?.longTerm || "",
        coreValues: responses.brandValues || [],
        targetAudience: {
          primaryDemographic: responses.targetAudience?.primaryAudience || "",
        },
        brandPersonality: {
          traits: responses.brandPersonality || [],
          toneOfVoice: responses.brandPersonality?.length
            ? `${responses.brandPersonality.slice(0, 3).join(', ')} tone`
            : undefined,
        },
        colorPalette: responses.colorPreferences?.preferredColors?.length ? {
          primaryColors: responses.colorPreferences.preferredColors,
        } : undefined,
        typography: responses.stylePreferences?.typographyStyle ? {
          primaryFont: responses.stylePreferences.typographyStyle === 'sans-serif'
            ? 'Inter, system-ui, sans-serif'
            : responses.stylePreferences.typographyStyle === 'serif'
            ? 'Georgia, Times, serif'
            : undefined,
        } : undefined,
        visualStyle: responses.stylePreferences ? {
          photographyStyle: responses.stylePreferences.imageStyle === 'photography'
            ? `${responses.stylePreferences.visualStyle || 'professional'} photography style`
            : undefined,
          illustrationStyle: responses.stylePreferences.imageStyle === 'illustration'
            ? `${responses.stylePreferences.visualStyle || 'modern'} illustration style`
            : undefined,
        } : undefined,
        industryContext: {
          industry: responses.brandIndustry || "",
        },
        status: "draft" as const,
      });

      return {
        success: true,
        guidelinesId: guidelinesId.toString(),
      };
    } catch (error) {
      console.error("Error applying onboarding to guidelines:", error);
      return {
        success: false,
        error: "Failed to apply onboarding data",
      };
    }
  },
});

// Action to send initial onboarding welcome message
export const sendWelcomeMessage = action({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, userId }) => {
    // Check if welcome message already exists in this session
    const existingMessages = await ctx.runQuery(api.chat.getMessages, {
      sessionId,
      limit: 10,
    });
    
    const hasWelcomeMessage = existingMessages.some(msg =>
      msg.role === "assistant" && (
        msg.content.includes("Time to grow your Aura") ||
        msg.content.includes("Let's get started by creating your brand identity") ||
        msg.content.includes("Welcome to AURA! 🌟") || // Legacy messages
        msg.content.includes("I'm here to help you get started with your brand")
      )
    );
    
    if (hasWelcomeMessage) {
      console.log("⚠️  Welcome message already exists in session, skipping duplicate");
      return "Welcome message already exists";
    }

    const welcomeMessage = `Time to grow your Aura.

Let's get started by creating your brand identity. You can skip the setup and add the details later, or begin by simply letting me know the name of your brand or product.`;

    // Save the welcome message with skip button
    const messageId = await ctx.runMutation(api.chat.addMessage, {
      role: "assistant",
      content: welcomeMessage,
      sessionId,
      userId,
      tokenCount: welcomeMessage.length, // Rough token count
      inputTokens: 0, // No input tokens for welcome message
      outputTokens: Math.ceil(welcomeMessage.length / 4), // Estimate output tokens
      interactiveComponent: {
        type: "onboarding_skip_button",
        status: "pending",
        data: { sessionId, userId }
      }
    });

    console.log("✅ Onboarding welcome message created:", {
      messageId,
      sessionId,
      hasInteractiveComponent: true,
      componentType: "onboarding_skip_button"
    });

    return welcomeMessage;
  },
});

// Mutation to mark onboarding as complete and create initial project
export const completeOnboarding = mutation({
  args: {
    brandName: v.string(),
    brandDescription: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ projectId: string }> => {
    // Update user onboarding status
    if (args.userId) {
      await ctx.runMutation(api.users.updateOnboardingStatus, {
        status: "completed",
      });
    }

    // Create initial project
    const projectId = await ctx.runMutation(api.projects.create, {
      name: args.brandName,
      description: args.brandDescription || `Brand guidelines and content for ${args.brandName}`,
      status: "active",
    });

    return { projectId: projectId.toString() };
  },
});

// Enhanced action to handle complete onboarding workflow with agent transition
export const handleContinueOnboarding = action({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, userId }) => {
    if (!userId) {
      return {
        success: false,
        error: "User ID required",
      };
    }

    try {
      console.log("🎯 handleContinueOnboarding: Starting continue process for user:", userId);

      // Step 0: Mark onboarding as fully completed (100%) and set isCompleted: true
      console.log("📝 Step 0: Finalizing onboarding completion status...");
      console.log("   - Current state likely at 95% (completion_pending)");
      console.log("   - Updating to 100% completion with step: 'completed'");
      
      await ctx.runMutation(api.onboarding.updateOnboardingResponse, {
        userId,
        sessionId,
        step: "completed",
        responseData: {
          finalizedAt: Date.now(),
          completedViaButton: true,
        },
      });
      
      console.log("✅ Onboarding marked as fully completed:");
      console.log("   - completionPercentage: 100%");
      console.log("   - isCompleted: true");
      console.log("   - currentStep: 'completed'");
      console.log("   - completedAt: set to current timestamp");

      // Step 0.5: Verify completion worked by checking the updated state
      console.log("🔍 Step 0.5: Verifying completion update...");
      const completedOnboarding = await ctx.runQuery(api.onboarding.getCompletedOnboarding);
      if (!completedOnboarding) {
        console.error("❌ CRITICAL: Onboarding completion verification failed - still not marked as completed!");
        console.error("   This means the updateOnboardingResponse didn't work as expected");
        return {
          success: false,
          error: "Failed to finalize onboarding completion state",
        };
      }
      console.log("✅ Completion verified - onboarding is now fully completed and accessible");
      console.log(`   - Completion percentage: ${completedOnboarding.completionPercentage}%`);
      console.log(`   - Is completed: ${completedOnboarding.isCompleted}`);

      // Step 1: Apply onboarding responses to identity guidelines
      console.log("📋 Step 1: Applying onboarding data to identity guidelines...");
      const mappingResult = await ctx.runAction(api.onboarding.applyOnboardingToGuidelines, {});
      
      if (!mappingResult.success) {
        console.error("❌ Failed to apply onboarding to guidelines:", mappingResult.error);
        // Continue anyway - this isn't a critical failure
      } else {
        console.log("✅ Successfully applied onboarding data to identity guidelines:", mappingResult.guidelinesId);
      }

      // Step 2: Update user status to completed
      console.log("👤 Step 2: Updating user onboarding status to completed...");
      await ctx.runMutation(api.users.updateOnboardingStatus, {
        status: "completed",
      });

      // Step 3: Send orchestrator welcome message to the SAME session (no new session needed)
      console.log("🤖 Step 3: Sending orchestrator welcome message...");
      await ctx.runAction(api.orchestrator.sendOnboardingCompleteWelcomeMessage, {
        sessionId,
        userId,
      });

      console.log("🎉 handleContinueOnboarding completed successfully");

      return {
        success: true,
        sessionId, // Return the same session ID
        message: "Onboarding completed successfully. Identity guidelines populated and orchestrator session created.",
      };
    } catch (error) {
      console.error("❌ Error handling continue onboarding:", error);
      return {
        success: false,
        error: "Failed to complete onboarding transition",
      };
    }
  },
});

// Enhanced action to handle complete skip workflow
export const handleSkipOnboarding = action({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, userId }) => {
    console.log("🎯 handleSkipOnboarding called with:", { sessionId, userId });
    if (!userId) {
      console.error("❌ User ID required for handleSkipOnboarding");
      return {
        success: false,
        error: "User ID required",
      };
    }

    try {
      console.log("📝 Storing skip decision in onboarding responses...");
      // Store skip decision in onboarding responses
      await ctx.runMutation(api.onboarding.updateOnboardingResponse, {
        userId,
        sessionId,
        step: "skipped",
        responseData: { reason: "user_skip" },
      });

      console.log("👤 Updating user onboarding status to skipped...");
      // Update user onboarding status to skipped
      await ctx.runMutation(api.users.updateOnboardingStatus, {
        status: "skipped",
      });

      console.log("🤖 Sending orchestrator welcome message...");
      // Send orchestrator welcome message
      await ctx.runAction(api.orchestrator.sendWelcomeMessage, {
        sessionId,
        userId,
      });

      console.log("✅ Onboarding skip completed successfully");
      return {
        success: true,
        message: "Onboarding skipped successfully. Orchestrator welcome message sent.",
      };
    } catch (error) {
      console.error("❌ Error handling skip onboarding:", error);
      return {
        success: false,
        error: "Failed to skip onboarding",
      };
    }
  },
});

// Query to get onboarding analytics
export const getOnboardingAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const allOnboardings = await ctx.db.query("onboardingResponses").collect();
    
    const analytics = {
      total: allOnboardings.length,
      completed: allOnboardings.filter(o => o.isCompleted).length,
      skipped: allOnboardings.filter(o => o.isSkipped).length,
      inProgress: allOnboardings.filter(o => !o.isCompleted && !o.isSkipped).length,
      averageCompletion: allOnboardings.length > 0 ?
        allOnboardings.reduce((sum, o) => sum + o.completionPercentage, 0) / allOnboardings.length : 0,
      commonDropOffPoints: {} as Record<string, number>,
      completedBrandNames: allOnboardings
        .filter(o => o.isCompleted && o.responses.brandName)
        .map(o => o.responses.brandName)
        .slice(0, 10), // Last 10 completed brand names
    };

    // Calculate drop-off points
    for (const onboarding of allOnboardings.filter(o => !o.isCompleted && !o.isSkipped)) {
      const step = onboarding.currentStep;
      analytics.commonDropOffPoints[step] = (analytics.commonDropOffPoints[step] || 0) + 1;
    }

    return analytics;
  },
});

// Mutation to clean up old incomplete onboarding records (maintenance function)
export const cleanupOldOnboardings = mutation({
  args: {
    olderThanDays: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, { olderThanDays = 30 }) => {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldRecords = await ctx.db
      .query("onboardingResponses")
      .filter(q => q.and(
        q.lt(q.field("updatedAt"), cutoffTime),
        q.eq(q.field("isCompleted"), false),
        q.eq(q.field("isSkipped"), false),
        q.lt(q.field("completionPercentage"), 10) // Only clean very early abandonments
      ))
      .collect();

    let deletedCount = 0;
    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }

    return { deletedCount, cutoffTime };
  },
});

// Mutation to skip onboarding (simplified version)
export const skipOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(api.users.updateOnboardingStatus, {
      status: "skipped",
    });
    
    return { success: true };
  },
});

// Test action to debug extraction logic
export const testExtraction = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, { message }) => {
    const extractedInfo = await extractInformationFromMessage(message);
    
    return {
      message,
      extractedInfo,
      brandNameTest: extractBrandName(message),
      industryTest: extractIndustry(message),
      targetAudienceTest: extractTargetAudience(message),
      brandValuesTest: extractBrandValues(message),
      personalityTraitsTest: extractPersonalityTraits(message),
    };
  },
});
