// AGENT CONTEXT ANALYTICS - Performance metrics and context tracking for AURA agents
// /Users/matthewsimon/Projects/AURA/AURA/lib/debug/context.ts

interface AgentMetrics {
  agentId: string;
  invocationCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  successRate: number;
  errorLog: Array<{
    error: string;
    timestamp: Date;
    input: string;
  }>;
}

interface SystemHealthMetrics {
  overallSuccessRate: number;
  averageResponseTime: number;
  activeAgentsCount: number;
  resourceUtilization: {
    memory: number;
    cpu: number;
  };
  lastHealthCheck: Date;
}

class AgentContextAnalytics {
  private static instance: AgentContextAnalytics;
  private agentMetrics: Map<string, AgentMetrics> = new Map();
  private systemHealth: SystemHealthMetrics = {
    overallSuccessRate: 0,
    averageResponseTime: 0,
    activeAgentsCount: 0,
    resourceUtilization: {
      memory: 0,
      cpu: 0
    },
    lastHealthCheck: new Date()
  };

  private constructor() {
    this.startHealthMonitoring();
  }

  static getInstance(): AgentContextAnalytics {
    if (!AgentContextAnalytics.instance) {
      AgentContextAnalytics.instance = new AgentContextAnalytics();
    }
    return AgentContextAnalytics.instance;
  }

  // Record agent invocation
  recordInvocation(agentId: string, startTime: number, success: boolean, error?: string, input?: string): void {
    const responseTime = Date.now() - startTime;
    
    if (!this.agentMetrics.has(agentId)) {
      this.agentMetrics.set(agentId, {
        agentId,
        invocationCount: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorLog: []
      });
    }

    const metrics = this.agentMetrics.get(agentId)!;
    metrics.invocationCount++;
    
    if (success) {
      metrics.successCount++;
    } else {
      metrics.errorCount++;
      if (error) {
        metrics.errorLog.push({
          error,
          timestamp: new Date(),
          input: input || 'Unknown input'
        });
        
        // Keep only last 10 errors
        if (metrics.errorLog.length > 10) {
          metrics.errorLog = metrics.errorLog.slice(-10);
        }
      }
    }

    // Update averages
    metrics.averageResponseTime = (metrics.averageResponseTime * (metrics.invocationCount - 1) + responseTime) / metrics.invocationCount;
    metrics.successRate = (metrics.successCount / metrics.invocationCount) * 100;

    this.updateSystemHealth();
  }

  // Get metrics for specific agent
  getAgentMetrics(agentId: string): AgentMetrics | undefined {
    return this.agentMetrics.get(agentId);
  }

  // Get all agent metrics
  getAllAgentMetrics(): AgentMetrics[] {
    return Array.from(this.agentMetrics.values());
  }

  // Get system health
  getSystemHealth(): SystemHealthMetrics {
    return { ...this.systemHealth };
  }

  // Get top performing agents
  getTopPerformingAgents(limit: number = 5): AgentMetrics[] {
    return Array.from(this.agentMetrics.values())
      .filter(metrics => metrics.invocationCount > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  // Get most problematic agents
  getProblematicAgents(limit: number = 5): AgentMetrics[] {
    return Array.from(this.agentMetrics.values())
      .filter(metrics => metrics.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit);
  }

  // Clear specific agent metrics
  clearAgentMetrics(agentId: string): void {
    this.agentMetrics.delete(agentId);
    this.updateSystemHealth();
  }

  // Clear all metrics
  clearAllMetrics(): void {
    this.agentMetrics.clear();
    this.updateSystemHealth();
  }

  // Export metrics for debugging
  exportMetrics(): {
    agents: AgentMetrics[];
    system: SystemHealthMetrics;
    exportTime: Date;
  } {
    return {
      agents: this.getAllAgentMetrics(),
      system: this.getSystemHealth(),
      exportTime: new Date()
    };
  }

  // Private method to update system health
  private updateSystemHealth(): void {
    const allMetrics = this.getAllAgentMetrics();
    
    if (allMetrics.length === 0) {
      this.systemHealth.overallSuccessRate = 0;
      this.systemHealth.averageResponseTime = 0;
      this.systemHealth.activeAgentsCount = 0;
    } else {
      const totalInvocations = allMetrics.reduce((sum, m) => sum + m.invocationCount, 0);
      const totalSuccess = allMetrics.reduce((sum, m) => sum + m.successCount, 0);
      
      this.systemHealth.overallSuccessRate = totalInvocations > 0 ? (totalSuccess / totalInvocations) * 100 : 0;
      this.systemHealth.averageResponseTime = allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / allMetrics.length;
      this.systemHealth.activeAgentsCount = allMetrics.filter(m => m.invocationCount > 0).length;
    }
    
    this.systemHealth.lastHealthCheck = new Date();
  }

  // Private method to start health monitoring
  private startHealthMonitoring(): void {
    // Monitor resource utilization if available
    setInterval(() => {
      // Use Chrome's performance.memory if available
      const performanceWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };

      if (performanceWithMemory.memory) {
        this.systemHealth.resourceUtilization.memory = 
          Math.round(performanceWithMemory.memory.usedJSHeapSize / 1024 / 1024); // MB
      }

      this.systemHealth.lastHealthCheck = new Date();
    }, 5000); // Update every 5 seconds
  }
}

// Export singleton instance
export const agentContextAnalytics = AgentContextAnalytics.getInstance();

// Utility function to track agent execution
export function trackAgentExecution<T>(
  agentId: string,
  execution: () => Promise<T>,
  input?: string
): Promise<T> {
  const startTime = Date.now();
  
  return execution()
    .then((result) => {
      agentContextAnalytics.recordInvocation(agentId, startTime, true, undefined, input);
      return result;
    })
    .catch((error) => {
      agentContextAnalytics.recordInvocation(agentId, startTime, false, error.message, input);
      throw error;
    });
}

// Debug utilities for browser console
if (typeof window !== 'undefined') {
  (window as unknown as { debugAgents: {
    getMetrics: (agentId?: string) => AgentMetrics | AgentMetrics[];
    getSystemHealth: () => SystemHealthMetrics;
    getTopPerformers: (limit?: number) => AgentMetrics[];
    getProblematic: (limit?: number) => AgentMetrics[];
    exportAll: () => object;
    clear: (agentId?: string) => void;
  } }).debugAgents = {
    getMetrics: (agentId?: string) => {
      if (agentId) {
        return agentContextAnalytics.getAgentMetrics(agentId) || [];
      }
      return agentContextAnalytics.getAllAgentMetrics();
    },
    
    getSystemHealth: () => agentContextAnalytics.getSystemHealth(),
    
    getTopPerformers: (limit?: number) => agentContextAnalytics.getTopPerformingAgents(limit),
    
    getProblematic: (limit?: number) => agentContextAnalytics.getProblematicAgents(limit),
    
    exportAll: () => agentContextAnalytics.exportMetrics(),
    
    clear: (agentId?: string) => {
      if (agentId) {
        agentContextAnalytics.clearAgentMetrics(agentId);
      } else {
        agentContextAnalytics.clearAllMetrics();
      }
    }
  };
}
