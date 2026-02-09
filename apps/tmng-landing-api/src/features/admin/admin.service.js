import { createDb, users, posts, contactSubmissions, subscribers, } from "../../lib/db";
import { sql } from "drizzle-orm";
export const AdminService = {
    async getStats(env) {
        const db = createDb(env);
        try {
            // Use the shared db instance with safe table interpolation
            const result = await db.execute(sql `
          SELECT
            (SELECT count(*) FROM ${users}) as users_count,
            (SELECT count(*) FROM ${posts}) as posts_count,
            (SELECT count(*) FROM ${contactSubmissions}) as contacts_count,
            (SELECT count(*) FROM ${subscribers}) as subscribers_count
        `);
            console.log("Stats query successful");
            const row = result[0];
            // Return data
            return {
                users: Number(row.users_count || 0),
                posts: Number(row.posts_count || 0),
                contacts: Number(row.contacts_count || 0),
                subscribers: Number(row.subscribers_count || 0),
            };
        }
        catch (error) {
            console.error("Error fetching stats:", error);
            throw error;
        }
    },
};
