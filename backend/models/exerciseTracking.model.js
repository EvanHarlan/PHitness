import mongoose from 'mongoose';

const exerciseTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  weight: {
    type: Number,
    default: 0
  },
  reps: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in minutes
    required: true
  }
}, {
  timestamps: true
});

const ExerciseTracking = mongoose.model('ExerciseTracking', exerciseTrackingSchema);

export default ExerciseTracking; 