import { Hono } from "hono";
import { authMiddleware } from "../../middlewares/auth";
import {
  listAllHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} from "./portfolio.handlers";

type Variables = {
  user: { id: string; email: string; role: string };
};

const adminPortfolioApp = new Hono<{ Variables: Variables }>()
  .get("/", authMiddleware, ...listAllHandler)
  .post("/", authMiddleware, ...createHandler)
  .put("/:id", authMiddleware, ...updateHandler)
  .delete("/:id", authMiddleware, ...deleteHandler);

export default adminPortfolioApp;
