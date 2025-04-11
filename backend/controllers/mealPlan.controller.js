import asyncHandler from 'express-async-handler';
import { generateMealPlanWithGPT } from '../lib/openai.service.js';
import { calculateMacroLimits, getMacroRatio } from '../lib/macroHelpers.js';
import { rotateMealType } from '../lib/mealHelpers.js';
import crypto from 'crypto';
import MealPlan from '../models/mealPlan.model.js';

// Simple in-memory cache for last generated meal plans
const lastPlanCache = new Map();

// Helper to generate a hash of a meal plan
const hashMealPlan = (mealPlan) => {
  const mealSignatures = mealPlan.meals.map(m => 
    `${m.type}-${m.prepStyle}-${m.protein}-${m.carbs}-${m.fats}`
  ).join('|');
  
  return crypto.createHash('md5').update(mealSignatures).digest('hex');
};

// @desc    Generate a new meal plan
// @route   POST /api/meal-plans/generate
// @access  Private
export const generateMealPlan = asyncHandler(async (req, res) => {
  try {
    // Log the full incoming payload
    console.log("📦 Received meal plan request payload:", {
      body: req.body,
      user: req.user?._id || 'anonymous'
    });

    // Validate required fields
    const requiredFields = [
      'goal',
      'targetCalories',
      'targetProtein',
      'targetCarbs',
      'targetFats',
      'weight',
      'height',
      'age',
      'gender',
      'activityLevel'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      const rejectionLog = {
        reason: "Missing required fields",
        missing: missingFields,
        received: Object.keys(req.body),
        timestamp: new Date().toISOString()
      };
      console.error("❌ Request rejected:", rejectionLog);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: rejectionLog
      });
    }

    // Normalize arrays and validate types
    const normalizedBody = {
      ...req.body,
      dietaryRestrictions: Array.isArray(req.body.dietaryRestrictions) 
        ? req.body.dietaryRestrictions 
        : [req.body.dietaryRestrictions].filter(Boolean),
      healthConditions: Array.isArray(req.body.healthConditions)
        ? req.body.healthConditions
        : [req.body.healthConditions].filter(Boolean)
    };

    // Validate numeric values
    const numericFields = ['targetCalories', 'targetProtein', 'targetCarbs', 'targetFats', 'weight', 'age'];
    const invalidNumeric = numericFields.filter(field => {
      const value = Number(normalizedBody[field]);
      return !Number.isFinite(value) || value <= 0;
    });

    if (invalidNumeric.length > 0) {
      const rejectionLog = {
        reason: "Invalid numeric values",
        fields: invalidNumeric,
        values: invalidNumeric.map(field => ({
          field,
          value: normalizedBody[field],
          parsed: Number(normalizedBody[field])
        })),
        timestamp: new Date().toISOString()
      };
      console.error("❌ Request rejected:", rejectionLog);
      return res.status(400).json({
        message: "Invalid numeric values. All numeric fields must be positive numbers.",
        details: rejectionLog
      });
    }

    // Calculate macro limits and ratios
    const macroLimits = calculateMacroLimits({
      weight: normalizedBody.weight,
      height: normalizedBody.height,
      age: normalizedBody.age,
      gender: normalizedBody.gender,
      activityLevel: normalizedBody.activityLevel
    });

    const macroRatios = getMacroRatio(normalizedBody.goal);

    // Log calculated limits and ratios
    console.log("📊 Macro calculations:", {
      limits: macroLimits,
      ratios: macroRatios
    });

    // Validate macro values against limits with 20% margin
    const macroMargin = 0.20; // 20% margin
    const targetCalories = Number(normalizedBody.targetCalories);
    const minCalories = macroLimits.minCalories * (1 - macroMargin);
    const maxCalories = macroLimits.maxCalories * (1 + macroMargin);

    if (targetCalories < minCalories || targetCalories > maxCalories) {
      const rejectionLog = {
        reason: "Calories outside acceptable range",
        target: targetCalories,
        limits: {
          min: macroLimits.minCalories,
          max: macroLimits.maxCalories,
          margin: `${macroMargin * 100}%`
        },
        range: {
          minAllowed: minCalories,
          maxAllowed: maxCalories
        },
        difference: {
          fromMin: targetCalories - minCalories,
          fromMax: targetCalories - maxCalories
        },
        timestamp: new Date().toISOString()
      };
      console.error("❌ Request rejected:", rejectionLog);
      return res.status(400).json({
        message: `Calories must be between ${minCalories} and ${maxCalories}`,
        details: rejectionLog
      });
    }

    // Check if protein exceeds max
    const targetProtein = Number(normalizedBody.targetProtein);
    if (targetProtein > macroLimits.maxProtein) {
      const rejectionLog = {
        reason: "Protein exceeds maximum limit",
        target: targetProtein,
        limit: macroLimits.maxProtein,
        difference: targetProtein - macroLimits.maxProtein,
        timestamp: new Date().toISOString()
      };
      console.error("❌ Request rejected:", rejectionLog);
      return res.status(400).json({
        message: `Protein cannot exceed ${macroLimits.maxProtein}g per day`,
        details: rejectionLog
      });
    }

    // Check if macros match recommended ratios with 20% margin
    const totalMacros = targetProtein + Number(normalizedBody.targetCarbs) + Number(normalizedBody.targetFats);
    const proteinRatio = targetProtein / totalMacros;
    const carbsRatio = Number(normalizedBody.targetCarbs) / totalMacros;
    const fatsRatio = Number(normalizedBody.targetFats) / totalMacros;

    const ratioErrors = [];
    const ratioMargin = 0.20; // 20% margin

    if (Math.abs(proteinRatio - macroRatios.protein) > ratioMargin) {
      ratioErrors.push({
        macro: 'protein',
        actual: proteinRatio.toFixed(2),
        target: macroRatios.protein,
        difference: Math.abs(proteinRatio - macroRatios.protein).toFixed(2)
      });
    }
    if (Math.abs(carbsRatio - macroRatios.carbs) > ratioMargin) {
      ratioErrors.push({
        macro: 'carbs',
        actual: carbsRatio.toFixed(2),
        target: macroRatios.carbs,
        difference: Math.abs(carbsRatio - macroRatios.carbs).toFixed(2)
      });
    }
    if (Math.abs(fatsRatio - macroRatios.fats) > ratioMargin) {
      ratioErrors.push({
        macro: 'fats',
        actual: fatsRatio.toFixed(2),
        target: macroRatios.fats,
        difference: Math.abs(fatsRatio - macroRatios.fats).toFixed(2)
      });
    }

    if (ratioErrors.length > 0) {
      const rejectionLog = {
        reason: "Macro ratios outside acceptable range",
        margin: `${ratioMargin * 100}%`,
        errors: ratioErrors,
        ratios: {
          protein: proteinRatio,
          carbs: carbsRatio,
          fats: fatsRatio
        },
        targets: macroRatios,
        timestamp: new Date().toISOString()
      };
      console.warn("⚠️ Macro ratio warnings:", rejectionLog);
    }

    // Check for duplicate meal plans
    const userId = req.user?._id || 'anonymous';
    const lastPlan = lastPlanCache.get(userId);
    if (lastPlan) {
      const currentHash = hashMealPlan({
        meals: normalizedBody.meals || []
      });
      
      if (currentHash === lastPlan.hash) {
        console.log("🔄 Duplicate meal plan detected, retrying...");
        // Retry logic here
      }
    }

    // Generate meal plan with GPT
    const mealPlan = await generateMealPlanWithGPT(normalizedBody);

    // Cache the new meal plan
    if (mealPlan) {
      lastPlanCache.set(userId, {
        hash: hashMealPlan(mealPlan),
        timestamp: Date.now()
      });
    }

    res.json({ mealPlan });
  } catch (error) {
    console.error("❌ Error generating meal plan:", error);
    res.status(500).json({
      message: "Failed to generate meal plan",
      error: error.message
    });
  }
});

