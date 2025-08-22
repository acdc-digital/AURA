# Agent System Testing Guide

_AURA Platform - Comprehensive Testing Strategy for Agent System_

## Overview

This guide outlines the testing strategy and implementation for the AURA Agent System. It covers unit tests, integration tests, end-to-end testing, and performance validation to ensure robust and reliable agent functionality.

## Testing Architecture

### Test Structure

```
AURA/tests/
├── agents/
│   ├── unit/
│   │   ├── base-agent.test.ts
│   │   ├── instructions-agent.test.ts
│   │   ├── cmo-agent.test.ts
│   │   ├── file-creator-agent.test.ts
│   │   ├── project-creator-agent.test.ts
│   │   └── scheduling-agent.test.ts
│   ├── integration/
│   │   ├── agent-registry.test.ts
│   │   ├── convex-integration.test.ts
│   │   ├── terminal-integration.test.ts
│   │   └── ui-integration.test.ts
│   ├── e2e/
│   │   ├── agent-workflows.test.ts
│   │   ├── premium-features.test.ts
│   │   └── error-scenarios.test.ts
│   └── performance/
│       ├── load-testing.test.ts
│       ├── memory-usage.test.ts
│       └── response-time.test.ts
```

### Testing Stack

- **Unit Testing**: Jest with TypeScript support
- **Integration Testing**: Jest with Convex test utilities
- **E2E Testing**: Playwright for full browser testing
- **Performance Testing**: Artillery for load testing
- **Mocking**: Jest mocks for external dependencies

## Unit Testing

### Base Agent Testing

```typescript
// tests/agents/unit/base-agent.test.ts
import { BaseAgent, AgentTool, ConvexMutations } from '@/lib/agents/base';

class TestAgent extends BaseAgent {
  readonly id = 'test-agent';
  readonly name = 'Test Agent';
  readonly description = 'Agent for testing';
  readonly icon = '🧪';
  readonly isPremium = false;
  readonly tools: AgentTool[] = [
    {
      command: '/test',
      name: 'Test Command',
      description: 'Test command description'
    }
  ];

  async execute(): Promise<any> {
    return { success: true, message: 'Test executed' };
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;
  let mockMutations: jest.Mocked<ConvexMutations>;

  beforeEach(() => {
    agent = new TestAgent();
    mockMutations = createMockMutations();
  });

  describe('getTool', () => {
    it('should return tool by command', () => {
      const tool = agent.getTool('/test');
      expect(tool).toBeDefined();
      expect(tool?.command).toBe('/test');
    });

    it('should return undefined for non-existent command', () => {
      const tool = agent.getTool('/nonexistent');
      expect(tool).toBeUndefined();
    });
  });

  describe('canExecute', () => {
    it('should return true by default', () => {
      expect(agent.canExecute()).toBe(true);
    });
  });

  describe('getMetadata', () => {
    it('should return complete metadata', () => {
      const metadata = agent.getMetadata();
      expect(metadata).toEqual({
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Agent for testing',
        icon: '🧪',
        isPremium: false,
        toolCount: 1,
        tools: agent.tools
      });
    });
  });
});
```

### Instructions Agent Testing

```typescript
// tests/agents/unit/instructions-agent.test.ts
import { InstructionsAgent } from '@/lib/agents/instructionsAgent';
import { createMockMutations, createMockContext } from '@/tests/helpers/mocks';

describe('InstructionsAgent', () => {
  let agent: InstructionsAgent;
  let mockMutations: jest.Mocked<ConvexMutations>;

  beforeEach(() => {
    agent = new InstructionsAgent();
    mockMutations = createMockMutations();
  });

  describe('execute', () => {
    it('should create instruction file for valid input', async () => {
      const tool = agent.tools[0];
      const input = 'React component development guidelines audience:developers';
      const context = createMockContext({ userId: 'user-123' });

      const result = await agent.execute(tool, input, mockMutations, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Instructions created');
      expect(mockMutations.createFile).toHaveBeenCalledWith({
        name: expect.stringMatching(/react.*component/i),
        type: 'document',
        content: expect.stringContaining('React'),
        projectId: expect.any(String),
        userId: 'user-123',
        extension: 'md'
      });
    });

    it('should handle empty input gracefully', async () => {
      const tool = agent.tools[0];
      const result = await agent.execute(tool, '', mockMutations);

      expect(result.success).toBe(false);
      expect(result.message).toContain('provide a topic');
    });

    it('should parse audience parameter correctly', async () => {
      const tool = agent.tools[0];
      const input = 'API documentation audience:developers';
      
      const result = await agent.execute(tool, input, mockMutations);

      expect(result.success).toBe(true);
      expect(mockMutations.createFile).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('developers')
        })
      );
    });
  });

  describe('parseInput', () => {
    it('should extract topic and audience', () => {
      const input = 'React hooks best practices audience:developers';
      const parsed = agent.parseInput(input);

      expect(parsed.topic).toBe('React hooks best practices');
      expect(parsed.audience).toBe('developers');
    });

    it('should handle input without audience', () => {
      const input = 'TypeScript configuration';
      const parsed = agent.parseInput(input);

      expect(parsed.topic).toBe('TypeScript configuration');
      expect(parsed.audience).toBe('general');
    });
  });
});
```

