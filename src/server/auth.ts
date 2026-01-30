/**
 * Better Auth configuration for TMNG
 * Uses Google OAuth with Drizzle adapter for PostgreSQL
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import * as schema from "./db/schema";

// Create auth instance factory for Cloudflare Workers/Pages
// (env variables are only available at runtime)
export function createAuth(env: {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}) {
  const db = getDb(env.DATABASE_URL);
  
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    
    // Allow localhost for development
    trustedOrigins: [
      "http://localhost:4321",
      "http://localhost:3000",
      "https://tmng.my.id",
    ],
    
    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    // Advanced cookie config
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production", // false on localhost
      defaultCookieAttributes: {
        path: "/", // CRITICAL: Ensure cookie is available on all routes, not just /api/auth
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      },
    },
    
    // Credential provider
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // For simplicity in this project
    },
    
    // User configuration
    user: {
      // Additional fields we want to store
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "pending",
        },
      },
    },
    
    // Account linking - same email = same account
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    
    // Callbacks
    callbacks: {
      // On new user creation, set role to pending
      onUserCreated: async (user: any) => {
        console.log(`New user created: ${user.email} with pending role`);
      },
    },
  });
}

// Type helper for auth instance
export type Auth = ReturnType<typeof createAuth>;
