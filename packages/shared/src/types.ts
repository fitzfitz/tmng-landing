import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import * as schema from "./schema";
import { z } from "zod";

// User Schemas
export const selectUserSchema = createSelectSchema(schema.users as any);
export const insertUserSchema = createInsertSchema(schema.users as any);

// Session Schemas
export const selectSessionSchema = createSelectSchema(schema.sessions as any);

// Auth Login Schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Blog Schemas
export const selectPostSchema = createSelectSchema(schema.posts as any);
export const insertPostSchema = createInsertSchema(schema.posts as any);

export const selectCategorySchema = createSelectSchema(schema.categories as any);
export const selectTagSchema = createSelectSchema(schema.tags as any);

// Types derived from Zod
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type Post = z.infer<typeof selectPostSchema>;
