import { Hono } from 'hono';
import { loginHandler, meHandler } from './auth.handlers';
import { authMiddleware } from '../../middlewares/auth';
const authApp = new Hono()
    .post('/login', ...loginHandler)
    .get('/me', authMiddleware, ...meHandler);
export default authApp;
