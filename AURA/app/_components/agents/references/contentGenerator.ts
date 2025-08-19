// Twitter Content Generator
// Handles AI-powered content generation with improved templates and variety

// Content Generation Interface
export interface ContentGenerationRequest {
  userInput: string;
  topic?: string;
  style?: 'motivational' | 'educational' | 'professional' | 'casual' | 'announcement';
  includeHashtags?: boolean;
}

export interface GeneratedContent {
  content: string;
  detectedTopic: string;
  style: string;
  confidence: number;
}

export class TwitterContentGenerator {
  private static instance: TwitterContentGenerator;
  
  private constructor() {}
  
  static getInstance(): TwitterContentGenerator {
    if (!TwitterContentGenerator.instance) {
      TwitterContentGenerator.instance = new TwitterContentGenerator();
    }
    return TwitterContentGenerator.instance;
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { userInput } = request;
    
    // Detect if user wants content generation or is providing literal content
    const isGenerationRequest = this.detectGenerationRequest(userInput);
    
    if (!isGenerationRequest) {
      return {
        content: userInput,
        detectedTopic: 'user-provided',
        style: 'custom',
        confidence: 1.0
      };
    }

    // Extract topic and style from user input
    const detectedTopic = this.extractTopic(userInput);
    const detectedStyle = this.extractStyle(userInput);
    
    // Generate content based on topic and style
    const content = this.generateTopicContent(detectedTopic, detectedStyle, userInput);
    
    return {
      content,
      detectedTopic,
      style: detectedStyle,
      confidence: 0.85
    };
  }

  private detectGenerationRequest(input: string): boolean {
    const generationKeywords = [
      'create', 'generate', 'write', 'make',
      'post about', 'tweet about', 'share about',
      'motivational', 'inspirational', 'funny',
      'educational', 'professional', 'announcement',
      'tip', 'advice', 'quote'
    ];

    return generationKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private extractTopic(input: string): string {
    const inputLower = input.toLowerCase();
    
    // Direct topic extraction patterns
    const aboutMatch = input.match(/(?:about|on)\s+([^,\.!?]+)/i);
    if (aboutMatch) {
      return aboutMatch[1].trim();
    }

    // Predefined topic detection
    const topicMap = {
      'japan': ['japan', 'japanese', 'tokyo', 'kyoto'],
      'technology': ['tech', 'technology', 'ai', 'software', 'coding'],
      'business': ['business', 'startup', 'entrepreneur', 'finance'],
      'health': ['health', 'fitness', 'wellness', 'workout'],
      'motivation': ['motivation', 'inspiration', 'success', 'goals'],
      'travel': ['travel', 'trip', 'vacation', 'tourism'],
      'food': ['food', 'cooking', 'recipe', 'cuisine'],
      'education': ['education', 'learning', 'study', 'knowledge'],
      'productivity': ['productivity', 'work', 'efficiency', 'time'],
      'creativity': ['creativity', 'art', 'design', 'creative'],
      'music': ['music', 'song', 'artist', 'singer', 'album', 'concert', 'mariah carey', 'taylor swift', 'beyonce', 'drake', 'spotify', 'playlist']
    };

    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        return topic;
      }
    }

