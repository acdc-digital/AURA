// Editor Component - Main content area with tabs for AURA dashboard
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/dashEditor.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { SignInCard } from "../auth/SignInCard";
import { TerminalTest } from "../terminal/TerminalTest";

export function DashEditor() {
  const { user } = useUser();

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col">
      {/* Tab Bar */}
      <div className="h-[35px] bg-[#2d2d2d] border-b border-[#454545] flex items-center">
        <div className="px-4 text-[#cccccc] text-sm">
          {user ? "Dashboard" : "Welcome"}
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1">
        {user ? (
          <div className="p-8 text-[#cccccc]">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold mb-6">Welcome back, {user.firstName}!</h1>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-[#cccccc]">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-[#2d2d2d] border border-[#454545] rounded hover:bg-[#3e3e3e] transition-colors text-left">
                      <div className="font-medium text-[#cccccc]">New Project</div>
                      <div className="text-sm text-[#858585]">Start a new development project</div>
                    </button>
                    <button className="p-4 bg-[#2d2d2d] border border-[#454545] rounded hover:bg-[#3e3e3e] transition-colors text-left">
                      <div className="font-medium text-[#cccccc]">Open Folder</div>
                      <div className="text-sm text-[#858585]">Import existing code</div>
                    </button>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-[#cccccc]">Recent Activity</h2>
                  <div className="text-[#858585]">
                    <p>No recent activity yet. Start by creating your first project!</p>
                  </div>
                </div>

                {/* Terminal Test Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-[#cccccc]">Terminal Testing</h2>
                  <div className="bg-[#2d2d2d] border border-[#454545] rounded p-4">
                    <TerminalTest />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SignInCard />
        )}
      </div>
    </div>
  );
}