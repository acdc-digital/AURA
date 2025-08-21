// ADVANCED TERMINAL DISPLAY - Full-featured terminal with command processing
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/AdvancedTerminalDisplay.tsx

"use client";

import { useTerminal } from "@/lib/hooks";
import { useTerminalStore } from "@/lib/store/terminal";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

interface AdvancedTerminalDisplayProps {
  terminalId: string;
}

export function AdvancedTerminalDisplay({ terminalId }: AdvancedTerminalDisplayProps) {
  const { isAuthenticated } = useConvexAuth();
  const { saveCommand } = useTerminal();
  
  const {
    terminals,
    commandHistory,
    addToBuffer,
    clearBuffer,
    setProcessing,
    addToHistory,
  } = useTerminalStore();
  
  const terminal = terminals.get(terminalId);
  
  // Input state
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminal?.buffer]);
  
  // Focus input when terminal becomes active
  useEffect(() => {
    if (isAuthenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuthenticated, terminalId]);

  // Command processor - simulated for now, will be enhanced with real execution
  const processCommand = useCallback(async (command: string) => {
    if (!terminal) return;
    
    const startTime = Date.now();
    
    try {
      setProcessing(terminalId, true);
      
      // Add command to buffer with prompt
      addToBuffer(terminalId, `${terminal.currentDirectory} $ ${command}`);
      
      // Simulate command processing
      let output = "";
      let exitCode = 0;
      
      // Built-in commands
      if (command === "clear") {
        clearBuffer(terminalId);
        return;
      } else if (command === "help") {
        output = `AURA Terminal Commands:
  help     - Show this help message
  clear    - Clear terminal buffer
  pwd      - Show current directory
  ls       - List directory contents
  history  - Show command history
  whoami   - Show current user
  date     - Show current date/time`;
      } else if (command === "pwd") {
        output = terminal.currentDirectory;
      } else if (command === "ls") {
        output = "file1.txt  file2.js  project/  README.md";
      } else if (command === "history") {
        output = commandHistory.slice(-10).map((cmd, i) => `${commandHistory.length - 10 + i + 1}  ${cmd}`).join("\n");
      } else if (command === "whoami") {
        output = isAuthenticated ? "authenticated-user" : "anonymous";
      } else if (command === "date") {
        output = new Date().toString();
      } else if (command.startsWith("echo ")) {
        output = command.substring(5);
      } else if (command.trim() === "") {
        // Empty command, just show prompt
        return;
      } else {
        // Unknown command
        output = `Command not found: ${command}`;
        exitCode = 127;
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
      
      // Add output to buffer
      if (output) {
        addToBuffer(terminalId, output);
      }
      
      // Save command to history and Convex
      const duration = Date.now() - startTime;
      addToHistory(command);
      
      if (isAuthenticated) {
        await saveCommand(terminalId, {
          input: command,
          output,
          exitCode,
          workingDirectory: terminal.currentDirectory,
          duration,
          timestamp: Date.now(),
        });
      }
      
    } catch (error) {
      console.error("Command processing error:", error);
      addToBuffer(terminalId, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(terminalId, false);
    }
  }, [terminal, terminalId, commandHistory, addToBuffer, clearBuffer, setProcessing, addToHistory, saveCommand, isAuthenticated]);

  const handleKeyDown = useCallback(async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      if (input.trim()) {
        await processCommand(input.trim());
      }
      
      setInput("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex] || "");
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // TODO: Implement command/file autocompletion
    } else if (e.metaKey && e.key === "k") {
      e.preventDefault();
      clearBuffer(terminalId);
    }
  }, [input, commandHistory, historyIndex, processCommand, clearBuffer, terminalId]);

  if (!terminal) {
    return (
      <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-xs text-[#858585]">Terminal not found</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-xs text-[#858585]">Please sign in to use the terminal</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="text-xs text-[#cccccc] font-medium">{terminal.title}</div>
          {terminal.isProcessing && (
            <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-[#858585]">{terminal.currentDirectory}</div>
          <div className="text-xs text-[#858585]">
            {terminal.process.status === 'idle' ? 'Ready' : terminal.process.status}
          </div>
        </div>
      </div>
      
      {/* Terminal output */}
      <div 
        ref={outputRef}
        className="flex-1 p-3 overflow-auto font-mono text-xs leading-relaxed"
      >
        {terminal.buffer.map((line, index) => (
          <div key={index} className="text-[#cccccc] whitespace-pre-wrap">
            {line}
          </div>
        ))}
        
        {/* Current input line */}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-[#0ea5e9] font-medium">
            {terminal.currentDirectory} $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#cccccc] outline-none font-mono"
            placeholder="Type a command..."
            disabled={terminal.isProcessing}
          />
          {terminal.isProcessing && (
            <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin" />
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="px-3 py-1 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-[#858585] bg-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>Commands: {commandHistory.length}</span>
          <span>Lines: {terminal.buffer.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>⌘K to clear</span>
          <span>↑↓ for history</span>
        </div>
      </div>
    </div>
  );
}
