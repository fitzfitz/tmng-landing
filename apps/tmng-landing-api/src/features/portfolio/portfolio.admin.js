import { Hono } from "hono";
import { authMiddleware } from "../../middlewares/auth";
import { listAllHandler, createHandler, updateHandler, deleteHandler, } from "./portfolio.handlers";
const adminPortfolioApp = new Hono()
    .get("/", authMiddleware, ...listAllHandler)
    .post("/", authMiddleware, ...createHandler)
    .put("/:id", authMiddleware, ...updateHandler)
    .delete("/:id", authMiddleware, ...deleteHandler);
export default adminPortfolioApp;
