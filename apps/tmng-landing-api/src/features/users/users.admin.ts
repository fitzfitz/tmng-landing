import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { usersHandlers } from './users.handlers';
import { authMiddleware } from '../../middlewares/auth';
import { adminMiddleware } from '../../middlewares/admin';
import { CreateUserSchema, UpdateUserSchema } from '@tmng/shared';
import { Variables } from '../../types';

const app = new Hono<{ Variables: Variables }>();

app.use('*', authMiddleware, adminMiddleware);

app.get('/', usersHandlers.list);
app.get('/:id', usersHandlers.get);
app.post('/', zValidator('json', CreateUserSchema), usersHandlers.create);
app.put('/:id', zValidator('json', UpdateUserSchema), usersHandlers.update);
app.delete('/:id', usersHandlers.delete);

export default app;
