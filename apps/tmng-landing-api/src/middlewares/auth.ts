import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { env } from '../utils/env';
import { Variables, JwtPayloadSchema } from '../types';

export const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const rawPayload = await verify(token, env.JWT_SECRET, 'HS256');
    
    // Validate payload structure using Zod - eliminates 'any' usage safely
    const payload = JwtPayloadSchema.parse(rawPayload);
    
    // Attach user to context
    c.set('user', {
      id: payload.sub,
      role: payload.role,
    });
  } catch (err) {
    throw new HTTPException(401, { message: 'Unauthorized: Invalid token' });
  }

  await next();
});