### CMO Agent Testing

```typescript
// tests/agents/unit/cmo-agent.test.ts
import { TwitterAgent } from '@/lib/agents/twitterAgent';
import { createMockMutations, createMockContext } from '@/tests/helpers/mocks';

describe('TwitterAgent (CMO)', () => {
  let agent: TwitterAgent;
  let mockMutations: jest.Mocked<ConvexMutations>;

  beforeEach(() => {
    agent = new TwitterAgent();
    mockMutations = createMockMutations();
  });

  describe('premium validation', () => {
    it('should require premium access', async () => {
      const tool = agent.tools[0];
      const context = createMockContext({ userId: 'free-user', isPremium: false });

      const result = await agent.execute(tool, 'test tweet', mockMutations, context);

      expect(result.success).toBe(false);
      expect(result.message).toContain('premium');
      expect(result.requiresUpgrade).toBe(true);
    });

    it('should allow execution for premium users', async () => {
      const tool = agent.tools[0];
      const context = createMockContext({ userId: 'premium-user', isPremium: true });

      const result = await agent.execute(tool, 'test tweet', mockMutations, context);

      expect(result.success).toBe(true);
    });
  });

  describe('content creation', () => {
    it('should create Twitter post with scheduling', async () => {
      const tool = agent.tools[0];
      const input = 'New feature launch! --schedule "tomorrow 2pm" --project Marketing';
      const context = createMockContext({ isPremium: true });

      const result = await agent.execute(tool, input, mockMutations, context);

      expect(result.success).toBe(true);
      expect(mockMutations.createFile).toHaveBeenCalledWith({
        name: expect.stringMatching(/.*\.x$/),
        type: 'post',
        platform: 'twitter',
        content: expect.stringContaining('New feature launch'),
        scheduledAt: expect.any(Number),
        projectId: expect.any(String)
      });
    });

    it('should optimize hashtags', async () => {
      const tool = agent.tools[0];
      const input = 'Exciting product update for developers';
      const context = createMockContext({ isPremium: true });

      const result = await agent.execute(tool, input, mockMutations, context);

      const createdFile = mockMutations.createFile.mock.calls[0][0];
      const content = JSON.parse(createdFile.content);
      
      expect(content.hashtags).toEqual(expect.arrayContaining(['#product', '#developers']));
    });
  });
});
```

## Integration Testing

### Agent Registry Integration

```typescript
// tests/agents/integration/agent-registry.test.ts
import { AgentRegistry } from '@/lib/agents/registry';
import { InstructionsAgent } from '@/lib/agents/instructionsAgent';
import { TwitterAgent } from '@/lib/agents/twitterAgent';
import { createMockMutations } from '@/tests/helpers/mocks';

describe('AgentRegistry Integration', () => {
  let registry: AgentRegistry;
  let mockMutations: jest.Mocked<ConvexMutations>;

  beforeEach(() => {
    registry = new AgentRegistry();
    mockMutations = createMockMutations();
  });

  describe('agent registration', () => {
    it('should register agents and their commands', () => {
      const instructionsAgent = new InstructionsAgent();
      const twitterAgent = new TwitterAgent();

      registry.register(instructionsAgent);
      registry.register(twitterAgent);

      expect(registry.getAllAgents()).toHaveLength(2);
      expect(registry.hasCommand('/instructions')).toBe(true);
      expect(registry.hasCommand('/twitter')).toBe(true);
    });

    it('should handle command conflicts', () => {
      const agent1 = new InstructionsAgent();
      const agent2 = new InstructionsAgent();

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      registry.register(agent1);
      registry.register(agent2);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Command "/instructions" already exists')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('command execution', () => {
    beforeEach(() => {
      registry.register(new InstructionsAgent());
      registry.register(new TwitterAgent());
    });

    it('should route commands to correct agents', async () => {
      const result = await registry.executeCommand(
        '/instructions',
        'test topic',
        mockMutations
      );

      expect(result.success).toBe(true);
      expect(mockMutations.createFile).toHaveBeenCalled();
    });

    it('should handle unknown commands', async () => {
      const result = await registry.executeCommand(
        '/unknown',
        'test input',
        mockMutations
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('No agent found');
    });

    it('should propagate agent execution errors', async () => {
      mockMutations.createFile.mockRejectedValue(new Error('Database error'));

      const result = await registry.executeCommand(
        '/instructions',
        'test topic',
        mockMutations
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
    });
  });
});
```

