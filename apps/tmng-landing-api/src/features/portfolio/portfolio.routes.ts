import { Hono } from "hono";
import { authMiddleware, adminCallback } from "../../middlewares/auth";
import * as handlers from "./portfolio.handlers";

const app = new Hono();

// Public Routes
app.get("/public", ...handlers.listPublicHandler);
app.get("/public/:slug", ...handlers.getPublicBySlugHandler);

// Admin Routes (Protected)
app.use("/*", authMiddleware, adminCallback);

app.get("/", ...handlers.listAllHandler);
app.post("/", ...handlers.createHandler);
app.put("/:id", ...handlers.updateHandler);
app.delete("/:id", ...handlers.deleteHandler);

export default app;
