import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  briefDescription: { type: String, required: true },
  detailedDescription: { type: String, required: true },
  muscleGroups: [String],
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  estimatedCaloriesBurned: Number,
  difficultyLevel: String,
  youtubeUrl: String
});

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutTitle: { type: String, required: true },
  workoutType: String,
  estimatedCaloriesBurned: Number,
  recommendedFrequency: String,
  exercises: [ExerciseSchema],
  userParameters: {
    height: String,
    weight: Number,
    age: Number,
    gender: String,
    fitnessGoal: String,
    experienceLevel: String,
    equipment: String,
    timeFrame: String
  },
  createdAt: { type: Date, default: Date.now }
});