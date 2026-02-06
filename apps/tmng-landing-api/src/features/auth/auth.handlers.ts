import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { loginSchema } from './auth.schema';
import { AuthService } from './auth.service';
import { sign } from 'hono/jwt';
import { env } from '../../utils/env';
import { Variables } from '../../types';
const factory = createFactory<{ Variables: Variables }>();

export const loginHandler = factory.createHandlers(
  zValidator('json', loginSchema),
  async (c) => {
    try {
      console.log('Login request received');
      const { email, password } = c.req.valid('json');
      console.log('Validating user:', email);
      
      const user = await AuthService.validateUser({ email, password });
      console.log('User validated:', user.id);
      
      const payload = {
        sub: user.id,
        role: user.role,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, 
      };
      
      const token = await sign(payload, env.JWT_SECRET);
      console.log('Token generated');
      
      return c.json({
        success: true,
        message: 'Login successful',
        user: { ...user },
        token, 
      });
    } catch (e) {
      console.error('Login Error:', e);
      throw e;
    }
  }
);

export const meHandler = factory.createHandlers(async (c) => {
  // User is attached by middleware
  const contextUser = c.get('user');
  const user = await AuthService.getUserById(contextUser.id);
  
  if (!user) {
      return c.json({
          success: false,
          message: 'User not found'
      }, 404);
  }

  return c.json({
    success: true,
    user
  });
});
