import { db, users, posts, contacts, subscribers } from '../../lib/db';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '../../utils/env';

export const AdminService = {
  async getStats() {
    console.log('Fetching stats via independent connection...');
    
    // Create a fresh connection specifically for this request
    // This bypasses any global pool issues in the Worker environment
    const tempClient = postgres(env.DATABASE_URL!, { 
       prepare: false,
       ssl: { rejectUnauthorized: false }, // Maintain SSL
       max: 1 
    });
    
    const tempDb = drizzle(tempClient);

    try {
        const result = await tempDb.execute(sql`
          SELECT
            (SELECT count(*) FROM users) as users_count,
            (SELECT count(*) FROM posts) as posts_count,
            (SELECT count(*) FROM "contactSubmissions") as contacts_count,
            (SELECT count(*) FROM subscribers) as subscribers_count
        `);

        console.log('Stats query successful');
        const row = result[0];
        
        // Return data
        return {
          users: Number(row.users_count || 0),
          posts: Number(row.posts_count || 0),
          contacts: Number(row.contacts_count || 0),
          subscribers: Number(row.subscribers_count || 0),
        };

    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    } finally {
        // CRITICAL: Close the connection to release the Worker event loop
        console.log('Closing stats connection...');
        await tempClient.end();
    }
  }
};
