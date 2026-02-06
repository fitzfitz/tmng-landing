import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './utils/env';
import authApp from './features/auth/auth.index';
import adminApp from './features/admin/admin.index';
import publicPostsApp from './features/posts/posts.public';
import adminPostsApp from './features/posts/posts.admin';
import publicCategoriesApp from './features/categories/categories.public';
import adminCategoriesApp from './features/categories/categories.admin';
import publicTagsApp from './features/tags/tags.public';
import adminTagsApp from './features/tags/tags.admin';
import usersAdminApp from './features/users/users.admin';
import publicContactsApp from './features/contacts/contacts.public';
import adminContactsApp from './features/contacts/contacts.admin';
import publicSubscribersApp from './features/subscribers/subscribers.public';
import adminSubscribersApp from './features/subscribers/subscribers.admin';
import publicPortfolioApp from './features/portfolio/portfolio.public';
import adminPortfolioApp from './features/portfolio/portfolio.admin';

import { Variables } from './types';

const app = new Hono<{ Variables: Variables }>().basePath('/api');

app.use(
  '*',
  cors({
    origin: env.ALLOWED_ORIGIN.split(','),
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// Global Error Handling
app.onError((err, c) => {
  console.error(err);
  
  // Preserve status code from HTTPException
  const status = err instanceof Error && 'status' in err ? (err as any).status : 500;
  
  return c.json({
    success: false,
    message: err.message || 'Internal Server Error'
  }, status);
});

// Routes
app.route('/auth', authApp);
app.route('/admin', adminApp);
app.route('/posts', publicPostsApp);       // Public posts routes
app.route('/admin/posts', adminPostsApp);   // Admin posts routes
app.route('/categories', publicCategoriesApp); // Public categories routes
app.route('/admin/categories', adminCategoriesApp); // Admin categories routes
app.route('/tags', publicTagsApp); // Public tags routes
app.route('/admin/tags', adminTagsApp); // Admin tags routes

app.route('/admin/users', usersAdminApp);
app.route('/contacts', publicContactsApp);
app.route('/admin/contacts', adminContactsApp);
app.route('/subscribers', publicSubscribersApp);
app.route('/admin/subscribers', adminSubscribersApp);
app.route('/portfolio', publicPortfolioApp);
app.route('/admin/portfolio', adminPortfolioApp);

app.get('/', (c) => {
  return c.json({ message: 'Welcome to TMNG Landing API', env: env.NODE_ENV });
});

export type AppType = typeof app;
export default app;
