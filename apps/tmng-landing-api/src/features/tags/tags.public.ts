import { Hono } from 'hono';
import { tagsHandlers } from './tags.handlers';

const app = new Hono();

app.get('/', tagsHandlers.listPublic);
app.get('/:id', tagsHandlers.get); // Supports ID or slug via handler logic

export default app;
