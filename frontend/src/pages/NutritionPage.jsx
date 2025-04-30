import { useState, useEffect, useRef } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(() => 
  {
      const stored = localStorage.getItem("nutritionAutoFillEnabled");
      return stored === "true";
  });
  const firstLoad = useRef(true);
  const [nextGenerationTime, setNextGenerationTime] = useState(null);
  const [lastMealPlanGeneration, setLastMealPlanGeneration] = useState(null);
  const [canGenerateMealPlan, setCanGenerateMealPlan] = useState(true);

  // Form state for user parameters
  const [userParams, setUserParams] = useState({
    dietaryRestrictions: [], // Array for multiple selections
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
    healthConditions: [] // Array for multiple selections
  });

  // Function to calculate time until next generation
  const calculateNextGenerationTime = () => {
    if (!lastMealPlanGeneration) return new Date();
    
    const now = new Date();
    const lastGen = new Date(lastMealPlanGeneration);
    
    // Check if the last generation was today
    const isToday = lastGen.toDateString() === now.toDateString();
    
    if (isToday) {
      // If generated today, next generation is 24 hours from last generation
      const nextGen = new Date(lastGen);
      nextGen.setHours(nextGen.getHours() + 24);
      return nextGen;
    } else {
      // If not generated today, can generate now
      return now;
    }
  };

  // Function to format time remaining
  const formatTimeRemaining = (nextTime) => {
    if (!nextTime) return "No previous meal plan generation";
    
    const now = new Date();
    const diff = nextTime - now;
    
    if (diff <= 0) return "Available now!";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  };

  // Update next generation time every second
  useEffect(() => {
    const updateTimer = () => {
      const nextTime = calculateNextGenerationTime();
      setNextGenerationTime(nextTime);
      
      // Update canGenerateMealPlan based on the next generation time
      if (nextTime) {
        const now = new Date();
        setCanGenerateMealPlan(now >= nextTime);
      } else {
        setCanGenerateMealPlan(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [lastMealPlanGeneration]);

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

  // Adjust animation settings for mobile
  const animationSettings = {
    duration: isMobile ? 0.5 : 0.8,
    delay: isMobile ? 0.1 : 0.2
  };

  // Info tooltip component to match the website
  const InfoTooltip = ({ title }) => (
    <Tooltip 
      title={title} 
      arrow 
      placement={isMobile ? "bottom" : "top"}
      enterTouchDelay={isMobile ? 50 : 100}
      leaveTouchDelay={isMobile ? 1500 : 500}
    >
      <HelpOutlineIcon
        sx={{
          color: COLORS.NEON_GREEN,
          fontSize: isMobile ? '16px' : '18px',
          marginLeft: '5px',
          verticalAlign: 'middle',
          cursor: 'pointer',
          padding: isMobile ? '2px' : '0',
          '&:hover': {
            color: COLORS.LIGHT_GRAY, // Slightly lighter on hover for feedback
          }
        }}
      />
    </Tooltip>
  );

  // Fetch profile data for auto-filling
  const fetchProfileData = async (silent = false) =>
  {
      try
      {
          const res = await axios.get("http://localhost:5000/api/auth/profile", { withCredentials: true });
          const profile = res.data;

          setUserParams(prev => ({
              ...prev,
              height: profile.height || "",
              weight: profile.weight || "",
              age: profile.age || "",
              gender: profile.gender || "not-specified"
          }));

          if (!silent)
          {
              toast.success("Nutrition form auto-filled from profile!", {
                  duration: 3000,
                  icon: '✅',
                  style: {
                      background: COLORS.DARK_GRAY,
                      color: COLORS.NEON_GREEN,
                      border: `1px solid ${COLORS.MEDIUM_GRAY}`
                  }
              });
          }
      } catch (error)
      {
          console.error("Error autofilling nutrition profile:", error);
          toast.error("Failed to autofill nutrition form. Please try again.");
      }
  };

  // Auto-fill on initial load if enabled
  useEffect(() => {
      if (autoFillEnabled)
      {
          fetchProfileData(true); // silent to prevent double toast
      }
  }, []);

  // Handle changes to auto-fill state
  useEffect(() => {
    if (firstLoad.current) 
    {
        firstLoad.current = false;
        return;
    }

    if (autoFillEnabled)
    {
        fetchProfileData();
    }
  }, [autoFillEnabled]);

  // Log user from store (for debugging)
  useEffect(() => {
    console.log("🧍 User from store:", user);
  }, [user]);

  // Fetch meal count
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

  // Fetch last meal plan generation time on component mount
  useEffect(() => {
    const fetchLastMealPlanGeneration = async () => {
      try {
        // Get the tracker for meal plans
        const response = await axios.get("http://localhost:5000/api/tracker", { withCredentials: true });
        const tracker = response.data.find(t => t.type === "meal-plan");
        
        if (tracker && tracker.lastGenerationDate) {
          const lastGenDate = new Date(tracker.lastGenerationDate);
          setLastMealPlanGeneration(lastGenDate);
          
          // Check if the last generation was today
          const now = new Date();
          const isToday = lastGenDate.toDateString() === now.toDateString();
          
          if (isToday) {
            setCanGenerateMealPlan(false);
            // Calculate next generation time (24 hours from last generation)
            const nextGen = new Date(lastGenDate);
            nextGen.setHours(nextGen.getHours() + 24);
            setNextGenerationTime(nextGen);
          } else {
            setCanGenerateMealPlan(true);
            setNextGenerationTime(now);
          }
        } else {
          setCanGenerateMealPlan(true);
          setNextGenerationTime(new Date());
        }
      } catch (error) {
        console.error("Error fetching meal plan tracker:", error);
        // Default to allowing generation if there's an error
        setCanGenerateMealPlan(true);
        setNextGenerationTime(new Date());
      }
    };

    fetchLastMealPlanGeneration();

    // Add event listener for meal plan deletion
    const handleMealPlanDeleted = () => {
      fetchLastMealPlanGeneration();
    };

    window.addEventListener('mealPlanDeleted', handleMealPlanDeleted);

    return () => {
      window.removeEventListener('mealPlanDeleted', handleMealPlanDeleted);
    };
  }, []);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (nextGenerationTime) {
        const now = new Date();
        if (now >= nextGenerationTime) {
          setCanGenerateMealPlan(true);
          setNextGenerationTime(now);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextGenerationTime]);

  const generateMealPlan = async () => {
    if (!canGenerateMealPlan) {
      toast.error("You can only generate one meal plan per day. Please try again tomorrow.", {
        duration: 4000,
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
      return;
    }

    setLoading(true);
    try {
      // Convert height from imperial to metric if needed for the API
      let heightInCm = null;
      if (userParams.heightInInches) {
        heightInCm = Math.round(userParams.heightInInches * 2.54);
      }
      
      // Convert weight from pounds to kg if needed for the API
      let weightInKg = null;
      if (userParams.weight) {
        weightInKg = Math.round(userParams.weight / 2.2046);
      }
      
      // Create a properly formatted payload with all required fields
      const payload = {
        goal: userParams.goal,
        weight: weightInKg || Number(userParams.weight),
        height: heightInCm || userParams.height,
        age: Number(userParams.age),
        gender: userParams.gender,
        activityLevel: userParams.activityLevel || 'moderate',
        dietaryRestrictions: userParams.dietaryRestrictions.length > 0 ? userParams.dietaryRestrictions : [],
        mealFrequency: userParams.mealFrequency || 3,
        snackPreference: userParams.snackPreference || 'no',
        dailyWaterIntake: userParams.hydrationPreference || 'moderate',
        cookingSkillLevel: userParams.cookingSkill || 'Intermediate',
        healthConditions: userParams.healthConditions.length > 0 ? userParams.healthConditions : []
      };

      const response = await axios.post(
        "http://localhost:5000/api/meal-plans/generate",
        payload,
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        setMealData(response.data.mealPlan);
        setSavedMeal(response.data.savedMeal);
        
        // Update the last generation time from the response
        if (response.data.lastGenerationDate) {
          const lastGenDate = new Date(response.data.lastGenerationDate);
          setLastMealPlanGeneration(lastGenDate);
          
          // Calculate next generation time (24 hours from last generation)
          const nextGen = new Date(lastGenDate);
          nextGen.setHours(nextGen.getHours() + 24);
          setNextGenerationTime(nextGen);
          setCanGenerateMealPlan(false);
        }

        toast.success("Meal plan generated!", {
          duration: 2000,
          icon: '🥗',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
            fontSize: isMobile ? '0.875rem' : '1rem'
          }
        });

        if (response.data.savedMeal && response.data.savedMeal._id) {
          navigate(`/meals/${response.data.savedMeal._id}`);
        } else {
          setTimeout(() => {
            document.getElementById('meal-result')?.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      
      if (error.response?.status === 429) {
        // Update the last generation time from the error response if available
        const lastGenDate = error.response.data.lastGenerationDate;
        if (lastGenDate) {
          setLastMealPlanGeneration(new Date(lastGenDate));
          setNextGenerationTime(calculateNextGenerationTime());
          setCanGenerateMealPlan(false);
        }
        
        toast.error(error.response.data.error, {
          duration: 4000,
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      } else {
        toast.error("Failed to generate meal plan. Please check your connection.", {
          style: {
            background: COLORS.DARK_GRAY,
            color: '#ff6b6b',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="p-4 sm:p-6 text-base sm:text-lg font-medium" style={{ color: COLORS.WHITE }}>
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <header className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-center"
            style={{ color: COLORS.NEON_GREEN }}>
            Nutrition Planner
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#B0B0B0] text-center">
            Get AI-powered custom meal plans tailored to your needs.
          </p>
        </header>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:gap-8">
            {/* Nutrition Parameters Form */}
            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                 style={{ 
                   backgroundColor: COLORS.DARK_GRAY, 
                   borderColor: COLORS.MEDIUM_GRAY,
                 }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Your Preferences
                <InfoTooltip title="Answer questions to get personalized meal suggestions based on your dietary needs and goals." />
              </h2>

              {/* Next Generation Time Indicator */}
              <div className="mb-4 p-3 rounded-lg" style={{ 
                backgroundColor: `${COLORS.BLACK}80`,
                border: `1px solid ${COLORS.MEDIUM_GRAY}`
              }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: COLORS.WHITE }}>
                    {canGenerateMealPlan ? "You can now generate a meal plan." : "Next meal plan generation available:"}
                  </span>
                  <span className="text-sm font-medium" style={{ 
                    color: canGenerateMealPlan ? COLORS.NEON_GREEN : COLORS.WHITE 
                  }}>
                    {canGenerateMealPlan ? "Generate now!" : formatTimeRemaining(nextGenerationTime)}
                  </span>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <label htmlFor="autofill-toggle" className="text-sm font-medium" style={{ color: COLORS.WHITE }}>
                    Autofill From Profile
                </label>
                <input
                   id="autofill-toggle"
                   type="checkbox"
                   checked={autoFillEnabled}
                   onChange={(e) =>
                   {
                       const checked = e.target.checked;
                       setAutoFillEnabled(checked);
                       localStorage.setItem("nutritionAutoFillEnabled", checked.toString());
                   }}
                   className="toggle-checkbox w-6 h-6 rounded"
                />
              </div>

              <NutritionQuestionnaire
                userParams={userParams}
                setUserParams={setUserParams}
                onSubmit={generateMealPlan}
                loading={loading}
                canGenerateMealPlan={canGenerateMealPlan}
                nextGenerationTime={nextGenerationTime}
              />
            </div>

            {/* Nutrition Tracker */}
            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                 style={{ 
                   backgroundColor: COLORS.DARK_GRAY, 
                   borderColor: COLORS.MEDIUM_GRAY,
                 }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Nutrition Tracker
              </h2>

              <p className="mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>
                Keep track of your meals to stay on top of your nutrition goals.
              </p>

              <div className="p-3 sm:p-4 border rounded-lg mb-3 sm:mb-4" 
                   style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <h3 className="font-medium text-sm sm:text-base" style={{ color: COLORS.WHITE }}>
                  Completed Meal Plans
                  <InfoTooltip title="Total number of meal plans you've completed." />
                </h3>
                <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  {mealAmount !== null ? mealAmount : 'N/A'}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                  Complete your daily meal plan to increase your count. Visit your meal plan and follow the recipes to mark it as complete.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium flex items-center justify-center 
                             hover:opacity-90 active:opacity-80 min-h-[44px]"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                  onClick={() => setShowSavedMeals(!showSavedMeals)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 010-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {showSavedMeals ? 'Hide Saved Meals' : 'View Saved Meals'}
                  </span>
                  <InfoTooltip title="Toggle the display of your saved meal plans" />
                </button>
              </div>
              
              {fetchMealCountError && (
                <p className="mt-2 text-xs sm:text-sm text-red-500">
                  Failed to load meal count
                  <InfoTooltip title="Network error loading your meal count. Try refreshing the page." />
                </p>
              )}
            </div>
          </div>

          {/* Display saved meals */}
          {showSavedMeals && (
            <div className="mt-6 sm:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                 style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Your Meal Library
                <InfoTooltip title="Your personal collection of saved meal plans" />
              </h2>

              <SavedMealsList />
            </div>
          )}
          
          {/* Add an element for meal plan results to scroll to */}
          {mealData && <div id="meal-result" className="pt-4"></div>}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NutritionPage;
