import { createFactory } from "hono/factory";
import { AdminService } from "./admin.service";

import { Bindings, Variables } from "../../types";

const factory = createFactory<{ Bindings: Bindings; Variables: Variables }>();

export const statsHandler = factory.createHandlers(async (c) => {
  const stats = await AdminService.getStats(c.env);

  return c.json({
    success: true,
    data: stats,
  });
});
