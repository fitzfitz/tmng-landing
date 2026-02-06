import { Hono } from 'hono';
import { authMiddleware } from '../../middlewares/auth';
import {
  listPostsHandler,
  getPostByIdHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  publishPostHandler,
  unpublishPostHandler,
} from './posts.handlers';

type Variables = {
  user: { id: string; email: string; role: string };
};

// Admin posts router - authentication required
const adminPostsApp = new Hono<{ Variables: Variables }>()
  .get('/', authMiddleware, ...listPostsHandler)                    // GET /api/admin/posts
  .get('/:id', authMiddleware, ...getPostByIdHandler)               // GET /api/admin/posts/:id
  .post('/', authMiddleware, ...createPostHandler)                  // POST /api/admin/posts
  .patch('/:id', authMiddleware, ...updatePostHandler)              // PATCH /api/admin/posts/:id
  .delete('/:id', authMiddleware, ...deletePostHandler)             // DELETE /api/admin/posts/:id
  .post('/:id/publish', authMiddleware, ...publishPostHandler)      // POST /api/admin/posts/:id/publish
  .post('/:id/unpublish', authMiddleware, ...unpublishPostHandler); // POST /api/admin/posts/:id/unpublish

export default adminPostsApp;
