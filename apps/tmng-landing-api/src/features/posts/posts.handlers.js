import { createFactory } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { postsService } from "./posts.service";
import { createPostSchema, updatePostSchema, listPostsQuerySchema, } from "./posts.schema";
const factory = createFactory();
// List posts handler
export const listPostsHandler = factory.createHandlers(zValidator("query", listPostsQuerySchema), async (c) => {
    try {
        const query = c.req.valid("query");
        const isAdmin = c.get("user") !== undefined; // Check if authenticated
        console.log("Listing posts with query:", query, "isAdmin:", isAdmin);
        const result = await postsService.listPosts(c.env, query, isAdmin);
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
    }
    catch (error) {
        console.error("Error listing posts:", {
            message: error.message,
            stack: error.stack,
            query: c.req.query(),
        });
        return c.json({
            success: false,
            message: `Failed to list posts: ${error.message || "Unknown error"}`,
        }, 500);
    }
});
// Get post by ID handler (admin only)
export const getPostByIdHandler = factory.createHandlers(async (c) => {
    const id = c.req.param("id");
    const post = await postsService.getPostById(id, true);
    if (!post) {
        return c.json({ success: false, message: "Post not found" }, 404);
    }
    return c.json({ success: true, data: post });
});
// Get post by slug handler (public)
export const getPostBySlugHandler = factory.createHandlers(async (c) => {
    try {
        const slug = c.req.param("slug");
        const post = await postsService.getPostBySlug(c.env, slug, false);
        if (!post) {
            return c.json({ success: false, message: "Post not found" }, 404);
        }
        return c.json({ success: true, data: post });
    }
    catch (error) {
        console.error("Error getting post by slug:", error);
        return c.json({
            success: false,
            message: `Failed to get post: ${error.message || "Unknown error"}`,
        }, 500);
    }
});
// Create post handler
export const createPostHandler = factory.createHandlers(zValidator("json", createPostSchema), async (c) => {
    const data = c.req.valid("json");
    const user = c.get("user");
    if (!user) {
        return c.json({ success: false, message: "Unauthorized" }, 401);
    }
    const post = await postsService.createPost(data, user.id);
    return c.json({ success: true, data: post, message: "Post created successfully" }, 201);
});
// Update post handler
export const updatePostHandler = factory.createHandlers(zValidator("json", updatePostSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const post = await postsService.updatePost(id, data);
    if (!post) {
        return c.json({ success: false, message: "Post not found" }, 404);
    }
    return c.json({
        success: true,
        data: post,
        message: "Post updated successfully",
    });
});
// Delete post handler
export const deletePostHandler = factory.createHandlers(async (c) => {
    const id = c.req.param("id");
    const post = await postsService.deletePost(id);
    if (!post) {
        return c.json({ success: false, message: "Post not found" }, 404);
    }
    return c.json({ success: true, message: "Post deleted successfully" });
});
// Publish post handler
export const publishPostHandler = factory.createHandlers(async (c) => {
    const id = c.req.param("id");
    const post = await postsService.publishPost(id);
    if (!post) {
        return c.json({ success: false, message: "Post not found" }, 404);
    }
    return c.json({
        success: true,
        data: post,
        message: "Post published successfully",
    });
});
// Unpublish post handler
export const unpublishPostHandler = factory.createHandlers(async (c) => {
    const id = c.req.param("id");
    const post = await postsService.unpublishPost(id);
    if (!post) {
        return c.json({ success: false, message: "Post not found" }, 404);
    }
    return c.json({
        success: true,
        data: post,
        message: "Post unpublished successfully",
    });
});
// Increment post views handler (public)
export const incrementPostViewsHandler = factory.createHandlers(async (c) => {
    try {
        const slug = c.req.param("slug");
        // Capture geolocation data from Cloudflare headers
        const country = c.req.header("CF-IPCountry") || null;
        const city = c.req.header("CF-IPCity") || null;
        const timezone = c.req.header("CF-Timezone") || null;
        const region = c.req.header("CF-Region") || null;
        const latitude = c.req.header("CF-Latitude") || null;
        const longitude = c.req.header("CF-Longitude") || null;
        const location = {
            country,
            city,
            timezone,
            region,
            latitude,
            longitude,
        };
        const result = await postsService.incrementPostViews(c.env, slug, location);
        if (!result) {
            return c.json({ success: false, message: "Post not found" }, 404);
        }
        return c.json({ success: true, data: result });
    }
    catch (error) {
        console.error("Error incrementing post views:", error);
        console.error("Stack:", error.stack);
        return c.json({
            success: false,
            message: `Failed to increment views: ${error.message || "Unknown error"}`,
        }, 500);
    }
});
