import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, uuid, varchar, text, jsonb, boolean, timestamp, } from "drizzle-orm/pg-core";
import { env } from "../utils/env";
const client = postgres(env.DATABASE_URL);
const db = drizzle(client);
// Inlined schema to avoid monorepo resolution issues during seeding
export const portfolioItems = pgTable("portfolio_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    summary: text("summary"),
    content: text("content"),
    client: varchar("client", { length: 255 }),
    category: varchar("category", { length: 100 }),
    tags: jsonb("tags"),
    coverImage: text("cover_image"),
    gallery: jsonb("gallery"),
    liveUrl: text("live_url"),
    repoUrl: text("repo_url"),
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    completedAt: timestamp("completed_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
const mockProjects = [
    {
        title: "E-Commerce Dashboard",
        slug: "e-commerce-dashboard",
        summary: "A comprehensive analytics dashboard for online retailers.",
        content: "Built with React, Tailwind CSS, and Recharts. Features real-time data visualization, inventory management, and order tracking.",
        client: "RetailCo",
        category: "Web App",
        tags: ["React", "TypeScript", "Tailwind CSS", "Recharts"],
        coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        status: "published",
        isFeatured: true,
        liveUrl: "https://demo-dashboard.com",
        repoUrl: "https://github.com/demo/dashboard",
        completedAt: new Date("2023-11-15").toISOString(),
    },
    {
        title: "Travel Agency Website",
        slug: "travel-agency-website",
        summary: "Modern landing page for a luxury travel agency.",
        content: "Responsive design with smooth scroll animations and booking integration.",
        client: "Wanderlust Travels",
        category: "Website",
        tags: ["Next.js", "Framer Motion", "Tailwind CSS"],
        coverImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
        status: "published",
        isFeatured: true,
        liveUrl: "https://wanderlust-demo.com",
        completedAt: new Date("2023-12-01").toISOString(),
    },
    {
        title: "Fitness Tracker App",
        slug: "fitness-tracker-app",
        summary: "Mobile-first application for tracking workouts and nutrition.",
        content: "PWA with offline capabilities and local storage sync.",
        client: "Personal Project",
        category: "Mobile Web",
        tags: ["Vue.js", "Vite", "PWA"],
        coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        status: "draft",
        isFeatured: false,
        repoUrl: "https://github.com/demo/fitness",
        completedAt: new Date("2024-01-10").toISOString(),
    },
];
async function seed() {
    console.log("🌱 Seeding database...");
    try {
        // Clear existing portfolio items
        console.log("Cleaning up old data...");
        await db.delete(portfolioItems);
        // Insert new items
        console.log("Inserting portfolio items...");
        await db.insert(portfolioItems).values(mockProjects);
        console.log("✅ Seeding completed!");
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
    }
    finally {
        await client.end();
    }
}
seed();
