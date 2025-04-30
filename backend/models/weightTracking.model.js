import mongoose from 'mongoose';
import { startOfWeek } from 'date-fns';

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
    max: [1000, 'Weight cannot exceed 1000 lbs'],
    set: v => Math.round(v * 100) / 100 // Round to 2 decimal places
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index to ensure only one weight entry per week per user
weightTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

// Pre-save middleware to set date to start of week
weightTrackingSchema.pre('save', function(next) {
  if (this.isModified('date')) {
    this.date = startOfWeek(this.date, { weekStartsOn: 1 }); // Start week on Monday
  }
  next();
});

// Virtual field for weight change from previous week
weightTrackingSchema.virtual('weightChange').get(async function() {
  const previousEntry = await this.constructor.findOne({
    user: this.user,
    date: { $lt: this.date }
  }).sort({ date: -1 });
  
  if (!previousEntry) return null;
  return this.weight - previousEntry.weight;
});

// Static method to get weight history
weightTrackingSchema.statics.getWeightHistory = async function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

const WeightTracking = mongoose.model('WeightTracking', weightTrackingSchema);

export default WeightTracking; 
