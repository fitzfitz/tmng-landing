import { Hono } from 'hono';
import { loginHandler, meHandler } from './auth.handlers';
import { authMiddleware } from '../../middlewares/auth';

import { Variables } from '../../types';

const authApp = new Hono<{ Variables: Variables }>()
  .post('/login', ...loginHandler)
  .get('/me', authMiddleware, ...meHandler);
  
export default authApp;
