import Tracker from "../models/tracker.model.js";
import User from "../models/user.model.js";
import Workout from "../models/workout.model.js";
import MealPlan from "../models/mealPlan.model.js";

export const addTrackerEntry = async (req, res) =>
{
    try
    {
        const { type } = req.body;
        console.log("Received API Request:", req.body);

        if (!req.user)
        {
            console.log("Unauthorized - No user found");
            return res.status(401).json({message: "Unauthorized - No user found"})
        }
        if (!["workout", "meal"].includes(type))
        {
            return res.status(400).json({ message: "Invalid tracker type" })
        }

        console.log("User making request:", req.user);

        const entry = await Tracker.findOneAndUpdate(
            { user: req.user._id, type },
            { $inc: { amount: 1 } },
            { new: true, upsert: true }
        );

        console.log("Tracker Entry Added:", entry);
        res.status(201).json(entry);
    }
    catch (error)
    {
        console.error("Error adding tracker entry:", error);
        res.status(500).json({ message: "Server error" })
    }
};

export const getAllTrackerEntries = async (req, res) =>
{
    try
    {
        const entries = await Tracker.find({ user: req.user._id }).sort({ date: -1 });
        res.json(entries);
    }
    catch (error)
    {
        console.error("Error fetching tracker entry:", error);
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
        console.error("Error counting tracker entries:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateWorkoutStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const today = new Date();
    const last = user.dailyStreak?.lastLogged ? new Date(user.dailyStreak.lastLogged) : null;

    const isSameDay = last && last.toDateString() === today.toDateString();
    const isYesterday = last && new Date(today.setDate(today.getDate() - 1)).toDateString() === last.toDateString();

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
    console.error("Error updating workout streak:", err);
    res.status(500).json({ error: "Failed to update streak" });
  }
};