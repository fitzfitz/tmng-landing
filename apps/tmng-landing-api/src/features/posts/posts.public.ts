import { Hono } from "hono";
import type { Bindings } from "../../types";
import {
  listPostsHandler,
  getPostBySlugHandler,
  incrementPostViewsHandler,
} from "./posts.handlers";

// Public posts router - no authentication required
const publicPostsApp = new Hono<{ Bindings: Bindings }>()
  .get("/", ...listPostsHandler) // GET /api/posts
  .get("/featured", ...listPostsHandler) // GET /api/posts/featured (with isFeatured query)
  .get("/:slug", ...getPostBySlugHandler) // GET /api/posts/:slug
  .post("/:slug/view", ...incrementPostViewsHandler); // POST /api/posts/:slug/view

export default publicPostsApp;
