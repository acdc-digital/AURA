// Twitter Agent Tools
// Main entry point for modular Twitter agent functionality

import { contentGenerator } from './contentGenerator';
import { fileNamer } from './fileNamer';

export { contentGenerator, TwitterContentGenerator } from './contentGenerator';
export { fileNamer, TwitterFileNamer } from './fileNamer';
export { projectManager, TwitterProjectManager } from './projectManager';

export type {
    ContentGenerationRequest,
    GeneratedContent
} from './contentGenerator';

export type {
    FileNamingOptions,
    GeneratedFileName
} from './fileNamer';

export type {
    ProjectOptions, ProjectSelection
} from './projectManager';

// Combined workflow function
export interface TwitterAgentRequest {
  userInput: string;
  suggestedProject?: string;
  schedule?: string;
  settings?: string;
}

export interface TwitterAgentResult {
  content: import('./contentGenerator').GeneratedContent;
  fileName: import('./fileNamer').GeneratedFileName;
  project: import('./projectManager').ProjectSelection;
  success: boolean;
  message: string;
}

export async function processTwitterRequest(
  request: TwitterAgentRequest
): Promise<TwitterAgentResult> {
  try {
    // Step 1: Generate content
    const content = await contentGenerator.generateContent({
      userInput: request.userInput,
      includeHashtags: true
    });

    // Step 2: Generate filename
    const fileName = fileNamer.generateFileName({
      content: content.content,
      topic: content.detectedTopic,
      style: content.style,
      maxWords: 3
    });

    // Step 3: Select project (simplified for reference)
    const project = {
      projectName: 'Social Media',
      isNewProject: false,
      matchConfidence: 1,
      reason: 'Default social media project'
    };

    return {
      content,
      fileName,
      project,
      success: true,
      message: 'Twitter request processed successfully'
    };
  } catch (error) {
    return {
      content: { content: request.userInput, detectedTopic: 'error', style: 'error', confidence: 0 },
      fileName: { name: 'error-post', isUnique: false, originalAttempt: 'error' },
      project: { projectName: 'Social Media', isNewProject: false, matchConfidence: 0, reason: 'Error fallback' },
      success: false,
      message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
