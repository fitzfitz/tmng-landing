import type { Context } from 'hono';
import { tagsService } from './tags.service';

export const tagsHandlers = {
  async list(_c: Context) {
    const tags = await tagsService.listTags();
    return _c.json({ success: true, data: tags });
  },

  async listPublic(_c: Context) {
    const tags = await tagsService.listTags();
    return _c.json({ success: true, data: tags });
  },

  async get(c: Context) {
    const id = c.req.param('id');
    const tag = await tagsService.getTagById(id);
    if (!tag) {
       // Try lookup by slug if ID failed (optional convenience)
       const tagBySlug = await tagsService.getTagBySlug(id); // assuming param could be slug
       if (tagBySlug) {
           return c.json({ success: true, data: tagBySlug });
       }
       return c.json({ success: false, error: 'Tag not found' }, 404);
    }
    return c.json({ success: true, data: tag });
  },

  async create(c: Context) {
    const data = await c.req.json();
    try {
      const newTag = await tagsService.createTag(data);
      return c.json({ success: true, data: newTag }, 201);
    } catch (error: any) {
      console.error('Create tag error:', error);
      if (error.code === '23505') { 
        return c.json({ success: false, error: 'Slug already exists' }, 409);
      }
      return c.json({ success: false, error: 'Failed to create tag' }, 500);
    }
  },

  async update(c: Context) {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
      const updatedTag = await tagsService.updateTag(id, data);
      if (!updatedTag) {
        return c.json({ success: false, error: 'Tag not found' }, 404);
      }
      return c.json({ success: true, data: updatedTag });
    } catch (error: any) {
      console.error('Update tag error:', error);
      if (error.code === '23505') {
        return c.json({ success: false, error: 'Slug already exists' }, 409);
      }
      return c.json({ success: false, error: 'Failed to update tag' }, 500);
    }
  },

  async delete(c: Context) {
    const id = c.req.param('id');
    try {
      const deletedTag = await tagsService.deleteTag(id);
      if (!deletedTag) {
        return c.json({ success: false, error: 'Tag not found' }, 404);
      }
      return c.json({ success: true, data: deletedTag });
    } catch (error) {
       console.error('Delete tag error:', error);
       return c.json({ success: false, error: 'Failed to delete tag' }, 500);
    }
  }
};
