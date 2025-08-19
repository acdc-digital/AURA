# Instructions Agent Specification

_EAC Financial Dashboard - Agent System_

## Agent Overview

The **Instructions Agent** is designed to generate and maintain project instructions and documentation within the EAC Financial Dashboard. This agent helps create standardized, comprehensive instruction documents for various aspects of the project.

## Purpose

The Instructions Agent serves to:

- Generate context-aware instruction documents
- Maintain consistent documentation standards
- Provide helpful guidance for project tasks
- Create searchable reference materials
- Support different audience types (developers, users, administrators)

## Agent Configuration

```typescript
{
  id: 'instructions',
  name: 'Instructions',
  description: 'Generate and maintain project instructions and documentation',
  isActive: false,
  icon: '📚',
  tools: [
    {
      id: 'generate-instructions',
      name: 'Generate Instructions',
      command: '/instructions',
      description: 'Create a new instruction document for the project'
    }
  ]
}
```

## Tool: Generate Instructions (`/instructions`)

### Command Format

```bash
/instructions [topic] [audience:type]
```

### Parameters

- **topic** (required): The subject or area for which to create instructions
- **audience** (optional): Target audience - developers, users, administrators, or general

### Usage Examples

```bash
# Basic usage
/instructions component development

# With specific audience
/instructions database setup audience:developers

# Complex topics
/instructions state management best practices audience:developers

# User-focused documentation
/instructions dashboard navigation audience:users
```

## Generated Content Structure

Each instruction document includes:

1. **Header Section**
   - Document title
   - Creation date
   - Target audience
   - Project context

2. **Overview**
   - Purpose and scope
   - Prerequisites
   - Context explanation

3. **Implementation Guidelines**
   - Step-by-step instructions
   - Code examples (for developers)
   - Best practices
   - Common patterns

4. **Troubleshooting**
   - Common issues and solutions
   - Error handling
   - Debugging tips

5. **Resources**
   - Related documentation
   - External links
   - Project references

## Integration with EAC Project

### File Storage

- Instructions are stored in the **Instructions** folder (pinned)
- Files are created with semantic naming: `{topic}-instructions.md`
- Automatically added to the EAC Explorer sidebar

### Project Context Awareness

The agent understands the EAC project structure and includes relevant:

- Technology stack (Next.js, TypeScript, Convex, Tailwind)
- Project patterns and conventions
- File organization standards
- Component architecture
- State management patterns

### Audience-Specific Content

#### For Developers

- Technical implementation details
- Code examples and patterns
- TypeScript interfaces
- Component structure
- State management integration

#### For Users

- User interface guidance
- Feature explanations
- Navigation instructions
- Workflow examples

#### For Administrators

- System configuration
- Deployment procedures
- Maintenance tasks
- Security considerations

## Activation and Usage

### Step 1: Activate the Agent

1. Navigate to the **Agents** panel in the activity bar (🤖 icon)
2. Click on the **Instructions** agent to activate it
3. Verify the agent shows as active with a green indicator

### Step 2: Use the Agent Tool

1. Open the terminal chat
2. Type `/` to open the tools menu
3. Toggle to **Agent Tools** if not already selected
4. Select `/instructions` from the available tools
5. Provide your topic and optional audience specification

### Step 3: Review Generated Content

1. The instruction document will be created in the Instructions folder
2. Open the file from the EAC Explorer
3. Review and customize as needed
4. The agent provides a confirmation with file details

## Example Output

When you run `/instructions component development audience:developers`, the agent creates a comprehensive document covering:

- Component architecture in EAC
- TypeScript patterns and interfaces
- Styling with Tailwind CSS variables
- Integration with Zustand stores
- Testing and debugging approaches
- Performance considerations
- Accessibility guidelines

## Benefits

- **Consistency**: Standardized documentation format
- **Context-Aware**: Tailored to EAC project specifics
- **Comprehensive**: Covers all necessary aspects
- **Searchable**: Easy to find and reference
- **Maintainable**: Can be updated and refined over time

## Future Enhancements

Planned improvements include:

- Integration with existing documentation
- Template customization options
- Multi-format output (Markdown, PDF, HTML)
- Collaborative editing features
- Version tracking and history

---

This specification defines the Instructions Agent's capabilities and integration within the EAC Financial Dashboard project. The agent provides valuable documentation support while maintaining consistency with project standards and patterns.
