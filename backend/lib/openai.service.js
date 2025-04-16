import OpenAI from 'openai';
import { calculateMacroLimits, getMacroRatio } from '../lib/macroHelpers.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateMealPlanWithGPT = async (userParams) => {
    try {
        // Validate required parameters
        const requiredParams = [
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

        const missingParams = requiredParams.filter(param => !userParams[param]);
        if (missingParams.length > 0) {
            console.error("❌ Missing required parameters:", missingParams);
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }

        // Calculate macro limits
        const limits = calculateMacroLimits({
            weight: userParams.weight,
            height: userParams.height,
            age: userParams.age,
            gender: userParams.gender,
            activityLevel: userParams.activityLevel
        });

        // Validate macro limits
        if (!limits || typeof limits.maxProtein === "undefined") {
            console.error("❌ macroLimits.limits is undefined or malformed:", limits);
            throw new Error("Missing macro limits. Cannot generate meal plan.");
        }

        // Safely destructure macro limits
        const { maxProtein, perMealProteinCap, macroFlex, maxCalories, minCalories } = limits;

        // Validate destructured values
        if (!Number.isFinite(maxProtein) || !Number.isFinite(perMealProteinCap) ||
            !Number.isFinite(macroFlex) || !Number.isFinite(maxCalories) || !Number.isFinite(minCalories)) {
            console.error("❌ Invalid macro limit values:", {
                maxProtein,
                perMealProteinCap,
                macroFlex,
                maxCalories,
                minCalories
            });
            throw new Error("Invalid macro limit values. Cannot generate meal plan.");
        }

        // Get macro ratios based on goal
        const macroRatios = getMacroRatio(userParams.goal);

        // Validate macro ratios
        if (!macroRatios || typeof macroRatios.protein === "undefined") {
            console.error("❌ macroRatios is undefined or malformed:", macroRatios);
            throw new Error("Missing macro ratios. Cannot generate meal plan.");
        }

        const mealFrequency = parseInt(userParams.mealFrequency || 3);
        let mealTimes = [];
        if (mealFrequency === 3) {
            mealTimes = ["Breakfast", "Lunch", "Dinner"];
        } else if (mealFrequency === 4) {
            mealTimes = ["Breakfast", "Lunch", "Snack", "Dinner"];
        } else if (mealFrequency === 5) {
            mealTimes = ["Breakfast", "Snack", "Lunch", "Snack", "Dinner"];
        } else {
            // Handle other meal frequencies or set default times
            mealTimes = Array.from({ length: mealFrequency }, (_, i) => `Meal ${i + 1}`);
        }

        // Prepare the prompt with validated parameters
        const prompt = `You are a professional nutritionist and chef.\n\nReturn ONLY a valid JSON object. No extra commentary. No markdown. No code blocks.\n\nGenerate a meal plan with the following specs:\n{\n  \"goal\": \"${userParams.goal}\",\n  \"targetCalories\": ${userParams.targetCalories},\n  \"targetProtein\": ${userParams.targetProtein},\n  \"targetCarbs\": ${userParams.targetCarbs},\n  \"targetFats\": ${userParams.targetFats},\n  \"maxProteinPerMeal\": ${perMealProteinCap},\n  \"macroRatios\": {\n    \"protein\": ${macroRatios.protein},\n    \"carbs\": ${macroRatios.carbs},\n    \"fats\": ${macroRatios.fats}\n  },\n  \"dietaryRestrictions\": ${JSON.stringify(userParams.dietaryRestrictions || [])},\n  \"preferences\": ${JSON.stringify(userParams.preferences || [])},\n  \"mealFrequency\": ${mealFrequency},\n  \"cookingSkillLevel\": \"${userParams.cookingSkillLevel || 'Intermediate'}\",\n  \"mealPrepTime\": \"${userParams.mealPrepTime || '15-30 minutes'}\",\n  \"groceryBudget\": \"${userParams.groceryBudget || 'Medium'}\"\n}\n\nRules:\n1. Return only a single JSON object with a \"meals\" array.\n2. Each meal must include: name, ingredients, instructions, calories, protein, carbs, fats, and **time** (e.g., "${mealTimes.join('", "')}").\n3. Do NOT include markdown, comments, explanations, or formatting.\n4. No extra text. Only the JSON.`;

        // Log the prompt for debugging
        console.log("🤖 Sending prompt to GPT:", prompt);

        // Make the API call to GPT
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a professional nutritionist and chef. Generate detailed meal plans that meet specific macro targets while considering dietary restrictions and preferences."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        // Parse and validate the response
        const rawContent = response.choices?.[0]?.message?.content;

        console.log(' Raw GPT content:', rawContent);

        // Clean up any markdown formatting or non-JSON junk
        let cleaned = rawContent?.trim();

        // If wrapped in a code block, strip it
        if (cleaned.startsWith('```json') || cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```json|```/g, '').trim();
        }

        // Try parsing after cleanup
        let mealPlan;
        try {
            mealPlan = JSON.parse(cleaned);
        } catch (err) {
            console.error('❌ Failed to parse GPT response as JSON. Cleaned content:\\n', cleaned);
            throw new Error('GPT returned invalid JSON, even after cleanup. Check formatting.');
        }

        // Validate meal plan structure
        if (!mealPlan || !Array.isArray(mealPlan.meals)) {
            console.error("❌ Invalid meal plan structure:", mealPlan);
            throw new Error("Invalid meal plan structure received from GPT");
        }

        // Add the 'time' field to each meal based on mealFrequency
        const mealsWithTime = mealPlan.meals.map((meal, index) => ({
            ...meal,
            time: mealTimes[index] || 'Unknown',
        }));
        mealPlan.meals = mealsWithTime;

        // Log the generated meal plan
        console.log("✅ Successfully generated meal plan:", {
            mealsCount: mealPlan.meals.length,
            totalCalories: mealPlan.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
            totalProtein: mealPlan.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
            totalCarbs: mealPlan.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0),
            totalFats: mealPlan.meals.reduce((sum, meal) => sum + (meal.fats || 0), 0)
        });

        return mealPlan;
    } catch (error) {
        console.error("❌ Error in generateMealPlanWithGPT:", error);
        throw error;
    }
};