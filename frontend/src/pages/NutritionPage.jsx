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
  // Track viewport size for responsive design
  const [isMobile, setIsMobile] = useState(false);

  // Form state for user parameters
  const [userParams, setUserParams] = useState({
    dietaryRestrictions: "none",
    targetCalories: "",
    mealType: "balanced",
    ingredientsToInclude: "",
    ingredientsToExclude: "",
    height: "",
    weight: '',
    age: '',
    gender: '',
    goal: '',
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
            fontSize: '0.75rem',
            padding: '6px 10px',
            maxWidth: '250px',
            zIndex: 9999,
          },
          arrow: {
            color: COLORS.DARK_GRAY,
          }
        }
      }
    }
  });

  // Mobile-specific tooltip adjustments
  const getMobileTooltipStyles = () => ({
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            padding: isMobile ? '6px 10px' : '8px 12px',
            maxWidth: isMobile ? '250px' : '300px',
          }
        }
      }
    }
  });

  // Detect mobile viewport on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Info tooltip component with mobile optimization
  const InfoTooltip = ({ title }) => (
    <Tooltip 
      title={title} 
      arrow 
      placement={isMobile ? "bottom" : "top"}
      enterTouchDelay={50}
      leaveTouchDelay={1500}
    >
      <HelpOutlineIcon
        sx={{
          color: COLORS.NEON_GREEN,
          fontSize: isMobile ? '16px' : '18px',
          marginLeft: '5px',
          verticalAlign: 'middle',
          cursor: 'pointer',
          padding: isMobile ? '2px' : '0', // Increase touch target size
          '&:hover': {
            color: COLORS.LIGHT_GRAY,
          }
        }}
        aria-label={`Info: ${title}`}
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
        setFetchMealCountError(null);
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
      // Create a properly formatted payload with all required fields
      const payload = {
        goal: userParams.goal,
        weight: Number(userParams.weight),
        height: userParams.height,
        age: Number(userParams.age),
        gender: userParams.gender,
        activityLevel: userParams.activityLevel || 'moderate',
        dietaryRestrictions: userParams.dietaryRestrictions || [],
        mealFrequency: userParams.mealFrequency || 3,
        snackPreference: userParams.snackPreference || 'no',
        dailyWaterIntake: userParams.hydrationPreference || 'moderate',
        cookingSkillLevel: userParams.cookingSkill || 'Intermediate'
      };

      console.log("🚀 Payload being sent:", payload);

      const response = await axios.post(
        "http://localhost:5000/api/meal-plans/generate",
        payload,
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        setMealData(response.data.mealPlan);
        setSavedMeal(response.data.savedMeal);
        toast.dismiss();

        toast.success("Meal plan generated!", {
          duration: 2000,
          icon: '🥗',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
            fontSize: isMobile ? '0.875rem' : '1rem',
            padding: isMobile ? '8px 12px' : '10px 16px'
          }
        });

        setMealAmount(prevMealAmount => prevMealAmount + 1);

        if (response.data.savedMeal && response.data.savedMeal._id) {
          navigate(`/meals/${response.data.savedMeal._id}`);
        } else {
          setTimeout(() => {
            document.getElementById('meal-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      } else {
        toast.dismiss();
        console.error("Error generating meal plan:", response);
        toast.error(`Failed to generate meal plan. Please try again.`, {
          style: {
            background: COLORS.DARK_GRAY,
            color: '#ff6b6b',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }
        });
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error generating meal plan:", error);
      toast.error("Network error. Please try again.", {
        style: {
          background: COLORS.DARK_GRAY,
          color: '#ff6b6b',
          fontSize: isMobile ? '0.875rem' : '1rem'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async () => {
    const loadingToast = toast.loading("Logging meal...", {
      style: {
        background: COLORS.DARK_GRAY,
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        fontSize: isMobile ? '0.875rem' : '1rem'
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

        toast.success("Meal logged!", {
          duration: 2000,
          icon: '🥗',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
            fontSize: isMobile ? '0.875rem' : '1rem'
          }
        });
      } else {
        toast.dismiss(loadingToast);
        console.error("Error logging meal:", response);
        toast.error(`Failed to log meal. Please try again.`, {
          style: {
            background: COLORS.DARK_GRAY,
            color: '#ff6b6b',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      console.error("Error logging meal:", error);
      toast.error("Network error. Please try again.", {
        style: {
          background: COLORS.DARK_GRAY,
          color: '#ff6b6b',
          fontSize: isMobile ? '0.875rem' : '1rem'
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6" 
        style={{ backgroundColor: COLORS.BLACK }}
        role="status"
        aria-live="polite"
      >
        <div className="p-4 sm:p-6 text-base sm:text-lg font-medium rounded-lg flex items-center justify-center" 
          style={{ color: COLORS.WHITE, backgroundColor: COLORS.DARK_GRAY, maxWidth: '90%' }}>
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" 
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating your personalized meal plan...
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={createTheme({
      ...tooltipTheme,
      ...getMobileTooltipStyles()
    })}>
      <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <header className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-center"
            style={{ color: COLORS.NEON_GREEN }}>
            Nutrition Planner
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#B0B0B0] text-center px-2">
            Get AI-powered custom meal plans tailored to your needs.
          </p>
        </header>
        
        {/* Skip to content link for keyboard accessibility */}
        <a href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:m-2 focus:text-white focus:bg-neon-green focus:z-50 focus:rounded">
          Skip to main content
        </a>
        
        <main id="main-content" className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:gap-8">
            {/* Nutrition Parameters Form */}
            <section className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
              style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center" 
                style={{ color: COLORS.WHITE }}>
                Your Preferences
                <InfoTooltip title="Answer questions to get personalized meal suggestions based on your dietary needs and goals." />
              </h2>

              <NutritionQuestionnaire
                userParams={userParams}
                setUserParams={setUserParams}
                onSubmit={generateMealPlan}
                loading={loading}
                isMobile={isMobile}
              />
            </section>

            {/* Nutrition Tracker */}
            <section className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
              style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" 
                style={{ color: COLORS.WHITE }}>
                Nutrition Tracker
              </h2>

              <p className="mb-3 sm:mb-4 text-sm sm:text-base" 
                style={{ color: COLORS.LIGHT_GRAY }}>
                Keep track of your meals to stay on top of your nutrition goals.
              </p>

              <div className="p-3 sm:p-4 border rounded-lg mb-3 sm:mb-4" 
                style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <h3 className="font-medium text-sm sm:text-base flex items-center" 
                  style={{ color: COLORS.WHITE }}>
                  Logged Meals
                  <InfoTooltip title="Total number of meals you've logged as consumed." />
                </h3>
                <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" 
                  style={{ color: COLORS.NEON_GREEN }}>
                  {mealAmount !== null ? mealAmount : 'N/A'}
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium flex items-center justify-center hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-green min-h-[44px]"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                  onClick={addMeal}
                  aria-label="Log a meal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" 
                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 000 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs sm:text-sm">Log Meal</span>
                  <InfoTooltip title="Click to record that you've had a meal." />
                </button>

                <button
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium flex items-center justify-center hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medium-gray min-h-[44px]"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                  onClick={() => setShowSavedMeals(!showSavedMeals)}
                  aria-expanded={showSavedMeals}
                  aria-controls="saved-meals-section"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" 
                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 010-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {showSavedMeals ? 'Hide Saved Meals' : 'View Saved Meals'}
                  </span>
                  <InfoTooltip title="Toggle the display of your saved meal plans" />
                </button>
              </div>
              
              {fetchMealCountError && (
                <p className="mt-2 text-xs sm:text-sm text-red-500 flex items-center">
                  Failed to load meal count
                  <InfoTooltip title="Network error loading your meal count. Try refreshing the page." />
                </p>
              )}
            </section>
          </div>

          {/* Display saved meals */}
          {showSavedMeals && (
            <section 
              id="saved-meals-section"
              className="mt-6 sm:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
              style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center" 
                style={{ color: COLORS.WHITE }}>
                Your Meal Library
                <InfoTooltip title="Your personal collection of saved meal plans" />
              </h2>

              <SavedMealsList isMobile={isMobile} />
            </section>
          )}
          
          {/* Add an element for meal plan results to scroll to */}
          {mealData && <div id="meal-result" className="pt-4"></div>}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default NutritionPage;
