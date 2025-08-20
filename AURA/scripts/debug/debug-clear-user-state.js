// DEBUG CLEAR USER STATE SCRIPT - User state cleanup for testing
// Usage: Copy and paste into browser console for debugging

(function() {
  'use strict';
  
  console.log('🧹 AURA Debug User State Cleaner');
  console.log('=================================');
  
  // User State Cleanup Utilities
  window.debugUserState = {
    
    // Clear all user-related data
    clearAll: () => {
      console.log('🧹 Clearing all user state...');
      
      try {
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Storage cleared');
        
        // Clear cookies (domain-specific)
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        console.log('✅ Cookies cleared');
        
        // Clear IndexedDB (if used)
        if (window.indexedDB) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => {
              indexedDB.deleteDatabase(db.name);
              console.log(`✅ IndexedDB cleared: ${db.name}`);
            });
          });
        }
        
        console.log('🎉 User state cleanup complete');
        console.log('🔄 Refresh the page to see clean state');
        
      } catch (error) {
        console.error('❌ Cleanup failed:', error);
      }
    },
    
    // Clear only authentication data
    clearAuth: () => {
      console.log('🔐 Clearing authentication data...');
      
      const authKeys = Object.keys(localStorage).filter(key =>
        key.includes('clerk') ||
        key.includes('auth') ||
        key.includes('token') ||
        key.includes('user') ||
        key.includes('session')
      );
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`   Removed: ${key}`);
      });
      
      const sessionAuthKeys = Object.keys(sessionStorage).filter(key =>
        key.includes('clerk') ||
        key.includes('auth') ||
        key.includes('token') ||
        key.includes('user') ||
        key.includes('session')
      );
      
      sessionAuthKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`   Removed: ${key}`);
      });
      
      console.log('✅ Authentication data cleared');
    },
    
    // Clear only app state
    clearAppState: () => {
      console.log('📱 Clearing app state...');
      
      const appKeys = Object.keys(localStorage).filter(key =>
        key.includes('store') ||
        key.includes('editor') ||
        key.includes('sidebar') ||
        key.includes('terminal') ||
        key.includes('zustand')
      );
      
      appKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`   Removed: ${key}`);
      });
      
      console.log('✅ App state cleared');
    },
    
    // Inspect current user state
    inspect: () => {
      console.log('🔍 Inspecting current user state...');
      
      // Clerk authentication
      if (window.Clerk) {
        const user = window.Clerk.user;
        console.log('👤 Clerk User:', user ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName,
          authenticated: true
        } : 'Not authenticated');
      } else {
        console.log('👤 Clerk not available');
      }
      
      // Convex authentication
      if (window.convex) {
        console.log('🔗 Convex Client: Available');
      } else {
        console.log('🔗 Convex Client: Not available');
      }
      
      // Storage analysis
      const userRelatedKeys = Object.keys(localStorage).filter(key =>
        key.includes('user') ||
        key.includes('auth') ||
        key.includes('clerk') ||
        key.includes('convex')
      );
      
      console.log('💾 User-related storage keys:', userRelatedKeys);
      
      userRelatedKeys.forEach(key => {
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          console.log(`   ${key}:`, parsed);
        } catch {
          console.log(`   ${key}: "${value}"`);
        }
      });
    },
    
    // Reset to clean testing state
    resetForTesting: () => {
      console.log('🔄 Resetting to clean testing state...');
      
      // Clear everything
      debugUserState.clearAll();
      
      // Set up basic test state
      const testState = {
        debug: true,
        environment: 'testing',
        timestamp: Date.now()
      };
      
      localStorage.setItem('debug-test-state', JSON.stringify(testState));
      
      console.log('✅ Clean testing state prepared');
      console.log('🧪 Test state:', testState);
    },
    
    // Generate test user data
    generateTestData: () => {
      console.log('🧪 Generating test user data...');
      
      const testData = {
        user: {
          id: `test_user_${Date.now()}`,
          email: 'test@aura.dev',
          name: 'Test User',
          created: new Date().toISOString()
        },
        preferences: {
          theme: 'dark',
          notifications: true,
          autoSave: true
        },
        editor: {
          tabs: [],
          activeTab: null,
          settings: {
            fontSize: 14,
            wordWrap: true
          }
        }
      };
      
      localStorage.setItem('test-user-data', JSON.stringify(testData));
      console.log('✅ Test data generated:', testData);
      
      return testData;
    },
    
    // Export user state for debugging
    export: () => {
      console.log('📤 Exporting user state...');
      
      const state = {
        localStorage: {},
        sessionStorage: {},
        cookies: document.cookie,
        timestamp: Date.now()
      };
      
      // Export localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        state.localStorage[key] = localStorage.getItem(key);
      }
      
      // Export sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        state.sessionStorage[key] = sessionStorage.getItem(key);
      }
      
      console.log('📋 Exported state:', state);
      
      // Copy to clipboard if available
      if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(state, null, 2));
        console.log('📋 State copied to clipboard');
      }
      
      return state;
    }
  };
  
  console.log('\n🛠️ Debug utilities added to window.debugUserState:');
  console.log('   debugUserState.clearAll() - Clear all user data');
  console.log('   debugUserState.clearAuth() - Clear authentication only');
  console.log('   debugUserState.clearAppState() - Clear app state only');
  console.log('   debugUserState.inspect() - Inspect current state');
  console.log('   debugUserState.resetForTesting() - Reset to clean test state');
  console.log('   debugUserState.generateTestData() - Generate test data');
  console.log('   debugUserState.export() - Export current state');
  
})();
