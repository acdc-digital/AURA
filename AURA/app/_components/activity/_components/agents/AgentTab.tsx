// AGENT TAB - Full agent management interface for main dashboard area
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/agents/AgentTab.tsx

"use client";

import { useState } from "react";
import { useAgentStore, agentRegistry } from "@/lib/agents";
import { 
  Bot, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Command, 
  Crown, 
  FileText, 
  FilePlus,
  Info,
  Search,
  Terminal,
  Twitter,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Icon mapping for agent icons
const iconMap = {
  FileText,
  Bot,
  Terminal,
  Command,
  Calendar,
  FilePlus,
  Twitter,
  Zap
} as const;

export default function AgentTab() {
  const { 
    activeAgents, 
    toggleAgent,
    isAgentActive,
    selectedAgentId,
    setSelectedAgent
  } = useAgentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const allAgents = agentRegistry.getAllAgents();
  
  // Filter to core agents only (Instructions and CMO agents)
  const coreAgents = allAgents.filter(agent =>
    agent.id === 'instructions' || agent.id === 'cmo'
  );
  
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

  const handleAgentSelect = (agentId: string) => {
    if (selectedAgentId === agentId) {
      setSelectedAgent(undefined);
      setExpandedAgent(null);
    } else {
      setSelectedAgent(agentId);
      setExpandedAgent(agentId);
    }
  };

  const handleAgentToggle = (agentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleAgent(agentId);
  };

  const getAgentIcon = (agent: { icon?: string }) => {
    // Handle emoji icons first
    if (agent.icon && !iconMap.hasOwnProperty(agent.icon as keyof typeof iconMap)) {
      return <span className="text-lg">{agent.icon}</span>;
    }
    
    // Handle icon component names
    if (agent.icon && agent.icon in iconMap) {
      const IconComponent = iconMap[agent.icon as keyof typeof iconMap];
      return <IconComponent className="w-5 h-5 text-[#858585]" />;
    }
    
    // Fallback to Bot icon
    return <Bot className="w-5 h-5 text-[#858585]" />;
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#454545]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#4ec9b0]" />
            <h1 className="text-xl font-semibold text-[#cccccc]">Core AI Agents</h1>
            {activeAgentsList.length > 0 && (
              <Badge className="bg-[#4ec9b0] text-[#1e1e1e] text-sm px-3">
                {activeAgentsList.length} Active
              </Badge>
            )}
          </div>
          <div className="text-sm text-[#858585]">
            {coreAgents.length} core agents • {coreAgents.reduce((count, agent) => count + agent.tools.length, 0)} tools
          </div>
        </div>
        
        <p className="text-[#858585] mb-4">
          Core AI agents for essential workflows. Activate agents to access their specialized tools in the terminal.
        </p>

        {/* Core Agents Info */}
        <div className="mb-4 p-3 bg-[#252526] rounded-lg border border-[#2d2d2d]">
          <div className="flex items-center gap-2 text-[#4ec9b0] text-sm">
            <div className="w-2 h-2 bg-[#4ec9b0] rounded-full animate-pulse"></div>
            <span>Currently showing core agents - more agents will be added as they&apos;re implemented</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#858585]" />
          <input
            type="text"
            placeholder="Search agents and tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded-lg text-sm px-10 py-2.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => {
            const isActive = isAgentActive(agent.id);
            const isSelected = selectedAgentId === agent.id;
            const isExpanded = expandedAgent === agent.id;

            return (
              <div 
                key={agent.id}
                className={`border rounded-lg transition-all duration-200 ${
                  isSelected 
                    ? 'border-[#007acc] bg-[#007acc]/10' 
                    : 'border-[#454545] hover:border-[#6c6c6c] hover:bg-[#252526]'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => handleAgentSelect(agent.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getAgentIcon(agent)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[#cccccc] font-medium">
                            {agent.name}
                          </h3>
                          {agent.isPremium && (
                            <Crown className="w-4 h-4 text-[#ffd700]" />
                          )}
                        </div>
                        <p className="text-[#858585] text-sm mt-1">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleAgentToggle(agent.id, e)}
                      className={`h-8 w-8 p-0 ${
                        isActive 
                          ? 'text-[#4ec9b0] hover:text-[#4ec9b0]/80' 
                          : 'text-[#858585] hover:text-[#cccccc]'
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs border-[#454545] text-[#858585]">
                      {agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}
                    </Badge>
                    
                    {isActive && (
                      <Badge className="bg-[#4ec9b0] text-[#1e1e1e] text-xs">
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* First few tools preview */}
                  <div className="space-y-1">
                    {agent.tools.slice(0, 2).map((tool) => (
                      <div key={tool.command} className="flex items-center gap-2 text-xs">
                        <Command className="w-3 h-3 text-[#4ec9b0]" />
                        <code className="bg-[#2d2d2d] px-2 py-0.5 rounded text-[#4ec9b0] font-mono">
                          {tool.command}
                        </code>
                        <span className="text-[#858585] truncate">
                          {tool.name}
                        </span>
                      </div>
                    ))}
                    {agent.tools.length > 2 && (
                      <div className="text-xs text-[#858585] pl-5">
                        +{agent.tools.length - 2} more tool{agent.tools.length - 2 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#454545] p-4 bg-[#1a1a1a]">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[#cccccc] text-sm font-medium mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          All Available Tools
                        </h4>
                        <div className="grid gap-2">
                          {agent.tools.map((tool) => (
                            <div key={tool.command} className="bg-[#2d2d2d] rounded p-3">
                              <div className="flex items-start gap-3 mb-2">
                                <Command className="w-4 h-4 text-[#4ec9b0] mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <code className="text-[#4ec9b0] font-mono text-sm">
                                      {tool.command}
                                    </code>
                                    <span className="text-[#cccccc] font-medium">
                                      {tool.name}
                                    </span>
                                  </div>
                                  <p className="text-[#858585] text-sm leading-relaxed">
                                    {tool.description}
                                  </p>
                                  {tool.usage && (
                                    <p className="text-[#6c6c6c] text-xs mt-2 font-mono bg-[#1e1e1e] px-2 py-1 rounded">
                                      Usage: {tool.usage}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#454545]">
                        <p className="text-[#858585] text-sm">
                          {isActive ? (
                            <>✅ Agent is active. Use <code className="bg-[#2d2d2d] px-1.5 py-0.5 rounded font-mono">/</code> in terminal to access tools.</>
                          ) : (
                            <>Click the circle icon above to activate this agent and access its tools.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-[#585858] mx-auto mb-4" />
            <h3 className="text-lg text-[#cccccc] mb-2">No agents found</h3>
            <p className="text-[#858585] max-w-md mx-auto">
              {searchQuery ? (
                <>No agents match your search term &quot;{searchQuery}&quot;. Try a different search or browse all available agents.</>
              ) : (
                <>Agents will appear here when they are configured and available. Check back later or contact your administrator.</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
