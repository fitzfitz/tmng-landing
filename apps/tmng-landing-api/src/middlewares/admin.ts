import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

import { Variables } from '../types';

export const adminMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Forbidden: Admin access required' });
  }

  await next();
});
