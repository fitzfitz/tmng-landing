import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  posts,
  contactSubmissions,
  subscribers,
  categories,
  tags,
  postCategories,
  postsTags,
} from "@tmng/shared/src/schema";
import type { Bindings } from "../types";
import { env } from "../utils/env";

// Factory function to create DB with runtime environment
export function createDb(env: Bindings) {
  const client = postgres(env.DATABASE_URL, {
    prepare: false,
    // Removed SSL and timeout configs that were causing hangs
  });

  return drizzle(client, {
    schema: {
      users,
      posts,
      contactSubmissions,
      subscribers,
      categories,
      tags,
      postCategories,
      postsTags,
    },
  });
}

// Export tables for use in queries
export {
  users,
  posts,
  contactSubmissions,
  subscribers,
  categories,
  tags,
  postCategories,
  postsTags,
};
// Singleton DB instance
export const db = createDb({ ...env, DATABASE_URL: env.DATABASE_URL });

// Alias for backward compatibility
export { contactSubmissions as contacts };
