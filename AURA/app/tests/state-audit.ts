// STATE AUDIT RUNNER - Standalone state management validation
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/state-audit.ts

import fs from 'fs';
import path from 'path';

interface StateViolation {
  file: string;
  line: number;
  violation: string;
  severity: 'error' | 'warning';
  principle: string;
}

interface AuditResult {
  passed: boolean;
  violations: StateViolation[];
  summary: {
    totalFiles: number;
    violationsCount: number;
    errorsCount: number;
    warningsCount: number;
  };
}

class StateAuditor {
  private violations: StateViolation[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
  }

  /**
   * AURA STATE MANAGEMENT PRINCIPLES:
   * 
   * PRINCIPLE 1: Server State (Convex) = Source of Truth
   * PRINCIPLE 2: Client State (Zustand) = UI-only concerns  
   * PRINCIPLE 3: No business data in Zustand stores
   * PRINCIPLE 4: Use custom hooks for Convex queries
   * PRINCIPLE 5: Component state only for ephemeral UI
   */
  async auditStateManagement(): Promise<AuditResult> {
    this.violations = [];
    
    console.log('🔍 Starting State Management Audit...\n');

    const componentFiles = await this.getComponentFiles();
    const storeFiles = await this.getStoreFiles();
    const hookFiles = await this.getHookFiles();

    console.log(`📁 Found ${componentFiles.length} component files`);
    console.log(`🏪 Found ${storeFiles.length} store files`);
    console.log(`🪝 Found ${hookFiles.length} hook files\n`);

    // Audit each file type
    for (const file of componentFiles) {
      await this.auditComponentFile(file);
    }

    for (const file of storeFiles) {
      await this.auditStoreFile(file);
    }

    for (const file of hookFiles) {
      await this.auditHookFile(file);
    }

    // Check for missing custom hooks
    await this.auditMissingCustomHooks(componentFiles);

    const result: AuditResult = {
      passed: this.violations.filter(v => v.severity === 'error').length === 0,
      violations: this.violations,
      summary: {
        totalFiles: componentFiles.length + storeFiles.length + hookFiles.length,
        violationsCount: this.violations.length,
        errorsCount: this.violations.filter(v => v.severity === 'error').length,
        warningsCount: this.violations.filter(v => v.severity === 'warning').length,
      }
    };

    this.printAuditResults(result);
    return result;
  }

  private async getComponentFiles(): Promise<string[]> {
    const files: string[] = [];
    
    // Recursively find .tsx files
    const findTsxFiles = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && 
            !entry.name.includes('node_modules') && 
            !entry.name.includes('.next') &&
            !entry.name.includes('tests')) {
          findTsxFiles(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };

    // Search in app and components directories
    const appDir = path.join(this.projectRoot, 'app');
    const componentsDir = path.join(this.projectRoot, 'components');

    if (fs.existsSync(appDir)) findTsxFiles(appDir);
    if (fs.existsSync(componentsDir)) findTsxFiles(componentsDir);

    return files;
  }

  private async getStoreFiles(): Promise<string[]> {
    const storeDir = path.join(this.projectRoot, 'lib', 'store');
    if (!fs.existsSync(storeDir)) return [];

    return fs.readdirSync(storeDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(storeDir, file));
  }

  private async getHookFiles(): Promise<string[]> {
    const hooksDir = path.join(this.projectRoot, 'lib', 'hooks');
    if (!fs.existsSync(hooksDir)) return [];

    return fs.readdirSync(hooksDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(hooksDir, file));
  }

