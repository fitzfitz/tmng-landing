import { Hono } from "hono";
import {
  listPublicHandler,
  getPublicBySlugHandler,
} from "./portfolio.handlers";

const publicPortfolioApp = new Hono()
  .get("/", ...listPublicHandler)
  .get("/:slug", ...getPublicBySlugHandler);

export default publicPortfolioApp;
