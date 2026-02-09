import { eq, desc, and } from "drizzle-orm";
import { portfolioItems } from "@tmng/shared";
import { db } from "../../lib/db";
export class PortfolioService {
    static async listPublic() {
        return await db
            .select()
            .from(portfolioItems)
            .where(eq(portfolioItems.status, "published"))
            .orderBy(desc(portfolioItems.isFeatured), desc(portfolioItems.createdAt));
    }
    static async getPublicBySlug(slug) {
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
    static async getById(id) {
        const [item] = await db
            .select()
            .from(portfolioItems)
            .where(eq(portfolioItems.id, id))
            .limit(1);
        return item || null;
    }
    static async create(data) {
        const [newItem] = await db
            .insert(portfolioItems)
            .values({
            ...data,
            tags: data.tags || [],
            gallery: data.gallery || [],
        }) // Type assertion needed due to simple-json handling in some drivers
            .returning();
        return newItem;
    }
    static async update(id, data) {
        const [updatedItem] = await db
            .update(portfolioItems)
            .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
            .where(eq(portfolioItems.id, id))
            .returning();
        return updatedItem;
    }
    static async delete(id) {
        await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
        return true;
    }
}
