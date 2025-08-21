// Tool Selector Component
// Handles selection between Agents and MCP Tools when user types '/'

"use client";

import { AgentRegistry } from "@/agents/core/registry";
import React, { useEffect, useState } from "react";

interface Tool {
  id: string;
  name: string;
  command: string;
  description: string;
  category: 'agent' | 'mcp';
  icon?: string;
  agent?: string; // For agent tools
}

interface ToolSelectorProps {
  onToolSelect: (command: string) => void;
  onClose: () => void;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function ToolSelector({ onToolSelect, onClose, selectedIndex, onIndexChange }: ToolSelectorProps) {
  const [activeTab, setActiveTab] = useState<'agents' | 'mcp'>('agents');
  const [agentTools, setAgentTools] = useState<Tool[]>([]);
  const [mcpTools, setMcpTools] = useState<Tool[]>([]);

  // Load agent tools
  useEffect(() => {
    const registry = new AgentRegistry();
    const agents = registry.getAllAgents();
    
    const tools: Tool[] = [];
    agents.forEach(agent => {
      // Skip disabled agents using the getDisabledState method
      const disabledState = agent.getDisabledState();
      if (disabledState.disabled) {
        return;
      }
      
      agent.tools.forEach(tool => {
        // Map icon names to emojis
        const iconMap: Record<string, string> = {
          'AtSign': '🐦',
          'FileText': '📄',
          'Bot': '🤖',
          'Settings': '⚙️',
          'Calendar': '📅'
        };
        
        tools.push({
          id: `${agent.id}-${tool.id}`,
          name: tool.name,
          command: tool.command,
          description: tool.description,
          category: 'agent',
          icon: iconMap[agent.icon] || '🔧',
          agent: agent.name
        });
      });
    });
    
    setAgentTools(tools);
  }, []);

  // MCP Tools (placeholder for now)
  useEffect(() => {
    const mcpToolsList: Tool[] = [
      {
        id: 'mcp-help',
        name: 'Help',
        command: '/help',
        description: 'Show available commands and natural language examples',
        category: 'mcp'
      },
      {
        id: 'mcp-clear',
        name: 'Clear',
        command: '/clear',
        description: 'Clear chat history',
        category: 'mcp'
      },
      {
        id: 'mcp-project',
        name: 'Project Info',
        command: '/project',
        description: 'Get project structure and information',
        category: 'mcp'
      },
      {
        id: 'mcp-components',
        name: 'Components',
        command: '/components',
        description: 'List available components',
        category: 'mcp'
      },
      {
        id: 'mcp-stores',
        name: 'State Stores',
        command: '/stores',
        description: 'Analyze state management stores',
        category: 'mcp'
      }
    ];
    
    setMcpTools(mcpToolsList);
  }, []);

  const currentTools = activeTab === 'agents' ? agentTools : mcpTools;

  const handleToolClick = (tool: Tool) => {
    onToolSelect(tool.command);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onIndexChange(selectedIndex < currentTools.length - 1 ? selectedIndex + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onIndexChange(selectedIndex > 0 ? selectedIndex - 1 : currentTools.length - 1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setActiveTab(activeTab === 'agents' ? 'mcp' : 'agents');
      onIndexChange(0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentTools[selectedIndex]) {
        handleToolClick(currentTools[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e as any);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedIndex, activeTab, currentTools]);

  return (
    <div className="bg-[#1e1e1e] border border-[#454545] rounded-md shadow-lg max-h-64 overflow-hidden z-50">
      {/* Tab Headers */}
      <div className="flex border-b border-[#454545]">
        <button
          onClick={() => { setActiveTab('agents'); onIndexChange(0); }}
          className={`
            flex-1 px-3 py-2 text-xs font-medium transition-colors
            ${activeTab === 'agents' 
              ? 'bg-[#007acc] text-white border-b-2 border-[#007acc]' 
              : 'text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white'
            }
          `}
        >
          🤖 Agents ({agentTools.length})
        </button>
        <button
          onClick={() => { setActiveTab('mcp'); onIndexChange(0); }}
          className={`
            flex-1 px-3 py-2 text-xs font-medium transition-colors
            ${activeTab === 'mcp' 
              ? 'bg-[#007acc] text-white border-b-2 border-[#007acc]' 
              : 'text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white'
            }
          `}
        >
          ⚙️ MCP Tools ({mcpTools.length})
        </button>
      </div>

      {/* Tool List */}
      <div className="max-h-48 overflow-y-auto">
        {currentTools.length === 0 ? (
          <div className="px-3 py-4 text-center text-[#858585] text-xs">
            No {activeTab} available
          </div>
        ) : (
          currentTools.map((tool, index) => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className={`
                px-3 py-2 cursor-pointer border-b border-[#2d2d2d] last:border-b-0
                ${index === selectedIndex 
                  ? 'bg-[#007acc] text-white' 
                  : 'hover:bg-[#2d2d2d] text-[#cccccc]'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {tool.icon && (
                  <span className="text-sm">{tool.icon}</span>
                )}
                <div className="flex-1">
                  <div className="font-mono text-xs font-semibold text-[#569cd6]">
                    {tool.command}
                  </div>
                  <div className="text-xs font-medium">
                    {tool.name}
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {tool.description}
                  </div>
                  {tool.agent && (
                    <div className="text-[10px] opacity-60 mt-1">
                      Agent: {tool.agent}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with instructions */}
      <div className="px-3 py-2 border-t border-[#454545] bg-[#0e0e0e]">
        <div className="text-[10px] text-[#858585] font-mono">
          ↑↓ navigate • Tab switch tabs • Enter select • Esc close
        </div>
      </div>
    </div>
  );
}
