import mongoose from 'mongoose';

const weightTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  entryType: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  }
}, {
  timestamps: true
});

// Create a compound index to ensure only one weight entry per day per user
weightTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

const WeightTracking = mongoose.model('WeightTracking', weightTrackingSchema);

export default WeightTracking; 