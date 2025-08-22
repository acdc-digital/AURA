// EXTENSION TAB - Full dashboard interface for extension management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/extensions/ExtensionTabNew.tsx

"use client";

import { useState } from "react";
import { 
  AtSign, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  FileText, 
  Puzzle, 
  Search, 
  Star, 
  Terminal,
  Zap,
  Crown,
  ExternalLink,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Icon mapping for extension icons
const iconMap = {
  FileText,
  Bot,
  Terminal,
  AtSign,
  Puzzle,
  Zap
} as const;

interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  isInstalled: boolean;
  isPurchased?: boolean;
  price?: number;
  category: 'productivity' | 'ai' | 'social' | 'development' | 'design' | 'other';
  type?: 'extension' | 'agent' | 'mcp';
  icon?: string;
  features?: string[];
  usage?: string;
  tags?: string[];
  longDescription?: string;
  screenshots?: string[];
  changelog?: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
}

// Mock extension data - this will be replaced with real data later
const mockExtensions: Extension[] = [
  {
    id: 'campaign-director',
    name: 'Campaign Director',
    description: 'Enterprise-level marketing campaign orchestration. Generate and schedule 100+ posts across multiple platforms with intelligent content distribution.',
    longDescription: 'The Campaign Director is our most advanced marketing automation agent. It orchestrates complex multi-platform marketing campaigns by generating up to 100+ posts at once, intelligently distributing content across Twitter, LinkedIn, Instagram, and Facebook with optimal timing. The agent manages campaign phases from awareness through conversion, with batch processing capabilities and real-time progress tracking.',
    author: 'EAC Team',
    version: '1.0.0',
    downloads: 2500,
    rating: 4.9,
    price: 199,
    isInstalled: false,
    isPurchased: false,
    category: 'ai',
    type: 'agent',
    icon: 'Bot',
    features: [
      '100+ Post Campaign Generation',
      'Multi-Platform Scheduling (Twitter, LinkedIn, Instagram, Facebook)',
      'Campaign Phase Management (Awareness → Conversion)',
      'Intelligent Content Distribution & Timing',
      'Batch Processing with Progress Tracking',
      'Instructions File Integration',
      'ROI Analytics & Performance Tracking',
      'Content Variation & A/B Testing',
      'Audience Segmentation',
      'Brand Voice Consistency Engine'
    ],
    usage: 'Activate the agent, then use /director command in terminal to start campaign creation. The agent will guide you through setting up your campaign parameters, target audience, and content themes.',
    tags: ['Campaign', 'Automation', 'Premium'],
    changelog: [
      {
        version: '1.0.0',
        date: '2024-01-15',
        changes: [
          'Initial release',
          'Multi-platform campaign generation',
          'Intelligent scheduling engine',
          'Progress tracking dashboard'
        ]
      }
    ]
  },
  {
    id: 'marketing-officer',
    name: 'Marketing Officer',
    description: 'Your AI CMO that researches audiences, plans strategy, creates the assets, and optimizes performance—on command.',
    longDescription: 'The Marketing Officer agent functions as your dedicated Chief Marketing Officer, handling everything from market research to campaign optimization. It analyzes your target audience, develops comprehensive marketing strategies, creates all necessary assets, and continuously optimizes performance based on real-world data.',
    author: 'EAC Team',
    version: '1.0.0',
    downloads: 1800,
    rating: 4.8,
    price: 49,
    isInstalled: false,
    isPurchased: false,
    category: 'ai',
    type: 'agent',
    icon: 'AtSign',
    features: [
      'Campaign Strategy & Content Creation',
      'Experimentation & Optimization',
      'Go‑to‑Market Strategy & Planning',
      'ROI Tracking & Budget Management',
      'Audience Research & Persona Development',
      'Competitive Analysis',
      'Content Calendar Management',
      'Performance Analytics Dashboard'
    ],
    usage: 'Use /cmo command after activation to access marketing tools. The agent will help you develop comprehensive marketing strategies and execute them efficiently.',
    tags: ['Premium', 'Agent', 'Strategy']
  },
  {
    id: 'logo-generator',
    name: 'Logo Generator',
    description: 'AI-powered logo creation and brand identity generation. Create professional logos, color palettes, and brand guidelines in minutes.',
    longDescription: 'The Logo Generator extension uses advanced AI to create professional-quality logos and complete brand identity packages. It generates multiple logo concepts, suggests color palettes, provides typography recommendations, and creates comprehensive brand guidelines—all tailored to your business and industry.',
    author: 'EAC Design Team',
    version: '1.0.0',
    downloads: 3200,
    rating: 4.7,
    price: 29,
    isInstalled: false,
    isPurchased: false,
    category: 'design',
    type: 'extension',
    icon: 'Puzzle',
    features: [
      'AI-Powered Logo Creation',
      'Brand Identity Package Generation',
      'Color Palette & Typography Suggestions',
      'Multiple Format Exports (SVG, PNG, PDF)',
      'Brand Guidelines Documentation',
      'Logo Variations & Mockups',
      'Industry-Specific Templates',
      'Real-time Logo Preview'
    ],
    usage: 'Install and use /logo command to start creating professional logos with AI assistance. The extension will guide you through the design process step by step.',
    tags: ['Premium', 'Design', 'AI']
  },
  {
    id: 'twitter-enhanced',
    name: 'Twitter Enhanced',
    description: 'Advanced Twitter integration with analytics and scheduling',
    longDescription: 'Enhanced Twitter integration that goes beyond basic posting. Includes advanced analytics, intelligent scheduling, thread management, and comprehensive engagement tracking to maximize your Twitter presence.',
    author: 'EAC Team',
    version: '1.0.0',
    downloads: 1250,
    rating: 4.6,
    isInstalled: false,
    isPurchased: false,
    category: 'social',
    type: 'extension',
    icon: 'AtSign',
    features: [
      'Advanced Tweet Scheduling',
      'Twitter Analytics Dashboard',
      'Thread Management',
      'Engagement Tracking',
      'Hashtag Optimization',
      'Follower Growth Analytics'
    ],
    tags: ['Social', 'Free']
  },
  {
    id: 'reddit-analytics',
    name: 'Reddit Analytics Pro',
    description: 'Deep Reddit analytics and content optimization tools',
    longDescription: 'Professional Reddit analytics suite that helps you understand subreddit dynamics, optimize content timing, track performance, and maximize engagement across the Reddit platform.',
    author: 'Community',
    version: '2.1.3',
    downloads: 892,
    rating: 4.4,
    isInstalled: false,
    isPurchased: false,
    category: 'social',
    type: 'extension',
    icon: 'Zap',
    features: [
      'Subreddit Analysis',
      'Content Performance Tracking',
      'Post Timing Optimization',
      'Karma Tracking',
      'Community Insights',
      'Competitor Monitoring'
    ],
    tags: ['Social', 'Analytics']
  }
];

