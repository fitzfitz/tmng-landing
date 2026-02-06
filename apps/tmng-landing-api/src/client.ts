import { hc } from 'hono/client';
import type { AppType } from './index';

// Export type-safe client creator (optional helper)
export const createClient = (baseUrl: string) => hc<AppType>(baseUrl);

// Export type for frontend consumption
export type { AppType };
