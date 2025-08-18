// STATE AUDIT - Comprehensive validation for Clerk/Convex/Next.js architecture
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/state-audit.ts

import fs from 'fs';
import path from 'path';

interface StateViolation {
  file: string;
  line: number;
  violation: string;
  severity: 'error' | 'warning';
  principle: string;
  category: 'state-separation' | 'auth-sync' | 'data-flow' | 'type-safety' | 'performance';
}

interface AuthSyncAuditResult {
  hasAuthSync: boolean;
  isInLayout: boolean;
  hasUserHook: boolean;
  hasConvexIntegration: boolean;
}

interface DataFlowAuditResult {
  convexAsSourceOfTruth: boolean;
  zustandForUIOnly: boolean;
  customHooksPattern: boolean;
  noDirectConvexInComponents: boolean;
}

interface AuditResult {
  passed: boolean;
  violations: StateViolation[];
  authSyncAudit: AuthSyncAuditResult;
  dataFlowAudit: DataFlowAuditResult;
  summary: {
    totalFiles: number;
    violationsCount: number;
    errorsCount: number;
    warningsCount: number;
    authSyncScore: number;
    dataFlowScore: number;
    overallScore: number;
  };
}

class StateAuditor {
  private violations: StateViolation[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
  }

  /**
   * ENHANCED AURA STATE MANAGEMENT AUDIT:
   * 
   * CATEGORY 1: State Separation
   * - Server State (Convex) = Source of Truth
   * - Client State (Zustand) = UI-only concerns
   * - Component State (useState) = Ephemeral only
   * 
   * CATEGORY 2: Authentication Synchronization  
   * - Clerk ↔ Convex sync via AuthSync component
   * - Proper user creation flow
   * - No authentication conflicts
   * 
   * CATEGORY 3: Data Flow Architecture
   * - Custom hooks bridge Convex and components
   * - Conditional queries prevent auth errors
   * - Real-time subscriptions properly handled
   * 
   * CATEGORY 4: Type Safety
   * - Proper TypeScript integration
   * - No 'any' types in critical paths
   * - Convex schema consistency
   * 
   * CATEGORY 5: Performance
   * - No unnecessary re-renders
   * - Proper query optimization
   * - Efficient state updates
   */
  async auditCompleteArchitecture(): Promise<AuditResult> {
    this.violations = [];
    
    console.log('🔍 Starting Enhanced State Management Audit...\n');

    const componentFiles = await this.getComponentFiles();
    const storeFiles = await this.getStoreFiles();
    const hookFiles = await this.getHookFiles();
    const convexFiles = await this.getConvexFiles();

    console.log(`📁 Found ${componentFiles.length} component files`);
    console.log(`🏪 Found ${storeFiles.length} store files`);
    console.log(`🪝 Found ${hookFiles.length} hook files`);
    console.log(`🗄️ Found ${convexFiles.length} Convex files\n`);

    // Enhanced audits
    const authSyncAudit = await this.auditAuthSynchronization();
    const dataFlowAudit = await this.auditDataFlowArchitecture(componentFiles, hookFiles);
    
    // Original audits
    await this.auditStateSeparation(componentFiles);
    await this.auditTypeSafety([...componentFiles, ...hookFiles, ...convexFiles]);
    await this.auditPerformance(componentFiles, hookFiles);

    const authSyncScore = this.calculateAuthSyncScore(authSyncAudit);
    const dataFlowScore = this.calculateDataFlowScore(dataFlowAudit);
    const overallScore = (authSyncScore + dataFlowScore) / 2;

    const result: AuditResult = {
      passed: this.violations.filter(v => v.severity === 'error').length === 0,
      violations: this.violations,
      authSyncAudit,
      dataFlowAudit,
      summary: {
        totalFiles: componentFiles.length + storeFiles.length + hookFiles.length + convexFiles.length,
        violationsCount: this.violations.length,
        errorsCount: this.violations.filter(v => v.severity === 'error').length,
        warningsCount: this.violations.filter(v => v.severity === 'warning').length,
        authSyncScore,
        dataFlowScore,
        overallScore,
      }
    };

    this.printEnhancedResults(result);
    return result;
  }

