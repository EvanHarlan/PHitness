import WeightTracking from '../models/weightTracking.model.js';
import { startOfWeek, startOfDay } from 'date-fns';

// Helper function to get the start of the current week
const getCurrentWeekStart = () => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Start week on Monday
  console.log('Current week start details:', {
    rawDate: now,
    weekStart,
    weekStartISO: weekStart.toISOString(),
    weekStartLocal: weekStart.toLocaleString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  return weekStart;
};

/**
 * Weight submission strategy:
 * - Only one weight entry is allowed per user per week
 * - If an entry exists for the same week, it will be updated
 * - This ensures data consistency for charts and statistics
 */
export const submitWeight = async (req, res) => {
  try {
    // Log the incoming request body and user
    console.log("Incoming weight payload:", req.body);
    console.log("Authenticated user:", req.user);

    const { weight, userId, date } = req.body;

    // Input validation
    if (!weight || isNaN(weight)) {
      return res.status(400).json({
        error: 'Invalid weight value',
        details: 'Weight must be a valid number'
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

    // Parse the incoming date and get the start of that week
    const submissionDate = new Date(date);
    const submissionWeekStart = startOfWeek(submissionDate, { weekStartsOn: 1 });
    
    console.log('Submission date details:', {
      rawInput: date,
      parsedDate: submissionDate,
      parsedDateISO: submissionDate.toISOString(),
      parsedDateLocal: submissionDate.toLocaleString(),
      weekStart: submissionWeekStart,
      weekStartISO: submissionWeekStart.toISOString(),
      weekStartLocal: submissionWeekStart.toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Get the start of the current week for comparison
    const currentWeekStart = getCurrentWeekStart();
    
    console.log('Date comparison details:', {
      submissionWeekStart: {
        timestamp: submissionWeekStart.getTime(),
        date: submissionWeekStart.toISOString()
      },
      currentWeekStart: {
        timestamp: currentWeekStart.getTime(),
        date: currentWeekStart.toISOString()
      },
      difference: submissionWeekStart.getTime() - currentWeekStart.getTime(),
      isSameWeek: submissionWeekStart.getTime() === currentWeekStart.getTime()
    });

    // Check if the submission date is in the current week
    if (submissionWeekStart.getTime() !== currentWeekStart.getTime()) {
      console.log('Date mismatch detected:', {
        submissionWeekStart,
        currentWeekStart,
        difference: submissionWeekStart.getTime() - currentWeekStart.getTime()
      });
      return res.status(400).json({
        error: 'Invalid submission date',
        details: 'Weight entries must be submitted for the current week',
        submissionWeekStart: submissionWeekStart.toISOString(),
        currentWeekStart: currentWeekStart.toISOString()
      });
    }

    // Check for existing entry
    const existingEntry = await WeightTracking.findOne({
      user: targetUserId,
      date: submissionWeekStart
    });

    let weightEntry;
    if (existingEntry) {
      console.log("Found existing weekly entry:", existingEntry);
      
      // Update existing entry
      existingEntry.weight = weightValue;
      existingEntry.entryType = 'weekly';
      weightEntry = await existingEntry.save();
      
      console.log("🟢 Weight entry updated:", weightEntry);
      
      return res.json({
        success: true,
        message: 'Updated your weight entry for this week',
        weightEntry,
        isUpdate: true
      });
    }

    // Create new weight entry
    console.log("Creating new weekly entry for date:", submissionWeekStart);
    weightEntry = new WeightTracking({
      user: targetUserId,
      weight: weightValue,
      date: submissionWeekStart,
      entryType: 'weekly'
    });

    await weightEntry.save();
    console.log("🟢 Weight entry saved:", weightEntry);

    res.json({
      success: true,
      message: 'Created new weight entry for this week',
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
        details: 'A weight entry already exists for this week'
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
      date: weekStartDate
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