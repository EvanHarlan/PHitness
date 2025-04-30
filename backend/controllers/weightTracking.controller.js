import WeightTracking from '../models/weightTracking.model.js';
import { startOfWeek, startOfDay, isSameDay } from 'date-fns';

// Helper function to get the start of the current week
const getCurrentWeekStart = () => {
  return startOfWeek(new Date(), { weekStartsOn: 1 }); // Start week on Monday
};

/**
 * Weight submission strategy:
 * - Only one weight entry is allowed per user per day/week
 * - If an entry exists for the same date, it will be updated
 * - This ensures data consistency for charts and statistics
 */
export const submitWeight = async (req, res) => {
  try {
    // Log the incoming request body
    console.log("➡️ Incoming body:", req.body);

    // Log the incoming request body and user
    console.log("Incoming weight payload:", req.body);
    console.log("Authenticated user:", req.user);

    const { weight, entryType = 'daily', userId } = req.body;

    // Input validation
    if (!weight || isNaN(weight)) {
      return res.status(400).json({
        error: 'Invalid weight value',
        details: 'Weight must be a valid number'
      });
    }

    if (!['daily', 'weekly'].includes(entryType)) {
      return res.status(400).json({
        error: 'Invalid entry type',
        details: 'Entry type must be either "daily" or "weekly"'
      });
    }

    // Convert weight to number and validate range
    const weightValue = Number(weight);
    if (weightValue <= 0 || weightValue > 1000) {
      return res.status(400).json({
        error: 'Invalid weight value',
        details: 'Weight must be between 0 and 1000 lbs'
      });
    }

    // Use the userId from the request body or fall back to the authenticated user
    const targetUserId = userId || req.user._id;
    if (!targetUserId) {
      return res.status(400).json({
        error: 'Missing user ID',
        details: 'User ID is required for weight submission'
      });
    }

    // Determine the date for the entry
    const date = entryType === 'weekly' ? getCurrentWeekStart() : startOfDay(new Date());
    console.log(`Looking for existing ${entryType} entry for date:`, date);

    // Check for existing entry
    const existingEntry = await WeightTracking.findOne({
      user: targetUserId,
      date
    });

    let weightEntry;
    if (existingEntry) {
      console.log(`Found existing ${entryType} entry:`, existingEntry);
      
      // Update existing entry
      existingEntry.weight = weightValue;
      existingEntry.entryType = entryType;
      weightEntry = await existingEntry.save();
      
      console.log("🟢 Weight entry updated:", weightEntry);
      
      return res.json({
        success: true,
        message: `Updated your weight entry for ${entryType === 'weekly' ? 'this week' : 'today'}`,
        weightEntry,
        isUpdate: true
      });
    }

    // Create new weight entry
    console.log(`Creating new ${entryType} entry for date:`, date);
    weightEntry = new WeightTracking({
      user: targetUserId,
      weight: weightValue,
      date,
      entryType
    });

    await weightEntry.save();
    console.log("🟢 Weight entry saved:", weightEntry);

    res.json({
      success: true,
      message: `Created new weight entry for ${entryType === 'weekly' ? 'this week' : 'today'}`,
      weightEntry,
      isUpdate: false
    });
  } catch (error) {
    console.error('Error submitting weight:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.message,
        fields: error.errors
      });
    }

    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        error: 'Duplicate Entry',
        details: 'A weight entry already exists for this date'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to submit weight',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getWeightHistory = async (req, res) => {
  try {
    const weightHistory = await WeightTracking.find({
      user: req.user._id
    }).sort({ date: 1 });

    res.json(weightHistory);
  } catch (error) {
    console.error('Error fetching weight history:', error);
    res.status(500).json({
      error: 'Failed to fetch weight history'
    });
  }
};

export const checkWeeklyWeightStatus = async (req, res) => {
  try {
    const weekStartDate = getCurrentWeekStart();
    
    const weightEntry = await WeightTracking.findOne({
      user: req.user._id,
      date: weekStartDate,
      entryType: 'weekly'
    });

    res.json({
      hasSubmittedWeight: !!weightEntry,
      currentWeekStart: weekStartDate
    });
  } catch (error) {
    console.error('Error checking weekly weight status:', error);
    res.status(500).json({
      error: 'Failed to check weekly weight status'
    });
  }
}; 