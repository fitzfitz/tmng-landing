import { eq, asc, count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { tags, postsTags } from '../../lib/db';
import { type CreateTagInput, type UpdateTagInput } from '@tmng/shared';

export const tagsService = {
  // Helpers to get fresh DB context
  getDb() {
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    return drizzle(client);
  },

  async listTags() {
    const db = this.getDb();
    const results = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        createdAt: tags.createdAt,
        postCount: count(postsTags.postId),
      })
      .from(tags)
      .leftJoin(postsTags, eq(tags.id, postsTags.tagId))
      .groupBy(tags.id)
      .orderBy(asc(tags.name));

    return results.map(tag => ({
      ...tag,
      postCount: Number(tag.postCount),
    }));
  },

  async getTagById(id: string) {
    const db = this.getDb();
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || null;
  },
  
  async getTagBySlug(slug: string) {
    const db = this.getDb();
    const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
    return tag || null;
  },

  async createTag(data: CreateTagInput) {
    const db = this.getDb();
    const [newTag] = await db.insert(tags).values(data).returning();
    return newTag;
  },

  async updateTag(id: string, data: UpdateTagInput) {
    const db = this.getDb();
    const [updatedTag] = await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();
    return updatedTag || null;
  },

  async deleteTag(id: string) {
    const db = this.getDb();
    const [deletedTag] = await db
      .delete(tags)
      .where(eq(tags.id, id))
      .returning();
    return deletedTag || null;
  }
};
