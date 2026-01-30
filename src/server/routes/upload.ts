import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { type Variables } from "../index";

// Type for environment bindings
type Bindings = {
  SITE_URL: string;
};

// Create router
export const uploadRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware to ensure authentication (any role except 'pending' effectively)
uploadRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role === "pending") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// ============================================================================
// POST / - Upload a file
// ============================================================================
uploadRouter.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type. Only images are allowed." }, 400);
    }

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: "File too large. Max size is 5MB." }, 400);
    }

    // Create directory structure: public/uploads/YYYY/MM
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const uploadDir = path.join(process.cwd(), "public", "uploads", String(year), month);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate safe filename
    // Use timestamp + clean filename
    const timestamp = Date.now();
    const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-");
    const filename = `${timestamp}-${cleanName}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    // Note: In Cloudflare env, this won't work persistently. This is for local dev or VPS.
    // For Cloudflare, you'd upload to R2 here.
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Return public URL
    const publicUrl = `/uploads/${year}/${month}/${filename}`;

    return c.json({
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json({ error: error.message || "Failed to upload file" }, 500);
  }
});
