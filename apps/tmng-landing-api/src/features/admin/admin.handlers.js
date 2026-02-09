import { createFactory } from "hono/factory";
import { AdminService } from "./admin.service";
const factory = createFactory();
export const statsHandler = factory.createHandlers(async (c) => {
    const stats = await AdminService.getStats(c.env);
    return c.json({
        success: true,
        data: stats,
    });
});
