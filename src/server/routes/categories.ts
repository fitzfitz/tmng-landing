import { Hono } from "hono";
import { eq, count, desc } from "drizzle-orm";
import { getDb, categories, postCategories, posts } from "../db";

type Bindings = {
  DATABASE_URL: string;
};

export const categoriesRouter = new Hono<{ Bindings: Bindings }>();

// ============================================================================
// GET /api/categories - List all categories with post counts
// ============================================================================
categoriesRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  // Get all categories
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
    .orderBy(categories.sortOrder);

  // Get post counts for each category (only published posts)
  const categoriesWithCounts = await Promise.all(
    allCategories.map(async (category) => {
      const result = await db
        .select({ count: count() })
        .from(postCategories)
        .innerJoin(posts, eq(postCategories.postId, posts.id))
        .where(eq(postCategories.categoryId, category.id));

      return {
        ...category,
        postCount: result[0]?.count ?? 0,
      };
    })
  );

  // Calculate total posts
  const totalPosts = categoriesWithCounts.reduce(
    (sum, cat) => sum + cat.postCount,
    0
  );

  return c.json({
    data: categoriesWithCounts,
    total: totalPosts,
  });
});

// ============================================================================
// GET /api/categories/:slug - Get single category with recent posts
// ============================================================================
categoriesRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = getDb(c.env.DATABASE_URL);

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: "Category not found" }, 404);
  }

  const category = result[0];

  // Get post count
  const countResult = await db
    .select({ count: count() })
    .from(postCategories)
    .innerJoin(posts, eq(postCategories.postId, posts.id))
    .where(eq(postCategories.categoryId, category.id));

  return c.json({
    data: {
      ...category,
      postCount: countResult[0]?.count ?? 0,
    },
  });
});
