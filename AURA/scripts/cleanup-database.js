// DATABASE CLEANUP SCRIPT - Command line interface for clearing the database
// /Users/matthewsimon/Projects/AURA/scripts/cleanup-database.js

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n🧹 AURA Database Cleanup Tool\n');
  
  try {
    // Check if Convex is running
    console.log('📊 Checking current database status...');
    const statusResult = execSync('npx convex run cleanup:getDatabaseStatus', { encoding: 'utf8' });
    console.log('Current database status:', statusResult);
    
    console.log('\nCleanup Options:');
    console.log('1. Clear onboarding data only (recommended for testing)');
    console.log('2. Clear everything (NUCLEAR OPTION - deletes all data)');
    console.log('3. Cancel');
    
    const choice = await askQuestion('\nEnter your choice (1, 2, or 3): ');
    
    switch (choice) {
      case '1':
        console.log('\n🗑️  Clearing onboarding data...');
        const onboardingResult = execSync('npx convex run cleanup:clearOnboardingData', { encoding: 'utf8' });
        console.log('✅ Onboarding data cleared:', onboardingResult);
        break;
        
      case '2':
        const confirm = await askQuestion('\n⚠️  Are you ABSOLUTELY SURE you want to delete ALL data? Type "DELETE_EVERYTHING" to confirm: ');
        
        if (confirm === 'DELETE_EVERYTHING') {
          console.log('\n💥 Clearing entire database...');
          const everythingResult = execSync('npx convex run cleanup:clearEverything \'{"confirmation": "DELETE_EVERYTHING"}\'', { encoding: 'utf8' });
          console.log('✅ Database cleared:', everythingResult);
        } else {
          console.log('❌ Confirmation failed. Database not cleared.');
        }
        break;
        
      case '3':
        console.log('👋 Cleanup cancelled.');
        break;
        
      default:
        console.log('❌ Invalid choice. Cleanup cancelled.');
    }
  } catch (error) {
    console.error('❌ Error running cleanup:', error.message);
    console.log('\n💡 Make sure Convex is running with: pnpm convex dev');
  }
  
  rl.close();
}

main();
