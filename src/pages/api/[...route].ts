import type { APIRoute } from "astro";
import app from "../../server";

// Handle all HTTP methods
export const ALL: APIRoute = async ({ request, locals }) => {
  // Pass environment variables to Hono
  // In Cloudflare, these come from the runtime
  type RuntimeEnv = {
    runtime?: {
      env?: {
        DATABASE_URL?: string;
        MAIL_FROM?: string;
        MAIL_TO?: string;
        SITE_URL?: string;
        BETTER_AUTH_SECRET?: string;
        BETTER_AUTH_URL?: string;
      };
    };
  };

  const runtimeEnv = (locals as RuntimeEnv).runtime?.env;

  // CRITICAL: Use runtimeEnv FIRST because import.meta.env is baked at build time!
  const env = {
    DATABASE_URL:
      runtimeEnv?.DATABASE_URL ?? import.meta.env.DATABASE_URL ?? "",
    MAIL_FROM:
      runtimeEnv?.MAIL_FROM ??
      import.meta.env.MAIL_FROM ??
      "noreply@tmng.my.id",
    MAIL_TO:
      runtimeEnv?.MAIL_TO ?? import.meta.env.MAIL_TO ?? "themonograf@gmail.com",
    SITE_URL:
      runtimeEnv?.SITE_URL ?? import.meta.env.SITE_URL ?? "https://tmng.my.id",
    BETTER_AUTH_SECRET:
      runtimeEnv?.BETTER_AUTH_SECRET ??
      import.meta.env.BETTER_AUTH_SECRET ??
      "",
    BETTER_AUTH_URL:
      runtimeEnv?.BETTER_AUTH_URL ??
      import.meta.env.BETTER_AUTH_URL ??
      "http://localhost:4321",
  };

  // Rewrite the URL to remove /api prefix since Hono routes don't have it
  // BUT keep it for auth routes because Better Auth needs the full path
  const url = new URL(request.url);
  let newPath = url.pathname;

  if (!url.pathname.startsWith("/api/auth")) {
    newPath = url.pathname.replace(/^\/api/, "");
  }

  const newUrl = new URL(newPath, url.origin);
  newUrl.search = url.search;

  const newRequest = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    // @ts-expect-error - duplex is needed for request body streaming
    duplex: "half",
  });

  return app.fetch(newRequest, env);
};;

// Also export specific methods for clarity
export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const DELETE = ALL;
