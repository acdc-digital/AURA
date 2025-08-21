// TERMINAL STORE - Terminal panel state management with multi-terminal support
// /Users/matthewsimon/Projects/AURA/AURA/lib/store/terminal.ts

import { create } from "zustand";

interface Alert {
  id: string;
  title: string;
  message: string;
  level: "info" | "warning" | "error";
  timestamp: number;
}

interface Terminal {
  id: string;
  title: string;
  buffer: string[];
  cursorPosition: number;
  isProcessing: boolean;
  lastActivity: number;
  currentDirectory: string;
  process: {
    pid?: number;
    command?: string;
    status: "idle" | "running" | "completed" | "error";
  };
}

interface TerminalState {
  // Panel state
  isCollapsed: boolean;
  activeTab: "terminal" | "history" | "alerts";
  size: number;

  // Multi-terminal support
  terminals: Map<string, Terminal>;
  activeTerminalId: string | null;
  commandHistory: string[]; // Global command history
  isProcessing: boolean; // Any terminal processing

  // Alerts
  alerts: Alert[];

  // Actions - Panel management
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  setActiveTab: (tab: "terminal" | "history" | "alerts") => void;
  setSize: (size: number) => void;

  // Actions - Terminal management
  createTerminal: (id?: string, title?: string) => string;
  removeTerminal: (id: string) => void;
  setActiveTerminal: (id: string) => void;
  updateTerminal: (id: string, updates: Partial<Terminal>) => void;
  addToBuffer: (id: string, content: string) => void;
  clearBuffer: (id: string) => void;
  setProcessing: (id: string, isProcessing: boolean) => void;

  // Actions - Command history
  addToHistory: (command: string) => void;
  clearHistory: () => void;

  // Actions - Alerts
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => void;
  clearAlerts: () => void;
  removeAlert: (id: string) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  // Initial state
  isCollapsed: true,
  activeTab: "terminal",
  size: 40,

  // Multi-terminal state
  terminals: new Map(),
  activeTerminalId: null,
  commandHistory: [],
  isProcessing: false,

  // Alerts
  alerts: [],

  // Panel actions
  setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),

  toggleCollapse: () =>
    set((state: TerminalState) => ({
      isCollapsed: !state.isCollapsed,
      // Reset to terminal tab when opening
      activeTab: !state.isCollapsed ? state.activeTab : "terminal",
    })),

  setActiveTab: (tab: "terminal" | "history" | "alerts") =>
    set({ activeTab: tab }),

  setSize: (size: number) => set({ size }),

  // Terminal management actions
  createTerminal: (id?: string, title?: string) => {
    const terminalId =
      id ?? `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const terminal: Terminal = {
      id: terminalId,
      title: title ?? `Terminal ${get().terminals.size + 1}`,
      buffer: [`Welcome to AURA Terminal (${terminalId})`],
      cursorPosition: 0,
      isProcessing: false,
      lastActivity: Date.now(),
      currentDirectory: "~",
      process: {
        status: "idle",
      },
    };

    set((state) => {
      const newTerminals = new Map(state.terminals);
      newTerminals.set(terminalId, terminal);

      return {
        terminals: newTerminals,
        activeTerminalId: state.activeTerminalId ?? terminalId, // Set as active if no other active terminal
      };
    });

    return terminalId;
  },

  removeTerminal: (id: string) =>
    set((state) => {
      const newTerminals = new Map(state.terminals);
      newTerminals.delete(id);

      // If this was the active terminal, switch to another one
      let newActiveId = state.activeTerminalId;
      if (state.activeTerminalId === id) {
        const remaining = Array.from(newTerminals.keys());
        newActiveId = remaining.length > 0 ? remaining[0] : null;
      }

      return {
        terminals: newTerminals,
        activeTerminalId: newActiveId,
      };
    }),

  setActiveTerminal: (id: string) =>
    set((state) => {
      // Only set if terminal exists
      if (state.terminals.has(id)) {
        return { activeTerminalId: id };
      }
      return {};
    }),

  updateTerminal: (id: string, updates: Partial<Terminal>) =>
    set((state) => {
      const terminal = state.terminals.get(id);
      if (!terminal) return {};

      const newTerminals = new Map(state.terminals);
      newTerminals.set(id, {
        ...terminal,
        ...updates,
        lastActivity: Date.now(),
      });

      return { terminals: newTerminals };
    }),

  addToBuffer: (id: string, content: string) =>
    set((state) => {
      const terminal = state.terminals.get(id);
      if (!terminal) return {};

      const newBuffer = [...terminal.buffer, content];

      // Trim buffer if it gets too large (performance optimization)
      if (newBuffer.length > 10000) {
        newBuffer.splice(0, newBuffer.length - 8000); // Keep recent 8000 lines
      }

      const newTerminals = new Map(state.terminals);
      newTerminals.set(id, {
        ...terminal,
        buffer: newBuffer,
        lastActivity: Date.now(),
      });

      return { terminals: newTerminals };
    }),

  clearBuffer: (id: string) =>
    set((state) => {
      const terminal = state.terminals.get(id);
      if (!terminal) return {};

      const newTerminals = new Map(state.terminals);
      newTerminals.set(id, {
        ...terminal,
        buffer: [`Terminal cleared (${id})`],
        lastActivity: Date.now(),
      });

      return { terminals: newTerminals };
    }),

  setProcessing: (id: string, isProcessing: boolean) =>
    set((state) => {
      const terminal = state.terminals.get(id);
      if (!terminal) return {};

      const newTerminals = new Map(state.terminals);
      newTerminals.set(id, {
        ...terminal,
        isProcessing,
        lastActivity: Date.now(),
      });

      // Update global processing state
      const globalProcessing = Array.from(newTerminals.values()).some(
        (t) => t.isProcessing,
      );

      return {
        terminals: newTerminals,
        isProcessing: globalProcessing,
      };
    }),

  // Command history actions
  addToHistory: (command: string) =>
    set((state) => {
      const newHistory = [...state.commandHistory, command];

      // Limit history size
      if (newHistory.length > 1000) {
        newHistory.splice(0, newHistory.length - 800); // Keep recent 800 commands
      }

      return { commandHistory: newHistory };
    }),

  clearHistory: () => set({ commandHistory: [] }),

  // Alert actions
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    set((state: TerminalState) => ({
      alerts: [...state.alerts, newAlert],
    }));
  },

  clearAlerts: () => set({ alerts: [] }),

  removeAlert: (id: string) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),
}));
