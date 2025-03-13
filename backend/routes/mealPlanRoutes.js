import express from "express";
import MealPlan from "../models/MealPlan.js";
import asyncHandler from "express-async-handler";
import { generateMealSuggestions } from "../services/openai.service.js";

const router = express.Router();

// GET all meal plans
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const mealPlans = await MealPlan.find().sort({ createdAt: -1 });
    res.json(mealPlans);
  })
);

// GET single meal plan
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }
    res.json(mealPlan);
  })
);

// POST new meal plan
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, meals, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatsGoal } = req.body;

    // Validate required fields
    if (!name || !Array.isArray(meals) || !dailyCalorieGoal) {
      return res.status(400).json({ 
        message: "Please provide name, meals array, and daily calorie goal" 
      });
    }

    // Calculate totals for each meal
    const processedMeals = meals.map(meal => {
      const totals = meal.foods.reduce((acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fats: acc.fats + (food.fats || 0)
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      return {
        ...meal,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFats: totals.fats
      };
    });

    const newMealPlan = new MealPlan({
      name,
      meals: processedMeals,
      dailyCalorieGoal,
      dailyProteinGoal: dailyProteinGoal || 0,
      dailyCarbsGoal: dailyCarbsGoal || 0,
      dailyFatsGoal: dailyFatsGoal || 0
    });

    const savedMealPlan = await newMealPlan.save();
    res.status(201).json(savedMealPlan);
  })
);

// PUT (Update) meal plan
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, meals, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatsGoal } = req.body;

    // Calculate totals for each meal if meals are provided
    let processedMeals;
    if (meals) {
      processedMeals = meals.map(meal => {
        const totals = meal.foods.reduce((acc, food) => ({
          calories: acc.calories + food.calories,
          protein: acc.protein + (food.protein || 0),
          carbs: acc.carbs + (food.carbs || 0),
          fats: acc.fats + (food.fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        return {
          ...meal,
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFats: totals.fats
        };
      });
    }

    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      {
        name,
        meals: processedMeals,
        dailyCalorieGoal,
        dailyProteinGoal,
        dailyCarbsGoal,
        dailyFatsGoal
      },
      { new: true }
    );

    if (!updatedMealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.json(updatedMealPlan);
  })
);

// DELETE meal plan
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    await mealPlan.deleteOne();
    res.json({ message: "Meal plan deleted successfully" });
  })
);

// GET meal plan daily totals
router.get(
  "/:id/totals",
  asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    const dailyTotals = mealPlan.meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fats: acc.fats + meal.totalFats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    res.json({
      ...dailyTotals,
      remainingCalories: mealPlan.dailyCalorieGoal - dailyTotals.calories,
      remainingProtein: mealPlan.dailyProteinGoal - dailyTotals.protein,
      remainingCarbs: mealPlan.dailyCarbsGoal - dailyTotals.carbs,
      remainingFats: mealPlan.dailyFatsGoal - dailyTotals.fats
    });
  })
);

// POST generate AI meal suggestions
router.post(
  "/suggest",
  asyncHandler(async (req, res) => {
    const {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      dietaryRestrictions,
      preferences
    } = req.body;

    // Validate required fields
    if (!targetCalories) {
      return res.status(400).json({
        message: "Daily calorie goal is required for meal suggestions"
      });
    }

    try {
      const suggestions = await generateMealSuggestions({
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
      res.status(500).json({
        message: "Failed to generate meal suggestions",
        error: error.message
      });
    }
  })
);

// POST save AI suggestions as meal plan
router.post(
  "/suggest/save",
  asyncHandler(async (req, res) => {
    const { name, suggestions } = req.body;

    if (!name || !suggestions || !suggestions.meals) {
      return res.status(400).json({
        message: "Name and valid meal suggestions are required"
      });
    }

    const newMealPlan = new MealPlan({
      name,
      meals: suggestions.meals,
      dailyCalorieGoal: suggestions.dailyTotals.calories,
      dailyProteinGoal: suggestions.dailyTotals.protein,
      dailyCarbsGoal: suggestions.dailyTotals.carbs,
      dailyFatsGoal: suggestions.dailyTotals.fats
    });

    const savedMealPlan = await newMealPlan.save();
    res.status(201).json(savedMealPlan);
  })
);

export default router; 