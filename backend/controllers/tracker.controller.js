import Tracker from "../models/tracker.model.js";
import User from "../models/user.model.js";
import Workout from "../models/workout.model.js";
import MealPlan from "../models/mealPlan.model.js";

// FOR TRACKING ACHIEVEMENT BASED TOTALS

// functionality for adding the meal or workout to the database
export const addTrackerEntry = async (req, res) =>
{
    try
    {
        const { type } = req.body;

        if (!req.user)
        {
            return res.status(401).json({message: "Unauthorized - No user found"})
        }
        if (!["workout", "meal"].includes(type))
        {
            return res.status(400).json({ message: "Invalid tracker type" })
        }

        // update entry in db
        const entry = await Tracker.findOneAndUpdate(
            { user: req.user._id, type },
            { $inc: { amount: 1 } },
            { new: true, upsert: true }
        );

        res.status(201).json(entry);
    }
    catch (error)
    {
        res.status(500).json({ message: "Server error" })
    }
};

// function for obtaining all trackers associated with the user
export const getAllTrackerEntries = async (req, res) =>
{
    try
    {
        const entries = await Tracker.find({ user: req.user._id }).sort({ date: -1 });
        res.json(entries);
    }
    catch (error)
    {
        res.status(500).json({ message: "Server error" })
    }
}

export const getTrackerCounts = async (req, res) => {
    try {
        // Count completed workouts
        const completedWorkouts = await Workout.countDocuments({
            user: req.user._id,
            completed: true
        });

        // Count completed meal plans
        const completedMealPlans = await MealPlan.countDocuments({
            user: req.user._id,
            completed: true
        });

        res.json({
            workoutCount: completedWorkouts,
            mealCount: completedMealPlans
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// logic for updating workout streak
export const updateWorkoutStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const today = new Date();
    const last = user.dailyStreak?.lastLogged ? new Date(user.dailyStreak.lastLogged) : null;

    const isSameDay = last && last.toDateString() === today.toDateString();
    const isYesterday = last && new Date(today.setDate(today.getDate() - 1)).toDateString() === last.toDateString();

    // make sure users can only log a workout once a day
    if (isSameDay) {
      return res.status(200).json({ streak: user.dailyStreak.current, message: "Already logged today" });
    }

    if (isYesterday) {
      user.dailyStreak.current += 1;
    } else {
      user.dailyStreak.current = 1;
    }

    user.dailyStreak.lastLogged = new Date();
    await user.save();

    return res.status(200).json({ streak: user.dailyStreak.current });
  } catch (err) {
    res.status(500).json({ error: "Failed to update streak" });
  }
};