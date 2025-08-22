// EXTENSIONS PANEL - Sidebar panel for extension management following AURA design patterns
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/extensions/ExtensionsPanelNew.tsx

"use client";

import { useState } from "react";
import { 
  AtSign, 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  FileText, 
  Puzzle, 
  Search, 
  Star, 
  Terminal,
  Zap,
  Crown
} from "lucide-react";

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
}

// Mock extension data - this will be replaced with real data later
const mockExtensions: Extension[] = [
  {
    id: 'campaign-director',
    name: 'Campaign Director',
    description: 'Enterprise-level marketing campaign orchestration. Generate and schedule 100+ posts across multiple platforms with intelligent content distribution.',
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
      'Instructions File Integration'
    ],
    usage: 'Activate the agent, then use /director command in terminal to start campaign creation.',
    tags: ['Campaign', 'Automation', 'Premium']
  },
  {
    id: 'marketing-officer',
    name: 'Marketing Officer',
    description: 'Your AI CMO that researches audiences, plans strategy, creates the assets, and optimizes performance—on command.',
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
      'ROI Tracking & Budget Management'
    ],
    usage: 'Use /cmo command after activation to access marketing tools.',
    tags: ['Premium', 'Agent']
  },
  {
    id: 'logo-generator',
    name: 'Logo Generator',
    description: 'AI-powered logo creation and brand identity generation. Create professional logos, color palettes, and brand guidelines in minutes.',
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
      'Logo Variations & Mockups'
    ],
    usage: 'Install and use /logo command to start creating professional logos with AI assistance.',
    tags: ['Premium', 'Design', 'AI']
  },
  {
    id: 'twitter-enhanced',
    name: 'Twitter Enhanced',
    description: 'Advanced Twitter integration with analytics and scheduling',
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
      'Engagement Tracking'
    ],
    tags: ['Social', 'Free']
  },
  {
    id: 'reddit-analytics',
    name: 'Reddit Analytics Pro',
    description: 'Deep Reddit analytics and content optimization tools',
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
      'Karma Tracking'
    ],
    tags: ['Social', 'Analytics']
  }
];

interface ExtensionsPanelProps {
  className?: string;
}

