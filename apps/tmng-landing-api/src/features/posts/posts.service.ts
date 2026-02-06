import { eq, desc, asc, and, or, sql, like, inArray, count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { db, users, categories, tags, postCategories, postsTags as postTags } from '../../lib/db';
import { posts, subscribers } from '../../lib/db';
import type { CreatePostInput, UpdatePostInput, ListPostsQuery } from './posts.schema';

export const postsService = {
  // List posts with pagination and filters
  async listPosts(query: ListPostsQuery, isAdmin = false) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const { page, limit, status, isFeatured, authorId, categoryId, tagId, search, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];
    
    // Public endpoints only see published posts
    if (!isAdmin) {
      conditions.push(eq(posts.status, 'published'));
    } else if (status) {
      conditions.push(eq(posts.status, status));
    }

    if (isFeatured !== undefined) {
      conditions.push(eq(posts.isFeatured, isFeatured));
    }

    if (authorId) {
      conditions.push(eq(posts.authorId, authorId));
    }

    if (search) {
      conditions.push(
        or(
          like(posts.title, `%${search}%`),
          like(posts.excerpt, `%${search}%`)
        )
      );
    }

    // Handle category filter
    let postIdsFromCategory: string[] | undefined;
    if (categoryId) {
      const postsInCategory = await db
        .select({ postId: postCategories.postId })
        .from(postCategories)
        .where(eq(postCategories.categoryId, categoryId));
      postIdsFromCategory = postsInCategory.map(p => p.postId);
      if (postIdsFromCategory.length > 0) {
        conditions.push(inArray(posts.id, postIdsFromCategory));
      } else {
        // If category has no posts, return empty result
        return { posts: [], total: 0, page, limit };
      }
    }

    // Handle tag filter
    let postIdsFromTag: string[] | undefined;
    if (tagId) {
      const postsWithTag = await db
        .select({ postId: postTags.postId })
        .from(postTags)
        .where(eq(postTags.tagId, tagId));
      postIdsFromTag = postsWithTag.map(p => p.postId);
      if (postIdsFromTag.length > 0) {
        conditions.push(inArray(posts.id, postIdsFromTag));
      } else {
        // If tag has no posts, return empty result
        return { posts: [], total: 0, page, limit };
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column
    const sortColumn = {
      createdAt: posts.createdAt,
      publishedAt: posts.publishedAt,
      title: posts.title,
      updatedAt: posts.updatedAt,
    }[sortBy];

    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Build the WHERE clause
    const finalWhereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count using Drizzle's count() helper
    try {
      const countQuery = db.select({ value: count() }).from(posts);
      const countResult = finalWhereClause 
        ? await countQuery.where(finalWhereClause)
        : await countQuery;
      
      const totalCount = Number(countResult[0]?.value ?? 0);

    
      const baseQuery = db
        .select({
          id: posts.id,
          authorId: posts.authorId,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          content: posts.content,
          coverImage: posts.coverImage,
          status: posts.status,
          isFeatured: posts.isFeatured,
          readTimeMinutes: posts.readTimeMinutes,
          seoTitle: posts.seoTitle,
          seoDescription: posts.seoDescription,
          seoImage: posts.seoImage,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          author: {
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id));
      
      const results = finalWhereClause
        ? await baseQuery.where(finalWhereClause).orderBy(orderFn(sortColumn)).limit(limit).offset(offset)
        : await baseQuery.orderBy(orderFn(sortColumn)).limit(limit).offset(offset);

      return {
        posts: results,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error('Error in listPosts service:', error);
      // Return empty result on error rather than crashing
      return {
        posts: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  // Get single post by ID
  async getPostById(id: string, isAdmin = false) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const conditions = [eq(posts.id, id)];
    
    if (!isAdmin) {
      conditions.push(eq(posts.status, 'published'));
    }

    const [post] = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        coverImage: posts.coverImage,
        status: posts.status,
        isFeatured: posts.isFeatured,
        readTimeMinutes: posts.readTimeMinutes,
        seoTitle: posts.seoTitle,
        seoDescription: posts.seoDescription,
        seoImage: posts.seoImage,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(and(...conditions));

    if (!post) return null;

    // Get categories
    const postCategoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
      })
      .from(categories)
      .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
      .where(eq(postCategories.postId, id));

    // Get tags
    const postTagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(tags)
      .innerJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(postTags.postId, id));

    return {
      ...post,
      categories: postCategoriesData,
      tags: postTagsData,
    };
  },

  // Get single post by slug
  async getPostBySlug(slug: string, isAdmin = false) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const conditions = [eq(posts.slug, slug)];
    
    if (!isAdmin) {
      conditions.push(eq(posts.status, 'published'));
    }

    const [post] = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        coverImage: posts.coverImage,
        status: posts.status,
        isFeatured: posts.isFeatured,
        readTimeMinutes: posts.readTimeMinutes,
        seoTitle: posts.seoTitle,
        seoDescription: posts.seoDescription,
        seoImage: posts.seoImage,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(and(...conditions));

    if (!post) return null;

    // Get categories
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
      })
      .from(categories)
      .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
      .where(eq(postCategories.postId, post.id));

    // Get tags
    const tagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(tags)
      .innerJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(postTags.postId, post.id));

    return {
      ...post,
      categories: categoriesData,
      tags: tagsData,
    };
  },

  // Create new post
  async createPost(data: CreatePostInput, authorId: string) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const { categoryIds, tagIds, ...postData } = data;

    // Insert post
    const [newPost] = await db
      .insert(posts)
      .values({
        ...postData,
        authorId,
        publishedAt: data.status === 'published' ? new Date().toISOString() : null,
      })
      .returning();

    // Insert categories
    if (categoryIds && categoryIds.length > 0) {
      await db.insert(postCategories).values(
        categoryIds.map(categoryId => ({
          postId: newPost.id,
          categoryId,
        }))
      );
    }

    // Insert tags
    if (tagIds && tagIds.length > 0) {
      await db.insert(postTags).values(
        tagIds.map(tagId => ({
          postId: newPost.id,
          tagId,
        }))
      );
    }

    return this.getPostById(newPost.id, true);
  },

  // Update post
  async updatePost(id: string, data: UpdatePostInput) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const { categoryIds, tagIds, ...postData } = data;

    // Update post
    const [updatedPost] = await db
      .update(posts)
      .set({
        ...postData,
        updatedAt: new Date().toISOString(),
        ...(data.status === 'published' && { publishedAt: new Date().toISOString() }),
      })
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) return null;

    // Update categories if provided
    if (categoryIds !== undefined) {
      await db.delete(postCategories).where(eq(postCategories.postId, id));
      if (categoryIds.length > 0) {
        await db.insert(postCategories).values(
          categoryIds.map(categoryId => ({
            postId: id,
            categoryId,
          }))
        );
      }
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id));
      if (tagIds.length > 0) {
        await db.insert(postTags).values(
          tagIds.map(tagId => ({
            postId: id,
            tagId,
          }))
        );
      }
    }

    return this.getPostById(id, true);
  },

  // Delete post
  async deletePost(id: string) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    return deletedPost;
  },

  // Publish post
  async publishPost(id: string) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const [publishedPost] = await db
      .update(posts)
      .set({
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, id))
      .returning();

    return publishedPost;
  },

  // Unpublish post
  async unpublishPost(id: string) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const db = drizzle(client);

    const [unpublishedPost] = await db
      .update(posts)
      .set({
        status: 'draft',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, id))
      .returning();

    return unpublishedPost;
  },
};
