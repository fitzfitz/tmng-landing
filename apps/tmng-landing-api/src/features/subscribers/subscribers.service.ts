import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { subscribers } from '../../lib/db';
import type { CreateSubscriberInput, UpdateSubscriberInput } from '@tmng/shared';

export const subscribersService = {
  getDb() {
     const client = postgres(env.DATABASE_URL!, { prepare: false });
     return drizzle(client);
  },
  
  async listSubscribers() {
      const db = this.getDb();
      return db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  },
  
  async getSubscriberByEmail(email: string) {
       const db = this.getDb();
       const [sub] = await db.select().from(subscribers).where(eq(subscribers.email, email));
       return sub || null;
  },

  async getSubscriberById(id: string) {
       const db = this.getDb();
       const [sub] = await db.select().from(subscribers).where(eq(subscribers.id, id));
       return sub || null;
  },
  
  async createSubscriber(data: CreateSubscriberInput) {
      const db = this.getDb();
      const [newSub] = await db.insert(subscribers).values({
          email: data.email,
          firstName: data.firstName,
          source: data.source || 'blog',
          status: 'pending',
          // could generate confirmToken here
      }).returning();
      return newSub;
  },

  async updateSubscriber(id: string, data: UpdateSubscriberInput) {
       const db = this.getDb();
       const [updated] = await db.update(subscribers).set(data).where(eq(subscribers.id, id)).returning();
       return updated || null;
  },

  async deleteSubscriber(id: string) {
       const db = this.getDb();
       await db.delete(subscribers).where(eq(subscribers.id, id));
       return { id };
  }
};