export default function ExtensionsPanel({ className = "" }: ExtensionsPanelProps) {
  // TODO: Later connect to real extension store
  // const { 
  //   availableExtensions,
  //   purchasedExtensions,
  //   selectedExtensionId,
  //   setSelectedExtension,
  //   purchaseExtension,
  //   isPurchased,
  //   refreshExtensions
  // } = useExtensionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExtensions, setExpandedExtensions] = useState<Set<string>>(new Set());

  // Combine real extensions with mock data for now
  const allExtensions = [...mockExtensions];
  
  // Filter extensions based on search
  const filteredExtensions = allExtensions.filter(extension =>
    extension.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    extension.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    extension.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (extension.tags && extension.tags.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const toggleExtensionExpansion = (extensionId: string) => {
    setExpandedExtensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(extensionId)) {
        newSet.delete(extensionId);
      } else {
        newSet.add(extensionId);
      }
      return newSet;
    });
  };

  const handlePurchase = async (extensionId: string, price: number, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Purchase ${extensionId} for $${price}`);
    // TODO: Implement purchase logic
  };

  const getExtensionIcon = (extension: Extension) => {
    // Handle emoji icons first
    if (extension.icon && !iconMap.hasOwnProperty(extension.icon as keyof typeof iconMap)) {
      return <span className="text-sm">{extension.icon}</span>;
    }
    
    // Handle icon component names
    if (extension.icon && extension.icon in iconMap) {
      const IconComponent = iconMap[extension.icon as keyof typeof iconMap];
      return <IconComponent className="w-4 h-4 text-[#858585]" />;
    }
    
    // Fallback based on type
    if (extension.type === 'agent') {
      return <Bot className="w-4 h-4 text-[#858585]" />;
    } else if (extension.type === 'mcp') {
      return <Terminal className="w-4 h-4 text-[#858585]" />;
    }
    
    // Default fallback
    return <Puzzle className="w-4 h-4 text-[#858585]" />;
  };

  const getStatusBadge = (extension: Extension) => {
    const badges = [];
    
    if (extension.price && extension.price > 0) {
      badges.push(
        <span key="premium" className="px-2 py-0.5 bg-[#ffcc02]/20 text-[#ffcc02] text-[9px] rounded uppercase">
          Premium
        </span>
      );
    }
    
    if (extension.type === 'agent') {
      badges.push(
        <span key="agent" className="px-2 py-0.5 bg-[#4fc3f7]/20 text-[#4fc3f7] text-[9px] rounded uppercase">
          Agent
        </span>
      );
    } else if (extension.type === 'mcp') {
      badges.push(
        <span key="mcp" className="px-2 py-0.5 bg-[#858585]/20 text-[#858585] text-[9px] rounded uppercase">
          MCP
        </span>
      );
    }
    
    if (extension.tags) {
      extension.tags.forEach((tag) => {
        if (tag !== 'Premium' && tag !== 'Agent') {
          badges.push(
            <span key={tag} className="px-2 py-0.5 bg-[#2d2d2d] text-[#858585] text-[9px] rounded uppercase">
              {tag}
            </span>
          );
        }
      });
    }
    
    return badges;
  };

  const getPriceButton = (extension: Extension) => {
    if (extension.isInstalled) {
      return (
        <span className="px-1.5 py-1 text-[9px] rounded bg-[#2d2d2d] text-[#858585]">
          Installed
        </span>
      );
    }
    
    if (extension.isPurchased) {
      return (
        <span className="px-1.5 py-1 text-[9px] rounded bg-[#4ec9b0]/20 text-[#4ec9b0]">
          Purchased
        </span>
      );
    }
    
    if (extension.price && extension.price > 0) {
      return (
        <button
          onClick={(e) => handlePurchase(extension.id, extension.price!, e)}
          className="px-1.5 py-1 text-[9px] rounded transition-colors bg-[#2d2d2d] hover:bg-[#454545] text-[#ffcc02] border border-[#ffcc02]/40 hover:border-[#ffcc02]/60"
        >
          ${extension.price}.00
        </button>
      );
    }
    
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log(`Install ${extension.id}`);
        }}
        className="px-1.5 py-1 text-[9px] rounded transition-colors bg-[#007acc] hover:bg-[#106ebe] text-white"
      >
        Install
      </button>
    );
  };

  return (
    <div className={`h-full bg-[#181818] text-[#cccccc] flex flex-col relative ${className}`}>
      <div className="p-2 pb-12 overflow-y-auto flex-1">
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Extensions</span>
          <div className="flex items-center gap-1">
            <Puzzle className="w-3 h-3" />
            <span className="text-[#666]">{allExtensions.length}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2 mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#858585]" />
          <input
            type="text"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-xs px-7 py-1.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>

        {/* Extensions List */}
        <div className="space-y-1">
          {filteredExtensions.map((extension) => {
            const isExpanded = expandedExtensions.has(extension.id);
            const isPremium = extension.price && extension.price > 0;
            
            return (
              <div 
                key={extension.id} 
                className={`rounded border bg-[#1e1e1e] border-[#2d2d2d] ${
                  isPremium ? 'border-l-2 border-l-[#ffcc02]' : extension.isInstalled ? 'border-l-2 border-l-[#007acc]' : ''
                }`}
              >
                {/* Extension Header - Always Visible */}
                <div 
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
                  onClick={() => toggleExtensionExpansion(extension.id)}
                >
                  {/* Expand/Collapse Arrow */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-[#858585]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-[#858585]" />
                    )}
                  </div>

                  {/* Extension Icon */}
                  <div className="flex-shrink-0">
                    {getExtensionIcon(extension)}
                  </div>

                  {/* Extension Name and Downloads */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#cccccc] flex items-center gap-1">
                      {extension.name}
                      {isPremium && <Crown className="w-2.5 h-2.5 text-[#ffcc02]" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-2 h-2 text-[#858585] flex-shrink-0" />
                      <span className="text-[10px] text-[#858585] truncate">
                        {extension.downloads.toLocaleString()} downloads
                      </span>
                    </div>
                  </div>

                  {/* Price/Install Button */}
                  <div className="flex-shrink-0">
                    {getPriceButton(extension)}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                    {/* Extension Details */}
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-[#b3b3b3]">
                          by {extension.author} • v{extension.version}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-[#ffcc02] fill-current" />
                          <span className="text-[9px] text-[#b3b3b3]">{extension.rating}</span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                        {extension.description}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(extension)}
                      </div>

                      {/* Features List */}
                      {extension.features && extension.features.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="text-[10px] text-[#858585] uppercase tracking-wide">Features:</div>
                          <ul className="text-[10px] text-[#b3b3b3] space-y-0.5 pl-2">
                            {extension.features.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Usage Instructions */}
                      {extension.usage && (
                        <div className="mt-3 space-y-1">
                          <div className="text-[10px] text-[#858585] uppercase tracking-wide">Usage:</div>
                          <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                            {extension.usage}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredExtensions.length === 0 && (
          <div className="text-center py-6">
            <Puzzle className="w-8 h-8 text-[#585858] mx-auto mb-2" />
            <p className="text-xs text-[#858585] mb-1">No extensions found</p>
            <p className="text-[10px] text-[#656565]">
              {searchQuery ? 'Try a different search term' : 'Extensions will appear here when available'}
            </p>
          </div>
        )}
      </div>

      {/* Help Text - Absolutely positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#181818] border-t border-[#2d2d2d]">
        <div className="text-[10px] text-[#858585] text-center leading-relaxed">
          Browse and install extensions to enhance your AURA experience
        </div>
      </div>
    </div>
  );
}
