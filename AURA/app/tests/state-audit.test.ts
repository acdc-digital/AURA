// STATE AUDIT TEST RUNNER - Jest-compatible test wrapper
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/state-audit.test.ts

import { StateAuditor, type AuditResult } from './state-audit';

describe('State Management Audit', () => {
  let auditor: StateAuditor;
  let auditResult: AuditResult;

  beforeAll(async () => {
    auditor = new StateAuditor();
    auditResult = await auditor.auditStateManagement();
  }, 30000); // 30 second timeout for file scanning

  it('should pass the overall state management audit', () => {
    expect(auditResult.passed).toBe(true);
  });

  it('should have zero critical state management violations', () => {
    const criticalViolations = auditResult.violations.filter(v => v.severity === 'error');
    
    if (criticalViolations.length > 0) {
      console.log('\n� CRITICAL VIOLATIONS FOUND:');
      criticalViolations.forEach(violation => {
        console.log(`❌ ${violation.file}:${violation.line} - ${violation.violation}`);
      });
    }
    
    expect(criticalViolations.length).toBe(0);
  });

  it('should follow the Server State = Source of Truth principle', () => {
    const serverStateViolations = auditResult.violations.filter(
      v => v.principle === 'Rule 1: Convex for Persistent Data' && v.severity === 'error'
    );
    expect(serverStateViolations.length).toBe(0);
  });

  it('should follow the Client State = UI-only principle', () => {
    const clientStateViolations = auditResult.violations.filter(
      v => v.principle === 'Rule 2: Zustand for UI State Only' && v.severity === 'error'
    );
    expect(clientStateViolations.length).toBe(0);
  });

  it('should not have business data in Zustand stores', () => {
    const businessDataViolations = auditResult.violations.filter(
      v => v.principle === 'Rule 3: No Business Data in Zustand' && v.severity === 'error'
    );
    expect(businessDataViolations.length).toBe(0);
  });

  it('should use custom hooks for Convex operations', () => {
    const customHookViolations = auditResult.violations.filter(
      v => v.principle === 'Rule 4: Custom Hooks Pattern' && v.severity === 'error'
    );
    expect(customHookViolations.length).toBe(0);
  });
});
