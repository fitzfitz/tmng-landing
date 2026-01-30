import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { postsRouter } from "./routes/posts";
import { categoriesRouter } from "./routes/categories";
import { contactRouter } from "./routes/contact";
import { newsletterRouter } from "./routes/newsletter";
import { authRouter } from "./routes/auth";
import { adminPostsRouter } from "./routes/admin/posts";
import { adminCategoriesRouter } from "./routes/admin/categories";
import { adminTagsRouter } from "./routes/admin/tags";
import { adminUsersRouter } from "./routes/admin/users";
import { adminSubscribersRouter } from "./routes/admin/subscribers";
import { adminContactsRouter } from "./routes/admin/contacts";
import { adminStatsRouter } from "./routes/admin/stats";
import { uploadRouter } from "./routes/upload";
import { createAuth } from "./auth";

// Environment bindings type
export type Bindings = {
  DATABASE_URL: string;
  MAIL_FROM: string;
  MAIL_TO: string;
  SITE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

// Session user and session types
type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "pending" | "author" | "admin";
} | null;

type SessionData = {
  id: string;
  userId: string;
  expiresAt: Date;
} | null;

// Extended variables for context
export type Variables = {
  user: SessionUser;
  session: SessionData;
};

// Create the Hono app
export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["https://tmng.my.id", "http://localhost:4321", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Session middleware - extracts user from session for all routes
app.use("*", async (c, next) => {
  // Skip session check for auth routes (they handle their own session)
  if (c.req.path.startsWith("/auth")) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  try {
    const auth = createAuth({
      DATABASE_URL: c.env.DATABASE_URL,
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
    });

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    
    if (session) {
      c.set("user", session.user as SessionUser);
      c.set("session", session.session as SessionData);
    } else {
      c.set("user", null);
      c.set("session", null);
    }
  } catch {
    c.set("user", null);
    c.set("session", null);
  }

  return next();
});

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Session endpoint - get current user
app.get("/session", (c) => {
  const user = c.get("user");
  const session = c.get("session");
  
  if (!user) {
    return c.json({ user: null, session: null });
  }
  
  return c.json({ user, session });
});

// Mount auth router (handles /api/auth/*)
app.route("/api/auth", authRouter);

// Mount Admin API routers
app.route("/admin/posts", adminPostsRouter);
app.route("/admin/categories", adminCategoriesRouter);
app.route("/admin/tags", adminTagsRouter);
app.route("/admin/users", adminUsersRouter);
app.route("/admin/subscribers", adminSubscribersRouter);
app.route("/admin/contacts", adminContactsRouter);
app.route("/admin/stats", adminStatsRouter);

// Mount API routers
app.route("/posts", postsRouter);
app.route("/categories", categoriesRouter);
app.route("/contact", contactRouter);
app.route("/newsletter", newsletterRouter);
app.route("/upload", uploadRouter);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error("[API Error]", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    },
    500
  );
});

export default app;
