import express from "express";
import { addTrackerEntry, getAllTrackerEntries, getTrackerCounts } from "../controllers/tracker.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addTrackerEntry);
router.get("/", protectRoute, getAllTrackerEntries);
router.get("/counts", protectRoute, getTrackerCounts);

export default router;