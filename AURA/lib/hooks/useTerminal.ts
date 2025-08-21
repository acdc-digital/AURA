// TERMINAL HOOKS - Custom hooks for terminal functionality
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/useTerminal.ts

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useRef } from "react";

export interface Terminal {
  id: string;
  title?: string;
  buffer: string[];
  currentDirectory?: string;
  status: "active" | "inactive" | "terminated";
  lastActivity: number;
  createdAt: number;
}

export interface TerminalCommand {
  input: string;
  output?: string;
  exitCode?: number;
  workingDirectory?: string;
  duration?: number;
  timestamp: number;
}

/**
 * Custom hook for managing terminal sessions and commands
 * Follows AURA's state management patterns: Convex for persistence, minimal client state
 */
export function useTerminal() {
  // Convex queries and mutations - provide empty args for queries that don't require them
  const sessions = useQuery(api.terminal.getTerminalSessions, {});
  const saveSessionMutation = useMutation(api.terminal.saveTerminalSession);
  const saveCommandMutation = useMutation(api.terminal.saveTerminalCommand);
  const updateStatusMutation = useMutation(api.terminal.updateTerminalStatus);

  // Save terminal session to Convex
  const saveSession = useCallback(
    async (terminal: Terminal) => {
      try {
        return await saveSessionMutation({
          terminalId: terminal.id,
          buffer: terminal.buffer,
          title: terminal.title,
          currentDirectory: terminal.currentDirectory,
        });
      } catch (error) {
        console.error("Failed to save terminal session:", error);
        throw error;
      }
    },
    [saveSessionMutation],
  );

  // Save command to history
  const saveCommand = useCallback(
    async (terminalId: string, command: TerminalCommand) => {
      try {
        return await saveCommandMutation({
          terminalId,
          input: command.input,
          output: command.output,
          exitCode: command.exitCode,
          workingDirectory: command.workingDirectory,
          duration: command.duration,
        });
      } catch (error) {
        console.error("Failed to save terminal command:", error);
        throw error;
      }
    },
    [saveCommandMutation],
  );

  // Update terminal status
  const updateStatus = useCallback(
    async (
      terminalId: string,
      status: "active" | "inactive" | "terminated",
    ) => {
      try {
        return await updateStatusMutation({
          terminalId,
          status,
        });
      } catch (error) {
        console.error("Failed to update terminal status:", error);
        throw error;
      }
    },
    [updateStatusMutation],
  );

  return {
    // Data
    sessions: sessions ?? [],
    isLoading: sessions === undefined,

    // Actions
    saveSession,
    saveCommand,
    updateStatus,
  };
}

/**
 * Hook for managing terminal command history
 */
export function useTerminalHistory(terminalId?: string) {
  const commands = useQuery(
    api.terminal.getCommandHistory,
    terminalId ? { terminalId, limit: 100 } : { limit: 100 },
  );

  return {
    commands: commands ?? [],
    isLoading: commands === undefined,
  };
}

/**
 * Hook for managing a specific terminal session
 */
export function useTerminalSession(terminalId: string) {
  const session = useQuery(api.terminal.getTerminalSession, { terminalId });
  const saveSessionMutation = useMutation(api.terminal.saveTerminalSession);
  const updateStatusMutation = useMutation(api.terminal.updateTerminalStatus);

  // Terminal buffer management
  const bufferRef = useRef<string[]>([]);
  const sessionRef = useRef<Terminal | null>(null);

  // Initialize from Convex session
  if (session && !sessionRef.current) {
    sessionRef.current = {
      id: session.terminalId,
      title: session.title,
      buffer: session.buffer,
      currentDirectory: session.currentDirectory,
      status: session.status,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
    };
    bufferRef.current = [...session.buffer];
  }

  const addToBuffer = useCallback((line: string) => {
    bufferRef.current.push(line);

    // Trim buffer if it gets too large (performance optimization)
    if (bufferRef.current.length > 10000) {
      bufferRef.current = bufferRef.current.slice(-8000); // Keep recent 8000 lines
    }
  }, []);

  const clearBuffer = useCallback(() => {
    bufferRef.current = [];
  }, []);

  const saveSession = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      return await saveSessionMutation({
        terminalId: sessionRef.current.id,
        buffer: bufferRef.current,
        title: sessionRef.current.title,
        currentDirectory: sessionRef.current.currentDirectory,
      });
    } catch (error) {
      console.error("Failed to save terminal session:", error);
      throw error;
    }
  }, [saveSessionMutation]);

  const updateStatus = useCallback(
    async (status: "active" | "inactive" | "terminated") => {
      try {
        await updateStatusMutation({ terminalId, status });
        if (sessionRef.current) {
          sessionRef.current.status = status;
        }
      } catch (error) {
        console.error("Failed to update terminal status:", error);
        throw error;
      }
    },
    [terminalId, updateStatusMutation],
  );

  return {
    // Data
    session: sessionRef.current,
    buffer: bufferRef.current,
    isLoading: session === undefined,

    // Actions
    addToBuffer,
    clearBuffer,
    saveSession,
    updateStatus,
  };
}
