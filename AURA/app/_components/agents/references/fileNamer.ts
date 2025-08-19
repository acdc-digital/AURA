// Twitter File Naming System
// Generates unique, descriptive filenames based on content and prevents duplicates

export interface FileNamingOptions {
  content: string;
  topic?: string;
  style?: string;
  timestamp?: boolean;
  maxWords?: number;
}

export interface GeneratedFileName {
  name: string;
  isUnique: boolean;
  originalAttempt: string;
}

export class TwitterFileNamer {
  private static instance: TwitterFileNamer;
  private usedNames = new Set<string>();
  
  private constructor() {}
  
  static getInstance(): TwitterFileNamer {
    if (!TwitterFileNamer.instance) {
      TwitterFileNamer.instance = new TwitterFileNamer();
    }
    return TwitterFileNamer.instance;
  }

  generateFileName(options: FileNamingOptions): GeneratedFileName {
    const { content, topic, style, maxWords = 3 } = options;
    
    // Primary strategy: Extract meaningful words from content
    let baseFileName = this.extractMeaningfulWords(content, maxWords);
    
    // Secondary strategy: Use topic if content extraction fails
    if (!baseFileName && topic && topic !== 'general') {
      baseFileName = this.topicToFileName(topic, style);
    }
    
    // Fallback strategy: Time-based naming
    if (!baseFileName) {
      baseFileName = this.generateTimestampName();
    }
    
    // Ensure uniqueness
    const uniqueName = this.ensureUniqueness(baseFileName);
    
    // Track used name
    this.usedNames.add(uniqueName);
    
    return {
      name: uniqueName,
      isUnique: uniqueName === baseFileName,
      originalAttempt: baseFileName
    };
  }

  private extractMeaningfulWords(content: string, maxWords: number): string {
    // Clean the content
    const cleaned = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters except emojis
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/#\w+/g, '') // Remove hashtags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Define stop words to filter out
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'are', 'you', 'your',
      'can', 'will', 'our', 'today', 'what', 'how', 'when', 'where', 'why',
      'isnt', 'about', 'there', 'much', 'explore', 'every', 'topic', 'has',
      'fascinating', 'depths', 'waiting', 'discovered', 'aspect', 'interests',
      'most', 'discovery', 'learning', 'theres', 'so'
    ]);

    // Extract meaningful words
    const words = cleaned
      .split(' ')
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !word.match(/^\d+$/) // No pure numbers
      )
      .slice(0, maxWords);

    if (words.length === 0) return '';
    
    // Create filename
    const fileName = words.join('-') + '-post';
    return fileName;
  }

  private topicToFileName(topic: string, style?: string): string {
    const topicMap: Record<string, string[]> = {
      japan: ['japan', 'japanese', 'tokyo', 'kyoto', 'nippon'],
      technology: ['tech', 'coding', 'innovation', 'digital', 'software'],
      business: ['business', 'strategy', 'growth', 'success', 'venture'],
      health: ['health', 'fitness', 'wellness', 'strong', 'vitality'],
      motivation: ['motivation', 'inspiration', 'goals', 'success', 'mindset'],
      travel: ['travel', 'journey', 'adventure', 'explore', 'wanderlust'],
      food: ['food', 'cuisine', 'flavor', 'taste', 'culinary'],
      education: ['learning', 'knowledge', 'education', 'wisdom', 'study'],
      productivity: ['productivity', 'efficiency', 'focus', 'workflow', 'optimal'],
      creativity: ['creativity', 'artistic', 'imagination', 'design', 'innovative']
    };

    const variations = topicMap[topic] || [topic];
    const selectedWord = variations[Math.floor(Math.random() * variations.length)];
    
    const stylePrefix = style && style !== 'general' 
      ? `${style}-` 
      : '';
    
    return `${stylePrefix}${selectedWord}-post`;
  }

  private generateTimestampName(): string {
    const now = new Date();
    const timeStr = now.toISOString()
      .slice(0, 16)
      .replace(/[:-]/g, '')
      .replace('T', '-');
    
    return `twitter-post-${timeStr}`;
  }

  private ensureUniqueness(baseName: string): string {
    if (!this.usedNames.has(baseName)) {
      return baseName;
    }

    // Try numbered variations
    for (let i = 2; i <= 10; i++) {
      const variant = `${baseName}-${i}`;
      if (!this.usedNames.has(variant)) {
        return variant;
      }
    }

    // Final fallback with timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `${baseName}-${timestamp}`;
  }

  // Method to clear used names (useful for testing or reset)
  clearUsedNames(): void {
    this.usedNames.clear();
  }

  // Method to check if a name has been used
  isNameUsed(name: string): boolean {
    return this.usedNames.has(name);
  }

  // Get all used names (for debugging)
  getUsedNames(): string[] {
    return Array.from(this.usedNames);
  }
}

// Export singleton instance
export const fileNamer = TwitterFileNamer.getInstance();
