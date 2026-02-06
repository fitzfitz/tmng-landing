import { createFactory } from 'hono/factory';
import { AdminService } from './admin.service';

import { Variables } from '../../types';

const factory = createFactory<{ Variables: Variables }>();

export const statsHandler = factory.createHandlers(async (c) => {
  const stats = await AdminService.getStats();
  
  return c.json({
    success: true,
    data: stats
  });
});
