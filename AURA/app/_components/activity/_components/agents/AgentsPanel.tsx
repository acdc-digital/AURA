// AGENTS PANEL - Agent console displaying available agents and their capabilities
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/agents/AgentsPanel.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agentRegistry } from "@/lib/agents";
import { useAgentStore } from "@/lib/agents";
import type { BaseAgent } from "@/lib/agents";
import { 
  CheckCircle2, 
  Circle, 
  Crown, 
  FileText, 
  FolderPlus, 
  Calendar,
  Bot,
  Twitter,
  Info,
  Terminal,
  Zap
} from "lucide-react";

export default function AgentsPanel() {
  const { isSignedIn } = useUser();
  const { 
    activeAgents, 
    toggleAgent, 
    isAgentActive, 
    selectedAgentId, 
    setSelectedAgent 
  } = useAgentStore();
  
  const [agents, setAgents] = useState<BaseAgent[]>([]);

  useEffect(() => {
    // Get all registered agents
    const registeredAgents = agentRegistry.getAllAgents();
    setAgents(registeredAgents);
  }, []);

  if (!isSignedIn) {
    return (
      <div className="p-4">
        <h3 className="text-[#cccccc] font-medium mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AGENTS
        </h3>
        <div className="text-[#858585] text-sm">
          <p className="mb-4">Sign in to access AI agents for automating workflows and content creation.</p>
          <SignInButton mode="modal">
            <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const getAgentIcon = (agent: BaseAgent) => {
    const iconMap: Record<string, typeof FileText> = {
      "instructions": FileText,
      "file-creator": FileText,
      "project-creator": FolderPlus,
      "cmo": Twitter,
      "scheduling": Calendar,
    };
    
    const IconComponent = iconMap[agent.id] || Bot;
    return <IconComponent className="w-4 h-4" />;
  };

  const getAgentStatusColor = (agent: BaseAgent) => {
    if (!isAgentActive(agent.id)) return "text-[#858585]";
    return agent.isPremium ? "text-[#d4af37]" : "text-[#4ec9b0]";
  };

  const getAgentBadge = (agent: BaseAgent) => {
    if (agent.isPremium) {
      return (
        <Badge variant="outline" className="text-xs bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs bg-[#4ec9b0]/10 border-[#4ec9b0]/20 text-[#4ec9b0]">
        Free
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#454545]">
        <h3 className="text-[#cccccc] font-medium mb-2 flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI AGENTS
        </h3>
        <p className="text-[#858585] text-xs">
          Activate agents to access their tools in the terminal
        </p>
      </div>

      {/* Agents List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {agents.map((agent) => {
            const isActive = isAgentActive(agent.id);
            const isSelected = selectedAgentId === agent.id;

            return (
              <div
                key={agent.id}
                className={`rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#007acc] bg-[#007acc]/5"
                    : "border-[#454545] bg-[#2d2d2d] hover:border-[#606060] hover:bg-[#3c3c3c]"
                }`}
                onClick={() => setSelectedAgent(isSelected ? undefined : agent.id)}
              >
                <div className="p-3">
                  {/* Agent Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`${getAgentStatusColor(agent)} transition-colors`}>
                        {getAgentIcon(agent)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#cccccc] text-sm font-medium truncate">
                          {agent.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getAgentBadge(agent)}
                          <span className="text-[#858585] text-xs">
                            {agent.tools.length} tools
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Activation Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgent(agent.id);
                      }}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-[#4ec9b0]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#858585]" />
                      )}
                    </Button>
                  </div>

                  {/* Agent Description */}
                  <p className="text-[#858585] text-xs mb-3 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="space-y-3 pt-2 border-t border-[#454545]">
                      {/* Tools */}
                      <div>
                        <h5 className="text-[#cccccc] text-xs font-medium mb-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Available Tools
                        </h5>
                        <div className="space-y-2">
                          {agent.tools.map((tool) => (
                            <div key={tool.command} className="bg-[#1e1e1e] rounded p-2">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-[#4ec9b0] text-xs bg-[#0f0f0f] px-1 rounded">
                                  {tool.command}
                                </code>
                                <span className="text-[#cccccc] text-xs font-medium">
                                  {tool.name}
                                </span>
                              </div>
                              <p className="text-[#858585] text-xs">
                                {tool.description}
                              </p>
                              {tool.usage && (
                                <div className="mt-1">
                                  <code className="text-[#858585] text-xs bg-[#0f0f0f] px-1 rounded">
                                    {tool.usage}
                                  </code>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Usage Instructions */}
                      <div>
                        <h5 className="text-[#cccccc] text-xs font-medium mb-2 flex items-center gap-1">
                          <Terminal className="w-3 h-3" />
                          How to Use
                        </h5>
                        <div className="bg-[#1e1e1e] rounded p-2">
                          <ol className="text-[#858585] text-xs space-y-1 list-decimal list-inside">
                            <li>Activate the agent by clicking the circle icon</li>
                            <li>Open the terminal panel</li>
                            <li>Type the agent command (e.g., <code className="bg-[#0f0f0f] px-1 rounded">{agent.tools[0]?.command}</code>)</li>
                            <li>Follow the prompts to complete your task</li>
                          </ol>
                        </div>
                      </div>

                      {agent.isPremium && (
                        <div className="bg-gradient-to-r from-[#d4af37]/5 to-transparent border border-[#d4af37]/20 rounded p-2">
                          <div className="flex items-center gap-2 text-[#d4af37] text-xs">
                            <Crown className="w-3 h-3" />
                            Premium features include advanced AI capabilities and priority processing
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[#454545]">
        <div className="flex items-center justify-between text-xs">
          <div className="text-[#858585]">
            {activeAgents.size} of {agents.length} agents active
          </div>
          <div className="flex items-center gap-1 text-[#858585]">
            <Info className="w-3 h-3" />
            Use agents via terminal
          </div>
        </div>
        
        {activeAgents.size > 0 && (
          <div className="mt-2 text-xs text-[#4ec9b0]">
            ✓ Agents ready - access their tools in the terminal
          </div>
        )}
      </div>
    </div>
  );
}
