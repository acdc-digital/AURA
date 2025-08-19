// AGENT TERMINAL INTEGRATION - Enhanced terminal with agent command support
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/AgentTerminal.tsx

"use client";

import { useState, useEffect, useRef, KeyboardEvent, useMemo } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { agentRegistry, useAgentStore, type ConvexMutations } from "@/lib/agents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, Loader2, Terminal as TerminalIcon } from "lucide-react";
import { nanoid } from "nanoid";
import type { Id } from "@/convex/_generated/dataModel";

interface Message {
  _id: string;
  role: "user" | "assistant" | "system" | "terminal" | "thinking";
  content: string;
  createdAt: number;
  operation?: {
    type: string;
    details?: Record<string, unknown>;
  };
  interactiveComponent?: {
    type: string;
    data?: Record<string, unknown>;
    status: "pending" | "completed" | "cancelled";
    result?: Record<string, unknown>;
  };
}

export function AgentTerminal() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => nanoid());
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Agent store
  const { 
    activeAgents,
    agentToolsMode,
    setAgentToolsMode,
    setExecuting,
    addExecutionHistory,
    getActiveAgents
  } = useAgentStore();

  // Convex hooks
  const addMessage = useMutation(api.chat.addMessage);
  const updateMessage = useMutation(api.chat.updateMessage);
  const messages = useQuery(api.chat.getMessages, { sessionId, limit: 50 }) || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (isAuthenticated) {
      inputRef.current?.focus();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !isAuthenticated || !user) return;

    const userInput = input.trim();
    setInput("");
    setIsExecuting(true);

    try {
      // Add user message
      await addMessage({
        role: "user",
        content: userInput,
        sessionId,
        userId: user.id,
      });

      // Check if input is an agent command
      if (userInput.startsWith("/")) {
        await handleAgentCommand(userInput);
      } else if (userInput === "/help" || userInput === "/") {
        await showAvailableCommands();
      } else {
        // Regular terminal command or chat
        await addMessage({
          role: "assistant",
          content: `Command not recognized: ${userInput}. Type \`/\` to see available commands.`,
          sessionId,
          userId: user.id,
        });
      }
    } catch (error) {
      console.error("Terminal execution error:", error);
      await addMessage({
        role: "system",
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        sessionId,
        userId: user.id,
        operation: {
          type: "error",
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAgentCommand = async (command: string) => {
    if (!user) return;

    const [cmd] = command.split(" ");
    
    // Check if command exists in registry
    if (!agentRegistry.hasCommand(cmd)) {
      await addMessage({
        role: "assistant",
        content: `Unknown command: \`${cmd}\`. Type \`/\` to see available commands.`,
        sessionId,
        userId: user.id,
      });
      return;
    }

    const agent = agentRegistry.getAgentByCommand(cmd);
    if (!agent) return;

    // Check if agent is active
    if (!activeAgents.has(agent.id)) {
      await addMessage({
        role: "assistant",
        content: `🚫 Agent "${agent.name}" is not active. Please activate it in the Agents panel first.`,
        sessionId,
        userId: user.id,
      });
      return;
    }

    setExecuting(true, { agentId: agent.id, command: cmd });

    try {
      // Create mutations object for agent
      const mutations = {
        createProject: async (args: any) => {
          // This would call the actual Convex mutation
          // For now, just log
          console.log("Create project:", args);
          return "proj_123" as any;
        },
        createFile: async (args: any) => {
          console.log("Create file:", args);
          return "file_123" as any;
        },
        updateFile: async (args: any) => {
          console.log("Update file:", args);
        },
        addChatMessage: async (args: any) => {
          return await addMessage({
            ...args,
            sessionId,
            userId: user.id,
          });
        },
        updateChatMessage: async (args: any) => {
          return await updateMessage(args);
        },
        updateAgentProgress: async (args: any) => {
          console.log("Update agent progress:", args);
        },
      };

      // Execute the agent command
      const tool = agent.getTool(cmd);
      if (!tool) {
        throw new Error(`Tool not found: ${cmd}`);
      }

      const inputText = command.substring(cmd.length).trim();
      const result = await agent.execute(tool, inputText, mutations, {
        sessionId,
        userId: user.id,
      });

      // Add to execution history
      addExecutionHistory({
        agentId: agent.id,
        command: cmd,
        input: inputText,
        result: {
          success: result.success,
          message: result.message,
        },
      });

      // If execution was not successful and no message was added by agent, add error message
      if (!result.success) {
        await addMessage({
          role: "system",
          content: `❌ ${result.message}`,
          sessionId,
          userId: user.id,
          operation: {
            type: "error",
            details: { agentId: agent.id, command: cmd, error: result.message }
          }
        });
      }

    } catch (error) {
      console.error(`Agent execution error (${cmd}):`, error);
      
      await addMessage({
        role: "system",
        content: `❌ Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sessionId,
        userId: user.id,
        operation: {
          type: "error",
          details: { agentId: agent.id, command: cmd, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });

      addExecutionHistory({
        agentId: agent.id,
        command: cmd,
        input: command.substring(cmd.length).trim(),
        result: {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setExecuting(false);
    }
  };

  const showAvailableCommands = async () => {
    if (!user) return;

    const activeAgentsList = getActiveAgents();
    const allCommands = agentRegistry.getAllCommands();
    
    let content = "🤖 **Available Commands**\n\n";
    
    if (activeAgentsList.length === 0) {
      content += "⚠️ No agents are currently active. Activate agents in the Agents panel to use their tools.\n\n";
      content += "**All Available Commands:**\n";
      allCommands.forEach(cmd => {
        const agent = agentRegistry.getAgentByCommand(cmd);
        const tool = agent?.getTool(cmd);
        if (agent && tool) {
          content += `• \`${cmd}\` - ${tool.description} (${agent.name})\n`;
        }
      });
    } else {
      content += "**Active Agent Commands:**\n";
      activeAgentsList.forEach(agent => {
        content += `\n**${agent.icon} ${agent.name}**\n`;
        agent.tools.forEach(tool => {
          content += `• \`${tool.command}\` - ${tool.description}\n`;
          if (tool.usage) {
            content += `  Usage: \`${tool.usage}\`\n`;
          }
        });
      });
    }

    content += "\n💡 **Tips:**\n";
    content += "• Type `/` to see this help\n";
    content += "• Activate agents in the Agents panel (🤖 icon)\n";
    content += "• Use natural language with agent commands";

    await addMessage({
      role: "system",
      content,
      sessionId,
      userId: user.id,
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  const getMessageIcon = (message: Message) => {
    switch (message.role) {
      case "user":
        return "👤";
      case "assistant":
        return "🤖";
      case "system":
        return "⚙️";
      case "terminal":
        return "💻";
      case "thinking":
        return "🤔";
      default:
        return "•";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-center text-[#858585]">
          <TerminalIcon className="w-8 h-8 mx-auto mb-2" />
          <p>Sign in to access the agent terminal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] flex-shrink-0 bg-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[#cccccc]" />
          <span className="text-xs text-[#cccccc]">Agent Terminal</span>
          {activeAgents.size > 0 && (
            <Badge variant="secondary" className="bg-[#4ec9b0] text-[#1e1e1e] text-xs">
              {activeAgents.size} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAgentToolsMode(!agentToolsMode)}
            className={`h-6 px-2 text-xs ${
              agentToolsMode 
                ? 'bg-[#007acc] text-white' 
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <Bot className="w-3 h-3 mr-1" />
            Agent Tools
          </Button>
          
          {isExecuting && (
            <div className="flex items-center gap-1 text-[#4ec9b0] text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Executing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-[#858585] text-sm py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-[#454545]" />
            <p className="mb-2">Welcome to the Agent Terminal!</p>
            <p>Type <code className="bg-[#2d2d2d] px-2 py-1 rounded text-[#4ec9b0]">/</code> to see available commands</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <span className="text-sm">{getMessageIcon(message)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#858585] capitalize">
                    {message.role}
                  </span>
                  <span className="text-xs text-[#6c6c6c]">
                    {formatTimestamp(message.createdAt)}
                  </span>
                  {message.operation && (
                    <Badge variant="outline" className="text-xs border-[#454545] text-[#858585]">
                      {message.operation.type.replace("_", " ")}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-[#cccccc] whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#1f1f1f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#858585] font-mono">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a command or message..."
            className="flex-1 bg-transparent text-sm text-[#cccccc] outline-none placeholder:text-[#6a6a6a] font-mono"
            disabled={isExecuting}
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!input.trim() || isExecuting}
            className="h-8 w-8 p-0 text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
