import type { Context } from 'hono';
import { subscribersService } from './subscribers.service';

export const subscribersHandlers = {
    async subscribe(c: Context) {
        const body = await c.req.json();
        const existing = await subscribersService.getSubscriberByEmail(body.email);
        if (existing) {
            return c.json({ success: true, message: 'Already subscribed' }, 200);
        }
        try {
            const sub = await subscribersService.createSubscriber(body);
            return c.json({ success: true, message: 'Subscribed successfully', data: sub }, 201);
        } catch (e: any) {
            console.error(e);
            return c.json({ success: false, error: 'Failed to subscribe' }, 500);
        }
    },

    async list(c: Context) {
        const data = await subscribersService.listSubscribers();
        return c.json({ success: true, data });
    },

    async get(c: Context) {
        const id = c.req.param('id');
        const data = await subscribersService.getSubscriberById(id);
        if (!data) return c.json({ success: false, error: 'Subscriber not found' }, 404);
        return c.json({ success: true, data });
    },

    async update(c: Context) {
        const id = c.req.param('id');
        const body = await c.req.json();
        try {
            const data = await subscribersService.updateSubscriber(id, body);
            if (!data) return c.json({ success: false, error: 'Subscriber not found' }, 404);
            return c.json({ success: true, data });
        } catch (e) {
            return c.json({ success: false, error: 'Failed' }, 500);
        }
    },

    async delete(c: Context) {
        const id = c.req.param('id');
        try {
            await subscribersService.deleteSubscriber(id);
            return c.json({ success: true, data: { id } });
        } catch (e) {
             return c.json({ success: false, error: 'Failed' }, 500);
        }
    }
};
