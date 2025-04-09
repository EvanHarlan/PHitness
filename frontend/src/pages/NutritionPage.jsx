import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import NutritionQuestionnaire from "../components/NutritionQuestionnaire";
import COLORS from '../lib/constants';

const NutritionPage = () => {
  const [mealAmount, setMealAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mealPlanData, setMealPlanData] = useState(null);
  const [userParams, setUserParams] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "", // Ensure initial state matches the new options
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
  });
  const [fetchMealCountError, setFetchMealCountError] = useState(null);

  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setMealAmount(response.data.mealCount || 0);
        setFetchMealCountError(null);
      } catch (error) {
        console.error("Error fetching meal count:", error);
        setFetchMealCountError(error);
      }
    };

    fetchMealCount();
  }, []);

  const generateMealPlan = async () => {
    // Basic validation for required fields based on the updated questionnaire
    const requiredFields = [
      "height",
      "weight",
      "age",
      "gender",
      "nutritionGoal",
      "activityLevel",
      "dietaryRestrictions",
      "mealFrequency",
      "snackPreference",
      "hydrationPreference",
      "cookingSkill",
      "timePerMeal",
      "budget",
      "healthConditions",
    ];
    const missingFields = requiredFields.filter(field => !userParams[field]);

    if (missingFields.length > 0) {
      // error message for missing fields
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`, {
        duration: 4000,
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        },
        iconTheme: {
          primary: '#ff4b4b',
          secondary: COLORS.WHITE
        }
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/meals/generate", // Replace with actual backend endpoint for generating meals
        userParams,
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        setMealPlanData(response.data.mealPlan); // Assuming the backend returns 'mealPlan'
        toast.success("Optimal meal plan generated successfully!", {
          duration: 2000,
          icon: '🥗',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      } else {
        console.error("Error generating meal plan:", response);
        toast.error(`Failed to generate meal plan. Server responded with status ${response.status}. Please try again later.`);
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast.error("Failed to generate meal plan. Please check your network connection and try again later.");
    } finally {
      setLoading(false);
    }
  };

  // meal tracker
  const addMeal = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/tracker",
        { type: "meal" },
        { withCredentials: true }
      );

      console.log("API Response:", response.data);
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
      console.error("Error logging meal:", error);
      toast.error("Failed to log meal.");
    }
  };

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
            <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>Your Nutrition Parameters</h2>
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
              {mealAmount !== null && (
                <span
                  className="ml-2 px-2 py-1 text-sm rounded-full"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.NEON_GREEN }}
                >
                  {mealAmount}
                </span>
              )}
            </h2>

            <p className="mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
              Track your meals to monitor your progress
            </p>

            <div className="p-4 border rounded-lg mb-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
              <h3 className="font-medium" style={{ color: COLORS.WHITE }}>Meals Logged</h3>
              <p className="text-2xl font-bold mb-3" style={{ color: COLORS.NEON_GREEN }}>{mealAmount !== null ? mealAmount : 'N/A'}</p>
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

              {/* Future feature: View saved meal plans */}
              {/* <button
                className="px-4 py-2 rounded-lg transition font-medium flex items-center"
                style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                // onClick={() => setShowSavedMeals(!showSavedMeals)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                View Saved Meal Plans (Coming Soon)
              </button> */}
            </div>
            {fetchMealCountError && (
              <p className="mt-2 text-sm text-red-500">Failed to load meal count.</p>
            )}
          </div>
        </div>

        {/* Meal Plan Results */}
        {mealPlanData && (
          <div className="mt-8 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>Your Generated Meal Plan</h2>
            {typeof mealPlanData === 'object' && mealPlanData !== null ? (
              <pre style={{ color: COLORS.LIGHT_GRAY }}>{JSON.stringify(mealPlanData, null, 2)}</pre>
            ) : (
              <p style={{ color: COLORS.LIGHT_GRAY }}>{mealPlanData}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionPage;