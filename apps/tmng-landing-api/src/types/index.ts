import { z } from 'zod';

export type User = {
  id: string;
  role: string;
};

export type Variables = {
  user: User;
};

// Zod schema for runtime validation of JWT payload
export const JwtPayloadSchema = z.object({
  sub: z.string(),
  role: z.string(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  // Add other claims as needed
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