  private async auditComponentFile(filePath: string): Promise<void> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectRoot, filePath);

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // VIOLATION: Direct Convex queries in components (should use custom hooks)
      if (trimmedLine.includes('useQuery(api.') || trimmedLine.includes('useMutation(api.')) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'Direct Convex API usage in component. Use custom hooks instead.',
          severity: 'error',
          principle: 'Rule 4: Custom Hooks Pattern'
        });
      }

      // VIOLATION: Business data in useState
      if (trimmedLine.includes('useState') && this.containsBusinessData(trimmedLine)) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'Business data stored in useState. Use Convex for persistent data.',
          severity: 'error',
          principle: 'Rule 1: Convex for Persistent Data'
        });
      }

      // WARNING: Potential business data in client store
      if (trimmedLine.includes('useStore') && this.containsBusinessData(trimmedLine)) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'Potential business data in client store. Verify this is UI-only.',
          severity: 'warning',
          principle: 'Rule 2: Zustand for UI State Only'
        });
      }

      // VIOLATION: Missing 'use client' directive
      if ((trimmedLine.includes('useState') || trimmedLine.includes('useEffect') || trimmedLine.includes('useStore')) 
          && !content.includes('"use client"') && !content.includes("'use client'")
          && !filePath.includes('layout.tsx')) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'Client-side hooks used without "use client" directive.',
          severity: 'error',
          principle: 'React Server Components Pattern'
        });
      }
    });
  }

  private async auditStoreFile(filePath: string): Promise<void> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectRoot, filePath);

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // VIOLATION: Business data fields in Zustand store
      if (this.containsBusinessDataFields(trimmedLine)) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'Business data field detected in Zustand store. Move to Convex.',
          severity: 'error',
          principle: 'Rule 3: No Business Data in Zustand'
        });
      }

      // VIOLATION: API calls in Zustand store
      if (trimmedLine.includes('fetch(') || trimmedLine.includes('axios.') || 
          trimmedLine.includes('api.') && !trimmedLine.includes('// api.')) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'API calls should not be in Zustand stores. Use Convex or custom hooks.',
          severity: 'error',
          principle: 'Rule 2: Zustand for UI State Only'
        });
      }
    });

    // Check if store has proper TypeScript interfaces
    if (!content.includes('interface ') && !content.includes('type ')) {
      this.violations.push({
        file: relativePath,
        line: 1,
        violation: 'Store missing TypeScript interface definition.',
        severity: 'warning',
        principle: 'TypeScript Best Practices'
      });
    }
  }

  private async auditHookFile(filePath: string): Promise<void> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectRoot, filePath);

    // Check if custom hooks follow proper pattern
    if (!content.includes('useQuery') && !content.includes('useMutation')) {
      this.violations.push({
        file: relativePath,
        line: 1,
        violation: 'Custom hook should wrap Convex queries/mutations.',
        severity: 'warning',
        principle: 'Rule 4: Custom Hooks Pattern'
      });
    }

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // WARNING: Direct state management in hooks (should delegate to stores/Convex)
      if (trimmedLine.includes('useState') && !trimmedLine.includes('optimistic')) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'Custom hooks should not manage state directly unless for optimistic updates.',
          severity: 'warning',
          principle: 'Rule 4: Custom Hooks Pattern'
        });
      }
    });
  }

  private async auditMissingCustomHooks(componentFiles: string[]): Promise<void> {
    for (const filePath of componentFiles) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.projectRoot, filePath);

      // Count direct Convex usage
      const directConvexUsage = (content.match(/useQuery\(api\./g) || []).length +
                               (content.match(/useMutation\(api\./g) || []).length;

      if (directConvexUsage > 2) {
        this.violations.push({
          file: relativePath,
          line: 1,
          violation: `Component has ${directConvexUsage} direct Convex calls. Consider creating custom hooks.`,
          severity: 'warning',
          principle: 'Rule 4: Custom Hooks Pattern'
        });
      }
    }
  }

  private containsBusinessData(line: string): boolean {
    const businessDataPatterns = [
      /projects?/i,
      /users?/i,
      /files?/i,
      /documents?/i,
      /entities/i,
      /models?/i,
      /records?/i,
      /items?/i
    ];

    return businessDataPatterns.some(pattern => pattern.test(line)) &&
           !this.isUIRelated(line);
  }

  private containsBusinessDataFields(line: string): boolean {
    const businessFieldPatterns = [
      /projects:\s*\[/,
      /users:\s*\[/,
      /files:\s*\[/,
      /documents:\s*\[/,
      /data:\s*\[/,
      /setProjects/,
      /setUsers/,
      /setFiles/,
      /fetchProjects/,
      /fetchUsers/,
      /fetchData/
    ];

    return businessFieldPatterns.some(pattern => pattern.test(line));
  }

  private isUIRelated(line: string): boolean {
    const uiPatterns = [
      /modal/i,
      /sidebar/i,
      /dropdown/i,
      /panel/i,
      /tab/i,
      /theme/i,
      /ui/i,
      /active/i,
      /selected/i,
      /open/i,
      /collapsed/i,
      /expanded/i,
      /terminal/i,
      /editor/i
    ];

    return uiPatterns.some(pattern => pattern.test(line));
  }

  private printAuditResults(result: AuditResult): void {
    console.log('\n' + '='.repeat(50));
    console.log('🔍 STATE MANAGEMENT AUDIT RESULTS');
    console.log('='.repeat(50));

    if (result.passed) {
      console.log('\n✅ AUDIT PASSED!');
      console.log(`   Files Audited: ${result.summary.totalFiles}`);
      console.log(`   No critical violations found.`);
      
      if (result.summary.warningsCount > 0) {
        console.log(`   Warnings: ${result.summary.warningsCount} (non-blocking)`);
      }
    } else {
      console.log('\n🔴 AUDIT FAILED!');
      console.log(`   Files Audited: ${result.summary.totalFiles}`);
      console.log(`   Errors: ${result.summary.errorsCount}`);
      console.log(`   Warnings: ${result.summary.warningsCount}`);
    }

    if (result.violations.length > 0) {
      // Group violations by principle
      const violationsByPrinciple = result.violations.reduce((acc, violation) => {
        if (!acc[violation.principle]) {
          acc[violation.principle] = [];
        }
        acc[violation.principle].push(violation);
        return acc;
      }, {} as Record<string, StateViolation[]>);

      console.log('\n📋 VIOLATIONS BY PRINCIPLE:');
      console.log('-'.repeat(30));

      Object.entries(violationsByPrinciple).forEach(([principle, violations]) => {
        const errors = violations.filter(v => v.severity === 'error').length;
        const warnings = violations.filter(v => v.severity === 'warning').length;
        
        console.log(`\n${principle}`);
        console.log(`  Errors: ${errors}, Warnings: ${warnings}`);
        
        violations.forEach(violation => {
          const icon = violation.severity === 'error' ? '❌' : '⚠️';
          console.log(`  ${icon} ${violation.file}:${violation.line} - ${violation.violation}`);
        });
      });
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Export for programmatic use
export { StateAuditor, type AuditResult, type StateViolation };

// CLI runner
if (require.main === module) {
  const auditor = new StateAuditor();
  auditor.auditStateManagement().then(result => {
    process.exit(result.passed ? 0 : 1);
  }).catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });
}
