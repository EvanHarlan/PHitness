import mongoose from 'mongoose';

const weightTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: [0, 'Weight cannot be negative'],
    max: [1000, 'Weight cannot exceed 1000 lbs']
  },
  date: {
    type: Date,
    required: true
  },
  entryType: {
    type: String,
    enum: ['weekly'],
    default: 'weekly'
  }
}, {
  timestamps: true
});

// Create a compound index to ensure only one weight entry per week per user
weightTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

const WeightTracking = mongoose.model('WeightTracking', weightTrackingSchema);

export default WeightTracking; 