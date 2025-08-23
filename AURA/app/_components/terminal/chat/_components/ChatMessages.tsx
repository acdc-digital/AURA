// CHAT MESSAGES - Terminal chat interface with enhanced input
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/chat/_components/ChatMessages.tsx

"use client";

import { EnhancedPromptInput } from '@/components/ai/enhanced-prompt-input';
import { useState } from 'react';

export function ChatMessages() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate loading
    setIsLoading(true);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant' as const,
        content: `You said: "${messageContent}"\n\nThis is a placeholder response. The enhanced input is working properly with multi-line support!`
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#1f1f1f] flex-shrink-0">
        <div className="text-xs text-[#cccccc]">Terminal Chat</div>
        <div className="text-xs text-[#858585]">
          {isLoading ? 'Processing...' : 'Ready'}
        </div>
      </div>
      
      {/* Chat messages area */}
      <div className="flex-1 p-2 overflow-auto">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-xs text-[#858585] space-y-1">
              <div>Welcome to AURA Terminal Chat</div>
              <div>• Type your message and press Enter to send</div>
              <div>• Press Shift+Enter to create new lines</div>
              <div>• Press Ctrl/Cmd+Enter to force submit</div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="text-xs">
                <div className={`font-mono ${
                  msg.role === 'user'
                    ? 'text-[#007acc]'
                    : 'text-[#4ec9b0]'
                }`}>
                  {msg.role === 'user' ? '$ user:' : '🤖 assistant:'}
                </div>
                <div className="text-[#cccccc] mt-1 whitespace-pre-wrap pl-2">
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-xs">
              <div className="text-[#4ec9b0] font-mono">🤖 assistant:</div>
              <div className="text-[#858585] mt-1 pl-2">thinking...</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Input area */}
      <EnhancedPromptInput
        value={message}
        onChange={setMessage}
        onSubmit={handleSubmit}
        placeholder="Type your message... (Shift+Enter for new line)"
        disabled={isLoading}
        isLoading={isLoading}
        showToolbar={true}
        multiline={true}
        className="flex-shrink-0"
      />
    </div>
  );
}
