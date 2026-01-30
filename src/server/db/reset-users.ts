
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function resetUsersTable() {
  console.log("Recreating users table...");
  try {
    // Drop existing tables
    await sql`DROP TABLE IF EXISTS accounts CASCADE`;
    await sql`DROP TABLE IF EXISTS sessions CASCADE`;
    await sql`DROP TABLE IF EXISTS verifications CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log("✅ Dropped existing auth tables");

    // Create new table with all required columns
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        email_verified boolean DEFAULT false NOT NULL,
        image text,
        role text DEFAULT 'pending' NOT NULL,
        bio text,
        password text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Users table created successfully");
    
    // Create sessions table if not exists (it depends on users)
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY,
        expires_at timestamp NOT NULL,
        token text NOT NULL UNIQUE,
        created_at timestamp NOT NULL,
        updated_at timestamp NOT NULL,
        ip_address text,
        user_agent text,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    console.log("✅ Sessions table verified");

    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id text PRIMARY KEY,
        account_id text NOT NULL,
        provider_id text NOT NULL,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_token text,
        refresh_token text,
        id_token text,
        access_token_expires_at timestamp,
        refresh_token_expires_at timestamp,
        scope text,
        password text,
        created_at timestamp NOT NULL,
        updated_at timestamp NOT NULL
      );
    `;
     console.log("✅ Accounts table verified");

     // Create verifications table
     await sql`
      CREATE TABLE IF NOT EXISTS verifications (
        id text PRIMARY KEY,
        identifier text NOT NULL,
        value text NOT NULL,
        expires_at timestamp NOT NULL,
        created_at timestamp,
        updated_at timestamp
      );
     `;
     console.log("✅ Verifications table verified");

  } catch (error) {
    console.error("❌ Failed to reset users table:", error);
  } finally {
    await sql.end();
  }
}

resetUsersTable();
