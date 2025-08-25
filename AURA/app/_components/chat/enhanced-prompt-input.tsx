// ENHANCED PROMPT INPUT - Professional terminal-styled AI input with auto-resize and toolbar
// /Users/matthewsimon/Projects/AURA/AURA/components/ai/enhanced-prompt-input.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EnhancedPromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  isAtLimit?: boolean
  className?: string
  showToolbar?: boolean
  multiline?: boolean
}

export function EnhancedPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask about your EAC project...",
  disabled = false,
  isLoading = false,
  isAtLimit = false,
  className,
  showToolbar = true,
  multiline = true,
}: EnhancedPromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 200) // Max 200px height
    textarea.style.height = `${newHeight}px`
    
    // Consider expanded if more than 2 lines (40px = 2 lines at 20px each)
    setIsExpanded(newHeight > 40)
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  // Handle key combinations
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (value.trim() && !disabled && !isLoading) {
        onSubmit(value)
      }
      return
    }

    // Enter behavior based on multiline setting
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter always creates a new line (don't prevent default)
        return
      } else {
        // Enter without Shift submits
        e.preventDefault()
        if (value.trim() && !disabled && !isLoading) {
          onSubmit(value)
        }
      }
    }

    // Escape to clear
    if (e.key === 'Escape') {
      onChange('')
      const textarea = textareaRef.current
      if (textarea) {
        textarea.blur()
      }
    }
  }

  // Handle submit button click
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled && !isLoading) {
      onSubmit(value)
    }
  }

  // Dynamic placeholder based on state
  const getPlaceholder = () => {
    if (isAtLimit) return "Session limit reached - Start new session to continue..."
    if (isLoading) return "AI is thinking..."
    return placeholder
  }

  // Dynamic text color based on state
  const getTextColor = () => {
    if (isAtLimit) return 'text-[#f48771]' // Red for limit
    return 'text-[#cccccc]' // Default terminal text
  }

  return (
    <div className={cn("bg-[#0e0e0e] font-mono text-xs", className)}>
      {/* Toolbar - only show when expanded or explicitly enabled */}
      {showToolbar && isExpanded && (
        <div className="flex items-center justify-between px-2 py-1 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <span className="text-[#858585] text-xs">
              {multiline ? 'Shift+Enter for new line, Enter to send' : 'Enter to send'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#858585] text-xs">
              {value.length} chars
            </span>
          </div>
        </div>
      )}

      {/* Input container */}
      <div className="flex items-start p-1">
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                disabled={disabled || isLoading || isAtLimit}
                rows={1}
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none overflow-hidden",
                  "placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed",
                  "caret-[#cccccc] leading-tight min-h-[20px]",
                  getTextColor()
                )}
              />
            </div>
            
            {/* Submit button - only show when there's content */}
            {value.trim() && (
              <Button
                type="submit"
                size="sm"
                disabled={disabled || isLoading || isAtLimit}
                className={cn(
                  "h-6 px-2 text-xs font-mono bg-[#007acc] hover:bg-[#005a9e] text-white",
                  "disabled:bg-[#333] disabled:text-[#858585] disabled:cursor-not-allowed",
                  "transition-all duration-200 flex-shrink-0"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                    <span>Send</span>
                  </div>
                ) : (
                  'Send'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Status bar - show helpful info */}
      {(isLoading || isAtLimit) && (
        <div className="px-2 pb-2">
          <div className="flex items-center gap-2 text-[#858585] text-xs">
            {isLoading && (
              <>
                <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing your request...</span>
              </>
            )}
            {isAtLimit && (
              <>
                <span className="text-[#f48771]">⚠</span>
                <span className="text-[#f48771]">Session limit reached</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedPromptInput
