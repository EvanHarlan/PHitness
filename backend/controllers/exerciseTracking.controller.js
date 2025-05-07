import ExerciseTracking from '../models/exerciseTracking.model.js';
import Workout from '../models/workout.model.js';

// THIS PAGE IS USED TO HANDLE ALL FUNCTIONALITY USED IN WORKOUT RELATED API ROUTES

export const trackExercise = async (req, res) => {
  try {
    const { workoutId, exerciseId, weight, reps, timeSpent } = req.body;
    
    if (!workoutId || !exerciseId || !reps || !timeSpent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the exercise exists in the workout
    const workout = await Workout.findOne({
      _id: workoutId,
      'exercises._id': exerciseId
    });

    if (!workout) {
      return res.status(404).json({ error: 'Exercise not found in workout' });
    }

    // Check if tracking already exists for this exercise
    let tracking = await ExerciseTracking.findOne({
      user: req.user._id,
      workoutId,
      exerciseId
    });

    if (tracking) {
      // Update existing tracking
      tracking.weight = weight || 0;
      tracking.reps = reps;
      tracking.timeSpent = timeSpent;
      await tracking.save();
    } else {
      // Create new exercise tracking
      tracking = new ExerciseTracking({
        user: req.user._id,
        workoutId,
        exerciseId,
        weight: weight || 0,
        reps,
        timeSpent
      });
      await tracking.save();
    }

    // Update the exercise in the workout
    const updatedWorkout = await Workout.findOneAndUpdate(
      { 
        _id: workoutId,
        'exercises._id': exerciseId
      },
      { 
        $set: { 
          'exercises.$.weight': weight || 0,
          'exercises.$.reps': reps
        }
      },
      { new: true }
    );

    // Calculate total time spent for all exercises in this workout
    const allExerciseTracking = await ExerciseTracking.find({
      user: req.user._id,
      workoutId
    });

    const totalTimeSpent = allExerciseTracking.reduce((total, tracking) => total + tracking.timeSpent, 0);

    // Update the workout's totalTimeSpent
    await Workout.findByIdAndUpdate(
      workoutId,
      { totalTimeSpent },
      { new: true }
    );

    if (!updatedWorkout) {
      return res.status(500).json({ error: 'Failed to update workout exercise' });
    }
    
    res.status(201).json({
      success: true,
      message: 'Exercise tracked successfully',
      data: {
        tracking,
        workout: updatedWorkout
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const getExerciseHistory = async (req, res) => {
  try {
    const exerciseHistory = await ExerciseTracking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('workoutId', 'name')
      .populate('exerciseId', 'name');

    res.status(200).json({
      success: true,
      data: exerciseHistory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const getWorkoutExerciseHistory = async (req, res) => {
  try {
    const { workoutId } = req.params;
    
    const workoutHistory = await ExerciseTracking.find({
      user: req.user._id,
      workoutId
    })
    .sort({ createdAt: -1 });

    // Get the workout to get exercise names
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Map exercise names to the tracking data
    const historyWithExerciseNames = workoutHistory.map(tracking => {
      const exercise = workout.exercises.find(ex => ex._id.toString() === tracking.exerciseId.toString());
      return {
        ...tracking.toObject(),
        exerciseName: exercise ? exercise.name : 'Unknown Exercise'
      };
    });

    res.status(200).json({
      success: true,
      data: historyWithExerciseNames
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}; 