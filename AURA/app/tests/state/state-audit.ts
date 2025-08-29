// STATE AUDIT - Comprehensive audit tool for AURA application state management
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/state/state-audit.ts

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface StateStore {
  name: string;
  path: string;
  exports: string[];
  hooks: string[];
  types: string[];
  issues: string[];
}

interface Hook {
  name: string;
  path: string;
  dependencies: string[];
  returnType: string | null;
  issues: string[];
}

interface ConvexFunction {
  name: string;
  type: 'query' | 'mutation' | 'action';
  path: string;
  issues: string[];
}

interface AuditResults {
  stores: StateStore[];
  hooks: Hook[];
  convexFunctions: ConvexFunction[];
  summary: {
    totalStores: number;
    totalHooks: number;
    totalConvexFunctions: number;
    totalIssues: number;
  };
  recommendations: string[];
}

class StateAuditor {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  async audit(): Promise<AuditResults> {
    console.log('🔍 Starting AURA State Management Audit...\n');

    const results: AuditResults = {
      stores: [],
      hooks: [],
      convexFunctions: [],
      summary: {
        totalStores: 0,
        totalHooks: 0,
        totalConvexFunctions: 0,
        totalIssues: 0
      },
      recommendations: []
    };

    try {
      // Audit Zustand stores
      results.stores = await this.auditStores();
      
      // Audit custom hooks
      results.hooks = await this.auditHooks();
      
      // Audit Convex functions
      results.convexFunctions = await this.auditConvexFunctions();
      
      // Generate summary
      results.summary = this.generateSummary(results);
      
      // Generate recommendations
      results.recommendations = this.generateRecommendations(results);
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      throw error;
    }

    return results;
  }

  private async auditStores(): Promise<StateStore[]> {
    console.log('📦 Auditing Zustand stores...');
    const stores: StateStore[] = [];
    
    try {
      const storeFiles = await glob('lib/store/*.ts', { cwd: this.rootPath });
      
      for (const filePath of storeFiles) {
        if (filePath.endsWith('index.ts')) continue;
        
        const fullPath = join(this.rootPath, filePath);
        const content = readFileSync(fullPath, 'utf-8');
        
        const store: StateStore = {
          name: filePath.replace('lib/store/', '').replace('.ts', ''),
          path: filePath,
          exports: this.extractExports(content),
          hooks: this.extractHooks(content),
          types: this.extractTypes(content),
          issues: []
        };
        
        // Check for common issues
        store.issues = this.validateStore(content, store.name);
        
        stores.push(store);
      }
    } catch (error) {
      console.warn('⚠️  Could not find store files:', error);
    }
    
    console.log(`   Found ${stores.length} store(s)`);
    return stores;
  }

  private async auditHooks(): Promise<Hook[]> {
    console.log('🎣 Auditing custom hooks...');
    const hooks: Hook[] = [];
    
    try {
      const hookFiles = await glob('lib/hooks/*.ts', { cwd: this.rootPath });
      
      for (const filePath of hookFiles) {
        if (filePath.endsWith('index.ts')) continue;
        
        const fullPath = join(this.rootPath, filePath);
        const content = readFileSync(fullPath, 'utf-8');
        
        const hook: Hook = {
          name: filePath.replace('lib/hooks/', '').replace('.ts', ''),
          path: filePath,
          dependencies: this.extractDependencies(content),
          returnType: this.extractReturnType(content),
          issues: []
        };
        
        // Check for common issues
        hook.issues = this.validateHook(content, hook.name);
        
        hooks.push(hook);
      }
    } catch (error) {
      console.warn('⚠️  Could not find hook files:', error);
    }
    
    console.log(`   Found ${hooks.length} hook(s)`);
    return hooks;
  }

  private async auditConvexFunctions(): Promise<ConvexFunction[]> {
    console.log('🗄️  Auditing Convex functions...');
    const functions: ConvexFunction[] = [];
    
    try {
      const convexFiles = await glob('convex/*.ts', { cwd: this.rootPath });
      
      for (const filePath of convexFiles) {
        if (filePath.includes('_generated') || filePath.endsWith('config.ts') || filePath.endsWith('schema.ts')) continue;
        
        const fullPath = join(this.rootPath, filePath);
        const content = readFileSync(fullPath, 'utf-8');
        
        const fileFunctions = this.extractConvexFunctions(content, filePath);
        functions.push(...fileFunctions);
      }
    } catch (error) {
      console.warn('⚠️  Could not find Convex files:', error);
    }
    
    console.log(`   Found ${functions.length} Convex function(s)`);
    return functions;
  }

