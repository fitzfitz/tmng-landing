import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, asc } from "drizzle-orm";
import { getDb, users } from "../../db";
import { type Variables } from "../../index";

// Type for environment bindings
type Bindings = {
  DATABASE_URL: string;
};

// Create router
export const adminUsersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware to ensure ADMIN access (stricter than other admin routes)
adminUsersRouter.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Unauthorized. Admin role required." }, 403);
  }
  return next();
});

// ============================================================================
// GET / - List all users
// ============================================================================
adminUsersRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt)); // Newest first

  return c.json({ data: allUsers });
});

// ============================================================================
// PUT /:id/role - Update user role
// ============================================================================
const updateRoleSchema = z.object({
  role: z.enum(["pending", "author", "admin"]),
});

adminUsersRouter.put("/:id/role", zValidator("json", updateRoleSchema), async (c) => {
  const id = c.req.param("id");
  const { role } = c.req.valid("json");
  const currentUser = c.get("user");
  const db = getDb(c.env.DATABASE_URL);

  // Prevent self-demotion
  if (currentUser?.id === id && role !== "admin") {
     return c.json({ error: "You cannot demote yourself." }, 400);
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({
         id: users.id,
         role: users.role
      });

    if (!updatedUser) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ data: updatedUser });
  } catch (error: any) {
    console.error("Update role error:", error);
    return c.json({ error: "Failed to update role" }, 500);
  }
});
