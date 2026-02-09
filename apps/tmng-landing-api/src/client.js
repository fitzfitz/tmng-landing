import { hc } from 'hono/client';
// Export type-safe client creator (optional helper)
export const createClient = (baseUrl) => hc(baseUrl);
