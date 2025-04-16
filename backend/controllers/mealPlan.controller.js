import asyncHandler from 'express-async-handler';
import { generateMealPlanWithGPT } from '../lib/openai.service.js';
import { calculateMacroLimits, getMacroRatio } from '../lib/macroHelpers.js';
// import { rotateMealType } from '../lib/mealHelpers.js'; // Keep if used, otherwise remove
import crypto from 'crypto';
import MealPlan from '../models/mealPlan.model.js';

// Simple in-memory cache for last generated meal plans (Optional: Review if still needed with robust saving)
const lastPlanCache = new Map();

// Helper to generate a hash of a meal plan (Optional: Review if still needed)
const hashMealPlan = (mealPlan) => {
    if (!mealPlan || !Array.isArray(mealPlan.meals)) {
        console.warn("Attempted to hash an invalid or incomplete meal plan structure.");
        return crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    }
    const mealSignatures = mealPlan.meals.map(m =>
        `${m.name}-${m.time}-${m.calories}-${m.protein}-${m.carbs}-${m.fats}`
    ).join('|');

    return crypto.createHash('md5').update(mealSignatures).digest('hex');
};

// @desc    Get all meal plans for a user (supports favorite filtering)
// @route   GET /api/meal-plans
// @access  Private
export const getUserMealPlans = asyncHandler(async (req, res) => {
    const filter = { user: req.user._id };
    if (req.query.favoritesOnly === 'true') {
        filter.isFavorite = true;
    }
    const mealPlans = await MealPlan.find(filter).sort({ createdAt: -1 });
    res.json(mealPlans);
});

// @desc    Get a single meal plan by ID
// @route   GET /api/meal-plans/:id
// @access  Private
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

// @desc    Toggle favorite status of a meal plan
// @route   PUT /api/meal-plans/:id/favorite
// @access  Private
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
    console.log(`✅ Toggled favorite status for plan ${mealPlan._id} to ${mealPlan.isFavorite}`);
    res.json(updatedMealPlan);
});

// @desc    Delete a meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private
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
    console.log(`🗑️ Deleted meal plan ${req.params.id}`);
    res.json({ message: 'Meal plan removed' });
});

// Function to calculate target calories using Mifflin-St Jeor equation
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
            activityMultiplier = 1.2;
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
            activityMultiplier = 1.2; // Default to sedentary
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
        // For other goals (healthy-eating, increase-energy, etc.), we can keep the calculated TDEE
        default:
            break;
    }

    return Math.round(targetCalories);
};

