import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import workoutController, { toggleFavorite } from "../controllers/workout.controller.js";
import Workout from "../models/workout.model.js";
import asyncHandler from "express-async-handler"; // Handles async errors gracefully

const router = express.Router();

// Generate a new workout
router.post("/generate", protectRoute, workoutController);

// GET all workouts for the current user
router.get("/", protectRoute, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ message: "Failed to fetch workouts" });
  }
});

// GET workouts by date range
router.get("/by-date", protectRoute, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const workouts = await Workout.find({
      user: req.user._id,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ createdAt: 1 });

    console.log('Found workouts:', workouts.map(w => ({
      createdAt: w.createdAt,
      totalTimeSpent: w.totalTimeSpent,
      estimatedCalories: w.estimatedCalories
    })));

    res.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts by date:", error);
    res.status(500).json({ message: "Failed to fetch workouts by date" });
  }
});

// GET a specific workout
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json(workout);
  } catch (error) {
    console.error("Error fetching workout:", error);
    res.status(500).json({ message: "Failed to fetch workout" });
  }
});

// POST a new workout (With validation)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, exercises } = req.body;

    if (!name || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: "Invalid workout data" });
    }

    const newWorkout = new Workout({ name, exercises });
    const savedWorkout = await newWorkout.save();

    res.status(201).json(savedWorkout);
  })
);

// PUT (Update) a workout
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedWorkout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.json(updatedWorkout);
  })
);

// DELETE a workout
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    await workout.deleteOne();
    res.json({ message: "Workout deleted successfully" });
  })
);

// TOGGLE favorite status for a workout
router.patch("/:id/favorite", protectRoute, toggleFavorite);

// Complete a workout
router.post("/:id/complete", protectRoute, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Update the workout as completed
    workout.completed = true;
    workout.completedAt = new Date();
    await workout.save();

    res.json({ 
      success: true, 
      message: "Workout completed successfully",
      workout 
    });
  } catch (error) {
    console.error("Error completing workout:", error);
    res.status(500).json({ message: "Failed to complete workout" });
  }
});

export default router;