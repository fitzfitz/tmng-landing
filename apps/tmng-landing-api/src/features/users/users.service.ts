import { eq, desc } from "drizzle-orm";
import { users, db } from "../../lib/db";
import type { CreateUserInput, UpdateUserInput } from "@tmng/shared";
import { Password } from "../../lib/password";

export const usersService = {
  async listUsers() {
    // Exclude password from list for security
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
        bio: users.bio,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  },

  async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  },

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  },

  async createUser(data: CreateUserInput) {
    const id = crypto.randomUUID();

    const hashedPassword = await Password.hash(
      data.password || "TMNG_default_2025",
    );

    const [newUser] = await db
      .insert(users)
      .values({
        id,
        name: data.name,
        email: data.email,
        role: data.role || "pending",
        password: hashedPassword,
        emailVerified: false,
      })
      .returning();

    // Remove password from response
    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  async updateUser(id: string, data: UpdateUserInput) {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.password = await Password.hash(data.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) return null;

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  },

  async deleteUser(id: string) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) return null;
    const { password, ...safeUser } = deletedUser;
    return safeUser;
  },
};
