import { Hono } from 'hono';
import { statsHandler } from './admin.handlers';
import { authMiddleware } from '../../middlewares/auth';
import { adminMiddleware } from '../../middlewares/admin';

import { Variables } from '../../types';

const adminApp = new Hono<{ Variables: Variables }>()
  .get('/stats', authMiddleware, adminMiddleware, ...statsHandler);

export default adminApp;
