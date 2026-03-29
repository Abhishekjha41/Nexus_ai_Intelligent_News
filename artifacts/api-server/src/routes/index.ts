// @ts-nocheck
import { Router, type IRouter } from "express";
import healthRouter from "./health.ts";
import newsRouter from "./news.ts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(newsRouter);

export default router;
