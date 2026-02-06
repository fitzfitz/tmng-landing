import { z } from "zod";

export const createPortfolioSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  summary: z.string().optional(),
  content: z.string().optional(),
  client: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).optional(),
  liveUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['published', 'draft']).default('draft'),
  isFeatured: z.boolean().default(false),
  completedAt: z.string().datetime().optional()
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
