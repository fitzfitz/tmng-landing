import { z } from "zod";

export type User = {
  id: string;
  role: string;
};

// Cloudflare bindings from dev.vars
export type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: "development" | "production" | "test";
  ALLOWED_ORIGIN: string;
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
