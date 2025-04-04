import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize OpenAI client
const openai = new OpenAI();

/**
 * Generate meal suggestions based on user preferences and goals
<<<<<<< Updated upstream
 * @param {Object} params - Parameters for meal suggestion
 * @param {number} params.targetCalories - Daily calorie goal
 * @param {number} params.targetProtein - Daily protein goal in grams
 * @param {number} params.targetCarbs - Daily carbs goal in grams
 * @param {number} params.targetFats - Daily fats goal in grams
 * @param {Array<string>} params.dietaryRestrictions - List of dietary restrictions
 * @param {Array<string>} params.preferences - Food preferences
 * @returns {Promise<Object>} Meal suggestions with nutritional information
=======
 * @param {Object} params - Parameters for meal generation
 * @param {number} params.targetCalories - Target daily calories
 * @param {number} params.targetProtein - Target daily protein in grams
 * @param {number} params.targetCarbs - Target daily carbs in grams
 * @param {number} params.targetFats - Target daily fats in grams
 * @param {string[]} params.dietaryRestrictions - Array of dietary restrictions
 * @param {string[]} params.preferences - Array of food preferences
 * @returns {Promise<Object>} - Generated meal suggestions
>>>>>>> Stashed changes
 */
export const generateMealSuggestions = async ({
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFats,
  dietaryRestrictions = [],
  preferences = []
}) => {
<<<<<<< Updated upstream
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

=======
  const prompt = `
    Create a detailed 7-day meal plan that meets the following nutritional requirements:
    - Daily Calories: ${targetCalories}
    - Daily Protein: ${targetProtein}g
    - Daily Carbs: ${targetCarbs}g
    - Daily Fats: ${targetFats}g
    
    ${dietaryRestrictions.length > 0 ? `Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}
    ${preferences.length > 0 ? `Food Preferences: ${preferences.join(', ')}` : ''}
    
    For each meal, include:
    - Detailed ingredients with amounts
    - Nutritional information (calories, protein, carbs, fat)
    - Simple preparation instructions
    
    Format the response as a JSON object with this structure:
    {
      "meals": [
        {
          "day": "Monday",
          "mealType": "Breakfast",
          "name": "Meal Name",
          "ingredients": [
            {
              "name": "Ingredient Name",
              "amount": 1,
              "unit": "cup"
            }
          ],
          "calories": 500,
          "protein": 30,
          "carbs": 50,
          "fat": 20
        }
      ],
      "dailyTotals": {
        "calories": 2000,
        "protein": 150,
        "carbs": 200,
        "fat": 70
      }
    }
  `;

  try {
>>>>>>> Stashed changes
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a certified nutritionist and meal planning expert. Provide detailed, realistic meal plans that meet the specified nutritional requirements. Return the response in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4",
      temperature: 0.7,
    });

<<<<<<< Updated upstream
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
=======
    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    throw new Error('Failed to generate meal suggestions');
>>>>>>> Stashed changes
  }
}; 