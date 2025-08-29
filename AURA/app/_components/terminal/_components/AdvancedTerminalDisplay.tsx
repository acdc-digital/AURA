// ADVANCED TERMINAL DISPLAY - Full-featured terminal with command processing and orchestrator chat
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/AdvancedTerminalDisplay.tsx

"use client";

import { useOnboarding, useTerminal, useTerminalSession, useTerminalHistory, useUser } from "@/lib/hooks";
import { useTerminalStore } from "@/lib/store/terminal";
import { useSessionMessages } from "@/lib/hooks/useSessionMessages";
import { useSessionSync } from "@/lib/hooks/useSessionSync";
import { useSessionTokens } from "@/lib/hooks/useSessionTokens";
import { getTokenUsageColor } from "@/lib/utils/tokens";
import { EnhancedPromptInput } from "../../chat";
import { TerminalMessage } from "../chat/_components/TerminalMessage";
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useAction } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SessionsPanel } from "../sessions/SessionsPanel";
import { AgentsPanel } from "../agents/AgentsPanel";
import { ExtensionsPanel } from "../extensions/ExtensionsPanel";
import { useExtensionStore } from "@/lib/extensions/store";
import { useAgentStore } from "@/lib/agents/store";

interface AdvancedTerminalDisplayProps {
  terminalId: string;
}

