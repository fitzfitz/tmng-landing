import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, count } from "drizzle-orm";
import { getDb, contactSubmissions } from "../../db";
import { type Variables } from "../../index";

// Type for environment bindings
type Bindings = {
  DATABASE_URL: string;
};

// Create router
export const adminContactsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware to ensure admin/author access (Strict Admin)
adminContactsRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// ============================================================================
// GET /api/admin/contacts - List submissions
// ============================================================================
const listContactsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(["new", "read", "replied", "archived"]).optional(),
});

adminContactsRouter.get("/", zValidator("query", listContactsSchema), async (c) => {
  const { page, limit, status } = c.req.valid("query");
  const db = getDb(c.env.DATABASE_URL);
  const offset = (page - 1) * limit;

  const conditions = [];

  if (status) {
    conditions.push(eq(contactSubmissions.status, status));
  }

  const query = db
    .select()
    .from(contactSubmissions)
    .where(and(...conditions))
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit)
    .offset(offset);

  const data = await query;

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(contactSubmissions)
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
// PUT /api/admin/contacts/:id - Update status
// ============================================================================
const updateContactSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
});

adminContactsRouter.put("/:id", zValidator("json", updateContactSchema), async (c) => {
  const id = c.req.param("id");
  const { status } = c.req.valid("json");
  const db = getDb(c.env.DATABASE_URL);

  const result = await db
    .update(contactSubmissions)
    .set({ status })
    .where(eq(contactSubmissions.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: "Submission not found" }, 404);
  }

  return c.json({ data: result[0] });
});

// ============================================================================
// DELETE /api/admin/contacts/:id - Delete submission
// ============================================================================
adminContactsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DATABASE_URL);

  const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id)).returning();

  if (result.length === 0) {
    return c.json({ error: "Submission not found" }, 404);
  }

  return c.json({ success: true });
});
