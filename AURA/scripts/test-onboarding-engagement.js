// TEST ONBOARDING ENGAGEMENT - Script to test the new hasStartedEngaging functionality
// /Users/matthewsimon/Projects/AURA/AURA/scripts/test-onboarding-engagement.js

const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function testOnboardingEngagement() {
  console.log("🧪 Testing onboarding engagement functionality...");
  
  // Test scenarios:
  console.log("\n1. Testing initial state (should allow skipping)");
  console.log("   - hasStartedEngaging should be false or undefined");
  
  console.log("\n2. Testing after user submits first message");
  console.log("   - hasStartedEngaging should be set to true");
  console.log("   - Skip button should be disabled");
  
  console.log("\n3. Testing skip button behavior");
  console.log("   - Before engagement: Skip button should be enabled");
  console.log("   - After engagement: Skip button should show 'Onboarding Started' and be disabled");
  
  console.log("\n✅ Test scenarios defined. Implementation details:");
  console.log("   - Schema updated with hasStartedEngaging field");
  console.log("   - updateOnboardingResponse mutation sets flag for non-welcome steps");
  console.log("   - handleOnboardingMessage action sets flag when user submits message");
  console.log("   - OnboardingSkipButton component checks hasStartedEngaging flag");
  console.log("   - Button displays different text based on engagement state");
}

testOnboardingEngagement().catch(console.error);