interface ExtensionTabProps {
  className?: string;
}

export default function ExtensionTab({ className = "" }: ExtensionTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Filter extensions
  const filteredExtensions = mockExtensions.filter(extension => {
    const matchesSearch = !searchQuery || 
      extension.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (extension.tags && extension.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    const matchesCategory = selectedCategory === 'all' || extension.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'ai', name: 'AI & Agents' },
    { id: 'social', name: 'Social' },
    { id: 'design', name: 'Design' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'development', name: 'Development' }
  ];

  const toggleCardExpansion = (extensionId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(extensionId)) {
        newSet.delete(extensionId);
      } else {
        newSet.add(extensionId);
      }
      return newSet;
    });
  };

  const handlePurchase = (extensionId: string, price: number) => {
    console.log(`Purchase ${extensionId} for $${price}`);
    // TODO: Implement purchase logic
  };

  const handleInstall = (extensionId: string) => {
    console.log(`Install ${extensionId}`);
    // TODO: Implement installation logic
  };

  const getExtensionIcon = (extension: Extension) => {
    // Handle icon component names
    if (extension.icon && extension.icon in iconMap) {
      const IconComponent = iconMap[extension.icon as keyof typeof iconMap];
      return <IconComponent className="w-6 h-6 text-[#858585]" />;
    }
    
    // Fallback based on type
    if (extension.type === 'agent') {
      return <Bot className="w-6 h-6 text-[#858585]" />;
    } else if (extension.type === 'mcp') {
      return <Terminal className="w-6 h-6 text-[#858585]" />;
    }
    
    // Default fallback
    return <Puzzle className="w-6 h-6 text-[#858585]" />;
  };

  return (
    <div className={`h-full bg-[#1e1e1e] text-[#cccccc] flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#2d2d2d]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-medium text-[#cccccc] mb-1">Extensions Marketplace</h1>
            <p className="text-sm text-[#858585]">Enhance your AURA experience with powerful extensions</p>
          </div>
          <div className="flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-[#858585]" />
            <span className="text-sm text-[#858585]">{filteredExtensions.length} extensions</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#858585]" />
            <input
              type="text"
              placeholder="Search extensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-sm px-10 py-2 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`text-xs ${
                  selectedCategory === category.id
                    ? "bg-[#007acc] hover:bg-[#106ebe] text-white border-[#007acc]"
                    : "bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d] hover:border-[#007acc]"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Extensions Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredExtensions.length === 0 ? (
          <div className="text-center py-12">
            <Puzzle className="w-16 h-16 text-[#585858] mx-auto mb-4" />
            <h3 className="text-lg text-[#cccccc] mb-2">No extensions found</h3>
            <p className="text-sm text-[#858585]">
              {searchQuery ? 'Try adjusting your search or category filter' : 'Extensions will appear here when available'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredExtensions.map((extension) => {
              const isExpanded = expandedCards.has(extension.id);
              const isPremium = extension.price && extension.price > 0;

              return (
                <div
                  key={extension.id}
                  className={`bg-[#252526] border rounded-lg transition-all duration-200 hover:border-[#007acc]/50 ${
                    isPremium ? 'border-[#ffcc02]/30' : 'border-[#2d2d2d]'
                  }`}
                >
                  {/* Extension Card Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Extension Icon */}
                      <div className="flex-shrink-0 p-2 bg-[#1e1e1e] rounded">
                        {getExtensionIcon(extension)}
                      </div>

                      {/* Extension Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-[#cccccc] truncate">
                            {extension.name}
                          </h3>
                          {isPremium && <Crown className="w-3 h-3 text-[#ffcc02] flex-shrink-0" />}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#858585] mb-2">
                          <span>by {extension.author}</span>
                          <span>•</span>
                          <span>v{extension.version}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#ffcc02] fill-current" />
                            <span>{extension.rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#b3b3b3] leading-relaxed line-clamp-2 mb-3">
                          {extension.description}
                        </p>

                        {/* Tags */}
                        <div className="flex items-center gap-1 flex-wrap mb-3">
                          {isPremium && (
                            <Badge className="px-2 py-0.5 bg-[#ffcc02]/20 text-[#ffcc02] text-[9px] uppercase">
                              Premium
                            </Badge>
                          )}
                          {extension.type === 'agent' && (
                            <Badge className="px-2 py-0.5 bg-[#4fc3f7]/20 text-[#4fc3f7] text-[9px] uppercase">
                              Agent
                            </Badge>
                          )}
                          {extension.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} className="px-2 py-0.5 bg-[#2d2d2d] text-[#858585] text-[9px] uppercase">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3 text-[#858585]" />
                            <span className="text-xs text-[#858585]">
                              {extension.downloads.toLocaleString()}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {extension.isInstalled ? (
                              <Badge className="px-2 py-1 bg-[#4ec9b0]/20 text-[#4ec9b0] text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Installed
                              </Badge>
                            ) : extension.isPurchased ? (
                              <Button
                                size="sm"
                                onClick={() => handleInstall(extension.id)}
                                className="bg-[#007acc] hover:bg-[#106ebe] text-white text-xs px-3 py-1"
                              >
                                Install
                              </Button>
                            ) : isPremium ? (
                              <Button
                                size="sm"
                                onClick={() => handlePurchase(extension.id, extension.price!)}
                                className="bg-[#ffcc02] hover:bg-[#e6b800] text-black text-xs px-3 py-1 font-medium"
                              >
                                ${extension.price}.00
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleInstall(extension.id)}
                                className="bg-[#007acc] hover:bg-[#106ebe] text-white text-xs px-3 py-1"
                              >
                                Install
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleCardExpansion(extension.id)}
                              className="border-[#454545] text-[#858585] hover:bg-[#2d2d2d] hover:border-[#007acc] p-1"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-[#2d2d2d] bg-[#1e1e1e] p-4">
                      {/* Long Description */}
                      {extension.longDescription && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-[#cccccc] uppercase tracking-wide mb-2">
                            About
                          </h4>
                          <p className="text-xs text-[#b3b3b3] leading-relaxed">
                            {extension.longDescription}
                          </p>
                        </div>
                      )}

                      {/* Features */}
                      {extension.features && extension.features.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-[#cccccc] uppercase tracking-wide mb-2">
                            Features
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {extension.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-[#007acc] rounded-full flex-shrink-0" />
                                <span className="text-xs text-[#b3b3b3]">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Usage */}
                      {extension.usage && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-[#cccccc] uppercase tracking-wide mb-2">
                            Usage
                          </h4>
                          <div className="bg-[#252526] border border-[#2d2d2d] rounded p-3">
                            <p className="text-xs text-[#b3b3b3] leading-relaxed">
                              {extension.usage}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Additional Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#2d2d2d]">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#454545] text-[#858585] hover:bg-[#2d2d2d] hover:border-[#007acc] text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Learn More
                          </Button>
                        </div>

                        <div className="text-xs text-[#656565]">
                          Category: {extension.category}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
