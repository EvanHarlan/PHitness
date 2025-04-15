import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import NutritionQuestionnaire from "../components/NutritionQuestionnaire";
import COLORS from '../lib/constants';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const NutritionPage = () => {
  const { user } = useUserStore();
  
  const [mealAmount, setMealAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [targetMacros, setTargetMacros] = useState(null);
  const [userParams, setUserParams] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "",
    nutritionGoal: "",
    activityLevel: "",
    dietaryRestrictions: "none",
    mealFrequency: "",
    snackPreference: "",
    hydrationPreference: "",
    cookingSkill: "",
    timePerMeal: "",
    budget: "",
    healthConditions: "none",
    preferences: [],
  });
  const [fetchMealCountError, setFetchMealCountError] = useState(null);
  const [error, setError] = useState(null);

  // Custom theme for tooltips to match the website
  const tooltipTheme = createTheme({
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
            fontSize: '0.875rem',
            padding: '8px 12px',
            maxWidth: '300px',
            zIndex: 9999,
          },
          arrow: {
            color: COLORS.DARK_GRAY,
          }
        }
      }
    }
  });

  // Info tooltip component 
  const InfoTooltip = ({ title }) => (
    <Tooltip title={title} arrow placement="top">
      <HelpOutlineIcon 
        sx={{ 
          color: COLORS.NEON_GREEN, 
          fontSize: '18px', 
          marginLeft: '5px',
          verticalAlign: 'middle',
          cursor: 'pointer',
          '&:hover': {
            color: COLORS.LIGHT_GRAY,
          }
        }} 
      />
    </Tooltip>
  );

  // Fetch meal count on component mount
  useEffect(() => {
    console.log("🧍 User from store:", user);
  }, [user]);

  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setMealAmount(response.data.mealCount || 0);
        setFetchMealCountError(null);
      } catch (error) {
        setFetchMealCountError(error);
      }
    };

    fetchMealCount();
  }, []);

  // Calculate total nutrition from meals
  const calculateTotalNutrition = (meals) => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + Number(meal.calories || 0),
      protein: totals.protein + Number(meal.protein || 0),
      carbs: totals.carbs + Number(meal.carbs || 0),
      fats: totals.fats + Number(meal.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  // Generate meal plan based on user params
  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const loadingToast = toast.loading("Generating Meal Plan...", {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });

      // Validate required fields
      if (!userParams.weight || !userParams.height || !userParams.age || !userParams.gender || !userParams.activityLevel || !userParams.nutritionGoal) {
        toast.error("Please fill in all required fields");
        toast.dismiss(loadingToast);
        setLoading(false);
        return;
      }

      // Trim string inputs
      const trimmedParams = {
        ...userParams,
        height: String(userParams.height).trim(),
        gender: String(userParams.gender).trim(),
        activityLevel: String(userParams.activityLevel).trim(),
        nutritionGoal: String(userParams.nutritionGoal).trim(),
        preferences: userParams.preferences.map(p => String(p).trim())
      };

      // Convert numeric inputs
      const numericParams = {
        ...trimmedParams,
        weight: Number(trimmedParams.weight),
        age: Number(trimmedParams.age)
      };

      // Validate numeric values
      if (!Number.isFinite(numericParams.weight) || numericParams.weight <= 0) {
        toast.error("Please enter a valid weight");
        toast.dismiss(loadingToast);
        setLoading(false);
        return;
      }

      if (!Number.isFinite(numericParams.age) || numericParams.age <= 0) {
        toast.error("Please enter a valid age");
        toast.dismiss(loadingToast);
        setLoading(false);
        return;
      }

      // Destructure parameters for macro calculation
      const { height, weight, age, gender, activityLevel, nutritionGoal } = numericParams;

      // Calculate target macros with destructured parameters
      const macros = calculateMacros(
        height,
        weight,
        age,
        gender,
        activityLevel,
        nutritionGoal
      );
      
      setTargetMacros(macros);

      // Validate macro calculations
      if (macros.targetCalories === 0 || 
          macros.targetProtein === 0 || 
          macros.targetCarbs === 0 || 
          macros.targetFats === 0) {
        toast.error("Invalid macro values. Please review your input.");
        toast.dismiss(loadingToast);
        setLoading(false);
        return;
      }

      // Ensure dietaryRestrictions and healthConditions are arrays
      const dietaryRestrictions = Array.isArray(userParams.dietaryRestrictions)
        ? userParams.dietaryRestrictions.map(r => String(r).trim())
        : [String(userParams.dietaryRestrictions)].filter(Boolean);

      const healthConditions = Array.isArray(userParams.healthConditions)
        ? userParams.healthConditions.map(h => String(h).trim())
        : [String(userParams.healthConditions)].filter(Boolean);

      // Prepare payload
      const payload = {
        goal: String(nutritionGoal),
        weight: Number(weight),
        height: String(height).trim(),
        age: Number(age),
        gender: String(gender),
        activityLevel: String(activityLevel),
        targetCalories: Number(macros.targetCalories),
        targetProtein: Number(macros.targetProtein),
        targetCarbs: Number(macros.targetCarbs),
        targetFats: Number(macros.targetFats),
        dietaryRestrictions: dietaryRestrictions,
        preferences: userParams.preferences.map(p => String(p).trim()),
        mealFrequency: userParams.mealFrequency ? String(userParams.mealFrequency).trim() : undefined,
        snackPreference: userParams.snackPreference ? String(userParams.snackPreference).trim() : undefined,
        dailyWaterIntake: userParams.hydrationPreference ? String(userParams.hydrationPreference).trim() : undefined,
        cookingSkillLevel: userParams.cookingSkill ? String(userParams.cookingSkill).trim() : undefined,
        mealPrepTime: userParams.timePerMeal ? String(userParams.timePerMeal).trim() : undefined,
        groceryBudget: userParams.budget ? String(userParams.budget).trim() : undefined,
        healthConditions: healthConditions
      };

      // Make API call
      const response = await axios.post(
        "http://localhost:5000/api/meal-plans/generate",
        payload,
        { withCredentials: true }
      );

      // Handle response
      if (response.data.mealPlan) {
        const totals = calculateTotalNutrition(response.data.mealPlan.meals || []);
        const planWithTotals = {
          ...response.data.mealPlan,
          totalNutrition: totals
        };
        setGeneratedPlan(planWithTotals);
        setError(null);
        toast.success("Meal plan generated successfully!");
      } else {
        toast.error("Failed to generate meal plan");
      }
      
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate meal plan");
    } finally {
      setLoading(false);
    }
  };

  // Log a meal
  const addMeal = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/tracker",
        { type: "meal" },
        { withCredentials: true }
      );

      setMealAmount(prevMealAmount => prevMealAmount + 1);
      toast.success("Meal logged!", {
        duration: 1500,
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.NEON_GREEN,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    } catch (error) {
      toast.error("Failed to log meal.");
    }
  };

  // Save the generated meal plan
  const handleSaveMealPlan = async () => {
    try {
      // Validate the meal plan data
      if (!generatedPlan || !generatedPlan.meals || !generatedPlan.totalNutrition) {
        toast.error("Invalid meal plan data");
        return;
      }

      // Format the meal plan data according to backend schema
      const formattedPlan = {
        // User parameters
        weight: Number(userParams.weight),
        height: Number(userParams.height),
        age: Number(userParams.age),
        gender: String(userParams.gender),
        activityLevel: String(userParams.activityLevel),
        goal: String(userParams.nutritionGoal),
        targetCalories: Number(generatedPlan.totalNutrition.calories),
        targetProtein: Number(generatedPlan.totalNutrition.protein),
        targetCarbs: Number(generatedPlan.totalNutrition.carbs),
        targetFats: Number(generatedPlan.totalNutrition.fats),
        dietaryRestrictions: Array.isArray(userParams.dietaryRestrictions) 
          ? userParams.dietaryRestrictions.map(String)
          : [String(userParams.dietaryRestrictions)].filter(Boolean),
        preferences: Array.isArray(userParams.preferences)
          ? userParams.preferences.map(String)
          : [String(userParams.preferences)].filter(Boolean),

        // Meal plan data
        meals: generatedPlan.meals.map(meal => ({
          name: String(meal.name),
          time: String(meal.time),
          calories: Number(meal.calories),
          protein: Number(meal.protein),
          carbs: Number(meal.carbs),
          fats: Number(meal.fats),
          ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.map(String) : [String(meal.ingredients)],
          instructions: String(meal.instructions)
        })),
        totalNutrition: {
          calories: Number(generatedPlan.totalNutrition.calories),
          protein: Number(generatedPlan.totalNutrition.protein),
          carbs: Number(generatedPlan.totalNutrition.carbs),
          fats: Number(generatedPlan.totalNutrition.fats)
        }
      };

      const res = await axios.post(
        "http://localhost:5000/api/meal-plans/save",
        formattedPlan,
        { withCredentials: true }
      );

      toast.success("Meal plan saved!", {
        duration: 2000,
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.NEON_GREEN,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save meal plan", {
        duration: 2000,
        style: {
          background: COLORS.DARK_GRAY,
          color: '#ff4b4b',
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="p-8 text-lg font-medium" style={{ color: COLORS.WHITE }}>
          <svg className="animate-spin h-6 w-6 mr-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating your optimal meal plan...
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={tooltipTheme}>
      <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 flex justify-center"
            style={{ color: COLORS.NEON_GREEN }}>
            Meal Plan Generator
          </h1>
          <p className="text-lg md:text-xl text-[#B0B0B0] flex justify-center">
            Get AI-powered custom meal plans. please fill out the questionnaire below to get started.
          </p>
        </header>
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {/* Nutrition Parameters Form */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Your Nutrition Parameters
                <InfoTooltip title="Fill out the questions to get a personalized meal plan based on your specific goals and information." />
              </h2>
              <NutritionQuestionnaire
                userParams={userParams}
                setUserParams={setUserParams}
                onSubmit={generateMealPlan}
                loading={loading}
              />
            </div>

            {/* Meal Tracker */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Meal Tracker
              </h2>

              <p className="mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
                Track your meals to monitor your progress
              </p>

              <div className="p-4 border rounded-lg mb-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <h3 className="font-medium" style={{ color: COLORS.WHITE }}>
                  Meals Logged
                  <InfoTooltip title="This shows the total number of meals you've logged as completed" />
                </h3>
                <p className="text-2xl font-bold mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  {mealAmount !== null ? mealAmount : 'N/A'}
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  className="px-4 py-2 rounded-lg transition font-medium flex items-center hover:opacity-90"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                  onClick={addMeal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Log Meal
                </button>
              </div>
              
              {fetchMealCountError && (
                <p className="mt-2 text-sm text-red-500">Failed to load meal count.</p>
              )}
            </div>
          </div>

          {/* Meal Plan Results */}
          {generatedPlan && (
            <div className="mt-8 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>Your Generated Meal Plan</h2>
              
              {/* Total Nutrition Summary */}
              {generatedPlan.totalNutrition && (
                <div className="mb-8 p-4 rounded-lg border" style={{ borderColor: COLORS.MEDIUM_GRAY }}>
                  <h3 className="text-lg font-medium mb-3" style={{ color: COLORS.NEON_GREEN }}>Daily Nutrition Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                      <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Calories</p>
                      <p className="text-xl font-bold" style={{ color: COLORS.WHITE }}>{generatedPlan.totalNutrition.calories}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                      <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Protein</p>
                      <p className="text-xl font-bold" style={{ color: COLORS.WHITE }}>{generatedPlan.totalNutrition.protein}g</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                      <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Carbs</p>
                      <p className="text-xl font-bold" style={{ color: COLORS.WHITE }}>{generatedPlan.totalNutrition.carbs}g</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                      <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Fats</p>
                      <p className="text-xl font-bold" style={{ color: COLORS.WHITE }}>{generatedPlan.totalNutrition.fats}g</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Meals List */}
              <div className="space-y-6">
                {generatedPlan.meals.map((meal, index) => (
                  <div key={index} className="p-4 rounded-lg border" style={{ borderColor: COLORS.MEDIUM_GRAY }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium" style={{ color: COLORS.WHITE }}>{meal.name}</h3>
                        <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>{meal.time}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Calories</p>
                          <p className="font-bold" style={{ color: COLORS.WHITE }}>{meal.calories}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Protein</p>
                          <p className="font-bold" style={{ color: COLORS.WHITE }}>{meal.protein}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Carbs</p>
                          <p className="font-bold" style={{ color: COLORS.WHITE }}>{meal.carbs}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>Fats</p>
                          <p className="font-bold" style={{ color: COLORS.WHITE }}>{meal.fats}g</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Ingredients</h4>
                        <ul className="list-disc list-inside" style={{ color: COLORS.LIGHT_GRAY }}>
                          {meal.ingredients.map((ingredient, i) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>Instructions</h4>
                        <p className="whitespace-pre-line" style={{ color: COLORS.LIGHT_GRAY }}>{meal.instructions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={handleSaveMealPlan}
                  className="flex-1 px-4 py-2 rounded-lg transition font-medium flex items-center justify-center hover:opacity-90"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  Save Meal Plan
                </button>
                <button
                  onClick={generateMealPlan}
                  className="flex-1 px-4 py-2 rounded-lg transition font-medium flex items-center justify-center hover:opacity-90"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Generate Another Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NutritionPage;