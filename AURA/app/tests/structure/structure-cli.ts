// STRUCTURE CLI - Command-line interface for structure audit system
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/structure/structure-cli.ts

import { StructureAuditor, type StructureAuditResult } from './structure-audit';
import fs from 'fs';
import path from 'path';

interface CLIOptions {
  detailed?: boolean;
  mermaid?: boolean;
  nodes?: boolean;
  ladders?: boolean;
  json?: boolean;
  help?: boolean;
}

class StructureCLI {
  private auditor: StructureAuditor;
  
  constructor() {
    this.auditor = new StructureAuditor();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);
    
    if (options.help) {
      this.printHelp();
      return;
    }

    console.log('🏗️  AURA Structure Analysis System');
    console.log('===================================\n');

    try {
      const result = await this.auditor.runAudit();
      
      if (options.detailed) {
        await this.printDetailedReport(result);
      }
      
      if (options.mermaid) {
        await this.generateMermaidFiles(result);
      }
      
      if (options.nodes) {
        await this.printOrganizationNodes(result);
      }
      
      if (options.ladders) {
        await this.printDependencyLadders(result);
      }
      
      if (options.json) {
        await this.saveJSONReport(result);
      }
      
    } catch (error) {
      console.error('❌ Structure audit failed:', error);
      process.exit(1);
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {};
    
    for (const arg of args) {
      switch (arg) {
        case '--detailed':
          options.detailed = true;
          break;
        case '--mermaid':
          options.mermaid = true;
          break;
        case '--nodes':
          options.nodes = true;
          break;
        case '--ladders':
          options.ladders = true;
          break;
        case '--json':
          options.json = true;
          break;
        case '--help':
          options.help = true;
          break;
      }
    }
    
    return options;
  }

  private printHelp(): void {
    console.log(`
🏗️  AURA Structure Analysis System
===================================

USAGE:
  pnpm structure [options]

OPTIONS:
  --detailed     Show detailed analysis with examples and recommendations
  --mermaid      Generate Mermaid diagram files for visualization
  --nodes        Display organization nodes analysis
  --ladders      Display dependency ladders analysis
  --json         Save complete results as JSON file
  --help         Show this help message

EXAMPLES:
  pnpm structure                    # Run basic structure audit
  pnpm structure --detailed        # Run with detailed output
  pnpm structure --mermaid         # Generate visualization diagrams
  pnpm structure --nodes --ladders # Show structural analysis

SCORING:
  5/5 - Excellent: Exemplary organization and architecture
  4/5 - Good: Well-organized with minor improvements needed
  3/5 - Fair: Acceptable but with areas for improvement
  2/5 - Poor: Significant organizational issues present
  1/5 - Critical: Major structural problems requiring attention

EVALUATION CRITERIA:
  • Modularity: Component isolation and reusability
  • Consistency: Naming conventions and structural patterns
  • Separation of Concerns: Proper layering and feature organization
  • Maintainability: Code readability and documentation
  • Dependency Management: Appropriate dependencies and abstractions
`);
  }

  private async printDetailedReport(result: StructureAuditResult): Promise<void> {
    console.log('\n📝 Detailed Analysis Report');
    console.log('==========================\n');

    // Print conceptual tests
    console.log('🧪 Conceptual Tests for Self-Assessment');
    console.log('--------------------------------------');
    
    for (const test of result.conceptualTests) {
      const severityIcon = test.severity === 'error' ? '🚨' : test.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`\n${severityIcon} ${test.name}`);
      console.log(`   ${test.description}\n`);
      
      console.log('   Questions to ask when adding new code:');
      test.questions.forEach((question: string, index: number) => {
        console.log(`   ${index + 1}. ${question}`);
      });
      
      console.log('\n   Success Criteria:');
      test.criteria.forEach((criterion: string) => {
        console.log(`   ✓ ${criterion}`);
      });
    }

    // Print detailed scores with examples
    console.log('\n📊 Detailed Score Breakdown');
    console.log('---------------------------');
    
    const scores = result.scores;
    this.printDetailedScore('Modularity', scores.modularity);
    this.printDetailedScore('Consistency', scores.consistency);
    this.printDetailedScore('Separation of Concerns', scores.separationOfConcerns);
    this.printDetailedScore('Maintainability', scores.maintainability);
    this.printDetailedScore('Dependency Management', scores.dependencyManagement);

