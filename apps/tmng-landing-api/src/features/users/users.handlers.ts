import type { Context } from 'hono';
import { usersService } from './users.service';
import { Variables } from '../../types';

export const usersHandlers = {
  async list(c: Context<{ Variables: Variables }>) {
    const data = await usersService.listUsers();
    return c.json({ success: true, data });
  },

  async get(c: Context<{ Variables: Variables }>) {
    const id = c.req.param('id');
    const data = await usersService.getUserById(id);
    if (!data) return c.json({ success: false, error: 'User not found' }, 404);
    
    // Safety check just in case service returned password
    if (data.password) {
        const { password, ...safe } = data;
        return c.json({ success: true, data: safe });
    }
    return c.json({ success: true, data });
  },

  async create(c: Context<{ Variables: Variables }>) {
    const body = await c.req.json();
    const existing = await usersService.getUserByEmail(body.email);
    if (existing) {
        return c.json({ success: false, error: 'Email already exists' }, 409);
    }
    
    try {
        const data = await usersService.createUser(body);
        return c.json({ success: true, data }, 201);
    } catch (e: any) {
        console.error('Create user error:', e);
        return c.json({ success: false, error: 'Failed to create user' }, 500);
    }
  },

  async update(c: Context<{ Variables: Variables }>) {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    try {
        // Check if user exists first
        const existing = await usersService.getUserById(id);
        if (!existing) return c.json({ success: false, error: 'User not found' }, 404);

        // Safeguard: Cannot demote Root Admin
        if (existing.email === 'admin@tmng.my.id' && body.role && body.role !== 'admin') {
            return c.json({ success: false, error: 'Cannot demote Root Admin' }, 403);
        }

        const data = await usersService.updateUser(id, body);
        return c.json({ success: true, data });
    } catch (e: any) {
        console.error('Update user error:', e);
        if (e.code === '23505') { // Unique violation (email)
             return c.json({ success: false, error: 'Email uses by another user' }, 409);
        }
        return c.json({ success: false, error: 'Failed to update user' }, 500);
    }
  },

  async delete(c: Context<{ Variables: Variables }>) {
    const id = c.req.param('id');
    try {
        const existing = await usersService.getUserById(id);
        if (!existing) return c.json({ success: false, error: 'User not found' }, 404);

        // Safeguard: Cannot delete Root Admin
        if (existing.email === 'admin@tmng.my.id') {
            return c.json({ success: false, error: 'Cannot delete Root Admin' }, 403);
        }

        // Safeguard: Cannot delete yourself
        const currentUser = c.get('user');
        if (currentUser && currentUser.id === id) {
             return c.json({ success: false, error: 'Cannot delete your own account' }, 400);
        }

        const data = await usersService.deleteUser(id);
        return c.json({ success: true, data });
    } catch (e: any) {
        console.error('Delete user error:', e);
        return c.json({ success: false, error: 'Failed to delete user' }, 500);
    }
  }
};
