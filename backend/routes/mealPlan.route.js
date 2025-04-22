import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js'; // Ensure this middleware correctly attaches req.user

// Import all necessary controller functions
import {
    generateMealPlan,       // Generates AND saves
    saveMealPlan,           // Explicit save (review necessity)
    getUserMealPlans,       // Get all plans (history) / filter favorites
    getMealPlanById,        // Get specific plan details
    toggleFavoriteMealPlan, // Mark/unmark as favorite
    deleteMealPlan          // Remove a plan
} from '../controllers/mealPlan.controller.js';

const router = express.Router();

// --- Meal Plan Routes ---

// Generate AND Save a new meal plan
// POST /api/meal-plans/generate
router.post('/generate', protectRoute, generateMealPlan);

// Explicitly Save a meal plan (if generation doesn't autosave or for edits)
// POST /api/meal-plans/save
router.post('/save', protectRoute, saveMealPlan);

// Get all meal plans for the logged-in user (History & Favorites Filtering)
// GET /api/meal-plans?favoritesOnly=true
// GET /api/meal-plans
router.get('/', protectRoute, getUserMealPlans);

// Get a single meal plan by its ID
// GET /api/meal-plans/:id
router.get('/:id', protectRoute, getMealPlanById);

// Toggle the favorite status of a specific meal plan
// PATCH /api/meal-plans/:id/favorite
router.patch('/:id/favorite', protectRoute, toggleFavoriteMealPlan);

// Delete a specific meal plan
// DELETE /api/meal-plans/:id
router.delete('/:id', protectRoute, deleteMealPlan);


export default router; // Export the configured router