    // Print violations if any
    if (result.violations.length > 0) {
      console.log('\n⚠️  Code Violations Found');
      console.log('------------------------');
      
      result.violations.forEach((violation, index: number) => {
        const severityIcon = violation.severity === 'error' ? '🚨' : '⚠️';
        console.log(`${index + 1}. ${severityIcon} ${violation.file}:${violation.line}`);
        console.log(`   ${violation.violation}`);
        console.log(`   Category: ${violation.category}, Principle: ${violation.principle}\n`);
      });
    }
  }

  private printDetailedScore(name: string, score: StructureAuditResult['scores']['modularity']): void {
    const scoreColor = score.score >= 4 ? '\x1b[32m' : score.score >= 3 ? '\x1b[33m' : '\x1b[31m';
    console.log(`\n${scoreColor}${name}: ${score.score}/5.0\x1b[0m`);
    console.log(`${score.justification}\n`);
    
    if (score.examples && score.examples.length > 0) {
      console.log('Examples found:');
      score.examples.forEach((example: string) => {
        console.log(`• ${example}`);
      });
      console.log();
    }
    
    if (score.recommendations && score.recommendations.length > 0) {
      console.log('Recommendations:');
      score.recommendations.forEach((rec: string, index: number) => {
        console.log(`${index + 1}. ${rec}`);
      });
      console.log();
    }
  }

  private async generateMermaidFiles(result: StructureAuditResult): Promise<void> {
    console.log('\n🎨 Generating Mermaid Diagrams');
    console.log('-----------------------------\n');

    const outputDir = path.join(__dirname, 'diagrams');
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const diagrams = [
      {
        name: 'Architecture Overview',
        filename: 'architecture-overview.mmd',
        content: result.mermaidDiagrams.architectureOverview
      },
      {
        name: 'Dependency Graph',
        filename: 'dependency-graph.mmd',
        content: result.mermaidDiagrams.dependencyGraph
      },
      {
        name: 'Organization Structure',
        filename: 'organization-structure.mmd',
        content: result.mermaidDiagrams.organizationStructure
      },
      {
        name: 'Problem Areas',
        filename: 'problem-areas.mmd',
        content: result.mermaidDiagrams.problemAreas
      }
    ];

    for (const diagram of diagrams) {
      const filePath = path.join(outputDir, diagram.filename);
      fs.writeFileSync(filePath, diagram.content.trim());
      console.log(`✓ ${diagram.name} → ${diagram.filename}`);
    }

    console.log(`\n📁 Diagrams saved to: ${outputDir}`);
    console.log('\nTo view the diagrams:');
    console.log('1. Open the .mmd files in VS Code with Mermaid Preview extension');
    console.log('2. Or copy the content to https://mermaid.live for online viewing');
  }

  private async printOrganizationNodes(result: StructureAuditResult): Promise<void> {
    console.log('\n🏗️  Organization Nodes Analysis');
    console.log('===============================\n');

    // Group nodes by type
    const nodesByType = result.organizationNodes.reduce((acc: Record<string, typeof result.organizationNodes>, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {});

    for (const [type, nodes] of Object.entries(nodesByType)) {
      console.log(`📦 ${type.toUpperCase()} (${nodes.length})`);
      console.log(''.padEnd(type.length + 10, '-'));
      
      // Sort by maintainability index
      const sortedNodes = nodes.sort((a, b) => b.maintainabilityIndex - a.maintainabilityIndex);
      
      for (const node of sortedNodes.slice(0, 10)) { // Show top 10
        const maintainabilityColor = node.maintainabilityIndex >= 70 ? '\x1b[32m' : 
                                   node.maintainabilityIndex >= 50 ? '\x1b[33m' : '\x1b[31m';
        
        console.log(`  ${maintainabilityColor}${node.name}\x1b[0m`);
        console.log(`    Path: ${node.path}`);
        console.log(`    Purpose: ${node.purpose}`);
        console.log(`    Complexity: ${node.complexity}, Maintainability: ${node.maintainabilityIndex}%`);
        console.log(`    Dependencies: ${node.dependencies.length}, Dependents: ${node.dependents.length}`);
        
        if (node.violations.length > 0) {
          console.log(`    Violations: ${node.violations.join(', ')}`);
        }
        console.log();
      }
    }
  }

  private async printDependencyLadders(result: StructureAuditResult): Promise<void> {
    console.log('\n🪜 Dependency Ladders Analysis');
    console.log('==============================\n');

    for (const ladder of result.dependencyLadders) {
      console.log(`📊 ${ladder.name}`);
      console.log(''.padEnd(ladder.name.length + 4, '-'));
      
      for (const level of ladder.levels) {
        console.log(`\nLevel ${level.level}: ${level.description}`);
        console.log(`Components (${level.components.length}):`);
        
        level.components.slice(0, 10).forEach((component: string, index: number) => {
          console.log(`  ${index + 1}. ${component}`);
        });
        
        if (level.components.length > 10) {
          console.log(`  ... and ${level.components.length - 10} more`);
        }
      }
      
      if (ladder.circularDependencies.length > 0) {
        console.log(`\n🔄 Circular Dependencies Found:`);
        ladder.circularDependencies.forEach((cycle: string, index: number) => {
          console.log(`  ${index + 1}. ${cycle}`);
        });
      }
      
      console.log(`\n💡 Recommendations:`);
      ladder.recommendations.forEach((rec: string, index: number) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      
      console.log('\n');
    }
  }

  private async saveJSONReport(result: StructureAuditResult): Promise<void> {
    const outputPath = path.join(__dirname, 'structure-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: result.summary,
      scores: result.scores,
      passed: result.passed,
      violations: result.violations,
      organizationNodes: result.organizationNodes,
      dependencyLadders: result.dependencyLadders,
      conceptualTests: result.conceptualTests
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Complete report saved to: ${outputPath}`);
  }
}

// Main CLI execution
async function main(): Promise<void> {
  const cli = new StructureCLI();
  const args = process.argv.slice(2);
  await cli.run(args);
}

if (require.main === module) {
  main().catch(console.error);
}

export { StructureCLI };
