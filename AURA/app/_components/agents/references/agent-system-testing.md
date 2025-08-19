# Agent System Testing Guide

_EAC Financial Dashboard_

## Pre-Testing Setup

### Environment Verification

Before testing the agent system, ensure the following:

1. **Dependencies Installed**

   ```bash
   cd eac && pnpm install
   ```

2. **Development Server Running**

   ```bash
   cd eac && pnpm run dev
   ```

3. **Browser DevTools Open** (for debugging)
   - Open Chrome/Edge DevTools
   - Go to Console tab for error monitoring
   - Go to Application > Local Storage for state inspection

## Test Scenarios

### Test 1: Agent Panel Access

**Objective**: Verify agent panel integration with activity bar

**Steps**:

1. Open EAC dashboard in browser
2. Locate activity bar on the left side
3. Click the **Bot icon** (🤖) in the activity bar
4. Verify agent panel opens on the right side

**Expected Results**:

- ✅ Bot icon is visible in activity bar
- ✅ Panel opens when clicked
- ✅ Panel shows "Agents" header
- ✅ Instructions agent is listed
- ✅ Agent has description and tools listed

**Troubleshooting**:

- If bot icon missing: Check `dashActivityBar.tsx` Bot import
- If panel doesn't open: Check sidebar routing in `dashboardSidebar.tsx`
- If agents not showing: Check agent store initialization

### Test 2: Agent Activation

**Objective**: Verify agent can be activated and deactivated

**Steps**:

1. Open agent panel (from Test 1)
2. Click on "Instructions" agent item
3. Verify activation indicator appears
4. Click again to deactivate
5. Verify indicator disappears

**Expected Results**:

- ✅ Agent shows active state (green indicator)
- ✅ Agent details expand when active
- ✅ Tools list becomes visible
- ✅ Agent deactivates when clicked again
- ✅ Active state persists on page refresh

**Troubleshooting**:

- If activation doesn't work: Check agent store `toggleAgent` function
- If state doesn't persist: Check localStorage in browser DevTools
- If visual indicator missing: Check CSS classes in `dashAgents.tsx`

### Test 3: Terminal Tools Toggle

**Objective**: Verify MCP/Agent tools toggle functionality

**Steps**:

1. Open terminal chat (bottom panel)
2. Type `/` to show tools menu
3. Locate toggle controls (left/right arrows)
4. Click right arrow to switch to "Agent Tools"
5. Click left arrow to switch back to "MCP Tools"
6. Use keyboard arrows to navigate

**Expected Results**:

- ✅ Toggle controls are visible
- ✅ Mode switches between "MCP Tools" and "Agent Tools"
- ✅ Tool list updates based on mode
- ✅ Keyboard navigation works
- ✅ Visual feedback shows current mode

**Troubleshooting**:

- If toggle missing: Check `toolsToggle.tsx` component integration
- If tools don't switch: Check `useChatStore` tool filtering logic
- If keyboard nav broken: Check event handlers in toggle component

### Test 4: Agent Tool Availability

**Objective**: Verify agent tools appear when agent is active

**Steps**:

1. Activate Instructions agent (from Test 2)
2. Open terminal chat
3. Type `/` and switch to "Agent Tools" mode
4. Verify `/instructions` tool appears in list
5. Deactivate agent and verify tool disappears

**Expected Results**:

- ✅ `/instructions` tool visible when agent active
- ✅ Tool shows proper description
- ✅ Tool disappears when agent deactivated
- ✅ Tool list updates in real-time
- ✅ Multiple tools shown if agent has multiple

**Troubleshooting**:

- If tools don't appear: Check agent store `getActiveAgentTools` function
- If tools don't update: Check store subscription in chat component
- If descriptions missing: Check agent tool configuration

### Test 5: Instructions Agent Execution

**Objective**: Verify Instructions agent tool executes correctly

**Steps**:

1. Activate Instructions agent
2. Switch to Agent Tools mode in terminal
3. Type `/instructions` and press Enter
4. Verify execution message appears
5. Check for generated instruction file

**Expected Results**:

- ✅ Command executes without errors
- ✅ Success message appears in chat
- ✅ Instruction document is generated
- ✅ File appears in project structure
- ✅ Content follows documentation template

**Troubleshooting**:

- If command fails: Check console for errors
- If no file generated: Check `executeInstructionsAgent` function
- If content incorrect: Check agent implementation logic
- If permission errors: Check file system access

### Test 6: File Creator Multi‑Step Flow

**Objective**: Validate multi-stage file creation (type → name → project)

**Steps**:

1. Activate File Creator agent
2. Enter `/create-file marketing launch tweet draft`
3. Observe THINKING message followed by file type selection prompt (if types ambiguous)
4. Provide file type if requested or proceed to file name input component
5. Provide file name when prompted
6. Use project selector component to choose target project
7. Confirm success message and file creation in explorer

**Expected Results**:

- ✅ THINKING role message stored
- ✅ Intermediate UI components rendered
- ✅ Pending state expires if idle > 5 min
- ✅ `.x` or `.md` file appears with template content

**Troubleshooting**:

