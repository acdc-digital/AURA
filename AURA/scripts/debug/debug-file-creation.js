// DEBUG FILE CREATION SCRIPT - File creation workflow testing
// Usage: Copy and paste into browser console for debugging

(function() {
  'use strict';
  
  console.log('📄 AURA Debug File Creation Tester');
  console.log('===================================');
  
  // File Creation Test Utilities
  window.debugFiles = {
    
    // Test file creation flow
    testFileCreation: async () => {
      console.log('🧪 Testing file creation workflow...');
      
      try {
        // Check if user is authenticated
        const clerkUser = window.Clerk?.user;
        if (!clerkUser) {
          console.error('❌ User not authenticated with Clerk');
          return;
        }
        
        console.log('✅ User authenticated:', clerkUser.emailAddresses[0]?.emailAddress);
        
        // Check Convex connection
        if (!window.convex) {
          console.error('❌ Convex client not found');
          return;
        }
        
        console.log('✅ Convex client available');
        
        // Simulate file creation
        const testFile = {
          name: `debug-test-${Date.now()}.md`,
          content: '# Debug Test File\n\nThis file was created by the debug system.',
          type: 'markdown',
          size: 0
        };
        
        testFile.size = new Blob([testFile.content]).size;
        
        console.log('📝 Test file prepared:', testFile);
        
        return testFile;
        
      } catch (error) {
        console.error('❌ File creation test failed:', error);
      }
    },
    
    // Inspect current file state
    inspectFileState: () => {
      console.log('🔍 Inspecting current file state...');
      
      // Check editor store
      const editorState = localStorage.getItem('editor-storage');
      if (editorState) {
        try {
          const parsed = JSON.parse(editorState);
          console.log('📋 Editor Store State:', parsed);
          
          if (parsed.state?.tabs) {
            console.log(`📑 Open tabs: ${parsed.state.tabs.length}`);
            parsed.state.tabs.forEach((tab, index) => {
              console.log(`   ${index + 1}. ${tab.title} (${tab.type})`);
            });
          }
          
          if (parsed.state?.activeTabId) {
            console.log(`🎯 Active tab: ${parsed.state.activeTabId}`);
          }
          
        } catch (error) {
          console.error('❌ Failed to parse editor state:', error);
        }
      } else {
        console.log('📋 No editor state found');
      }
    },
    
    // Test file persistence
    testFilePersistence: async () => {
      console.log('💾 Testing file persistence...');
      
      try {
        // Check localStorage for file data
        const keys = Object.keys(localStorage);
        const fileKeys = keys.filter(key => 
          key.includes('file') || 
          key.includes('editor') ||
          key.includes('tab')
        );
        
        console.log('🔑 File-related storage keys:', fileKeys);
        
        fileKeys.forEach(key => {
          const value = localStorage.getItem(key);
          try {
            const parsed = JSON.parse(value);
            console.log(`   ${key}:`, parsed);
          } catch {
            console.log(`   ${key}: "${value}"`);
          }
        });
        
      } catch (error) {
        console.error('❌ File persistence test failed:', error);
      }
    },
    
    // Simulate file operations
    simulateFileOps: () => {
      console.log('🎭 Simulating file operations...');
      
      const operations = [
        'Create new file',
        'Open existing file',
        'Edit file content',
        'Save file changes',
        'Close file tab'
      ];
      
      operations.forEach((op, index) => {
        setTimeout(() => {
          console.log(`   ${index + 1}. ${op} - ${Math.random() > 0.8 ? '❌ Failed' : '✅ Success'}`);
        }, index * 500);
      });
    },
    
    // Clean up test files
    cleanup: () => {
      console.log('🧹 Cleaning up test data...');
      
      const keys = Object.keys(localStorage);
      const testKeys = keys.filter(key => 
        key.includes('debug-test') || 
        key.includes('test-file')
      );
      
      testKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`   Removed: ${key}`);
      });
      
      console.log('✅ Cleanup complete');
    },
    
    // Monitor file events
    monitorFileEvents: () => {
      console.log('👁️ Monitoring file events...');
      
      // Override console methods to capture file-related logs
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args) => {
        if (args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('file') || arg.includes('File'))
        )) {
          originalLog('🔊 FILE EVENT:', ...args);
        } else {
          originalLog(...args);
        }
      };
      
      console.error = (...args) => {
        if (args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('file') || arg.includes('File'))
        )) {
          originalError('🚨 FILE ERROR:', ...args);
        } else {
          originalError(...args);
        }
      };
      
      // Restore after 30 seconds
      setTimeout(() => {
        console.log = originalLog;
        console.error = originalError;
        console.log('👁️ File event monitoring stopped');
      }, 30000);
      
      console.log('✅ File event monitoring active for 30 seconds');
    }
  };
  
  console.log('\n🛠️ Debug utilities added to window.debugFiles:');
  console.log('   debugFiles.testFileCreation() - Test file creation workflow');
  console.log('   debugFiles.inspectFileState() - Inspect current file state');
  console.log('   debugFiles.testFilePersistence() - Test file persistence');
  console.log('   debugFiles.simulateFileOps() - Simulate file operations');
  console.log('   debugFiles.cleanup() - Clean up test data');
  console.log('   debugFiles.monitorFileEvents() - Monitor file events');
  
})();
