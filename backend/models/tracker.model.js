import mongoose from "mongoose";

const TrackerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now},
    type: { type: String, enum: ["workout", "meal"], required: true },
    amount: {type: Number, default: 1},
    lastWorkoutGenerationDate: { type: Date }
});

const Tracker = mongoose.model('Tracker', TrackerSchema);

export default Tracker;