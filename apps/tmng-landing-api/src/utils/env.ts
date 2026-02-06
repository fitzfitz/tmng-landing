import { z } from 'zod';

console.log('Raw Env Keys:', Object.keys(process.env));

const envSchema = z.object({
  // Hardcoding fallback for now as Wrangler process.env is empty in this setup
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32).default('supersecretjwtsigningkeyfornow123'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGIN: z.string().default('http://localhost:4321,https://tmng.my.id'),
});

export const env = envSchema.parse(process.env);
