import express from 'express';
import generateWorkout, { 
  getUserWorkouts, 
  getWorkoutById, 
  deleteWorkout, 
  updateWorkout 
} from '../controllers/workout.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Generate a new workout
// This endpoint needs authentication to save the workout to the user's account
router.post('/generate', protectRoute, generateWorkout);

// Get all workouts for the current user
router.get('/', protectRoute, getUserWorkouts);

// Get a specific workout by ID
router.get('/:id', protectRoute, getWorkoutById);

// Delete a workout
router.delete('/:id', protectRoute, deleteWorkout);

// Update a workout (e.g., for marking as completed or adding notes)
router.put('/:id', protectRoute, updateWorkout);

export default router;