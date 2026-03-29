// @ts-nocheck
import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

export default router;