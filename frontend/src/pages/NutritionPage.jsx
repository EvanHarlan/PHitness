import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import NutritionQuestionnaire from "../components/NutritionQuestionnaire";
import { COLORS } from '../lib/constants';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const NutritionPage = () => {
  const [mealAmount, setMealAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mealPlanData, setMealPlanData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
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
  });
  const [fetchMealCountError, setFetchMealCountError] = useState(null);

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom theme for tooltips to match the website
  const tooltipTheme = createTheme({
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            padding: isMobile ? '6px 10px' : '8px 12px',
            maxWidth: isMobile ? '250px' : '300px',
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
          fontSize: isMobile ? '16px' : '18px', 
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
        "http://localhost:5000/api/meals/generate",
        userParams,
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        setMealPlanData(response.data.mealPlan);
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
        <div className="p-4 sm:p-8 text-base sm:text-lg font-medium" style={{ color: COLORS.WHITE }}>
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <header className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-center"
          style={{ color: COLORS.NEON_GREEN }}>
          Meal Plan Generator
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#B0B0B0] text-center">
          Get AI-powered custom meal plans. Please fill out the questionnaire below to get started.
          </p>
        </header>
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
            {/* Nutrition Parameters Form */}
            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                <span>Your Nutrition Parameters</span>
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
            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Meal Tracker
              </h2>

              <p className="text-sm sm:text-base mb-3 sm:mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
                Track your meals to monitor your progress
              </p>

              <div className="p-3 sm:p-4 border rounded-lg mb-3 sm:mb-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <h3 className="text-sm sm:text-base font-medium flex items-center" style={{ color: COLORS.WHITE }}>
                  <span>Meals Logged</span>
                  <InfoTooltip title="This shows the total number of meals you've logged as completed" />
                </h3>
                <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  {mealAmount !== null ? mealAmount : 'N/A'}
                </p>
              </div>

              <div className="flex flex-col space-y-2 sm:space-y-3">
                <button
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium flex items-center justify-center hover:opacity-90 active:opacity-80"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                  onClick={addMeal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">Log Meal</span>
                </button>
              </div>
              {fetchMealCountError && (
                <p className="mt-2 text-xs sm:text-sm text-red-500">Failed to load meal count.</p>
              )}
            </div>
          </div>

          {/* Meal Plan Results */}
          {mealPlanData && (
            <div className="mt-4 sm:mt-6 md:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4" style={{ color: COLORS.WHITE }}>Your Generated Meal Plan</h2>
              <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                {typeof mealPlanData === 'object' && mealPlanData !== null ? (
                  <pre className="text-xs sm:text-sm whitespace-pre-wrap" style={{ color: COLORS.LIGHT_GRAY }}>{JSON.stringify(mealPlanData, null, 2)}</pre>
                ) : (
                  <p className="text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>{mealPlanData}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NutritionPage;
