import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, posts, contactSubmissions, subscribers } from '@tmng/shared/src/schema';
import { env } from '../utils/env';

// Connection client
const client = postgres(env.DATABASE_URL!, { 
  prepare: false,
  ssl: { rejectUnauthorized: false },
  max: 1, // Limit to 1 connection for serverless/worker environment to prevent hangs
  idle_timeout: 20, // Close idle connections quickly
  connect_timeout: 10, // Fail fast if connection hangs
});

// Create drizzle instance
export const db = drizzle(client);

// Export tables for use in queries (using alias contacts for contactSubmissions)
export { users, posts, subscribers };
export { contactSubmissions as contacts };
export { categories, tags, postCategories, postsTags } from '@tmng/shared/src/schema';
