import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  meals: [{
    name: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fats: {
      type: Number,
      required: true
    },
    ingredients: [{
      type: String,
      required: true
    }],
    instructions: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  totalNutrition: {
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fats: {
      type: Number,
      required: true
    }
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan; 