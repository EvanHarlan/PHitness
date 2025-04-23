import express from "express";
import { addTrackerEntry, getAllTrackerEntries, getTrackerCounts, updateWorkoutStreak } from "../controllers/tracker.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addTrackerEntry);
router.get("/", protectRoute, getAllTrackerEntries);
router.get("/counts", protectRoute, getTrackerCounts);
router.post("/streak/update", protectRoute, updateWorkoutStreak);


export default router;