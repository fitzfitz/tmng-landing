import { z } from 'zod';

// === Categories ===
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color hex code').optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;


// === Tags ===
export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

export const UpdateTagSchema = CreateTagSchema.partial();

export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;

// === Users ===
export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "author", "pending"]).default("pending"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// === Contacts ===
export const CreateContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export const UpdateContactSchema = z.object({
  status: z.enum(["new", "read", "replied", "spam"]),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;

// === Subscribers ===
export const CreateSubscriberSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().optional(),
  source: z.string().optional(),
});

export const UpdateSubscriberSchema = CreateSubscriberSchema.partial().extend({
  status: z.enum(["pending", "active", "unsubscribed"]).optional(),
});

export type CreateSubscriberInput = z.infer<typeof CreateSubscriberSchema>;
export type UpdateSubscriberInput = z.infer<typeof UpdateSubscriberSchema>;
