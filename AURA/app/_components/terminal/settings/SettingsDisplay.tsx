// SETTINGS TAB - Terminal settings and configuration
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/settings/SettingsDisplay.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";
import { useTerminal } from "@/lib/hooks";
import { Settings } from "lucide-react";

export function SettingsDisplay() {
  const { clearAlerts } = useTerminalStore();
  const { terminals } = useTerminal();

  return (
    <div className="flex-1 bg-[#0e0e0e] p-3">
      <div className="text-xs text-white mb-4 flex items-center">
        <Settings className="w-3 h-3 mr-2" />
        Terminal Settings
      </div>
      
      <div className="space-y-4">
        {/* Terminal Management */}
        <div>
          <div className="text-xs text-[#cccccc] mb-2">Terminal Management</div>
          <div className="text-xs text-[#858585] mb-2">
            Active terminals: {terminals?.size || 0}
          </div>
          <div className="space-y-2">
            <div className="text-xs text-[#858585] mb-2">
              Command history is now managed automatically and stored in the cloud.
            </div>
            <button
              className="text-xs bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3 py-1 rounded block"
              onClick={() => {
                if (confirm('Clear all alerts?')) {
                  clearAlerts();
                }
              }}
            >
              Clear All Alerts
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <div className="text-xs text-[#cccccc] mb-2">Appearance</div>
          <div className="text-xs text-[#858585]">
            Theme and display options (Coming Soon)
          </div>
        </div>

        {/* Advanced */}
        <div>
          <div className="text-xs text-[#cccccc] mb-2">Advanced</div>
          <div className="text-xs text-[#858585]">
            Advanced terminal configuration (Coming Soon)
          </div>
        </div>
      </div>
    </div>
  );
}
