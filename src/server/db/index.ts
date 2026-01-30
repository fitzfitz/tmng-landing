import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create a singleton connection for the database
let connection: postgres.Sql | null = null;

export function getDb(databaseUrl: string) {
  if (!connection) {
    connection = postgres(databaseUrl, {
      max: 10, // Connection pool size
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return drizzle(connection, { schema });
}

export type Database = ReturnType<typeof getDb>;

// Re-export schema for convenience
export * from "./schema";
