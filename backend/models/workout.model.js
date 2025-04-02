import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
    },
    exercises: {
      type: [
        {
          name: { type: String, required: [true, "Exercise name is required"] },
          sets: {
            type: Number,
            required: [true, "Number of sets is required"],
            min: [1, "Sets must be at least 1"],
          },
          reps: {
            type: Number,
            required: [true, "Number of reps is required"],
            min: [1, "Reps must be at least 1"],
          },
          weight: {
            type: Number,
            default: 0,
            min: [0, "Weight must be at least 0"],
          },
        },
      ],
      default: [], // Ensures an empty array instead of undefined
    },
  },
  { timestamps: true } // Automatically creates createdAt & updatedAt
);

const Workout = mongoose.model("Workout", workoutSchema);
export default Workout;