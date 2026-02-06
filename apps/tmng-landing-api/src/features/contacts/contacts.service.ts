import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { contacts } from '../../lib/db';
import type { CreateContactInput, UpdateContactInput } from '@tmng/shared';

export const contactsService = {
  getDb() {
     const client = postgres(env.DATABASE_URL!, { prepare: false });
     return drizzle(client);
  },

  async createContact(data: CreateContactInput & { ipAddress?: string; userAgent?: string }) {
      const db = this.getDb();
       const [newContact] = await db.insert(contacts).values({
           name: data.name,
           email: data.email,
           subject: data.subject,
           message: data.message,
           status: 'new',
           ipAddress: data.ipAddress,
           userAgent: data.userAgent,
       }).returning();
       return newContact;
  },

  async listContacts() {
      const db = this.getDb();
      return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  },
  
  async getContact(id: string) {
       const db = this.getDb();
       const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
       return contact || null;
  },
  
  async updateContact(id: string, data: UpdateContactInput) {
       const db = this.getDb();
       const [updated] = await db.update(contacts)
         .set(data)
         .where(eq(contacts.id, id))
         .returning();
       return updated || null;
  },

  async deleteContact(id: string) {
      const db = this.getDb();
      const [deleted] = await db.delete(contacts).where(eq(contacts.id, id)).returning();
      return deleted || null;
  }
};