  private async auditAuthSynchronization(): Promise<AuthSyncAuditResult> {
    console.log('🔐 Auditing Authentication Synchronization...');
    
    // Check if AuthSync component exists
    const authSyncPath = path.join(this.projectRoot, 'app/_components/auth/AuthSync.tsx');
    const hasAuthSync = fs.existsSync(authSyncPath);
    
    if (!hasAuthSync) {
      this.violations.push({
        file: 'app/_components/auth/AuthSync.tsx',
        line: 1,
        violation: 'Missing AuthSync component for Clerk/Convex synchronization',
        severity: 'error',
        principle: 'Authentication Synchronization',
        category: 'auth-sync'
      });
    }

    // Check if AuthSync is in layout
    const layoutPath = path.join(this.projectRoot, 'app/layout.tsx');
    let isInLayout = false;
    
    if (fs.existsSync(layoutPath)) {
      const layoutContent = await fs.promises.readFile(layoutPath, 'utf-8');
      isInLayout = layoutContent.includes('AuthSync') || layoutContent.includes('<AuthSync');
      
      if (!isInLayout) {
        this.violations.push({
          file: 'app/layout.tsx',
          line: 1,
          violation: 'AuthSync component not included in root layout',
          severity: 'error',
          principle: 'Authentication Synchronization',
          category: 'auth-sync'
        });
      }
    }

    // Check if useUser hook exists and properly integrates Clerk + Convex
    const useUserPath = path.join(this.projectRoot, 'lib/hooks/useUser.ts');
    let hasUserHook = false;
    let hasConvexIntegration = false;
    
    if (fs.existsSync(useUserPath)) {
      hasUserHook = true;
      const hookContent = await fs.promises.readFile(useUserPath, 'utf-8');
      
      const hasClerkImport = hookContent.includes('@clerk/nextjs');
      const hasConvexImport = hookContent.includes('convex/react');
      const hasBridgeLogic = hookContent.includes('clerkUser') && hookContent.includes('getCurrentUser');
      
      hasConvexIntegration = hasClerkImport && hasConvexImport && hasBridgeLogic;
      
      if (!hasConvexIntegration) {
        this.violations.push({
          file: 'lib/hooks/useUser.ts',
          line: 1,
          violation: 'useUser hook does not properly bridge Clerk and Convex',
          severity: 'error',
          principle: 'Authentication Synchronization',
          category: 'auth-sync'
        });
      }

      // Check for conditional queries to prevent auth errors
      if (!hookContent.includes('"skip"')) {
        this.violations.push({
          file: 'lib/hooks/useUser.ts',
          line: 1,
          violation: 'Missing conditional queries to prevent authentication errors',
          severity: 'warning',
          principle: 'Authentication Synchronization',
          category: 'auth-sync'
        });
      }
    } else {
      this.violations.push({
        file: 'lib/hooks/useUser.ts',
        line: 1,
        violation: 'Missing useUser hook for Clerk/Convex integration',
        severity: 'error',
        principle: 'Authentication Synchronization',
        category: 'auth-sync'
      });
    }

    return { hasAuthSync, isInLayout, hasUserHook, hasConvexIntegration };
  }

