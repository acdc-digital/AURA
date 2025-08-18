// TERMINAL TEST COMPONENT - Testing terminal functionality
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/TerminalTest.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";

export function TerminalTest() {
  const { addAlert } = useTerminalStore();

  const handleAddTestAlert = () => {
    addAlert({
      title: "Test Alert",
      message: "This is a test alert to demonstrate the terminal alerts functionality.",
      level: "info"
    });
  };

  const handleAddWarningAlert = () => {
    addAlert({
      title: "Warning Alert",
      message: "This is a warning alert example.",
      level: "warning"
    });
  };

  const handleAddErrorAlert = () => {
    addAlert({
      title: "Error Alert", 
      message: "This is an error alert example.",
      level: "error"
    });
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold text-[#cccccc] mb-4">Terminal Test Controls</h3>
      <div className="space-y-2">
        <button 
          onClick={handleAddTestAlert}
          className="block w-full text-left px-3 py-2 text-xs bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors"
        >
          Add Info Alert
        </button>
        <button 
          onClick={handleAddWarningAlert}
          className="block w-full text-left px-3 py-2 text-xs bg-[#fbbc04] text-black rounded hover:bg-[#ea8600] transition-colors"
        >
          Add Warning Alert  
        </button>
        <button 
          onClick={handleAddErrorAlert}
          className="block w-full text-left px-3 py-2 text-xs bg-[#f28b82] text-black rounded hover:bg-[#e06b5f] transition-colors"
        >
          Add Error Alert
        </button>
      </div>
    </div>
  );
}
