/**
 * Create the tmng-blog database if it doesn't exist
 * Run with: npx tsx src/server/db/create-db.ts
 */

import postgres from "postgres";

const CONNECTION_STRING = process.env.DATABASE_URL || "postgresql://admin:themonograf2026@57.128.251.45:5432/postgres";

// Connect to the default postgres database to create our database
const baseUrl = CONNECTION_STRING.replace(/\/[^/]+$/, "/postgres");

async function createDatabase() {
  console.log("🔌 Connecting to PostgreSQL server...");
  const sql = postgres(baseUrl);

  try {
    // Check if database exists
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = 'tmng-blog'
    `;

    if (result.length === 0) {
      console.log("📦 Creating database 'tmng-blog'...");
      await sql.unsafe(`CREATE DATABASE "tmng-blog"`);
      console.log("✅ Database created successfully!");
    } else {
      console.log("ℹ️  Database 'tmng-blog' already exists.");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }

  process.exit(0);
}

createDatabase();
