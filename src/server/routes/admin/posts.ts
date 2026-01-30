import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, ilike, count, sql } from "drizzle-orm";
import { getDb, posts, users, postCategories, postViews } from "../../db";
import { type Variables } from "../../index";
import fs from "node:fs";
import path from "node:path";

// Type for environment bindings
type Bindings = {
  DATABASE_URL: string;
};

// Create router
export const adminPostsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware to ensure admin/author access
adminPostsRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role === "pending") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// Helper to handle file upload
async function processUpload(file: File | string): Promise<string | null> {
  if (!(file instanceof File)) return null;

  // Validate mime type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only images are allowed.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File too large. Max size is 5MB.");
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const uploadDir = path.join(process.cwd(), "public", "uploads", String(year), month);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const timestamp = Date.now();
  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
  const filename = `${timestamp}-${cleanName}`;
  const filePath = path.join(uploadDir, filename);

  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  return `/uploads/${year}/${month}/${filename}`;
}

// Zod schema (reused for manual validation)
const postSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  // Allow relative URLs or absolute URLs or null
  coverImage: z.string().nullable().optional().or(z.literal("")).refine(
    (val) => !val || val.startsWith("/") || val.startsWith("http"),
    { message: "Must be a valid URL or relative path" }
  ),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
  readTimeMinutes: z.coerce.number().min(1).default(5),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoImage: z.string().nullable().optional().or(z.literal("")).refine(
    (val) => !val || val.startsWith("/") || val.startsWith("http"),
    { message: "Must be a valid URL or relative path" }
  ),
  categories: z.array(z.string()).optional(),
});

// ============================================================================
// GET /api/admin/posts - List posts
// ============================================================================
const listPostsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sort: z.enum(["latest", "oldest", "views"]).default("latest"),
});