- If no selector: Verify agent pending state flags in console
- If file not created: Check convex mutation logs for errors

### Test 7: Project Creator Flow

**Objective**: Validate project creation with optional files

**Steps**:

1. Activate Project Creator agent
2. Enter `/create-project new marketing initiative with budget 5000`
3. If prompted for name (generic), supply a descriptive name
4. Confirm project appears with number assignment

**Expected Results**:

- ✅ Project inserted in Convex (check via dev tools / logs)
- ✅ Optional initial files created when requested

### Test 8: Scheduling Agent Batch

**Objective**: Schedule unscheduled posts

**Steps**:

1. Ensure several `.x` posts exist without schedule
2. Run `/schedule --strategy optimal`
3. Verify timestamps set and status updated to scheduled

**Expected Results**:

- ✅ All eligible posts updated
- ✅ Already scheduled posts skipped

### Test 9: Error Handling

**Objective**: Verify graceful error handling

**Steps**:

1. Try executing agent tool with invalid parameters
2. Try using agent tools when no agent is active
3. Try corrupting agent store state
4. Verify error messages are user-friendly

**Expected Results**:

- ✅ Clear error messages for invalid input
- ✅ Graceful handling when no agent active
- ✅ Store recovers from corrupted state
- ✅ No console errors or crashes
- ✅ User can continue working after errors

### Test 10: State Persistence

**Objective**: Verify agent state persists across sessions

**Steps**:

1. Activate Instructions agent
2. Execute a tool
3. Refresh the browser page
4. Verify agent is still active
5. Check execution history is preserved

**Expected Results**:

- ✅ Agent remains active after refresh
- ✅ Execution history is preserved
- ✅ Tool availability is maintained
- ✅ Panel state is restored
- ✅ No duplicate store initialization

## Performance Testing

### Test 11: Large Agent Lists

**Objective**: Verify performance with multiple agents

**Steps**:

1. Add multiple test agents to store
2. Verify panel renders quickly
3. Test tool switching performance
4. Monitor memory usage

**Expected Results**:

- ✅ Panel renders in < 100ms
- ✅ Tool switching is instantaneous
- ✅ Memory usage remains stable
- ✅ No UI lag or freezing

### Test 12: Concurrent Tool Execution

**Objective**: Verify handling of multiple tool executions

**Steps**:

1. Execute agent tool multiple times rapidly
2. Try executing while previous execution is running
3. Verify execution queue handling
4. Check for race conditions

**Expected Results**:

- ✅ Executions queue properly
- ✅ No duplicate executions
- ✅ Clear feedback for each execution
- ✅ No race conditions or conflicts

## Integration Testing

### Test 10: MCP Tool Compatibility

**Objective**: Verify MCP and agent tools work together

**Steps**:

1. Use MCP tools in terminal
2. Switch to agent tools
3. Execute agent tool
4. Switch back to MCP tools
5. Verify both systems work independently

**Expected Results**:

- ✅ Both tool systems function independently
- ✅ No interference between systems
- ✅ State is maintained separately
- ✅ Switching is seamless
- ✅ Both can be used in same session

### Test 11: Editor Integration

**Objective**: Verify agent outputs integrate with editor

**Steps**:

1. Execute instructions agent
2. Check generated file appears in explorer
3. Verify file can be opened in editor
4. Check content is properly formatted

**Expected Results**:

- ✅ Generated files appear in explorer
- ✅ Files can be opened and edited
- ✅ Content follows project standards
- ✅ File structure is maintained
- ✅ No file system conflicts

## Regression Testing

### Test 12: Existing Functionality

**Objective**: Verify existing features still work

**Steps**:

1. Test all existing activity bar panels
2. Verify terminal chat MCP integration
3. Check file operations and editor
4. Test project management features

**Expected Results**:

- ✅ All existing panels work unchanged
- ✅ MCP integration remains functional
- ✅ File operations work normally
- ✅ No breaking changes to existing features

## Bug Report Template

When filing bugs, include:

```markdown
## Bug Report

**Environment**:

- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Browser version]
- OS: [macOS/Windows/Linux]
- Node Version: [if relevant]

**Steps to Reproduce**:

1. [First step]
2. [Second step]
3. [And so on...]

**Expected Behavior**:
[What you expected to happen]

**Actual Behavior**:
[What actually happened]

**Console Errors**:
```

[Any console errors or warnings]

```

**Screenshots**:
[If applicable]

**Additional Context**:
[Any other relevant information]
```

## Success Criteria

The agent system is considered fully functional when:

- ✅ All 12 test scenarios pass
- ✅ No console errors during normal use
- ✅ State persistence works reliably
- ✅ Performance meets expectations
- ✅ Integration doesn't break existing features
- ✅ Error handling is robust
- ✅ User experience is intuitive

## Post-Testing Actions

After successful testing:

1. **Document any issues found** in project issue tracker
2. **Update user documentation** with any changes
3. **Create demo video** showing agent functionality
4. **Plan next agent implementations** based on feedback
5. **Monitor production usage** for additional issues

---

This comprehensive testing guide ensures the agent system is robust, performant, and user-friendly before deployment.
