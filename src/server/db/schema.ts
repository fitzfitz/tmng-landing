import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// BETTER AUTH TABLES
// ============================================================================

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  password: text("password"), // Added for credentials auth
  role: text("role").default("pending").notNull().$type<"pending" | "author" | "admin">(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  posts: many(posts),
}));

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(), // Added for Better Auth
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"), // Added because Better Auth error requested it
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// CATEGORIES
// ============================================================================
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#8B5CF6"), // Hex color
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postCategories),
}));

// ============================================================================
// TAGS
// ============================================================================
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

// ============================================================================
// POSTS (Updated to reference users instead of authors)
// ============================================================================
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: text("author_id")
      .references(() => users.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    status: varchar("status", { length: 20 })
      .default("draft")
      .notNull()
      .$type<"draft" | "published" | "archived">(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    readTimeMinutes: integer("read_time_minutes").default(5),
    // SEO fields
    seoTitle: varchar("seo_title", { length: 70 }),
    seoDescription: varchar("seo_description", { length: 160 }),
    seoImage: text("seo_image"),
    // Timestamps
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("posts_status_idx").on(table.status),
    index("posts_published_at_idx").on(table.publishedAt),
    index("posts_is_featured_idx").on(table.isFeatured),
    index("posts_author_id_idx").on(table.authorId),
  ]
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  postCategories: many(postCategories),
  postTags: many(postTags),
  views: many(postViews),
}));

// ============================================================================
// POST <-> CATEGORY (Many-to-Many)
// ============================================================================
export const postCategories = pgTable(
  "post_categories",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.categoryId] }),
  ]
);

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

// ============================================================================
// POST <-> TAG (Many-to-Many)
// ============================================================================
export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
  ]
);

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

// ============================================================================
// POST VIEWS (Analytics)
// ============================================================================
export const postViews = pgTable(
  "post_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    ipHash: varchar("ip_hash", { length: 64 }), // SHA-256 hash for privacy
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  },
  (table) => [
    index("post_views_post_id_idx").on(table.postId),
    index("post_views_viewed_at_idx").on(table.viewedAt),
  ]
);

export const postViewsRelations = relations(postViews, ({ one }) => ({
  post: one(posts, {
    fields: [postViews.postId],
    references: [posts.id],
  }),
}));

// ============================================================================
// SUBSCRIBERS (Newsletter)
// ============================================================================
export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }),
    status: varchar("status", { length: 20 })
      .default("pending")
      .notNull()
      .$type<"pending" | "active" | "unsubscribed">(),
    source: varchar("source", { length: 50 }).default("blog"),
    confirmToken: varchar("confirm_token", { length: 64 }),
    confirmedAt: timestamp("confirmed_at"),
    unsubscribedAt: timestamp("unsubscribed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("subscribers_status_idx").on(table.status),
    index("subscribers_confirm_token_idx").on(table.confirmToken),
  ]
);

export const subscribersRelations = relations(subscribers, ({ many }) => ({
  preferences: many(subscriberPreferences),
}));

// ============================================================================
// SUBSCRIBER PREFERENCES
// ============================================================================
export const subscriberPreferences = pgTable(
  "subscriber_preferences",
  {
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => subscribers.id, { onDelete: "cascade" }),
    preferenceKey: varchar("preference_key", { length: 50 }).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.subscriberId, table.preferenceKey] }),
  ]
);

export const subscriberPreferencesRelations = relations(
  subscriberPreferences,
  ({ one }) => ({
    subscriber: one(subscribers, {
      fields: [subscriberPreferences.subscriberId],
      references: [subscribers.id],
    }),
  })
);

// ============================================================================
// CONTACT SUBMISSIONS
// ============================================================================
export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 20 })
      .default("new")
      .notNull()
      .$type<"new" | "read" | "replied" | "archived">(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    repliedAt: timestamp("replied_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("contact_submissions_status_idx").on(table.status),
    index("contact_submissions_created_at_idx").on(table.createdAt),
  ]
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type PostView = typeof postViews.$inferSelect;
export type NewPostView = typeof postViews.$inferInsert;

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
