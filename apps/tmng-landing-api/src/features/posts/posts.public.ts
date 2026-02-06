import { Hono } from 'hono';
import {
  listPostsHandler,
  getPostBySlugHandler,
} from './posts.handlers';

// Public posts router - no authentication required
const publicPostsApp = new Hono()
  .get('/', ...listPostsHandler)                                  // GET /api/posts
  .get('/featured', ...listPostsHandler)                          // GET /api/posts/featured (with isFeatured query)
  .get('/:slug', ...getPostBySlugHandler);                        // GET /api/posts/:slug

export default publicPostsApp;
