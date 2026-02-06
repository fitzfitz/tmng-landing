import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { portfolioItems } from "@tmng/shared";
import { env } from "../../utils/env";
import type { CreatePortfolioInput, UpdatePortfolioInput } from "./portfolio.schema";

// Create a client for the service
const client = postgres(env.DATABASE_URL!);
const db = drizzle(client);

export class PortfolioService {
  static async listPublic() {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.status, "published"))
      .orderBy(desc(portfolioItems.isFeatured), desc(portfolioItems.createdAt));
  }

  static async getPublicBySlug(slug: string) {
    const [item] = await db
      .select()
      .from(portfolioItems)
      .where(and(eq(portfolioItems.slug, slug), eq(portfolioItems.status, "published")))
      .limit(1);
    return item || null;
  }

  static async listAll() {
    return await db
      .select()
      .from(portfolioItems)
      .orderBy(desc(portfolioItems.createdAt));
  }

  static async getById(id: string) {
    const [item] = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.id, id))
      .limit(1);
    return item || null;
  }

  static async create(data: CreatePortfolioInput) {
    const [newItem] = await db
      .insert(portfolioItems)
      .values({
        ...data,
        tags: data.tags || [],
        gallery: data.gallery || [],
      } as any) // Type assertion needed due to simple-json handling in some drivers
      .returning();
    return newItem;
  }

  static async update(id: string, data: UpdatePortfolioInput) {
    const [updatedItem] = await db
      .update(portfolioItems)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      } as any)
      .where(eq(portfolioItems.id, id))
      .returning();
    return updatedItem;
  }

  static async delete(id: string) {
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
    return true;
  }
}
