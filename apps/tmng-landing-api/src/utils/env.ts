// Simple direct env access for Wrangler
// Wrangler loads dev.vars into the runtime environment

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "d565da37485c38dff303b6b30930998d",
  NODE_ENV: (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test",
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
};

export type Env = typeof env;
