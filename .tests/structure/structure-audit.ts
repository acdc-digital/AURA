// STRUCTURE AUDIT - Comprehensive codebase organization analysis and scoring system
// /Users/matthewsimon/Projects/AURA/AURA/app/tests/structure/structure-audit.ts

import fs from "fs";
import path from "path";

interface StructureViolation {
  file: string;
  line: number;
  violation: string;
  severity: "error" | "warning";
  principle: string;
  category:
    | "modularity"
    | "consistency"
    | "separation-of-concerns"
    | "maintainability"
    | "dependency-management";
}

interface DirectoryStructure {
  name: string;
  type: "file" | "directory";
  path: string;
  children: DirectoryStructure[];
  size?: number;
  extension?: string;
}

interface ModularityScore {
  score: number;
  justification: string;
  examples: string[];
  recommendations: string[];
}

interface ConsistencyScore {
  score: number;
  justification: string;
  namingConsistency: number;
  structureConsistency: number;
  examples: string[];
  recommendations: string[];
}

interface SeparationOfConcernsScore {
  score: number;
  justification: string;
  layeringSeparation: number;
  featureBasedOrganization: number;
  examples: string[];
  recommendations: string[];
}

interface MaintainabilityScore {
  score: number;
  justification: string;
  readability: number;
  testability: number;
  documentation: number;
  examples: string[];
  recommendations: string[];
}

interface DependencyManagementScore {
  score: number;
  justification: string;
  circularDependencies: number;
  appropriateAbstractions: number;
  examples: string[];
  recommendations: string[];
}

interface StructureAuditResult {
  passed: boolean;
  violations: StructureViolation[];
  directoryStructure: DirectoryStructure;
  scores: {
    modularity: ModularityScore;
    consistency: ConsistencyScore;
    separationOfConcerns: SeparationOfConcernsScore;
    maintainability: MaintainabilityScore;
    dependencyManagement: DependencyManagementScore;
    overall: number;
  };
  organizationNodes: OrganizationNode[];
  dependencyLadders: DependencyLadder[];
  summary: {
    totalFiles: number;
    totalDirectories: number;
    violationsCount: number;
    errorsCount: number;
    warningsCount: number;
    recommendationsCount: number;
  };
  conceptualTests: ConceptualTest[];
  mermaidDiagrams: {
    architectureOverview: string;
    dependencyGraph: string;
    organizationStructure: string;
    problemAreas: string;
  };
}

interface OrganizationNode {
  id: string;
  name: string;
  type:
    | "component"
    | "service"
    | "utility"
    | "config"
    | "test"
    | "documentation";
  path: string;
  purpose: string;
  dependencies: string[];
  dependents: string[];
  complexity: number;
  maintainabilityIndex: number;
  violations: string[];
}

interface DependencyLadder {
  id: string;
  name: string;
  levels: {
    level: number;
    components: string[];
    description: string;
  }[];
  circularDependencies: string[];
  recommendations: string[];
}

interface ConceptualTest {
  id: string;
  name: string;
  description: string;
  questions: string[];
  criteria: string[];
  severity: "error" | "warning" | "info";
}

class StructureAuditor {
  private violations: StructureViolation[] = [];
  private projectRoot: string;
  private excludedPaths: string[] = [
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "coverage",
    ".convex/_generated",
    "public",
  ];

  constructor() {
    this.projectRoot = path.resolve(__dirname, "../../..");
  }

  async runAudit(): Promise<StructureAuditResult> {
    console.log("🔍 Running AURA Structure Audit...\n");

    // Build directory structure
    const directoryStructure = this.buildDirectoryStructure(this.projectRoot);

    // Analyze organization nodes
    const organizationNodes = await this.analyzeOrganizationNodes();

    // Build dependency ladders
    const dependencyLadders =
      await this.buildDependencyLadders(organizationNodes);

    // Calculate scores
    const scores = await this.calculateScores(
      directoryStructure,
      organizationNodes,
    );

    // Generate conceptual tests
    const conceptualTests = this.generateConceptualTests();

    // Generate Mermaid diagrams
    const mermaidDiagrams = this.generateMermaidDiagrams(
      organizationNodes,
      dependencyLadders,
      scores,
    );

    const result: StructureAuditResult = {
      passed: scores.overall >= 3.0,
      violations: this.violations,
      directoryStructure,
      scores,
      organizationNodes,
      dependencyLadders,
      summary: {
        totalFiles: this.countFiles(directoryStructure),
        totalDirectories: this.countDirectories(directoryStructure),
        violationsCount: this.violations.length,
        errorsCount: this.violations.filter((v) => v.severity === "error")
          .length,
        warningsCount: this.violations.filter((v) => v.severity === "warning")
          .length,
        recommendationsCount: this.getTotalRecommendations(scores),
      },
      conceptualTests,
      mermaidDiagrams,
    };

    this.printResults(result);
    return result;
  }

