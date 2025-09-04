// TEST PREVIEW AGENT - Simple test script for the preview agent functionality
// /Users/matthewsimon/Projects/AURA/AURA/scripts/test-preview-agent.js

const { PreviewAgent } = require('../lib/agents/previewAgent');

async function testPreviewAgent() {
  console.log('🧪 Testing Preview Agent...');
  
  const previewAgent = new PreviewAgent();
  
  console.log('📋 Agent Info:', {
    id: previewAgent.id,
    name: previewAgent.name,
    description: previewAgent.description,
    toolCount: previewAgent.tools.length
  });
  
  console.log('🔧 Available Tools:');
  previewAgent.tools.forEach(tool => {
    console.log(`  - ${tool.command}: ${tool.description}`);
  });
  
  // Test tool execution
  try {
    const tool = previewAgent.tools.find(t => t.command === 'generate-brand-preview');
    
    if (tool) {
      console.log('\n⚡ Testing preview generation...');
      const result = await previewAgent.execute(
        tool,
        '--guidelines-id test-123',
        {}, // mutations placeholder
        { userId: 'test-user' } // context
      );
      
      console.log('📊 Result:', {
        success: result.success,
        message: result.message,
        hasData: !!result.data
      });
      
      if (result.data) {
        console.log('📄 Generated Preview Data:');
        console.log('  - Guidelines ID:', result.data.guidelinesId);
        console.log('  - Generated At:', result.data.generatedAt);
        console.log('  - Content Length:', result.data.previewContent.length);
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPreviewAgent()
  .then(() => console.log('✅ Preview agent test completed'))
  .catch(error => console.error('💥 Test error:', error));
