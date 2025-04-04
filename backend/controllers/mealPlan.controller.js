import MealPlan from '../models/mealPlan.model.js';
import { generateMealSuggestions as generateAIMealSuggestions } from '../services/openai.service.js';

// @desc    Create a new meal plan
// @route   POST /api/meal-plans
// @access  Private
export const createMealPlan = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      meals, 
      dailyCalorieGoal, 
      dailyProteinGoal, 
      dailyCarbsGoal, 
      dailyFatsGoal,
      startDate, 
      endDate 
    } = req.body;

    // Validate daily goals
    if (dailyCalorieGoal <= 0 || dailyProteinGoal <= 0 || dailyCarbsGoal <= 0 || dailyFatsGoal <= 0) {
      return res.status(400).json({ message: 'Daily goals must be positive numbers' });
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const mealPlan = await MealPlan.create({
      user: req.user._id,
      name,
      description,
      meals,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatsGoal,
      startDate,
      endDate
    });

    res.status(201).json(mealPlan);
  } catch (error) {
    console.error('Error creating meal plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all meal plans for the user
// @route   GET /api/meal-plans
// @access  Private
export const getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single meal plan
// @route   GET /api/meal-plans/:id
// @access  Private
export const getMealPlanById = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Check if the meal plan belongs to the user
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to access this meal plan' });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private
export const updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Check if the meal plan belongs to the user
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this meal plan' });
    }

    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedMealPlan);
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private
export const deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Check if the meal plan belongs to the user
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this meal plan' });
    }

    await mealPlan.deleteOne();
    res.status(200).json({ message: 'Meal plan removed' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get daily totals for a meal plan
// @route   GET /api/meal-plans/:id/totals
// @access  Private
export const getMealPlanTotals = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Check if the meal plan belongs to the user
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to access this meal plan' });
    }

    const dailyTotals = mealPlan.meals.reduce((acc, meal) => {
      if (!acc[meal.day]) {
        acc[meal.day] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
      }
      acc[meal.day].calories += meal.calories;
      acc[meal.day].protein += meal.protein;
      acc[meal.day].carbs += meal.carbs;
      acc[meal.day].fat += meal.fat;
      return acc;
    }, {});

    res.status(200).json({
      dailyTotals,
      goals: {
        calories: mealPlan.dailyCalorieGoal,
        protein: mealPlan.dailyProteinGoal,
        carbs: mealPlan.dailyCarbsGoal,
        fat: mealPlan.dailyFatsGoal
      }
    });
  } catch (error) {
    console.error('Error calculating meal plan totals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate meal suggestions using AI
// @route   POST /api/meal-plans/suggest
// @access  Private
export const generateMealSuggestions = async (req, res) => {
  try {
    const {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      dietaryRestrictions,
      preferences
    } = req.body;

    const suggestions = await generateAIMealSuggestions({
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      dietaryRestrictions,
      preferences
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    res.status(500).json({ message: 'Error generating meal suggestions' });
  }
};

// @desc    Save AI suggestions as a meal plan
// @route   POST /api/meal-plans/suggest/save
// @access  Private
export const saveAISuggestions = async (req, res) => {
  try {
    const { name, suggestions, startDate, endDate } = req.body;

    if (!suggestions || !suggestions.meals) {
      return res.status(400).json({ message: 'Invalid suggestions format' });
    }

    const mealPlan = await MealPlan.create({
      user: req.user._id,
      name,
      meals: suggestions.meals,
      dailyCalorieGoal: suggestions.dailyTotals.calories,
      dailyProteinGoal: suggestions.dailyTotals.protein,
      dailyCarbsGoal: suggestions.dailyTotals.carbs,
      dailyFatsGoal: suggestions.dailyTotals.fat,
      startDate,
      endDate
    });

    res.status(201).json(mealPlan);
  } catch (error) {
    console.error('Error saving AI suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 