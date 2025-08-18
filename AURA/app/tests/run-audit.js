#!/usr/bin/env node

// STATE AUDIT CLI - Direct Node.js runner
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/run-audit.js

const fs = require('fs');
const path = require('path');

class StateAuditor {
  constructor() {
    this.violations = [];
    this.projectRoot = path.resolve(__dirname, '../../');
  }

  async auditStateManagement() {
    this.violations = [];
    
    console.log('🔍 Starting State Management Audit...\n');

    const componentFiles = await this.getComponentFiles();
    const storeFiles = await this.getStoreFiles();

    console.log(`📁 Found ${componentFiles.length} component files`);
    console.log(`🏪 Found ${storeFiles.length} store files\n`);

    // Audit each file type
    for (const file of componentFiles) {
      await this.auditComponentFile(file);
    }

    for (const file of storeFiles) {
      await this.auditStoreFile(file);
    }

    const result = {
      passed: this.violations.filter(v => v.severity === 'error').length === 0,
      violations: this.violations,
      summary: {
        totalFiles: componentFiles.length + storeFiles.length,
        violationsCount: this.violations.length,
        errorsCount: this.violations.filter(v => v.severity === 'error').length,
        warningsCount: this.violations.filter(v => v.severity === 'warning').length,
      }
    };

    this.printAuditResults(result);
    return result;
  }

  async getComponentFiles() {
    const files = [];
    
    const findTsxFiles = (dir) => {
      try {
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
      } catch (error) {
        // Directory doesn't exist or can't read
      }
    };

    const appDir = path.join(this.projectRoot, 'app');
    const componentsDir = path.join(this.projectRoot, 'components');

    if (fs.existsSync(appDir)) findTsxFiles(appDir);
    if (fs.existsSync(componentsDir)) findTsxFiles(componentsDir);

    return files;
  }

  async getStoreFiles() {
    const storeDir = path.join(this.projectRoot, 'lib', 'store');
    if (!fs.existsSync(storeDir)) return [];

    return fs.readdirSync(storeDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(storeDir, file));
  }

  async auditComponentFile(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectRoot, filePath);

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // VIOLATION: Direct Convex queries in components
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
      if (trimmedLine.includes('useState') && 
          !trimmedLine.includes('import') && 
          this.containsBusinessData(trimmedLine)) {
        this.violations.push({
          file: relativePath,
          line: lineNumber,
          violation: 'Business data stored in useState. Use Convex for persistent data.',
          severity: 'error',
          principle: 'Rule 1: Convex for Persistent Data'
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

  async auditStoreFile(filePath) {
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
          (trimmedLine.includes('api.') && !trimmedLine.includes('// api.'))) {
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

  containsBusinessData(line) {
    const businessDataPatterns = [
      /projects?/i,
      /users?/i,
      /documents?/i,
      /entities/i,
      /models?/i,
      /records?/i
    ];

    // Exclude terminal/editor UI patterns
    const uiExclusions = [
      /terminal/i,
      /editor/i,
      /line/i,
      /command/i,
      /output/i,
      /input/i
    ];

    return businessDataPatterns.some(pattern => pattern.test(line)) &&
           !this.isUIRelated(line) &&
           !uiExclusions.some(pattern => pattern.test(line));
  }

  containsBusinessDataFields(line) {
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

  isUIRelated(line) {
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

  printAuditResults(result) {
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
      }, {});

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
