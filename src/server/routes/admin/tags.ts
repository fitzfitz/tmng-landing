import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDb, tags, postTags } from "../../db";
import { type Variables } from "../../index";

// Type for environment bindings
type Bindings = {
  DATABASE_URL: string;
};

// Create router with access to Variables (user session)
export const adminTagsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware to ensure admin/author access
adminTagsRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role === "pending") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// ============================================================================
// GET /admin/tags - List all tags
// ============================================================================
adminTagsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  // Get tags with post count
  const allTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      postCount: sql<number>`(SELECT COUNT(*) FROM ${postTags} WHERE ${postTags.tagId} = ${tags.id})`.mapWith(Number),
    })
    .from(tags)
    .orderBy(desc(tags.createdAt));

  return c.json({ data: allTags });
});

// ============================================================================
// POST /admin/tags - Create new tag
// ============================================================================
const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

adminTagsRouter.post("/", zValidator("json", createTagSchema), async (c) => {
  const data = c.req.valid("json");
  const db = getDb(c.env.DATABASE_URL);

  try {
    // Check for existing slug
    const existing = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, data.slug))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Slug already exists" }, 400);
    }

    const [newTag] = await db
      .insert(tags)
      .values({
        name: data.name,
        slug: data.slug,
      })
      .returning();

    return c.json({ data: newTag }, 201);
  } catch (error: any) {
    console.error("Create tag error:", error);
    return c.json({ error: "Failed to create tag" }, 500);
  }
});

// ============================================================================
// PUT /admin/tags/:id - Update tag
// ============================================================================
const updateTagSchema = createTagSchema;

adminTagsRouter.put("/:id", zValidator("json", updateTagSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const db = getDb(c.env.DATABASE_URL);

  // Check existence
  const existingTag = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (existingTag.length === 0) {
    return c.json({ error: "Tag not found" }, 404);
  }

  try {
    // Check slug uniqueness if changed
    const slugConflict = await db
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.slug, data.slug), sql`${tags.id} != ${id}`))
      .limit(1);

    if (slugConflict.length > 0) {
      return c.json({ error: "Slug already exists" }, 400);
    }

    const [updatedTag] = await db
      .update(tags)
      .set({
        name: data.name,
        slug: data.slug,
      })
      .where(eq(tags.id, id))
      .returning();

    return c.json({ data: updatedTag });
  } catch (error: any) {
    console.error("Update tag error:", error);
    return c.json({ error: "Failed to update tag" }, 500);
  }
});

// ============================================================================
// DELETE /admin/tags/:id - Delete tag
// ============================================================================
adminTagsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DATABASE_URL);

  const existingTag = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (existingTag.length === 0) {
    return c.json({ error: "Tag not found" }, 404);
  }

  try {
    await db.delete(tags).where(eq(tags.id, id));
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Delete tag error:", error);
    return c.json({ error: "Failed to delete tag" }, 500);
  }
});
