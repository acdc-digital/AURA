// TERMINAL COMPONENT - Collapsible bottom panel with terminal interface
// /Users/matthewsimon/Projects/AURA/AURA/components/dashboard/Terminal.tsx

'use client'

import { FC, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, Minimize, Square, ChevronUp, ChevronDown, Terminal as TerminalIcon } from 'lucide-react'

interface TerminalProps {
  isOpen: boolean
  height?: number
  onToggle: () => void
  onHeightChange?: (height: number) => void
}

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: Date
}

export const Terminal: FC<TerminalProps> = ({ 
  isOpen, 
  height = 300, 
  onToggle,
  onHeightChange 
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'AURA Terminal v1.0.0',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'command',
      content: '> npm run dev',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'output',
      content: 'Starting development server...',
      timestamp: new Date()
    }
  ])
  
  const [currentCommand, setCurrentCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleCommand = (command: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: `> ${command}`,
      timestamp: new Date()
    }

    // Add command to history
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    // Simulate command execution
    const outputLine: TerminalLine = {
      id: (Date.now() + 1).toString(),
      type: 'output',
      content: `Command executed: ${command}`,
      timestamp: new Date()
    }

    setLines(prev => [...prev, newLine, outputLine])
    setCurrentCommand('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (currentCommand.trim()) {
        handleCommand(currentCommand.trim())
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-[#569cd6]'  // Blue for commands
      case 'error': return 'text-[#f48771]'    // Red for errors
      default: return 'text-[#cccccc]'         // Default for output
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "fixed bottom-0 left-12 right-0 h-8 flex items-center justify-center gap-2",
          "text-[#cccccc] hover:text-white transition-colors text-sm font-medium"
        )}
        style={{ backgroundColor: '#007acc' }}
      >
        <TerminalIcon className="w-4 h-4" />
        Terminal
        <ChevronUp className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div 
      className="fixed bottom-0 left-12 right-0 flex flex-col border-t border-[#2d2d30]"
      style={{ 
        height: `${height}px`,
        backgroundColor: '#1e1e1e'
      }}
    >
      {/* Terminal Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 text-white text-sm font-medium"
        style={{ backgroundColor: '#007acc' }}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          Terminal
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-black/10 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-black/10 rounded transition-colors">
            <Minimize className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-black/10 rounded transition-colors">
            <Square className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-black/10 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-3 font-mono text-sm overflow-auto vscode-scrollbar"
      >
        {lines.map((line) => (
          <div key={line.id} className="flex items-start gap-2 mb-1">
            <span className="text-[#858585] text-xs min-w-[60px]">
              {formatTimestamp(line.timestamp)}
            </span>
            <span className={getLineColor(line.type)}>
              {line.content}
            </span>
          </div>
        ))}
        
        {/* Command Input */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[#858585] text-xs min-w-[60px]">
            {formatTimestamp(new Date())}
          </span>
          <span className="text-[#569cd6]">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#cccccc] outline-none font-mono"
            placeholder="Enter command..."
          />
        </div>
      </div>

      {/* Resize Handle */}
      {onHeightChange && (
        <div 
          className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-[#007acc] transition-colors opacity-0 hover:opacity-100"
          onMouseDown={(e) => {
            e.preventDefault()
            const startY = e.clientY
            const startHeight = height

            const handleMouseMove = (e: MouseEvent) => {
              const deltaY = startY - e.clientY
              const newHeight = Math.max(200, Math.min(600, startHeight + deltaY))
              onHeightChange(newHeight)
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
      )}
    </div>
  )
}
