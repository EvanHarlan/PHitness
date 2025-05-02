import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js'; // Ensure this middleware correctly attaches req.user

import {
    generateMealPlan,       // Generates AND saves
    saveMealPlan,           // Explicit save (review necessity)
    getUserMealPlans,       // Get all plans (history) / filter favorites
    getMealPlanById,        // Get specific plan details
    toggleFavoriteMealPlan, // Mark/unmark as favorite
    deleteMealPlan,         // Remove a plan
    completeMeal,           // Complete a meal
    completeMealPlan        // Complete a meal plan
} from '../controllers/mealPlan.controller.js';

const router = express.Router();

// PROTECTROUTE IS THE AUTHENTICATION MIDDLEWARE TO ENSURE THESE ROUTES CAN ONLY BE ACCESSED IF A USER IS AUTHENTICATED

// Generate AND Save a new meal plan
router.post('/generate', protectRoute, generateMealPlan);

// Explicitly Save a meal plan (if generation doesn't autosave or for edits)
router.post('/save', protectRoute, saveMealPlan);

// Get all meal plans for the logged-in user (History & Favorites Filtering)
router.get('/', protectRoute, getUserMealPlans);

// Get a single meal plan by its ID
router.get('/:id', protectRoute, getMealPlanById);

// Toggle the favorite status of a specific meal plan
router.patch('/:id/favorite', protectRoute, toggleFavoriteMealPlan);

// Delete a specific meal plan
router.delete('/:id', protectRoute, deleteMealPlan);

// Complete a meal
router.patch('/:mealPlanId/meals/:mealIndex/complete', protectRoute, completeMeal);

// Mark meal plan as completed
router.patch('/:id/complete', protectRoute, completeMealPlan);

export default router;