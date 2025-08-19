// AGENT SYSTEM INITIALIZER - Initialize agents on app startup
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/AgentInitializer.tsx

"use client";

import { useEffect } from "react";
import { initializeAgents } from "@/lib/agents";

export function AgentInitializer() {
  useEffect(() => {
    // Initialize the agent system on client-side mount
    try {
      initializeAgents();
    } catch (error) {
      console.error("Failed to initialize agent system:", error);
    }
  }, []);

  // This component renders nothing but initializes the agent system
  return null;
}