adminPostsRouter.get("/", zValidator("query", listPostsSchema), async (c) => {
  const { page, limit, search, status, sort } = c.req.valid("query");
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user");
  const offset = (page - 1) * limit;

  const conditions = [];
  if (user?.role === "author") conditions.push(eq(posts.authorId, user.id));
  if (status) conditions.push(eq(posts.status, status));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(sql`(${posts.title} ILIKE ${pattern} OR ${posts.slug} ILIKE ${pattern})`);
  }

  const query = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      isFeatured: posts.isFeatured,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      author: { id: users.id, name: users.name, image: users.image },
      views: sql<number>`(SELECT COUNT(*) FROM ${postViews} WHERE ${postViews.postId} = ${posts.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(...conditions));

  if (sort === "latest") query.orderBy(desc(posts.createdAt));
  else if (sort === "oldest") query.orderBy(posts.createdAt);
  else if (sort === "views") query.orderBy(desc(sql`(SELECT COUNT(*) FROM ${postViews} WHERE ${postViews.postId} = ${posts.id})`));

  const data = await query.limit(limit).offset(offset);
  const totalResult = await db.select({ count: count() }).from(posts).where(and(...conditions));
  
  return c.json({
    data,
    pagination: {
      page,
      limit,
      total: totalResult[0]?.count ?? 0,
      totalPages: Math.ceil((totalResult[0]?.count ?? 0) / limit),
    },
  });
});

// ============================================================================
// GET /api/admin/posts/:id - Get single post
// ============================================================================
adminPostsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user");

  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (result.length === 0) return c.json({ error: "Post not found" }, 404);
  if (user?.role === "author" && result[0].authorId !== user.id) return c.json({ error: "Unauthorized" }, 403);

  const postCats = await db.select({ categoryId: postCategories.categoryId }).from(postCategories).where(eq(postCategories.postId, id));

  return c.json({
    data: { ...result[0], categories: postCats.map(pc => pc.categoryId) },
  });
});

// ============================================================================
// POST /api/admin/posts - Create post (Multipart)
// ============================================================================
adminPostsRouter.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.parseBody({ all: true });
    
    // Normalize body to single values where expected, but keep arrays for categories
    // parseBody with all:true returns key: val | val[]
    
    const getVal = (key: string) => {
      const val = body[key];
      if (Array.isArray(val)) return val[0];
      return val;
    };
    
    // Handle File
    const coverFile = body['coverImageFile'];
    let coverImageUrl = getVal('coverImage'); // Existing URL or empty

    if (coverFile instanceof File) {
      const uploadedUrl = await processUpload(coverFile);
      if (uploadedUrl) coverImageUrl = uploadedUrl;
    }

    // Prepare Categories
    let categories: string[] = [];
    const rawCats = body['categories'];
    if (Array.isArray(rawCats)) {
      categories = rawCats.map(String);
    } else if (rawCats) {
      categories = [String(rawCats)];
    }

    // Construct Payload for Zod
    // Note: FormData values are strings (or Files). 
    // We need to ensure booleans/numbers are coerced correctly if strictly checked, 
    // but Zod coerce can handle it.
    
    // Manual refinement for boolean/nulls might be needed if they come as "true"/"false"/"null"
    const rawPayload = {
      title: getVal('title'),
      slug: getVal('slug'),
      excerpt: getVal('excerpt'),
      content: getVal('content'),
      coverImage: coverImageUrl || null,
      status: getVal('status'),
      isFeatured: getVal('isFeatured') === 'true', // Convert string "true" to boolean
      readTimeMinutes: getVal('readTimeMinutes'),
      seoTitle: getVal('seoTitle'),
      seoDescription: getVal('seoDescription'),
      seoImage: getVal('seoImage'),
      categories: categories,
    };

    // Parse with Zod
    // We modify schema slightly to coerce boolean/numbers if needed, but existing schema has coerce for numbers
    // isFeatured is boolean in schema. FormData sends "true".
    // Let's rely on our manual conversion above + validation.
    
    const data = postSchema.parse(rawPayload);
    const db = getDb(c.env.DATABASE_URL);

    // Check slug uniqueness
    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, data.slug)).limit(1);
    if (existing.length > 0) return c.json({ error: "Slug already exists" }, 400);

    const [newPost] = await db.insert(posts).values({
      ...data,
      authorId: user.id,
    }).returning();

    if (data.categories && data.categories.length > 0) {
      await db.insert(postCategories).values(data.categories.map(cid => ({ postId: newPost.id, categoryId: cid })));
    }

    return c.json({ data: newPost }, 201);
  } catch (error: any) {
    console.error("Create post error:", error);
    if (error instanceof z.ZodError) {
       return c.json({ error: "Validation failed", issues: error.errors }, 400);
    }
    return c.json({ error: error.message || "Failed to create post" }, 500);
  }
});

// ============================================================================
// PUT /api/admin/posts/:id - Update post (Multipart)
// ============================================================================
adminPostsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const db = getDb(c.env.DATABASE_URL);

  if (!user) return c.json({ error: "Unauthorized" }, 401);

  // Check auth
  const post = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, id)).limit(1);
  if (post.length === 0) return c.json({ error: "Post not found" }, 404);
  if (user.role === "author" && post[0].authorId !== user.id) return c.json({ error: "Unauthorized" }, 403);

  try {
    const body = await c.req.parseBody({ all: true });
    
    const getVal = (key: string) => {
      const val = body[key];
      if (Array.isArray(val)) return val[0];
      return val;
    };

    // Handle File
    const coverFile = body['coverImageFile'];
    let coverImageUrl = getVal('coverImage');
    
    if (coverFile instanceof File) {
      const uploadedUrl = await processUpload(coverFile);
      if (uploadedUrl) coverImageUrl = uploadedUrl;
    }

    let categories: string[] | undefined = undefined;
    if ('categories' in body) {
       const rawCats = body['categories'];
       if (Array.isArray(rawCats)) categories = rawCats.map(String);
       else if (rawCats) categories = [String(rawCats)];
       else categories = [];
    }

    // Construct Payload
    // For partial update, we only include what's present? 
    // Usually standard forms send everything. We'll assume full form submission.
    
    const rawPayload = {
      title: getVal('title'),
      slug: getVal('slug'),
      excerpt: getVal('excerpt'),
      content: getVal('content'),
      coverImage: coverImageUrl || null,
      status: getVal('status'),
      isFeatured: getVal('isFeatured') === 'true',
      readTimeMinutes: getVal('readTimeMinutes'),
      seoTitle: getVal('seoTitle'),
      seoDescription: getVal('seoDescription'),
      seoImage: getVal('seoImage'),
      categories: categories,
    };

    // Validate using partial schema for updates? Or just standard schema since form sends all?
    // Let's use partial but ensuring types match.
    // NOTE: Zod coerce is great but manual boolean conversion for FormData is safest.
    
    const updateSchema = postSchema.partial();
    const data = updateSchema.parse(rawPayload);

    if (data.slug) {
       const existing = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.slug, data.slug), sql`${posts.id} != ${id}`)).limit(1);
       if (existing.length > 0) return c.json({ error: "Slug already exists" }, 400);
    }

    const [updatedPost] = await db.update(posts).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(posts.id, id)).returning();

    if (categories !== undefined) {
      await db.delete(postCategories).where(eq(postCategories.postId, id));
      if (categories.length > 0) {
        await db.insert(postCategories).values(categories.map(cid => ({ postId: id, categoryId: cid })));
      }
    }

    return c.json({ data: updatedPost });

  } catch (error: any) {
    console.error("Update post error:", error);
    if (error instanceof z.ZodError) {
       return c.json({ error: "Validation failed", issues: error.errors }, 400);
    }
    return c.json({ error: error.message || "Failed to update post" }, 500);
  }
});

// DEL /api/admin/posts/:id
adminPostsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user");
  const post = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, id)).limit(1);
  if (post.length === 0) return c.json({ error: "Post not found" }, 404);
  if (user?.role === "author" && post[0].authorId !== user.id) return c.json({ error: "Unauthorized" }, 403);
  await db.delete(posts).where(eq(posts.id, id));
  return c.json({ success: true });
});