### Convex Integration Testing

```typescript
// tests/agents/integration/convex-integration.test.ts
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '@/convex/_generated/api';
import { InstructionsAgent } from '@/lib/agents/instructionsAgent';

describe('Convex Integration', () => {
  let convex: ConvexTestingHelper;
  let agent: InstructionsAgent;

  beforeEach(async () => {
    convex = new ConvexTestingHelper();
    agent = new InstructionsAgent();
  });

  afterEach(async () => {
    await convex.cleanup();
  });

  it('should create files in database', async () => {
    // Create a test user
    const userId = await convex.mutation(api.users.create, {
      name: 'Test User',
      email: 'test@example.com'
    });

    // Create mutations object
    const mutations = {
      createProject: (args: any) => convex.mutation(api.projects.create, args),
      createFile: (args: any) => convex.mutation(api.files.create, args),
      // ... other mutations
    };

    // Execute agent
    const result = await agent.execute(
      agent.tools[0],
      'test instructions',
      mutations,
      { userId }
    );

    expect(result.success).toBe(true);

    // Verify file was created in database
    const files = await convex.query(api.files.listByUser, { userId });
    expect(files).toHaveLength(1);
    expect(files[0].name).toContain('test-instructions');
    expect(files[0].type).toBe('document');
  });

  it('should handle database connection failures', async () => {
    // Simulate database failure
    const mutations = {
      createFile: jest.fn().mockRejectedValue(new Error('Connection failed')),
      // ... other mutations
    };

    const result = await agent.execute(
      agent.tools[0],
      'test instructions',
      mutations
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('failed');
  });
});
```

## End-to-End Testing

### Agent Workflow Testing

```typescript
// tests/agents/e2e/agent-workflows.test.ts
import { test, expect } from '@playwright/test';

test.describe('Agent Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="agents-panel"]');
  });

  test('complete instructions agent workflow', async ({ page }) => {
    // Open agents panel
    await page.click('[data-testid="agents-button"]');
    await expect(page.locator('[data-testid="agents-panel"]')).toBeVisible();

    // Activate instructions agent
    await page.click('[data-testid="agent-instructions"]');
    await expect(page.locator('[data-testid="agent-instructions-active"]')).toBeVisible();

    // Open terminal
    await page.click('[data-testid="terminal-button"]');
    await expect(page.locator('[data-testid="terminal-panel"]')).toBeVisible();

    // Execute instructions command
    await page.fill('[data-testid="terminal-input"]', '/instructions React component guidelines audience:developers');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Wait for execution
    await expect(page.locator('[data-testid="chat-message-success"]')).toBeVisible();
    await expect(page.locator('text=Instructions created')).toBeVisible();

    // Verify file was created and opened in editor
    await expect(page.locator('[data-testid="editor-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="editor-content"]')).toContainText('React');
  });

  test('file creator interactive workflow', async ({ page }) => {
    // Activate file creator agent
    await page.click('[data-testid="agents-button"]');
    await page.click('[data-testid="agent-file-creator"]');

    // Open terminal and execute command
    await page.click('[data-testid="terminal-button"]');
    await page.fill('[data-testid="terminal-input"]', '/create-file marketing tweet for product launch');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Interact with project selector
    await expect(page.locator('[data-testid="project-selector"]')).toBeVisible();
    await page.click('[data-testid="project-option-marketing"]');

    // Verify file creation
    await expect(page.locator('text=File created successfully')).toBeVisible();
    await expect(page.locator('[data-testid="editor-tab"]')).toBeVisible();
  });

  test('premium agent access control', async ({ page }) => {
    // Try to use premium agent without subscription
    await page.click('[data-testid="agents-button"]');
    await page.click('[data-testid="agent-cmo"]');

    await page.click('[data-testid="terminal-button"]');
    await page.fill('[data-testid="terminal-input"]', '/twitter test tweet');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Should show upgrade prompt
    await expect(page.locator('text=premium subscription required')).toBeVisible();
    await expect(page.locator('[data-testid="upgrade-button"]')).toBeVisible();
  });
});
```

