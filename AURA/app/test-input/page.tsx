// TEST INPUT COMPONENT - Test enhanced prompt input with Shift+Enter functionality
// /Users/matthewsimon/Projects/AURA/AURA/app/test-input/page.tsx

"use client"

import { EnhancedPromptInput } from '@/components/ai/enhanced-prompt-input'
import { useState } from 'react'

export default function TestInputPage() {
  const [message, setMessage] = useState('')
  const [submissions, setSubmissions] = useState<string[]>([])

  const handleSubmit = (value: string) => {
    console.log('Submitted:', value)
    setSubmissions(prev => [...prev, value])
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#cccccc] p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-mono text-[#007acc]">Enhanced Input Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-mono text-[#4ec9b0] mb-2">Instructions:</h2>
            <ul className="text-sm font-mono text-[#858585] space-y-1">
              <li>• Type some text</li>
              <li>• Press <span className="text-[#007acc]">Enter</span> to submit</li>
              <li>• Press <span className="text-[#007acc]">Shift+Enter</span> to create new line</li>
              <li>• Press <span className="text-[#007acc]">Ctrl/Cmd+Enter</span> to force submit</li>
              <li>• Press <span className="text-[#007acc]">Escape</span> to clear</li>
            </ul>
          </div>

          <div className="border border-[#333] rounded-lg overflow-hidden">
            <EnhancedPromptInput
              value={message}
              onChange={setMessage}
              onSubmit={handleSubmit}
              placeholder="Type your message here..."
              showToolbar={true}
              multiline={true}
            />
          </div>

          {submissions.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-mono text-[#4ec9b0]">Submissions:</h2>
              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 max-h-60 overflow-y-auto">
                {submissions.map((submission, index) => (
                  <div key={index} className="font-mono text-sm mb-2 last:mb-0">
                    <span className="text-[#858585]">{index + 1}:</span>
                    <pre className="text-[#cccccc] mt-1 whitespace-pre-wrap">{submission}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
