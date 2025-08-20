# AURA Debug System Documentation

## Overview

The AURA Debug System is a sophisticated multi-layered debugging infrastructure designed for development efficiency and production monitoring. It provides comprehensive debugging tools accessible through the activity bar's debug icon.

## System Architecture

### Core Components

1. **DashDebug.tsx** - Main debug console with 11 expandable sections
2. **ConvexDebug.tsx** - Database connection testing and query debugging
3. **ErrorBoundaryClient.tsx** - Global client-side error capture system
4. **FileSyncDebugger.tsx** - Development file synchronization debugging

### Debug Console Sections

#### 1. System Health Overview
- Real-time monitoring of core system components
- Database, authentication, network, and storage status
- Color-coded status indicators (success/warning/error/info)

#### 2. Authentication Status
- Clerk authentication state monitoring
- Convex database connection verification
- User ID and session information
- Token status and permissions

#### 3. Convex Database Monitor
- Interactive database connection testing
- Query performance tracking
- Database operation logging
- Manual test project creation/deletion
- Real-time connection status display

#### 4. Terminal Configuration
- Agent initialization status
- Command router state verification
- Session persistence checks

#### 5. Calendar Debug
- Event synchronization status monitoring
- Calendar API connections
- Schedule persistence verification

#### 6. Error Tracking
- Global error capture with stack traces
- Real-time error logging with timestamps
- Error categorization (JavaScript, Promise, Resource, Network)
- Error severity assessment (Low, Medium, High, Critical)
- Automatic error pattern detection

#### 7. Storage Inspector
- localStorage and sessionStorage analysis
- Zustand store persistence debugging
- State serialization verification
- Editor tabs and active tab tracking

#### 8. File Repair Tools
- File synchronization debugging utilities
- Real-time file sync status monitoring
- Database vs. store state comparison
- Authentication-aware debugging
- Automated sync testing

#### 9. Connection Testing
- Network connectivity verification
- API endpoint health checks
- Service availability monitoring

#### 10. Console Logging
- Structured logging output
- Debug level configuration
- Log filtering and search capabilities

#### 11. Performance & Metrics
- Browser memory usage monitoring (Chrome's performance.memory)
- Response time tracking
- Error count monitoring
- Real-time performance data extraction

#### 12. Social Media Testing
- Platform integration testing
- Post creation validation
- OAuth connection verification

## Browser Console Scripts

The debug system includes specialized browser console scripts located in `/scripts/debug/`:

### debug-storage.js
- localStorage and sessionStorage inspection
- Zustand store detection and analysis
- Storage usage calculation
- Cleanup utilities

**Usage:**
```javascript
// Available utilities after running script
debugStorage.clear()           // Clear all storage
debugStorage.clearLocal()      // Clear localStorage only
debugStorage.clearSession()    // Clear sessionStorage only
debugStorage.inspect(key)      // Inspect specific key
debugStorage.size()           // Show storage usage
```

### debug-file-creation.js
- File creation workflow testing
- File persistence validation
- File state inspection
- File operation simulation

**Usage:**
```javascript
// Available utilities after running script
debugFiles.testFileCreation()     // Test file creation workflow
debugFiles.inspectFileState()     // Inspect current file state
debugFiles.testFilePersistence()  // Test file persistence
debugFiles.simulateFileOps()      // Simulate file operations
debugFiles.cleanup()              // Clean up test data
debugFiles.monitorFileEvents()    // Monitor file events
```

### debug-clear-user-state.js
- User state cleanup for testing
- Authentication data clearing
- App state reset utilities
- Test data generation

**Usage:**
```javascript
// Available utilities after running script
debugUserState.clearAll()          // Clear all user data
debugUserState.clearAuth()         // Clear authentication only
debugUserState.clearAppState()     // Clear app state only
debugUserState.inspect()           // Inspect current state
debugUserState.resetForTesting()   // Reset to clean test state
debugUserState.generateTestData()  // Generate test data
debugUserState.export()            // Export current state
```

## Features

### Real-time Monitoring
- ✅ Authentication state tracking
- ✅ Database connection monitoring
- ✅ File synchronization status
- ✅ Error capture and reporting
- ✅ Performance data extraction

### Development Tools
- ✅ Integrated debug console with 11 sections
- ✅ Browser console script collection
- ✅ Global error boundary system
- ✅ File sync debugging utilities
- ✅ Storage inspection tools

### Testing Infrastructure
- ✅ Database operation validation
- ✅ File creation workflow testing
- ✅ Agent execution verification
- ✅ Connection health checks
- ✅ Social media integration testing

## Error Handling

The debug system captures and categorizes errors automatically:

- **JavaScript Errors**: Runtime exceptions, syntax errors
- **Promise Rejections**: Unhandled async operation failures
- **Resource Errors**: Failed image, script, or stylesheet loading
- **Network Errors**: API call failures, connection issues

Each error includes:
- Timestamp
- Error message and stack trace
- Filename and line/column numbers
- Severity classification
- Component context (when available)

## Performance Monitoring

The system tracks various performance metrics:

- **Memory Usage**: JavaScript heap size (Chrome only)
- **Error Count**: Total errors captured
- **Network Status**: Online/offline detection
- **Query Performance**: Database operation timing

## Usage Instructions

### Accessing the Debug Console
1. Click the debug icon (🐛) in the activity bar
2. The debug panel opens with all available sections
3. Click section headers to expand/collapse content
4. Use the refresh button to update debug data

### Running Browser Scripts
1. Open browser developer console (F12)
2. Copy and paste desired debug script
3. Execute to add debugging utilities to window object
4. Use provided utility functions for debugging

### Error Monitoring
- Errors are automatically captured when they occur
- Check the "Error Tracking" section for recent errors
- Toggle error capturing on/off as needed
- Clear error log when debugging is complete

### Database Testing
1. Expand the "Convex Database Monitor" section
2. Click "Run All" to test all database operations
3. Individual tests can be run by clicking "Test" buttons
4. View detailed results and performance metrics

### File Sync Debugging
1. Expand the "File Repair Tools" section
2. Monitor real-time sync status
3. Run synchronization tests
4. Toggle auto-refresh for continuous monitoring

## Technical Integration

### Frontend Integration
- Extends existing AURA component architecture
- Integrates with current Zustand store system
- Leverages existing error boundary infrastructure
- Uses VS Code-inspired design system

### Backend Integration
- Works with existing Convex functions
- Adds performance monitoring to database operations
- Implements debug-specific API testing
- Maintains compatibility with existing schemas

### State Management Integration
- Extends agent context store with advanced metrics
- Adds debug-specific stores for analytics
- Integrates performance tracking with existing stores
- Implements debug session persistence

## Security Considerations

- Sensitive data is automatically scrubbed from logs
- Debug features can be disabled in production
- Access control prevents unauthorized debugging
- All debug operations maintain security audit trails

## Performance Impact

The debug system is designed for minimal performance overhead:

- Debug console: ~1200 lines, optimized with collapsible sections
- Browser scripts: Minimal overhead, on-demand execution
- Error tracking: Event-driven, low latency impact
- Performance monitoring: Non-blocking, async collection

## Development Workflow

1. **Development Phase**: Use full debug capabilities for issue diagnosis
2. **Testing Phase**: Utilize automated test utilities and state inspection
3. **Production Phase**: Monitor real-time metrics and error patterns
4. **Debugging Phase**: Access comprehensive logging and analysis tools

The debug system seamlessly integrates into the AURA development workflow, providing powerful tools without disrupting normal operations.
