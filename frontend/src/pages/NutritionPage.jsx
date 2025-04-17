import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NutritionQuestionnaire from "../components/NutritionQuestionnaire";
import SavedMealsList from "../components/SavedMealList";
import COLORS from '../lib/constants';
import { useUserStore } from "../stores/useUserStore";

const NutritionPage = () => {
  // State variables
  const [mealAmount, setMealAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mealData, setMealData] = useState(null);
  const [savedMeal, setSavedMeal] = useState(null);
  const [showSavedMeals, setShowSavedMeals] = useState(false);
  const navigate = useNavigate();
  const [fetchMealCountError, setFetchMealCountError] = useState(null);
  const { user } = useUserStore();


  // Form state for user parameters
  const [userParams, setUserParams] = useState({
    dietaryRestrictions: "none",
    targetCalories: "", // Changed from calorieGoal to targetCalories
    mealType: "balanced",
    ingredientsToInclude: "",
    ingredientsToExclude: "",
    height: ``, // Initialize as empty strings to avoid potential issues
    weight: '',
    age: '',
    gender: '',
    goal: '', // Changed from nutritionGoal to goal
    activityLevel: '',
    mealFrequency: '',
    snackPreference: '',
    hydrationPreference: '',
    cookingSkill: '',
    timePerMeal: '',
    budget: '',
    healthConditions: ''
  });

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

  // Info tooltip component to match the website
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
            color: COLORS.LIGHT_GRAY, // Slightly lighter on hover for feedback
          }
        }}
      />
    </Tooltip>
  );

  useEffect(() => {
    console.log("🧍 User from store:", user);
  }, [user]);

  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setMealAmount(response.data.mealCount || 0);
        setFetchMealCountError(null); // Clear any previous error
      } catch (error) {
        console.error("Error fetching meal count:", error);
        setFetchMealCountError(error);
      }
    };

    fetchMealCount();
  }, []);

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/meal-plans/generate",
        userParams,
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        setMealData(response.data.mealPlan);
        setSavedMeal(response.data.savedMeal);
        toast.dismiss();

        toast.success("Meal plan generated and saved successfully!", {
          duration: 2000,
          icon: '🥗',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });

        setMealAmount(prevMealAmount => prevMealAmount + 1);

        // Navigate to the details page of the newly saved meal (if applicable)
        if (response.data.savedMeal && response.data.savedMeal._id) {
          navigate(`/meals/${response.data.savedMeal._id}`);
        } else {
          // Automatically scroll to results if navigation fails or isn't desired
          setTimeout(() => {
            document.getElementById('meal-result')?.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      } else {
        toast.dismiss();
        console.error("Error generating meal plan:", response);
        toast.error(`Failed to generate meal plan. Server responded with status ${response.status}. Please try again later.`);
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error generating meal plan:", error);
      toast.error("Failed to generate meal plan. Please check your network connection and try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async () => {
    // Show loading toast
    const loadingToast = toast.loading("Logging meal...", {
      style: {
        background: COLORS.DARK_GRAY,
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.MEDIUM_GRAY}`
      }
    });

    try {
      const response = await axios.post("http://localhost:5000/api/tracker",
        { type: "meal" },
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.dismiss(loadingToast);

        console.log("Api Response (Meal Log):", response.data);
        setMealAmount(prevMealAmount => prevMealAmount + 1);

        toast.success("Meal logged successfully!", {
          duration: 2000,
          icon: '🥗',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      } else {
        toast.dismiss(loadingToast);
        console.error("Error logging meal:", response);
        toast.error(`Failed to log meal. Server responded with status ${response.status}. Please try again later.`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      console.error("Error logging meal:", error);
      toast.error("Failed to log meal. Please check your network connection and try again later.");
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
          Creating your personalized meal plan...
        </div>
      </div>
    );
  }

  return (
    // Wrap the entire display within the themeprovider to have access to the theme for the tooltip styling
    <ThemeProvider theme={tooltipTheme}>
      <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 flex justify-center"
            style={{ color: COLORS.NEON_GREEN }}>
            Nutrition Planner
          </h1>
          <p className="text-lg md:text-xl text-[#B0B0B0] flex justify-center">
            Get AI-powered custom meal plans. Please fill out the questionnaire below to get started.
          </p>
        </header>
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {/* Nutrition Parameters Form */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Your Preferences
                <InfoTooltip title="Answer a few questions to get personalized meal suggestions based on your dietary needs and goals." />
              </h2>

              <NutritionQuestionnaire
                userParams={userParams}
                setUserParams={setUserParams}
                onSubmit={generateMealPlan}
                loading={loading}
              />
            </div>

            {/* Nutrition Tracker */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Nutrition Tracker
              </h2>

              <p className="mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
                Keep track of your meals to stay on top of your nutrition goals.
              </p>

              <div className="p-4 border rounded-lg mb-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <h3 className="font-medium" style={{ color: COLORS.WHITE }}>
                  Logged Meals
                  <InfoTooltip title="This shows the total number of meals you've logged as consumed." />
                </h3>
                <p className="text-2xl font-bold mb-3" style={{ color: COLORS.NEON_GREEN }}>{mealAmount !== null ? mealAmount : 'N/A'}</p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  className="px-4 py-2 rounded-lg transition font-medium flex items-center hover:opacity-90"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                  onClick={addMeal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 000 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Log Meal
                  <InfoTooltip title="Click here to record that you've had a meal." />
                </button>

                <button
                  className="px-4 py-2 rounded-lg transition font-medium flex items-center"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                  onClick={() => setShowSavedMeals(!showSavedMeals)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 010-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  {showSavedMeals ? 'Hide Saved Meals' : 'View Saved Meals'}
                  <InfoTooltip title="Toggle the display of your saved meal plans" />
                </button>
              </div>
              {fetchMealCountError && (
                <p className="mt-2 text-sm text-red-500">
                  Failed to load meal count
                  <InfoTooltip title="There was a network error loading your meal count. Try refreshing the page or check your connection." />
                </p>
              )}
            </div>
          </div>

          {/* Display saved meals */}
          {showSavedMeals && (
            <div className="mt-8 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Your Meal Library
                <InfoTooltip title="This is your personal collection of saved meal plans that you can access anytime" />
              </h2>

              <SavedMealsList />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NutritionPage;