// @desc    Generate AND SAVE a new meal plan
// @route   POST /api/meal-plans/generate
// @access  Private
export const generateMealPlan = asyncHandler(async (req, res) => {
    // Outer try...catch to handle errors before or after the main generation/save block
    try {
        console.log("🚀 Starting meal plan generation request for user:", req.user?._id); // Use optional chaining for safety
        console.log("Request Body:", req.body);

        // --- Start Validation ---
        const requiredFields = [
            'goal', 'weight', 'height', 'age', 'gender', 'activityLevel'
        ];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
        if (missingFields.length > 0) {
            console.error("❌ Request rejected: Missing required fields in req.body", missingFields);
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
        }

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
            dailyWaterIntake: req.body.dailyWaterIntake,
            cookingSkillLevel: req.body.cookingSkillLevel,
            mealPrepTime: req.body.mealPrepTime,
            groceryBudget: req.body.groceryBudget,
        };

        // Calculate target calories
        try {
            normalizedBody.targetCalories = calculateTargetCalories(normalizedBody);
            console.log("🎯 Calculated target calories:", normalizedBody.targetCalories);
        } catch (calorieError) {
            console.error("❌ Error during target calorie calculation:", calorieError);
            return res.status(400).json({ message: `Failed to calculate target calories: ${calorieError.message}` });
        }

        // Set initial macro targets (these might be adjusted by GPT)
        const macroRatios = getMacroRatio(normalizedBody.goal);
        normalizedBody.targetProtein = Math.round((normalizedBody.targetCalories * macroRatios.protein) / 4); // Protein: 4 calories per gram
        normalizedBody.targetCarbs = Math.round((normalizedBody.targetCalories * macroRatios.carbs) / 4);   // Carbs: 4 calories per gram
        normalizedBody.targetFats = Math.round((normalizedBody.targetCalories * macroRatios.fats) / 9);     // Fats: 9 calories per gram

        const numericFields = ['weight', 'age', 'targetCalories', 'targetProtein', 'targetCarbs', 'targetFats'];
        const invalidNumeric = numericFields.filter(field => {
            const value = normalizedBody[field];
            return !Number.isFinite(value) || value <= 0;
        });
        if (invalidNumeric.length > 0) {
            console.error("❌ Request rejected: Invalid numeric values after calculation/normalization", invalidNumeric);
            return res.status(400).json({ message: `Invalid or non-positive numeric values for: ${invalidNumeric.join(', ')}` });
        }

        let macroLimits;
        try {
            macroLimits = calculateMacroLimits(normalizedBody);
            console.log("📊 Calculated macro limits:", macroLimits);
        } catch (helperError) {
            console.error("❌ Error during macro helper calculation:", helperError);
            return res.status(400).json({ message: `Failed to calculate macros: ${helperError.message}` });
        }

        console.log("✅ Validation passed. Generating meal plan with GPT...");
        console.log("🔍 Passing this normalizedBody to GPT service:", JSON.stringify(normalizedBody, null, 2));

        let generatedPlanData;
        let newPlan;
        try {
            // Generate meal plan with GPT
            generatedPlanData = await generateMealPlanWithGPT(normalizedBody);

            // Check GPT Output: Now only check for the meals array
            if (!generatedPlanData || !Array.isArray(generatedPlanData.meals) || generatedPlanData.meals.length === 0) {
                console.error("❌ GPT generation failed or returned invalid structure:", generatedPlanData);
                return res.status(502).json({ message: 'AI service failed to generate a valid meal plan structure (missing meals).' });
            }

            console.log("🤖 GPT generation successful. Saving the plan to database...");

            // Calculate total nutrition from the generated meals
            let totalNutrition = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            generatedPlanData.meals.forEach(meal => {
                totalNutrition.calories += meal.calories;
                totalNutrition.protein += meal.protein;
                totalNutrition.carbs += meal.carbs;
                totalNutrition.fats += meal.fats;
            });

            console.log("✅ Successfully generated meal plan:", {
                mealsCount: generatedPlanData.meals.length,
                totalCalories: totalNutrition.calories,
                totalProtein: totalNutrition.protein,
                totalCarbs: totalNutrition.carbs,
                totalFats: totalNutrition.fats
            });

            // ** SAVE THE GENERATED PLAN TO MONGODB **
            newPlan = await MealPlan.create({
                user: req.user._id, // Associate with the logged-in user
                meals: generatedPlanData.meals,
                totalNutrition: totalNutrition, // Save the calculated total nutrition
                isFavorite: false, // Default to false
            });

            console.log(`💾 Meal plan saved successfully with ID: ${newPlan._id} for user: ${req.user._id}`);

            // Send the newly SAVED plan back to the client
            res.status(201).json({ mealPlan: newPlan }); // Use 201 Created status

        } catch (gptOrDbError) {
            console.error("❌ Error during GPT call or Database save:", gptOrDbError);
            if (gptOrDbError.message.includes("Missing required parameters")) {
                return res.status(500).json({ message: "Internal configuration error: Service is missing required parameters.", details: gptOrDbError.message });
            }
            if (gptOrDbError.name === 'ValidationError') {
                console.error("❌ Mongoose Validation Error:", gptOrDbError.errors);
                return res.status(400).json({ message: "Failed to save meal plan due to invalid data.", errors: gptOrDbError.errors });
            }
            throw gptOrDbError;
        }

    } catch (error) {
        // Catch errors from validation, helper calls, or re-thrown from inner block
        console.error("❌ Error in generateMealPlan controller (outer catch):", error);
        const statusCode = error.status || (error.name === 'ValidationError' ? 400 : 500); // Determine status code
        res.status(statusCode).json({
            message: error.message || "Failed to generate meal plan due to an internal server error.",
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), // Show stack in dev only
            details: error.details // Pass along any details attached to the error
        });
    }
});

// @desc    Explicitly save a meal plan (May be redundant - review necessity)
// @route   POST /api/meal-plans/save
// @access  Private
export const saveMealPlan = asyncHandler(async (req, res) => {
    console.warn("⚠️ Explicit /api/meal-plans/save endpoint called. Ensure this is intended behavior.");
    try {
        console.log("Starting explicit save meal plan process for user:", req.user?._id);

        // --- Start Validation ---
        if (!req.body.meals || !Array.isArray(req.body.meals) || req.body.meals.length === 0) {
            return res.status(400).json({ message: "Valid meals array is required" });
        }
        if (!req.body.totalNutrition || typeof req.body.totalNutrition !== 'object') {
            return res.status(400).json({ message: "Total nutrition object is required" });
        }
        // Add more detailed validation if needed...
        // --- End Validation ---

        console.log("Attempting to explicitly save meal plan...");
        const newPlan = await MealPlan.create({
            user: req.user._id,
            meals: req.body.meals,
            totalNutrition: req.body.totalNutrition,
            isFavorite: req.body.isFavorite === true
        });

        console.log("✅ Successfully saved meal plan explicitly:", { id: newPlan._id });
        res.status(201).json({
            message: "Meal plan saved successfully (explicit save)",
            savedPlan: newPlan
        });

    } catch (error) {
        console.error("❌ Failed to explicitly save meal plan:", error);
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        res.status(statusCode).json({
            message: "Failed to save meal plan",
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
            validationErrors: error.errors
        });
    }
});