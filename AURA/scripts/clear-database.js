// DATABASE CLEANUP SCRIPT - Clears all data from Convex database
// /Users/matthewsimon/Projects/AURA/AURA/scripts/clear-database.js

const { ConvexHttpClient } = require("convex/browser");

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function clearDatabase() {
  console.log("🧹 Starting database cleanup...");
  
  try {
    // Define all table names in your schema
    const tables = [
      "messages",
      "chatMessages", 
      "users",
      "projects",
      "files",
      "socialConnections",
      "socialPosts",
      "terminalSessions",
      "identityGuidelines",
      "onboardingResponses",
      "trash"
    ];

    let totalDeleted = 0;

    for (const tableName of tables) {
      console.log(`\n📋 Clearing table: ${tableName}`);
      
      try {
        // Get all documents from the table
        const docs = await convex.query("schema:getAllDocuments", { tableName });
        
        console.log(`   Found ${docs.length} documents`);
        
        if (docs.length > 0) {
          // Delete each document
          for (const doc of docs) {
            await convex.mutation("schema:deleteDocument", { 
              tableName, 
              id: doc._id 
            });
          }
          
          console.log(`   ✅ Deleted ${docs.length} documents from ${tableName}`);
          totalDeleted += docs.length;
        } else {
          console.log(`   ℹ️  Table ${tableName} is already empty`);
        }
      } catch (error) {
        if (error.message?.includes("Table") && error.message?.includes("does not exist")) {
          console.log(`   ⚠️  Table ${tableName} doesn't exist - skipping`);
        } else {
          console.error(`   ❌ Error clearing ${tableName}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Database cleanup complete!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    
  } catch (error) {
    console.error("❌ Database cleanup failed:", error);
    process.exit(1);
  }
}

// Run the cleanup
if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log("✨ All done! Database is now clean.");
      process.exit(0);
    })
    .catch(error => {
      console.error("💥 Cleanup script failed:", error);
      process.exit(1);
    });
}

module.exports = { clearDatabase };
