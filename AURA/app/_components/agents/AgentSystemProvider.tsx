// AGENT SYSTEM INITIALIZER - Initialize the agent system on app startup
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/agents/AgentSystemProvider.tsx

"use client";

import { useEffect, useRef } from "react";
import { initializeAgents } from "@/lib/agents";

interface AgentSystemProviderProps {
  children: React.ReactNode;
}

export default function AgentSystemProvider({ children }: AgentSystemProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      try {
        initializeAgents();
        initialized.current = true;
        console.log("🤖 Agent system initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize agent system:", error);
      }
    }
  }, []);

  return <>{children}</>;
}
