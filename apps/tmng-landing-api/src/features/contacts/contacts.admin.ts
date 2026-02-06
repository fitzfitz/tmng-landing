import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { contactsHandlers } from './contacts.handlers';
import { UpdateContactSchema } from '@tmng/shared';

const app = new Hono();

app.get('/', contactsHandlers.list);
app.get('/:id', contactsHandlers.get);
app.put('/:id', zValidator('json', UpdateContactSchema), contactsHandlers.update);
app.delete('/:id', contactsHandlers.delete);

export default app;
