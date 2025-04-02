import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/NavBar';

const WorkoutPage = () => {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { workoutId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/workouts/${workoutId}`);
        setWorkout(response.data);
      } catch (err) {
        console.error('Error fetching workout:', err);
        setError('Failed to load workout. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (workoutId) {
      fetchWorkout();
    } else {
      setLoading(false);
      setError('No workout ID provided');
    }
  }, [workoutId]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await axios.delete(`/api/workouts/${workoutId}`);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting workout:', err);
        setError('Failed to delete workout. Please try again later.');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Workout Not Found</h2>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  // Format date
  const formattedDate = new Date(workout.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        {/* Workout Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{workout.workoutTitle}</h1>
              <p className="text-gray-600 mt-1">Type: {workout.workoutType}</p>
              <p className="text-gray-600">Created: {formattedDate}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {workout.userParameters.experienceLevel.charAt(0).toUpperCase() + workout.userParameters.experienceLevel.slice(1)}
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {workout.userParameters.equipment.charAt(0).toUpperCase() + workout.userParameters.equipment.slice(1).replace('-', ' ')}
                </div>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {workout.userParameters.timeFrame.replace('-', ' ').charAt(0).toUpperCase() + workout.userParameters.timeFrame.replace('-', ' ').slice(1)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-700">Stats</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Estimated Calories:</span>
                  <span className="font-semibold">{workout.estimatedCaloriesBurned} cal</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended Frequency:</span>
                  <span className="font-semibold">{workout.recommendedFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Exercises:</span>
                  <span className="font-semibold">{workout.exercises.length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-700">User Parameters</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span className="font-semibold">{workout.userParameters.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-semibold">{workout.userParameters.weight} lbs</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal:</span>
                  <span className="font-semibold">{workout.userParameters.fitnessGoal.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Exercise List */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Exercises</h2>
        <div className="space-y-6">
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{index + 1}. {exercise.title}</h3>
                <p className="text-gray-600 mt-1">{exercise.briefDescription}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {exercise.muscleGroups.map((muscle, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                      {muscle}
                    </span>
                  ))}
                </div>
                
                <div className="mt-6">
                  <p className="text-gray-700">{exercise.detailedDescription}</p>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-semibold text-gray-700">Sets</h4>
                    <p className="text-gray-800 text-lg">{exercise.sets}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-semibold text-gray-700">Reps</h4>
                    <p className="text-gray-800 text-lg">{exercise.reps}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-semibold text-gray-700">Calories/Set</h4>
                    <p className="text-gray-800 text-lg">{exercise.estimatedCaloriesBurned} cal</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <a 
                    href={exercise.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Watch Tutorial
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPage;