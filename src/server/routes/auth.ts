/**
 * Auth routes for Better Auth
 * Handles /api/auth/* requests
 */

import { Hono } from "hono";
import { createAuth } from "../auth";

// Environment type for Cloudflare
type Env = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

const authRouter = new Hono<{ Bindings: Env }>();

// Mount Better Auth handler on all routes (Hono now handles /api/auth/* directly)
authRouter.on(["GET", "POST"], "/*", async (c) => {
  try {
    const auth = createAuth({
      DATABASE_URL: c.env.DATABASE_URL,
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
    });
    
    // We trust the request URL now because Astro's API handler preserves the /api/auth prefix
    console.log("[Auth] Handling request:", c.req.method, c.req.url);
    
    // Debug endpoint
    const url = new URL(c.req.url);
    if (url.searchParams.get("debug") === "true") {
      return c.json({
        url: c.req.url,
        path: url.pathname,
        headers: c.req.header(),
        env: {
          hasDbUrl: !!c.env.DATABASE_URL,
          hasBetterAuthSecret: !!c.env.BETTER_AUTH_SECRET,
          betterAuthUrl: c.env.BETTER_AUTH_URL,
        }
      });
    }

    const response = await auth.handler(c.req.raw);
    console.log("[Auth] Response status:", response.status);
    return response;
  } catch (error) {
    console.error("[Auth] Error in auth handler:", error);
    return c.json({ 
      error: "Authentication error", 
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

export { authRouter };
