// ALERTS TAB - Alert display and management
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/alerts/AlertsDisplay.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";
import { X } from "lucide-react";

export function AlertsDisplay() {
  const { alerts, removeAlert, clearAlerts } = useTerminalStore();

  return (
    <div className="flex-1 bg-[#0e0e0e] p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-white">System Alerts</div>
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="text-xs text-[#858585] hover:text-white hover:bg-[#ffffff10] px-2 py-1 rounded"
          >
            Clear All
          </button>
        )}
      </div>
      
      {alerts.length === 0 ? (
        <div className="text-xs text-[#858585]">No alerts</div>
      ) : (
        <div className="space-y-2 max-h-full overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border-l-4 relative ${
                alert.level === 'error' ? 'border-red-500 bg-red-500/10' :
                alert.level === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                'border-blue-500 bg-blue-500/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{alert.title}</div>
                  <div className="text-xs text-[#cccccc] mt-1">{alert.message}</div>
                  <div className="text-xs text-[#858585] mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-[#858585] hover:text-white p-1 hover:bg-[#ffffff10] rounded"
                  title="Dismiss alert"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
