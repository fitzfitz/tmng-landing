import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, ilike, count, sql } from "drizzle-orm";
import { getDb, subscribers } from "../../db";
import { type Variables } from "../../index";

// Type for environment bindings
type Bindings = {
  DATABASE_URL: string;
};

// Create router
export const adminSubscribersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware to ensure admin/author access (Authors might want to see subs too, but usually strict admin)
// Let's restrict to admin only for now as per plan
adminSubscribersRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// ============================================================================
// GET /api/admin/subscribers - List subscribers
// ============================================================================
const listSubscribersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  status: z.enum(["pending", "active", "unsubscribed"]).optional(),
});

adminSubscribersRouter.get("/", zValidator("query", listSubscribersSchema), async (c) => {
  const { page, limit, search, status } = c.req.valid("query");
  const db = getDb(c.env.DATABASE_URL);
  const offset = (page - 1) * limit;

  const conditions = [];

  if (status) {
    conditions.push(eq(subscribers.status, status));
  }

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(ilike(subscribers.email, pattern));
  }

  const query = db
    .select()
    .from(subscribers)
    .where(and(...conditions))
    .orderBy(desc(subscribers.createdAt))
    .limit(limit)
    .offset(offset);

  const data = await query;

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(subscribers)
    .where(and(...conditions));

  const total = totalResult[0]?.count ?? 0;

  return c.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ============================================================================
// DELETE /api/admin/subscribers/:id - Delete subscriber
// ============================================================================
adminSubscribersRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DATABASE_URL);

  const result = await db.delete(subscribers).where(eq(subscribers.id, id)).returning();

  if (result.length === 0) {
    return c.json({ error: "Subscriber not found" }, 404);
  }

  return c.json({ success: true });
});
