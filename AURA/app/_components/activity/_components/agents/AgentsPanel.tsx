// AGENTS PANEL - Sidebar panel for agent management following AURA design patterns
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/agents/AgentsPanel.tsx

"use client";

import { useState } from "react";
import { 
  AtSign, 
  Bot, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Command, 
  FilePlus, 
  FileText, 
  Search, 
  Terminal,
  Twitter,
  Zap
} from "lucide-react";
import { useAgentStore, agentRegistry } from "@/lib/agents";

// Icon mapping for agent icons
const iconMap = {
  FileText,
  Bot,
  Terminal,
  Command,
  AtSign,
  Calendar,
  FilePlus,
  Twitter,
  Zap
} as const;

interface AgentsPanelProps {
  className?: string;
}

export default function AgentsPanel({ className = "" }: AgentsPanelProps) {
  const { 
    activeAgents, 
    toggleAgent,
    isAgentActive
  } = useAgentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const allAgents = agentRegistry.getAllAgents();
  
  // Filter to core agents for now - Instructions (free) and CMO (premium) as examples
  const coreAgents = allAgents.filter(agent =>
    agent.id === 'instructions' || agent.id === 'cmo'
  );

  // Debug logging
  console.log('Activity AgentsPanel - All agents:', allAgents.map(a => a.id));
  console.log('Activity AgentsPanel - Core agents:', coreAgents.map(a => a.id));

  const activeAgentsList = Array.from(activeAgents);

  // Filter agents based on search
  const filteredAgents = coreAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.tools.some(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Get all tools count from core agents
  const allToolsCount = coreAgents.reduce((count, agent) => count + agent.tools.length, 0);

  const toggleAgentExpansion = (agentId: string) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const handleAgentToggle = (agentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleAgent(agentId);
  };

  return (
    <div className={`h-full bg-[#181818] text-[#cccccc] flex flex-col relative ${className}`}>
      <div className="p-2 pb-12 overflow-y-auto flex-1">
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Core Agents</span>
          <div className="flex items-center gap-1">
            {activeAgentsList.length > 0 && (
              <div className="w-2 h-2 bg-[#4ec9b0] rounded-full"></div>
            )}
            <span className="text-[#666]">{allToolsCount}</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mx-2 mb-2 p-2 bg-[#2d2d2d]/50 rounded text-[9px] text-[#858585] border border-[#454545]/50">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[#4ec9b0] rounded-full animate-pulse flex-shrink-0"></div>
            <span>Showing core agents - more coming as they&apos;re implemented</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2 mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#858585]" />
          <input
            type="text"
            placeholder="Search agents and tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-xs px-7 py-1.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>

        {/* Agent List */}
        <div className="space-y-1">
          {filteredAgents.map((agent) => {
            const isActive = isAgentActive(agent.id);
            const isExpanded = expandedAgents.has(agent.id);
            const firstTool = agent.tools[0];
            
            return (
              <div 
                key={agent.id} 
                className={`rounded border bg-[#1e1e1e] border-[#2d2d2d] ${
                  isActive ? 'border-l-2 border-l-[#007acc]' : ''
                }`}
              >
                {/* Agent Header - Always Visible */}
                <div 
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
                  onClick={() => toggleAgentExpansion(agent.id)}
                >
                  {/* Expand/Collapse Arrow */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-[#858585]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-[#858585]" />
                    )}
                  </div>

                  {/* Agent Icon */}
                  <div className="flex-shrink-0">
                    {(() => {
                      // Handle emoji icons first
                      if (agent.icon && !iconMap.hasOwnProperty(agent.icon as keyof typeof iconMap)) {
                        return <span className="text-sm">{agent.icon}</span>;
                      }
                      
                      // Handle icon component names
                      if (agent.icon && agent.icon in iconMap) {
                        const IconComponent = iconMap[agent.icon as keyof typeof iconMap];
                        return <IconComponent className="w-4 h-4 text-[#858585]" />;
                      }
                      
                      // Fallback to Bot icon
                      return <Bot className="w-4 h-4 text-[#858585]" />;
                    })()}
                  </div>

                  {/* Agent Name and First Tool */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${isActive ? 'text-[#cccccc]' : 'text-[#b3b3b3]'}`}>
                      {agent.name}
                    </div>
                    {firstTool && (
                      <div className="flex items-center gap-1">
                        <Command className="w-2 h-2 text-[#4ec9b0] flex-shrink-0" />
                        <span className="font-mono text-[#4ec9b0] text-[10px] truncate">
                          {firstTool.command}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Activation Toggle & Tool Count */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-[10px] text-[#858585]">
                      {agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}
                    </div>
                    <button
                      onClick={(e) => handleAgentToggle(agent.id, e)}
                      className={`w-4 h-4 rounded border transition-colors ${
                        isActive 
                          ? 'bg-[#4ec9b0] border-[#4ec9b0]' 
                          : 'border-[#858585] hover:border-[#cccccc]'
                      }`}
                    >
                      {isActive && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#1e1e1e] rounded-full"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                    {/* Agent Description */}
                    <div className="text-[10px] text-[#b3b3b3] mb-2 mt-2 leading-relaxed">
                      {agent.description}
                    </div>

                    {/* All Tools List */}
                    <div className="space-y-1">
                      {agent.tools.map((tool) => (
                        <div
                          key={tool.command}
                          className="flex items-start gap-2 px-2 py-1 bg-[#2d2d2d] rounded text-[10px]"
                        >
                          <Command className="w-2 h-2 text-[#4ec9b0] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-[#4ec9b0] flex-shrink-0">
                                {tool.command}
                              </span>
                              <span className="text-[#cccccc] truncate">
                                {tool.name}
                              </span>
                            </div>
                            <div className="text-[#858585] leading-relaxed">
                              {tool.description}
                            </div>
                            {tool.usage && (
                              <div className="text-[#656565] mt-1 font-mono">
                                Usage: {tool.usage}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-6">
            <Bot className="w-8 h-8 text-[#585858] mx-auto mb-2" />
            <p className="text-xs text-[#858585] mb-1">No agents found</p>
            <p className="text-[10px] text-[#656565]">
              {searchQuery ? 'Try a different search term' : 'Agents will appear here when configured'}
            </p>
          </div>
        )}
      </div>

      {/* Help Text - Absolutely positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#181818] border-t border-[#2d2d2d]">
        <div className="text-[10px] text-[#858585] text-center leading-relaxed">
          {activeAgentsList.length > 0 ? (
            <>Use terminal&apos;s <code className="bg-[#2d2d2d] px-1 rounded">/</code> menu to access {activeAgentsList.length} active agent{activeAgentsList.length !== 1 ? 's' : ''}</>
          ) : (
            <>Click the checkbox to activate agents and access their tools</>
          )}
        </div>
      </div>
    </div>
  );
}
