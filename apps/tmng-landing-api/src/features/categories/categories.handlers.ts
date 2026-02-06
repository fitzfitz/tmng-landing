import type { Context } from 'hono';
import { categoriesService } from './categories.service';

export const categoriesHandlers = {
  async list(_c: Context) {
    const categories = await categoriesService.listCategories();
    return _c.json({ success: true, data: categories });
  },

  async listPublic(_c: Context) {
    // For now, public list is same as admin list
    // You might want to filter out empty categories locally if needed, but not required by requirements
    const categories = await categoriesService.listCategories();
    return _c.json({ success: true, data: categories });
  },

  async get(c: Context) {
    const id = c.req.param('id');
    const category = await categoriesService.getCategoryById(id);
    if (!category) {
      return c.json({ success: false, error: 'Category not found' }, 404);
    }
    return c.json({ success: true, data: category });
  },

  async create(c: Context) {
    const data = await c.req.json();
    try {
      const newCategory = await categoriesService.createCategory(data);
      return c.json({ success: true, data: newCategory }, 201);
    } catch (error: any) {
      console.error('Create category error:', error);
      // Handle unique constraint violation for slug
      if (error.code === '23505') { 
        return c.json({ success: false, error: 'Slug already exists' }, 409);
      }
      return c.json({ success: false, error: 'Failed to create category' }, 500);
    }
  },

  async update(c: Context) {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
      const updatedCategory = await categoriesService.updateCategory(id, data);
      if (!updatedCategory) {
        return c.json({ success: false, error: 'Category not found' }, 404);
      }
      return c.json({ success: true, data: updatedCategory });
    } catch (error: any) {
      console.error('Update category error:', error);
      if (error.code === '23505') {
        return c.json({ success: false, error: 'Slug already exists' }, 409);
      }
      return c.json({ success: false, error: 'Failed to update category' }, 500);
    }
  },

  async delete(c: Context) {
    const id = c.req.param('id');
    try {
      const deletedCategory = await categoriesService.deleteCategory(id);
      if (!deletedCategory) {
        return c.json({ success: false, error: 'Category not found' }, 404);
      }
      return c.json({ success: true, data: deletedCategory });
    } catch (error) {
       console.error('Delete category error:', error);
       return c.json({ success: false, error: 'Failed to delete category' }, 500);
    }
  }
};
