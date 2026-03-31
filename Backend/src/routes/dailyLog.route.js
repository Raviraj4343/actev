const express = require("express");
const { body } = require("express-validator");
import { validate } from "../middleware/validation.middleware.js";
import { protect, requireEmailVerified, requireProfileComplete } from "../middleware/auth.middleware.js";
import { createOrUpdateDailyLog, getTodayLog, getLogByDate, getHistory, updateMealSection, updateVitals } from "../controllers/dailyLog.controller.js";

// All routes need full auth + profile
router.use(protect, requireEmailVerified, requireProfileComplete);

// ── Validation rules for water/sleep/steps 
const vitalsValidation = [
  body("waterIntake")
    .optional()
    .isIn(["<1L", "1-2L", "2-3L", "3L+"]).withMessage("Invalid water intake value"),
  body("sleepHours")
    .optional()
    .isFloat({ min: 0, max: 24 }).withMessage("Sleep hours must be 0–24"),
  body("steps")
    .optional()
    .isInt({ min: 0 }).withMessage("Steps must be a non-negative integer"),
];

// ── Routes ──────────────────────────────────────────────

router.get("/today", getTodayLog);
router.get("/history", getHistory);
router.post("/", vitalsValidation, validate, createOrUpdateDailyLog);
router.get("/:date", getLogByDate);
router.patch("/:date/meal", updateMealSection);
router.patch("/:date/vitals", vitalsValidation, validate, updateVitals);

export default router;