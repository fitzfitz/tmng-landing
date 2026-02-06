import { createFactory } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { PortfolioService } from "./portfolio.service";
import { createPortfolioSchema, updatePortfolioSchema } from "./portfolio.schema";

type Variables = {
  user?: { id: string; email: string; role: string };
};

const factory = createFactory<{ Variables: Variables }>();

export const listPublicHandler = factory.createHandlers(async (c) => {
  const items = await PortfolioService.listPublic();
  return c.json({ success: true, data: items });
});

export const getPublicBySlugHandler = factory.createHandlers(async (c) => {
  const slug = c.req.param("slug")!;
  const item = await PortfolioService.getPublicBySlug(slug);
  
  if (!item) {
    return c.json({ success: false, message: "Project not found" }, 404);
  }
  
  return c.json({ success: true, data: item });
});

export const listAllHandler = factory.createHandlers(async (c) => {
  const items = await PortfolioService.listAll();
  return c.json({ success: true, data: items });
});

export const createHandler = factory.createHandlers(
  zValidator("json", createPortfolioSchema),
  async (c) => {
    const data = c.req.valid("json");
    try {
      const newItem = await PortfolioService.create(data);
      return c.json({ success: true, data: newItem }, 201);
    } catch (error: any) {
      if (error.code === '23505') { 
        return c.json({ success: false, message: "Slug already exists" }, 409);
      }
      throw error;
    }
  }
);

export const updateHandler = factory.createHandlers(
  zValidator("json", updatePortfolioSchema),
  async (c) => {
    const id = c.req.param("id")!;
    const data = c.req.valid("json");
    
    // Check if exists
    const existing = await PortfolioService.getById(id);
    if (!existing) {
      return c.json({ success: false, message: "Project not found" }, 404);
    }

    const updated = await PortfolioService.update(id, data);
    return c.json({ success: true, data: updated });
  }
);

export const deleteHandler = factory.createHandlers(async (c) => {
  const id = c.req.param("id")!;
  await PortfolioService.delete(id);
  return c.json({ success: true, message: "Project deleted" });
});
