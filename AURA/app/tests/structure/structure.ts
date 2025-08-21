// STRUCTURE TEST - Basic project structure validation for AURA
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/structure/structure.ts

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface StructureResults {
  coreDirectories: { path: string; exists: boolean; fileCount?: number }[];
  coreFiles: { path: string; exists: boolean; size?: number }[];
  summary: {
    totalDirectories: number;
    existingDirectories: number;
    totalFiles: number;
    existingFiles: number;
  };
  issues: string[];
  recommendations: string[];
}

class StructureValidator {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  validate(): StructureResults {
    console.log('🏗️  Validating AURA project structure...\n');

    const results: StructureResults = {
      coreDirectories: [],
      coreFiles: [],
      summary: { totalDirectories: 0, existingDirectories: 0, totalFiles: 0, existingFiles: 0 },
      issues: [],
      recommendations: []
    };

    // Define expected structure
    const expectedDirectories = [
      'app',
      'app/_components',
      'app/_components/activity',
      'app/_components/dashboard',
      'app/_components/editor',
      'app/_components/sidebar',
      'app/_components/terminal',
      'components',
      'components/ui',
      'convex',
      'lib',
      'lib/hooks',
      'lib/store',
      'lib/agents',
      'lib/extensions',
      'public'
    ];

    const expectedFiles = [
      'package.json',
      'next.config.ts',
      'tsconfig.json',
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      'convex/schema.ts',
      'lib/utils.ts',
      'lib/store/index.ts',
      'lib/hooks/index.ts'
    ];

    // Check directories
    results.coreDirectories = expectedDirectories.map(dir => {
      const fullPath = join(this.rootPath, dir);
      const exists = existsSync(fullPath);
      let fileCount = 0;

      if (exists) {
        try {
          const contents = readdirSync(fullPath);
          fileCount = contents.filter(item => {
            const itemPath = join(fullPath, item);
            return statSync(itemPath).isFile();
          }).length;
        } catch (error) {
          // Directory exists but can't read it
        }
      }

      return {
        path: dir,
        exists,
        fileCount: exists ? fileCount : undefined
      };
    });

    // Check files
    results.coreFiles = expectedFiles.map(file => {
      const fullPath = join(this.rootPath, file);
      const exists = existsSync(fullPath);
      let size = 0;

      if (exists) {
        try {
          const stats = statSync(fullPath);
          size = stats.size;
        } catch (error) {
          // File exists but can't read stats
        }
      }

      return {
        path: file,
        exists,
        size: exists ? size : undefined
      };
    });

    // Generate summary
    results.summary = {
      totalDirectories: results.coreDirectories.length,
      existingDirectories: results.coreDirectories.filter(d => d.exists).length,
      totalFiles: results.coreFiles.length,
      existingFiles: results.coreFiles.filter(f => f.exists).length
    };

    // Identify issues
    results.issues = this.identifyIssues(results);
    
    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  private identifyIssues(results: StructureResults): string[] {
    const issues: string[] = [];

    // Missing critical directories
    const missingDirs = results.coreDirectories.filter(d => !d.exists);
    missingDirs.forEach(dir => {
      if (['app', 'convex', 'lib'].includes(dir.path)) {
        issues.push(`Critical directory missing: ${dir.path}`);
      } else {
        issues.push(`Directory missing: ${dir.path}`);
      }
    });

    // Missing critical files
    const missingFiles = results.coreFiles.filter(f => !f.exists);
    missingFiles.forEach(file => {
      if (['package.json', 'app/layout.tsx', 'convex/schema.ts'].includes(file.path)) {
        issues.push(`Critical file missing: ${file.path}`);
      } else {
        issues.push(`File missing: ${file.path}`);
      }
    });

    // Empty directories that should have content
    const emptyImportantDirs = results.coreDirectories.filter(d => 
      d.exists && d.fileCount === 0 && 
      ['components/ui', 'lib/hooks', 'lib/store'].includes(d.path)
    );
    emptyImportantDirs.forEach(dir => {
      issues.push(`Important directory is empty: ${dir.path}`);
    });

    return issues;
  }

  private generateRecommendations(results: StructureResults): string[] {
    const recommendations: string[] = [];

    // Completeness recommendations
    if (results.summary.existingDirectories < results.summary.totalDirectories) {
      recommendations.push('Consider creating missing directories to follow AURA project structure');
    }

    if (results.summary.existingFiles < results.summary.totalFiles) {
      recommendations.push('Some core files are missing - review project setup');
    }

    // Structure recommendations
    const hasComponents = results.coreDirectories.find(d => d.path === 'components' && d.exists);
    const hasUI = results.coreDirectories.find(d => d.path === 'components/ui' && d.exists);
    
    if (hasComponents && hasUI && hasUI.fileCount === 0) {
      recommendations.push('Add Shadcn UI components to components/ui directory');
    }

    const hasHooks = results.coreDirectories.find(d => d.path === 'lib/hooks' && d.exists);
    if (hasHooks && hasHooks.fileCount === 0) {
      recommendations.push('Create custom hooks for Convex data management');
    }

    const hasStore = results.coreDirectories.find(d => d.path === 'lib/store' && d.exists);
    if (hasStore && hasStore.fileCount === 0) {
      recommendations.push('Set up Zustand stores for UI state management');
    }

    return recommendations;
  }

  printResults(results: StructureResults): void {
    console.log('📊 AURA Project Structure Validation Results\n');
    console.log('=' .repeat(50));
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`   Directories: ${results.summary.existingDirectories}/${results.summary.totalDirectories} exist`);
    console.log(`   Core Files: ${results.summary.existingFiles}/${results.summary.totalFiles} exist`);
    console.log(`   Issues Found: ${results.issues.length}`);
    
    // Directory status
    console.log('\n📁 Directory Status:');
    results.coreDirectories.forEach(dir => {
      const status = dir.exists ? '✅' : '❌';
      const fileInfo = dir.exists && dir.fileCount !== undefined ? ` (${dir.fileCount} files)` : '';
      console.log(`   ${status} ${dir.path}${fileInfo}`);
    });
    
    // File status
    console.log('\n📄 Core File Status:');
    results.coreFiles.forEach(file => {
      const status = file.exists ? '✅' : '❌';
      const sizeInfo = file.exists && file.size !== undefined ? ` (${Math.round(file.size / 1024)}KB)` : '';
      console.log(`   ${status} ${file.path}${sizeInfo}`);
    });
    
    // Issues
    if (results.issues.length > 0) {
      console.log('\n⚠️  Issues:');
      results.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
    
    // Recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    // Health check
    const directoryHealth = (results.summary.existingDirectories / results.summary.totalDirectories) * 100;
    const fileHealth = (results.summary.existingFiles / results.summary.totalFiles) * 100;
    const overallHealth = Math.round((directoryHealth + fileHealth) / 2);
    
    const healthEmoji = overallHealth >= 90 ? '🟢' : overallHealth >= 70 ? '🟡' : '🔴';
    
    console.log(`\n${healthEmoji} Project Structure Health: ${overallHealth}%`);
    
    if (results.issues.length === 0) {
      console.log('\n✅ Project structure looks good!');
    } else {
      console.log(`\n⚠️  Found ${results.issues.length} structural issue(s).`);
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the validation
function runValidation() {
  const validator = new StructureValidator(process.cwd());
  
  try {
    const results = validator.validate();
    validator.printResults(results);
    
    // Exit with appropriate code
    process.exit(results.issues.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Structure validation failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runValidation();
}
