import { defineMiddleware } from "astro:middleware";
import { createAuth } from "./server/auth";
import type { User, Session } from "./server/db/schema";

console.log("--> middleware.ts module loaded <--");

export const onRequest = defineMiddleware(async (context, next) => {
  console.log("--> Middleware request start: " + context.request.url);

  // FAILSAFE: Initialize locals to null so they are never undefined
  context.locals.user = null;
  context.locals.session = null;

  // Get environment variables
  // In Cloudflare Pages/Workers, these are available in locals.runtime.env
  const runtimeEnv = (context.locals as any).runtime?.env;

  const env = {
    DATABASE_URL:
      import.meta.env.DATABASE_URL ??
      runtimeEnv?.DATABASE_URL ??
      process.env.DATABASE_URL ??
      "",
    BETTER_AUTH_SECRET:
      import.meta.env.BETTER_AUTH_SECRET ??
      runtimeEnv?.BETTER_AUTH_SECRET ??
      process.env.BETTER_AUTH_SECRET ??
      "",
    BETTER_AUTH_URL:
      import.meta.env.BETTER_AUTH_URL ??
      runtimeEnv?.BETTER_AUTH_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:4321",
  };

  // Debug logging
  console.log("Middleware Env Check:", {
    url: context.request.url,
    betterAuthUrl: env.BETTER_AUTH_URL,
    hasDb: !!env.DATABASE_URL,
    hasSecret: !!env.BETTER_AUTH_SECRET,
  });

  // Only run auth check if we have the necessary env vars
  if (env.DATABASE_URL && env.BETTER_AUTH_SECRET) {
    try {
      // Convert Headers to plain object to ensure compatibility
      const headers = new Headers(context.request.headers);

      const auth = createAuth(env);
      const session = await auth.api.getSession({
        headers: headers,
      });

      if (session) {
        context.locals.user = {
          ...session.user,
          image: session.user.image || null,
          role: (session.user.role as User["role"]) || "pending",
        } as User;
        context.locals.session = session.session as Session;
      } else {
        context.locals.user = null;
        context.locals.session = null;
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
      context.locals.user = null;
      context.locals.session = null;
    }
  } else {
    // If env vars are missing (e.g. during build), set null
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
};);
