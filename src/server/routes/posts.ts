import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, or, ilike, count } from "drizzle-orm";
import { getDb, posts, users, categories, postCategories, postViews } from "../db";

// Type for environment bindings
type Bindings = {
  DATABASE_URL: string;
};

export const postsRouter = new Hono<{ Bindings: Bindings }>();

// ============================================================================
// GET /api/posts - List posts with pagination and filtering
// ============================================================================
const listPostsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  category: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional().default("published"),
  featured: z.coerce.boolean().optional(),
});

postsRouter.get("/", zValidator("query", listPostsSchema), async (c) => {
  const { page, limit, category, status, featured } = c.req.valid("query");
  const db = getDb(c.env.DATABASE_URL);

  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [eq(posts.status, status)];

  if (featured !== undefined) {
    conditions.push(eq(posts.isFeatured, featured));
  }

  // Query posts with author (now using users table)
  let query = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      isFeatured: posts.isFeatured,
      readTimeMinutes: posts.readTimeMinutes,
      publishedAt: posts.publishedAt,
      author: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);

  // If category filter, join with post_categories
  if (category) {
    const categoryData = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, category))
      .limit(1);

    if (categoryData.length > 0) {
      query = db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          coverImage: posts.coverImage,
          isFeatured: posts.isFeatured,
          readTimeMinutes: posts.readTimeMinutes,
          publishedAt: posts.publishedAt,
          author: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .innerJoin(postCategories, eq(posts.id, postCategories.postId))
        .where(
          and(
            ...conditions,
            eq(postCategories.categoryId, categoryData[0].id)
          )
        )
        .orderBy(desc(posts.publishedAt))
        .limit(limit)
        .offset(offset);
    }
  }

  const results = await query;

  // Get total count for pagination
  const totalResult = await db
    .select({ count: count() })
    .from(posts)
    .where(and(...conditions));

  const total = totalResult[0]?.count ?? 0;

  // Fetch categories for each post
  const postsWithCategories = await Promise.all(
    results.map(async (post) => {
      const postCats = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        })
        .from(categories)
        .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .where(eq(postCategories.postId, post.id));

      return {
        ...post,
        categories: postCats,
      };
    })
  );

  return c.json({
    data: postsWithCategories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
});

// ============================================================================
// GET /api/posts/featured - Get featured post
// ============================================================================
postsRouter.get("/featured", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      readTimeMinutes: posts.readTimeMinutes,
      publishedAt: posts.publishedAt,
      author: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.status, "published"), eq(posts.isFeatured, true)))
    .orderBy(desc(posts.publishedAt))
    .limit(1);

  if (result.length === 0) {
    return c.json({ data: null });
  }

  // Get categories for the featured post
  const postCats = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      color: categories.color,
    })
    .from(categories)
    .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
    .where(eq(postCategories.postId, result[0].id));

  return c.json({
    data: {
      ...result[0],
      categories: postCats,
    },
  });
});

// ============================================================================
// GET /api/posts/search - Search posts
// ============================================================================
const searchSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().min(1).max(20).default(10),
});

postsRouter.get("/search", zValidator("query", searchSchema), async (c) => {
  const { q, limit } = c.req.valid("query");
  const db = getDb(c.env.DATABASE_URL);

  const searchPattern = `%${q}%`;

  const results = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        or(
          ilike(posts.title, searchPattern),
          ilike(posts.excerpt, searchPattern),
          ilike(posts.content, searchPattern)
        )
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return c.json({ data: results });
});

// ============================================================================
// GET /api/posts/:slug - Get single post by slug
// ============================================================================
postsRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = getDb(c.env.DATABASE_URL);

  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      coverImage: posts.coverImage,
      readTimeMinutes: posts.readTimeMinutes,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      seoImage: posts.seoImage,
      publishedAt: posts.publishedAt,
      author: {
        id: users.id,
        name: users.name,
        image: users.image,
        bio: users.bio,
        role: users.role,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: "Post not found" }, 404);
  }

  // Get categories
  const postCats = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      color: categories.color,
    })
    .from(categories)
    .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
    .where(eq(postCategories.postId, result[0].id));

  // Get view count
  const viewCount = await db
    .select({ count: count() })
    .from(postViews)
    .where(eq(postViews.postId, result[0].id));

  return c.json({
    data: {
      ...result[0],
      categories: postCats,
      viewCount: viewCount[0]?.count ?? 0,
    },
  });
});

// ============================================================================
// POST /api/posts/:slug/views - Track page view
// ============================================================================
postsRouter.post("/:slug/views", async (c) => {
  const slug = c.req.param("slug");
  const db = getDb(c.env.DATABASE_URL);

  // Get post ID
  const post = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (post.length === 0) {
    return c.json({ error: "Post not found" }, 404);
  }

  // Get client info (privacy-friendly)
  const userAgent = c.req.header("user-agent") ?? null;
  const referrer = c.req.header("referer") ?? null;
  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown";

  // Hash IP for privacy
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + new Date().toDateString()); // Reset daily
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const ipHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Insert view
  await db.insert(postViews).values({
    postId: post[0].id,
    ipHash,
    userAgent,
    referrer,
  });

  return c.json({ success: true });
});
