import { COLORS } from '../lib/constants';
import axios from "axios";
import { useState, useEffect } from "react";
import React from "react";

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
    timeFrame: "30-minutes"
  });

  useEffect(() => {
    const fetchWorkoutCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
        setWorkoutAmount(response.data.workoutCount || 0);
      } catch (error) {
        console.error("Error fetching workout count:", error);
      }
    };

    fetchWorkoutCount();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateWorkoutPlan = async () => {
    // Validate required fields
    if (!userParams.height || !userParams.weight || !userParams.fitnessGoal) {
      alert("Please fill in the required fields: Height, Weight, and Fitness Goal");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/question', { 
        ...userParams
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);
      setAnswer("An error has occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/tracker",
        { type: "workout" },
        { withCredentials: true }
      );

      console.log("Api Response:", response.data)
      setWorkoutAmount(prevWorkoutAmount => prevWorkoutAmount + 1);
      console.log("Added 1 to workoutAmount")
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div 
      className="min-h-screen p-6 md:p-8"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE 
      }}
    >
      <div className="container mx-auto">
        <h1 
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: COLORS.NEON_GREEN }}
        >
          Personalized Workout Plan
        </h1>
        <p className="text-lg text-[#B0B0B0] mb-6">
          Get a custom tailored workout plan based on your specific goals and body type.
        </p>
      </div>

      <div className="mb-6 p-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.NEON_GREEN }}>
          Tell us about yourself
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Stats */}
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Height *
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-black"
              name="height"
              value={userParams.height}
              onChange={handleInputChange}
              required
            >
              <option value="">Select your height</option>
              <option value="5'0&quot;">5'0"</option>
              <option value="5'1&quot;">5'1"</option>
              <option value="5'2&quot;">5'2"</option>
              <option value="5'3&quot;">5'3"</option>
              <option value="5'4&quot;">5'4"</option>
              <option value="5'5&quot;">5'5"</option>
              <option value="5'6&quot;">5'6"</option>
              <option value="5'7&quot;">5'7"</option>
              <option value="5'8&quot;">5'8"</option>
              <option value="5'9&quot;">5'9"</option>
              <option value="5'10&quot;">5'10"</option>
              <option value="5'11&quot;">5'11"</option>
              <option value="6'0&quot;">6'0"</option>
              <option value="6'1&quot;">6'1"</option>
              <option value="6'2&quot;">6'2"</option>
              <option value="6'3&quot;">6'3"</option>
              <option value="6'4&quot;">6'4"</option>
              <option value="6'5&quot;">6'5"</option>
              <option value="6'6&quot;">6'6"</option>
              <option value="6'7&quot;">6'7"</option>
              <option value="6'8&quot;">6'8"</option>
              <option value="6'9&quot;">6'9"</option>
              <option value="6'10&quot;">6'10"</option>
              <option value="6'11&quot;">6'11"</option>
              <option value="7'0&quot;">7'0"</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Weight (lbs) *
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
              type="number"
              name="weight"
              value={userParams.weight}
              onChange={handleInputChange}
              placeholder="e.g., 160"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Age
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
              type="number"
              name="age"
              value={userParams.age}
              onChange={handleInputChange}
              placeholder="e.g., 25"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Gender
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-black"
              name="gender"
              value={userParams.gender}
              onChange={handleInputChange}
            >
              <option value="not-specified">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Fitness Parameters */}
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Fitness Goal *
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-black"
              name="fitnessGoal"
              value={userParams.fitnessGoal}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a goal</option>
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
              <option value="overall-fitness">Overall Fitness</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Experience Level
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-black"
              name="experienceLevel"
              value={userParams.experienceLevel}
              onChange={handleInputChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Available Equipment
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-black"
              name="equipment"
              value={userParams.equipment}
              onChange={handleInputChange}
            >
              <option value="minimal">Minimal/Home Equipment</option>
              <option value="gym">Full Gym Access</option>
              <option value="bodyweight">Bodyweight Only</option>
              <option value="resistance-bands">Resistance Bands</option>
              <option value="dumbbells">Dumbbells Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Workout Time Frame
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-black"
              name="timeFrame"
              value={userParams.timeFrame}
              onChange={handleInputChange}
            >
              <option value="15-minutes">15 Minutes</option>
              <option value="30-minutes">30 Minutes</option>
              <option value="1-hour">1 Hour</option>
              <option value="2-hours">2 Hours</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            className="px-4 py-2 rounded font-bold"
            style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
            onClick={generateWorkoutPlan}
            disabled={loading}
          >
            {loading ? "Creating Workout..." : "Get Workout"}
          </button>
        </div>
      </div>

      {loading && <div className="text-xl font-bold">Creating your workout...</div>}
      
      {answer && (
        <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <strong className="block text-xl mb-2" style={{ color: COLORS.NEON_GREEN }}>
            Your Workout:
          </strong>
          <p className="text-lg whitespace-pre-line" dangerouslySetInnerHTML={{ __html: answer }}></p>
        </div>
      )}

      <div className="mt-8 mb-7">
        <div className="p-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <p className="text-lg mb-2">Total workouts completed: <span className="font-bold">{workoutAmount}</span></p>
          <button
            className="mt-2 px-4 py-2 rounded font-bold"
            style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
            onClick={addWorkout}
          >
            Log Completed Workout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPage;