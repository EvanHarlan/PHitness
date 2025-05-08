import asyncHandler from 'express-async-handler';
import { generateMealPlanWithGPT } from '../lib/openai.service.js'; // used to prompt the openai api and generate a meal plan
import { calculateMacroLimits, getMacroRatio } from '../lib/macroHelpers.js';
import MealPlan from '../models/mealPlan.model.js';
import Tracker from '../models/tracker.model.js';

// function for getting meal plans associated with a user
export const getUserMealPlans = asyncHandler(async (req, res) => {
    const filter = { user: req.user._id };
    
    // Handle favorite filter
    if (req.query.favoritesOnly === 'true') {
        filter.isFavorite = true;
    }
    
    // Handle completed filter
    if (req.query.completedOnly === 'true') {
        filter.completed = true;
    }
    
    const mealPlans = await MealPlan.find(filter).sort({ createdAt: -1 });
    res.json(mealPlans);
});

// function for getting individual meal plans by its ID
export const getMealPlanById = asyncHandler(async (req, res) => {
        const mealPlan = await MealPlan.findById(req.params.id);
        if (!mealPlan) {
            res.status(404);
            throw new Error('Meal plan not found');
        }
        if (mealPlan.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to access this meal plan');
     }
        res.json(mealPlan);
});

// function for adding a meal plan to favorites
export const toggleFavoriteMealPlan = asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan) {
        res.status(404);
        throw new Error('Meal plan not found');
    }
    if (mealPlan.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to modify this meal plan');
    }
    mealPlan.isFavorite = !mealPlan.isFavorite;
    const updatedMealPlan = await mealPlan.save();
    res.json(updatedMealPlan);
});

// function for handling the deletion of a meal plan
export const deleteMealPlan = asyncHandler(async (req, res) => {
        const mealPlan = await MealPlan.findById(req.params.id);
        if (!mealPlan) {
            res.status(404);
            throw new Error('Meal plan not found');
        }
        if (mealPlan.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this meal plan');
        }
        await mealPlan.deleteOne();
        res.json({ message: 'Meal plan removed' });
});

// Function to calculate target calories
const calculateTargetCalories = (userData) => {
    const { weight, height, age, gender, activityLevel, goal } = userData;

     // Convert weight to kg and height to cm
     const weightKg = weight * 0.453592;
     const heightCm = parseFloat(height.split("'")[0]) * 30.48 + parseFloat(height.split("'")[1].replace('"', '')) * 2.54;

     // Calculate BMR
let bmr;
if (gender === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
} else if (gender === 'female') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
} else {
         // Default to male calculation if gender is other or not specified
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
}

// Adjust for activity level
let activityMultiplier;
switch (activityLevel) {
    case 'sedentary':
        activityMultiplier = 1.2; // baseline activity level
    break;
    case 'lightly-active':
        activityMultiplier = 1.375;
    break;
    case 'moderately-active':
        activityMultiplier = 1.55;
    break;
    case 'very-active':
        activityMultiplier = 1.725;
    break;
    case 'extra-active':
        activityMultiplier = 1.9;
    break;
    default:
        activityMultiplier = 1.2; // Default
}

let targetCalories = bmr * activityMultiplier;

 // Adjust for goal
 switch (goal) {
    case 'weight-loss':
        targetCalories *= 0.85; // Reduce by 15% for weight loss
    break;
    case 'muscle-gain':
        targetCalories *= 1.1; // Increase by 10% for muscle gain
    break;
    case 'weight-gain':
        targetCalories *= 1.2; // Increast by 29% for weight-gain
    default:
    break;
 }

return Math.round(targetCalories);
};

