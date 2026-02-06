import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { categoriesHandlers } from './categories.handlers';
import { CreateCategorySchema, UpdateCategorySchema } from '@tmng/shared';

const app = new Hono();

app.get('/', categoriesHandlers.list);
app.get('/:id', categoriesHandlers.get);
app.post('/', zValidator('json', CreateCategorySchema), categoriesHandlers.create);
app.put('/:id', zValidator('json', UpdateCategorySchema), categoriesHandlers.update);
app.delete('/:id', categoriesHandlers.delete);

export default app;