// @desc    Save a generated meal plan
export const saveMealPlan = asyncHandler(async (req, res) => {
  try {
    console.log("📝 Starting save meal plan process...");
    console.log("🧑‍💻 Authenticated user:", req.user);
    console.log("🧾 Full request body:", JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!req.body.meals || !Array.isArray(req.body.meals)) {
      console.log("❌ Missing or invalid meals array:", {
        hasMeals: !!req.body.meals,
        isArray: Array.isArray(req.body.meals),
        meals: req.body.meals
      });
      return res.status(400).json({ message: "Meals array is required" });
    }

    if (req.body.meals.length === 0) {
      console.log("❌ Empty meals array");
      return res.status(400).json({ message: "Meals array cannot be empty" });
    }

    if (!req.body.totalNutrition || typeof req.body.totalNutrition !== 'object') {
      console.log("❌ Missing or invalid totalNutrition object:", {
        hasTotalNutrition: !!req.body.totalNutrition,
        type: typeof req.body.totalNutrition,
        totalNutrition: req.body.totalNutrition
      });
      return res.status(400).json({ message: "Total nutrition object is required" });
    }

    // Validate each meal's structure
    const invalidMeals = req.body.meals.filter(meal => {
      const requiredFields = ['name', 'time', 'calories', 'protein', 'carbs', 'fats', 'ingredients', 'instructions'];
      const missingFields = requiredFields.filter(field => !meal[field]);
      const invalidTypes = {
        name: typeof meal.name !== 'string',
        time: typeof meal.time !== 'string',
        calories: typeof meal.calories !== 'number',
        protein: typeof meal.protein !== 'number',
        carbs: typeof meal.carbs !== 'number',
        fats: typeof meal.fats !== 'number',
        ingredients: !Array.isArray(meal.ingredients),
        instructions: typeof meal.instructions !== 'string'
      };
      return missingFields.length > 0 || Object.values(invalidTypes).some(Boolean);
    });

    if (invalidMeals.length > 0) {
      console.log("❌ Invalid meal structure:", {
        invalidMeals,
        details: invalidMeals.map(meal => ({
          name: meal.name,
          missingFields: ['name', 'time', 'calories', 'protein', 'carbs', 'fats', 'ingredients', 'instructions']
            .filter(field => !meal[field]),
          invalidTypes: {
            name: typeof meal.name,
            time: typeof meal.time,
            calories: typeof meal.calories,
            protein: typeof meal.protein,
            carbs: typeof meal.carbs,
            fats: typeof meal.fats,
            ingredients: Array.isArray(meal.ingredients) ? 'array' : typeof meal.ingredients,
            instructions: typeof meal.instructions
          }
        }))
      });
      return res.status(400).json({ 
        message: "Invalid meal structure",
        details: invalidMeals.map(meal => ({
          name: meal.name,
          missingFields: ['name', 'time', 'calories', 'protein', 'carbs', 'fats', 'ingredients', 'instructions']
            .filter(field => !meal[field]),
          invalidTypes: {
            name: typeof meal.name,
            time: typeof meal.time,
            calories: typeof meal.calories,
            protein: typeof meal.protein,
            carbs: typeof meal.carbs,
            fats: typeof meal.fats,
            ingredients: Array.isArray(meal.ingredients) ? 'array' : typeof meal.ingredients,
            instructions: typeof meal.instructions
          }
        }))
      });
    }

    // Validate totalNutrition structure
    const requiredNutritionFields = ['calories', 'protein', 'carbs', 'fats'];
    const missingNutritionFields = requiredNutritionFields.filter(field => !req.body.totalNutrition[field]);
    const invalidNutritionTypes = requiredNutritionFields.filter(field => 
      typeof req.body.totalNutrition[field] !== 'number'
    );

    if (missingNutritionFields.length > 0 || invalidNutritionTypes.length > 0) {
      console.log("❌ Invalid totalNutrition structure:", {
        missingFields: missingNutritionFields,
        invalidTypes: invalidNutritionTypes,
        totalNutrition: req.body.totalNutrition
      });
      return res.status(400).json({ 
        message: "Invalid totalNutrition structure",
        details: {
          missingFields: missingNutritionFields,
          invalidTypes: invalidNutritionTypes
        }
      });
    }

    // Log the data we're about to save
    console.log("💾 Attempting to save meal plan with data:", {
      user: req.user._id,
      mealsCount: req.body.meals.length,
      totalNutrition: req.body.totalNutrition
    });

    // Create and save the meal plan
    const newPlan = await MealPlan.create({
      user: req.user._id,
      meals: req.body.meals,
      totalNutrition: req.body.totalNutrition,
      isFavorite: true
    });

    console.log("✅ Successfully saved meal plan:", {
      id: newPlan._id,
      user: newPlan.user,
      mealsCount: newPlan.meals.length,
      totalNutrition: newPlan.totalNutrition
    });

    res.status(201).json({ 
      message: "Meal plan saved successfully", 
      savedPlan: newPlan 
    });
  } catch (error) {
    console.error("❌ Failed to save meal plan:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      validationErrors: error.errors
    });
    res.status(500).json({ 
      message: "Failed to save meal plan",
      error: error.message 
    });
  }
}); 