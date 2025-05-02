import express from 'express';
import { submitWeight, getWeightHistory, checkWeeklyWeightStatus } from '../controllers/weightTracking.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

// PROTECTROUTE IS THE AUTHENTICATION MIDDLEWARE TO ENSURE THESE ROUTES CAN ONLY BE ACCESSED IF A USER IS AUTHENTICATED

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Submit weight for current week
router.post('/submit', submitWeight);

// Get weight history
router.get('/history', getWeightHistory);

// Check if weight has been submitted for current week
router.get('/status', checkWeeklyWeightStatus);

export default router; 