  private extractExports(content: string): string[] {
    const exportMatches = content.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g) || [];
    return exportMatches.map(match => match.split(/\s+/).pop() || '');
  }

  private extractHooks(content: string): string[] {
    const hookMatches = content.match(/use\w+/g) || [];
    return [...new Set(hookMatches)];
  }

  private extractTypes(content: string): string[] {
    const typeMatches = content.match(/(?:interface|type)\s+(\w+)/g) || [];
    return typeMatches.map(match => match.split(/\s+/)[1]);
  }

  private extractDependencies(content: string): string[] {
    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    return importMatches.map(match => {
      const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/);
      return moduleMatch ? moduleMatch[1] : '';
    }).filter(Boolean);
  }

  private extractReturnType(content: string): string | null {
    const returnTypeMatch = content.match(/export\s+function\s+use\w+\([^)]*\):\s*([^{]+)/);
    return returnTypeMatch ? returnTypeMatch[1].trim() : null;
  }

  private extractConvexFunctions(content: string, filePath: string): ConvexFunction[] {
    const functions: ConvexFunction[] = [];
    
    // Match query, mutation, and action exports
    const queryMatches = content.match(/export\s+const\s+(\w+)\s*=\s*query/g) || [];
    const mutationMatches = content.match(/export\s+const\s+(\w+)\s*=\s*mutation/g) || [];
    const actionMatches = content.match(/export\s+const\s+(\w+)\s*=\s*action/g) || [];
    
    queryMatches.forEach(match => {
      const name = match.match(/const\s+(\w+)/)?.[1];
      if (name) {
        functions.push({
          name,
          type: 'query',
          path: filePath,
          issues: this.validateConvexFunction(content, name, 'query')
        });
      }
    });
    
    mutationMatches.forEach(match => {
      const name = match.match(/const\s+(\w+)/)?.[1];
      if (name) {
        functions.push({
          name,
          type: 'mutation',
          path: filePath,
          issues: this.validateConvexFunction(content, name, 'mutation')
        });
      }
    });
    
    actionMatches.forEach(match => {
      const name = match.match(/const\s+(\w+)/)?.[1];
      if (name) {
        functions.push({
          name,
          type: 'action',
          path: filePath,
          issues: this.validateConvexFunction(content, name, 'action')
        });
      }
    });
    
    return functions;
  }

  private validateStore(content: string, storeName: string): string[] {
    const issues: string[] = [];
    
    // Check if store uses create from zustand (support both create() and create<Type>()())
    if (!content.includes('create(') && !content.includes('create<')) {
      issues.push('Does not use zustand create pattern');
    }
    
    // Check if store has proper TypeScript interface
    if (!content.includes('interface') && !content.includes('type')) {
      issues.push('Missing TypeScript interface/type definition');
    }
    
    // Check for business data (should be in Convex, not Zustand)
    const businessDataPatterns = ['users', 'projects', 'files', 'posts'];
    // Exclude specific UI-related patterns that contain "data" but are UI state
    const uiDataPatterns = ['thinkingData', 'formData', 'modalData', 'dragData', 'resizeData', 'editorData'];
    
    businessDataPatterns.forEach(pattern => {
      if (content.includes(pattern) && !storeName.includes('ui') && !storeName.includes('editor') && !storeName.includes('sidebar')) {
        issues.push(`May contain business data (${pattern}) - should use Convex instead`);
      }
    });
    
    // Check for generic "data" but exclude UI-related data patterns
    if (content.includes('data') && !storeName.includes('ui') && !storeName.includes('editor') && !storeName.includes('sidebar')) {
      const hasUIDataPattern = uiDataPatterns.some(pattern => content.includes(pattern));
      if (!hasUIDataPattern) {
        issues.push(`May contain business data (data) - should use Convex instead`);
      }
    }
    
    
    return issues;
  }

  private validateHook(content: string, hookName: string): string[] {
    const issues: string[] = [];
    
    // Check if hook uses Convex properly
    if (content.includes('useQuery') && !content.includes('api.')) {
      issues.push('Uses useQuery but missing proper API import');
    }
    
    // Check if hook has proper error handling (only needed for mutations or async operations)
    if (content.includes('useMutation') && !content.includes('try') && !content.includes('catch')) {
      issues.push('Missing error handling for Convex operations');
    }
    
    // Check if hook has proper TypeScript return type
    if (!content.includes('export function') || !content.includes(':')) {
      issues.push('Missing explicit TypeScript return type');
    }
    
    return issues;
  }

  private validateConvexFunction(content: string, functionName: string, type: string): string[] {
    const issues: string[] = [];
    
    // Check if function has proper argument validation
    if (!content.includes('v.') && type !== 'action') {
      issues.push('Missing Convex validator for arguments');
    }
    
    // Check if function has proper error handling
    if (!content.includes('ConvexError') && (content.includes('throw') || content.includes('error'))) {
      issues.push('Should use ConvexError for application errors');
    }
    
    return issues;
  }

  private generateSummary(results: AuditResults) {
    const totalIssues = results.stores.reduce((sum, store) => sum + store.issues.length, 0) +
                       results.hooks.reduce((sum, hook) => sum + hook.issues.length, 0) +
                       results.convexFunctions.reduce((sum, fn) => sum + fn.issues.length, 0);

    return {
      totalStores: results.stores.length,
      totalHooks: results.hooks.length,
      totalConvexFunctions: results.convexFunctions.length,
      totalIssues
    };
  }

  private generateRecommendations(results: AuditResults): string[] {
    const recommendations: string[] = [];
    
    // Check for missing core hooks
    const coreHookNames = ['useUser', 'useProjects', 'useFiles'];
    const existingHookNames = results.hooks.map(h => h.name);
    
    coreHookNames.forEach(hookName => {
      if (!existingHookNames.includes(hookName)) {
        recommendations.push(`Consider implementing ${hookName} hook for better data management`);
      }
    });
    
    // Check for state management separation
    const uiStoreCount = results.stores.filter(s => s.name.includes('ui') || s.name.includes('editor') || s.name.includes('sidebar')).length;
    const totalStoreCount = results.stores.length;
    
    if (uiStoreCount < totalStoreCount / 2) {
      recommendations.push('Consider separating UI state from business logic using dedicated UI stores');
    }
    
    // Check for proper error handling
    const hooksWithoutErrorHandling = results.hooks.filter(h => h.issues.some(i => i.includes('error handling')));
    if (hooksWithoutErrorHandling.length > 0) {
      recommendations.push('Implement comprehensive error handling in Convex-related hooks');
    }
    
    return recommendations;
  }

  printResults(results: AuditResults): void {
    console.log('\n📊 AURA State Management Audit Results\n');
    console.log('=' .repeat(50));
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`   Zustand Stores: ${results.summary.totalStores}`);
    console.log(`   Custom Hooks: ${results.summary.totalHooks}`);
    console.log(`   Convex Functions: ${results.summary.totalConvexFunctions}`);
    console.log(`   Total Issues: ${results.summary.totalIssues}`);
    
    // Store details
    if (results.stores.length > 0) {
      console.log('\n📦 Zustand Stores:');
      results.stores.forEach(store => {
        console.log(`   ${store.name} (${store.exports.length} exports)`);
        if (store.issues.length > 0) {
          store.issues.forEach(issue => {
            console.log(`      ⚠️  ${issue}`);
          });
        }
      });
    }
    
    // Hook details
    if (results.hooks.length > 0) {
      console.log('\n🎣 Custom Hooks:');
      results.hooks.forEach(hook => {
        console.log(`   ${hook.name} (${hook.dependencies.length} dependencies)`);
        if (hook.issues.length > 0) {
          hook.issues.forEach(issue => {
            console.log(`      ⚠️  ${issue}`);
          });
        }
      });
    }
    
    // Convex function details
    if (results.convexFunctions.length > 0) {
      console.log('\n🗄️  Convex Functions:');
      const groupedFunctions = results.convexFunctions.reduce((acc, fn) => {
        if (!acc[fn.path]) acc[fn.path] = [];
        acc[fn.path].push(fn);
        return acc;
      }, {} as Record<string, ConvexFunction[]>);
      
      Object.entries(groupedFunctions).forEach(([path, functions]) => {
        console.log(`   ${path}:`);
        functions.forEach(fn => {
          console.log(`      ${fn.name} (${fn.type})`);
          if (fn.issues.length > 0) {
            fn.issues.forEach(issue => {
              console.log(`         ⚠️  ${issue}`);
            });
          }
        });
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
    const healthScore = Math.max(0, 100 - (results.summary.totalIssues * 10));
    const healthEmoji = healthScore >= 80 ? '🟢' : healthScore >= 60 ? '🟡' : '🔴';
    
    console.log(`\n${healthEmoji} State Management Health Score: ${healthScore}/100`);
    
    if (results.summary.totalIssues === 0) {
      console.log('\n✅ All state management patterns look good!');
    } else {
      console.log(`\n⚠️  Found ${results.summary.totalIssues} issue(s) that could be addressed.`);
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the audit
async function runAudit() {
  const auditor = new StateAuditor(process.cwd());
  
  try {
    const results = await auditor.audit();
    auditor.printResults(results);
    
    // Exit with appropriate code
    process.exit(results.summary.totalIssues > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runAudit();
}
