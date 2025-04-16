import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WorkoutQuestionnaire from "../components/WorkoutQuestionnaire";
import SavedWorkoutsList from "../components/SavedWorkoutsList";
import { COLORS } from '../lib/constants';

const WorkoutPage = () => {
  const [workoutAmount, setWorkoutAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [workoutData, setWorkoutData] = useState(null);
  const [savedWorkout, setSavedWorkout] = useState(null);
  const [showSavedWorkouts, setShowSavedWorkouts] = useState(false);
  const [fetchWorkoutCountError, setFetchWorkoutCountError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  
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
            color: COLORS.LIGHT_GRAY,
          }
        }} 
      />
    </Tooltip>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchWorkoutCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setWorkoutAmount(response.data.workoutCount || 0);
        setFetchWorkoutCountError(null);
      } catch (error) {
        console.error("Error fetching workout count:", error);
        setFetchWorkoutCountError(error);
      }
    };

    fetchWorkoutCount();
  }, []);

  const generateWorkoutPlan = async () => {
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

    try {
      const response = await axios.post(
        "http://localhost:5000/api/workouts/generate",
        userParams,
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        setWorkoutData(response.data.workoutPlan);
        setSavedWorkout(response.data.savedWorkout);
        toast.dismiss();

        toast.success("Workout generated and saved successfully!", {
          duration: 2000,
          icon: '💪',
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`
          }
        });

        setWorkoutAmount(prevWorkoutAmount => prevWorkoutAmount + 1);

        if (response.data.savedWorkout && response.data.savedWorkout._id) {
          navigate(`/workouts/${response.data.savedWorkout._id}`);
        } else {
          setTimeout(() => {
            document.getElementById('workout-result')?.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      } else {
        toast.dismiss();
        console.error("Error generating workout:", response);
        toast.error(`Failed to generate workout. Server responded with status ${response.status}. Please try again later.`);
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error generating workout:", error);
      toast.error("Failed to generate workout. Please check your network connection and try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async () => {
    const loadingToast = toast.loading("Logging workout...", {
      style: {
        background: COLORS.DARK_GRAY,
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.MEDIUM_GRAY}`
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/tracker",
        { type: "workout" },
        { withCredentials: true }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.dismiss(loadingToast);
        console.log("API Response:", response.data);
        setWorkoutAmount(prevWorkoutAmount => prevWorkoutAmount + 1);

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
        <div className="p-4 sm:p-8 text-base sm:text-lg font-medium" style={{ color: COLORS.WHITE }}>
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
      <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <header className="mb-4 sm:mb-6 md:mb-10">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-center"
            style={{ color: COLORS.NEON_GREEN }}
          >
            Workout Generator
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#B0B0B0] text-center">
            Get AI-powered custom workout plans. Please fill out the questionnaire below to get started.
          </p>
        </header>

        <div className="max-w-5xl mx-auto">
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
            <div 
              className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
              style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                <span>Your Parameters</span>
                <InfoTooltip title="Fill out the questions to get a personalized workout plan based on your specific goals and information." />
              </h2>

              <WorkoutQuestionnaire
                userParams={userParams}
                setUserParams={setUserParams}
                onSubmit={generateWorkoutPlan}
                loading={loading}
              />
            </div>

            <div 
              className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
              style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4" style={{ color: COLORS.WHITE }}>
                Workout Tracker
              </h2>

              <p className="text-sm sm:text-base mb-3 sm:mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
                Track your completed workouts to monitor your progress
              </p>

              <div 
                className="p-3 sm:p-4 border rounded-lg mb-3 sm:mb-4" 
                style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}
              >
                <h3 className="text-sm sm:text-base font-medium flex items-center" style={{ color: COLORS.WHITE }}>
                  <span>Completed Workouts</span>
                  <InfoTooltip title="This shows the total number of workouts you've logged as completed" />
                </h3>
                <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  {workoutAmount !== null ? workoutAmount : 'N/A'}
                </p>
              </div>

              <div className="flex flex-col space-y-2 sm:space-y-3">
                <button
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium flex items-center justify-center hover:opacity-90 active:opacity-80 text-sm sm:text-base"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                  onClick={addWorkout}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span>Log Completed Workout</span>
                  <InfoTooltip title="Click here to record that you've completed a workout session" />
                </button>

                <button
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium flex items-center justify-center text-sm sm:text-base"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                  onClick={() => setShowSavedWorkouts(!showSavedWorkouts)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span>{showSavedWorkouts ? 'Hide Saved Workouts' : 'View Saved Workouts'}</span>
                  <InfoTooltip title="Toggle the display of your saved workout plans" />
                </button>
              </div>

              {fetchWorkoutCountError && (
                <p className="mt-2 text-xs sm:text-sm text-red-500 flex items-center">
                  <span>Failed to load workout count</span>
                  <InfoTooltip title="There was a network error loading your workout count. Try refreshing the page or check your connection." />
                </p>
              )}
            </div>
          </div>

          {showSavedWorkouts && (
            <div 
              className="mt-4 sm:mt-6 md:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
              style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                <span>Your Workout Library</span>
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
