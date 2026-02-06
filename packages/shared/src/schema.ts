
import { pgTable, text, timestamp, uuid, boolean, integer, varchar, jsonb, primaryKey, unique, index, foreignKey } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// === Auth & Users ===
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(), // Text ID from DB
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").notNull(),
  bio: text("bio"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
}, (table) => [
  unique("users_email_key").on(table.email),
]);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
}, (table) => [
  unique("sessions_token_key").on(table.token),
]);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "string" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "string" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey().notNull(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

// === Blog Content ===

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#8B5CF6"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: text("author_id"), // Nullable, text to match users.id
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  readTimeMinutes: integer("read_time_minutes").default(5),
  seoTitle: varchar("seo_title", { length: 70 }),
  seoDescription: varchar("seo_description", { length: 160 }),
  seoImage: text("seo_image"),
  publishedAt: timestamp("published_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// Join Table for Posts <-> Categories
export const postCategories = pgTable("post_categories", {
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.categoryId] }),
}));

// Join Table for Posts <-> Tags
// Using alias 'postsTags' to match legacy code usage
export const postsTags = pgTable("post_tags", {
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.tagId, t.postId] }),
}));

export const postViews = pgTable("post_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  ipHash: varchar("ip_hash", { length: 64 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  viewedAt: timestamp("viewed_at", { mode: "string" }).defaultNow().notNull(),
});

// === Portfolio ===

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary"), // Short description for cards
  content: text("content"), // Full Markdown/HTML for case study
  client: varchar("client", { length: 255 }),
  category: varchar("category", { length: 100 }), // e.g., 'Web', 'Mobile'
  tags: jsonb("tags"), // e.g., ["React", "Node"]
  coverImage: text("cover_image"),
  gallery: jsonb("gallery"), // Array of image URLs
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  completedAt: timestamp("completed_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});


// === Engagement ===

// Renamed from 'contacts' to match DB 'contact_submissions'
export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  repliedAt: timestamp("replied_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  source: varchar("source", { length: 50 }).default("blog"),
  confirmToken: varchar("confirm_token", { length: 64 }),
  confirmedAt: timestamp("confirmed_at", { mode: "string" }),
  unsubscribedAt: timestamp("unsubscribed_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const subscriberPreferences = pgTable("subscriber_preferences", {
  subscriberId: uuid("subscriber_id").notNull().references(() => subscribers.id, { onDelete: "cascade" }),
  preferenceKey: varchar("preference_key", { length: 50 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.subscriberId, t.preferenceKey] }),
}));

// === Relations ===

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  sessions: many(sessions),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  categories: many(postCategories),
  tags: many(postsTags),
  views: many(postViews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(postCategories),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsTags),
}));

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));

export const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsTags.tagId],
    references: [tags.id],
  }),
}));

// Export 'contacts' alias for backward compatibility
export const contacts = contactSubmissions; 