export function AdvancedTerminalDisplay({ terminalId }: AdvancedTerminalDisplayProps) {
  const { isAuthenticated } = useConvexAuth();
  const sendMessage = useAction(api.orchestrator.sendMessage);
  const sendOnboardingMessage = useAction(api.onboarding.handleOnboardingMessage);
  const sendOnboardingWelcome = useAction(api.onboarding.sendWelcomeMessage);
  const { user } = useUser();
  const sessions = useQuery(api.chat.getUserSessions, user?.clerkId ? { userId: user.clerkId } : "skip");
  
  const {
    formattedMessages,
    rawMessages,
    isLoading: messagesLoading,
    activeSessionId
  } = useSessionMessages();
  const { createSessionWithSync } = useSessionSync(false); // Don't run sync logic here
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboarding();
  
  // Agent and Extension stores for active indicator
  const { selectedExtensionId, getExtensionById } = useExtensionStore();
  const { selectedAgentId } = useAgentStore();
  
  // Helper function to determine currently active agent/extension
  const getActiveAgentInfo = useCallback(() => {
    // Priority order: Onboarding > Selected Extension > Selected Agent > Orchestrator
    if (needsOnboarding && !onboardingLoading) {
      return { name: "Onboarding", type: "agent" };
    }
    
    if (selectedExtensionId) {
      const extension = getExtensionById(selectedExtensionId);
      return {
        name: extension?.name || extension?.id || "Extension",
        type: "extension"
      };
    }
    
    if (selectedAgentId) {
      // You can enhance this by getting agent display name from registry
      return {
        name: selectedAgentId.charAt(0).toUpperCase() + selectedAgentId.slice(1),
        type: "agent"
      };
    }
    
    return { name: "Orchestrator", type: "agent" };
  }, [needsOnboarding, onboardingLoading, selectedExtensionId, selectedAgentId, getExtensionById]);
  
  // Token tracking for active session
  const { totalTokens, formatTokenCount, getUsageStatus } = useSessionTokens(activeSessionId);
  
  // Get terminals and terminal management functions
  const { terminals, saveCommand } = useTerminal();
  
  // Get terminal session with buffer management
  const {
    session: terminalSession,
    addToBuffer,
    clearBuffer,
  } = useTerminalSession(terminalId);
  
  // Get command history
  const { commands: commandHistory } = useTerminalHistory(terminalId);
  
  // Get UI state from store
  const {
    isVoiceMode,
    setProcessing,
    isProcessing,
  } = useTerminalStore();
  
  const terminal = terminals.get(terminalId) || terminalSession;
  
  // Input state
  const [input, setInput] = useState("");
  const [chatMode, setChatMode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'sessions' | 'agents' | 'extensions'>('chat');
  const [hasInitializedOnboarding, setHasInitializedOnboarding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const welcomeMessageSendingRef = useRef(false);

  // Reset onboarding initialization when onboarding status changes
  useEffect(() => {
    if (!needsOnboarding && hasInitializedOnboarding) {
      console.log("🔄 Onboarding completed/skipped, resetting initialization state");
      setHasInitializedOnboarding(false);
    }
  }, [needsOnboarding, hasInitializedOnboarding]);
  
  // Handler for regenerating the last assistant message
  const handleRegenerate = useCallback(async () => {
    if (!isAuthenticated || !activeSessionId) return;
    
    try {
      // Use onboarding handler if user needs onboarding, otherwise use orchestrator
      if (needsOnboarding) {
        await sendOnboardingMessage({
          message: "Please regenerate your last response with a different approach or additional details.",
          sessionId: activeSessionId,
        });
      } else {
        await sendMessage({
          message: "Please regenerate your last response with a different approach or additional details.",
          sessionId: activeSessionId,
        });
      }
    } catch (error) {
      console.error('Failed to regenerate message:', error);
    }
  }, [isAuthenticated, activeSessionId, needsOnboarding, sendMessage, sendOnboardingMessage]);

  // Handler for creating new session
  const handleCreateNewSession = async () => {
    if (!isAuthenticated) return;
    
    try {
      await createSessionWithSync("New Chat Session"); // This will auto-generate title and sync with Convex
      setActiveSubTab('chat'); // Switch to chat tab automatically
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };
  
  // State for auto-scroll
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Detect if streaming is currently active and handle auto-scroll states
  useEffect(() => {
    const streamingAssistant = rawMessages.find(msg =>
      msg.role === 'assistant' && !msg.outputTokens && msg.content
    );
    
    const lastMessage = rawMessages[rawMessages.length - 1];
    const isNewUserMessage = lastMessage?.role === 'user';
    
    const wasStreaming = isStreamingActive;
    const nowStreaming = !!streamingAssistant;
    
    setIsStreamingActive(nowStreaming);
    
    // If streaming just stopped, disable auto-scroll to let user read
    if (wasStreaming && !nowStreaming) {
      console.log('📖 Streaming completed, disabling auto-scroll for reading');
      setIsUserScrolling(true); // Prevent auto-scroll until next user input
    }
    
    // If new user message was added, prepare for next response
    if (isNewUserMessage && !nowStreaming) {
      console.log('💬 New user message detected, enabling auto-scroll for next response');
      setIsUserScrolling(false);
    }
    
    // If new streaming started, ensure auto-scroll is enabled
    if (!wasStreaming && nowStreaming) {
      console.log('🎬 New streaming started, enabling auto-scroll');
      setIsUserScrolling(false);
    }
  }, [rawMessages, isStreamingActive]);

  // Centralized scroll function to ensure consistent behavior and prevent user scroll detection
  const scrollToBottomSafely = useCallback((reason: string) => {
    if (!outputRef.current || isUserScrolling) {
      console.log(`❌ Skipping scroll (${reason}): ${!outputRef.current ? 'no ref' : 'user scrolling'}`);
      return;
    }

    console.log(`⬇️ Scrolling to bottom: ${reason}`);
    setIsProgrammaticScroll(true);
    
    requestAnimationFrame(() => {
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
      // Use double RAF to ensure scroll event is processed before clearing flag
      requestAnimationFrame(() => {
        setIsProgrammaticScroll(false);
      });
    });
  }, [isUserScrolling]);

  // Ensure scroll container is at bottom when first created
  useEffect(() => {
    if (!outputRef.current) return;
    
    const element = outputRef.current;
    
    setIsProgrammaticScroll(true);
    element.scrollTop = element.scrollHeight;
    setTimeout(() => setIsProgrammaticScroll(false), 100);
  }, []); // Run once on mount

  // Debug: Monitor messages for changes
  useEffect(() => {
    console.log('🔍 Messages changed:', {
      count: rawMessages.length,
      messages: rawMessages.map((msg, idx) => ({
        index: idx,
        role: msg.role,
        contentLength: msg.content?.length || 0,
        hasTokens: !!(msg.outputTokens || msg.inputTokens || msg.tokenCount),
        isStreaming: !msg.outputTokens && msg.role === 'assistant',
        contentPreview: msg.content?.slice(0, 50) + (msg.content?.length > 50 ? '...' : '')
      }))
    });

    // Check if any assistant message is actively growing
    const streamingAssistant = rawMessages.find(msg =>
      msg.role === 'assistant' && !msg.outputTokens && msg.content
    );

    if (streamingAssistant) {
      console.log('🎯 Found streaming assistant message:', {
        contentLength: streamingAssistant.content?.length,
        preview: streamingAssistant.content?.slice(-100), // Last 100 chars
        shouldScroll: !isUserScrolling
      });

      // Force scroll for streaming response
      if (!isUserScrolling) {
        scrollToBottomSafely('streaming response detected');
      }
    }
  }, [rawMessages, isUserScrolling, scrollToBottomSafely]);  // Enhanced streaming detection - watch for content changes in assistant messages
  useEffect(() => {
    if (!outputRef.current || isUserScrolling) return;

    // Check if any assistant message is currently streaming (no token counts)
    const hasStreamingMessage = rawMessages.some(msg =>
      msg.role === "assistant" &&
      (msg.tokenCount === undefined || msg.tokenCount === 0) &&
      (msg.inputTokens === undefined || msg.inputTokens === 0) &&
      (msg.outputTokens === undefined || msg.outputTokens === 0)
    );
    
    if (hasStreamingMessage) {
      scrollToBottomSafely('streaming message detected');
    }
  }, [rawMessages, isUserScrolling, scrollToBottomSafely]); // Watch for any changes in rawMessages

  // Convex-reactive auto-scroll - triggered by message array updates (following Convex docs)
  useEffect(() => {
    if (!outputRef.current || isUserScrolling) return;

    const element = outputRef.current;
    
    // Programmatic scroll - mark it to avoid triggering user scroll detection
    setIsProgrammaticScroll(true);
    
    requestAnimationFrame(() => {
      element.scrollTop = element.scrollHeight;
      
      // Clear programmatic flag after scroll completes
      setTimeout(() => setIsProgrammaticScroll(false), 50);
    });
  }, [rawMessages, isUserScrolling]); // React to any changes in rawMessages object, not just length

    // Enhanced MutationObserver for streaming content changes within messages
  useEffect(() => {
    if (!outputRef.current || isUserScrolling) return;

    const element = outputRef.current;
    
    const observer = new MutationObserver((mutations) => {
      if (!isUserScrolling && !isProgrammaticScroll) {
        // Check if any mutations are text changes in assistant messages
        const hasTextChanges = mutations.some(mutation => {
          // Look for text changes or child additions within message containers
          return (
            mutation.type === 'childList' ||
            mutation.type === 'characterData' ||
            (mutation.target as HTMLElement)?.closest?.('[data-role="assistant"]')
          );
        });

        if (hasTextChanges) {
          console.log('📝 DOM content changed during streaming, scrolling immediately');
          setIsProgrammaticScroll(true);
          
          requestAnimationFrame(() => {
            element.scrollTop = element.scrollHeight;
            requestAnimationFrame(() => {
              setIsProgrammaticScroll(false);
            });
          });
        }
      }
    });

    // Watch for all changes in the terminal output area
    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [isUserScrolling, isProgrammaticScroll]);

  // High-frequency polling for active streaming content (as backup to MutationObserver)
  useEffect(() => {
    if (!outputRef.current || isUserScrolling) return;

    const element = outputRef.current;
    let lastScrollHeight = element.scrollHeight;

    // Check if we have a streaming assistant message
    const streamingAssistant = rawMessages.find(msg =>
      msg.role === 'assistant' && !msg.outputTokens && msg.content
    );

    if (streamingAssistant) {
      console.log('🎬 Starting high-frequency scroll monitoring for streaming response');

      const intervalId = setInterval(() => {
        if (!outputRef.current || isUserScrolling || isProgrammaticScroll) return;

        const currentScrollHeight = outputRef.current.scrollHeight;
        
        // If content height has grown, scroll to bottom
        if (currentScrollHeight > lastScrollHeight) {
          console.log('⚡ Height increased during streaming, force scrolling');
          setIsProgrammaticScroll(true);
          
          requestAnimationFrame(() => {
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
            requestAnimationFrame(() => {
              setIsProgrammaticScroll(false);
            });
          });
          
          lastScrollHeight = currentScrollHeight;
        }
      }, 50); // Check every 50ms during streaming

      return () => {
        console.log('🛑 Stopping high-frequency scroll monitoring');
        clearInterval(intervalId);
      };
    }

    return undefined;
  }, [rawMessages, isUserScrolling, isProgrammaticScroll]);

  // Handle user scroll detection - but ignore programmatic scrolls
  useEffect(() => {
    if (!outputRef.current) return;

    const element = outputRef.current;
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTop = 0;

    const handleUserScroll = () => {
      const currentScrollTop = element.scrollTop;
      const maxScroll = element.scrollHeight - element.clientHeight;
      const isAtBottom = Math.abs(currentScrollTop - maxScroll) < 5;
      
      // Ignore if this is a programmatic scroll
      if (isProgrammaticScroll) {
        console.log('⚡ Ignoring programmatic scroll event');
        return;
      }
      
      // Only treat as user scroll if they scrolled UP (away from bottom)
      // or if they're scrolling to a position that's not at the bottom
      const isUserScrollingUp = currentScrollTop < lastScrollTop;
      const isUserScrollingAwayFromBottom = !isAtBottom && currentScrollTop < maxScroll - 10;
      
      if (isUserScrollingUp || isUserScrollingAwayFromBottom) {
        console.log('👆 User manually scrolled UP/AWAY, pausing auto-scroll');
        setIsUserScrolling(true);
        
        // Only auto-resume during active streaming, not after completion
        if (isStreamingActive) {
          console.log('📡 Streaming active - will resume auto-scroll after 3s timeout');
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            console.log('⏰ Resuming auto-scroll after 3s timeout (streaming active)');
            setIsUserScrolling(false);
          }, 3000);
        } else {
          console.log('📖 Streaming complete - staying paused until next user input');
          clearTimeout(scrollTimeout);
        }
      } else {
        // User scrolled to bottom, resume auto-scroll immediately (only if streaming)
        if (isStreamingActive) {
          console.log('👇 User scrolled to bottom during streaming, resuming auto-scroll');
          setIsUserScrolling(false);
        } else {
          console.log('👇 User scrolled to bottom (streaming complete, staying paused)');
        }
        clearTimeout(scrollTimeout);
      }
      
      lastScrollTop = currentScrollTop;
    };

    element.addEventListener('scroll', handleUserScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleUserScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isProgrammaticScroll, isStreamingActive]);
  
  // Focus input when terminal becomes active
  useEffect(() => {
    if (isAuthenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuthenticated, terminalId]);

  // Auto-enter chat mode for onboarding users or if terminal title is "Chat"
  useEffect(() => {
    const shouldEnterChatMode = (
      (terminal?.title === "Chat" && !chatMode) ||
      (needsOnboarding && !chatMode && activeSessionId && !onboardingLoading)
    ) && isAuthenticated;

    if (shouldEnterChatMode) {
      console.log('🎯 Entering chat mode:', {
        terminalTitle: terminal?.title,
        needsOnboarding,
        activeSessionId,
        reason: terminal?.title === "Chat" ? 'terminal title' : 'onboarding'
      });
      
      setChatMode(true);
      
      // Dynamic welcome message based on onboarding status
      const welcomeMessage = needsOnboarding
        ? `🌟 AURA Onboarding Starting...

Loading your personalized onboarding assistant.`
        : `🤖 Welcome to AURA Chat!
      
Connected to Orchestrator Agent powered by Claude 3.7 Sonnet.
Ready to help with development tasks, planning, and guidance.

Type your message below to get started.
Type 'exit' or 'quit' to return to terminal mode.`;

      // Add welcome message to buffer (for onboarding, this is just a status message)
      addToBuffer(welcomeMessage);
    }
  }, [terminal?.title, chatMode, isAuthenticated, onboardingLoading, needsOnboarding, activeSessionId, sessions, addToBuffer, terminalId, setChatMode]);

  // Handle onboarding welcome message - send to database when conditions are met
  useEffect(() => {
    if (isAuthenticated && !onboardingLoading && needsOnboarding && activeSessionId && !hasInitializedOnboarding && user?._id && !welcomeMessageSendingRef.current) {
      console.log('🎯 Sending onboarding welcome message to database');
      
      // Set flags immediately to prevent race conditions
      setHasInitializedOnboarding(true);
      welcomeMessageSendingRef.current = true;
      
      // Send welcome message to database (only once per session)
      sendOnboardingWelcome({
        sessionId: activeSessionId,
        userId: user._id,
      }).then(() => {
        console.log('✅ Onboarding welcome message sent successfully');
        welcomeMessageSendingRef.current = false;
      }).catch((error) => {
        console.error('❌ Failed to send onboarding welcome:', error);
        // Reset flags on error so it can be retried
        setHasInitializedOnboarding(false);
        welcomeMessageSendingRef.current = false;
      });
    }
  }, [isAuthenticated, onboardingLoading, needsOnboarding, activeSessionId, hasInitializedOnboarding, sendOnboardingWelcome, user?._id]);

  // Command processor - enhanced with orchestrator chat integration
  const processCommand = useCallback(async (command: string) => {
    if (!terminal) return;
    
    const startTime = Date.now();
    
    try {
      setProcessing(true);
      
      // Handle chat mode
      if (chatMode) {
        if (command.toLowerCase() === "exit" || command.toLowerCase() === "quit") {
          setChatMode(false);
          addToBuffer("Exited chat mode. Back to terminal.");
          return;
        }
        
        // Send message to appropriate handler based on onboarding status
        try {
          // Use the active session ID from the session store
          const currentSessionId = activeSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Route to onboarding handler if user needs onboarding, otherwise to orchestrator
          if (needsOnboarding) {
            console.log("📨 Routing message to onboarding handler");
            await sendOnboardingMessage({
              message: command,
              sessionId: currentSessionId,
            });
          } else {
            console.log("📨 Routing message to orchestrator");
            await sendMessage({
              message: command,
              sessionId: currentSessionId,
            });
          }
          
          // Messages are already saved by the handler action
          // Just ensure scroll to bottom after response
          setTimeout(() => {
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
          }, 50);
          
        } catch (error) {
          addToBuffer(`❌ Chat error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        return;
      }
      
      // Add command to buffer with appropriate prompt (only for terminal mode)
      const prompt = `${terminal.currentDirectory} $`;
      addToBuffer(`${prompt} ${command}`);
      let output = "";
      let exitCode = 0;
      
      // Built-in commands
      if (command === "clear") {
        clearBuffer();
        return;
      } else if (command === "chat" || command === "orchestrator") {
        setChatMode(true);
        output = `🤖 Entered chat mode with Orchestrator Agent.
Type your message to chat with the AI assistant.
Type 'exit' or 'quit' to return to terminal mode.

Orchestrator is ready to help with development tasks, planning, and guidance.`;
      } else if (command === "help") {
        output = `AURA Terminal Commands:
  help     - Show this help message
  clear    - Clear terminal buffer
  chat     - Enter chat mode with Orchestrator Agent
  pwd      - Show current directory
  ls       - List directory contents
  history  - Show command history
  whoami   - Show current user
  date     - Show current date/time`;
      } else if (command === "pwd") {
        output = terminal?.currentDirectory || "~";
      } else if (command === "ls") {
        output = "file1.txt  file2.js  project/  README.md";
      } else if (command === "history") {
        output = (commandHistory || []).slice(-10).map((cmd, i: number) => `${(commandHistory?.length || 0) - 10 + i + 1}  ${cmd.input || cmd}`).join("\n");
      } else if (command === "whoami") {
        output = isAuthenticated ? "authenticated-user" : "anonymous";
      } else if (command === "date") {
        output = new Date().toString();
      } else if (command.startsWith("echo ")) {
        output = command.substring(5);
      } else if (command.trim() === "") {
        // Empty command, just show prompt
        return;
      } else {
        // Unknown command
        output = `Command not found: ${command}`;
        exitCode = 127;
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
      
      // Add output to buffer
      if (output) {
        addToBuffer(output);
      }
      
      // Save command to history and Convex
      const duration = Date.now() - startTime;
      // Save command to history
      await saveCommand(terminalId, {
        input: command,
        output: output,
        timestamp: Date.now(),
      });
      
      if (isAuthenticated) {
        await saveCommand(terminalId, {
          input: command,
          output,
          exitCode,
          workingDirectory: terminal.currentDirectory,
          duration,
          timestamp: Date.now(),
        });
      }
      
    } catch (error) {
      console.error("Command processing error:", error);
      addToBuffer(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  }, [terminal, terminalId, commandHistory, addToBuffer, clearBuffer, setProcessing, saveCommand, isAuthenticated, chatMode, sendMessage, sendOnboardingMessage, needsOnboarding, setChatMode, activeSessionId]);

  // Enhanced input submit handler
  const handleEnhancedSubmit = useCallback(async (messageContent: string) => {
    if (messageContent.trim()) {
      // Clear input immediately to prevent showing "sending" state
      setInput("");
      await processCommand(messageContent.trim());
    }
  }, [processCommand]);

  if (!terminal) {
    return (
      <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-xs text-[#858585]">Terminal not found</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-xs text-[#858585]">Please sign in to use the terminal</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0e0e0e] flex flex-col h-full overflow-hidden">
      {/* Secondary header row with sub-tabs */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-[#1f1f1f] flex-shrink-0 bg-[#181818]">
        <div className="flex items-center space-x-1">
          <button
            className={`text-xs px-2 py-1 transition-colors ${
              activeSubTab === 'chat'
                ? 'text-[#7dd3fc]'
                : 'text-[#cccccc] hover:text-white'
            }`}
            onClick={() => setActiveSubTab('chat')}
          >
            Chat
          </button>
          <button
            className={`text-xs px-2 py-1 transition-colors ${
              activeSubTab === 'sessions'
                ? 'text-[#7dd3fc]'
                : 'text-[#cccccc] hover:text-white'
            }`}
            onClick={() => setActiveSubTab('sessions')}
          >
            Sessions <span className="text-[#4ade80]">{sessions?.length || 0}</span>
          </button>
          <button
            className={`text-xs px-2 py-1 transition-colors ${
              activeSubTab === 'agents'
                ? 'text-[#7dd3fc]'
                : 'text-[#cccccc] hover:text-white'
            }`}
            onClick={() => setActiveSubTab('agents')}
          >
            Agents
          </button>
          <button
            className={`text-xs px-2 py-1 transition-colors ${
              activeSubTab === 'extensions'
                ? 'text-[#7dd3fc]'
                : 'text-[#cccccc] hover:text-white'
            }`}
            onClick={() => setActiveSubTab('extensions')}
          >
            Extensions
          </button>
          
          {/* New Session Button */}
          <button
            className="ml-2 p-1 text-xs border border-[#454545] bg-transparent hover:bg-[#3d3d3d] text-[#858585] hover:text-[#cccccc] rounded transition-colors"
            onClick={handleCreateNewSession}
            title="New Session"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Active Agent/Extension Indicator */}
        {activeSubTab === 'chat' && (
          <div className="flex items-center space-x-2">
            <div className="text-xs text-[#858585]">
              <span className="text-[#cccccc]">{getActiveAgentInfo().name}</span>
              <span className="text-[#4ade80] ml-1">●</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content Area - conditionally render based on active sub-tab */}
      {activeSubTab === 'chat' && (
        <>
          {/* Terminal output - scrollable area */}
          <div
            ref={outputRef}
            className="flex-1 px-3 py-3 overflow-y-auto font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent min-h-0"
          >
            {chatMode ? (
              // Show session messages when in chat mode
              <>
                {messagesLoading ? (
                  <div className="text-[#858585] flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading chat history...
                  </div>
                ) : (
                  <>
                    {formattedMessages.length === 0 ? (
                      <div className="text-[#858585] py-4">
                        {needsOnboarding && !hasInitializedOnboarding ? (
                          // Show loading state while onboarding welcome is being sent
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Initializing onboarding assistant...
                          </div>
                        ) : needsOnboarding ? (
                          // If onboarding is initialized but no messages yet, show minimal message
                          <div className="text-[#858585] py-2">
                            Onboarding assistant is ready. Your welcome message should appear shortly.
                          </div>
                        ) : (
                          // Non-onboarding users get the regular welcome
                          <>
                            🤖 Welcome to AURA Chat!
                            <br />
                            <br />
                            Connected to Orchestrator Agent powered by Claude 3.7 Sonnet.
                            <br />
                            Ready to help with development tasks, planning, and guidance.
                            <br />
                            <br />
                            Type your message below to get started.
                            <br />
                            Type &apos;exit&apos; or &apos;quit&apos; to return to terminal mode.
                          </>
                        )}
                      </div>
                    ) : (
                      rawMessages.map((message, index) => (
                        <TerminalMessage
                          key={message._id}
                          message={message}
                          isLast={index === rawMessages.length - 1}
                          onRegenerate={handleRegenerate}
                        />
                      ))
                    )}
                  </>
                )}
              </>
            ) : (
              // Show terminal buffer when in terminal mode
              terminal.buffer.map((line, index) => (
                <div key={index} className="text-[#cccccc] whitespace-pre-wrap mb-0.5">
                  {line}
                </div>
              ))
            )}
          </div>          {/* Current input line - fixed at bottom */}
          <div className="flex items-center space-x-2 px-2 pt-2 border-t border-[#1f1f1f] flex-shrink-0 bg-[#0e0e0e] min-h-[28px]">
            <div className="flex-1">
              <EnhancedPromptInput
                value={input}
                onChange={setInput}
                onSubmit={handleEnhancedSubmit}
                placeholder={chatMode ? "Ask anything... (Shift+Enter for new line)" : "Type a command... (Shift+Enter for new line)"}
                disabled={isProcessing}
                isLoading={isProcessing}
                showToolbar={false}
                multiline={true}
                className="border-none bg-transparent"
              />
            </div>
            {isProcessing && (
              <Loader2 className="w-3 h-3 text-[#0ea5e9] animate-spin flex-shrink-0" />
            )}
          </div>
          
          {/* Status bar */}
          <div className="px-3 py-1 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-[#858585] bg-[#1a1a1a] flex-shrink-0">
            <div className="flex items-center space-x-4">
              <span>Commands: {commandHistory.length}</span>
              <span>Lines: {terminal.buffer.length}</span>
              <span className={getTokenUsageColor(getUsageStatus())}>
                Tokens: {formatTokenCount(totalTokens)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isVoiceMode ? (
                <span className="text-[#22c55e]">Voice Mode</span>
              ) : chatMode ? (
                <span className="text-[#0ea5e9]">Chat Mode</span>
              ) : (
                <>
                  <span>⌘K to clear</span>
                  <span>↑↓ for history</span>
                  <span>Type &apos;help&apos; for commands</span>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'sessions' && <SessionsPanel onSessionSelected={() => setActiveSubTab('chat')} />}
      {activeSubTab === 'agents' && <AgentsPanel />}
      {activeSubTab === 'extensions' && <ExtensionsPanel />}
    </div>
  );
}