// Helper function to generate a descriptive title for the meal plan
const generateMealPlanTitle = (userData) => {
  const { goal, activityLevel, dietaryRestrictions } = userData;
  
  // Map goals to descriptive titles
  const goalTitles = {
    'weight-loss': 'Weight Loss',
    'weight-gain': 'Weight Gain',
    'muscle-gain': 'Muscle Gain',
    'healthy-eating': 'Healthy Eating',
    'increase-energy': 'Energy Boost',
    'improve-performance': 'Performance',
    'reduce-stress': 'Stress Reduction',
    'better-sleep': 'Better Sleep',
    'gut-health': 'Gut Health'
  };

  // Map activity levels to descriptive terms
  const activityLevels = {
    'sedentary': 'Sedentary',
    'lightly-active': 'Lightly Active',
    'moderately-active': 'Moderately Active',
    'very-active': 'Very Active',
    'extra-active': 'Extra Active'
  };

  // Start with the goal-based title
  let title = `${goalTitles[goal] || 'Custom'} Meal Plan`;

  // Add activity level if it's not moderate
  if (activityLevel && activityLevel !== 'moderately-active') {
    title += ` for ${activityLevels[activityLevel] || activityLevel} Lifestyle`;
  }

  // Add dietary restrictions if any
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    const restrictions = dietaryRestrictions.join(', ');
    title += ` (${restrictions})`;
  }

  return title;
};

// functionality for generating the meal plan
export const generateMealPlan = asyncHandler(async (req, res) => {
    try {
        // Check if user has already generated a meal plan today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check the tracker for last generation
        const tracker = await Tracker.findOne({ 
            user: req.user._id,
            type: 'meal-plan'
        });

        if (tracker) {
            const lastGenDate = new Date(tracker.lastGenerationDate);
            const isToday = lastGenDate.toDateString() === today.toDateString();
            
            if (isToday) {
                return res.status(429).json({ 
                    success: false,
                    error: "You can only generate one meal plan per day. Please try again tomorrow.",
                    lastGenerationDate: tracker.lastGenerationDate
                });
            }
        }

        // --- Start Validation ---
        const requiredFields = [
            'goal', 'weight', 'height', 'age', 'gender', 'activityLevel'
        ];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
        }
        // normalized parameters to send to openai
        const normalizedBody = {
            goal: req.body.goal,
            weight: Number(req.body.weight),
            height: req.body.height,
            age: Number(req.body.age),
            gender: req.body.gender,
            activityLevel: req.body.activityLevel,
            dietaryRestrictions: Array.isArray(req.body.dietaryRestrictions)
                ? req.body.dietaryRestrictions
                : [req.body.dietaryRestrictions].filter(Boolean),
            healthConditions: Array.isArray(req.body.healthConditions)
                ? req.body.healthConditions
                : [req.body.healthConditions].filter(Boolean),
            preferences: req.body.preferences,
            mealFrequency: req.body.mealFrequency,
            snackPreference: req.body.snackPreference,
            dailyWaterIntake: req.body.hydrationPreference,
            cookingSkillLevel: req.body.cookingSkill,
            mealPrepTime: req.body.mealPrepTime,
            groceryBudget: req.body.groceryBudget,
        };

        // Generate a descriptive title
        const title = generateMealPlanTitle(normalizedBody);

        // Calculate target calories
        try {
            normalizedBody.targetCalories = calculateTargetCalories(normalizedBody);
        } catch (calorieError) {
            return res.status(400).json({ message: `Failed to calculate target calories: ${calorieError.message}` });
        }

        // Set initial macro targets
        const macroRatios = getMacroRatio(normalizedBody.goal);
        normalizedBody.targetProtein = Math.round((normalizedBody.targetCalories * macroRatios.protein) / 4); // Protein: 4 calories per gram
        normalizedBody.targetCarbs = Math.round((normalizedBody.targetCalories * macroRatios.carbs) / 4);   // Carbs: 4 calories per gram
        normalizedBody.targetFats = Math.round((normalizedBody.targetCalories * macroRatios.fats) / 9);       // Fats: 9 calories per gram

        const numericFields = ['weight', 'age', 'targetCalories', 'targetProtein', 'targetCarbs', 'targetFats'];
        const invalidNumeric = numericFields.filter(field => {
            const value = normalizedBody[field];
            return !Number.isFinite(value) || value <= 0;
        });
        if (invalidNumeric.length > 0) {
            return res.status(400).json({ message: `Invalid or non-positive numeric values for: ${invalidNumeric.join(', ')}` });
        }

        let macroLimits;
        try {
            macroLimits = calculateMacroLimits(normalizedBody);
        } catch (helperError) {
            return res.status(400).json({ message: `Failed to calculate macros: ${helperError.message}` });
        }

        let generatedPlanData;
        let newPlan;
        try {
            // Generate meal plan with GPT
            generatedPlanData = await generateMealPlanWithGPT(normalizedBody);

            // check to make sure the meals array is populated
            if (!generatedPlanData || !Array.isArray(generatedPlanData.meals) || generatedPlanData.meals.length === 0) {
                return res.status(502).json({ message: 'AI service failed to generate a valid meal plan structure (missing meals).' });
            }

            

            // Calculate total nutrition from the generated meals
            let totalNutrition = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            generatedPlanData.meals.forEach(meal => {
                totalNutrition.calories += meal.calories;
                totalNutrition.protein += meal.protein;
                totalNutrition.carbs += meal.carbs;
                totalNutrition.fats += meal.fats;
            });

            ({
                mealsCount: generatedPlanData.meals.length,
                totalCalories: totalNutrition.calories,
                totalProtein: totalNutrition.protein,
                totalCarbs: totalNutrition.carbs,
                totalFats: totalNutrition.fats
            });

            // SAVE THE GENERATED PLAN TO MONGODB
            newPlan = await MealPlan.create({
                user: req.user._id,
                title: title,
                meals: generatedPlanData.meals,
                totalNutrition: totalNutrition,
                isFavorite: false,
            });

            // Update or create tracker
            const now = new Date();
            if (tracker) {
                tracker.lastGenerationDate = now;
                await tracker.save();
            } else {
                await Tracker.create({
                    user: req.user._id,
                    type: 'meal-plan',
                    lastGenerationDate: now,
                    date: now
                });
            }


            // Send the newly SAVED plan back to the client
            res.status(201).json({ 
                mealPlan: newPlan,
                lastGenerationDate: now
            });

        } catch (gptOrDbError) {
            if (gptOrDbError.message.includes("Missing required parameters")) {
                return res.status(500).json({ message: "Internal configuration error: Service is missing required parameters.", details: gptOrDbError.message });
            }
            if (gptOrDbError.name === 'ValidationError') {
                return res.status(400).json({ message: "Failed to save meal plan due to invalid data.", errors: gptOrDbError.errors });
            }
            throw gptOrDbError;
        }

    } catch (error) {
        // Catch errors from validation, helper calls, or re-thrown from inner block
        const statusCode = error.status || (error.name === 'ValidationError' ? 400 : 500); // Determine status code
        res.status(statusCode).json({
            message: error.message || "Failed to generate meal plan due to an internal server error.",
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
            details: error.details // Pass along any details attached to the error
        });
    }
});

