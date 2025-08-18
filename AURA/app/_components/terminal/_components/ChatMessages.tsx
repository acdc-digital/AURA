// CHAT MESSAGES - Terminal chat interface
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/ChatMessages.tsx

"use client";

export function ChatMessages() {
  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#1f1f1f] flex-shrink-0">
        <div className="text-xs text-[#cccccc]">Terminal</div>
        <div className="text-xs text-[#858585]">Ready</div>
      </div>
      
      {/* Chat messages area */}
      <div className="flex-1 p-2 overflow-auto">
        <div className="space-y-2">
          <div className="text-xs text-[#858585]">
            Welcome to AURA Terminal
          </div>
          <div className="text-xs text-[#cccccc]">
            {'>'} _
          </div>
        </div>
      </div>
      
      {/* Input area */}
      <div className="p-2 border-t border-[#1f1f1f] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#858585]">{'>'}</span>
          <input
            type="text"
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-xs text-[#cccccc] outline-none placeholder:text-[#6a6a6a]"
            disabled
          />
        </div>
      </div>
    </div>
  );
}
