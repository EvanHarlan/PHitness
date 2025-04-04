import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Meal plan name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    meals: {
      type: [
        {
          day: {
            type: String,
            required: [true, "Day is required"],
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          },
          mealType: {
            type: String,
            required: [true, "Meal type is required"],
            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
          },
          name: {
            type: String,
            required: [true, "Meal name is required"],
            trim: true
          },
          ingredients: {
            type: [
              {
                name: {
                  type: String,
                  required: [true, "Ingredient name is required"],
                  trim: true
                },
                amount: {
                  type: Number,
                  required: [true, "Ingredient amount is required"],
                  min: [0, "Amount must be positive"]
                },
                unit: {
                  type: String,
                  required: [true, "Unit is required"],
                  trim: true
                }
              }
            ],
            default: []
          },
          calories: {
            type: Number,
            required: [true, "Calories are required"],
            min: [0, "Calories must be positive"]
          },
          protein: {
            type: Number,
            required: [true, "Protein is required"],
            min: [0, "Protein must be positive"]
          },
          carbs: {
            type: Number,
            required: [true, "Carbs are required"],
            min: [0, "Carbs must be positive"]
          },
          fat: {
            type: Number,
            required: [true, "Fat is required"],
            min: [0, "Fat must be positive"]
          }
        }
      ],
      default: []
    },
    dailyCalorieGoal: {
      type: Number,
      required: [true, "Daily calorie goal is required"],
      min: [0, "Daily calorie goal must be positive"]
    },
    dailyProteinGoal: {
      type: Number,
      required: [true, "Daily protein goal is required"],
      min: [0, "Daily protein goal must be positive"]
    },
    dailyCarbsGoal: {
      type: Number,
      required: [true, "Daily carbs goal is required"],
      min: [0, "Daily carbs goal must be positive"]
    },
    dailyFatsGoal: {
      type: Number,
      required: [true, "Daily fats goal is required"],
      min: [0, "Daily fats goal must be positive"]
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function(value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    }
  },
  { timestamps: true }
);

// Add index for faster queries
mealPlanSchema.index({ user: 1, createdAt: -1 });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;