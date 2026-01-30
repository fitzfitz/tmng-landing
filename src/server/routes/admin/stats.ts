import { Hono } from "hono";
import { count, eq, sql } from "drizzle-orm";
import { getDb, posts, users, subscribers, contactSubmissions, postViews } from "../../db";
import { type Variables } from "../../index";

type Bindings = {
  DATABASE_URL: string;
};

export const adminStatsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Admin only
adminStatsRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// GET /api/admin/stats
adminStatsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    // 1. Post stats (parallel)
    const [totalPostsResult, publishedPostsResult, draftPostsResult] = await Promise.all([
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(posts).where(eq(posts.status, "published")),
      db.select({ count: count() }).from(posts).where(eq(posts.status, "draft")),
    ]);

    // 2. View stats
    const totalViewsResult = await db.select({ count: count() }).from(postViews);

    // 3. Subscriber stats
    const [totalSubscribersResult, activeSubscribersResult] = await Promise.all([
      db.select({ count: count() }).from(subscribers),
      db.select({ count: count() }).from(subscribers).where(eq(subscribers.status, "active")),
    ]);

    // 4. Contact stats
    const [totalContactsResult, newContactsResult] = await Promise.all([
      db.select({ count: count() }).from(contactSubmissions),
      db.select({ count: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, "new")),
    ]);

    // 5. User stats
    const totalUsersResult = await db.select({ count: count() }).from(users);

    return c.json({
        posts: {
            total: totalPostsResult[0]?.count ?? 0,
            published: publishedPostsResult[0]?.count ?? 0,
            draft: draftPostsResult[0]?.count ?? 0,
        },
        views: {
            total: totalViewsResult[0]?.count ?? 0,
        },
        subscribers: {
            total: totalSubscribersResult[0]?.count ?? 0,
            active: activeSubscribersResult[0]?.count ?? 0,
        },
        contacts: {
            total: totalContactsResult[0]?.count ?? 0,
            new: newContactsResult[0]?.count ?? 0
        },
        users: {
            total: totalUsersResult[0]?.count ?? 0
        }
    });

  } catch (error) {
    console.error("Stats fetch error:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});