  private buildDirectoryStructure(
    dirPath: string,
    depth: number = 0,
  ): DirectoryStructure {
    const name = path.basename(dirPath);
    const relativePath = path.relative(this.projectRoot, dirPath);

    if (this.shouldExclude(relativePath) || depth > 5) {
      return {
        name,
        type: "directory",
        path: relativePath,
        children: [],
      };
    }

    const stats = fs.statSync(dirPath);

    if (stats.isFile()) {
      return {
        name,
        type: "file",
        path: relativePath,
        children: [],
        size: stats.size,
        extension: path.extname(name),
      };
    }

    const children: DirectoryStructure[] = [];
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        children.push(this.buildDirectoryStructure(itemPath, depth + 1));
      }
    } catch {
      // Skip directories we can't read
    }

    return {
      name,
      type: "directory",
      path: relativePath,
      children: children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    };
  }

  private shouldExclude(path: string): boolean {
    return this.excludedPaths.some(
      (excluded) => path.includes(excluded) || path.startsWith(excluded),
    );
  }

  private async analyzeOrganizationNodes(): Promise<OrganizationNode[]> {
    const nodes: OrganizationNode[] = [];

    // Analyze key directories
    const keyDirectories = [
      "app",
      "components",
      "lib",
      "convex",
      "hooks",
      "store",
    ];

    for (const dir of keyDirectories) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await this.analyzeDirectory(dirPath, nodes);
      }
    }

    return nodes;
  }

  private async analyzeDirectory(
    dirPath: string,
    nodes: OrganizationNode[],
  ): Promise<void> {
    const files = this.getFilesRecursively(dirPath);

    for (const file of files) {
      if (this.isSourceFile(file)) {
        const node = await this.createOrganizationNode(file);
        nodes.push(node);
      }
    }
  }

  private getFilesRecursively(dirPath: string): string[] {
    const files: string[] = [];

    function traverse(dir: string) {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = fs.statSync(itemPath);

          if (
            stats.isDirectory() &&
            !item.startsWith(".") &&
            item !== "node_modules"
          ) {
            traverse(itemPath);
          } else if (stats.isFile()) {
            files.push(itemPath);
          }
        }
      } catch {
        // Skip directories we can't read
      }
    }

    traverse(dirPath);
    return files;
  }

  private isSourceFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return [".ts", ".tsx", ".js", ".jsx", ".md"].includes(ext);
  }

  private async createOrganizationNode(
    filePath: string,
  ): Promise<OrganizationNode> {
    const relativePath = path.relative(this.projectRoot, filePath);
    const name = path.basename(filePath);

    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      // Skip files we can't read
    }

    const dependencies = this.extractDependencies(content);
    const type = this.determineNodeType(relativePath);
    const purpose = this.inferPurpose(relativePath, content);
    const complexity = this.calculateComplexity(content);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(content);
    const violations = this.findNodeViolations(relativePath, content);

    return {
      id: relativePath,
      name,
      type,
      path: relativePath,
      purpose,
      dependencies,
      dependents: [], // Will be populated later
      complexity,
      maintainabilityIndex,
      violations,
    };
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return dependencies;
  }

  private determineNodeType(filePath: string): OrganizationNode["type"] {
    if (
      filePath.includes("/test/") ||
      filePath.endsWith(".test.ts") ||
      filePath.endsWith(".test.tsx")
    ) {
      return "test";
    }
    if (filePath.includes("/components/")) {
      return "component";
    }
    if (filePath.includes("/lib/") || filePath.includes("/utils/")) {
      return "utility";
    }
    if (filePath.includes("/convex/") || filePath.includes("/api/")) {
      return "service";
    }
    if (filePath.includes("/config/") || filePath.endsWith(".config.ts")) {
      return "config";
    }
    if (filePath.endsWith(".md")) {
      return "documentation";
    }
    return "component";
  }

  private inferPurpose(filePath: string, content: string): string {
    // Extract purpose from file header comments
    const headerMatch = content.match(/\/\/\s*([A-Z\s]+)\s*-\s*(.+)/);
    if (headerMatch) {
      return headerMatch[2];
    }

    // Infer from filename and path
    const fileName = path.basename(filePath, path.extname(filePath));
    const directory = path.dirname(filePath);

    return `${fileName} in ${directory}`;
  }

  private calculateComplexity(content: string): number {
    // Simple cyclomatic complexity approximation
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s*if/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /catch\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /&&/g,
      /\|\|/g,
    ];

    let complexity = 1; // Base complexity

    for (const pattern of complexityPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return Math.min(complexity, 20); // Cap at 20
  }

  private calculateMaintainabilityIndex(content: string): number {
    const lines = content.split("\n").length;
    const complexity = this.calculateComplexity(content);
    const commentLines = (content.match(/\/\/|\/\*/g) || []).length;

    // Simplified maintainability index (0-100)
    const commentRatio = commentLines / lines;
    const complexityPenalty = Math.min(complexity / 10, 1);
    const lengthPenalty = Math.min(lines / 500, 1);

    const maintainabilityIndex = Math.max(
      0,
      100 - complexityPenalty * 30 - lengthPenalty * 20 + commentRatio * 10,
    );

    return Math.round(maintainabilityIndex);
  }

  private findNodeViolations(filePath: string, content: string): string[] {
    const violations: string[] = [];

    // Check for naming conventions
    const fileName = path.basename(filePath);
    if (fileName.includes("_") && !fileName.includes("test")) {
      violations.push("Uses underscore instead of kebab-case in filename");
    }

    // Check for file size
    const lines = content.split("\n").length;
    if (lines > 300) {
      violations.push(`File too large (${lines} lines, should be < 300)`);
    }

    // Check for missing file headers
    if (!content.match(/^\/\/\s*[A-Z\s]+\s*-/)) {
      violations.push("Missing descriptive file header");
    }

    return violations;
  }

  private async buildDependencyLadders(
    nodes: OrganizationNode[],
  ): Promise<DependencyLadder[]> {
    const ladders: DependencyLadder[] = [];

    // Build dependency graph
    const dependencyGraph = new Map<string, Set<string>>();

    for (const node of nodes) {
      dependencyGraph.set(node.id, new Set());

      for (const dep of node.dependencies) {
        // Find matching nodes
        const depNode = nodes.find(
          (n) =>
            n.path.includes(dep) ||
            dep.includes(path.basename(n.path, path.extname(n.path))),
        );

        if (depNode) {
          dependencyGraph.get(node.id)?.add(depNode.id);
          depNode.dependents.push(node.id);
        }
      }
    }

    // Create component ladder
    const componentLadder = this.createComponentLadder(nodes, dependencyGraph);
    ladders.push(componentLadder);

    // Create service ladder
    const serviceLadder = this.createServiceLadder(nodes, dependencyGraph);
    ladders.push(serviceLadder);

    return ladders;
  }

  private createComponentLadder(
    nodes: OrganizationNode[],
    graph: Map<string, Set<string>>,
  ): DependencyLadder {
    const components = nodes.filter((n) => n.type === "component");

    return {
      id: "component-ladder",
      name: "Component Dependency Ladder",
      levels: [
        {
          level: 1,
          components: components
            .filter((c) => c.dependents.length === 0)
            .map((c) => c.name),
          description: "Leaf components (no dependents)",
        },
        {
          level: 2,
          components: components
            .filter((c) => c.dependents.length > 0 && c.dependents.length <= 2)
            .map((c) => c.name),
          description: "Mid-level components (1-2 dependents)",
        },
        {
          level: 3,
          components: components
            .filter((c) => c.dependents.length > 2)
            .map((c) => c.name),
          description: "High-level components (3+ dependents)",
        },
      ],
      circularDependencies: this.findCircularDependencies(graph),
      recommendations: [
        "Consider breaking down high-level components",
        "Ensure proper separation of concerns",
        "Review circular dependencies",
      ],
    };
  }

  private createServiceLadder(
    nodes: OrganizationNode[],
    graph: Map<string, Set<string>>,
  ): DependencyLadder {
    const services = nodes.filter(
      (n) => n.type === "service" || n.type === "utility",
    );

    return {
      id: "service-ladder",
      name: "Service Dependency Ladder",
      levels: [
        {
          level: 1,
          components: services
            .filter((s) => s.dependencies.length === 0)
            .map((s) => s.name),
          description: "Core services (no dependencies)",
        },
        {
          level: 2,
          components: services
            .filter(
              (s) => s.dependencies.length > 0 && s.dependencies.length <= 3,
            )
            .map((s) => s.name),
          description: "Application services (1-3 dependencies)",
        },
        {
          level: 3,
          components: services
            .filter((s) => s.dependencies.length > 3)
            .map((s) => s.name),
          description: "Complex services (4+ dependencies)",
        },
      ],
      circularDependencies: this.findCircularDependencies(graph),
      recommendations: [
        "Minimize service dependencies",
        "Consider dependency injection",
        "Review service boundaries",
      ],
    };
  }

  private findCircularDependencies(graph: Map<string, Set<string>>): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(node: string, path: string[]): boolean {
      if (recursionStack.has(node)) {
        const cycle = path.slice(path.indexOf(node)).join(" → ");
        circular.push(cycle);
        return true;
      }

      if (visited.has(node)) {
        return false;
      }

      visited.add(node);
      recursionStack.add(node);

      const deps = graph.get(node) || new Set();
      for (const dep of deps) {
        if (dfs(dep, [...path, node])) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    }

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return circular;
  }

  private async calculateScores(
    structure: DirectoryStructure,
    nodes: OrganizationNode[],
  ): Promise<StructureAuditResult["scores"]> {
    const modularity = this.calculateModularityScore(nodes);
    const consistency = this.calculateConsistencyScore(structure, nodes);
    const separationOfConcerns = this.calculateSeparationOfConcernsScore(nodes);
    const maintainability = this.calculateMaintainabilityScore(nodes);
    const dependencyManagement = this.calculateDependencyManagementScore(nodes);

    const overall =
      (modularity.score +
        consistency.score +
        separationOfConcerns.score +
        maintainability.score +
        dependencyManagement.score) /
      5;

    return {
      modularity,
      consistency,
      separationOfConcerns,
      maintainability,
      dependencyManagement,
      overall: Math.round(overall * 10) / 10,
    };
  }

  private calculateModularityScore(nodes: OrganizationNode[]): ModularityScore {
    let score = 5; // Start with perfect score
    const examples: string[] = [];
    const recommendations: string[] = [];

    // Check for high complexity nodes
    const highComplexityNodes = nodes.filter((n) => n.complexity > 10);
    if (highComplexityNodes.length > 0) {
      score -= Math.min(2, highComplexityNodes.length * 0.5);
      examples.push(
        `High complexity files: ${highComplexityNodes.map((n) => n.name).join(", ")}`,
      );
      recommendations.push("Break down complex files into smaller modules");
    }

    // Check for appropriate separation
    const componentNodes = nodes.filter((n) => n.type === "component");
    const avgDependencies =
      componentNodes.reduce((sum, n) => sum + n.dependencies.length, 0) /
      componentNodes.length;

    if (avgDependencies > 5) {
      score -= 1;
      examples.push(
        `Average component dependencies: ${avgDependencies.toFixed(1)}`,
      );
      recommendations.push(
        "Reduce component dependencies for better modularity",
      );
    }

    return {
      score: Math.max(1, Math.round(score * 10) / 10),
      justification: `Modularity assessment based on complexity analysis and dependency patterns. ${highComplexityNodes.length} high-complexity files found.`,
      examples,
      recommendations,
    };
  }

  private calculateConsistencyScore(
    structure: DirectoryStructure,
    nodes: OrganizationNode[],
  ): ConsistencyScore {
    let score = 5; // Start with perfect score
    const examples: string[] = [];
    const recommendations: string[] = [];

    // Check naming consistency
    const namingScore = this.checkNamingConsistency(nodes);
    const structureScore = this.checkStructureConsistency(structure);

    score = (namingScore + structureScore) / 2;

    if (namingScore < 4) {
      examples.push("Inconsistent naming conventions found");
      recommendations.push("Standardize file and component naming conventions");
    }

    if (structureScore < 4) {
      examples.push("Inconsistent directory structure patterns");
      recommendations.push(
        "Establish consistent directory organization patterns",
      );
    }

    return {
      score: Math.max(1, Math.round(score * 10) / 10),
      justification: `Consistency evaluated through naming conventions and structural patterns analysis.`,
      namingConsistency: namingScore,
      structureConsistency: structureScore,
      examples,
      recommendations,
    };
  }

  private checkNamingConsistency(nodes: OrganizationNode[]): number {
    let score = 5;

    // Check for consistent naming patterns
    const kebabCaseFiles = nodes.filter((n) => n.name.includes("-")).length;
    const camelCaseFiles = nodes.filter((n) =>
      /[a-z][A-Z]/.test(n.name),
    ).length;
    const snakeCaseFiles = nodes.filter((n) => n.name.includes("_")).length;

    const total = nodes.length;
    const predominantPattern =
      Math.max(kebabCaseFiles, camelCaseFiles, snakeCaseFiles) / total;

    if (predominantPattern < 0.8) {
      score -= 2; // Inconsistent naming
    }

    return Math.max(1, score);
  }

  private checkStructureConsistency(structure: DirectoryStructure): number {
    let score = 5;

    // Check for expected directory structure
    const expectedDirs = ["app", "components", "lib", "convex"];
    const actualDirs = structure.children
      .filter((c) => c.type === "directory")
      .map((c) => c.name);

    const hasExpectedStructure = expectedDirs.every((dir) =>
      actualDirs.includes(dir),
    );

    if (!hasExpectedStructure) {
      score -= 1;
    }

    return Math.max(1, score);
  }

  private calculateSeparationOfConcernsScore(
    nodes: OrganizationNode[],
  ): SeparationOfConcernsScore {
    let score = 5;
    const examples: string[] = [];
    const recommendations: string[] = [];

    // Check for mixed concerns in files
    const mixedConcernFiles = nodes.filter((n) =>
      n.violations.some((v) => v.includes("mixed concerns")),
    );

    if (mixedConcernFiles.length > 0) {
      score -= Math.min(2, mixedConcernFiles.length * 0.3);
      examples.push(`Files with mixed concerns: ${mixedConcernFiles.length}`);
      recommendations.push("Separate different concerns into dedicated files");
    }

    // Check layering
    const layeringScore = this.checkLayeringSeparation(nodes);
    const featureScore = this.checkFeatureBasedOrganization(nodes);

    score = (score + layeringScore + featureScore) / 3;

    return {
      score: Math.max(1, Math.round(score * 10) / 10),
      justification: `Separation of concerns evaluated through layering and feature organization analysis.`,
      layeringSeparation: layeringScore,
      featureBasedOrganization: featureScore,
      examples,
      recommendations,
    };
  }

  private checkLayeringSeparation(nodes: OrganizationNode[]): number {
    // Check if presentation, business logic, and data access are properly separated
    const uiComponents = nodes.filter((n) => n.type === "component").length;
    const services = nodes.filter((n) => n.type === "service").length;
    const utilities = nodes.filter((n) => n.type === "utility").length;

    // Good separation would have a reasonable distribution
    const total = uiComponents + services + utilities;
    if (total === 0) return 3;

    const balance =
      Math.min(uiComponents, services, utilities) /
      Math.max(uiComponents, services, utilities);

    return Math.max(1, 5 * balance);
  }

  private checkFeatureBasedOrganization(nodes: OrganizationNode[]): number {
    // Check if related functionality is grouped together
    const featureGroups = new Map<string, number>();

    for (const node of nodes) {
      const pathParts = node.path.split("/");
      for (let i = 0; i < pathParts.length - 1; i++) {
        const feature = pathParts[i];
        if (
          feature !== "app" &&
          feature !== "components" &&
          feature !== "lib"
        ) {
          featureGroups.set(feature, (featureGroups.get(feature) || 0) + 1);
        }
      }
    }

    // Good feature organization would have multiple features with reasonable file counts
    const features = Array.from(featureGroups.values());
    const avgFilesPerFeature =
      features.reduce((sum, count) => sum + count, 0) / features.length;

    if (avgFilesPerFeature > 2 && avgFilesPerFeature < 15) {
      return 5;
    } else if (avgFilesPerFeature > 1) {
      return 3;
    } else {
      return 2;
    }
  }

  private calculateMaintainabilityScore(
    nodes: OrganizationNode[],
  ): MaintainabilityScore {
    const examples: string[] = [];
    const recommendations: string[] = [];

    const avgMaintainability =
      nodes.reduce((sum, n) => sum + n.maintainabilityIndex, 0) / nodes.length;
    const readabilityScore = Math.min(5, avgMaintainability / 20);

    // Check documentation
    const documentedFiles = nodes.filter(
      (n) => !n.violations.includes("Missing descriptive file header"),
    ).length;
    const documentationScore = (documentedFiles / nodes.length) * 5;

    // Check testability (presence of test files)
    const testFiles = nodes.filter((n) => n.type === "test").length;
    const sourceFiles = nodes.filter(
      (n) => n.type !== "test" && n.type !== "documentation",
    ).length;
    const testabilityScore = Math.min(5, (testFiles / sourceFiles) * 5);

    const overallScore =
      (readabilityScore + documentationScore + testabilityScore) / 3;

    if (documentationScore < 3) {
      examples.push(
        `${Math.round((1 - documentedFiles / nodes.length) * 100)}% of files lack proper headers`,
      );
      recommendations.push("Add descriptive headers to all source files");
    }

    if (testabilityScore < 2) {
      examples.push(
        `Low test coverage: ${testFiles} test files for ${sourceFiles} source files`,
      );
      recommendations.push("Increase test coverage for better maintainability");
    }

    return {
      score: Math.max(1, Math.round(overallScore * 10) / 10),
      justification: `Maintainability assessed through readability metrics, documentation, and testability indicators.`,
      readability: Math.round(readabilityScore * 10) / 10,
      testability: Math.round(testabilityScore * 10) / 10,
      documentation: Math.round(documentationScore * 10) / 10,
      examples,
      recommendations,
    };
  }

  private calculateDependencyManagementScore(
    nodes: OrganizationNode[],
  ): DependencyManagementScore {
    const examples: string[] = [];
    const recommendations: string[] = [];

    // Check for circular dependencies (calculated earlier)
    let score = 5;

    // Check for excessive dependencies
    const highDependencyNodes = nodes.filter((n) => n.dependencies.length > 8);
    if (highDependencyNodes.length > 0) {
      score -= Math.min(2, highDependencyNodes.length * 0.3);
      examples.push(
        `Files with excessive dependencies: ${highDependencyNodes.map((n) => n.name).join(", ")}`,
      );
      recommendations.push("Reduce dependencies through better abstraction");
    }

    // Check for appropriate abstractions
    const abstractionScore = this.checkAbstractions(nodes);
    score = (score + abstractionScore) / 2;

    return {
      score: Math.max(1, Math.round(score * 10) / 10),
      justification: `Dependency management evaluated through dependency analysis and abstraction patterns.`,
      circularDependencies: 0, // Would be calculated from dependency ladders
      appropriateAbstractions: abstractionScore,
      examples,
      recommendations,
    };
  }

  private checkAbstractions(nodes: OrganizationNode[]): number {
    // Check for presence of proper abstractions (hooks, services, utilities)
    const hooks = nodes.filter((n) => n.path.includes("/hooks/")).length;
    const services = nodes.filter((n) => n.type === "service").length;
    const utilities = nodes.filter((n) => n.type === "utility").length;

    const totalAbstractions = hooks + services + utilities;
    const totalComponents = nodes.filter((n) => n.type === "component").length;

    if (totalComponents === 0) return 3;

    const abstractionRatio = totalAbstractions / totalComponents;

    if (abstractionRatio > 0.3) return 5;
    if (abstractionRatio > 0.2) return 4;
    if (abstractionRatio > 0.1) return 3;
    return 2;
  }

  private generateConceptualTests(): ConceptualTest[] {
    return [
      {
        id: "modularity-test",
        name: "Modularity Assessment",
        description:
          "Evaluate if components are properly isolated and reusable",
        questions: [
          "Can this component be easily moved to a different project?",
          "Does this component have a single, well-defined responsibility?",
          "Are the component's dependencies minimal and explicit?",
          "Can this component be tested in isolation?",
          "Does this component expose a clear, stable interface?",
        ],
        criteria: [
          "Component should have < 5 direct dependencies",
          "Component should be < 200 lines of code",
          "Component should have clear prop interfaces",
          "Component should not directly import from external APIs",
        ],
        severity: "error",
      },
      {
        id: "consistency-test",
        name: "Naming and Structure Consistency",
        description:
          "Verify consistent naming conventions and file organization",
        questions: [
          "Does the file name follow the established naming convention?",
          "Is the file placed in the appropriate directory?",
          "Are similar components organized in a similar manner?",
          "Do the exports follow the project's export patterns?",
          "Are the imports organized consistently?",
        ],
        criteria: [
          "Files should use kebab-case naming",
          "Components should be in appropriate directories",
          "Imports should be organized by type (external, internal, relative)",
          "File headers should be descriptive and complete",
        ],
        severity: "warning",
      },
      {
        id: "separation-test",
        name: "Separation of Concerns",
        description:
          "Check if different responsibilities are properly separated",
        questions: [
          "Does this file handle only one type of concern?",
          "Are UI components separate from business logic?",
          "Are data access patterns isolated from presentation logic?",
          "Are configuration concerns separated from implementation?",
          "Are external dependencies properly abstracted?",
        ],
        criteria: [
          "UI components should not contain business logic",
          "API calls should be abstracted into hooks or services",
          "Configuration should be externalized",
          "Database schema should be separate from queries",
        ],
        severity: "error",
      },
      {
        id: "maintainability-test",
        name: "Code Maintainability",
        description: "Assess how easy the code is to understand and modify",
        questions: [
          "Is the code easy to understand without extensive comments?",
          "Are variable and function names descriptive?",
          "Is the code complexity reasonable?",
          "Are there appropriate tests for this functionality?",
          "Is the documentation adequate?",
        ],
        criteria: [
          "Functions should be < 50 lines",
          "Cyclomatic complexity should be < 10",
          "All public interfaces should be documented",
          "Critical functionality should have tests",
        ],
        severity: "warning",
      },
      {
        id: "dependency-test",
        name: "Dependency Management",
        description: "Evaluate dependency patterns and potential issues",
        questions: [
          "Are the dependencies necessary and appropriate?",
          "Are there any circular dependencies?",
          "Are external dependencies properly versioned?",
          "Are internal dependencies following proper hierarchies?",
          "Could any dependencies be eliminated through better design?",
        ],
        criteria: [
          "No circular dependencies between modules",
          "External dependencies should be pinned to specific versions",
          "Internal dependencies should follow architectural layers",
          "Utility functions should not depend on components",
        ],
        severity: "error",
      },
    ];
  }

  private generateMermaidDiagrams(
    nodes: OrganizationNode[],
    ladders: DependencyLadder[],
    scores: StructureAuditResult["scores"],
  ): StructureAuditResult["mermaidDiagrams"] {
    const architectureOverview = this.generateArchitectureDiagram();
    const dependencyGraph = this.generateDependencyDiagram(nodes);
    const organizationStructure = this.generateOrganizationDiagram();
    const problemAreas = this.generateProblemAreasDiagram(scores);

    return {
      architectureOverview,
      dependencyGraph,
      organizationStructure,
      problemAreas,
    };
  }

  private generateArchitectureDiagram(): string {
    return `
graph TB
    subgraph "Presentation Layer"
        A[App Router Pages]
        B[React Components]
        C[UI Components]
    end
    
    subgraph "Business Logic Layer"
        D[Custom Hooks]
        E[Agents System]
        F[Store Management]
    end
    
    subgraph "Data Access Layer"
        G[Convex Queries]
        H[Convex Mutations]
        I[Authentication]
    end
    
    subgraph "Infrastructure Layer"
        J[Convex Database]
        K[Clerk Auth]
        L[External APIs]
    end
    
    A --> B
    B --> C
    B --> D
    D --> G
    D --> H
    E --> G
    E --> H
    F --> D
    G --> J
    H --> J
    I --> K
    E --> L
    
    classDef presentation fill:#e1f5fe
    classDef business fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef infrastructure fill:#fff3e0
    
    class A,B,C presentation
    class D,E,F business
    class G,H,I data
    class J,K,L infrastructure
`;
  }

  private generateDependencyDiagram(nodes: OrganizationNode[]): string {
    let diagram = "graph LR\n";

    // Add nodes
    for (const node of nodes.slice(0, 20)) {
      // Limit to avoid clutter
      const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, "_");
      diagram += `    ${nodeId}[${node.name}]\n`;
    }

    // Add dependencies
    for (const node of nodes.slice(0, 20)) {
      const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, "_");
      for (const dep of node.dependencies.slice(0, 3)) {
        // Limit dependencies shown
        const depNode = nodes.find((n) => n.path.includes(dep));
        if (depNode) {
          const depId = depNode.id.replace(/[^a-zA-Z0-9]/g, "_");
          diagram += `    ${nodeId} --> ${depId}\n`;
        }
      }
    }

    return diagram;
  }

  private generateOrganizationDiagram(): string {
    return `
graph TD
    ROOT[AURA Project]
    
    ROOT --> APP[app/]
    ROOT --> COMPONENTS[components/]
    ROOT --> LIB[lib/]
    ROOT --> CONVEX[convex/]
    
    APP --> PAGES[_components/]
    APP --> TESTS[tests/]
    
    PAGES --> ACTIVITY[activity/]
    PAGES --> AGENTS[agents/]
    PAGES --> AUTH[auth/]
    PAGES --> DASHBOARD[dashboard/]
    PAGES --> EDITOR[editor/]
    PAGES --> SIDEBAR[sidebar/]
    PAGES --> TERMINAL[terminal/]
    
    COMPONENTS --> UI[ui/]
    COMPONENTS --> PROVIDER[ConvexClientProvider]
    
    LIB --> HOOKS[hooks/]
    LIB --> STORE[store/]
    LIB --> AGENTS_LIB[agents/]
    LIB --> EXTENSIONS[extensions/]
    LIB --> UTILS[utils.ts]
    
    CONVEX --> SCHEMA[schema.ts]
    CONVEX --> QUERIES[*.ts queries]
    CONVEX --> AUTH_CONFIG[auth.config.ts]
    
    TESTS --> STATE[state/]
    TESTS --> STRUCTURE[structure/]
    
    classDef directory fill:#f9f,stroke:#333,stroke-width:2px
    classDef file fill:#bbf,stroke:#333,stroke-width:1px
    
    class ROOT,APP,COMPONENTS,LIB,CONVEX,PAGES,TESTS,HOOKS,STORE,AGENTS_LIB,EXTENSIONS,UI,ACTIVITY,AGENTS,AUTH,DASHBOARD,EDITOR,SIDEBAR,TERMINAL,STATE,STRUCTURE directory
    class PROVIDER,UTILS,SCHEMA,QUERIES,AUTH_CONFIG file
`;
  }

  private generateProblemAreasDiagram(
    scores: StructureAuditResult["scores"],
  ): string {
    const problems: string[] = [];

    if (scores.modularity.score < 3) problems.push("Modularity Issues");
    if (scores.consistency.score < 3) problems.push("Consistency Issues");
    if (scores.separationOfConcerns.score < 3)
      problems.push("Separation Issues");
    if (scores.maintainability.score < 3)
      problems.push("Maintainability Issues");
    if (scores.dependencyManagement.score < 3)
      problems.push("Dependency Issues");

    if (problems.length === 0) {
      return `
graph TD
    A[Code Organization] --> B[✅ Excellent Structure]
    B --> C[All Areas Score > 3.0]
    
    classDef success fill:#d4edda,stroke:#155724
    class A,B,C success
`;
    }

    let diagram = "graph TD\n    A[Code Organization Issues]\n";

    problems.forEach((problem, index) => {
      const nodeId = String.fromCharCode(66 + index); // B, C, D, etc.
      diagram += `    A --> ${nodeId}[${problem}]\n`;
    });

    diagram += `
    classDef problem fill:#f8d7da,stroke:#721c24
    classDef main fill:#fff3cd,stroke:#856404
    
    class A main
    class ${problems.map((_, index) => String.fromCharCode(66 + index)).join(",")} problem
`;

    return diagram;
  }

  private countFiles(structure: DirectoryStructure): number {
    let count = 0;

    if (structure.type === "file") {
      count = 1;
    }

    for (const child of structure.children) {
      count += this.countFiles(child);
    }

    return count;
  }

  private countDirectories(structure: DirectoryStructure): number {
    let count = 0;

    if (structure.type === "directory") {
      count = 1;
    }

    for (const child of structure.children) {
      count += this.countDirectories(child);
    }

    return count;
  }

  private getTotalRecommendations(
    scores: StructureAuditResult["scores"],
  ): number {
    return (
      scores.modularity.recommendations.length +
      scores.consistency.recommendations.length +
      scores.separationOfConcerns.recommendations.length +
      scores.maintainability.recommendations.length +
      scores.dependencyManagement.recommendations.length
    );
  }

  private printResults(result: StructureAuditResult): void {
    console.log("\n📊 AURA Structure Audit Results");
    console.log("================================\n");

    // Overall status
    const status = result.passed ? "✅ PASSED" : "❌ FAILED";
    const statusColor = result.passed ? "\x1b[32m" : "\x1b[31m";
    console.log(`${statusColor}Status: ${status}\x1b[0m`);
    console.log(`Overall Score: ${result.scores.overall}/5.0\n`);

    // Summary statistics
    console.log("📈 Summary Statistics");
    console.log("-------------------");
    console.log(`Total Files: ${result.summary.totalFiles}`);
    console.log(`Total Directories: ${result.summary.totalDirectories}`);
    console.log(`Organization Nodes: ${result.organizationNodes.length}`);
    console.log(`Dependency Ladders: ${result.dependencyLadders.length}`);
    console.log(
      `Violations: ${result.summary.violationsCount} (${result.summary.errorsCount} errors, ${result.summary.warningsCount} warnings)`,
    );
    console.log(`Recommendations: ${result.summary.recommendationsCount}\n`);

    // Detailed scores
    console.log("🎯 Detailed Scores");
    console.log("-----------------");
    this.printScoreDetail("Modularity", result.scores.modularity);
    this.printScoreDetail("Consistency", result.scores.consistency);
    this.printScoreDetail(
      "Separation of Concerns",
      result.scores.separationOfConcerns,
    );
    this.printScoreDetail("Maintainability", result.scores.maintainability);
    this.printScoreDetail(
      "Dependency Management",
      result.scores.dependencyManagement,
    );

    // Top recommendations
    console.log("\n💡 Top Recommendations");
    console.log("---------------------");
    const allRecommendations = [
      ...result.scores.modularity.recommendations,
      ...result.scores.consistency.recommendations,
      ...result.scores.separationOfConcerns.recommendations,
      ...result.scores.maintainability.recommendations,
      ...result.scores.dependencyManagement.recommendations,
    ];

    allRecommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // Conceptual tests info
    console.log("\n🧪 Conceptual Tests Available");
    console.log("----------------------------");
    result.conceptualTests.forEach((test) => {
      const severityIcon =
        test.severity === "error"
          ? "🚨"
          : test.severity === "warning"
            ? "⚠️"
            : "ℹ️";
      console.log(
        `${severityIcon} ${test.name}: ${test.questions.length} questions`,
      );
    });

    console.log("\n📋 Run individual tests with detailed output:");
    console.log("pnpm structure --detailed");
    console.log("pnpm structure --mermaid");
    console.log("pnpm structure --nodes");
    console.log("pnpm structure --ladders\n");
  }

  private printScoreDetail(
    name: string,
    score:
      | ModularityScore
      | ConsistencyScore
      | SeparationOfConcernsScore
      | MaintainabilityScore
      | DependencyManagementScore,
  ): void {
    const scoreColor =
      score.score >= 4
        ? "\x1b[32m"
        : score.score >= 3
          ? "\x1b[33m"
          : "\x1b[31m";
    console.log(`${scoreColor}${name}: ${score.score}/5.0\x1b[0m`);
    console.log(`  ${score.justification}`);

    if (score.examples.length > 0) {
      console.log(`  Examples: ${score.examples[0]}`);
    }

    if (score.recommendations.length > 0) {
      console.log(`  Recommendation: ${score.recommendations[0]}`);
    }
    console.log();
  }
}

// Main execution
async function main(): Promise<void> {
  const auditor = new StructureAuditor();
  const result = await auditor.runAudit();

  // Save results to file for detailed analysis
  const resultsPath = path.join(__dirname, "structure-audit-results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));

  console.log(`📁 Detailed results saved to: ${resultsPath}`);

  // Exit with error code if audit failed
  process.exit(result.passed ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

export { StructureAuditor, type StructureAuditResult };
