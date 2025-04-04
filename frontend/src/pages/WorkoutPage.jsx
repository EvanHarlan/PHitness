import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import WorkoutQuestionnaire from "../components/WorkoutQuestionnaire";
import COLORS from '../lib/constants';

const WorkoutPage = () => {
  // State variables for workout count
  const [workoutAmount, setWorkoutAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  
  // Form state for user parameters
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

  useEffect(() => {
    const fetchWorkoutCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setWorkoutAmount(response.data.workoutCount || 0);
      } catch (error) {
        console.error("Error fetching workout count:", error);
        toast.error("Couldn't load workout history. Please try again later.");
      }
    };

    fetchWorkoutCount();
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
    
    try {
      const response = await axios.post('http://localhost:5000/question', { 
        ...userParams
      });
      
      setAnswer(response.data.answer);
      
      // Dismiss all toasts
      toast.dismiss();
      
      // Show success toast
      toast.success("Workout plan generated successfully!", {
        duration: 3000,
        style: { 
          background: COLORS.DARK_GRAY, 
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        },
        iconTheme: {
          primary: COLORS.NEON_GREEN,
          secondary: COLORS.BLACK
        }
      });
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('workout-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error(error);
      
      // Dismiss all toasts
      toast.dismiss();
      
      toast.error("Failed to generate workout plan. Please try again.", {
        duration: 4000,
        style: { 
          background: COLORS.DARK_GRAY, 
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
      
      setAnswer("An error has occurred. Please try again.");
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

      toast.dismiss(loadingToast);
      
      console.log("Api Response:", response.data);
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
      
      console.log("Added 1 to workoutAmount");
    } catch (error) {
      toast.dismiss(loadingToast);
      
      console.error(error);
      toast.error("Failed to log workout. Please try again later.", {
        duration: 3000,
        style: { 
          background: COLORS.DARK_GRAY, 
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`
        }
      });
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.BLACK }}>
      <div className="max-w-5xl mx-auto">        
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {/* Workout Parameters Form */}
          <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>Your Parameters</h2>
            
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
              {workoutAmount > 0 && (
                <span 
                  className="ml-2 px-2 py-1 text-sm rounded-full"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.NEON_GREEN }}
                >
                  {workoutAmount}
                </span>
              )}
            </h2>
            
            <p className="mb-4" style={{ color: COLORS.LIGHT_GRAY }}>
              Track your completed workouts to monitor your progress
            </p>
            
            <div className="p-4 border rounded-lg mb-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
              <h3 className="font-medium" style={{ color: COLORS.WHITE }}>Completed Workouts</h3>
              <p className="text-2xl font-bold mb-3" style={{ color: COLORS.NEON_GREEN }}>{workoutAmount}</p>
            </div>
            
            <button
              className="px-4 py-2 rounded-lg transition font-medium flex items-center hover:opacity-90"
              style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
              onClick={addWorkout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Log Completed Workout
            </button>
          </div>
        </div>
        
        {/* Workout Results */}
        {answer && (
          <div id="workout-result" className="mt-8 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.WHITE }}>Your Personalized Workout Plan</h2>
            
            <div 
              className="p-4 border rounded-lg whitespace-pre-line" 
              style={{ 
                borderColor: COLORS.MEDIUM_GRAY, 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: COLORS.WHITE 
              }}
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPage;