import { Hono } from 'hono';
import { categoriesHandlers } from './categories.handlers';

const app = new Hono();

app.get('/', categoriesHandlers.listPublic);
app.get('/:id', categoriesHandlers.get);

export default app;
