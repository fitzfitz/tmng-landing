import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { subscribersHandlers } from './subscribers.handlers';
import { UpdateSubscriberSchema } from '@tmng/shared';

const app = new Hono();

app.get('/', subscribersHandlers.list);
app.get('/:id', subscribersHandlers.get);
app.put('/:id', zValidator('json', UpdateSubscriberSchema), subscribersHandlers.update);
app.delete('/:id', subscribersHandlers.delete);

export default app;
