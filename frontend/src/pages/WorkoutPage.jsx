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
//WORKOUT PAGE
const WorkoutPage = () => {
  // State variables
  const [workoutAmount, setWorkoutAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSavedWorkouts, setShowSavedWorkouts] = useState(true);
  const [workoutData, setWorkoutData] = useState(null);
  const [savedWorkout, setSavedWorkout] = useState(null);
  const [nextGenerationTime, setNextGenerationTime] = useState(null);
  const [lastWorkoutGeneration, setLastWorkoutGeneration] = useState(null);
  const [canGenerateWorkout, setCanGenerateWorkout] = useState(true);
  const navigate = useNavigate();
  const [fetchWorkoutCountError, setFetchWorkoutCountError] = useState(null);
  const { user, setUnlockedAchievement } = useUserStore();
  const hasCheckedLift = useRef(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(() => {
    const stored = localStorage.getItem("autoFillEnabled");
    return stored === "true";
  });
  const didInitialAutoFill = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Health conditions options 
  const healthConditionsOptions = [
    { value: "none", label: "No known conditions" },
    { value: "back-pain", label: "Back Pain" },
    { value: "knee-pain", label: "Knee Pain" },
    { value: "shoulder-pain", label: "Shoulder Pain" },
    { value: "arthritis", label: "Arthritis" },
    { value: "osteoporosis", label: "Osteoporosis" },
    { value: "hypertension", label: "Hypertension" },
    { value: "heart-disease", label: "Heart Disease" },
    { value: "diabetes", label: "Diabetes" },
    { value: "obesity", label: "Obesity" },
    { value: "asthma", label: "Asthma" },
    { value: "pregnancy", label: "Pregnancy" },
    { value: "limited-mobility", label: "Limited Mobility" }
  ];

  // Form state for user parameters 
  const [userParams, setUserParams] = useState({
    heightFeet: "",
    heightInches: "", 
    weight: "",
    age: "",
    gender: "not-specified",
    fitnessGoal: "",
    experienceLevel: "beginner",
    equipment: "minimal",
    timeFrame: "30-minutes",
    healthConditions: [], 
    frequency: "3-4"
  });

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); 
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom theme for tooltips 
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

  // Info tooltip component
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
            color: COLORS.LIGHT_GRAY, 
          }
        }}
      />
    </Tooltip>
  );

  // Toggle a selected optioN
  const toggleSelection = (value, field) => {
    setUserParams(prev => {
      if (value === "none") {
        return {
          ...prev,
          [field]: prev[field].includes("none") ? [] : ["none"]
        };
      }

      let updatedArray = prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field].filter(item => item !== "none"), value];

      return {
        ...prev,
        [field]: updatedArray
      };
    });
  };

  const SelectionTag = ({ label, selected, onClick, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all mr-2 mb-2 ${
        selected 
          ? 'bg-neon-green text-black' 
          : 'bg-black text-white border border-medium-gray hover:border-light-gray'
      }`}
      style={
        selected 
          ? { backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK } 
          : { 
              backgroundColor: COLORS.BLACK, 
              color: COLORS.WHITE,
              borderColor: COLORS.MEDIUM_GRAY,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1
            }
      }
    >
      {label}
    </button>
  );

  // Parse height from different formats into feet and inches components
  const parseHeight = (heightValue) => {
    if (!heightValue) {
      return { feet: '', inches: '' };
    }
    
    if (!isNaN(heightValue) && typeof heightValue !== 'string') {
      const totalInches = parseInt(heightValue);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return { feet: feet.toString(), inches: inches.toString() };
    }
  
    if (typeof heightValue === 'string' && heightValue.includes("'")) {
      const match = heightValue.match(/(\d+)'(\d+)"/);
      if (match) {
        return {
          feet: match[1],
          inches: match[2]
        };
      }
    }
    
    if (typeof heightValue === 'string' && !isNaN(heightValue)) {
      const totalInches = parseInt(heightValue);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return { feet: feet.toString(), inches: inches.toString() };
    }
    
    return { feet: '', inches: '' };
  };

  // Calculate total height in inches from feet and inches components
  const calculateTotalInches = (feet, inches) => {
    if (!feet || !inches) return null;
    return (parseInt(feet) * 12) + parseInt(inches);
  };

  const fetchProfileData = async (silent = false) => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/profile", { withCredentials: true });
      const profile = res.data;

      // Parse height into feet and inches components
      const { feet, inches } = parseHeight(profile.height);

      // Convert health conditions 
      let healthConditions = profile.healthConditions || [];
      if (typeof healthConditions === 'string' && healthConditions !== '') {
        healthConditions = [healthConditions];
      } else if (typeof healthConditions === 'string') {
        healthConditions = [];
      }

      setUserParams(prev => ({
        ...prev,
        heightFeet: feet,
        heightInches: inches,
        weight: profile.weight || "",
        age: profile.age || "",
        gender: profile.gender || "not-specified",
        fitnessGoal: profile.fitnessGoal || "",
        experienceLevel: profile.experienceLevel || "beginner",
        healthConditions: healthConditions
      }));

      if (!silent) {
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
    } catch (error) {
      toast.error("Failed to autofill. Please try again.", {
        duration: 3000,
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    }
  };

  useEffect(() => {
    if (autoFillEnabled) {
      fetchProfileData(!didInitialAutoFill.current);
      didInitialAutoFill.current = true;
    }
  }, [autoFillEnabled]);

  useEffect(() => {
    const checkHighestLift = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/workouts", { withCredentials: true });
        const allWorkouts = response.data || [];

        let maxLift = 0;
        allWorkouts.forEach(workout => {
          workout.exercises.forEach(ex => {
            if (ex.weight && ex.weight > maxLift) {
              maxLift = ex.weight;
            }
          });
        });

        await axios.post("http://localhost:5000/api/auth/max-lift", { maxLift }, { withCredentials: true });

        if (user?.maxLift !== undefined && maxLift > user.maxLift) {
          setUnlockedAchievement({
            title: `New Max Lift: ${maxLift} lbs`,
            description: `You've hit a new personal record!`,
          });
        }
      } catch (err) {
      }
    };

    if (user && !hasCheckedLift.current) {
      hasCheckedLift.current = true;
      checkHighestLift();
    }
  }, [user, setUnlockedAchievement]);

  // Fetch workout count
  useEffect(() => {
    const fetchWorkoutCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setWorkoutAmount(response.data.workoutCount || 0);
        setFetchWorkoutCountError(null);
      } catch (error) {
        setFetchWorkoutCountError(error);
      }
    };

    fetchWorkoutCount();
  }, []);

  // Fetch last workout generation time
  useEffect(() => {
    const fetchLastWorkoutGeneration = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker", { withCredentials: true });
        const tracker = response.data.find(t => t.type === "workout");
        if (tracker && tracker.lastWorkoutGenerationDate) {
          setLastWorkoutGeneration(tracker.lastWorkoutGenerationDate);
        }
      } catch (error) {
      }
    };

    fetchLastWorkoutGeneration();
  }, []);

  // Calculate next generation time
  const calculateNextGenerationTime = () => {
    if (!lastWorkoutGeneration) return null;
    
    const now = new Date();
    const lastGen = new Date(lastWorkoutGeneration);
    
    const isToday = lastGen.toDateString() === now.toDateString();
    
    if (isToday) {
      const nextGen = new Date(lastGen);
      nextGen.setHours(nextGen.getHours() + 24);
      return nextGen;
    } else {
      return now;
    }
  };

  // Format time remaining
  const formatTimeRemaining = (nextTime) => {
    if (!nextTime) return "No previous workout generation";
    
    const now = new Date();
    const diff = nextTime - now;
    
    if (diff <= 0) return "Available now!";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  };

  // Update timer
  useEffect(() => {
    const updateTimer = () => {
      const nextTime = calculateNextGenerationTime();
      setNextGenerationTime(nextTime);
      
      if (nextTime) {
        const now = new Date();
        setCanGenerateWorkout(now >= nextTime);
      } else {
        setCanGenerateWorkout(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastWorkoutGeneration]);

  // Generate workout plan
  const generateWorkoutPlan = async () => {
    if (!canGenerateWorkout) {
      toast.error("You can only generate one workout per day. Please try again tomorrow.", {
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
      const response = await axios.post(
        "http://localhost:5000/api/workouts/generate",
        userParams,
        { withCredentials: true }
      );

      if (response.data.workoutPlan) {
        setWorkoutData(response.data.workoutPlan);
        setSavedWorkout(response.data.savedWorkout);
        setLastWorkoutGeneration(new Date());
        setNextGenerationTime(calculateNextGenerationTime());
        setCanGenerateWorkout(false);

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
      }
    } catch (error) {
      toast.error("Failed to generate workout. Please try again.", {
        duration: 4000,
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="p-4 sm:p-6 text-base sm:text-lg font-medium" style={{ color: COLORS.WHITE }}>
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating your personalized workout plan...
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={tooltipTheme}>
      <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <header className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-center"
            style={{ color: COLORS.NEON_GREEN }}>
            Workout Generator
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#B0B0B0] text-center">
            Get AI-powered custom workout plans tailored to your needs.
          </p>
        </header>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-1 lg:grid-cols-2">
            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                 style={{ 
                   backgroundColor: COLORS.DARK_GRAY, 
                   borderColor: COLORS.MEDIUM_GRAY,
                 }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Your Parameters
                <InfoTooltip title="Fill out the questions to get a personalized workout plan based on your specific goals and information." />
              </h2>

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
                canGenerateWorkout={canGenerateWorkout}
              />
            </div>

            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                 style={{ 
                   backgroundColor: COLORS.DARK_GRAY, 
                   borderColor: COLORS.MEDIUM_GRAY,
                 }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Workout Tracker
              </h2>

              <p className="mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>
                Track your completed workouts to monitor your progress
              </p>

              <div className="p-3 sm:p-4 border rounded-lg mb-3 sm:mb-4" 
                   style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                <h3 className="font-medium text-sm sm:text-base" style={{ color: COLORS.WHITE }}>
                  Completed Workouts
                  <InfoTooltip title="Total number of workouts you've completed." />
                </h3>
                <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  {workoutAmount !== null ? workoutAmount : 'N/A'}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                  Complete your daily workout to increase your count. Visit your workout plan and follow the exercises to mark it as complete.
                </p>
              </div>

              <WorkoutStreak onWorkoutLogged={() => setWorkoutAmount(prev => prev + 1)} />

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
              
              {fetchWorkoutCountError && (
                <p className="mt-2 text-xs sm:text-sm text-red-500">
                  Failed to load workout count
                  <InfoTooltip title="Network error loading your workout count. Try refreshing the page." />
                </p>
              )}
            </div>
          </div>

          {showSavedWorkouts && (
            <div className="mt-6 sm:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                 style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Your Workout Library
                <InfoTooltip title="Your personal collection of saved workout plans" />
              </h2>

              <SavedWorkoutsList />
            </div>
          )}
          
          {workoutData && <div id="workout-result" className="pt-4"></div>}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default WorkoutPage;