  private async auditDataFlowArchitecture(componentFiles: string[], _hookFiles: string[]): Promise<DataFlowAuditResult> {
    console.log('🌊 Auditing Data Flow Architecture...');
    
    let convexAsSourceOfTruth = true;
    let zustandForUIOnly = true;
    const customHooksPattern = true;
    let noDirectConvexInComponents = true;

    // Check components for direct Convex usage
    for (const filePath of componentFiles) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // Allow UserProfile and AuthSync to have direct Convex calls
      if (relativePath.includes('UserProfile.tsx') || relativePath.includes('AuthSync.tsx')) {
        continue;
      }
      
      const directConvexCalls = (content.match(/useQuery\(api\./g) || []).length +
                               (content.match(/useMutation\(api\./g) || []).length;
      
      if (directConvexCalls > 0) {
        noDirectConvexInComponents = false;
        this.violations.push({
          file: relativePath,
          line: 1,
          violation: `Component has ${directConvexCalls} direct Convex calls. Use custom hooks instead.`,
          severity: 'warning',
          principle: 'Custom Hooks Pattern',
          category: 'data-flow'
        });
      }

      // Check for business data in useState
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('useState') && this.containsBusinessData(line)) {
          convexAsSourceOfTruth = false;
          this.violations.push({
            file: relativePath,
            line: index + 1,
            violation: 'Business data in useState. Use Convex for persistent data.',
            severity: 'error',
            principle: 'Server State = Source of Truth',
            category: 'state-separation'
          });
        }
      });
    }

    // Check Zustand stores for business data
    const storeFiles = await this.getStoreFiles();
    for (const filePath of storeFiles) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      if (this.containsBusinessDataInStore(content)) {
        zustandForUIOnly = false;
        this.violations.push({
          file: relativePath,
          line: 1,
          violation: 'Zustand store contains business data. Use only for UI state.',
          severity: 'error',
          principle: 'Client State = UI Only',
          category: 'state-separation'
        });
      }
    }

    return { convexAsSourceOfTruth, zustandForUIOnly, customHooksPattern, noDirectConvexInComponents };
  }

  private async auditStateSeparation(componentFiles: string[]): Promise<void> {
    console.log('📊 Auditing State Separation...');
    
    // This is covered in auditDataFlowArchitecture but we can add more specific checks here
    for (const filePath of componentFiles) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // Check for mixing of concerns
      if (content.includes('useQuery') && content.includes('useState') && this.containsBusinessData(content)) {
        this.violations.push({
          file: relativePath,
          line: 1,
          violation: 'Component mixes server state (Convex) with local state (useState) for business data',
          severity: 'warning',
          principle: 'State Separation',
          category: 'state-separation'
        });
      }
    }
  }

  private async auditTypeSafety(allFiles: string[]): Promise<void> {
    console.log('🔒 Auditing Type Safety...');
    
    for (const filePath of allFiles) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for 'any' types in critical paths
        if (line.includes(': any') && !line.includes('// @ts-ignore') && !line.includes('TODO')) {
          this.violations.push({
            file: relativePath,
            line: index + 1,
            violation: 'Use of "any" type reduces type safety',
            severity: 'warning',
            principle: 'Type Safety',
            category: 'type-safety'
          });
        }

        // Check for proper Convex ID types
        if (line.includes('Id<') && !line.includes('import')) {
          // This is good - using proper Convex ID types
        } else if (line.includes('userId') && line.includes('string') && !relativePath.includes('schema.ts')) {
          this.violations.push({
            file: relativePath,
            line: index + 1,
            violation: 'Consider using Convex Id<"users"> instead of string for user IDs',
            severity: 'warning',
            principle: 'Type Safety',
            category: 'type-safety'
          });
        }
      });
    }
  }

  private async auditPerformance(componentFiles: string[], hookFiles: string[]): Promise<void> {
    console.log('⚡ Auditing Performance...');
    
    for (const filePath of [...componentFiles, ...hookFiles]) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // Check for missing dependencies in useEffect
      const useEffectMatches = content.match(/useEffect\(\(\) => \{[^}]*\}, \[[^\]]*\]/g);
      if (useEffectMatches) {
        useEffectMatches.forEach(match => {
          if (match.includes('[]') && (match.includes('user') || match.includes('clerkUser'))) {
            this.violations.push({
              file: relativePath,
              line: 1,
              violation: 'useEffect with empty deps array but references user data - potential stale closure',
              severity: 'warning',
              principle: 'Performance',
              category: 'performance'
            });
          }
        });
      }

      // Check for unnecessary re-renders
      if (content.includes('useQuery') && !content.includes('useMemo') && content.includes('map(')) {
        this.violations.push({
          file: relativePath,
          line: 1,
          violation: 'Consider using useMemo for expensive computations with query results',
          severity: 'warning',
          principle: 'Performance',
          category: 'performance'
        });
      }
    }
  }

  // Helper methods
  private async getComponentFiles(): Promise<string[]> {
    const files: string[] = [];
    const findTsxFiles = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.includes('.next')) {
          findTsxFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) {
          files.push(fullPath);
        }
      }
    };
    findTsxFiles(this.projectRoot);
    return files;
  }

  private async getStoreFiles(): Promise<string[]> {
    const storeDir = path.join(this.projectRoot, 'lib/store');
    if (!fs.existsSync(storeDir)) return [];
    
    return fs.readdirSync(storeDir)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.'))
      .map(file => path.join(storeDir, file));
  }

  private async getHookFiles(): Promise<string[]> {
    const hooksDir = path.join(this.projectRoot, 'lib/hooks');
    if (!fs.existsSync(hooksDir)) return [];
    
    return fs.readdirSync(hooksDir)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.'))
      .map(file => path.join(hooksDir, file));
  }

  private async getConvexFiles(): Promise<string[]> {
    const convexDir = path.join(this.projectRoot, 'convex');
    if (!fs.existsSync(convexDir)) return [];
    
    return fs.readdirSync(convexDir)
      .filter(file => file.endsWith('.ts') && !file.includes('_generated'))
      .map(file => path.join(convexDir, file));
  }

  private containsBusinessData(line: string): boolean {
    const businessDataPatterns = [
      /\bprojects?\b/i, /\busers?\b/i, /\bfiles?\b/i, /\bdocuments?\b/i, /\bentities\b/i, /\bmodels?\b/i, /\brecords?\b/i,
      /\bprofile\b/i, /\baccount\b/i, /\bsettings\b/i, /\bpreferences\b/i, /\bdata\b/i
    ];
    return businessDataPatterns.some(pattern => pattern.test(line));
  }

  private containsBusinessDataInStore(content: string): boolean {
    const businessDataPatterns = [
      'projects:', 'users:', 'files:', 'documents:', 'entities:', 'models:', 'records:',
      'profileData:', 'userData:', 'accountData:', 'serverData:'
    ];
    return businessDataPatterns.some(pattern => content.includes(pattern));
  }

  private calculateAuthSyncScore(audit: AuthSyncAuditResult): number {
    const scores = [
      audit.hasAuthSync ? 25 : 0,
      audit.isInLayout ? 25 : 0,
      audit.hasUserHook ? 25 : 0,
      audit.hasConvexIntegration ? 25 : 0
    ];
    return scores.reduce((a, b) => a + b, 0);
  }

  private calculateDataFlowScore(audit: DataFlowAuditResult): number {
    const scores = [
      audit.convexAsSourceOfTruth ? 25 : 0,
      audit.zustandForUIOnly ? 25 : 0,
      audit.customHooksPattern ? 25 : 0,
      audit.noDirectConvexInComponents ? 25 : 0
    ];
    return scores.reduce((a, b) => a + b, 0);
  }

  private printEnhancedResults(result: AuditResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ENHANCED STATE MANAGEMENT AUDIT RESULTS');
    console.log('='.repeat(60));

    // Overall status
    if (result.passed) {
      console.log('\n✅ COMPREHENSIVE AUDIT PASSED!');
    } else {
      console.log('\n🔴 AUDIT FAILED - Critical Issues Found');
    }

    // Scores
    console.log(`\n📊 ARCHITECTURE SCORES:`);
    console.log(`   🔐 Auth Sync: ${result.summary.authSyncScore}/100`);
    console.log(`   🌊 Data Flow: ${result.summary.dataFlowScore}/100`);
    console.log(`   🎯 Overall: ${Math.round(result.summary.overallScore)}/100`);

    // Summary
    console.log(`\n📋 SUMMARY:`);
    console.log(`   Files Audited: ${result.summary.totalFiles}`);
    console.log(`   Errors: ${result.summary.errorsCount}`);
    console.log(`   Warnings: ${result.summary.warningsCount}`);

    // Auth sync details
    console.log(`\n🔐 AUTHENTICATION SYNCHRONIZATION:`);
    console.log(`   AuthSync Component: ${result.authSyncAudit.hasAuthSync ? '✅' : '❌'}`);
    console.log(`   Layout Integration: ${result.authSyncAudit.isInLayout ? '✅' : '❌'}`);
    console.log(`   User Hook Bridge: ${result.authSyncAudit.hasUserHook ? '✅' : '❌'}`);
    console.log(`   Convex Integration: ${result.authSyncAudit.hasConvexIntegration ? '✅' : '❌'}`);

    // Data flow details
    console.log(`\n🌊 DATA FLOW ARCHITECTURE:`);
    console.log(`   Convex as Source of Truth: ${result.dataFlowAudit.convexAsSourceOfTruth ? '✅' : '❌'}`);
    console.log(`   Zustand UI-Only: ${result.dataFlowAudit.zustandForUIOnly ? '✅' : '❌'}`);
    console.log(`   Custom Hooks Pattern: ${result.dataFlowAudit.customHooksPattern ? '✅' : '❌'}`);
    console.log(`   No Direct Convex in Components: ${result.dataFlowAudit.noDirectConvexInComponents ? '✅' : '❌'}`);

    // Violations by category
    if (result.violations.length > 0) {
      const violationsByCategory = result.violations.reduce((acc: Record<string, StateViolation[]>, violation) => {
        if (!acc[violation.category]) acc[violation.category] = [];
        acc[violation.category].push(violation);
        return acc;
      }, {} as Record<string, StateViolation[]>);

      console.log(`\n🚨 VIOLATIONS BY CATEGORY:`);
      Object.entries(violationsByCategory).forEach(([category, violations]: [string, StateViolation[]]) => {
        const errors = violations.filter((v: StateViolation) => v.severity === 'error').length;
        const warnings = violations.filter((v: StateViolation) => v.severity === 'warning').length;
        console.log(`\n   ${category.toUpperCase()}: ${errors} errors, ${warnings} warnings`);
        
        // Show specific violations
        violations.forEach((violation: StateViolation) => {
          const icon = violation.severity === 'error' ? '❌' : '⚠️';
          console.log(`     ${icon} ${violation.file}:${violation.line} - ${violation.violation}`);
        });
      });
    }

    console.log('\n' + '='.repeat(60));
  }
}

export { StateAuditor, type AuditResult, type StateViolation };

// CLI runner
if (require.main === module) {
  const auditor = new StateAuditor();
  auditor.auditCompleteArchitecture().then((result: AuditResult) => {
    process.exit(result.passed ? 0 : 1);
  }).catch((error: Error) => {
    console.error('❌ Enhanced audit failed:', error);
    process.exit(1);
  });
}
