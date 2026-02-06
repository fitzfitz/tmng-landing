import { eq, desc, asc, count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { categories, postCategories } from '../../lib/db';
import { type CreateCategoryInput, type UpdateCategoryInput } from '@tmng/shared';

export const categoriesService = {
  // Helpers to get fresh DB context
  getDb() {
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    return drizzle(client);
  },

  async listCategories() {
    const db = this.getDb();
    const results = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        color: categories.color,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        postCount: count(postCategories.postId),
      })
      .from(categories)
      .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
      .groupBy(categories.id)
      .orderBy(asc(categories.sortOrder), asc(categories.name));
      
    return results.map(cat => ({
        ...cat,
        postCount: Number(cat.postCount)
    }));
  },

  async getCategoryById(id: string) {
    const db = this.getDb();
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || null;
  },

  async createCategory(data: CreateCategoryInput) {
    const db = this.getDb();
    const [newCategory] = await db.insert(categories).values(data).returning();
    return newCategory;
  },

  async updateCategory(id: string, data: UpdateCategoryInput) {
    const db = this.getDb();
    const [updatedCategory] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || null;
  },

  async deleteCategory(id: string) {
    const db = this.getDb();
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return deletedCategory || null;
  }
};
