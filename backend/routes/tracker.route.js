import express from "express";
import { addTrackerEntry, getAllTrackerEntries, getTrackerCounts, updateWorkoutStreak } from "../controllers/tracker.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// API ROUTES FOR TRACKING USER STREAKS AND COUNTS
// PROTECTROUTE IS THE AUTHENTICATION MIDDLEWARE TO ENSURE THESE ROUTES CAN ONLY BE ACCESSED IF A USER IS AUTHENTICATED
router.post("/", protectRoute, addTrackerEntry);
router.get("/", protectRoute, getAllTrackerEntries);
router.get("/counts", protectRoute, getTrackerCounts);
router.post("/streak/update", protectRoute, updateWorkoutStreak);


export default router;