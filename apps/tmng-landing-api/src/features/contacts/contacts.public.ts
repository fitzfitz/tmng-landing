import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { contactsHandlers } from './contacts.handlers';
import { CreateContactSchema } from '@tmng/shared';

const app = new Hono();

app.post('/', zValidator('json', CreateContactSchema), contactsHandlers.createPublic);

export default app;
