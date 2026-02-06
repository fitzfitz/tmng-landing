import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { tagsHandlers } from './tags.handlers';
import { CreateTagSchema, UpdateTagSchema } from '@tmng/shared';

const app = new Hono();

app.get('/', tagsHandlers.list);
app.get('/:id', tagsHandlers.get);
app.post('/', zValidator('json', CreateTagSchema), tagsHandlers.create);
app.put('/:id', zValidator('json', UpdateTagSchema), tagsHandlers.update);
app.delete('/:id', tagsHandlers.delete);

export default app;