// function for saving a meal plan after generation
export const saveMealPlan = asyncHandler(async (req, res) => {
try {
     // validate meal plan array
     if (!req.body.meals || !Array.isArray(req.body.meals) || req.body.meals.length === 0) {
         return res.status(400).json({ message: "Valid meals array is required" });
     }
     if (!req.body.totalNutrition || typeof req.body.totalNutrition !== 'object') {
         return res.status(400).json({ message: "Total nutrition object is required" });
     }

    const newPlan = await MealPlan.create({
     user: req.user._id,
    meals: req.body.meals,
    totalNutrition: req.body.totalNutrition,
    isFavorite: req.body.isFavorite === true
     });


    res.status(201).json({
     message: "Meal plan saved successfully (explicit save)",
     savedPlan: newPlan
     });

 } catch (error) {

    const statusCode = error.name === 'ValidationError' ? 400 : 500;
     res.status(statusCode).json({
        message: "Failed to save meal plan",
        error: error.message,
         ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
         validationErrors: error.errors
     });
 }
});

// function for marking a meal as complete
export const completeMeal = asyncHandler(async (req, res) => {
  const { mealPlanId, mealIndex } = req.params;

  const mealPlan = await MealPlan.findById(mealPlanId);
  if (!mealPlan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }

  if (mealPlan.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to modify this meal plan');
  }

  if (mealIndex < 0 || mealIndex >= mealPlan.meals.length) {
    res.status(400);
    throw new Error('Invalid meal index');
  }

  // Mark the meal as completed
  mealPlan.meals[mealIndex].completed = true;
  await mealPlan.save();

  res.status(200).json(mealPlan);
});

// functionality for completing an entire meal plan (all meals within the plan)
export const completeMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    if (mealPlan.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    mealPlan.completed = true;
    mealPlan.completedAt = new Date();
    await mealPlan.save();

    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};