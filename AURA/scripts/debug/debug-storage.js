// DEBUG STORAGE SCRIPT - localStorage and sessionStorage inspection
// Usage: Copy and paste into browser console for debugging

(function() {
  'use strict';
  
  console.log('🔍 AURA Debug Storage Inspector');
  console.log('================================');
  
  // LocalStorage Analysis
  console.log('\n📦 LocalStorage Contents:');
  if (localStorage.length === 0) {
    console.log('   Empty');
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(value);
        console.log(`   ${key}:`, parsed);
      } catch {
        console.log(`   ${key}: "${value}"`);
      }
    }
  }
  
  // SessionStorage Analysis  
  console.log('\n🧠 SessionStorage Contents:');
  if (sessionStorage.length === 0) {
    console.log('   Empty');
  } else {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      try {
        const parsed = JSON.parse(value);
        console.log(`   ${key}:`, parsed);
      } catch {
        console.log(`   ${key}: "${value}"`);
      }
    }
  }
  
  // Zustand Store Detection
  console.log('\n🏪 Zustand Store Detection:');
  const storeKeys = Object.keys(localStorage).filter(key => 
    key.includes('store') || 
    key.includes('zustand') ||
    key.includes('editor') ||
    key.includes('sidebar') ||
    key.includes('terminal')
  );
  
  if (storeKeys.length > 0) {
    storeKeys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(value);
        console.log(`   Found store: ${key}`, parsed);
      } catch {
        console.log(`   Found store: ${key} (unparseable)`);
      }
    });
  } else {
    console.log('   No Zustand stores detected');
  }
  
  // Storage Utilities
  window.debugStorage = {
    clear: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ All storage cleared');
    },
    
    clearLocal: () => {
      localStorage.clear();
      console.log('✅ LocalStorage cleared');
    },
    
    clearSession: () => {
      sessionStorage.clear();
      console.log('✅ SessionStorage cleared');
    },
    
    inspect: (key) => {
      const local = localStorage.getItem(key);
      const session = sessionStorage.getItem(key);
      
      console.log(`🔍 Inspecting key: ${key}`);
      if (local) {
        try {
          console.log('   LocalStorage:', JSON.parse(local));
        } catch {
          console.log('   LocalStorage:', local);
        }
      }
      if (session) {
        try {
          console.log('   SessionStorage:', JSON.parse(session));
        } catch {
          console.log('   SessionStorage:', session);
        }
      }
      if (!local && !session) {
        console.log('   Key not found in storage');
      }
    },
    
    size: () => {
      let localSize = 0;
      let sessionSize = 0;
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localSize += localStorage[key].length + key.length;
        }
      }
      
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          sessionSize += sessionStorage[key].length + key.length;
        }
      }
      
      console.log(`📊 Storage Usage:`);
      console.log(`   LocalStorage: ${localSize} bytes`);
      console.log(`   SessionStorage: ${sessionSize} bytes`);
      console.log(`   Total: ${localSize + sessionSize} bytes`);
    }
  };
  
  console.log('\n🛠️ Debug utilities added to window.debugStorage:');
  console.log('   debugStorage.clear() - Clear all storage');
  console.log('   debugStorage.clearLocal() - Clear localStorage');
  console.log('   debugStorage.clearSession() - Clear sessionStorage');
  console.log('   debugStorage.inspect(key) - Inspect specific key');
  console.log('   debugStorage.size() - Show storage usage');
  
})();
