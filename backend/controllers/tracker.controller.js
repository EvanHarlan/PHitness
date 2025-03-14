import Tracker from "../models/tracker.model.js";

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

export const getTrackerCounts = async (req, res) =>
{
    try
    {
        const counts = await Tracker.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: "$type", count: { $sum: "$amount" } } }
        ]);

        const result = { workoutCount: 0, mealCount: 0 };
        counts.forEach(({ _id, count }) =>
        {
            if (_id === "workout") result.workoutCount = count;
            if (_id === "meal") result.mealCount = count;
        });

        res.json(result);
    }
    catch (error)
    {
        console.error("Error counting tracker entries:", error);
        res.status(500).json({ message: "Server error" });
    }
};