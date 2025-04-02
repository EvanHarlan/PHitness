import express from "express";
import Workout from "../models/workout.model.js";
import asyncHandler from "express-async-handler"; // Handles async errors gracefully

const router = express.Router();

// GET all workouts (Sorted by newest first)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const workouts = await Workout.find().sort({ createdAt: -1 });
    res.json(workouts);
  })
);

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

export default router;