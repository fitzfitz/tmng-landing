import type { Context } from 'hono';
import { contactsService } from './contacts.service';

export const contactsHandlers = {
  async createPublic(c: Context) {
     const body = await c.req.json();
     const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || '';
     const ua = c.req.header('user-agent') || '';
     
     try {
         const contact = await contactsService.createContact({ ...body, ipAddress: ip, userAgent: ua });
         return c.json({ success: true, message: 'Message sent successfully', data: { id: contact.id } }, 201);
     } catch (e: any) {
         console.error('Create contact error:', e);
         return c.json({ success: false, error: 'Failed to send message' }, 500);
     }
  },
  
  async list(c: Context) {
      const data = await contactsService.listContacts();
      return c.json({ success: true, data });
  },

  async get(c: Context) {
      const id = c.req.param('id');
      const data = await contactsService.getContact(id);
      if (!data) return c.json({ success: false, error: 'Contact not found' }, 404);
      return c.json({ success: true, data });
  },

  async update(c: Context) {
      const id = c.req.param('id');
      const body = await c.req.json();
      try {
          const data = await contactsService.updateContact(id, body);
          if (!data) return c.json({ success: false, error: 'Contact not found' }, 404);
          return c.json({ success: true, data });
      } catch (e) {
          return c.json({ success: false, error: 'Update failed' }, 500);
      }
  },

  async delete(c: Context) {
      const id = c.req.param('id');
      await contactsService.deleteContact(id);
      // idempotent success
      return c.json({ success: true, data: { id } });
  }
};
