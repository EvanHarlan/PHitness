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
    favorite: {
      type: Boolean,
      default: false,
    },
    exercises: {
      type: [
        {
          name: {
            type: String,
            required: [true, "Exercise name is required"]
          },
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
          description: {
            type: String,
            default: ""
          },
          targetMuscles: {
            type: String,
            default: ""
          },
          videoKeywords: {
            type: String,
            default: ""
          }
        },
      ],
      default: [],
    },
    difficulty: {
      type: String,
      default: "3"
    },
    estimatedCalories: {
      type: String,
      default: ""
    },
    restPeriods: {
      type: String,
      default: "60-90 seconds between sets"
    },
    notes: {
      type: String,
      default: ""
    },
    progression: {
      type: String,
      default: ""
    },
    alternatives: {
      beginner: {
        type: String,
        default: ""
      },
      advanced: {
        type: String,
        default: ""
      }
    }
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;