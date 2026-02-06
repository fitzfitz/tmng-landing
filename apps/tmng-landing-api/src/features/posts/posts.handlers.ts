import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { postsService } from './posts.service';
import { createPostSchema, updatePostSchema, listPostsQuerySchema } from './posts.schema';
import { z } from 'zod';
import type { Context } from 'hono';

type Variables = {
  user?: { id: string; email: string; role: string };
};

const factory = createFactory<{ Variables: Variables }>();


// List posts handler
export const listPostsHandler = factory.createHandlers(
  zValidator('query', listPostsQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const isAdmin = c.get('user') !== undefined; // Check if authenticated

      console.log('Listing posts with query:', query, 'isAdmin:', isAdmin);
      const result = await postsService.listPosts(query, isAdmin);

      return c.json({
        success: true,
        data: result.posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      console.error('Error listing posts:', {
        message: error.message,
        stack: error.stack,
        query: c.req.query(),
      });
      return c.json({
        success: false,
        message: `Failed to list posts: ${error.message || 'Unknown error'}`,
      }, 500);
    }
  }
);

// Get post by ID handler (admin only)
export const getPostByIdHandler = factory.createHandlers(
  async (c) => {
    const id = c.req.param('id')!;
    const post = await postsService.getPostById(id, true);

    if (!post) {
      return c.json({ success: false, message: 'Post not found' }, 404);
    }

    return c.json({ success: true, data: post });
  }
);

// Get post by slug handler (public)
export const getPostBySlugHandler = factory.createHandlers(
  async (c) => {
    const slug = c.req.param('slug')!;
    const post = await postsService.getPostBySlug(slug, false);

    if (!post) {
      return c.json({ success: false, message: 'Post not found' }, 404);
    }

    return c.json({ success: true, data: post });
  }
);

// Create post handler
export const createPostHandler = factory.createHandlers(
  zValidator('json', createPostSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    const post = await postsService.createPost(data, user.id);

    return c.json({ success: true, data: post, message: 'Post created successfully' }, 201);
  }
);

// Update post handler
export const updatePostHandler = factory.createHandlers(
  zValidator('json', updatePostSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.req.valid('json');

    const post = await postsService.updatePost(id, data);

    if (!post) {
      return c.json({ success: false, message: 'Post not found' }, 404);
    }

    return c.json({ success: true, data: post, message: 'Post updated successfully' });
  }
);

// Delete post handler
export const deletePostHandler = factory.createHandlers(
  async (c) => {
    const id = c.req.param('id')!;

    const post = await postsService.deletePost(id);

    if (!post) {
      return c.json({ success: false, message: 'Post not found' }, 404);
    }

    return c.json({ success: true, message: 'Post deleted successfully' });
  }
);

// Publish post handler
export const publishPostHandler = factory.createHandlers(
  async (c) => {
    const id = c.req.param('id')!;

    const post = await postsService.publishPost(id);

    if (!post) {
      return c.json({ success: false, message: 'Post not found' }, 404);
    }

    return c.json({ success: true, data: post, message: 'Post published successfully' });
  }
);

// Unpublish post handler
export const unpublishPostHandler = factory.createHandlers(
  async (c) => {
    const id = c.req.param('id')!;

    const post = await postsService.unpublishPost(id);

    if (!post) {
      return c.json({ success: false, message: 'Post not found' }, 404);
    }

    return c.json({ success: true, data: post, message: 'Post unpublished successfully' });
  }
);
