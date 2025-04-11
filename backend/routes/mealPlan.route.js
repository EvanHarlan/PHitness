import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { generateMealPlan, saveMealPlan } from '../controllers/mealPlan.controller.js';

const router = express.Router();

// POST /api/meal-plans/generate - Generate a new meal plan
router.post('/generate', protectRoute, generateMealPlan);

// POST /api/meal-plans/save - Save a generated meal plan
router.post('/save', protectRoute, saveMealPlan);

export default router; 