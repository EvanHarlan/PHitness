import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate meal suggestions based on user preferences and goals
 * @param {Object} params - Parameters for meal suggestion
 * @param {number} params.targetCalories - Daily calorie goal
 * @param {number} params.targetProtein - Daily protein goal in grams
 * @param {number} params.targetCarbs - Daily carbs goal in grams
 * @param {number} params.targetFats - Daily fats goal in grams
 * @param {Array<string>} params.dietaryRestrictions - List of dietary restrictions
 * @param {Array<string>} params.preferences - Food preferences
 * @returns {Promise<Object>} Meal suggestions with nutritional information
 */
export const generateMealSuggestions = async ({
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFats,
  dietaryRestrictions = [],
  preferences = []
}) => {
  try {
    const prompt = `As a nutrition expert, create a daily meal plan with the following requirements:
    
Target Daily Nutrients:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g
- Carbs: ${targetCarbs}g
- Fats: ${targetFats}g

${dietaryRestrictions.length ? `Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${preferences.length ? `Food Preferences: ${preferences.join(', ')}` : ''}

Please provide a meal plan with 3-4 meals including:
1. Meal name
2. Time of day
3. List of foods with portions and units
4. Nutritional information per food item (calories, protein, carbs, fats)
5. Total nutrients per meal

Format the response as a JSON object with this structure:
{
  "meals": [
    {
      "name": "meal name",
      "time": "suggested time",
      "foods": [
        {
          "name": "food name",
          "portion": number,
          "unit": "measurement unit",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number
        }
      ],
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFats": number
    }
  ],
  "dailyTotals": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number
  }
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a certified nutritionist and meal planning expert. Provide detailed, realistic meal plans that meet the specified nutritional requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the response and validate it's in the correct format
    const mealPlan = JSON.parse(completion.choices[0].message.content);
    
    // Validate the response has the required structure
    if (!mealPlan.meals || !Array.isArray(mealPlan.meals)) {
      throw new Error('Invalid meal plan format received from OpenAI');
    }

    return mealPlan;
  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    throw error;
  }
}; 