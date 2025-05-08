import WeightTracking from '../models/weightTracking.model.js';
import { startOfWeek, startOfDay, addWeeks, isBefore } from 'date-fns';

// Helper function to get the start of the current week
const getCurrentWeekStart = () => {
  return startOfWeek(new Date(), { weekStartsOn: 1 }); // Start week on Monday
};

// Helper function to check if a date is more than a week old
const isMoreThanWeekOld = (date) => {
  const oneWeekAgo = addWeeks(getCurrentWeekStart(), -1);
  return isBefore(date, oneWeekAgo);
};

// functionality for handling weight submission details
export const submitWeight = async (req, res) => {
  try {
    const { weight, userId } = req.body;
    const targetUserId = userId || req.user._id;

    if (!targetUserId) {
      return res.status(400).json({
        error: 'Missing user ID',
        details: 'User ID is required for weight submission'
      });
    }

    // Validate weight
    const weightValue = Number(weight);
    if (!weightValue || weightValue <= 0 || weightValue > 1000) {
      return res.status(400).json({
        error: 'Invalid weight value',
        details: 'Weight must be between 0 and 1000 lbs'
      });
    }

    // Get the start of the current week
    const currentWeekStart = getCurrentWeekStart();

    // Check for existing entry this week
    const existingEntry = await WeightTracking.findOne({
      user: targetUserId,
      date: currentWeekStart
    });

    let weightEntry;
    if (existingEntry) {
      // Update existing entry
      existingEntry.weight = weightValue;
      weightEntry = await existingEntry.save();
    } else {
      // Create new entry
      weightEntry = await WeightTracking.create({
        user: targetUserId,
        weight: weightValue,
        date: currentWeekStart,
        entryType: 'weekly'
      });
    }

    res.json({
      success: true,
      isUpdate: !!existingEntry,
      weight: weightEntry.weight,
      date: weightEntry.date
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to submit weight',
      details: error.message
    });
  }
};

// check last entry weekly (start of each week - monday)
export const checkWeeklyWeightStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentWeekStart = getCurrentWeekStart();

    // Find the most recent weight entry
    const lastEntry = await WeightTracking.findOne({ user: userId })
      .sort({ date: -1 });

    if (!lastEntry) {
      return res.json({
        hasSubmittedWeight: false,
        needsWeight: true,
        lastEntry: null,
        nextCheckDate: currentWeekStart
      });
    }

    // Check if the last entry is from this week
    const isThisWeek = lastEntry.date.getTime() === currentWeekStart.getTime();
    const isOldEntry = isMoreThanWeekOld(lastEntry.date);

    res.json({
      hasSubmittedWeight: isThisWeek,
      needsWeight: !isThisWeek && isOldEntry,
      lastEntry: {
        weight: lastEntry.weight,
        date: lastEntry.date
      },
      nextCheckDate: addWeeks(lastEntry.date, 1)
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to check weight status',
      details: error.message
    });
  }
};

// funcitonality for obtaining previous weeks weight history
export const getWeightHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const query = { user: userId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const weightHistory = await WeightTracking.find(query)
      .sort({ date: 1 });

    res.json(weightHistory);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch weight history',
      details: error.message
    });
  }
}; 
