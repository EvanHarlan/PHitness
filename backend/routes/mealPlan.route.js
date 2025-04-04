import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
  getMealPlanTotals,
  generateMealSuggestions,
  saveAISuggestions
} from '../controllers/mealPlan.controller.js';

const router = express.Router();

// Apply authentication middleware to all meal plan routes
router.use(protectRoute);

// Basic CRUD operations
router.route('/')
  .post(createMealPlan)
  .get(getMealPlans);

router.route('/:id')
  .get(getMealPlanById)
  .put(updateMealPlan)
  .delete(deleteMealPlan);

// Additional features
router.get('/:id/totals', getMealPlanTotals);

// AI meal suggestions
router.post('/suggest', generateMealSuggestions);
router.post('/suggest/save', saveAISuggestions);

export default router; 