### Error Scenario Testing

```typescript
// tests/agents/e2e/error-scenarios.test.ts
import { test, expect } from '@playwright/test';

test.describe('Error Scenarios', () => {
  test('handles network connectivity issues', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/dashboard');
    await page.click('[data-testid="agents-button"]');
    await page.click('[data-testid="agent-instructions"]');
    await page.click('[data-testid="terminal-button"]');

    await page.fill('[data-testid="terminal-input"]', '/instructions test');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Should show connection error
    await expect(page.locator('text=connection error')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('handles invalid command gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="terminal-button"]');

    await page.fill('[data-testid="terminal-input"]', '/nonexistent-command');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    await expect(page.locator('text=Unknown command')).toBeVisible();
    await expect(page.locator('text=Available commands:')).toBeVisible();
  });

  test('recovers from agent execution errors', async ({ page }) => {
    // Setup scenario that causes agent error
    await page.goto('/dashboard');
    await page.click('[data-testid="agents-button"]');
    await page.click('[data-testid="agent-instructions"]');
    await page.click('[data-testid="terminal-button"]');

    // Send invalid input
    await page.fill('[data-testid="terminal-input"]', '/instructions');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    // Should show helpful error message
    await expect(page.locator('text=Please provide a topic')).toBeVisible();
    await expect(page.locator('text=Example:')).toBeVisible();

    // Should allow retry
    await page.fill('[data-testid="terminal-input"]', '/instructions valid topic');
    await page.press('[data-testid="terminal-input"]', 'Enter');

    await expect(page.locator('text=Instructions created')).toBeVisible();
  });
});
```

## Performance Testing

### Load Testing

```typescript
// tests/agents/performance/load-testing.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('handles multiple concurrent agent executions', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Setup multiple agents
    const agents = ['instructions', 'file-creator', 'project-creator'];
    const promises: Promise<any>[] = [];

    for (const agentId of agents) {
      const promise = page.evaluate(async (agentId) => {
        const startTime = performance.now();
        
        // Simulate agent execution
        const response = await fetch('/api/agents/execute', {
          method: 'POST',
          body: JSON.stringify({
            agentId,
            command: `/${agentId}`,
            input: 'test input'
          })
        });
        
        const endTime = performance.now();
        return { agentId, duration: endTime - startTime, success: response.ok };
      }, agentId);
      
      promises.push(promise);
    }

    const results = await Promise.all(promises);

    // Verify all executions completed successfully
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(5000); // 5 second timeout
    });
  });

  test('memory usage remains stable', async ({ page }) => {
    await page.goto('/dashboard');

    // Measure initial memory
    const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

    // Execute many agent operations
    for (let i = 0; i < 50; i++) {
      await page.fill('[data-testid="terminal-input"]', `/instructions test ${i}`);
      await page.press('[data-testid="terminal-input"]', 'Enter');
      await page.waitForSelector('[data-testid="chat-message-success"]');
    }

    // Measure final memory
    const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

### Response Time Testing

```typescript
// tests/agents/performance/response-time.test.ts
import { performance } from 'perf_hooks';
import { AgentRegistry } from '@/lib/agents/registry';
import { initializeAgents } from '@/lib/agents';

describe('Response Time Performance', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = initializeAgents();
  });

  test('agent execution completes within acceptable time limits', async () => {
    const commands = ['/instructions', '/create-file', '/create-project'];
    const timeouts = { '/instructions': 3000, '/create-file': 2000, '/create-project': 4000 };

    for (const command of commands) {
      const startTime = performance.now();
      
      const result = await registry.executeCommand(
        command,
        'test input',
        createMockMutations()
      );

      const duration = performance.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(timeouts[command]);
    }
  });

  test('command routing is fast', async () => {
    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      registry.getAgentByCommand('/instructions');
      registry.hasCommand('/create-file');
      registry.getAllCommands();
    }

    const duration = performance.now() - startTime;
    const avgDuration = duration / iterations;

    // Average operation should be under 1ms
    expect(avgDuration).toBeLessThan(1);
  });
});
```

## Test Utilities

### Mock Helpers

```typescript
// tests/helpers/mocks.ts
import { ConvexMutations, AgentExecutionContext } from '@/lib/agents/base';

