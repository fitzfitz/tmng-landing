import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, asc, count, sql, and } from "drizzle-orm";
import { getDb, categories, posts, postCategories } from "../../db";
import { type Variables } from "../../index";

// Type for environment bindings
type Bindings = {
  DATABASE_URL: string;
};

// Create router with access to Variables
export const adminCategoriesRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware to ensure admin/author access
adminCategoriesRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role === "pending") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// ============================================================================
// GET /api/admin/categories - List all categories
// ============================================================================
adminCategoriesRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      color: categories.color,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(categories.sortOrder, asc(categories.name));

  // Get post counts
  const categoriesWithCounts = await Promise.all(
    allCategories.map(async (category) => {
      const result = await db
        .select({ count: count() })
        .from(postCategories)
        .where(eq(postCategories.categoryId, category.id));

      return {
        ...category,
        postCount: result[0]?.count ?? 0,
      };
    })
  );

  return c.json({ data: categoriesWithCounts });
});

// ============================================================================
// POST /api/admin/categories - Create category
// ============================================================================
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8B5CF6"),
  sortOrder: z.coerce.number().default(0),
});

adminCategoriesRouter.post("/", zValidator("json", createCategorySchema), async (c) => {
  const data = c.req.valid("json");
  const db = getDb(c.env.DATABASE_URL);

  try {
    // Check if slug exists
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, data.slug))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Slug already exists" }, 400);
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        sortOrder: data.sortOrder,
      })
      .returning();

    return c.json({ data: newCategory }, 201);
  } catch (error: any) {
    console.error("Create category error:", error);
    return c.json({ error: error.message || "Failed to create category" }, 500);
  }
});

// ============================================================================
// PUT /api/admin/categories/:id - Update category
// ============================================================================
const updateCategorySchema = createCategorySchema.partial();

adminCategoriesRouter.put("/:id", zValidator("json", updateCategorySchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const db = getDb(c.env.DATABASE_URL);

  try {
    // Check uniqueness if slug changed
    if (data.slug) {
      const existing = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.slug, data.slug), sql`${categories.id} != ${id}`))
        .limit(1);

      if (existing.length > 0) {
        return c.json({ error: "Slug already exists" }, 400);
      }
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...data,
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json({ data: updatedCategory });
  } catch (error: any) {
    console.error("Update category error:", error);
    return c.json({ error: error.message || "Failed to update category" }, 500);
  }
});

// ============================================================================
// DELETE /api/admin/categories/:id - Delete category
// ============================================================================
adminCategoriesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DATABASE_URL);

  await db.delete(categories).where(eq(categories.id, id));

  return c.json({ success: true });
});
