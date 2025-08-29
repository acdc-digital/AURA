// AGENTS PANEL - Agent activation and management UI
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/AgentsPanel.tsx

"use client";

import { useAgentStore, agentRegistry } from "@/lib/agents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Crown, Info } from "lucide-react";
import { useState } from "react";

export function AgentsPanel() {
  const { 
    activeAgents, 
    activateAgent, 
    deactivateAgent, 
    isAgentActive,
    selectedAgentId,
    setSelectedAgent,
    executionHistory,
    isExecuting,
    currentExecution
  } = useAgentStore();

  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const allAgents = agentRegistry.getAllAgents();
  // Filter to core agents only (Instructions and CMO agents)
  const coreAgentIds = ['instructions', 'cmo'];
  const coreAgents = allAgents.filter(agent => coreAgentIds.includes(agent.id));
  const activeAgentsList = Array.from(activeAgents);
  const recentExecutions = executionHistory.slice(0, 5);

  const handleAgentToggle = (agentId: string) => {
    if (isAgentActive(agentId)) {
      deactivateAgent(agentId);
    } else {
      activateAgent(agentId);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    if (selectedAgentId === agentId) {
      setSelectedAgent(undefined);
      setExpandedAgent(null);
    } else {
      setSelectedAgent(agentId);
      setExpandedAgent(agentId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#454545]">
        <h3 className="text-[#cccccc] font-medium mb-2 flex items-center gap-2">
          🤖 AGENTS
          {activeAgentsList.length > 0 && (
            <Badge variant="secondary" className="bg-[#4ec9b0] text-[#1e1e1e] text-xs">
              {activeAgentsList.length} active
            </Badge>
          )}
        </h3>
        
        {isExecuting && currentExecution && (
          <div className="text-[#4ec9b0] text-xs flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-[#4ec9b0] rounded-full animate-pulse"></div>
            Executing {currentExecution.command}...
          </div>
        )}
        
        <p className="text-[#858585] text-xs">
          Activate agents to access their tools in the terminal.
        </p>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <div className="mb-3">
            <h3 className="text-[#cccccc] text-sm font-medium flex items-center justify-between">
              <span>Core Agents</span>
              <span className="text-[#858585] text-xs">
                Showing {coreAgents.length} of {allAgents.length} agents
              </span>
            </h3>
          </div>
          {coreAgents.map((agent) => {
            const isActive = isAgentActive(agent.id);
            const isSelected = selectedAgentId === agent.id;
            const isExpanded = expandedAgent === agent.id;

            return (
              <div 
                key={agent.id}
                className={`border rounded-lg transition-all duration-200 ${
                  isSelected 
                    ? 'border-[#007acc] bg-[#007acc]/10' 
                    : 'border-[#454545] hover:border-[#6c6c6c]'
                }`}
              >
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => handleAgentSelect(agent.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agent.icon}</span>
                      <span className="text-[#cccccc] text-sm font-medium">
                        {agent.name}
                      </span>
                      {agent.isPremium && (
                        <Crown className="w-3 h-3 text-[#ffd700]" />
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentToggle(agent.id);
                      }}
                      className={`h-6 w-6 p-0 ${
                        isActive 
                          ? 'text-[#4ec9b0] hover:text-[#4ec9b0]/80' 
                          : 'text-[#858585] hover:text-[#cccccc]'
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-[#858585] text-xs">
                    {agent.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs border-[#454545] text-[#858585]">
                      {agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}
                    </Badge>
                    
                    {isActive && (
                      <Badge className="bg-[#4ec9b0] text-[#1e1e1e] text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#454545] p-3 bg-[#1e1e1e]/50">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[#cccccc] text-xs font-medium mb-2 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Available Tools
                        </h4>
                        <div className="space-y-2">
                          {agent.tools.map((tool) => (
                            <div key={tool.command} className="text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="bg-[#2d2d2d] px-2 py-1 rounded text-[#4ec9b0]">
                                  {tool.command}
                                </code>
                                <span className="text-[#cccccc]">{tool.name}</span>
                              </div>
                              <p className="text-[#858585] pl-2 border-l-2 border-[#454545]">
                                {tool.description}
                              </p>
                              {tool.usage && (
                                <p className="text-[#6c6c6c] text-xs mt-1 font-mono">
                                  Usage: {tool.usage}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#454545]">
                        <p className="text-[#858585] text-xs">
                          {isActive ? (
                            <>✅ Agent is active. Type <code className="bg-[#2d2d2d] px-1 rounded">/</code> in terminal to see tools.</>
                          ) : (
                            <>Click the circle icon to activate this agent and access its tools.</>
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
      </div>

      {/* Recent Executions */}
      {recentExecutions.length > 0 && (
        <div className="border-t border-[#454545] p-4">
          <h4 className="text-[#cccccc] text-xs font-medium mb-2">Recent Activity</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentExecutions.map((execution, index) => {
              const agent = agentRegistry.getAgent(execution.agentId);
              const timeAgo = new Date(execution.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    execution.result.success ? 'bg-[#4ec9b0]' : 'bg-[#f97583]'
                  }`}></div>
                  <span className="text-[#858585]">{timeAgo}</span>
                  <span className="text-[#cccccc]">{agent?.icon}</span>
                  <code className="text-[#4ec9b0] bg-[#2d2d2d] px-1 rounded">
                    {execution.command}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
