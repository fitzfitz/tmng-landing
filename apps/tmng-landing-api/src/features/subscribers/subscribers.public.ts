import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { subscribersHandlers } from './subscribers.handlers';
import { CreateSubscriberSchema } from '@tmng/shared';

const app = new Hono();

app.post('/', zValidator('json', CreateSubscriberSchema), subscribersHandlers.subscribe);

export default app;
