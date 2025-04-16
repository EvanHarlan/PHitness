import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { trackExercise, getExerciseHistory, getWorkoutExerciseHistory } from '../controllers/exerciseTracking.controller.js';

const router = express.Router();

// Track a new exercise
router.post('/track', protectRoute, trackExercise);

// Get exercise history for the user
router.get('/history', protectRoute, getExerciseHistory);

// Get exercise history for a specific workout
router.get('/workout/:workoutId', protectRoute, getWorkoutExerciseHistory);

export default router; 