    return 'general';
  }

  private extractStyle(input: string): string {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('motivat') || inputLower.includes('inspir')) return 'motivational';
    if (inputLower.includes('professional') || inputLower.includes('business')) return 'professional';
    if (inputLower.includes('educational') || inputLower.includes('tip')) return 'educational';
    if (inputLower.includes('announcement') || inputLower.includes('news')) return 'announcement';
    if (inputLower.includes('funny') || inputLower.includes('casual')) return 'casual';
    
    return 'general';
  }

  private generateTopicContent(topic: string, style: string, originalInput: string): string {
    const templates = this.getTemplatesForTopic(topic, style);
    
    if (templates.length === 0) {
      return this.generateFallbackContent(topic, originalInput);
    }

    // Select random template for variety
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template;
  }

  private getTemplatesForTopic(topic: string, style: string): string[] {
    const templateMap: Record<string, Record<string, string[]>> = {
      japan: {
        motivational: [
          "🗾 Japan teaches us that strength comes from adapting to change, just like cherry blossoms bloom and fall. What lesson from nature inspires you today? #JapanWisdom #Resilience #Growth",
          "🌸 In Japan, they say 'Nana korobi ya oki' - fall seven times, rise eight. What challenge are you ready to rise from today? #JapanMotivation #Perseverance #Success"
        ],
        educational: [
          "🗾 Did you know Japan has over 6,800 islands? From ancient temples to bullet trains, every corner tells a story of innovation meeting tradition. #JapanFacts #Culture #Learning",
          "🍜 Japanese cuisine goes beyond sushi! Ramen has over 100 varieties, each region crafting unique flavors. What's your favorite Japanese dish? #JapaneseCuisine #Food #Culture"
        ],
        general: [
          "🗾 Japan's breathtaking landscapes blend ancient traditions with modern marvels. From cherry blossoms in Kyoto to neon lights in Tokyo—every moment is magic! #JapanTravel #Tourism #Culture"
        ]
      },
      
      technology: {
        motivational: [
          "💻 Technology isn't just about code—it's about creating solutions that change lives. What problem are you solving today? #TechMotivation #Innovation #Impact",
          "🚀 Every app started as an idea. Every platform began with a single line of code. Your next breakthrough is just one commit away! #TechSuccess #Coding #Dreams"
        ],
        educational: [
          "🔧 AI isn't replacing developers—it's amplifying our capabilities. Learn to work WITH AI, not against it. The future belongs to human-AI collaboration! #AI #Development #Future",
          "💡 Did you know? The first computer bug was literally a bug—a moth found in a Harvard computer in 1947! Grace Hopper coined the term. #TechHistory #Programming #Fun"
        ],
        professional: [
          "⚡ The tech industry moves fast, but fundamentals remain constant: clean code, user focus, and continuous learning. What fundamental are you strengthening today? #TechCareer #Programming #Growth"
        ]
      },

      motivation: {
        motivational: [
          "🌟 Every expert was once a beginner. Every pro was once an amateur. The only difference? They never gave up. What are you not giving up on today? #Motivation #Growth #Success",
          "💪 Your future self is counting on the decisions you make today. Make choices that your future self will thank you for! #FutureYou #Goals #Success",
          "🎯 Progress isn't always visible, but it's always happening. Trust the process, embrace the journey, celebrate small wins! #Progress #Mindset #Growth"
        ]
      },

      business: {
        professional: [
          "📊 Great businesses solve real problems for real people. Before building features, build understanding. What problem are you solving today? #Business #Strategy #CustomerFirst",
          "💼 Revenue is vanity, profit is sanity, but cash flow is reality. Focus on the metrics that actually matter for sustainability. #BusinessTips #Finance #Strategy"
        ],
        motivational: [
          "🚀 Every successful business started with someone believing in an impossible idea. What impossible idea are you working on? #Entrepreneurship #Innovation #Dreams"
        ]
      },

      health: {
        motivational: [
          "💪 Your body can do it. It's your mind you need to convince. What mental barrier are you breaking through today? #FitnessMotivation #Health #Mindset",
          "🌱 Health isn't a destination—it's a daily practice. Small choices compound into life-changing results. What healthy choice are you making today? #Health #Wellness #Habits"
        ],
        educational: [
          "🧠 Did you know? Exercise literally grows new brain cells! Physical activity increases BDNF, which helps create new neural connections. Move your body, grow your mind! #Health #Science #Brain"
        ]
      },

      music: {
        motivational: [
          "🎵 Music has the power to heal, inspire, and unite us across all boundaries. What song lifts your spirits when you need it most? #Music #Inspiration #Healing",
          "🎤 Every artist's journey starts with a single note, a single word, a single dream. Your voice matters—let it be heard! #Music #Dreams #ArtistLife"
        ],
        general: [
          "🎶 Great music transcends time and touches souls. From classic ballads to modern beats, every genre tells a story. What's your soundtrack today? #Music #Life #Soundtrack",
          "🎵 The beauty of music lies in its ability to express what words cannot. Which artist's voice speaks to your heart? #Music #Emotion #Connection",
          "🎤 Music is the universal language that connects us all. One song can change a mood, a day, or even a life. What's your go-to anthem? #Music #Universal #Power"
        ],
        professional: [
          "🎼 The music industry continues to evolve with streaming, AI, and new platforms changing how we discover and consume music. What trends excite you most? #MusicIndustry #Innovation #Streaming"
        ],
        educational: [
          "🎵 Did you know? Listening to music releases dopamine in the brain—the same chemical associated with eating and falling in love! What music makes you happiest? #Music #Science #Brain"
        ]
      }
    };

    const topicTemplates = templateMap[topic];
    if (!topicTemplates) return [];

    const styleTemplates = topicTemplates[style] || topicTemplates['general'] || [];
    return styleTemplates;
  }

  private generateFallbackContent(topic: string, originalInput: string): string {
    // Try to extract the actual subject from the original input
    const aboutMatch = originalInput.match(/about\s+([^,\.!?]+)/i);
    const subject = aboutMatch ? aboutMatch[1].trim() : topic;
    
    const subjectFormatted = subject.charAt(0).toUpperCase() + subject.slice(1);
    const hashtag = subject.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    
    const fallbackTemplates = [
      `✨ ${subjectFormatted} brings so much joy and inspiration! What's your favorite thing about it? #${hashtag} #Love #Passion`,
      `🌟 There's something special about ${subjectFormatted} that just captures the heart. Share your thoughts! #${hashtag} #Amazing #Thoughts`,
      `💫 ${subjectFormatted} has this incredible ability to make us feel alive. What draws you to it? #${hashtag} #Inspiration #Life`,
      `🎉 Celebrating all things ${subjectFormatted}! What makes it meaningful to you? #${hashtag} #Celebration #Meaningful`,
      `� ${subjectFormatted} never fails to amaze! What's your latest discovery or favorite moment? #${hashtag} #Amazing #Discovery`
    ];

    return fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
  }
}

// Export singleton instance
export const contentGenerator = TwitterContentGenerator.getInstance();
