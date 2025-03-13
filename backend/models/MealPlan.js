import mongoose from "mongoose";

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
    meals: {
      type: [
        {
          name: { 
            type: String, 
            required: [true, "Meal name is required"] 
          },
          time: { 
            type: String, 
            required: [true, "Meal time is required"] 
          },
          foods: [
            {
              name: { 
                type: String, 
                required: [true, "Food name is required"] 
              },
              portion: { 
                type: Number, 
                required: [true, "Portion size is required"],
                min: [0, "Portion size must be positive"] 
              },
              unit: { 
                type: String, 
                required: [true, "Portion unit is required"] 
              },
              calories: { 
                type: Number, 
                required: [true, "Calories are required"],
                min: [0, "Calories must be positive"] 
              },
              protein: { 
                type: Number, 
                default: 0,
                min: [0, "Protein must be positive"] 
              },
              carbs: { 
                type: Number, 
                default: 0,
                min: [0, "Carbs must be positive"] 
              },
              fats: { 
                type: Number, 
                default: 0,
                min: [0, "Fats must be positive"] 
              }
            }
          ],
          totalCalories: {
            type: Number,
            default: 0
          },
          totalProtein: {
            type: Number,
            default: 0
          },
          totalCarbs: {
            type: Number,
            default: 0
          },
          totalFats: {
            type: Number,
            default: 0
          }
        }
      ],
      default: [],
    },
    dailyCalorieGoal: {
      type: Number,
      required: [true, "Daily calorie goal is required"],
      min: [0, "Daily calorie goal must be positive"]
    },
    dailyProteinGoal: {
      type: Number,
      default: 0,
      min: [0, "Daily protein goal must be positive"]
    },
    dailyCarbsGoal: {
      type: Number,
      default: 0,
      min: [0, "Daily carbs goal must be positive"]
    },
    dailyFatsGoal: {
      type: Number,
      default: 0,
      min: [0, "Daily fats goal must be positive"]
    }
  },
  { 
    timestamps: true 
  }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
export default MealPlan; 