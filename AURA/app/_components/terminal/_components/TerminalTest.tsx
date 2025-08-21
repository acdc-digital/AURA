// TERMINAL INTEGRATION TEST - Test advanced terminal features
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/TerminalTest.tsx

"use client";

import { useTerminalStore } from "@/lib/store/terminal";
import { useConvexAuth } from "convex/react";
import { PlayCircle, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useCallback } from "react";

export function TerminalTest() {
  const { isAuthenticated } = useConvexAuth();
  const {
    terminals,
    activeTerminalId,
    commandHistory,
    createTerminal,
    removeTerminal,
    addToBuffer,
    addToHistory,
    addAlert,
    clearHistory,
    clearAlerts,
  } = useTerminalStore();

  const runBasicTests = useCallback(() => {
    if (!isAuthenticated) {
      addAlert({
        title: 'Authentication Required',
        message: 'Please sign in to run terminal tests',
        level: 'warning',
      });
      return;
    }

    // Test 1: Create a new terminal
    const terminalId = createTerminal(undefined, 'Test Terminal');
    
    // Test 2: Add some buffer content
    addToBuffer(terminalId, 'Test Terminal Created Successfully');
    addToBuffer(terminalId, '$ echo "Hello AURA Terminal"');
    addToBuffer(terminalId, 'Hello AURA Terminal');
    addToBuffer(terminalId, '$ pwd');
    addToBuffer(terminalId, '/home/aura/projects');
    
    // Test 3: Add commands to history
    addToHistory('echo "Hello AURA Terminal"');
    addToHistory('pwd');
    addToHistory('ls -la');
    addToHistory('clear');
    
    // Test 4: Generate test alerts
    addAlert({
      title: 'Terminal Test Completed',
      message: 'Basic terminal functionality test completed successfully',
      level: 'info',
    });
    
    addAlert({
      title: 'System Check',
      message: 'All terminal systems operational',
      level: 'info',
    });

  }, [isAuthenticated, createTerminal, addToBuffer, addToHistory, addAlert]);

  const runAdvancedTests = useCallback(() => {
    if (!isAuthenticated) {
      addAlert({
        title: 'Authentication Required',
        message: 'Please sign in to run advanced tests',
        level: 'warning',
      });
      return;
    }

    // Create multiple terminals
    const term1 = createTerminal(undefined, 'Production Terminal');
    const term2 = createTerminal(undefined, 'Development Terminal');
    const term3 = createTerminal(undefined, 'Testing Terminal');

    // Add different content to each
    addToBuffer(term1, 'Production environment initialized');
    addToBuffer(term1, '$ npm run build');
    addToBuffer(term1, 'Building application...');
    
    addToBuffer(term2, 'Development server starting');
    addToBuffer(term2, '$ npm run dev');
    addToBuffer(term2, 'Server running on port 3000');
    
    addToBuffer(term3, 'Running test suite');
    addToBuffer(term3, '$ npm test');
    addToBuffer(term3, 'All tests passing ✓');

    // Add various command types to history
    const advancedCommands = [
      'git status',
      'git add .',
      'git commit -m "Update terminal implementation"',
      'npm install @types/node',
      'pnpm build',
      'docker build -t aura .',
      'kubectl get pods',
      'ssh user@server.com',
      'tail -f /var/log/app.log',
      'htop'
    ];
    
    advancedCommands.forEach(cmd => addToHistory(cmd));

    // Generate different types of alerts
    addAlert({
      title: 'Build Successful',
      message: 'Application build completed without errors',
      level: 'info',
    });
    
    addAlert({
      title: 'High Memory Usage',
      message: 'Terminal buffer usage approaching limits',
      level: 'warning',
    });
    
    addAlert({
      title: 'Connection Error',
      message: 'Failed to connect to remote server',
      level: 'error',
    });

  }, [isAuthenticated, createTerminal, addToBuffer, addToHistory, addAlert]);

  const clearAllData = useCallback(() => {
    // Remove all terminals
    Array.from(terminals.keys()).forEach(id => {
      removeTerminal(id);
    });
    
    // Clear history and alerts
    clearHistory();
    clearAlerts();
    
    addAlert({
      title: 'Data Cleared',
      message: 'All terminal data has been reset',
      level: 'info',
    });
  }, [terminals, removeTerminal, clearHistory, clearAlerts, addAlert]);

  const terminalArray = Array.from(terminals.entries());

  return (
    <div className="flex-1 bg-[#0e0e0e] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg font-medium text-white mb-2">Terminal Integration Test</h2>
          <p className="text-xs text-[#858585]">
            Test the advanced terminal features and multi-terminal support
          </p>
        </div>

        {/* Status */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Current Status</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#858585]">Authentication:</span>
              <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {isAuthenticated ? 'Signed In' : 'Not Signed In'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#858585]">Active Terminals:</span>
              <span className="text-[#cccccc]">{terminalArray.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#858585]">Active Terminal ID:</span>
              <span className="text-[#cccccc] font-mono">
                {activeTerminalId || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#858585]">Command History:</span>
              <span className="text-[#cccccc]">{commandHistory.length} commands</span>
            </div>
          </div>
        </div>

        {/* Terminal List */}
        {terminalArray.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Active Terminals</h3>
            <div className="space-y-2">
              {terminalArray.map(([id, terminal]) => (
                <div key={id} className="flex items-center justify-between py-2 px-3 bg-[#0e0e0e] rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      terminal.isProcessing ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <span className="text-xs text-[#cccccc] font-medium">{terminal.title}</span>
                    <span className="text-xs text-[#858585] font-mono">{id}</span>
                  </div>
                  <div className="text-xs text-[#858585]">
                    {terminal.buffer.length} lines
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="space-y-3">
          <button
            onClick={runBasicTests}
            disabled={!isAuthenticated}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#374151] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Run Basic Tests</span>
          </button>

          <button
            onClick={runAdvancedTests}
            disabled={!isAuthenticated}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-[#374151] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Run Advanced Tests</span>
          </button>

          <button
            onClick={clearAllData}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Test Instructions</span>
          </h3>
          <div className="space-y-2 text-xs text-[#858585]">
            <p>1. <strong>Basic Tests:</strong> Creates a single terminal with sample content and commands</p>
            <p>2. <strong>Advanced Tests:</strong> Creates multiple terminals with different scenarios</p>
            <p>3. <strong>Clear Data:</strong> Resets all terminal data for clean testing</p>
            <p>4. Switch between Terminal, History, and Alerts tabs to see the results</p>
          </div>
        </div>
      </div>
    </div>
  );
}