export const createMockMutations = (): jest.Mocked<ConvexMutations> => ({
  createProject: jest.fn().mockResolvedValue('project-id-123'),
  createFile: jest.fn().mockResolvedValue('file-id-123'),
  updateFile: jest.fn().mockResolvedValue(undefined),
  addChatMessage: jest.fn().mockResolvedValue('message-id-123'),
  updateChatMessage: jest.fn().mockResolvedValue(undefined),
  updateAgentProgress: jest.fn().mockResolvedValue(undefined),
});

export const createMockContext = (overrides: Partial<AgentExecutionContext> = {}): AgentExecutionContext => ({
  sessionId: 'session-123',
  userId: 'user-123',
  projectId: 'project-123',
  ...overrides
});

export const createMockAgent = (overrides: any = {}) => ({
  id: 'mock-agent',
  name: 'Mock Agent',
  description: 'Mock agent for testing',
  icon: '🧪',
  isPremium: false,
  tools: [
    {
      command: '/mock',
      name: 'Mock Command',
      description: 'Mock command for testing'
    }
  ],
  execute: jest.fn().mockResolvedValue({ success: true, message: 'Mock executed' }),
  getTool: jest.fn(),
  canExecute: jest.fn().mockReturnValue(true),
  getMetadata: jest.fn(),
  ...overrides
});
```

### Test Data Factory

```typescript
// tests/helpers/test-data.ts
export const createTestProject = (overrides: any = {}) => ({
  id: 'project-123',
  name: 'Test Project',
  description: 'Test project description',
  status: 'active',
  userId: 'user-123',
  createdAt: Date.now(),
  ...overrides
});

export const createTestFile = (overrides: any = {}) => ({
  id: 'file-123',
  name: 'test-file.md',
  type: 'document',
  content: 'Test file content',
  projectId: 'project-123',
  userId: 'user-123',
  extension: 'md',
  createdAt: Date.now(),
  lastModified: Date.now(),
  ...overrides
});

export const createTestChatMessage = (overrides: any = {}) => ({
  id: 'message-123',
  role: 'assistant',
  content: 'Test message',
  sessionId: 'session-123',
  userId: 'user-123',
  createdAt: Date.now(),
  ...overrides
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/agent-tests.yml
name: Agent System Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:agents:unit
      - run: pnpm test:agents:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: npx playwright install
      - run: pnpm test:agents:e2e

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:agents:performance
```

### Test Scripts

```json
{
  "scripts": {
    "test:agents": "jest tests/agents --passWithNoTests",
    "test:agents:unit": "jest tests/agents/unit --passWithNoTests",
    "test:agents:integration": "jest tests/agents/integration --passWithNoTests",
    "test:agents:e2e": "playwright test tests/agents/e2e",
    "test:agents:performance": "jest tests/agents/performance --passWithNoTests",
    "test:agents:watch": "jest tests/agents --watch",
    "test:agents:coverage": "jest tests/agents --coverage"
  }
}
```

## Best Practices

### Test Organization

1. **Group by Type**: Separate unit, integration, and e2e tests
2. **Agent-Specific Tests**: Each agent should have its own test file
3. **Shared Utilities**: Use common mocks and test data factories
4. **Clear Naming**: Test names should describe the exact scenario being tested

### Test Quality

1. **Comprehensive Coverage**: Aim for >90% code coverage for agent logic
2. **Edge Cases**: Test error conditions, invalid inputs, and edge cases
3. **Performance**: Include performance regression testing
4. **Real Scenarios**: E2E tests should reflect actual user workflows

### Maintenance

1. **Regular Updates**: Keep tests updated with agent changes
2. **Flaky Test Management**: Address flaky tests promptly
3. **Performance Monitoring**: Monitor test execution times
4. **Documentation**: Keep test documentation current

This comprehensive testing strategy ensures the AURA Agent System maintains high quality and reliability while enabling confident development and deployment of new features.
