import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WorkoutQuestionnaire from "../components/WorkoutQuestionnaire";
import SavedWorkoutsList from "../components/SavedWorkoutsList";
import COLORS from '../lib/constants';
import { useUserStore } from "../stores/useUserStore";
import WorkoutStreak from "../components/WorkoutStreak";


const WorkoutPage = () =>
{
    // State variables
    const [workoutAmount, setWorkoutAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showSavedWorkouts, setShowSavedWorkouts] = useState(true);
    const [workoutData, setWorkoutData] = useState(null);
    const [savedWorkout, setSavedWorkout] = useState(null);
    const [nextGenerationTime, setNextGenerationTime] = useState(null);
    const navigate = useNavigate();
    const [fetchWorkoutCountError, setFetchWorkoutCountError] = useState(null);
    const { user, setUnlockedAchievement } = useUserStore();
    const hasCheckedLift = useRef(false);
    const [autoFillEnabled, setAutoFillEnabled] = useState(() =>
    {
        const stored = localStorage.getItem("autoFillEnabled");
        return stored === "true"; // returns true or false
    });
    const didInitialAutoFill = useRef(false);


    // Form state for user parameters (unchanged)
    const [userParams, setUserParams] = useState({
        height: "",
        weight: "",
        age: "",
        gender: "not-specified",
        fitnessGoal: "",
        experienceLevel: "beginner",
        equipment: "minimal",
        timeFrame: "30-minutes",
        healthConditions: "none",
        frequency: "3-4"
    });

    // Custom theme for tooltips to match the website (This is for the description)
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
                    gender: profile.gender || "not-specified",
                    fitnessGoal: profile.fitnessGoal || "",
                    experienceLevel: profile.experienceLevel || "beginner",
                    healthConditions: profile.healthConditions || "none"
                }));

                if (!silent)
                {
                    toast.success("Workout form auto-filled from profile!", {
                        duration: 3000,
                        icon: '✅',
                        style: {
                            background: COLORS.DARK_GRAY,
                            color: COLORS.NEON_GREEN,
                            border: `1px solid ${COLORS.MEDIUM_GRAY}`
                        }
                    });
                }
            }
            catch (error)
            {
                console.error("Error autofilling from profile:", error);
                toast.error("Failed to autofill. Please try again.", {
                    duration: 3000,
                    style:
                    {
                        background: COLORS.DARK_GRAY,
                        color: COLORS.WHITE,
                        border: `1px solid ${COLORS.MEDIUM_GRAY}`
                    }
                });
            }
        };

    useEffect(() =>
    {
        if (autoFillEnabled)
        {
            fetchProfileData(!didInitialAutoFill.current);
            didInitialAutoFill.current = true;
        }
    }, [autoFillEnabled]);
        
    


  // Info tooltip component to match the website (This is for the icon)
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

    useEffect(() =>
    {
        const checkHighestLift = async () =>
        {
            try
            {
                const response = await axios.get("http://localhost:5000/api/workouts", { withCredentials: true });
                const allWorkouts = response.data || [];

                let maxLift = 0;
                allWorkouts.forEach(workout =>
                {
                    workout.exercises.forEach(ex =>
                    {
                        if (ex.weight && ex.weight > maxLift)
                        {
                            maxLift = ex.weight;
                        }
                    });
                });

                await axios.post("http://localhost:5000/api/auth/max-lift", { maxLift }, { withCredentials: true });

                if (user?.maxLift !== undefined && maxLift > user.maxLift)
                {
                    setUnlockedAchievement({
                        title: `New Max Lift: ${maxLift} lbs`,
                        description: `You've hit a new personal record!`,
                    });
                }

            } catch (err)
            {
                console.error("Error checking max lift:", err);
            }
        };

        if (user && !hasCheckedLift.current)
        {
            hasCheckedLift.current = true;
            checkHighestLift();
        }
    }, [user, setUnlockedAchievement]);


  useEffect(() => {
    const fetchWorkoutCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setWorkoutAmount(response.data.workoutCount || 0);
        setFetchWorkoutCountError(null); // Clear any previous error
      } catch (error) {
        console.error("Error fetching workout count:", error);
        setFetchWorkoutCountError(error);
      }
    };

    fetchWorkoutCount();
  }, []);

 
  // Function to calculate time until next generation
  const calculateNextGenerationTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  // Function to format time remaining
  const formatTimeRemaining = (nextTime) => {
    const now = new Date();
    const diff = nextTime - now;
    
    if (diff <= 0) return "Available now!";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  // Update next generation time every minute
  useEffect(() => {
    const updateTimer = () => {
      setNextGenerationTime(calculateNextGenerationTime());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const generateWorkoutPlan = async () => {
    // Validate required fields
    if (!userParams.height || !userParams.weight || !userParams.fitnessGoal) {
      toast.error("Please fill in the required fields: Height, Weight, and Fitness Goal", {
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
    const loadingToast = toast.loading("Generating your workout plan...", {
      style: {
        background: COLORS.DARK_GRAY,
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.MEDIUM_GRAY}`
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/workouts/generate",
        userParams,
        { withCredentials: true }
      );

      console.log("Server Response:", response.data);

      if (response.data.workoutPlan) {
        toast.dismiss(loadingToast);
        setWorkoutData(response.data.workoutPlan);
        setSavedWorkout(response.data.savedWorkout);
        setNextGenerationTime(calculateNextGenerationTime());

        toast.success("Workout generated and saved successfully!", {
          duration: 2000,
          icon: '💪',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });

        if (response.data.savedWorkout && response.data.savedWorkout._id) {
          navigate(`/workouts/${response.data.savedWorkout._id}`);
        } else {
          setTimeout(() => {
            document.getElementById('workout-result')?.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error generating workout:", error);
      console.error("Error response:", error.response?.data);
      
      if (error.response?.status === 429) {
        setNextGenerationTime(calculateNextGenerationTime());
        toast.error(error.response.data.error, {
          duration: 4000,
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error, {
          duration: 4000,
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      } else {
        toast.error("Failed to generate workout. Please check your network connection and try again later.", {
          duration: 4000,
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async () => {
    // Show loading toast
    const loadingToast = toast.loading("Logging workout...", {
      style: {
        background: COLORS.DARK_GRAY,
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.MEDIUM_GRAY}`
      }
    });

    try {
      const response = await axios.post("http://localhost:5000/api/tracker",
        { type: "workout" },
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.dismiss(loadingToast);

        console.log("Api Response:", response.data);

        // Trigger streak update component via event
        window.dispatchEvent(new Event("workoutLogged"));

        toast.success("Workout logged successfully!", {
          duration: 2000,
          icon: '💪',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });
      } else {
        toast.dismiss(loadingToast);
        console.error("Error logging workout:", response);
        toast.error(`Failed to log workout. Server responded with status ${response.status}. Please try again later.`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      console.error("Error logging workout:", error);
      toast.error("Failed to log workout. Please check your network connection and try again later.");
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
          Creating your personalized workout plan...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="p-8 text-lg font-medium" style={{ color: COLORS.WHITE }}>
          <svg className="animate-spin h-6 w-6 mr-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating your personalized workout plan...
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
          Workout Generator
          </h1>
          <p className="text-lg md:text-xl text-[#B0B0B0] flex justify-center">
          Get AI-powered custom workout plans. Please fill out the questionnaire below to get started.
          </p>
        </header>
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {/* Workout Parameters Form */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Your Parameters
                <InfoTooltip title="Fill out the questions to get a personalized workout plan based on your specific goals and information." />
              </h2>
              
              {/* Next Generation Time Indicator */}
              {nextGenerationTime && (
                <div className="mb-4 p-3 rounded-lg" style={{ 
                  backgroundColor: `${COLORS.BLACK}80`,
                  border: `1px solid ${COLORS.MEDIUM_GRAY}`
                }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: COLORS.WHITE }}>
                      Next workout generation available:
                    </span>
                    <span className="text-sm font-medium" style={{ 
                      color: formatTimeRemaining(nextGenerationTime) === "Available now!" 
                        ? COLORS.NEON_GREEN 
                        : COLORS.WHITE 
                    }}>
                      {formatTimeRemaining(nextGenerationTime)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mb-4 flex items-center gap-3">
                <label htmlFor="autofill-toggle" className="text-sm font-medium" style={{ color: COLORS.WHITE }}>
                  Autofill From Profile
                </label>
                <input
                  id="autofill-toggle"
                  type="checkbox"
                  checked={autoFillEnabled}
                  onChange={(e) => {
                      const checked = e.target.checked;
                      setAutoFillEnabled(checked);
                      localStorage.setItem("autoFillEnabled", checked.toString());
                  }}
                  className="toggle-checkbox w-6 h-6 rounded"
                />
              </div>

              <WorkoutQuestionnaire
                userParams={userParams}
                setUserParams={setUserParams}
                onSubmit={generateWorkoutPlan}
                loading={loading}
              />
            </div>

            {/* Workout Tracker */}
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Workout Tracker
              </h2>

              <p className="mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
                Track your completed workouts to monitor your progress
              </p>

              <div className="p-4 border rounded-lg mb-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <h3 className="font-medium" style={{ color: COLORS.WHITE }}>
                  Completed Workouts
                  <InfoTooltip title="This shows the total number of workouts you've completed" />
                </h3>
                <p className="text-2xl font-bold mb-3" style={{ color: COLORS.NEON_GREEN }}>{workoutAmount !== null ? workoutAmount : 'N/A'}</p>
              </div>

              <WorkoutStreak onWorkoutLogged={() => setWorkoutAmount(prev => prev + 1)} />

              <div className="p-4 border rounded-lg" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                  Complete your daily workout to increase your count. Visit your workout and complete each exercise to mark workout as complete.
                </p>
              </div>

              <div className="flex flex-col space-y-3 mt-4">
                <button
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium flex items-center justify-center 
                             hover:opacity-90 active:opacity-80 min-h-[44px]"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                  onClick={() => setShowSavedWorkouts(!showSavedWorkouts)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 010-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {showSavedWorkouts ? 'Hide Saved Workouts' : 'View Saved Workouts'}
                  </span>
                  <InfoTooltip title="Toggle the display of your saved workout plans" />
                </button>
              </div>
            </div>
          </div>

          {/* Display saved workouts - RENDERS LIST OF SAVED WORKOUTS */}
          {showSavedWorkouts && (
            <div className="mt-8 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>
                Your Workout Library
                <InfoTooltip title="This is your personal collection of saved workout plans that you can access anytime" />
              </h2>

              <SavedWorkoutsList />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default WorkoutPage;