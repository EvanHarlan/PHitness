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

const WorkoutPage = () => {
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
  const [autoFillEnabled, setAutoFillEnabled] = useState(() => {
    const stored = localStorage.getItem("autoFillEnabled");
    return stored === "true"; // returns true or false
  });
  const didInitialAutoFill = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Health conditions options for the tag-based selection
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

  // Form state for user parameters (updated to use array for healthConditions)
  const [userParams, setUserParams] = useState({
    heightFeet: "", // separate feet field
    heightInches: "", // separate inches field
    weight: "",
    age: "",
    gender: "not-specified",
    fitnessGoal: "",
    experienceLevel: "beginner",
    equipment: "minimal",
    timeFrame: "30-minutes",
    healthConditions: [], // Changed to array for multiple selections
    frequency: "3-4"
  });

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

  // Toggle a selected option (for tag-based selection)
  const toggleSelection = (value, field) => {
    setUserParams(prev => {
      // Handle "none" option specially - if selecting "none", clear other selections
      if (value === "none") {
        return {
          ...prev,
          [field]: prev[field].includes("none") ? [] : ["none"]
        };
      }

      // If a value other than "none" is selected, remove "none" from the array if present
      let updatedArray = prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field].filter(item => item !== "none"), value];

      return {
        ...prev,
        [field]: updatedArray
      };
    });
  };

  // Custom Tag component for multi-select
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
    // If empty, return default empty values
    if (!heightValue) {
      return { feet: '', inches: '' };
    }
    
    // If height is a number (total inches), convert to feet and inches
    if (!isNaN(heightValue) && typeof heightValue !== 'string') {
      const totalInches = parseInt(heightValue);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return { feet: feet.toString(), inches: inches.toString() };
    }
    
    // If height is in "5'10"" format, extract feet and inches
    if (typeof heightValue === 'string' && heightValue.includes("'")) {
      const match = heightValue.match(/(\d+)'(\d+)"/);
      if (match) {
        return {
          feet: match[1],
          inches: match[2]
        };
      }
    }
    
    // If height is a string of just numbers (total inches), convert
    if (typeof heightValue === 'string' && !isNaN(heightValue)) {
      const totalInches = parseInt(heightValue);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return { feet: feet.toString(), inches: inches.toString() };
    }
    
    // Return default empty values if we couldn't parse
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

      // Convert health conditions to array if needed
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
      console.error("Error autofilling from profile:", error);
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
        console.error("Error checking max lift:", err);
      }
    };

    if (user && !hasCheckedLift.current) {
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
    if (!userParams.heightFeet || !userParams.heightInches || !userParams.weight || !userParams.fitnessGoal) {
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
      // Calculate total height in inches for the API
      const heightInInches = calculateTotalInches(userParams.heightFeet, userParams.heightInches);
      
      // Prepare payload with heightInInches and healthConditions array
      const payload = {
        ...userParams,
        height: heightInInches, // Convert feet/inches to total inches
        healthConditions: userParams.healthConditions.length > 0 ? userParams.healthConditions : []
      };

      // Remove the separate height fields that the API doesn't need
      delete payload.heightFeet;
      delete payload.heightInches;

      const response = await axios.post(
        "http://localhost:5000/api/workouts/generate",
        payload,
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
    // Wrap the entire display within the themeprovider to have access to the theme for the tooltip styling
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
            {/* Workout Parameters Form */}
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
                   onChange={(e) =>
                   {
                       const checked = e.target.checked;
                       setAutoFillEnabled(checked);
                       localStorage.setItem("autoFillEnabled", checked.toString());
                   }}
                   className="toggle-checkbox w-6 h-6 rounded"
                />
              </div>

              {/* Start of form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                generateWorkoutPlan();
              }} className="space-y-4">
                {/* Insert the main form from WorkoutQuestionnaire here */}
                <div className="space-y-4">
                  {/* Height with Feet and Inches dropdowns */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                      Height <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select
                          id="heightFeet"
                          name="heightFeet"
                          value={userParams.heightFeet}
                          onChange={(e) => setUserParams({...userParams, heightFeet: e.target.value})}
                          className="w-full p-2 border rounded-md text-sm"
                          style={{ 
                            backgroundColor: COLORS.BLACK, 
                            borderColor: COLORS.MEDIUM_GRAY,
                            color: COLORS.WHITE
                          }}
                          required
                        >
                          <option value="">Feet</option>
                          {Array.from({ length: 6 }, (_, i) => i + 3).map(feet => (
                            <option key={feet} value={feet}>{feet} ft</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          id="heightInches"
                          name="heightInches"
                          value={userParams.heightInches}
                          onChange={(e) => setUserParams({...userParams, heightInches: e.target.value})}
                          className="w-full p-2 border rounded-md text-sm"
                          style={{ 
                            backgroundColor: COLORS.BLACK, 
                            borderColor: COLORS.MEDIUM_GRAY,
                            color: COLORS.WHITE
                          }}
                          required
                          disabled={!userParams.heightFeet}
                        >
                          <option value="">Inches</option>
                          {Array.from({ length: 12 }, (_, i) => i).map(inches => (
                            <option key={inches} value={inches}>{inches} in</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                      Weight (lbs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      min="50"
                      max="500"
                      value={userParams.weight}
                      onChange={(e) => setUserParams({...userParams, weight: e.target.value})}
                      className="w-full p-2 border rounded-md text-sm"
                      style={{ 
                        backgroundColor: COLORS.BLACK, 
                        borderColor: COLORS.MEDIUM_GRAY,
                        color: COLORS.WHITE
                      }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        min="13"
                        max="100"
                        value={userParams.age}
                        onChange={(e) => setUserParams({...userParams, age: e.target.value})}
                        className="w-full p-2 border rounded-md text-sm"
                        style={{ 
                          backgroundColor: COLORS.BLACK, 
                          borderColor: COLORS.MEDIUM_GRAY,
                          color: COLORS.WHITE
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={userParams.gender}
                        onChange={(e) => setUserParams({...userParams, gender: e.target.value})}
                        className="w-full p-2 border rounded-md text-sm"
                        style={{ 
                          backgroundColor: COLORS.BLACK, 
                          borderColor: COLORS.MEDIUM_GRAY,
                          color: COLORS.WHITE
                        }}
                      >
                        <option value="not-specified">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fitnessGoal" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                      Fitness Goal <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="fitnessGoal"
                      name="fitnessGoal"
                      value={userParams.fitnessGoal}
                      onChange={(e) => setUserParams({...userParams, fitnessGoal: e.target.value})}
                      className="w-full p-2 border rounded-md text-sm"
                      style={{ 
                        backgroundColor: COLORS.BLACK, 
                        borderColor: COLORS.MEDIUM_GRAY,
                        color: COLORS.WHITE
                      }}
                      required
                    >
                      <option value="">Select a fitness goal</option>
                      <option value="weight-loss">Weight Loss</option>
                      <option value="muscle-gain">Muscle Gain</option>
                      <option value="strength">Strength</option>
                      <option value="endurance">Endurance</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="general-fitness">General Fitness</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                      Experience Level
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={userParams.experienceLevel}
                      onChange={(e) => setUserParams({...userParams, experienceLevel: e.target.value})}
                      className="w-full p-2 border rounded-md text-sm"
                      style={{ 
                        backgroundColor: COLORS.BLACK, 
                        borderColor: COLORS.MEDIUM_GRAY,
                        color: COLORS.WHITE
                      }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="equipment" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                      Available Equipment
                    </label>
                    <select
                      id="equipment"
                      name="equipment"
                      value={userParams.equipment}
                      onChange={(e) => setUserParams({...userParams, equipment: e.target.value})}
                      className="w-full p-2 border rounded-md text-sm"
                      style={{ 
                        backgroundColor: COLORS.BLACK, 
                        borderColor: COLORS.MEDIUM_GRAY,
                        color: COLORS.WHITE
                      }}
                    >
                      <option value="none">No Equipment (Bodyweight only)</option>
                      <option value="minimal">Minimal (Resistance bands, dumbbells)</option>
                      <option value="home-gym">Home Gym (More equipment)</option>
                      <option value="full-gym">Full Gym Access</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeFrame" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                      Workout Duration
                    </label>
                    <select
                      id="timeFrame"
                      name="timeFrame"
                      value={userParams.timeFrame}
                      onChange={(e) => setUserParams({...userParams, timeFrame: e.target.value})}
                      className="w-full p-2 border rounded-md text-sm"
                      style={{ 
                        backgroundColor: COLORS.BLACK, 
                        borderColor: COLORS.MEDIUM_GRAY,
                        color: COLORS.WHITE
                      }}
                    >
                      <option value="15-minutes">15 minutes</option>
                      <option value="30-minutes">30 minutes</option>
                      <option value="45-minutes">45 minutes</option>
                      <option value="60-minutes">60 minutes</option>
                      <option value="90-minutes">90 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium mb-1" style={{ color: COLORS.WHITE }}>
                      Days Per Week
                    </label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={userParams.frequency}
                      onChange={(e) => setUserParams({...userParams, frequency: e.target.value})}
                      className="w-full p-2 border rounded-md text-sm"
                      style={{ 
                        backgroundColor: COLORS.BLACK, 
                        borderColor: COLORS.MEDIUM_GRAY,
                        color: COLORS.WHITE
                      }}
                    >
                      <option value="1-2">1-2 days per week</option>
                      <option value="3-4">3-4 days per week</option>
                      <option value="5-6">5-6 days per week</option>
                      <option value="everyday">Every day</option>
                    </select>
                  </div>

                  {/* Health Conditions Tag Selection */}
                  <div className="mb-6 pt-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.WHITE }}>
                      Health Conditions
                      <InfoTooltip title="Select any health conditions that may affect your workout routine" />
                    </label>
                    <div className="flex flex-wrap">
                      {healthConditionsOptions.map(option => (
                        <SelectionTag
                          key={option.value}
                          label={option.label}
                          selected={userParams.healthConditions.includes(option.value)}
                          onClick={() => toggleSelection(option.value, 'healthConditions')}
                          disabled={option.value !== "none" && userParams.healthConditions.includes("none")}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-medium text-base sm:text-lg transition ${
                        loading ? 'opacity-70' : 'hover:opacity-90 active:opacity-80'
                      }`}
                      style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                    >
                      Generate Optimal Workout Plan
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Workout Tracker */}
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

          {/* Display saved workouts */}
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
          
          {/* Add an element for workout results to scroll to */}
          {workoutData && <div id="workout-result" className="pt-4"></div>}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default WorkoutPage;
