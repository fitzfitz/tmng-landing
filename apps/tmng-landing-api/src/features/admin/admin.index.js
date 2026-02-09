import { Hono } from 'hono';
import { statsHandler } from './admin.handlers';
import { authMiddleware } from '../../middlewares/auth';
import { adminMiddleware } from '../../middlewares/admin';
const adminApp = new Hono()
    .get('/stats', authMiddleware, adminMiddleware, ...statsHandler);
export default adminApp;
