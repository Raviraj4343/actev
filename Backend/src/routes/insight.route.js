import express from "express";
import { getTodayInsight, getWeeklySummary } from "../controllers/insight.controller.js";
import { protect, requireEmailVerified, requireProfileComplete } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protect, requireEmailVerified, requireProfileComplete);


router.get("/today", getTodayInsight);
router.get("/summary", getWeeklySummary);

export default router;