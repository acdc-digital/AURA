// Real Terminal Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/terminal/_components/realTerminal.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';

interface TerminalCommand {
  id: string;
  input: string;
  output: string;
  timestamp: Date;
  isLoading: boolean;
}

interface RealTerminalProps {
  className?: string;
}

export function RealTerminal({ className = '' }: RealTerminalProps) {
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('~/Projects/EAC');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new commands are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commands]);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Focus input when clicking anywhere in the terminal
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Execute command via API or direct execution
  const executeCommand = async (command: string): Promise<string> => {
    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, cwd: currentDirectory }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update current directory if it changed
      if (data.cwd) {
        setCurrentDirectory(data.cwd);
      }
      
      return data.output || '';
    } catch (error) {
      console.error('Error executing command:', error);
      // Fallback to mock responses for common commands
      return getMockResponse(command);
    }
  };

  // Mock responses for common commands when API is not available
  const getMockResponse = (command: string): string => {
    const cmd = command.trim().toLowerCase();
    
    if (cmd === 'ls' || cmd === 'dir') {
      return `total 8
drwxr-xr-x  12 user  staff   384 Jan 10 14:30 .
drwxr-xr-x   8 user  staff   256 Jan 10 14:30 ..
-rw-r--r--   1 user  staff    12 Jan 10 14:30 .gitignore
drwxr-xr-x   4 user  staff   128 Jan 10 14:30 convex
drwxr-xr-x   3 user  staff    96 Jan 10 14:30 docs
drwxr-xr-x  10 user  staff   320 Jan 10 14:30 eac
-rw-r--r--   1 user  staff  1084 Jan 10 14:30 LICENSE
-rw-r--r--   1 user  staff   423 Jan 10 14:30 package.json
-rw-r--r--   1 user  staff    85 Jan 10 14:30 pnpm-workspace.yaml
-rw-r--r--   1 user  staff  2156 Jan 10 14:30 README.md`;
    }
    
    if (cmd === 'pwd') {
      return currentDirectory;
    }
    
    if (cmd.startsWith('cd ')) {
      const targetDir = cmd.substring(3).trim();
      if (targetDir === '..') {
        return '';
      }
      return '';
    }
    
    if (cmd === 'clear') {
      return 'CLEAR_TERMINAL';
    }
    
    if (cmd === 'whoami') {
      return 'matthewsimon';
    }
    
    if (cmd === 'date') {
      return new Date().toString();
    }
    
    if (cmd.startsWith('echo ')) {
      return cmd.substring(5);
    }
    
    if (cmd === 'help') {
      return `Available commands:
  ls, dir    - List directory contents
  pwd        - Show current directory
  cd <dir>   - Change directory
  clear      - Clear terminal
  whoami     - Show current user
  date       - Show current date
  echo <msg> - Echo a message
  help       - Show this help message
  
Terminal API integration available for full command execution.`;
    }
    
    // Default response for unknown commands
    return `zsh: command not found: ${command}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    const input = currentInput.trim();
    const commandId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Add command to history with loading state
    const newCommand: TerminalCommand = {
      id: commandId,
      input,
      output: '',
      timestamp: new Date(),
      isLoading: true
    };
    
    setCommands(prev => [...prev, newCommand]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      const output = await executeCommand(input);
      
      // Handle clear command
      if (output === 'CLEAR_TERMINAL') {
        setCommands([]);
        setIsLoading(false);
        return;
      }
      
      // Update command with output
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, output, isLoading: false }
            : cmd
        )
      );
    } catch (error) {
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, output: `Error: ${error}`, isLoading: false }
            : cmd
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      // Ctrl+C to cancel current command
      if (isLoading) {
        setIsLoading(false);
        setCommands(prev => 
          prev.map(cmd => 
            cmd.isLoading 
              ? { ...cmd, output: '^C', isLoading: false }
              : cmd
          )
        );
      }
    }
  };

  return (
    <div 
      className={`flex flex-col h-full bg-[#0e0e0e] ${className}`}
      onClick={handleTerminalClick}
    >
      {/* Terminal Header */}
      <div className="text-[#4ec9b0] text-xs p-2 border-b border-[#2d2d2d] bg-[#181818]">
        <div>EAC Terminal - {currentDirectory}</div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs text-[#cccccc] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Welcome Message */}
        <div className="text-[#858585] mb-2">
          <div>Welcome to EAC Terminal</div>
          <div>Type &apos;help&apos; for available commands</div>
        </div>

        {/* Command History */}
        {commands.map((command) => (
          <div key={command.id} className="mb-2">
            {/* Command Input */}
            <div className="flex items-center">
              <span className="text-[#4ec9b0] mr-2">$</span>
              <span className="text-[#cccccc]">{command.input}</span>
            </div>
            
            {/* Command Output */}
            {command.isLoading ? (
              <div className="text-[#858585] ml-4 animate-pulse">
                executing...
              </div>
            ) : command.output ? (
              <div className="text-[#cccccc] ml-4 whitespace-pre-line">
                {command.output}
              </div>
            ) : null}
          </div>
        ))}

        {/* Current Input Line */}
        <div className="flex items-center">
          <span className="text-[#4ec9b0] mr-2">$</span>
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-[#cccccc] outline-none border-none"
              placeholder="Type command here..."
              aria-label="Terminal command input"
              disabled={isLoading}
            />
          </form>
        </div>
      </div>
    </div>
  );
} 